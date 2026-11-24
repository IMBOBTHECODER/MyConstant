// Tiny LaTeX renderer
// -----------------------------------------
// Turns a small subset of LaTeX maths into MathML, which browsers draw
// natively (proper fractions, roots, sub- and superscripts) — no library,
// no fonts to ship, and it works inside the quick picker too.
//
// This is a classic script, not a module, so the popup and the content
// script can both load it. It adds one global: MyConstantLatex.
//
// Supported:
//   \frac{a}{b}   \sqrt{x}   \sqrt[3]{x}   x^2   x_0   x_a^b   { groups }
//   Greek letters (\pi \alpha \varepsilon ...), \hbar \infty \to \circ
//   \odot \oplus (sun, Earth)
//   \times \cdot \pm, function names (\ln \log \sin ...),
//   \mathrm{upright}  \text{plain words}  \, (thin space)
// Anything else is shown as plain text rather than failing.

(() => {
  const NS = 'http://www.w3.org/1998/Math/MathML';

  const GREEK = {
    alpha: 'α', beta: 'β', gamma: 'γ', delta: 'δ', epsilon: 'ϵ', varepsilon: 'ε',
    zeta: 'ζ', eta: 'η', theta: 'θ', vartheta: 'ϑ', iota: 'ι', kappa: 'κ',
    lambda: 'λ', mu: 'μ', nu: 'ν', xi: 'ξ', pi: 'π', rho: 'ρ', sigma: 'σ',
    tau: 'τ', upsilon: 'υ', phi: 'ϕ', varphi: 'φ', chi: 'χ', psi: 'ψ', omega: 'ω',
    Gamma: 'Γ', Delta: 'Δ', Theta: 'Θ', Lambda: 'Λ', Xi: 'Ξ', Pi: 'Π',
    Sigma: 'Σ', Phi: 'Φ', Psi: 'Ψ', Omega: 'Ω',
  };
  // name -> [MathML tag, character]
  const SYMBOLS = {
    hbar: ['mi', 'ℏ'], infty: ['mi', '∞'], ell: ['mi', 'ℓ'], partial: ['mi', '∂'],
    to: ['mo', '→'], rightarrow: ['mo', '→'], circ: ['mo', '∘'], degree: ['mi', '°'],
    times: ['mo', '×'], cdot: ['mo', '⋅'], pm: ['mo', '±'], approx: ['mo', '≈'],
    le: ['mo', '≤'], ge: ['mo', '≥'], ne: ['mo', '≠'],
    odot: ['mi', '⊙'], oplus: ['mi', '⊕'],
  };
  const FUNCTIONS = ['ln', 'log', 'lg', 'exp', 'sin', 'cos', 'tan', 'min', 'max'];
  const SPACES = { ',': '0.17em', ':': '0.22em', ';': '0.28em', ' ': '0.28em', quad: '1em' };

  function node(tag, content, attributes) {
    const el = document.createElementNS(NS, tag);
    if (typeof content === 'string') el.textContent = content;
    else if (content) el.append(...content);
    for (const [name, value] of Object.entries(attributes || {})) el.setAttribute(name, value);
    return el;
  }

  /** Wraps several nodes in an <mrow>; a single node is returned as is. */
  const group = (nodes) => (nodes.length === 1 ? nodes[0] : node('mrow', nodes));

  function parse(source) {
    let i = 0;
    const peek = () => source[i];
    const skipSpaces = () => {
      while (source[i] === ' ') i++;
    };

    /** Reads `\name` (letters) or a one-character command such as `\,`. */
    function readCommand() {
      i++; // the backslash
      const start = i;
      while (i < source.length && /[A-Za-z]/.test(source[i])) i++;
      if (i === start) i++; // one-character command
      return source.slice(start, i);
    }

    /** Reads the raw text inside `{...}`, e.g. for \mathrm{atm}. */
    function readRawGroup() {
      skipSpaces();
      if (peek() !== '{') throw new Error('expected {');
      const end = source.indexOf('}', i);
      if (end === -1) throw new Error('missing }');
      const text = source.slice(i + 1, end);
      i = end + 1;
      return text;
    }

    /** One argument: a `{group}` or a single item. */
    function parseArgument() {
      skipSpaces();
      if (i >= source.length) throw new Error('missing argument');
      return parseAtom(true);
    }

    /** Returns { el, isFunction } for the next item. */
    function parseAtom(single) {
      skipSpaces();
      const ch = peek();

      if (ch === '{') {
        i++;
        const row = parseRow('}');
        if (peek() !== '}') throw new Error('missing }');
        i++;
        return { el: group(row) };
      }

      if (ch === '\\') {
        const name = readCommand();
        if (name === 'frac') {
          const top = parseArgument().el;
          const bottom = parseArgument().el;
          return { el: node('mfrac', [top, bottom]) };
        }
        if (name === 'sqrt') {
          skipSpaces();
          let index = null;
          if (peek() === '[') {
            i++;
            index = group(parseRow(']'));
            if (peek() !== ']') throw new Error('missing ]');
            i++;
          }
          const body = parseArgument().el;
          return { el: index ? node('mroot', [body, index]) : node('msqrt', [body]) };
        }
        if (name === 'mathrm' || name === 'operatorname') {
          return { el: node('mi', readRawGroup(), { mathvariant: 'normal' }) };
        }
        if (name === 'text') return { el: node('mtext', readRawGroup()) };
        if (name in SPACES) return { el: node('mspace', null, { width: SPACES[name] }) };
        if (name in GREEK) return { el: node('mi', GREEK[name]) };
        if (name in SYMBOLS) return { el: node(SYMBOLS[name][0], SYMBOLS[name][1]) };
        if (FUNCTIONS.includes(name)) return { el: node('mi', name), isFunction: true };
        return { el: node('mtext', name) }; // unknown command: show its name
      }

      if (/[0-9]/.test(ch)) {
        const start = i;
        i++;
        // "3.14" is one number — but an argument such as the 1 in \frac12
        // is a single digit.
        if (!single) while (i < source.length && /[0-9.]/.test(source[i])) i++;
        return { el: node('mn', source.slice(start, i)) };
      }

      i++;
      if (/\p{L}/u.test(ch)) return { el: node('mi', ch) };
      return { el: node('mo', ch) };
    }

    /** Parses items up to `closer` (or the end), attaching ^ and _ scripts. */
    function parseRow(closer) {
      const row = [];
      for (;;) {
        skipSpaces();
        if (i >= source.length || peek() === closer) return row;
        if (peek() === '}' || peek() === ']') throw new Error(`unexpected ${peek()}`);

        // A script with nothing before it (as in {}^\circ) hangs off an
        // empty base.
        let atom = peek() === '^' || peek() === '_' ? { el: node('mrow') } : parseAtom(false);

        let sub = null;
        let sup = null;
        for (;;) {
          skipSpaces();
          if (peek() === '^' && !sup) {
            i++;
            sup = parseArgument().el;
          } else if (peek() === '_' && !sub) {
            i++;
            sub = parseArgument().el;
          } else break;
        }
        let el = atom.el;
        if (sub && sup) el = node('msubsup', [el, sub, sup]);
        else if (sub) el = node('msub', [el, sub]);
        else if (sup) el = node('msup', [el, sup]);
        row.push(el);

        // "ln 2", not "ln2": a little space after a function name.
        skipSpaces();
        if (atom.isFunction && i < source.length && peek() !== closer) {
          row.push(node('mspace', null, { width: '0.17em' }));
        }
      }
    }

    const row = parseRow(undefined);
    if (!row.length) throw new Error('empty');
    return node('math', row);
  }

  globalThis.MyConstantLatex = {
    /** Returns a <math> element for the LaTeX source; throws if it is malformed. */
    render: parse,

    /** True if text uses LaTeX syntax (as opposed to being a plain name). */
    looksLikeLatex: (text) => /[\\^_{]/.test(text),

    /**
     * The label for a constant's button: its `latex` drawn as maths when
     * there is one (or when a user-typed name is written in LaTeX), and
     * the plain symbol otherwise or if the LaTeX cannot be read.
     */
    label(constant) {
      const source =
        constant.latex ||
        (!constant.builtin && this.looksLikeLatex(constant.symbol) ? constant.symbol : null);
      if (source) {
        try {
          return parse(source);
        } catch {}
      }
      return document.createTextNode(constant.symbol);
    },
  };
})();
