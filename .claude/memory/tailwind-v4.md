# Tailwind CSS v4 Notes

## CSS Cascade Layers
Tailwind v4 uses `@layer` for ALL its CSS:
- `@layer theme` — theme variables
- `@layer base` — preflight/resets
- `@layer components` — component classes
- `@layer utilities` — utility classes (p-*, m-*, gap-*, etc.)

**Unlayered CSS always beats layered CSS** in cascade priority, regardless of specificity.

## Common Pitfall: Global Resets
```css
/* WRONG — this overrides ALL Tailwind utilities */
* { margin: 0; padding: 0; }

/* RIGHT — Tailwind v4 preflight already handles this in @layer base */
/* Just delete the duplicate reset */
```

## Content Detection
- Tailwind v4 with `@tailwindcss/vite` auto-detects `.tsx`, `.astro` files
- No `tailwind.config` needed
- `@theme` block for design tokens (replaces `theme.extend` in config)

## Workarounds
- `mx-auto` may not work — use `style={{ marginInline: "auto" }}` or `margin-inline: auto` in custom CSS
- `space-y-*` can be unreliable — prefer `flex flex-col gap-*`
