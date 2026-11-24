// Keyboard shortcut helpers
// -----------------------------------------
// A shortcut is stored as modifiers (Ctrl, Alt, Shift, Meta, in that order)
// followed by a physical key code, joined with "+": "Alt+KeyC",
// "Ctrl+Shift+Digit1". Key *codes* are used rather than typed characters so
// the shortcut works the same on every keyboard layout and input method.
// The content script has its own copy of shortcutFromEvent (it cannot
// import modules) — keep the two in sync.

const MODIFIER_KEYS = ['Control', 'Alt', 'Shift', 'Meta'];

/** Turns a keydown event into a shortcut string, or '' for a lone modifier. */
export function shortcutFromEvent(event) {
  if (MODIFIER_KEYS.includes(event.key)) return '';
  const parts = [];
  if (event.ctrlKey) parts.push('Ctrl');
  if (event.altKey) parts.push('Alt');
  if (event.shiftKey) parts.push('Shift');
  if (event.metaKey) parts.push('Meta');
  parts.push(event.code);
  return parts.join('+');
}

/**
 * A shortcut must include Ctrl, Alt or Meta, or be a function key —
 * otherwise it would fire while the user is simply typing.
 */
export function isUsableShortcut(shortcut) {
  const parts = shortcut.split('+');
  const code = parts[parts.length - 1];
  return parts.some((p) => ['Ctrl', 'Alt', 'Meta'].includes(p)) || /^F\d{1,2}$/.test(code);
}

// Modifier keys are named differently per operating system.
const PLATFORM = navigator.userAgentData?.platform ?? navigator.platform ?? '';
const IS_MAC = /mac/i.test(PLATFORM);
const IS_WINDOWS = /win/i.test(PLATFORM);
const MODIFIER_LABELS = IS_MAC
  ? { Ctrl: 'Control', Alt: 'Option', Shift: 'Shift', Meta: 'Cmd' }
  : { Ctrl: 'Ctrl', Alt: 'Alt', Shift: 'Shift', Meta: IS_WINDOWS ? 'Win' : 'Super' };

// Built-in default shortcut. On a Mac, Option+C types "ç", so Control+C
// (which macOS browsers leave unused) takes its place.
// Mirrored in content/content-script.js.
export const DEFAULT_SHORTCUT = IS_MAC ? 'Ctrl+KeyC' : 'Alt+KeyC';

/** Turns the stored setting into an actual shortcut ("default" -> per OS). */
export function resolveShortcut(stored) {
  if (stored === 'default') return DEFAULT_SHORTCUT;
  return typeof stored === 'string' ? stored : '';
}

/** Hint shown when a recorded shortcut has no usable modifier. */
export const MODIFIER_HINT = IS_MAC
  ? 'Include Control, Option or Cmd, so it does not trigger while typing.'
  : 'Include Ctrl or Alt, so it does not trigger while typing.';

/** Human-readable form: "Alt+KeyC" -> "Alt + C" ("Option + C" on a Mac). */
export function formatShortcut(shortcut) {
  if (!shortcut) return 'Not set';
  return shortcut
    .split('+')
    .map((part) =>
      (MODIFIER_LABELS[part] ?? part)
        .replace(/^Key(?=[A-Z]$)/, '')
        .replace(/^Digit(?=\d$)/, '')
        .replace(/^Numpad(?=.)/, 'Num ')
        .replace(/^Arrow(?=.)/, '')
    )
    .join(' + ');
}

// --- Clashes with well-known shortcuts ---------------------------------------
// Used by the popup to warn before a shortcut is saved. "Primary" is the
// modifier everyday shortcuts use: Cmd on a Mac, Ctrl elsewhere.
const PRIMARY = IS_MAC ? 'Meta' : 'Ctrl';

