# AI Editor Rules for OHOUSE Project

This document outlines the technical stack and mandatory guidelines for the AI editor (Dyad) when modifying or extending the OHOUSE application codebase.

## 1. Tech Stack Overview

The project is a modern, high-end e-commerce frontend built with the following technologies:

*   **Framework:** React (using Vite).
*   **Language:** TypeScript (mandatory for all new files).
*   **Styling:** Tailwind CSS (mandatory for all styling, utilizing custom utilities like `container-luxury` and `btn-hero`).
*   **UI Library:** shadcn/ui (built on Radix UI).
*   **Routing:** React Router DOM.
*   **Animations:** Framer Motion (for sophisticated UI transitions and scroll-based effects).
*   **Icons:** Lucide React.
*   **Data Fetching:** React Query (for server state management).
*   **Notifications:** Sonner (for modern, non-blocking toasts).

## 2. Mandatory Library Usage Rules

| Feature | Mandatory Library/Tool | Notes |
| :--- | :--- | :--- |
| **UI Components** | shadcn/ui | Use existing shadcn components (e.g., Button, Input, Tabs) whenever possible. |
| **Styling** | Tailwind CSS | Must be used exclusively. Designs must be responsive. Utilize custom classes defined in `src/index.css` (e.g., `container-luxury`, `btn-hero`, `card-luxury`, `img-zoom`). |
| **Routing/Navigation** | React Router DOM | Use `<Link>` and `<NavLink>` for internal navigation. Keep main routes in `src/App.tsx`. |
| **Animations** | Framer Motion | Use for complex animations, especially those triggered by view (`whileInView`). |
| **Icons** | Lucide React | Use for all icons. |
| **Notifications** | Sonner | Use the `<Sonner />` component for all user feedback toasts. |
| **Utilities** | `src/lib/utils.ts` | Use the `cn` utility for combining Tailwind classes. |

## 3. Code Structure and Best Practices

1.  **File Structure:**
    *   Pages must reside in `src/pages/`.
    *   Components must reside in `src/components/`.
    *   **New Component Rule:** Every new component or hook must be created in its own dedicated file. Do not add new components to existing files.
2.  **Luxury Design:** Maintain the high-end, luxury aesthetic established by the existing components (e.g., using `charcoal`, `cream`, `primary` colors, and custom shadows/hover effects).
3.  **Completeness:** All changes must result in a fully functional, syntactically correct, and complete application state. No partial implementations or placeholders.