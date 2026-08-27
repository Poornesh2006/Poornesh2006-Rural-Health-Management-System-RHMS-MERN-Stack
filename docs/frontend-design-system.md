# Frontend Design System

## Purpose

Phase 2 begins by establishing reusable UI and motion primitives before deeper module work. This keeps patient, doctor, pharmacy, and analytics screens visually consistent and easier to scale.

## Theme Foundation

- CSS custom properties drive light and dark themes
- healthcare-specific semantic tokens are used instead of one-off colors
- surfaces support glass panels, elevated cards, and strong content panels
- shadows are standardized for quiet, soft, and floating depth levels

## Reusable UI Primitives

- `Button`: primary, secondary, ghost, danger
- `Card`: base container with optional hover lift
- `Input`: labeled form control with icon, hint, and error support
- `Badge`: status and tone chips
- `Breadcrumbs`: route context
- `PageHeader`: shared page intro with breadcrumbs and actions
- `SectionHeader`: consistent eyebrow, heading, and descriptive intro block
- `StatCard`: dashboard metric card
- `DataTable`: reusable table shell for operational data
- `EmptyState`: reusable placeholder surface
- `Skeleton`: loading placeholder
- `ThemeToggle`: light and dark mode switch
- `SearchBar`: page-level search field
- `FilterBar`: reusable filter chips
- `Tabs`: lightweight segmented navigation
- `Dialog`: reusable modal shell
- `FloatingActionButton`: sticky primary action
- `CommandPalette`: Ctrl + K route launcher

## Motion System

- `MotionPage`: route-level page transition wrapper
- `fadeUp`, `fadeIn`, `scaleIn`, `staggerParent`, `pageTransition`
- all transitions follow a smooth ease curve intended for enterprise dashboard interactions

## File Map

```text
frontend/src/
|-- components/ui/
|-- context/ThemeContext.jsx
|-- design/tokens.js
|-- motion/
`-- lib/cn.js
```

## Implementation Notes

- current dashboard and login pages were migrated onto shared primitives
- the app now includes route-connected premium placeholder pages to remove dead navigation
- future patient, auth, and analytics modules should build on these components first
- command palette, drawer, tabs, toast, and advanced filters are planned next in the same design-system layer
