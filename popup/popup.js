// Popup script (ES module)
// -----------------------------------------
// Runs each time the popup opens; everything is torn down on close, so
// persistent state lives in chrome.storage (see shared/settings.js).

import { matchesExactly, matchesLoosely } from './search.js';
import {
  MODIFIER_HINT,
  formatShortcut,
  isUsableShortcut,
  resolveShortcut,
  shortcutConflict,
  shortcutFromEvent,
} from '../shared/shortcut.js';
import { MSG, sendToBackground, sendToTab } from '../shared/messages.js';
import { getSettings, setSettings, onSettingsChanged } from '../shared/settings.js';
import { filesChangedSinceLoad } from '../shared/fingerprint.js';

/* global MyConstantI18n, MyConstantLatex, MyConstantFormat, MyConstantData,
   MyConstantUsage —
   defined by the classic scripts in shared/, loaded in popup.html */
const { clampPrecision, clampBase } = MyConstantFormat;

/** Translates English text into the chosen language (see shared/i18n.js). */
const t = (text, values) => MyConstantI18n.t(text, values);

const $ = (id) => document.getElementById(id);

// The built-in constants included in the popup (the rest are in the library,
// see library/), flagged so the precision setting applies to them. Filled
// in by render().
let BUILTIN = [];
// The ones left out, which the search can still point to.
let inLibrary = [];

let myConstants = [];
let pinned = [];
let precision = 8;
let notation = 'normal';
let base = 10;

// What is typed in the coefficient box (see MyConstantFormat.parseCoefficient),
// or null. With one set, every constant is copied multiplied by it.
let coefficient = null;

const shown = (constant) => MyConstantFormat.shown(constant, { precision, notation, base }, coefficient);

/** The text that is shown and copied for a constant. */
const shownValue = (constant) => shown(constant).text;

/** "2 × π" while a coefficient applies to the constant, else just "π". */
const withCoefficient = (constant, label) =>
  shown(constant).scaled ? `${coefficient.text} × ${label}` : label;

function render(settings) {
  // Language first, so everything drawn below comes out translated.
  const languageChanged = MyConstantI18n.setLanguage(settings.language);
  MyConstantI18n.apply();
  $('language').value = settings.language === 'auto' ? 'auto' : MyConstantI18n.language;
  if (languageChanged) {
    // Messages already on screen are in the old language: redo or clear them.
    $('copy-status').textContent = '';
    $('shortcut-hint').textContent = '';
    checkBackground();
  }

  $('enabled').checked = settings.enabled;
  $('keep-open').checked = settings.keepOpen !== false;
  myConstants = Array.isArray(settings.myConstants) ? settings.myConstants : [];
  pinned = Array.isArray(settings.pinned) ? settings.pinned : [];
  precision = clampPrecision(settings.precision);
  base = clampBase(settings.base);
  notation = settings.notation === 'scientific' ? 'scientific' : 'normal';
  BUILTIN = MyConstantData.included(settings).map((category) => ({
    ...category,
    constants: category.constants.map((c) => ({ ...c, builtin: true })),
  }));
  inLibrary = MyConstantData.CATEGORIES.flatMap((category) => category.constants).filter(
    (c) => !MyConstantData.isIncluded(c, settings)
  );
  $('notation').value = notation;
  if (document.activeElement !== $('precision')) $('precision').value = precision;
  shortcut = resolveShortcut(settings.shortcut);
  renderShortcut();
  renderSections();
}

// A constant is identified by its symbol and (full-length) value together.
const same = (a, b) => a.symbol === b.symbol && a.value === b.value;
const isPinned = (constant) => pinned.some((p) => same(p, constant));

function togglePin(constant) {
  const next = isPinned(constant)
    ? pinned.filter((p) => !same(p, constant))
    : [
        ...pinned,
        {
          symbol: constant.symbol,
          value: constant.value,
          name: constant.name,
          latex: constant.latex,
          builtin: constant.builtin,
        },
      ];
  return setSettings({ pinned: next });
}

function removeMyConstant(index) {
  toggleAddForm(false); // an edit in progress would point at the wrong one
  const constant = myConstants[index];
  return setSettings({
    myConstants: myConstants.filter((_, i) => i !== index),
    // Unpin it too, unless an identical constant still exists.
    pinned: myConstants.some((c, i) => i !== index && same(c, constant))
      ? pinned
      : pinned.filter((p) => !same(p, constant)),
  });
}

