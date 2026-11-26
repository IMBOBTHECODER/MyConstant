// Background service worker (Manifest V3, ES module)
// -----------------------------------------
// Event-driven and short-lived: Chrome stops it when idle and restarts it on
// the next event. So:
//   - register every listener synchronously at the top level
//   - keep no state in variables; persist to chrome.storage instead
// No DOM access here.

import { MSG, handleMessages } from '../shared/messages.js';
import '../shared/constants.js'; // classic script: defines globalThis.MyConstantData
import '../shared/i18n.js'; // classic script: defines globalThis.MyConstantI18n

import { DEFAULT_SETTINGS, getSettings, setSettings, emptyExpiredBin } from '../shared/settings.js';
import { rememberLoadedFiles } from '../shared/fingerprint.js';

const { CATEGORIES } = globalThis.MyConstantData;

chrome.runtime.onInstalled.addListener(async ({ reason }) => {
  // Note which files this load is running, so the popup can tell when the
  // ones on disk have moved on (see shared/fingerprint.js).
  rememberLoadedFiles();

  if (reason === 'install') {
    // Write defaults explicitly so they show up in storage from day one —
    // but only for settings that have no stored value yet, so this can never
    // overwrite something saved in the meantime (e.g. by migratePinned).
    const stored = await chrome.storage.sync.get(null);
    const missing = Object.fromEntries(
      Object.entries(DEFAULT_SETTINGS).filter(([key]) => !(key in stored))
    );
    if (Object.keys(missing).length) await setSettings(missing);
  }
  // reason === 'update': migrate stored data here when its shape changes.

  // Tabs that were already open have no content script yet (after an
  // install) or a dead one (after an update or reload), so the shortcut
  // would not work in them until they were refreshed. Put a live one in.
  if (reason === 'install' || reason === 'update') injectIntoOpenTabs();
});

// The bin (removed constants, see shared/settings.js) is also cleared of
// expired entries each time the popup opens; this covers people who never
// open it.
chrome.runtime.onStartup.addListener(() => emptyExpiredBin().catch(() => {}));

// --- Content script injection -------------------------------------------------

/** Runs the content script (as listed in the manifest) in every frame of a tab. */
async function inject(tabId) {
  const [{ js, css }] = chrome.runtime.getManifest().content_scripts;
  const target = { tabId, allFrames: true };
  await chrome.scripting.insertCSS({ target, files: css }).catch(() => {});
  await chrome.scripting.executeScript({ target, files: js });
}

async function injectIntoOpenTabs() {
  for (const tab of await chrome.tabs.query({})) {
    // Only ordinary pages; browser pages and the like refuse, hence the catch.
    if (tab.id === undefined || tab.discarded || !/^(https?|file):/.test(tab.url ?? '')) continue;
    inject(tab.id).catch(() => {});
  }
}

// --- Right-click menu ---------------------------------------------------------
// A second way to open the quick picker, for pages where the keyboard
// shortcut is taken by the page or the browser.
const MENU_ID = 'open-picker';

/** Creates the menu entry, or renames it when the language has changed. */
async function setUpMenu() {
  const { language } = await getSettings();
  globalThis.MyConstantI18n.setLanguage(language);
  const title = globalThis.MyConstantI18n.t('MyConstant: open quick picker');
  chrome.contextMenus.create(
    { id: MENU_ID, title, contexts: ['page', 'frame', 'editable', 'selection', 'link', 'image'] },
    () => {
      // "Already exists" on every start but the first: just keep the title fresh.
      if (chrome.runtime.lastError) chrome.contextMenus.update(MENU_ID, { title });
    }
  );
}
setUpMenu();
chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === 'sync' && changes.language) setUpMenu();
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId !== MENU_ID || tab?.id === undefined) return;
  const message = { type: MSG.TOGGLE_PICKER, payload: { reopen: true } };
  const options = { frameId: info.frameId ?? 0 };
  try {
    await chrome.tabs.sendMessage(tab.id, message, options);
  } catch {
    // No live content script in this tab: put one in and try once more.
    await inject(tab.id).catch(() => {});
    await chrome.tabs.sendMessage(tab.id, message, options).catch(() => {});
  }
});

// Runs each time the worker starts; does nothing once pins are up to date.
migratePinned();

/**
 * Brings stored pins up to date with the built-in list. A pinned built-in
 * constant is a copy holding the full-length value, `builtin: true` (so the
 * precision setting applies) and its `latex` label. Older pins held only a
 * shortened value; this upgrades them, and refreshes name / latex if the
 * built-in list changed.
 */
async function migratePinned() {
  const { pinned, myConstants } = await getSettings();
  const builtins = CATEGORIES.flatMap((category) => category.constants);
  let changed = false;
  const next = pinned.map((pin) => {
    let match;
    if (pin.builtin) {
      match = builtins.find((b) => b.symbol === pin.symbol && b.value === pin.value);
    } else {
      // One of the user's own constants: leave it exactly as typed.
      if (myConstants.some((c) => c.symbol === pin.symbol && c.value === pin.value)) return pin;
      match = builtins.find((b) => b.symbol === pin.symbol && b.value.startsWith(pin.value));
    }
    if (!match) return pin;
    if (pin.builtin && pin.name === match.name && pin.latex === match.latex) return pin;
    changed = true;
    return { ...match, builtin: true };
  });
  if (changed) await setSettings({ pinned: next });
}

// Message routes. Add a type to MSG, then a handler here.
handleMessages({
  // A small frame asks for the picker in the main frame. Tell the main
  // frame which one asked, so it can send the chosen constant back there.
  [MSG.OPEN_IN_TOP]: async (_payload, sender) => {
    const message = { type: MSG.TOGGLE_PICKER, payload: { fromFrame: sender.frameId } };
    await chrome.tabs.sendMessage(sender.tab.id, message, { frameId: 0 });
    return true;
  },
  // ...and this is the constant coming back: pass it to the frame that asked.
  [MSG.INSERT_TEXT]: async ({ frameId, text }, sender) => {
    const message = { type: MSG.INSERT_TEXT, payload: { text } };
    const reply = await chrome.tabs.sendMessage(sender.tab.id, message, { frameId });
    return { inserted: Boolean(reply?.data?.inserted) };
  },
});
