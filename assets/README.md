# Assets

Every image the extension uses lives here. Replace a file (keeping its
name) and reload the extension to change how it looks — no code changes.

## `app/` — the extension's own icon

PNG files referenced from `manifest.json`. These are placeholders.

| File          | Size    | Shown in                               |
|---------------|---------|----------------------------------------|
| `icon16.png`  | 16×16   | Browser toolbar                        |
| `icon48.png`  | 48×48   | Extensions management page             |
| `icon128.png` | 128×128 | Installation dialog / store listing    |

`icon16.original.webp` is the file that was originally named
`icon16.png`; it is unused and safe to delete.

## `readme/` — the title in the project README

`title-light.svg` and `title-dark.svg`: the name "MyConstant" drawn in a
bold monospace font, one for each colour scheme. The extension does not use them.

## `icons/` — icons inside the popup

SVG files, wired up at the "Icons" block near the top of `popup/popup.css`.

| File           | Used for                         |
|----------------|----------------------------------|
| `settings.svg` | Settings button (top right)      |
| `pin.svg`      | Pin / unpin a constant           |
| `x.svg`        | Remove one of your own constants |
| `pencil.svg`   | Edit one of your own constants   |
| `trash-2.svg`  | Opens the bin (removed constants) |

All five are unmodified icons from Lucide (https://lucide.dev, ISC
license), saved under their Lucide names.

How they are drawn: each SVG is used as a *mask*, and the colour comes
from CSS. So only the shape in the file matters — any colour inside the
SVG is ignored, and the icons follow light and dark mode automatically.

To add an icon:

1. Save the SVG here, e.g. `star.svg` (copy it from https://lucide.dev and keep its Lucide name)
2. Add a rule next to the others in `popup/popup.css`:
   `.icon-star { -webkit-mask-image: url('../assets/icons/star.svg'); mask-image: url('../assets/icons/star.svg'); }`
3. Use it in HTML: `<span class="icon icon-star"></span>`