/** Small corner button showing an icon from assets/icons (see popup.css). */
function cornerButton(className, iconName, label, onClick) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = className;
  const icon = document.createElement('span');
  icon.className = `icon icon-${iconName}`;
  button.append(icon);
  button.title = label;
  button.setAttribute('aria-label', label);
  button.addEventListener('click', onClick);
  return button;
}

/**
 * Builds one constant: a copy button with a pin toggle in its top-left
 * corner. The user's own constants also get `onRemove` (top-right) and
 * `onEdit` (bottom-right) buttons.
 */
function makeChip(constant, onRemove, onEdit) {
  const chip = document.createElement('div');
  chip.className = 'chip';
  const label = constant.name || constant.symbol;
  const pinnedNow = isPinned(constant);
  const value = shownValue(constant);
  const scaledLabel = withCoefficient(constant, label);

  const copy = document.createElement('button');
  copy.type = 'button';
  copy.append(MyConstantLatex.label(constant));
  copy.title = `${scaledLabel}: ${value}`;
  copy.setAttribute('aria-label', t('Copy {name}, {value}', { name: scaledLabel, value }));
  copy.addEventListener('click', () => copyConstant(constant));
  chip.append(copy);

  const pin = cornerButton(
    'pin',
    'pin',
    t(pinnedNow ? 'Unpin {name}' : 'Pin {name}', { name: label }),
    () => togglePin(constant)
  );
  pin.classList.toggle('is-pinned', pinnedNow);
  pin.setAttribute('aria-pressed', String(pinnedNow));
  chip.append(pin);

  if (onRemove) {
    chip.append(cornerButton('remove', 'x', t('Remove {name}', { name: label }), onRemove));
  }
  if (onEdit) {
    chip.append(cornerButton('edit', 'pencil', t('Edit {name}', { name: label }), onEdit));
  }
  return chip;
}

let query = '';

// Set by renderSections: true when nothing matched the query as typed, so
// the forgiving, typo-tolerant pass is used instead (see search.js).
let loose = false;

const searchTexts = (constant) => [constant.symbol, constant.name, shownValue(constant)];

/** True if the constant matches the search box (symbol, name or value). */
function matchesQuery(constant) {
  if (!query.trim()) return true;
  return loose
    ? matchesLoosely(searchTexts(constant), query)
    : matchesExactly(searchTexts(constant), query);
}

function makeSection({ title, wide }, constants) {
  const section = document.createElement('section');
  const head = document.createElement('div');
  head.className = 'section-head';
  const heading = document.createElement('h2');
  heading.textContent = t(title);
  head.append(heading);
  const grid = document.createElement('div');
  grid.className = wide ? 'constants is-wide' : 'constants';
  grid.append(...constants.map((c) => makeChip(c)));
  section.append(head, grid);
  return section;
}

/**
 * Rebuilds the Pinned, My constants and built-in sections, showing only
 * what matches the search box. While searching, sections with no matches
 * are hidden altogether.
 */
function renderSections() {
  const searching = query.trim() !== '';

  // Spelling correction: only when the query as typed matches nothing.
  loose = false;
  if (searching) {
    const everything = [...pinned, ...myConstants, ...BUILTIN.flatMap((c) => c.constants)];
    loose = !everything.some(matchesQuery);
  }

  const pinnedShown = pinned.filter(matchesQuery);
  $('pinned-constants').replaceChildren(...pinnedShown.map((c) => makeChip(c)));
  $('pinned-empty').hidden = pinned.length > 0;
  $('section-pinned').hidden = searching && pinnedShown.length === 0;

  // Keep each constant's real position, which removing and editing rely on.
  const mineShown = myConstants.map((c, index) => ({ c, index })).filter(({ c }) => matchesQuery(c));
  $('my-constants').replaceChildren(
    ...mineShown.map(({ c, index }) => {
      const chip = makeChip(c, () => removeMyConstant(index), () => editMyConstant(index));
      chip.classList.toggle('is-editing', index === editingIndex);
      return chip;
    })
  );
  $('my-constants-empty').hidden = myConstants.length > 0;
  $('section-mine').hidden = searching && mineShown.length === 0;

  let builtinShown = 0;
  const sections = [];
  for (const category of BUILTIN) {
    const shown = category.constants.filter(matchesQuery);
    builtinShown += shown.length;
    if (shown.length) sections.push(makeSection(category, shown));
  }
  $('builtin-sections').replaceChildren(...sections);

  const found = pinnedShown.length + mineShown.length + builtinShown;
  $('no-matches').hidden = !searching || found > 0;
  $('close-matches').hidden = !(searching && loose && found > 0);

  // The way into the library. While searching, it says how many constants
  // there match, so a search never looks like the constant does not exist.
  const more = searching
    ? inLibrary.filter((c) => matchesExactly([c.symbol, c.name], query)).length
    : 0;
  $('open-library').textContent = `+ ${
    more ? t('{count} more in the library', { count: more }) : t('More constants…')
  }`;
  $('open-library').classList.toggle('is-highlighted', more > 0);
}

