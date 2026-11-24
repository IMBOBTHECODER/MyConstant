// Number formatting
// -----------------------------------------
// Built-in constants are stored as full-length decimal text. This file turns
// that text into what is shown and copied, according to three settings:
//   precision  digits kept after the point (cut off, never rounded or padded)
//   notation   'normal' or 'scientific'
//   base       number base, 2 to 36 (10 = ordinary decimal)
// It also multiplies a value by a coefficient the user types (see the end).
// Everything works on the digits themselves (text and whole-number
// arithmetic), so nothing is lost to floating-point rounding.
//
// This is a classic script, not a module, so the popup, the options page
// and the content script can all load it. It adds one global: MyConstantFormat.

(() => {
  const MIN_PRECISION = 0;
  const MAX_PRECISION = 30;
  const DEFAULT_PRECISION = 8;
  const MIN_BASE = 2;
  const MAX_BASE = 36;

  /** Coerces any input to a whole number of places within range. */
  function clampPrecision(value) {
    if (!Number.isFinite(value)) return DEFAULT_PRECISION;
    return Math.min(MAX_PRECISION, Math.max(MIN_PRECISION, Math.trunc(value)));
  }

  /** Coerces any input to a valid base; anything unusable becomes 10. */
  function clampBase(value) {
    if (!Number.isFinite(value)) return 10;
    return Math.min(MAX_BASE, Math.max(MIN_BASE, Math.trunc(value)));
  }

  /**
   * Cuts decimal text to at most `places` digits after the point:
   *   applyPrecision('3.14159265358979', 4)  -> '3.1415'
   *   applyPrecision('6.62607015e-34', 3)    -> '6.626e-34'  (exponent kept)
   *   applyPrecision('299792458', 3)         -> '299792458'  (no decimals)
   *   applyPrecision('9.80665', 8)           -> '9.80665'    (never padded)
   */
  function applyPrecision(value, places) {
    const n = clampPrecision(places);
    const [mantissa, exponent] = String(value).split('e');
    const dot = mantissa.indexOf('.');
    if (dot === -1) return String(value);
    const cut = n === 0 ? mantissa.slice(0, dot) : mantissa.slice(0, dot + 1 + n);
    return exponent === undefined ? cut : `${cut}e${exponent}`;
  }

  /**
   * Rewrites decimal text in scientific notation, one digit before the
   * point, without changing any of its digits:
   *   toScientific('299792458')       -> '2.99792458e8'
   *   toScientific('0.0174532925')    -> '1.74532925e-2'
   *   toScientific('6.62607015e-34')  -> '6.62607015e-34'
   */
  function toScientific(value) {
    const [mantissa, exponentText] = String(value).split('e');
    const dot = mantissa.indexOf('.');
    const digits = mantissa.replace('.', '');
    const integerLength = dot === -1 ? mantissa.length : dot;
    const first = digits.search(/[1-9]/);
    if (first === -1) return String(value); // zero: nothing to normalise
    const exponent = Number(exponentText ?? 0) + integerLength - 1 - first;
    const rest = digits.slice(first + 1);
    return `${digits[first]}${rest ? `.${rest}` : ''}e${exponent}`;
  }

  // --- other bases -----------------------------------------------------

  /** Decimal text -> exact fraction { num, den } (BigInt), plus digit count. */
  function toFraction(value) {
    const [mantissa, exponentText] = String(value).split('e');
    const dot = mantissa.indexOf('.');
    const digits = mantissa.replace('.', '');
    const decimals = dot === -1 ? 0 : mantissa.length - dot - 1;
    const scale = Number(exponentText ?? 0) - decimals; // value = digits × 10^scale
    const n = BigInt(digits);
    return {
      num: scale >= 0 ? n * 10n ** BigInt(scale) : n,
      den: scale >= 0 ? 1n : 10n ** BigInt(-scale),
      // How many meaningful decimal digits the stored value has.
      significant: digits.replace(/^0+/, '').length,
    };
  }

  /**
   * Writes the fraction num/den in `base` with up to `places` digits after
   * the point. Digits above 9 are the letters A-Z.
   *
   * `maxSignificant` stops the fractional part once that many meaningful
   * digits have been written: a value known to 9 decimal digits is only
   * good for about 7 hexadecimal ones, and anything further would be
   * invented. The whole-number part is always written in full.
   */
  function writeInBase(num, den, base, places, maxSignificant) {
    const b = BigInt(base);
    const whole = num / den;
    let rest = num % den;
    const wholeText = whole.toString(base).toUpperCase();
    let significant = whole === 0n ? 0 : wholeText.length;
    let fraction = '';
    while (fraction.length < places && rest !== 0n && significant < maxSignificant) {
      rest *= b;
      const digit = rest / den;
      rest %= den;
      fraction += digit.toString(base).toUpperCase();
      if (significant > 0 || digit !== 0n) significant++;
    }
    return fraction ? `${wholeText}.${fraction}` : wholeText;
  }

  /**
   * Decimal text -> text in another base.
   *   toBase('255', 16, 8, false)            -> 'FF'
   *   toBase('3.14159265358979', 16, 4)      -> '3.243F'
   *   toBase('0.5', 2, 8)                    -> '0.1'
   * With `scientific`, one digit before the point and the exponent written
   * as a power of the base (in ordinary decimal, since "e" is itself a
   * digit in bases above 14):
   *   toBase('255', 16, 8, true)             -> 'F.F×16^1'
   */
  function toBase(value, base, places, scientific) {
    let { num, den, significant } = toFraction(value);
    if (num === 0n) return '0';
    const b = BigInt(base);
    // Meaningful digits available in this base (at least one).
    const maxSignificant = Math.max(1, Math.floor((significant * Math.log(10)) / Math.log(base)));
    if (!scientific) return writeInBase(num, den, base, places, maxSignificant);

    // Find n with base^n <= value < base^(n+1), then divide it out.
    let exponent = 0;
    while (num >= den * b) {
      den *= b;
      exponent++;
    }
    while (num < den) {
      num *= b;
      exponent--;
    }
    return `${writeInBase(num, den, base, places, maxSignificant)}×${base}^${exponent}`;
  }

  /**
   * The text shown and copied for a built-in constant.
   * Base 10:
   *   'normal'      the value as stored (very large or small physical
   *                 constants are stored with an exponent and keep it)
   *   'scientific'  every value as d.ddd e n
   * Other bases: the same idea — plain positional digits, or the
   * "digit.digits × base^n" form for scientific notation and for values
   * stored with an exponent (which would otherwise be a long row of zeros).
   */
  function formatValue(value, settings) {
    // A minus sign (from a negative coefficient) sits out the formatting.
    if (String(value).startsWith('-')) return `-${formatValue(String(value).slice(1), settings)}`;
    const places = clampPrecision(settings?.precision);
    const base = clampBase(settings?.base ?? 10);
    const scientific = settings?.notation === 'scientific';
    const text = String(value);
    if (base === 10) return applyPrecision(scientific ? toScientific(text) : text, places);
    try {
      return toBase(text, base, places, scientific || text.includes('e'));
    } catch {
      return applyPrecision(text, places); // not a plain number: leave it be
    }
  }

  // --- coefficient -------------------------------------------------------
  // "2", "0.5", "1/2", "-3", "1e3", "2.5/4": a number, optionally divided
  // by another.
  const NUMBER = String.raw`(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?`;
  const COEFFICIENT = new RegExp(String.raw`^([+-]?)\s*(${NUMBER})(?:\s*/\s*(${NUMBER}))?$`, 'i');
  const PLAIN_NUMBER = new RegExp(`^(-?)(${NUMBER})$`, 'i');

  /**
   * Reads what was typed in a coefficient box.
   *   null   nothing typed, or exactly 1: no coefficient
   *   false  not a usable number
   *   { num, den, negative, text }  an exact fraction, and the text as typed
   */
  function parseCoefficient(input) {
    const text = String(input ?? '').trim();
    if (!text) return null;
    const match = COEFFICIENT.exec(text);
    if (!match) return false;
    const top = toFraction(match[2].toLowerCase());
    const bottom = match[3] ? toFraction(match[3].toLowerCase()) : { num: 1n, den: 1n };
    if (bottom.num === 0n) return false; // dividing by zero
    const num = top.num * bottom.den;
    const den = top.den * bottom.num;
    const negative = match[1] === '-' && num !== 0n;
    if (num === den && !negative) return null;
    return { num, den, negative, text };
  }

  /**
   * Decimal text × coefficient -> decimal text, worked out exactly on the
   * digits. Returns null if `value` is not a plain number (one of the
   * user's own constants can hold any text).
   *   multiply('3.14159265', parseCoefficient('2'))    -> '6.2831853'
   *   multiply('6.62607015e-34', parseCoefficient('1/2')) -> '3.313035075e-34'
   * A product that comes out even is written in full. One that never ends
   * (a third of something) is cut to as many digits as the value itself
   * has, or `minDigits` if that is more: any further would be invented.
   */
  function multiply(value, coefficient, minDigits = 0) {
    const match = PLAIN_NUMBER.exec(String(value).trim());
    if (!match) return null;
    const v = toFraction(match[2].toLowerCase());
    const num = v.num * coefficient.num;
    if (num === 0n) return '0';
    const sign = (match[1] === '-') !== coefficient.negative ? '-' : '';

    // Scale so that 1 <= n/d < 10; `exponent` is the power of ten taken out.
    let n = num;
    let d = v.den * coefficient.den;
    let exponent = 0;
    while (n >= d * 10n) {
      d *= 10n;
      exponent++;
    }
    while (n < d) {
      n *= 10n;
      exponent--;
    }

    // Long division, one digit at a time, until it comes out even.
    let digits = '';
    while (digits.length < 80) {
      digits += (n / d).toString();
      n = (n % d) * 10n;
      if (n === 0n) break;
    }
    const withExponent = /e/i.test(match[2]);
    if (n !== 0n) {
      const wholePart = withExponent ? 1 : Math.max(1, exponent + 1);
      digits = digits.slice(0, Math.max(v.significant, minDigits, wholePart));
    }
    digits = digits.replace(/0+$/, '');

    if (withExponent) {
      return `${sign}${digits[0]}${digits.length > 1 ? `.${digits.slice(1)}` : ''}e${exponent}`;
    }
    if (exponent < 0) return `${sign}0.${'0'.repeat(-exponent - 1)}${digits}`;
    const whole = digits.slice(0, exponent + 1).padEnd(exponent + 1, '0');
    const fraction = digits.slice(exponent + 1);
    return `${sign}${whole}${fraction ? `.${fraction}` : ''}`;
  }

  /**
   * What is shown and copied for a constant, optionally times a coefficient
   * (from parseCoefficient). Built-in constants follow the precision,
   * notation and base settings; the user's own are left as they wrote them.
   * Returns { text, scaled }: `scaled` is false when there was no coefficient
   * or the value is not a number it could apply to.
   */
  function shown(constant, settings, coefficient) {
    const product = coefficient ? multiply(constant.value, coefficient, constant.builtin ? 0 : 15) : null;
    const value = product ?? constant.value;
    return {
      text: constant.builtin ? formatValue(value, settings) : value,
      scaled: product !== null,
    };
  }

  globalThis.MyConstantFormat = {
    parseCoefficient,
    multiply,
    shown,
    MIN_PRECISION,
    MAX_PRECISION,
    DEFAULT_PRECISION,
    MIN_BASE,
    MAX_BASE,
    clampPrecision,
    clampBase,
    applyPrecision,
    toScientific,
    toBase,
    formatValue,
  };
})();