// The browser keeps these for itself: pages never see them, so they could
// not open the picker at all.
const RESERVED = {
  [`${PRIMARY}+KeyT`]: 'New tab',
  [`${PRIMARY}+KeyW`]: 'Close tab',
  [`${PRIMARY}+KeyN`]: 'New window',
  [`${PRIMARY}+Shift+KeyT`]: 'Reopen closed tab',
  [`${PRIMARY}+Shift+KeyW`]: 'Close window',
  [`${PRIMARY}+Shift+KeyN`]: 'Private window',
  'Ctrl+Tab': 'Next tab',
  'Ctrl+Shift+Tab': 'Previous tab',
  'Alt+F4': 'Close window',
  'Meta+KeyQ': 'Quit',
};

// These would work, but take over something people use all the time.
const COMMON = {
  [`${PRIMARY}+KeyC`]: 'Copy',
  [`${PRIMARY}+KeyV`]: 'Paste',
  [`${PRIMARY}+KeyX`]: 'Cut',
  [`${PRIMARY}+KeyA`]: 'Select all',
  [`${PRIMARY}+KeyZ`]: 'Undo',
  [`${PRIMARY}+KeyY`]: 'Redo',
  [`${PRIMARY}+Shift+KeyZ`]: 'Redo',
  [`${PRIMARY}+Shift+KeyV`]: 'Paste without formatting',
  [`${PRIMARY}+KeyS`]: 'Save page',
  [`${PRIMARY}+KeyF`]: 'Find in page',
  [`${PRIMARY}+KeyG`]: 'Find next',
  [`${PRIMARY}+KeyP`]: 'Print',
  [`${PRIMARY}+KeyR`]: 'Reload',
  [`${PRIMARY}+Shift+KeyR`]: 'Reload',
  [`${PRIMARY}+KeyL`]: 'Address bar',
  [`${PRIMARY}+KeyK`]: 'Search',
  [`${PRIMARY}+KeyD`]: 'Bookmark this page',
  [`${PRIMARY}+KeyH`]: IS_MAC ? 'Hide window' : 'History',
  [`${PRIMARY}+KeyJ`]: 'Downloads',
  [`${PRIMARY}+KeyO`]: 'Open file',
  [`${PRIMARY}+KeyU`]: 'View source',
  [`${PRIMARY}+KeyB`]: 'Bold',
  [`${PRIMARY}+KeyI`]: 'Italic',
  [`${PRIMARY}+Shift+KeyI`]: 'Developer tools',
  [`${PRIMARY}+Shift+KeyJ`]: 'Developer tools',
  [`${PRIMARY}+Shift+KeyC`]: 'Developer tools',
  [`${PRIMARY}+Shift+KeyB`]: 'Bookmarks bar',
  [`${PRIMARY}+Shift+Delete`]: 'Clear browsing data',
  [`${PRIMARY}+Equal`]: 'Zoom',
  [`${PRIMARY}+Minus`]: 'Zoom',
  [`${PRIMARY}+Digit0`]: 'Zoom',
  [`${PRIMARY}+Enter`]: 'Send',
  'Alt+ArrowLeft': 'Back',
  'Alt+ArrowRight': 'Forward',
  'Alt+KeyD': 'Address bar',
  'Alt+KeyE': 'Browser menu',
  'Alt+KeyF': 'Browser menu',
  'Alt+Home': 'Home page',
  'Meta+KeyM': 'Minimise window',
  'Meta+Comma': 'Settings',
  F1: 'Help',
  F3: 'Find next',
  F5: 'Reload',
  F6: 'Address bar',
  F11: 'Full screen',
  F12: 'Developer tools',
};
// Ctrl/Cmd + 1-9 switch tabs.
for (let digit = 1; digit <= 9; digit++) COMMON[`${PRIMARY}+Digit${digit}`] = 'Switch tab';

/**
 * Says whether a shortcut clashes with a well-known one:
 *   null                           no clash
 *   { action, reserved: false }    works, but replaces `action` on web pages
 *   { action, reserved: true }     the browser keeps it; it would never fire
 * `action` is English; translate it for display.
 */
export function shortcutConflict(shortcut) {
  if (shortcut in RESERVED) return { action: RESERVED[shortcut], reserved: true };
  if (shortcut in COMMON) return { action: COMMON[shortcut], reserved: false };
  return null;
}
