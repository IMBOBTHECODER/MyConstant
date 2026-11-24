// Options script (ES module)
// -----------------------------------------
// Generic settings form: every control whose `name` matches a key in
// DEFAULT_SETTINGS is filled on load and saved on change. Supports
// checkboxes, number inputs, and anything else with a string `.value`.

import { DEFAULT_SETTINGS, getSettings, setSettings, onSettingsChanged } from '../shared/settings.js';
import { renderInfo } from './info.js';

/* global MyConstantI18n, MyConstantFormat — defined by shared/i18n.js and
   shared/format.js, loaded in options.html */
const t = (text, values) => MyConstantI18n.t(text, values);

const form = document.getElementById('settings');
const status = document.getElementById('status');

function controlFor(key) {
  return form.elements.namedItem(key);
}

function render(settings) {
  // The language is chosen in the popup; follow it here.
  MyConstantI18n.setLanguage(settings.language);
  MyConstantI18n.apply();
  document.title = t('{name} — Settings', { name: chrome.runtime.getManifest().name });
  renderInfo();
  renderBase(settings);

  for (const key of Object.keys(DEFAULT_SETTINGS)) {
    const control = controlFor(key);
    if (!control) continue;
    if (control.type === 'checkbox') control.checked = Boolean(settings[key]);
    else control.value = settings[key];
  }
}

function readValue(control) {
  if (control.type === 'checkbox') return control.checked;
  if (control.type === 'number') return control.valueAsNumber;
  return control.value;
}

let statusTimer;
function flash(text, duration = 1500) {
  status.textContent = text;
  clearTimeout(statusTimer);
  statusTimer = setTimeout(() => (status.textContent = ''), duration);
}

form.addEventListener('change', async (e) => {
  const control = e.target;
  if (!(control.name in DEFAULT_SETTINGS)) return;
  try {
    await setSettings({ [control.name]: readValue(control) });
    flash(t('Saved'));
  } catch (err) {
    flash(t('Could not save: {error}', { error: err.message }));
  }
});

form.addEventListener('submit', (e) => e.preventDefault());

// "Other" picked in the number-base list, even if the number typed is one of
// the preset bases. Declared here because the reset below clears it.
let wantsCustomBase = false;

// --- Reset to defaults ------------------------------------------------------
// Everything in DEFAULT_SETTINGS except the user's own data.
// (the library selection has its own restore button, on the library page)
const KEPT_ON_RESET = ['myConstants', 'pinned', 'added', 'hidden'];
const resetButton = document.getElementById('reset');
let resetArmed = false;
let resetTimer;

function disarmReset() {
  resetArmed = false;
  clearTimeout(resetTimer);
  resetButton.classList.remove('is-armed');
  resetButton.textContent = t('Reset to defaults');
}

resetButton.addEventListener('click', async () => {
  // First click only arms the button; a second click within a few seconds
  // does the reset, so a stray click cannot wipe the settings.
  if (!resetArmed) {
    resetArmed = true;
    resetButton.classList.add('is-armed');
    resetButton.textContent = t('Click again to confirm');
    resetTimer = setTimeout(disarmReset, 4000);
    return;
  }
  disarmReset();
  const defaults = Object.fromEntries(
    Object.entries(DEFAULT_SETTINGS).filter(([key]) => !KEPT_ON_RESET.includes(key))
  );
  try {
    wantsCustomBase = false;
    await setSettings(defaults);
    // Switch language now, so the confirmation is in the restored language.
    MyConstantI18n.setLanguage(defaults.language);
    flash(t('Settings reset. Your constants and pins were kept.'), 4000);
  } catch (err) {
    flash(t('Could not save: {error}', { error: err.message }));
  }
});

// --- Backup -----------------------------------------------------------------
// Export writes every setting (the user's constants and pins included) to a
// JSON file; import reads one back, keeping only what it recognises.
const BACKUP_APP = 'MyConstant';
const isText = (value, max) => typeof value === 'string' && value.length > 0 && value.length <= max;

