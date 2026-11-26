// Content script
// -----------------------------------------
// Injected into matching pages. Shares the page's DOM but runs in an
// isolated JS world. Loaded as a classic script, so it cannot `import` —
// the few constants below mirror shared/settings.js and shared/messages.js.
//
// Its main job is the quick picker: a small window that opens at the mouse
// pointer (via a keyboard shortcut the user picks in the popup, or the
// right-click menu) listing the user's pinned constants
// and their own constants. Clicking one types it into the text field the
// user is in (if any) and copies it. The text cursor stays in that field
// while the picker is open.

(() => {
  // Mirror of shared/settings.js
  const DEFAULT_SETTINGS = {
    enabled: true,
    myConstants: [],
    bin: [],
    pinned: [],
    precision: 8,
    notation: 'normal',
    base: 10,
    language: 'auto',
    shortcut: 'default',
    keepOpen: true,
    pickerAction: 'both',
    added: [],
    hidden: [],
  };
  // Mirror of shared/messages.js
  const MSG_GET_PAGE_INFO = 'get-page-info';
  const MSG_TOGGLE_PICKER = 'toggle-picker';
  const MSG_OPEN_IN_TOP = 'open-in-top';
  const MSG_INSERT_TEXT = 'insert-text';

  // Only one copy of this script may be active per frame. When the extension
  // is updated or reloaded, the copy already in the page is cut off from the
  // extension (it can no longer read settings) and the background worker
  // injects a fresh one. The fresh copy announces itself with this event,
  // and any older copy stops responding.
  const RETIRE_EVENT = 'myconstant:retire';
  let retired = false;
  window.dispatchEvent(new Event(RETIRE_EVENT));
  window.addEventListener(RETIRE_EVENT, retire, { once: true });
  function retire() {
    retired = true;
    closePicker();
  }
  /** False once the extension was reloaded under this copy's feet. */
  const isAlive = () => {
    try {
      return Boolean(chrome.runtime?.id);
    } catch {
      return false;
    }
  };

  // Marker attribute on <html>; content-styles.css scopes its rules to it,
  // so disabling the extension also switches the injected styles off.
  const ACTIVE_ATTR = 'data-my-extension';

  let settings = { ...DEFAULT_SETTINGS };

  function apply() {
    document.documentElement.toggleAttribute(ACTIVE_ATTR, settings.enabled);
    if (!settings.enabled) closePicker();
  }

  // While the popup is recording a new shortcut it stores a time (ms) in
  // chrome.storage.local until which pages must ignore the shortcut. A time
  // rather than a flag, so it expires by itself if the popup is closed
  // mid-recording.
  let recordingUntil = 0;
  chrome.storage.local.get({ recordingUntil: 0 }).then((stored) => {
    recordingUntil = stored.recordingUntil;
  });

  // Built-in constants to offer when the user has none of their own: their
  // most-copied ones, topped up with the popular ones (see shared/usage.js),
  // out of those included in the popup (see the library page).
  // Kept ready here, and refreshed whenever the counts change, so that
  // opening the picker never has to wait. MyConstantData and MyConstantUsage
  // come from shared/, listed before this file in manifest.json.
  let suggestions = { constants: [], personal: false };
  function refreshSuggestions() {
    MyConstantUsage.suggestions(MyConstantData.included(settings)).then((result) => {
      suggestions = result;
    });
  }
  refreshSuggestions();

  // Resolves once the saved settings have been read.
  const ready = chrome.storage.sync.get(DEFAULT_SETTINGS).then((stored) => {
    settings = stored;
    apply();
    refreshSuggestions();
  });

  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName === 'local' && changes.usage) refreshSuggestions();
    if (areaName === 'local' && changes.recordingUntil) {
      recordingUntil = changes.recordingUntil.newValue ?? 0;
    }
    if (areaName !== 'sync') return;
    for (const [key, { newValue }] of Object.entries(changes)) {
      if (key in DEFAULT_SETTINGS) settings[key] = newValue ?? DEFAULT_SETTINGS[key];
    }
    if (changes.added || changes.hidden) refreshSuggestions();
    apply();
  });

  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (retired) return false;
    if (message?.type === MSG_GET_PAGE_INFO) {
      sendResponse({
        ok: true,
        data: { title: document.title, url: location.href, enabled: settings.enabled },
      });
    } else if (message?.type === MSG_TOGGLE_PICKER) {
      // Wait for the settings first: when this script was only just injected
      // (see the background worker), they may not have loaded yet.
      ready.then(() => {
        if (settings.enabled) {
          // From the right-click menu: always end up open, at the pointer.
          if (message.payload?.reopen) closePicker();
          // fromFrame: a small frame asked for the picker (see the shortcut
          // handler below); what is clicked goes back to that frame.
          togglePicker(message.payload?.fromFrame);
        }
        sendResponse({ ok: true, data: { open: Boolean(picker) } });
      });
      return true; // replying asynchronously
    } else if (message?.type === MSG_INSERT_TEXT) {
      // This is a small frame, and the picker it asked the main frame to
      // show has had a constant clicked: type it into the field here.
      const target = editableTarget() ?? relayedTarget;
      const inserted = target ? insertText(target, String(message.payload?.text ?? '')) : false;
      sendResponse({ ok: true, data: { inserted } });
    }
    return false; // replied synchronously (or not ours)
  });

  // ---------------------------------------------------------------------
  // Quick picker
  // ---------------------------------------------------------------------

  // Remember where the mouse pointer is, so the picker can open there.
  let pointer = null;
  window.addEventListener(
    'mousemove',
    (e) => {
      pointer = { x: e.clientX, y: e.clientY };
    },
    { capture: true, passive: true }
  );

  // The shortcut is a setting (changed in the popup), so it is handled here
  // rather than by the browser. Mirror of shortcutFromEvent in
  // shared/shortcut.js.
  function shortcutFromEvent(e) {
    if (['Control', 'Alt', 'Shift', 'Meta'].includes(e.key)) return '';
    const parts = [];
    if (e.ctrlKey) parts.push('Ctrl');
    if (e.altKey) parts.push('Alt');
    if (e.shiftKey) parts.push('Shift');
    if (e.metaKey) parts.push('Meta');
    parts.push(e.code);
    return parts.join('+');
  }

  // Mirror of DEFAULT_SHORTCUT / resolveShortcut in shared/shortcut.js:
  // Alt+C everywhere, except Control+C on a Mac (where Option+C types "ç").
  const IS_MAC = /mac/i.test(navigator.userAgentData?.platform ?? navigator.platform ?? '');
  const DEFAULT_SHORTCUT = IS_MAC ? 'Ctrl+KeyC' : 'Alt+KeyC';
  const currentShortcut = () =>
    settings.shortcut === 'default' ? DEFAULT_SHORTCUT : settings.shortcut;

  window.addEventListener(
    'keydown',
    (e) => {
      if (retired) return;
      if (!isAlive()) return retire(); // a fresh copy takes over, if there is one
      const shortcut = currentShortcut();
      if (!settings.enabled || !shortcut) return;
      // Stay out of the way while the user is recording a new shortcut in
      // the popup (pressing the current one there must not open the picker),
      // and whenever this page is not the thing being typed into.
      if (Date.now() < recordingUntil || !document.hasFocus()) return;
      if (shortcutFromEvent(e) !== shortcut) return;
      e.preventDefault();
      e.stopPropagation();
      if (e.repeat) return;
      // In a small embedded frame (a comment box, a widget) there is no room
      // for the picker: open it in the main page instead.
      const cramped = window !== window.top && (window.innerWidth < 260 || window.innerHeight < 200);
      if (cramped && !picker) {
        // Note the field first: the main frame cannot see into this one, so
        // it sends the clicked constant back here to be typed in.
        relayedTarget = editableTarget();
        chrome.runtime.sendMessage({ type: MSG_OPEN_IN_TOP }).catch(() => {});
      } else togglePicker();
    },
    true
  );

  // Styles live inside a shadow root, so the page's CSS cannot affect the
  // picker and the picker's CSS cannot leak into the page. The look is the
  // popup's (popup/popup.css): the browser's own buttons and colours, small
  // capital headings, nothing decorative.
  const PICKER_CSS = `
    :host { all: initial; }
    .panel {
      color-scheme: light dark;
      position: fixed;
      z-index: 2147483647;
      box-sizing: border-box;
      width: 260px;
      max-height: 340px;
      overflow-y: auto;
      padding: 14px;
      border: 1px solid color-mix(in srgb, CanvasText 35%, Canvas);
      background: Canvas;
      color: CanvasText;
      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.25);
      font: 13px/1.4 system-ui, sans-serif;
    }
    h2 {
      margin: 0 0 8px;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      opacity: 0.65;
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 6px;
      margin-bottom: 12px;
    }
    .grid:last-of-type { margin-bottom: 0; }
    button {
      padding: 10px 4px;
      font: inherit;
      font-size: 15px;
      cursor: pointer;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    math { font-size: 16px; }
    .coefficient { display: flex; align-items: center; gap: 6px; margin-bottom: 12px; }
    input {
      flex: 1;
      min-width: 0;
      box-sizing: border-box;
      padding: 6px 8px;
      font: inherit;
    }
    input[aria-invalid='true'] { outline: 2px solid #dc2626; }
    .note { margin: 0 0 12px; opacity: 0.65; }
    .status { margin: 10px 0 0; text-align: center; }
    .status:empty { display: none; }
  `;

  // MyConstantI18n comes from shared/i18n.js, listed before this file in
  // manifest.json.
  const t = (text, values) => MyConstantI18n.t(text, values);

  let picker = null; // { host, previousFocus, target, fromFrame, closeTimer } while open

  // In a small frame: the field the user was in when this frame last asked
  // the main frame to show the picker.
  let relayedTarget = null;

  function togglePicker(fromFrame) {
    if (picker) closePicker();
    else openPicker(fromFrame);
  }

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  // MyConstantFormat comes from shared/format.js, listed before this file
  // in manifest.json.
  // What is typed in the picker's coefficient box (see
  // MyConstantFormat.parseCoefficient), or null. Starts empty each time the
  // picker opens.
  let coefficient = null;
  const shown = (constant) => MyConstantFormat.shown(constant, settings, coefficient);

  function addSection(panel, title, constants, status) {
    if (!constants.length) return;
    panel.append(el('h2', '', t(title)));
    const grid = el('div', 'grid');
    for (const constant of constants) {
      const button = el('button');
      // MyConstantLatex comes from shared/latex.js, listed before this file
      // in manifest.json.
      button.append(MyConstantLatex.label(constant));
      button.type = 'button';
      button.title = `${constant.name || constant.symbol}: ${shown(constant).text}`;
      button.addEventListener('click', async () => {
        // Worked out now, not when the picker opened: the coefficient box
        // may have been filled in since.
        const { text: value, scaled } = shown(constant);
        const symbol = scaled ? `${coefficient.text} × ${constant.symbol}` : constant.symbol;
        // Type it into the field the user is in, copy it, or both (so it
        // is on the clipboard either way): the pickerAction setting.
        const action = settings.pickerAction;
        const inserted = action !== 'copy' && (await typeIntoPage(value));
        const copied = action !== 'insert' && (await copyText(value));
        const ok = inserted || copied;
        if (ok) MyConstantUsage.record(constant);
        status.textContent = inserted
          ? t('Inserted {symbol} = {value}', { symbol, value })
          : copied
            ? t('Copied {symbol} = {value}', { symbol, value })
            : action === 'insert'
              ? t('No text field to insert into')
              : t('Could not copy');
        if (!picker) return;
        clearTimeout(picker.closeTimer);
        if (settings.keepOpen) {
          // Stay open for the next one; just clear the message after a while.
          picker.closeTimer = setTimeout(() => (status.textContent = ''), 2000);
        } else if (ok) {
          picker.closeTimer = setTimeout(closePicker, inserted ? 350 : 700);
        }
      });
      grid.append(button);
    }
    panel.append(grid);
  }

  // --- Typing into the page ---------------------------------------------
  // <input> types that hold free text.
  const TEXT_INPUTS = ['text', 'search', 'url', 'tel', 'email', 'number', 'password'];

  /**
   * The text field the user is typing in, with the position of the text
   * cursor (or selection) in it — or null if they are not in one. The
   * picker leaves the focus in that field, but it is still noted when the
   * picker opens and again before a click in the coefficient box, which
   * does take the focus.
   */
  function editableTarget() {
    let node = document.activeElement;
    // Fields inside web components: follow the focus into (open) shadow roots.
    while (node?.shadowRoot?.activeElement) node = node.shadowRoot.activeElement;
    if (!node) return null;

    const isField =
      node instanceof HTMLTextAreaElement ||
      (node instanceof HTMLInputElement && TEXT_INPUTS.includes(node.type));
    if (isField) {
      if (node.readOnly || node.disabled) return null;
      let start = null;
      let end = null;
      try {
        // Some input types (number, email) do not expose their cursor.
        start = node.selectionStart;
        end = node.selectionEnd;
      } catch {}
      return { node, start, end, range: null };
    }
    if (node.isContentEditable) {
      // Rich-text editors: remember the selection itself.
      const selection = window.getSelection();
      const range = selection?.rangeCount ? selection.getRangeAt(0).cloneRange() : null;
      return { node, start: null, end: null, range };
    }
    return null;
  }

  // Google Docs draws its pages itself; what is typed goes to an empty
  // editable element in a hidden frame, which Docs only listens to. Text put
  // into that element with insertText never reaches the document.
  let ownEditor = false;
  try {
    ownEditor = Boolean(window.frameElement?.classList.contains('docs-texteventtarget-iframe'));
  } catch {} // a frame from another site may not look at its own element

  /**
   * Gives `text` to the page as a paste, without touching the clipboard.
   * Counts as done only if the page took the paste for itself.
   */
  function pasteInto(node, text) {
    try {
      const data = new DataTransfer();
      data.setData('text/plain', text);
      const paste = new ClipboardEvent('paste', { clipboardData: data, bubbles: true, cancelable: true });
      return !node.dispatchEvent(paste);
    } catch {
      return false;
    }
  }

  /** Types `text` at the remembered cursor, replacing any selection there. */
  function insertText(target, text) {
    const { node, start, end, range } = target;
    if (!node.isConnected) return false;
    node.focus({ preventScroll: true });
    if (range) {
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
    } else if (start !== null) {
      try {
        node.setSelectionRange(start, end);
      } catch {}
    }
    // insertText behaves like real typing: the page is told about it (so
    // sites built with React and the like notice) and Ctrl+Z undoes it.
    let ok = false;
    if (!ownEditor) {
      try {
        ok = document.execCommand('insertText', false, text);
      } catch {}
    }
    // Editors that draw the text themselves ignore or refuse the command
    // but do handle a paste, so hand them the text as one.
    if (!ok && node.isContentEditable) ok = pasteInto(node, text);
    if (!ok && !node.isContentEditable) {
      // Older way, for browsers where the command does not work in fields.
      try {
        const at = node.value.length;
        node.setRangeText(text, start ?? at, end ?? at, 'end');
        node.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertText', data: text }));
        ok = true;
      } catch {}
    }
    return ok;
  }

  /**
   * Types `text` where the user is working: the field that has the focus
   * now, else the one noted earlier, else (picker opened for a small frame)
   * the field in that frame. Resolves to whether it went in.
   */
  async function typeIntoPage(text) {
    if (!picker) return false;
    if (picker.fromFrame !== undefined) {
      try {
        const reply = await chrome.runtime.sendMessage({
          type: MSG_INSERT_TEXT,
          payload: { frameId: picker.fromFrame, text },
        });
        return Boolean(reply?.ok && reply.data?.inserted);
      } catch {
        return false;
      }
    }
    const target = editableTarget() ?? picker.target;
    return target ? insertText(target, text) : false;
  }

  function openPicker(fromFrame) {
    MyConstantI18n.setLanguage(settings.language);
    const target = editableTarget();
    const pinned = Array.isArray(settings.pinned) ? settings.pinned : [];
    const mine = Array.isArray(settings.myConstants) ? settings.myConstants : [];

    const host = document.createElement('div');
    const shadow = host.attachShadow({ mode: 'closed' });
    // A constructed stylesheet works even on pages whose security policy
    // blocks inline <style> elements. Firefox does not allow content
    // scripts to use one, so fall back to a <style> element there.
    try {
      const sheet = new CSSStyleSheet();
      sheet.replaceSync(PICKER_CSS);
      shadow.adoptedStyleSheets = [sheet];
    } catch {
      const style = document.createElement('style');
      style.textContent = PICKER_CSS;
      shadow.append(style);
    }

    const panel = el('div', 'panel');
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', t('MyConstant quick picker'));
    const status = el('p', 'status');
    status.setAttribute('role', 'status');

    // Coefficient box: with a number in it, a click gives that many times
    // the constant.
    coefficient = null;
    const row = el('label', 'coefficient');
    row.title = t('Type a number, then click a constant to copy it multiplied by that number.');
    const field = el('input');
    field.type = 'text';
    field.inputMode = 'decimal';
    field.autocomplete = 'off';
    field.placeholder = t('Coefficient (e.g. 2 or 1/2)');
    field.setAttribute('aria-label', field.placeholder);
    field.addEventListener('input', () => {
      const parsed = MyConstantFormat.parseCoefficient(field.value);
      field.setAttribute('aria-invalid', String(parsed === false));
      coefficient = parsed || null;
    });
    // Keep what is typed here away from the page's own keyboard shortcuts.
    for (const type of ['keydown', 'keypress', 'keyup']) {
      field.addEventListener(type, (event) => {
        if (event.key !== 'Escape') event.stopPropagation();
      });
    }
    row.append(el('span', '', '×'), field);
    panel.append(row);

    addSection(panel, 'Pinned', pinned, status);
    addSection(panel, 'My constants', mine, status);
    if (!pinned.length && !mine.length) {
      // Nothing of the user's own yet: say so, and instead of an empty
      // window offer the built-in constants they copy most — or, before
      // there is any history, the popular ones.
      panel.append(
        el(
          'p',
          'note',
          t(
            suggestions.personal
              ? 'You have no pinned or own constants yet. Here are the ones you use most.'
              : 'You have no pinned or own constants yet. Here are some popular ones.'
          )
        )
      );
      addSection(panel, suggestions.personal ? 'Most used' : 'Popular', suggestions.constants, status);
    }
    panel.append(status);
    // Clicking a constant must not pull the text cursor out of the page's
    // field: many pages close or submit a field that loses the focus.
    // Stopping the default action of mousedown does that; the click still
    // happens. The coefficient box is the exception, it has to be typed in.
    panel.addEventListener('mousedown', (event) => {
      if (event.target !== field) event.preventDefault();
    });
    shadow.append(panel);
    document.documentElement.append(host);

    // Open at the mouse pointer, nudged to stay fully inside the window.
    // Before the mouse has moved on this page, open near the top centre.
    const margin = 8;
    const { width, height } = panel.getBoundingClientRect();
    const at = pointer ?? { x: (window.innerWidth - width) / 2, y: 80 };
    const left = Math.max(margin, Math.min(at.x, window.innerWidth - width - margin));
    const top = Math.max(margin, Math.min(at.y, window.innerHeight - height - margin));
    panel.style.left = `${left}px`;
    panel.style.top = `${top}px`;

    picker = { host, previousFocus: document.activeElement, target, fromFrame, closeTimer: undefined };
    window.addEventListener('keydown', onPickerKeydown, true);
    window.addEventListener('pointerdown', onPickerPointerdown, true);

    // With no field to type into, focus the first constant so Tab / Enter
    // work straight away. Otherwise leave the text cursor where it is.
    if (!target && fromFrame === undefined) {
      shadow.querySelector('button')?.focus({ preventScroll: true });
    }
  }

  function closePicker() {
    if (!picker) return;
    const { host, previousFocus, closeTimer } = picker;
    picker = null;
    clearTimeout(closeTimer);
    window.removeEventListener('keydown', onPickerKeydown, true);
    window.removeEventListener('pointerdown', onPickerPointerdown, true);
    // If the focus is in the picker (its first constant, or the coefficient
    // box), put it back where it was before.
    const hadFocus = document.activeElement === host;
    host.remove();
    if (hadFocus && previousFocus?.isConnected) previousFocus.focus?.({ preventScroll: true });
  }

  function onPickerKeydown(event) {
    if (event.key !== 'Escape') return;
    event.preventDefault();
    event.stopPropagation();
    closePicker();
  }

  function onPickerPointerdown(event) {
    if (!picker) return;
    // Clicking anywhere outside the picker closes it.
    if (!event.composedPath().includes(picker.host)) return closePicker();
    // A click inside it: if the user has been typing in a field while the
    // picker stayed open, note where their text cursor is now (this runs
    // just before the click takes the focus away from the field).
    const current = editableTarget();
    if (current) picker.target = current;
  }

  async function copyText(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // navigator.clipboard is unavailable on non-HTTPS pages; fall back to
      // the older selection-based copy.
      const area = document.createElement('textarea');
      area.value = text;
      area.style.cssText = 'position:fixed;top:0;left:0;opacity:0;';
      document.documentElement.append(area);
      area.select();
      let ok = false;
      try {
        ok = document.execCommand('copy');
      } catch {}
      area.remove();
      return ok;
    }
  }
})();
