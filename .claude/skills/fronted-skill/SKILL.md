---
name: frontend-skill
description: Build frontend pages, components, layouts, and styling for modern web applications. Use for UI implementation and design systems.
---

# Frontend Skill – Pages, Components & Layout

## Instructions

1. **Pages**
   - Use framework routing conventions (e.g. Next.js App Router)
   - Keep pages thin and declarative
   - Delegate logic to components and hooks
   - Support loading, error, and empty states

2. **Components**
   - Build reusable, composable UI components
   - Prefer functional, stateless components
   - Isolate interactivity in client components only when required
   - Follow consistent naming and folder structure

3. **Layouts**
   - Define shared layouts for navigation, headers, and footers
   - Use nested layouts for section-level structure
   - Ensure layouts are responsive and flexible
   - Avoid duplicating layout logic across pages

4. **Styling**
   - Use utility-first CSS (e.g. Tailwind) or scoped styles
   - Apply mobile-first responsive breakpoints
   - Maintain consistent spacing, typography, and colors
   - Avoid inline styles and global overrides

## Best Practices

- Mobile-first design approach
- Use semantic HTML for accessibility
- Keep components small and focused
- Avoid unnecessary client-side state
- Ensure visual consistency across the app
- Design for reuse before duplication

## Example Structure

```tsx
// app/layout.tsx
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        <header className="p-4 border-b">Header</header>
        <main className="flex-1 p-4">{children}</main>
        <footer className="p-4 border-t">Footer</footer>
      </body>
    </html>
  );
}
