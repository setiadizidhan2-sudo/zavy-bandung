# Design Brief

## Direction

**AFTERHOURS** — a black-stage concert poster that happens to be a ticket store: oversized type, one electric beam of blue cutting through cyan haze, everything else receding into the dark.

## Tone

Cinematic nightlife maximalism executed with editorial discipline — the venue at 19:00, doors open, lights down; loud only where it matters, silent everywhere else.

## Differentiation

The hero is treated as a lit stage: a giant display wordmark with a cyan spotlight bleeding up from the bottom edge, sitting on glass panels that read like backlit acrylic signage — no card grid, no SaaS chrome.

## Color Palette

| Token      | OKLCH        | Role                                              |
| ---------- | ------------ | ------------------------------------------------- |
| background | 0.09 0.004 265 | Night base, near-black with a cold violet cast  |
| foreground | 0.97 0.004 250 | Primary type — white light on black             |
| card       | 0.13 0.006 265 | Raised surface for info blocks and ticket tiers |
| primary    | 0.58 0.2 258   | Electric blue — CTAs, active states, focus      |
| accent     | 0.85 0.13 205  | Cyan — highlights, glow, QR frame, price marks  |
| muted      | 0.19 0.008 265 | Dividers, inactive chips, secondary surfaces    |
| success    | 0.78 0.18 152  | Paid / confirmed states only                    |
| destructive | 0.6 0.21 22   | Validation errors only                          |

Brand ramps: `--blue-{100,300,500,600,700,900}`, `--cyan-{100,300,500,600,900}`. Surfaces stack `--surface-0..3` (0.06 → 0.17 L). Glass uses `--glass-bg` at 55% / 78% opacity with 20–28px blur and a 10–14% white hairline border.

## Typography

- Display: **Space Grotesk** — hero wordmark, section titles, numerals; tight negative tracking, heavy weight.
- Body: **Satoshi** — paragraphs, labels, form fields, buttons.
- Mono: **JetBrains Mono** — date/time, price, order codes, eyebrow labels (tracking 0.24em).
- Scale: hero `font-hero` (clamp 3.5rem→9.5rem, lh 0.86, tracking -0.045em), h2 `font-display-xl` (clamp 2.5rem→5rem), h3 `font-title`, label `label-eyebrow`, body `text-base md:text-lg`.

## Elevation & Depth

Depth comes from stacking near-black surfaces plus glass, never from flat drop shadows: `shadow-night-sm/md/lg` for panels, `shadow-glass` for acrylic cards, `shadow-edge-blue` / `shadow-edge-cyan` for focused or selected elements, `shadow-stage` for the cyan under-glow beneath the hero.

## Structural Zones

| Zone    | Background                        | Border              | Notes                                                       |
| ------- | --------------------------------- | ------------------- | ----------------------------------------------------------- |
| Header  | `surface-0`/70 + blur, sticky     | `border-b` 10% white | Logo left, ticket CTA right; compresses on scroll           |
| Hero    | `bg-stage` radial + vignette      | —                   | Oversized ZAVY wordmark, date/venue mono line, single CTA   |
| Content | alternating `surface-1` / `surface-2` | —                | Sections separated by `rule-hairline`, generous vertical air |
| Footer  | `surface-0` + film grain          | `border-t` 10% white | Venue, contact, Terms link, mono legal line                 |
| Sticky CTA | glass-panel-strong above `safe-bottom` | top hairline  | Mobile-only persistent "Get Tickets" bar                |

## Spacing & Rhythm

Sections breathe at `py-20 md:py-28`; content max-width `max-w-6xl` with `px-5 md:px-8`; micro-spacing in 4/8/12/16 steps, and ticket-tier rows use `p-5 md:p-6` with 1px hairline separators instead of nested cards.

## Component Patterns

- Buttons: full-width on mobile, `rounded-sm` (4px) with a 1px cyan/blue edge and `bg-gradient-cta`; hover lifts 1px and intensifies `shadow-edge-blue`; min height 3rem (`tap-target`).
- Cards: `glass-panel` + `rounded-sm`, 1px translucent white border, no heavy rounding — acrylic signage, not app tiles.
- Badges: pill (`rounded-full`) mono uppercase micro-type; blue-tinted for tier, cyan for "on sale", success green for paid.

## Motion

- Entrance: `animate-fade-in` / `animate-slide-up` with staggered `.delay-{100..500}` on hero and section children; reveal easing `cubic-bezier(0.16,1,0.3,1)`.
- Hover: 300ms `transition-smooth` — 1px lift, edge glow intensifies, image scales 1.03 inside clipped frame.
- Decorative: `animate-glow-pulse` on the live/on-sale dot, `animate-drift` on ambient blur orbs, `animate-qr-reveal` for the e-ticket QR, `animate-check-draw` for the success check, `animate-tick` per countdown second. All disabled under `prefers-reduced-motion`.

## Constraints

- Dark mode only — single intentional night theme; `.dark` mirrors `:root` so both class paths resolve.
- No raw color literals or arbitrary color classes in components; consume semantic tokens and the `bg-gradient-*` / `shadow-*` utilities only.
- Film grain and vignette are fixed, `pointer-events-none`, ≤5% opacity — texture, never a readability tax.
- Body text stays ≥4.5:1; cyan is reserved for emphasis and never used for long-form paragraphs.
- Large touch targets (≥48px) and thumb-reachable CTAs on every page.

## Signature Detail

**The stage light** — a `--gradient-stage` cyan spotlight blooming from the bottom edge of the hero behind an oversized Space Grotesk wordmark, with a slow `animate-drift` orb haze and a 5% film-grain layer over the entire site: the page reads as a lit concert stage, a texture/material signature no template reproduces.
