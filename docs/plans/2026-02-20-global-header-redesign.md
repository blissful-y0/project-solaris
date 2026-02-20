---
title: 1280px Global Header Layout Redesign
status: draft
---

# 1280px Global Header Layout Redesign

## Overview
The user requested to transition the global application layout from a full-width structure with a left-side `DesktopSidebar` to a centered, max-width `1280px` (`max-w-7xl`) structure with a top `Global Header`. 

This approach better serves a 1-column dashboard by unifying the navigation into the top bar, removing the distraction of a left sidebar, and wrapping the main interface in a comfortable, readable width.

## Proposed Changes

### 1. `DashboardLayout.tsx`
- We will modify the root layout to be centered with a maximum width of `1280px`.
- The `SolarisTicker` will be moved outside this max-width constraint so it continues to span the entire ultra-wide monitor (`w-full`).
- The `DesktopSidebar` component will be completely removed.
- The `TopBar` will remain inside the `1280px` constraint so the logo and navigation align with the main content.

### 2. `TopBar.tsx` (Global Header Redesign)
- The TopBar will be transformed into the primary navigation header for desktop views.
- We will import `NAV_ITEMS` from `nav-items.ts` and map them into a horizontal tab list next to the `SOLARIS` logo.
- Locked items (requiring character approval) will show a lock icon and be disabled, matching the current sidebar behavior.
- Active items will have a distinct "terminal tab" styling (e.g., text glow, bottom border).
- We will use `isCharacterApproved` prop in `TopBar` to handle the locked navigation state.

### 3. Cleanup
- `DesktopSidebar.tsx` will be deleted or effectively excluded from the layout.
- We need to pass `isCharacterApproved` to `TopBar` inside `DashboardLayout.tsx`.

## Verification Plan
1. **Automated Validation**: Run `npx tsc --noEmit` to ensure no props missing (e.g., `isCharacterApproved` on TopBar).
2. **Visual Inspection**: Open the browser to `/` and verify the Ticker spans 100% width, while the navigation and timeline are bound to 1280px and centered.
3. **Responsive Check**: Ensure the MobileTabBar still works on mobile widths and the new TopBar tabs hide or collapse gracefully (though we only need to show them on `md:flex`).
