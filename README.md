# Interactive Wall Calendar

A polished, interactive wall calendar component built with React and TypeScript. Inspired by the aesthetic of a physical wall calendar -- complete with hero images, ring bindings, and a rich notes system.

## Features

- **Wall calendar aesthetic** -- monthly hero images, decorative ring bindings, depth shadows
- **Date range selection** -- single-click to select a date, double-click to pick a range, drag to select multiple days
- **Integrated notes** -- per-date, per-range, and monthly notes with auto-save to `localStorage`
- **Notes heatmap** -- day cells shade by note length so you can see activity at a glance
- **Custom events** -- right-click any date to add color-coded events with optional yearly recurrence
- **Cross-note search** -- search bar with debounced full-text search across all saved notes
- **Undo / redo** -- full history stack for notes (Ctrl+Z / Ctrl+Y)
- **Keyboard navigation** -- arrow keys, Home/End, Enter, Shift+Enter, Escape
- **Mini-month preview** -- compact 3-month strip (previous, current, next) for quick navigation
- **Light / dark theme** -- toggle with system preference detection and `localStorage` persistence
- **Save confetti** -- micro-animation on note save using canvas-confetti
- **Holiday markers** -- visual dots and tooltips for notable holidays
- **Month flip animation** -- subtle CSS perspective transition between months
- **Fully responsive** -- side-by-side on desktop, stacked on mobile, optimized for tablets

## Tech Stack & Rationale

| Technology | Why |
|---|---|
| **React 19 + TypeScript** | Type safety, component model, hooks for clean state management |
| **Vite** | Near-instant HMR, fast builds, zero-config for React + TS |
| **CSS Modules** | Scoped styles without runtime cost; demonstrates CSS skill over a UI library |
| **date-fns** | Tree-shakeable, modern date utilities -- only the functions used are bundled |
| **canvas-confetti** | Lightweight (<5 KB) micro-interaction library for the save animation |
| **localStorage** | Meets the strictly-frontend requirement; no backend or database needed |

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Build for Production

```bash
npm run build
npm run preview
```

## Project Structure

```
src/
  components/
    CalendarPage/      -- main layout, wires all state and components
    CalendarGrid/      -- 7-column grid rendering DayCell instances
    DayCell/           -- individual day: selection, heatmap, tooltips, events
    HeroImage/         -- monthly hero image with flip animation
    MonthNavigation/   -- prev/next arrows, "Today" button
    NotesPanel/        -- textarea with undo/redo, overlapping note display
    SearchBar/         -- debounced full-text search across notes
    MiniMonths/        -- compact 3-month preview strip
    EventModal/        -- right-click popover for custom event CRUD
  hooks/
    useCalendar.ts     -- month navigation, date/range selection, drag, keyboard nav
    useNotes.ts        -- note persistence, heatmap data, overlapping note lookup
    useUndoRedo.ts     -- generic undo/redo history stack
    useCustomEvents.ts -- custom event CRUD with localStorage
  utils/
    dateUtils.ts       -- date helpers, holiday map, calendar day generation
    images.ts          -- month-to-Unsplash-image mapping
  types/
    index.ts           -- shared TypeScript interfaces
```

## Design Decisions

- **CSS Modules over a UI library** -- full control over the wall calendar aesthetic, smaller bundle, and demonstrates raw CSS proficiency.
- **Custom hooks for all state** -- `useCalendar`, `useNotes`, `useUndoRedo`, and `useCustomEvents` keep components purely presentational. Each hook is independently testable.
- **localStorage for persistence** -- the evaluator requires a frontend-only solution. All notes, events, and theme preferences persist across sessions without a backend.
- **date-fns over Moment/Day.js** -- tree-shakeable and modern. Only imported functions are bundled, keeping the output small.
- **Accessibility** -- ARIA labels on all interactive elements, keyboard navigation with focus indicators, reduced-motion support for confetti, semantic `role="grid"` on the calendar.
