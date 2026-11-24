// Settings store
// -----------------------------------------
// Single source of truth for user settings, backed by chrome.storage.sync.
// Used by the background worker, popup and options page (ES modules).
// The content script cannot import modules, so it reads the same keys
// from chrome.storage directly — keep DEFAULT_SETTINGS in sync there.

// Add a setting by adding a key here; everything else picks it up.
export const DEFAULT_SETTINGS = Object.freeze({
  enabled: true,
  // The user's own constants, added in the popup: [{ symbol, value }]
  myConstants: [],
  // Constants pinned to the top of the popup, in pin order. Copies of the
  // pinned entries (built-in or the user's own):
  // [{ symbol, value, name?, latex?, builtin? }]. Built-in ones keep the full-length
  // value and are cut to `precision` when shown.
  pinned: [],
  // Decimal places kept when copying a built-in constant (0-30).
  // See shared/format.js.
  precision: 8,
  // How built-in constants are written: 'normal' (3.14159265) or
  // 'scientific' (3.14159265e0). See shared/format.js.
  notation: 'normal',
  // Number base built-in constants are written in, 2-36 (10 = decimal).
  // Chosen on the advanced settings page.
  base: 10,
  // Interface language: 'auto' (follow the browser) or a language code
  // from shared/i18n.js, e.g. 'en', 'vi'.
  language: 'auto',
  // Keyboard shortcut that opens the quick picker on web pages. Modifiers
  // (Ctrl, Alt, Shift, Meta, in that order) then a physical key code, joined
  // with "+", e.g. "Ctrl+Shift+KeyK". Empty string = no shortcut.
  // "default" = the built-in default for the current operating system
  // (Alt+C, or Control+C on a Mac). It is kept as a word rather than a key
  // combination because settings sync between a person's computers, which
  // may not all run the same system. Helpers: shared/shortcut.js.
  shortcut: 'default',
  // Whether the quick picker stays open after a constant is clicked. If so
  // it closes on the shortcut, Escape or a click outside it; if not, it
  // closes by itself a moment after copying.
  keepOpen: true,
  // Which built-in constants the popup shows, as differences from the
  // default selection (the `core` ones in shared/constants.js). Lists of
  // "<symbol>|<value>" keys, changed on the library page (library/).
  added: [], // non-core constants switched on
  hidden: [], // core constants switched off
});

const area = chrome.storage.sync;

/** Returns all settings, with defaults filled in for anything unset. */
export async function getSettings() {
  return area.get(DEFAULT_SETTINGS);
}

/** Saves a partial settings object, e.g. setSettings({ enabled: false }). */
export async function setSettings(patch) {
  await area.set(patch);
}

/**
 * Calls `callback(settings)` with the full, current settings whenever any
 * of them change (from any context). Returns an unsubscribe function.
 */
export function onSettingsChanged(callback) {
  const listener = (changes, areaName) => {
    if (areaName !== 'sync') return;
    if (!Object.keys(changes).some((key) => key in DEFAULT_SETTINGS)) return;
    getSettings().then(callback);
  };
  chrome.storage.onChanged.addListener(listener);
  return () => chrome.storage.onChanged.removeListener(listener);
}
