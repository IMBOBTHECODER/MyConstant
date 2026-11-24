// Usage
// -----------------------------------------
// Counts how often each built-in constant is copied, so the quick picker
// can offer a newcomer's most-used constants. Until there is some history
// it falls back to the ones marked `popular` in shared/constants.js.
//
// Counts live in chrome.storage.local (this device only, never synced or
// sent anywhere) under "usage": { "<symbol>|<value>": count }.
//
// This is a classic script, not a module, so the popup and the content
// script can both load it. It adds one global: MyConstantUsage.

(() => {
  // Symbol and full-length value together identify a built-in constant
  // (two constants share the symbol "G").
  const keyOf = (constant) => `${constant.symbol}|${constant.value}`;

  async function readCounts() {
    const { usage } = await chrome.storage.local.get({ usage: {} });
    return usage && typeof usage === 'object' ? usage : {};
  }

  globalThis.MyConstantUsage = {
    /** Adds one to a built-in constant's copy count. Other constants are ignored. */
    async record(constant) {
      if (!constant.builtin) return;
      try {
        const counts = await readCounts();
        const key = keyOf(constant);
        counts[key] = (counts[key] || 0) + 1;
        await chrome.storage.local.set({ usage: counts });
      } catch {
        // Counting is a nicety; never let it get in the way of copying.
      }
    },

    /**
     * The built-in constants to suggest, best first:
     * the most-copied ones (ties keep the list's own order), topped up with
     * the `popular` ones until there are `limit`.
     * Returns { constants, personal } — `personal` is true when at least one
     * of them is there because the user copied it.
     */
    async suggestions(categories, limit = 9) {
      const all = categories.flatMap((category) => category.constants);
      const counts = await readCounts().catch(() => ({}));
      const used = all
        .map((constant, order) => ({ constant, order, count: counts[keyOf(constant)] || 0 }))
        .filter((entry) => entry.count > 0)
        .sort((a, b) => b.count - a.count || a.order - b.order)
        .map((entry) => entry.constant);
      const filler = all.filter((constant) => constant.popular && !used.includes(constant));
      return {
        constants: [...used, ...filler].slice(0, limit).map((c) => ({ ...c, builtin: true })),
        personal: used.length > 0,
      };
    },
  };
})();
