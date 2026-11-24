// Messaging
// -----------------------------------------
// Every message is `{ type, payload }` and every reply is either
// `{ ok: true, data }` or `{ ok: false, error }`. The helpers below unwrap
// that so callers just await a value or catch an Error.

// Message types. The content script duplicates the ones it handles
// (it cannot import modules) — keep the strings in sync.
export const MSG = Object.freeze({
  PING: 'ping', // -> background: { version }
  GET_PAGE_INFO: 'get-page-info', // -> content script: { title, url, enabled }
  // -> content script: { open }. Payload { reopen: true } opens it (again,
  // at the pointer) instead of closing one that is already open.
  TOGGLE_PICKER: 'toggle-picker',
  // -> background, from a frame too small to hold the picker: toggle it in
  // the tab's main frame instead.
  OPEN_IN_TOP: 'open-in-top',
  // -> background, from the main frame's picker when it was opened on behalf
  // of a small frame: payload { frameId, text }. The worker passes it on to
  // that frame's content script (payload { text }), which types the text
  // into its field. Reply: { inserted }.
  INSERT_TEXT: 'insert-text',
});

function unwrap(response) {
  if (!response) throw new Error('No response');
  if (!response.ok) throw new Error(response.error || 'Unknown error');
  return response.data;
}

/** Sends a message to the background worker and returns its reply data. */
export async function sendToBackground(type, payload) {
  return unwrap(await chrome.runtime.sendMessage({ type, payload }));
}

/**
 * Sends a message to the content script in a tab and returns its reply data.
 * Rejects if the tab has no content script (chrome:// pages, the Web Store,
 * or tabs opened before the extension was installed/reloaded).
 */
export async function sendToTab(tabId, type, payload, frameId = 0) {
  // The content script runs in every frame; ask one (the main one unless told).
  return unwrap(await chrome.tabs.sendMessage(tabId, { type, payload }, { frameId }));
}

/**
 * Registers a message router. `handlers` maps a message type to a function
 * `(payload, sender) => data` (may be async). Thrown errors are sent back
 * to the caller as `{ ok: false, error }`.
 */
export function handleMessages(handlers) {
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    const handler = handlers[message?.type];
    if (!handler) return false; // not ours; let other listeners answer

    Promise.resolve()
      .then(() => handler(message.payload, sender))
      .then((data) => sendResponse({ ok: true, data }))
      .catch((err) => sendResponse({ ok: false, error: String(err?.message ?? err) }));

    return true; // keep the channel open for the async reply
  });
}
