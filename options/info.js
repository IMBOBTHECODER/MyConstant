// About (ES module)
// -----------------------------------------
// Fills the "About" list on the advanced settings page: extension name and
// version, extension ID, browser and browser language. Needs no
// permissions, and nothing here leaves the page.

/* global MyConstantI18n — defined by shared/i18n.js, loaded in options.html */

const t = (text, values) => MyConstantI18n.t(text, values);

/** Browser name and version, e.g. "Brave 158.0.0.0". */
async function getBrowser() {
  // Firefox has its own API for this.
  if (chrome.runtime.getBrowserInfo) {
    const { name, version } = await chrome.runtime.getBrowserInfo();
    return `${name} ${version}`;
  }
  const uaData = navigator.userAgentData;
  if (uaData) {
    let brands = uaData.brands;
    try {
      // Full version numbers; falls back to major versions if unavailable.
      ({ fullVersionList: brands } = await uaData.getHighEntropyValues(['fullVersionList']));
    } catch {}
    // Skip the deliberately fake "Not A Brand" entry, and prefer the real
    // browser (Edge, Brave, ...) over the generic "Chromium" entry.
    const real = brands.filter((b) => !/not.?a.?brand/i.test(b.brand));
    const best = real.find((b) => b.brand !== 'Chromium') ?? real[0];
    if (best) return `${best.brand} ${best.version}`;
  }
  return navigator.userAgent;
}

// [English label, value] — labels are translated when drawn.
async function collect() {
  const manifest = chrome.runtime.getManifest();
  return [
    ['Extension', `${manifest.name} ${manifest.version}`],
    ['Extension ID', chrome.runtime.id],
    ['Browser', await getBrowser()],
    ['Language', navigator.language],
  ];
}

let rows = null;
let error = null;

/** Draws the list in the current language. */
export function renderInfo() {
  const list = document.getElementById('info');
  if (error) {
    list.textContent = t('Could not read this information: {error}', { error: error.message });
    return;
  }
  if (!rows) return;
  list.replaceChildren();
  for (const [label, value] of rows) {
    const dt = document.createElement('dt');
    dt.textContent = t(label);
    const dd = document.createElement('dd');
    dd.textContent = value;
    list.append(dt, dd);
  }
}

collect()
  .then((result) => (rows = result))
  .catch((err) => (error = err))
  .finally(renderInfo);