document.getElementById('export').addEventListener('click', async () => {
  const backup = {
    app: BACKUP_APP,
    version: chrome.runtime.getManifest().version,
    exported: new Date().toISOString(),
    settings: await getSettings(),
  };
  const link = document.createElement('a');
  link.href = URL.createObjectURL(new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' }));
  link.download = `myconstant-backup-${backup.exported.slice(0, 10)}.json`;
  link.click();
  setTimeout(() => URL.revokeObjectURL(link.href), 1000);
  flash(t('Backup saved.'), 4000);
});

/** One checked, cleaned-up value per setting; undefined = leave it alone. */
const CLEAN = {
  enabled: (v) => (typeof v === 'boolean' ? v : undefined),
  keepOpen: (v) => (typeof v === 'boolean' ? v : undefined),
  myConstants: (v) =>
    Array.isArray(v)
      ? v
          .filter((c) => c && isText(c.symbol, 100) && isText(c.value, 100))
          .slice(0, 300)
          .map((c) => ({ symbol: c.symbol, value: c.value }))
      : undefined,
  pinned: (v) =>
    Array.isArray(v)
      ? v
          .filter((c) => c && isText(c.symbol, 100) && isText(c.value, 100))
          .slice(0, 300)
          .map((c) => ({
            symbol: c.symbol,
            value: c.value,
            ...(isText(c.name, 200) && { name: c.name }),
            ...(isText(c.latex, 200) && { latex: c.latex }),
            ...(c.builtin === true && { builtin: true }),
          }))
      : undefined,
  precision: (v) => (Number.isFinite(v) ? MyConstantFormat.clampPrecision(v) : undefined),
  notation: (v) => (['normal', 'scientific'].includes(v) ? v : undefined),
  base: (v) => (Number.isFinite(v) ? MyConstantFormat.clampBase(v) : undefined),
  language: (v) =>
    v === 'auto' || MyConstantI18n.LANGUAGES.some((l) => l.code === v) ? v : undefined,
  shortcut: (v) => (typeof v === 'string' && v.length <= 60 ? v : undefined),
  added: (v) => (Array.isArray(v) ? v.filter((k) => isText(k, 100)).slice(0, 500) : undefined),
  hidden: (v) => (Array.isArray(v) ? v.filter((k) => isText(k, 100)).slice(0, 500) : undefined),
};

const importFile = document.getElementById('import-file');
document.getElementById('import').addEventListener('click', () => importFile.click());
importFile.addEventListener('change', async () => {
  const [file] = importFile.files;
  importFile.value = ''; // so choosing the same file again still fires
  if (!file) return;
  let patch;
  try {
    const backup = JSON.parse(await file.text());
    if (backup?.app !== BACKUP_APP || typeof backup.settings !== 'object' || !backup.settings) {
      throw new Error('not a backup');
    }
    patch = {};
    for (const [key, clean] of Object.entries(CLEAN)) {
      const value = key in backup.settings ? clean(backup.settings[key]) : undefined;
      if (value !== undefined) patch[key] = value;
    }
  } catch {
    flash(t('This file is not a MyConstant backup.'), 4000);
    return;
  }
  try {
    wantsCustomBase = false;
    await setSettings(patch);
    if (patch.language) MyConstantI18n.setLanguage(patch.language);
    const { myConstants } = await getSettings();
    flash(t('Imported. Your own constants: {count}.', { count: myConstants.length }), 4000);
  } catch (err) {
    flash(t('Could not save: {error}', { error: err.message }), 4000);
  }
});

// --- Number base ----------------------------------------------------------
// A list of common bases plus "Other", which reveals a 2-36 number box.
const basePreset = document.getElementById('base-preset');
const baseCustom = document.getElementById('base-custom');
const PRESET_BASES = ['2', '8', '10', '16'];

function renderBase(settings) {
  const base = MyConstantFormat.clampBase(settings.base);
  const isPreset = PRESET_BASES.includes(String(base));
  if (!isPreset) wantsCustomBase = true;
  basePreset.value = wantsCustomBase ? 'other' : String(base);
  baseCustom.hidden = !wantsCustomBase;
  if (document.activeElement !== baseCustom) baseCustom.value = base;

  renderDigits(base);

  // A live example, so the effect of the choice is visible straight away.
  const pi = '3.141592653589793238462643383279';
  document.getElementById('base-example').textContent =
    `π = ${MyConstantFormat.formatValue(pi, { ...settings, base })}`;
}

// The character set: a dropdown listing which characters stand for the
// digits of the chosen base.
const digitsDropdown = document.getElementById('base-digits');

function renderDigits(base) {
  document.getElementById('base-digits-label').textContent = t('Digits ({count})', { count: base });
  // 0-9 then A-Z, the same characters the conversion itself writes.
  const digits = Array.from({ length: base }, (_, value) => value.toString(base).toUpperCase());
  document.getElementById('base-digits-list').replaceChildren(
    ...digits.map((digit) => {
      const item = document.createElement('code');
      item.textContent = digit;
      return item;
    })
  );
}

// Like any dropdown, it closes on a click elsewhere or on Escape.
document.addEventListener('click', (e) => {
  if (!digitsDropdown.contains(e.target)) digitsDropdown.open = false;
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') digitsDropdown.open = false;
});

async function saveBase(value) {
  try {
    await setSettings({ base: MyConstantFormat.clampBase(value) });
    flash(t('Saved'));
  } catch (err) {
    flash(t('Could not save: {error}', { error: err.message }));
  }
}

basePreset.addEventListener('change', () => {
  wantsCustomBase = basePreset.value === 'other';
  baseCustom.hidden = !wantsCustomBase;
  if (wantsCustomBase) baseCustom.focus();
  else saveBase(Number(basePreset.value));
});

baseCustom.addEventListener('change', () => {
  const base = MyConstantFormat.clampBase(baseCustom.valueAsNumber);
  baseCustom.value = base;
  saveBase(base);
});

getSettings().then(render);
onSettingsChanged(render); // stay in sync with changes made in the popup