/** Opens the library page in a tab, carrying the current search along. */
function openLibrary() {
  const hash = query.trim() ? `#q=${encodeURIComponent(query.trim())}` : '';
  chrome.tabs.create({ url: chrome.runtime.getURL(`library/library.html${hash}`) });
}

// Position in myConstants of the constant being edited in the form, or
// null when the form is closed or adding a new one.
let editingIndex = null;

function toggleAddForm(show, index = null) {
  const wasEditing = editingIndex !== null;
  editingIndex = show ? index : null;
  $('add-form').hidden = !show;
  $('add-constant').hidden = show;
  if (show) $('add-symbol').focus();
  else $('add-form').reset();
  if (wasEditing || editingIndex !== null) renderSections(); // move the highlight
}

/** Opens the form filled in with one of the user's constants. */
function editMyConstant(index) {
  toggleAddForm(true, index);
  $('add-symbol').value = myConstants[index].symbol;
  $('add-value').value = myConstants[index].value;
  $('add-symbol').select();
}

/** Saves the form: changes the constant being edited, or adds a new one. */
async function addConstant(event) {
  event.preventDefault();
  const symbol = $('add-symbol').value.trim();
  const value = $('add-value').value.trim();
  if (!symbol || !value) return;
  const old = editingIndex === null ? null : myConstants[editingIndex];
  try {
    if (old) {
      await setSettings({
        myConstants: myConstants.map((c, i) => (i === editingIndex ? { ...c, symbol, value } : c)),
        // A pin is a copy, so change it too and it stays pinned — unless an
        // identical constant still exists, which the pin then belongs to.
        pinned: myConstants.some((c, i) => i !== editingIndex && same(c, old))
          ? pinned
          : pinned.map((p) => (!p.builtin && same(p, old) ? { ...p, symbol, value } : p)),
      });
    } else {
      await setSettings({ myConstants: [...myConstants, { symbol, value }] });
    }
    toggleAddForm(false);
  } catch (err) {
    // e.g. the browser's sync storage quota is full
    $('copy-status').textContent = t('Could not save: {error}', { error: err.message });
  }
}

/** Switches the popup between its 'main' and 'settings' views. */
function showView(name) {
  $('view-main').hidden = name !== 'main';
  $('view-settings').hidden = name !== 'settings';
}

// --- Quick picker shortcut ---------------------------------------------
let shortcut = '';
let recording = false;
// A shortcut that clashes with a well-known one, pressed once: pressing it
// a second time confirms it.
let unconfirmed = '';

function renderShortcut() {
  const button = $('shortcut');
  button.classList.toggle('is-recording', recording);
  button.textContent = recording
    ? t('Press keys…')
    : shortcut
      ? formatShortcut(shortcut)
      : t('Not set');
}

function setRecording(on, hint = '') {
  recording = on;
  unconfirmed = '';
  // Tell open pages to ignore the shortcut while a new one is being recorded
  // (see content/content-script.js). Stored as an expiry time, so it clears
  // itself if the popup is closed mid-recording.
  chrome.storage.local.set({ recordingUntil: on ? Date.now() + 60_000 : 0 });
  $('shortcut-hint').textContent = hint;
  renderShortcut();
}

/** While recording, the next valid key combination becomes the shortcut. */
async function onRecordKeydown(event) {
  if (!recording) return;
  event.preventDefault();
  event.stopPropagation();

  if (event.key === 'Escape') return setRecording(false);
  if (event.key === 'Backspace' || event.key === 'Delete') {
    await setSettings({ shortcut: '' });
    return setRecording(false, t('Shortcut removed.'));
  }

  const combo = shortcutFromEvent(event);
  if (!combo) return; // only modifier keys held so far
  if (!isUsableShortcut(combo)) {
    $('shortcut-hint').textContent = t(MODIFIER_HINT);
    return;
  }
  // Warn about clashes with shortcuts everyone already uses.
  const conflict = shortcutConflict(combo);
  if (conflict?.reserved) {
    unconfirmed = '';
    $('shortcut-hint').textContent = t(
      '{shortcut} belongs to the browser ({action}) and would not work. Press a different one.',
      { shortcut: formatShortcut(combo), action: t(conflict.action) }
    );
    return;
  }
  if (conflict && unconfirmed !== combo) {
    unconfirmed = combo;
    $('shortcut-hint').textContent = t(
      '{shortcut} is already used for “{action}”. Press it again to use it anyway, or press a different one.',
      { shortcut: formatShortcut(combo), action: t(conflict.action) }
    );
    return;
  }
  await setSettings({ shortcut: combo });
  setRecording(false, t('Saved. Works on web pages.'));
}

