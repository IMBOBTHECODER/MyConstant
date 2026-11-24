// Fingerprint of the extension's files
// -----------------------------------------
// The popup and the library page are read from disk every time they open,
// but the background worker, the manifest and the content script (which
// draws the quick picker on web pages) only change when the extension is
// reloaded. While developing, that leaves the popup new and the quick
// picker old, which looks like a bug.
//
// So: the background worker records a fingerprint of those files when the
// extension is loaded, and the popup compares it with the files on disk
// now. If they differ, the popup offers to reload the extension.
// An installed (packed) extension's files never change, so there this
// never shows.

// Files the background worker imports (the manifest lists the rest).
const WORKER_IMPORTS = ['shared/messages.js', 'shared/settings.js', 'shared/fingerprint.js'];

async function readText(path) {
  const response = await fetch(chrome.runtime.getURL(path), { cache: 'no-store' });
  return response.text();
}

/** A short text that changes whenever any file that needs a reload changes. */
export async function fingerprint() {
  const manifest = JSON.parse(await readText('manifest.json'));
  const worker = manifest.background.service_worker ?? manifest.background.scripts?.[0];
  const files = [
    'manifest.json',
    worker,
    ...WORKER_IMPORTS,
    ...manifest.content_scripts.flatMap((entry) => [...(entry.js ?? []), ...(entry.css ?? [])]),
  ];
  const texts = await Promise.all([...new Set(files)].map(readText));
  // FNV-1a hash of each file: small, fast, and plenty for "did it change".
  return texts
    .map((text) => {
      let hash = 0x811c9dc5;
      for (let i = 0; i < text.length; i++) {
        hash = Math.imul(hash ^ text.charCodeAt(i), 0x01000193);
      }
      return (hash >>> 0).toString(36);
    })
    .join('.');
}

/** Run by the background worker each time the extension is (re)loaded. */
export async function rememberLoadedFiles() {
  await chrome.storage.local.set({ loadedFingerprint: await fingerprint() });
}

/** True if the files on disk are no longer the ones the extension loaded. */
export async function filesChangedSinceLoad() {
  try {
    const { loadedFingerprint } = await chrome.storage.local.get('loadedFingerprint');
    if (loadedFingerprint) return loadedFingerprint !== (await fingerprint());
    // Loaded by a version from before this check existed: compare the parts
    // of the manifest that only a reload applies.
    const onDisk = JSON.parse(await readText('manifest.json'));
    const loaded = chrome.runtime.getManifest();
    const parts = (m) => JSON.stringify([m.version, m.permissions, m.host_permissions, m.content_scripts?.[0]?.js]);
    return parts(onDisk) !== parts(loaded);
  } catch {
    return false; // cannot tell; say nothing
  }
}
