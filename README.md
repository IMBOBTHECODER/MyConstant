<h1 align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="assets/readme/title-dark.svg">
    <img src="assets/readme/title-light.svg" alt="MyConstant" width="420">
  </picture>
</h1>

<p align="center">
  <img alt="Version 0.0.1" src="https://img.shields.io/badge/version-0.0.1-blue?style=for-the-badge">
  <a href="LICENSE"><img alt="Licence: GPL-3.0-or-later" src="https://img.shields.io/badge/licence-GPL--3.0--or--later-blue?style=for-the-badge"></a>
  <img alt="Manifest V3" src="https://img.shields.io/badge/manifest-V3-green?style=for-the-badge">
  <img alt="196 constants" src="https://img.shields.io/badge/constants-196-green?style=for-the-badge">
  <img alt="7 languages" src="https://img.shields.io/badge/languages-7-lightgrey?style=for-the-badge">
</p>

<!-- Replace MyConstant below if the repository gets a different name -->
<p align="center">
  <a href="https://github.com/IMBOBTHECODER/MyConstant/stargazers"><img alt="GitHub stars" src="https://img.shields.io/github/stars/IMBOBTHECODER/MyConstant?style=for-the-badge"></a>
  <a href="https://github.com/IMBOBTHECODER/MyConstant/forks"><img alt="GitHub forks" src="https://img.shields.io/github/forks/IMBOBTHECODER/MyConstant?style=for-the-badge"></a>
</p>

<p align="center">
  Tired of constantly switching tabs and finding constants for your research paper?
</p>

<p align="center">
  MyConstant is an easy option designed to help user access their favourite<br>
  constants with a click of a button
</p>

<p align="center">
  No build step, no dependencies, no network access. Just pure productivity.
</p>

## Contents

- [Features](#features)
- [Using it](#using-it)
- [Compatibility](#compatibility)
- [Privacy and permissions](#privacy-and-permissions)
- [Licence](#licence)
- [Contact](#contact)
- [Reference](#reference)

## Features

- **196 built-in constants** in five categories: mathematical, physical,
  chemistry, astronomical and unit conversions. The 44 most used are in the
  popup to begin with; the rest are in the library, where you choose what
  the popup shows (one by one, or with a preset such as Physics or
  Chemistry).
- **Your own constants**: add, edit and remove them; names can be written
  in LaTeX (`m_e`, `\frac{h}{2\pi}`). Removed ones go to a bin for 30 days, where they can
  be restored or deleted straight away.
- **Pinned** constants stay at the top of the popup.
- **Quick picker**: a small window at the mouse pointer on any page, opened
  with a keyboard shortcut (Alt+C by default, Control+C on a Mac) or from
  the right-click menu. Clicking a constant types it into the text field
  you were in and copies it.
- **Coefficient**: type `2` or `1/2`, then click a constant to get that
  many times its value, worked out exactly.
- **Formatting**: decimal places (0–30), normal or scientific notation, and
  any number base from 2 to 36.
- **Search** by symbol, name or value, forgiving of typos ("plnck").
- **Backup** to a file and restore from it.
- Seven languages, switchable while running: English, Tiếng Việt, Español,
  Français, Deutsch, 中文（简体） and 日本語.

## Using it

**Popup.** Click the toolbar icon, then click a constant to copy it. Hover
a constant for the pin button; hover one of your own for edit and remove.
**+ Add** creates your own constant. The gear opens the settings.

**Coefficient.** Type a number in the box marked × (`2`, `0.5`, `1/2`,
`-3`), then click a constant. There is no separate π/2 entry: type `1/2`
and click π.

**Quick picker.** On any web page press **Alt+C** (Mac: **Control+C**), or
right-click and choose **MyConstant: open quick picker**. It lists your
pinned and own constants; with none yet, it suggests the built-ins you copy
most. Clicking one types it into the field your cursor was in and copies
it. It stays open until you press the shortcut again, press Escape or click
outside it (this can be changed in the settings). It cannot open on the
browser's own pages, such as the new tab page or settings.

**Library.** Press **+ More constants…** at the bottom of the popup. Click
a constant to add it to the popup or take it out, or pick a preset:

| Group      | Presets                                                    |
|------------|------------------------------------------------------------|
| Essentials | Light (12), Medium (29), All (44, what you start with)     |
| Subjects   | Mathematics, Physics, Chemistry, Astronomy, Engineering    |
|            | Everything (all 196)                                       |

**Settings.** In the popup: language, on/off, decimal places, notation, the
shortcut, whether the picker stays open, and what a click in it does
(insert and copy, insert only, or copy only). When recording a shortcut,
combinations the browser reserves are refused, and well-known ones (Ctrl+C,
Ctrl+V, ...) need a second press to confirm. **Advanced settings** has the
number base, reset to defaults, and backup (export to / import from a
file).

## Compatibility

One codebase, no per-browser builds.

| Browser                                   | Status                                   |
|-------------------------------------------|------------------------------------------|
| Chrome, Edge, Brave, Opera, Vivaldi, Arc  | Supported                                |
| Firefox 128+ (desktop)                    | Supported                                |
| Safari                                    | Needs converting with Apple's Xcode tool |

Written for Windows, macOS and Linux; tested on Windows only so far.
Shortcuts are stored by physical key, so they behave the same on every
keyboard layout; modifier keys are shown with the local names (Option / Cmd
on a Mac).

## Privacy and permissions

The extension makes no network requests and collects nothing. Your
constants, pins, selection and settings are kept in the browser's sync
storage; how often you copy each constant (used for quick-picker
suggestions) stays on the device.

| Permission          | Why                                                          |
|---------------------|--------------------------------------------------------------|
| `storage`           | Saving your constants and settings                           |
| `contextMenus`      | The right-click entry that opens the quick picker            |
| `scripting`         | Putting the quick picker into tabs already open at install or update, so they work without a refresh |
| Access to all sites | The quick picker is meant to work on whatever page you are on |

On pages, the extension only listens for the shortcut and writes the
constant you clicked into the field you were in. It does not read page
content or the clipboard.

## Licence

Copyright (C) 2026 MyConstant contributors

MyConstant is free software: you can redistribute it and/or modify it
under the terms of the GNU General Public License as published by the Free
Software Foundation, either version 3 of the License, or (at your option)
any later version. It is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. The full text is in
[LICENSE](LICENSE).

## Contact

- **Bugs, wrong values and requests for a constant**:
  [open an issue](https://github.com/IMBOBTHECODER/MyConstant/issues).
  For a wrong value, please include the source you checked it against.
- **Anything else**: [@IMBOBTHECODER](https://github.com/IMBOBTHECODER) on
  GitHub.

## Reference

- Physical and chemistry constants:
  [NIST, 2022 CODATA adjustment](https://physics.nist.gov/cuu/Constants/),
  in SI units. The unit is in each constant's name.
- Mathematical constants: stored to 30 decimal places. The digits can be
  checked against the [OEIS](https://oeis.org/), for example
  [π (A000796)](https://oeis.org/A000796).
- Unit conversions: computed from the exact definitions, as listed in the
  [NIST Guide to the SI, Appendix B](https://www.nist.gov/pml/special-publication-811/nist-guide-si-appendix-b-conversion-factors).
- Astronomical values:
  [NASA planetary fact sheets](https://nssdc.gsfc.nasa.gov/planetary/factsheet/)
  and the
  [IAU 2015 nominal values (Resolution B3)](https://arxiv.org/abs/1510.07674).

Measured constants are never padded: asking for more decimal places than
are known gives only the known digits.