---
title: Lore Page UI/UX Redesign Implementation Plan
status: draft
---

# Lore Page UI/UX Redesign Implementation Plan

## Overview
As per the recent design document (`2026-02-20-lore-redesign-design.md`), the Lore page within the dashboard needs to be revamped to fit the "HELIOS internal archive system" terminal/database aesthetics. Currently, the UI uses a vertical list format. We will update the `LorePageClient` and related card components to use a responsive grid layout with specific terminal UI/UX elements.

## Objectives
1. **Grid Layout Conversion**: Refactor the current category list in `LorePageClient.tsx` to a responsive card grid (3 columns on desktop, 2 columns on mobile).
2. **Card UI Overhaul**: Create or update the category card to include:
   - HUD Corner Brackets (`hud-corners` class).
   - Clearance level badge.
   - Korean Name & English Codename.
   - Brief description of the lore.
   - "OPEN FILE" Call to Action (CTA).
   - Premium hover effects (e.g., border glow using `glow-cyan` utilities, border color changes).
3. **Typography & Styling**: Ensure that the terminal aesthetics apply to the header/navigation/badges while the modal content readability remains intact.

## Step-by-Step Implementation Steps

1. **Update `LorePageClient.tsx` Layout**
   - Replace the flex-col list container with a CSS grid `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6`.
   - Update the mapping of `LORE_CATEGORIES` to render enhanced cards instead of the current row items.

2. **Create/Update Card Component (or inline in `LorePageClient`)**
   - We will extract or build the card inline with the new specifications.
   - Add `hud-corners` class for the premium terminal UI aspect.
   - Integrate `ClearanceBadge`.
   - Add the description and the CTA ("OPEN FILE").
   - Add interaction styles: `hover:glow-cyan-strong` or similar based on `globals.css` utilities.

3. **Verify Modal Component (`LoreDetailModal.tsx`)**
   - Ensure it matches the requested tone and manner and works perfectly with the new grid interactions.

4. **Review & Test**
   - Ensure the `globals.css` utility classes are being effectively utilized to present a "Wow" factor.

## Review
Please review this implementation plan and let me know if there are any additional adjustments or details you would like to include before I start writing the code.
