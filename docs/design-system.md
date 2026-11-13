# Component and typography decisions

Reviewed against the project's pinned shadcn CLI 4.22.1, Base UI 1.9.0 and current official component documentation. The site keeps its selected appearance and its JavaScript-free guide.

## Components

| Surface                                        | Decision                                                             | Reason                                                                                                                                                                                                 |
| ---------------------------------------------- | -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Playback actions                               | Keep the Base UI Button wrapper and CVA variants                     | It provides native action behavior, accessible names and shared focus/hover states. The 44-pixel icon size belongs to the component.                                                                   |
| Install/download navigation                    | Keep native anchors with buttonVariants                              | Links retain document/fragment behavior without button keyboard interception. Header size is an explicit variant. Icons beside labels use data-icon.                                                   |
| Keyboard illustration                          | Keep semantic kbd markup and the existing composed key visualization | The diagram includes per-beat lighting and two workspace banks. The standard Kbd component is a small textual keycap; adding it would not replace the diagram's layout or playback responsibilities.   |
| Window interiors                               | Keep the static local Skeleton variants                              | These convey window identity inside a decorative illustration, rather than announcing loading or pulsing.                                                                                              |
| Guide prose                                    | Use shadcn Typeset                                                   | It styles ordinary semantic HTML and requires only CSS. A small preset owns the guide's type size, leading, flow and fonts.                                                                            |
| Shortcut/reference tables and definition lists | Keep semantic table/dl markup with data-not-typeset                  | Their responsive table/list switch, reference separators and reading order are deliberate. Typeset's opt-out prevents competing element rules.                                                         |
| Command examples                               | Keep pre/code and language metadata                                  | These stay selectable, wrap at narrow widths, work without JavaScript and are syntax checked. The interactive Code Block's header/copy/highlighting features are not needed for this static reference. |
| Movement-row and reference separators          | Keep CSS borders                                                     | They belong to the rows' visual grouping and do not introduce independent separator controls.                                                                                                          |

New interactive components should come from the existing Base UI shadcn setup when their behavior fits. Do not add component wrappers solely to replace already-semantic static markup. Size and appearance belong in variants; page CSS owns placement.

## Typeset source and preset

Source: [official Typeset stylesheet](<https://github.com/shadcn-ui/ui/blob/4233ed1caded8c38f4bc14b14afe1f93ebcaf966/apps/v4/app/(app)/(typeset)/typeset.css>), pinned to `4233ed1caded8c38f4bc14b14afe1f93ebcaf966`. The local copy is formatted with Oxfmt; its behavior is unchanged. Its MIT license ships at `/licenses/shadcn-ui.txt`.

`src/styles/typeset.css` is imported after Tailwind. The guide article uses `typeset typeset-docs`. The Frame preset in `src/styles/guide.css` uses the existing Geist/mono theme fonts, 17-pixel desktop text, slightly larger mobile text, 1.75 leading and a 1.25em flow. Guide heading scale, chapter spacing, links, wrapped command blocks and responsive reference layouts remain product styles. Opt-outs cover the command index, shortcut table/list, settings definitions and workspace figure.

Keep upstream updates explicit: review the newer source, replace the owned stylesheet, update the pinned revision/notice, and rerun CSS, responsive, accessibility and no-JavaScript checks. Put Frame adjustments in the preset, not inside upstream element rules.

## CSS checks

Oxlint/shadcn covers component and Tailwind usage. Stylelint 18.0.0 covers source CSS: duplicates, unknown properties/units/at-rules, invalid hex colors and accidental shorthand overrides. The only nonstandard at-rule currently allowed is Tailwind's theme directive. Formatting remains with Oxfmt.

The site, homepage and guide style owners use color tokens. The root palette defines those values, while demo illustration code retains its intentional lighting/window palette. Typeset's upstream defaults are kept intact. Tests verify that invalid authored CSS fails, responsive overrides work, and the palette/artwork scopes stay available.

## Social card

The 1200 × 630 card is a dedicated composition, rather than a homepage screenshot. It uses the existing Geist font, Frame icon, matte monitor hardware, wallpaper and blue backdrop. A larger two-line title establishes the product category, with “Keyboard-first · Vim-inspired” beneath it. The left monitor shows a tall window beside two stacked rows, with slightly unequal row heights. The right monitor has a wide focused editor and a narrower full-height window. The distinct window counts and proportions show column/row tiling without a mirrored arrangement. Navigation, workspace numbers, playback controls, action captions and the shortcut ladder are omitted at this scale.

Editable source lives in scripts/social-card.html and scripts/social-card.css. Run npm run assets:social with the pinned Chromium browser available to regenerate public/social-card.png. The renderer serves only its explicit local resource map, waits for fonts/images, rejects failed resource loads, and checks the output dimensions and size. The template and renderer are not shipped. Production builds use the committed PNG and do not need a browser. CSS lint covers the asset stylesheet as well as src styles.

Inspect the full-size image and a 600 × 315 preview after editing. Keep the Open Graph/Twitter image descriptions in both HTML entries aligned with the artwork. Artifact tests verify the served PNG against its declared metadata.

## Primary references

- [Typeset](https://ui.shadcn.com/docs/typeset)
- [Button](https://ui.shadcn.com/docs/components/base/button)
- [Kbd](https://ui.shadcn.com/docs/components/base/kbd)
- [Skeleton](https://ui.shadcn.com/docs/components/base/skeleton)
- [Table](https://ui.shadcn.com/docs/components/base/table)
- [Code Block](https://ui.shadcn.com/docs/components/base/code-block)
- [Stylelint rules](https://stylelint.io/user-guide/rules/)
