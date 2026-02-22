---
title: Terminal Memo Pad Widget Redesign
status: draft
---

# Terminal Memo Pad Widget Redesign

## Overview
Instead of a read-only list of "Resonance Tasks", the user wants to convert this dashboard widget into a fully functional LocalStorage-based memo pad. This allows the user to write their own notes while maintaining the application's terminal aesthetic. No server changes are required.

## Proposed Features

1. **Title & Aesthetic Update**
   - Change the widget title from "MY RESONANCE TASKS / DIRECTIVE FROM HELIOS" to something like "PERSONAL DIRECTIVES" or "LOCAL MEMO SYSTEM".
   - Keep the terminal visual language (`hud-label`, monospaced text, glowing cyan accents).

2. **Component Structure (`ResonanceTasks.tsx`)**
   - Convert `ResonanceTasks.tsx` into a Client Component (`"use client"`).
   - Use React state hook (`useState`) to track the memo text.
   - Use an effect hook (`useEffect`) to load the text from `localStorage` on component mount, and save it to `localStorage` whenever it changes.
   - The key for localStorage can be something like `helios_local_memo`.

3. **Input Interface**
   - Replace the list markup (`<ul>`/`<li>`) with a `<textarea>` element.
   - Style the `<textarea>` to look like a raw terminal input:
     - No border or a thin glowing border on focus (`focus:border-primary/50`).
     - Transparent background (`bg-transparent`).
     - Monospaced font (`font-mono`, `text-sm`, `tracking-wider`).
     - Custom scrollbar classes (if available) or raw CSS to hide standard scrollbars to maintain immersion.
     - A blinking cursor effect can be simulated via CSS if desired, or relying on standard caret styling.

4. **Integration with `page.tsx`**
   - The `mock-tasks.ts` file and data imports will no longer be used by this component.
   - The `ResonanceTasks` component will no longer need to accept `tasks` as a prop.
   - We will need to update `apps/dashboard/src/app/(dashboard)/page.tsx` (or wherever `ResonanceTasks` is used) to remove the mock data dependency.

## Verification
- Manual verification: Type text into the memo pad, reload the page, and ensure the text persists.
- Run `npm run test` / `typecheck` to ensure no props are inadvertently broken in tests (e.g. `ResonanceTasks.test.tsx` will need to be updated).

Please let me know if this text-based LocalStorage memo approach sounds like the right direction!
