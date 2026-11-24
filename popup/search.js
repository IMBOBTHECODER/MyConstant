// Search with simple spelling correction
// -----------------------------------------
// Two passes. First an exact pass: the query must appear somewhere in the
// constant's symbol, name or value. Only if that finds nothing at all does
// the popup fall back to the forgiving pass, which tolerates typos:
// "plnck" finds Planck, "bolzman" finds Boltzmann, "avagadro" finds Avogadro.

/**
 * Edit distance between two words: the number of single-character
 * insertions, deletions, substitutions or swaps of neighbouring characters
 * needed to turn one into the other.
 */
export function editDistance(a, b) {
  const rows = a.length + 1;
  const cols = b.length + 1;
  const d = Array.from({ length: rows }, (_, i) => [i, ...new Array(cols - 1).fill(0)]);
  for (let j = 0; j < cols; j++) d[0][j] = j;

  for (let i = 1; i < rows; i++) {
    for (let j = 1; j < cols; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost);
      // two neighbouring characters typed in the wrong order
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
      }
    }
  }
  return d[rows - 1][cols - 1];
}

const words = (text) => text.toLowerCase().split(/[^\p{L}\p{N}]+/u).filter(Boolean);

/** Exact pass: the whole query appears in one of the texts. */
export function matchesExactly(texts, query) {
  const q = query.trim().toLowerCase();
  return texts.some((text) => text && text.toLowerCase().includes(q));
}

/** How many typos to forgive in a word of this length. */
function allowedTypos(word) {
  if (word.length < 3) return 0; // too short to guess at
  return word.length < 6 ? 1 : 2;
}

/** True if `typed` is `word` (or the start of it) give or take a few typos. */
function isCloseTo(typed, word) {
  const allowed = allowedTypos(typed);
  if (allowed === 0) return false;
  if (editDistance(typed, word) <= allowed) return true;
  // The user may still be typing the word: compare with its beginning, of
  // about the same length as what has been typed so far.
  for (const length of [typed.length - 1, typed.length, typed.length + 1]) {
    if (length >= 3 && length < word.length && editDistance(typed, word.slice(0, length)) <= allowed) {
      return true;
    }
  }
  return false;
}

/**
 * Forgiving pass: every word of the query must either appear in the texts
 * or be a near miss of one of their words.
 */
export function matchesLoosely(texts, query) {
  const present = texts.filter(Boolean);
  const targetWords = present.flatMap(words);
  const queryWords = words(query);
  if (!queryWords.length) return false;
  return queryWords.every(
    (typed) =>
      present.some((text) => text.toLowerCase().includes(typed)) ||
      targetWords.some((word) => isCloseTo(typed, word))
  );
}
