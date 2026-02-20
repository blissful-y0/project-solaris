---
title: Sidebar UI Terminal Styling (Fixed Layout)
status: draft
---

# Sidebar UI Terminal Styling (Fixed Layout)

## Overview
The user prefers to keep the existing, fixed full-height structure of the `DesktopSidebar.tsx`, avoiding a "floating" or "windowed" design. However, the sidebar still needs to be visually updated to match the application's terminal/database aesthetics.

## Proposed Changes (Non-Structural)

1. **Brand/Header Enhancement**
   - Apply a scanline class or a subtle `glow-cyan` text effect to "SOLARIS TERMINAL".
   - Keep the existing `h-14` height and `px-5` padding untouched.

2. **Navigation Item Tweaks**
   - **Active State**: Instead of just a primary text color, add a more distinctive terminal element. 
     - *Example:* Add a `hud-corners` outline to the active background, or change the active indicator bracket to a high-contrast glowing border.
   - **Hover State**: Add the `hover-glitch` effect to the text label.
   - Keep the padding (`px-4 py-2.5`) and standard icon sizes intact so the layout width isn't affected.

3. **System Footer Tweaks**
   - Update the "SYS:ONLINE" module with a terminal block layout (e.g. keeping it inside a thin border box).
   - Use strict uppercase and monospace fonts (`hud-label`) throughout the footer strings if they aren't already.

## Impact
No padding or structural adjustments are needed in `DashboardLayout.tsx`. The mobile layout (`MobileTabBar`) remains unaffected.

Please review this revised plan focusing only on element-level aesthetic changes rather than layout manipulation.