async function checkBackground() {
  try {
    const { version } = await sendToBackground(MSG.PING);
    $('background-status').textContent = t('Connected (v{version})', { version });
  } catch (err) {
    $('background-status').textContent = t('Error: {error}', { error: err.message });
  }
}

async function checkPage() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const info = await sendToTab(tab.id, MSG.GET_PAGE_INFO);
    $('page-status').textContent = t(info.enabled ? 'Active' : 'Disabled');
  } catch {
    // No content script here: browser-internal page, or a tab that was
    // open before the extension was (re)loaded and hasn't been refreshed.
    $('page-status').textContent = t('Not available (try reloading the tab)');
  }
}

let copyTimer;
async function copyConstant(constant) {
  const symbol = withCoefficient(constant, constant.symbol);
  const value = shownValue(constant);
  const status = $('copy-status');
  try {
    await navigator.clipboard.writeText(value);
    status.textContent = t('Copied {symbol} = {value}', { symbol, value });
    MyConstantUsage.record(constant); // feeds the quick picker's "most used"
  } catch (err) {
    status.textContent = t('Copy failed: {error}', { error: err.message });
  }
  clearTimeout(copyTimer);
  copyTimer = setTimeout(() => (status.textContent = ''), 2000);
}

async function init() {
  const manifest = chrome.runtime.getManifest();
  $('name').textContent = manifest.name;
  $('version').textContent = `v${manifest.version}`;

  // Language choices: "Auto" plus every language in shared/i18n.js, each
  // shown under its own name so it can be found whatever the current one is.
  const auto = new Option('Auto (browser language)', 'auto');
  auto.setAttribute('data-i18n', '');
  $('language').append(auto, ...MyConstantI18n.LANGUAGES.map((l) => new Option(l.name, l.code)));
  $('language').addEventListener('change', (e) => setSettings({ language: e.target.value }));

  render(await getSettings());
  onSettingsChanged((settings) => {
    render(settings);
    checkPage();
  });

  $('enabled').addEventListener('change', (e) => setSettings({ enabled: e.target.checked }));
  $('keep-open').addEventListener('change', (e) => setSettings({ keepOpen: e.target.checked }));
  $('precision').addEventListener('change', (e) => {
    const value = clampPrecision(e.target.valueAsNumber);
    e.target.value = value;
    setSettings({ precision: value });
  });
  $('notation').addEventListener('change', (e) => setSettings({ notation: e.target.value }));
  $('search').addEventListener('input', (e) => {
    query = e.target.value;
    renderSections();
  });
  $('coefficient').addEventListener('input', (e) => {
    const parsed = MyConstantFormat.parseCoefficient(e.target.value);
    e.target.setAttribute('aria-invalid', String(parsed === false));
    coefficient = parsed || null;
    renderSections();
  });
  $('search').focus();
  $('add-constant').addEventListener('click', () => toggleAddForm(true));
  $('add-cancel').addEventListener('click', () => toggleAddForm(false));
  $('add-form').addEventListener('submit', addConstant);
  $('open-library').addEventListener('click', openLibrary);
  $('open-settings').addEventListener('click', () => showView('settings'));
  $('close-settings').addEventListener('click', () => showView('main'));
  $('open-advanced').addEventListener('click', () => chrome.runtime.openOptionsPage());

  $('shortcut').addEventListener('click', () =>
    setRecording(
      !recording,
      recording ? '' : t('Press the new shortcut. Esc cancels, Backspace removes it.')
    )
  );
  window.addEventListener('keydown', onRecordKeydown, true);

  checkBackground();
  checkPage();

  // The popup is read from disk each time it opens, but the quick picker and
  // the background worker only change when the extension is reloaded. Offer
  // that when the files have changed since. Reloading closes the popup and
  // puts the new quick picker into the open tabs.
  $('reload-extension').addEventListener('click', () => chrome.runtime.reload());
  filesChangedSinceLoad().then((changed) => {
    $('stale').hidden = !changed;
  });
}

init();
