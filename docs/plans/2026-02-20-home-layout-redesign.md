---
title: Home Layout Redesign (One-Column Twitter Style)
status: draft
---

# Home Layout Redesign (One-Column Twitter Style)

## Overview
The two-column layout looked good for the feed but made the `CitizenIDCard` feel awkward or overly prominent. The user requested a shift to a "Twitter-like" single-column layout: the `CitizenIDCard` at the top, followed directly by the `BriefingFeed` timeline underneath.

## Proposed Layout Changes (`page.tsx`)

1. **Revert CSS Grid**
   - Remove the `grid lg:grid-cols-12` split.
   - Return to a simple vertical stacking block `flex flex-col gap-8` (or `space-y-8`).

2. **Top Section (`CitizenIDCard`)**
   - The card will sit at the top of the content area.
   - To prevent the card from becoming massively wide on desktop monitors (which looks warped), we will constrain its maximum width using a centered layout:
     ```tsx
     <div className="max-w-2xl mx-auto w-full">
       <CitizenIDCard ... />
     </div>
     ```

3. **Bottom Section (`BriefingFeed`)**
   - The feed will sit immediately below the card.
   - We will also constrain its width to match the card, creating a unified central column (like a Twitter timeline).
     ```tsx
     <div className="max-w-2xl mx-auto w-full">
       <BriefingFeed ... />
     </div>
     ```

4. **Styling Adjustments (`BriefingFeed.tsx`)**
   - Remove the fixed `h-full max-h-[calc(...)]` scroll lock on the BriefingFeed component itself so it casually scrolls with the main browser window natively.
   - Retain the terminal styling (borders, corners, background) we just added, but adapt it to flow naturally.

## Verification
- View `/` route.
- ID Card and Feed should be perfectly centered, matching widths, forming a single column scroll experience resembling a social timeline console.
