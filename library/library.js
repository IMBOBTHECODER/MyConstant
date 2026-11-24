// Library script (ES module)
// -----------------------------------------
// Lists every built-in constant and lets the user choose which ones appear
// in the popup. The constants marked `core` in shared/constants.js are
// included to begin with; the rest are added from here.
//
// Presets (MyConstantData.PRESETS) are ready-made selections; choosing one
// replaces the current selection.
//
// The choice is saved as two lists of keys (see MyConstantData.keyOf):
//   added   non-core constants the user switched on
//   hidden  core constants the user switched off
// Storing only the differences from the default means a constant added to
// the core set in a later version shows up for everyone.

import { matchesExactly, matchesLoosely } from '../popup/search.js';
import { getSettings, setSettings, onSettingsChanged } from '../shared/settings.js';

/* global MyConstantI18n, MyConstantLatex, MyConstantFormat, MyConstantData —
   defined by the classic scripts in shared/, loaded in library.html */
const { CATEGORIES, PRESETS, keyOf, isIncluded, presetSelection } = MyConstantData;
const t = (text, values) => MyConstantI18n.t(text, values);
const $ = (id) => document.getElementById(id);

const ALL = CATEGORIES.flatMap((category) => category.constants);

let settings = null;
let query = '';

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

const shownValue = (constant) => MyConstantFormat.formatValue(constant.value, settings);
const searchTexts = (constant) => [constant.symbol, constant.name, shownValue(constant)];

/** Switches the given constants on or off in the popup. */
async function setIncluded(constants, on) {
  const added = new Set(settings.added);
  const hidden = new Set(settings.hidden);
  for (const constant of constants) {
    const key = keyOf(constant);
    if (constant.core) hidden[on ? 'delete' : 'add'](key);
    else added[on ? 'add' : 'delete'](key);
  }
  const patch = { added: [...added], hidden: [...hidden] };
  // Show the change straight away; storage catches up in the background.
  settings = { ...settings, ...patch };
  render();
  try {
    await setSettings(patch);
  } catch (err) {
    // e.g. the browser's sync storage quota is full
    $('summary').textContent = t('Could not save: {error}', { error: err.message });
  }
}

function makeCard(constant) {
  const on = isIncluded(constant, settings);
  const card = el('button', on ? 'card is-included' : 'card');
  card.type = 'button';
  card.dataset.key = keyOf(constant);
  card.setAttribute('aria-pressed', String(on));
  card.title = t(on ? 'Remove {name}' : 'Add {name}', { name: constant.name });

  const symbol = el('span', 'card-symbol');
  symbol.append(MyConstantLatex.label(constant));
  const text = el('span', 'card-text');
  text.append(el('span', 'card-name', constant.name), el('span', 'card-value', shownValue(constant)));
  card.append(symbol, text, el('span', 'card-state', on ? '✓' : '+'));

  card.addEventListener('click', () => setIncluded([constant], !on));
  return card;
}

function makeSection(category, shown) {
  const section = el('section');
  const head = el('div', 'section-head');
  const included = category.constants.filter((c) => isIncluded(c, settings)).length;
  const addAll = el('button', '', t('Add all'));
  addAll.type = 'button';
  addAll.disabled = shown.every((c) => isIncluded(c, settings));
  addAll.addEventListener('click', () => setIncluded(shown, true));
  const removeAll = el('button', '', t('Remove all'));
  removeAll.type = 'button';
  removeAll.disabled = !shown.some((c) => isIncluded(c, settings));
  removeAll.addEventListener('click', () => setIncluded(shown, false));
  head.append(
    el('h2', '', t(category.title)),
    el('span', 'count muted', `${included} / ${category.constants.length}`),
    addAll,
    removeAll
  );

  const cards = el('div', 'cards');
  cards.append(...shown.map(makeCard));
  section.append(head, cards);
  return section;
}

function render() {
  MyConstantI18n.setLanguage(settings.language);
  MyConstantI18n.apply();
  document.title = `${t('Constant library')} — ${chrome.runtime.getManifest().name}`;

  // Same two passes as the popup's search: exact first, and only if that
  // finds nothing, the typo-tolerant one (see popup/search.js).
  const searching = query.trim() !== '';
  const exact = (c) => matchesExactly(searchTexts(c), query);
  const loose = searching && !ALL.some(exact);
  const matches = !searching ? () => true : loose ? (c) => matchesLoosely(searchTexts(c), query) : exact;

  // Rebuilding the list drops keyboard focus; put it back on the same card.
  const focusedKey = document.activeElement?.dataset?.key;

  const sections = [];
  let found = 0;
  for (const category of CATEGORIES) {
    const shown = category.constants.filter(matches);
    found += shown.length;
    if (shown.length) sections.push(makeSection(category, shown));
  }
  $('categories').replaceChildren(...sections);
  $('no-matches').hidden = !searching || found > 0;
  $('close-matches').hidden = !(loose && found > 0);

  $('summary').textContent = t('{count} of {total} included', {
    count: ALL.filter((c) => isIncluded(c, settings)).length,
    total: ALL.length,
  });
  renderPresets();

  if (focusedKey) {
    [...document.querySelectorAll('.card')].find((card) => card.dataset.key === focusedKey)?.focus();
  }
}

/** One button per preset, by group; the one matching the current selection is marked. */
function renderPresets() {
  const sameSet = (a, b) => a.length === b.length && a.every((key) => b.includes(key));
  // Compare what is actually selected, ignoring keys of constants that no
  // longer exist (left behind by an older version).
  const known = new Set(ALL.map(keyOf));
  const added = settings.added.filter((key) => known.has(key));
  const hidden = settings.hidden.filter((key) => known.has(key));

  const makeButton = (preset) => {
      const selection = presetSelection(preset);
      const button = el('button', '', t(preset.title));
      button.type = 'button';
      button.setAttribute(
        'aria-pressed',
        String(sameSet(selection.added, added) && sameSet(selection.hidden, hidden))
      );
      button.addEventListener('click', async () => {
        settings = { ...settings, ...selection };
        render();
        try {
          await setSettings(selection);
        } catch (err) {
          $('summary').textContent = t('Could not save: {error}', { error: err.message });
        }
      });
      return button;
  };

  // "Essentials: Light Medium All" and "Subjects: ...", each its own group.
  const groups = [...new Set(PRESETS.map((preset) => preset.group))];
  $('presets').replaceChildren(
    ...groups.map((name) => {
      const group = el('div', 'presets');
      if (name) group.append(el('span', 'muted', t(name)));
      group.append(...PRESETS.filter((preset) => preset.group === name).map(makeButton));
      return group;
    })
  );
}

function useSettings(next) {
  settings = {
    ...next,
    added: Array.isArray(next.added) ? next.added : [],
    hidden: Array.isArray(next.hidden) ? next.hidden : [],
  };
  render();
}

async function init() {
  // The popup's "3 more in the library" link passes its search along.
  query = new URLSearchParams(location.hash.slice(1)).get('q') || '';
  $('search').value = query;

  useSettings(await getSettings());
  onSettingsChanged(useSettings);

  $('search').addEventListener('input', (e) => {
    query = e.target.value;
    render();
  });
  $('search').focus();
}

init();
