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
  // The bin: the user's own constants they removed, newest last. Kept
  // for BIN_DAYS, then dropped. Stored in a short form to save room,
  // [symbol, value, day removed] each; read it with liveBin and write it
  // with packBin (both below), which deal in { symbol, value, removedAt }.
  bin: [],
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
  // What a click on a constant in the quick picker does: 'both' (type it
  // into the text field and copy it), 'insert' (type it in only, leaving
  // the clipboard alone) or 'copy' (copy only).
  pickerAction: 'both',
  // Which built-in constants the popup shows, as differences from the
  // default selection (the `core` ones in shared/constants.js). Lists of
  // "<symbol>|<value>" keys, changed on the library page (library/).
  added: [], // non-core constants switched on
  hidden: [], // core constants switched off
});

/** How long a removed constant stays in the bin. */
export const BIN_DAYS = 30;
const DAY = 24 * 60 * 60 * 1000;

// The browser allows each synced setting about 8 KB (8,192 bytes, name
// included). The bin is kept under BIN_BYTES; when it would grow past
// that, the oldest entries go early. From BIN_NEARLY_FULL of it, the popup
// says so.
const BIN_BYTES = 7000;
export const BIN_NEARLY_FULL = 0.9;
const bytes = (value) => new TextEncoder().encode(JSON.stringify(value)).length;
const toStored = (e) => [e.symbol, e.value, e.removedAt];

/** How full the bin is, from 0 to 1. */
export const binFullness = (entries) =>
  entries.length ? Math.min(1, bytes(entries.map(toStored)) / BIN_BYTES) : 0;
const today = (now = Date.now()) => Math.floor(now / DAY);

/** Whole days until a bin entry is deleted for good (at least 1). */
export const binDaysLeft = (entry, now = Date.now()) =>
  Math.max(1, entry.removedAt + BIN_DAYS - today(now));

/**
 * The stored bin as [{ symbol, value, removedAt }] (removedAt = the day it
 * was removed, counted from 1970), without the entries whose BIN_DAYS have
 * passed or that are not in the stored form.
 */
export const liveBin = (stored, now = Date.now()) =>
  (Array.isArray(stored) ? stored : [])
    .filter(
      (e) =>
        Array.isArray(e) &&
        typeof e[0] === 'string' &&
        typeof e[1] === 'string' &&
        Number.isFinite(e[2]) &&
        today(now) - e[2] < BIN_DAYS
    )
    .map(([symbol, value, removedAt]) => ({ symbol, value, removedAt }));

/** False for a constant so large that the bin could not hold it alone. */
export const fitsInBin = (entry) => bytes([toStored(entry)]) <= BIN_BYTES;

/** A bin entry for a constant removed now. */
export const binEntry = ({ symbol, value }) => ({ symbol, value, removedAt: today() });

/** Entries (oldest first) in the form they are stored in, cut to fit. */
export function packBin(entries) {
  // One too large to fit even alone is left out, rather than emptying
  // the bin for it in vain.
  const packed = entries.filter(fitsInBin).map(toStored);
  while (packed.length && bytes(packed) > BIN_BYTES) packed.shift();
  return packed;
}

/** Deletes expired bin entries from storage. Resolves to the settings. */
export async function emptyExpiredBin() {
  const settings = await getSettings();
  const stored = Array.isArray(settings.bin) ? settings.bin : [];
  const bin = packBin(liveBin(stored));
  if (bin.length !== stored.length) {
    await setSettings({ bin });
    settings.bin = bin;
  }
  return settings;
}

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
