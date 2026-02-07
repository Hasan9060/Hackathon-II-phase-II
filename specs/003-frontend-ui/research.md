# Research: Frontend Web Application — Authenticated Todo UI

**Feature**: 003-frontend-ui
**Date**: 2026-02-02
**Purpose**: Technology decisions and best practices for Next.js frontend with Better Auth integration

---

## RQ-1: Better Auth Integration with Next.js App Router

**Question**: How to integrate Better Auth for JWT-based authentication in a Next.js 16+ App Router application?

### Decision

Use Better Auth's official Next.js integration with App Router

### Rationale

Better Auth provides first-class support for Next.js App Router with:
- Server-side session management for Server Components
- Client-side hooks (`useSession()`) for Client Components
- Middleware integration for route protection
- Built-in JWT token handling

### Implementation Pattern

```typescript
// lib/auth.ts
import { betterAuth } from "better-auth"

export const authClient = betterAuth({
  baseURL: process.env.NEXT_PUBLIC_APP_URL,
  secret: process.env.BETTER_AUTH_SECRET,
})

// Server-side: Get session in Server Component
const session = await authClient.getSession()

// Client-side: Use hook
const { data: session } = useSession()
```

### Alternatives Considered

| Alternative | Rejected Because |
|-------------|------------------|
| NextAuth.js | Constitution requires Better Auth specifically |
| Custom auth implementation | Constitution requires Better Auth |

---

## RQ-2: JWT Token Management for API Requests

**Question**: How to extract and attach JWT tokens from Better Auth session to outbound API requests?

### Decision

Create centralized ApiClient class that extracts JWT from Better Auth session and attaches to Authorization header

### Rationale

- Single source of truth for API calls
- Consistent error handling (401 redirects)
- Automatic token attachment eliminates boilerplate
- DRY principle across all API interactions

### Implementation Pattern

```typescript
// lib/api-client.ts
class ApiClient {
  private async getHeaders(): Promise<HeadersInit> {
    const session = await authClient.getSession()
    const token = session?.token

    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    }
  }

  async request<T>(options: ApiRequestOptions): Promise<T> {
    const headers = await this.getHeaders()
    const response = await fetch(`${this.config.baseUrl}${options.path}`, {
      ...options,
      headers,
    })

    if (response.status === 401) {
      this.config.onUnauthorized()
      throw new Error('Unauthorized')
    }

    return response.json()
  }
}
```

### Alternatives Considered

| Alternative | Rejected Because |
|-------------|------------------|
| Per-request token extraction | Code duplication, inconsistent error handling |
| Axios interceptors | Additional dependency, fetch is sufficient |

---

## RQ-3: Route Protection Strategy

**Question**: How to protect dashboard routes and redirect unauthenticated users to signin?

### Decision

Use Next.js middleware for route-level protection combined with server-side session checks

### Rationale

- Middleware runs before route handlers (early redirects)
- Prevents unauthorized page rendering (no flash of protected content)
- App Router convention for protected routes
- Better UX than client-side only protection

### Implementation Pattern

```typescript
// middleware.ts
import { authClient } from "./lib/auth"

export async function middleware(request: NextRequest) {
  const session = await authClient.getSession()

  if (!session && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/signin', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*']
}
```

### Alternatives Considered

| Alternative | Rejected Because |
|-------------|------------------|
| Client-side only protection | Flicker effect, security concerns |
| HOC pattern | Not App Router convention, more verbose |

---

## RQ-4: State Management for Task List

**Question**: How to manage task list state and keep UI in sync with API?

### Decision

Use React Server Components for initial data fetch with client-side mutations and router refresh

### Rationale

- Server Components reduce client JavaScript bundle
- Initial page load faster with server-rendered HTML
- Client-side mutations enable instant UI feedback
- `useRouter.refresh()` revalidates Server Component data

### Implementation Pattern

```typescript
// app/dashboard/page.tsx (Server Component)
export default async function DashboardPage() {
  const tasks = await apiClient.get<Task[]>('/api/user/tasks')

  return <TaskList initialTasks={tasks} />
}

// components/TaskList.tsx (Client Component)
'use client'
export function TaskList({ initialTasks }: { initialTasks: Task[] }) {
  const [tasks, setTasks] = useState(initialTasks)
  const router = useRouter()

  async function handleCreate(task: CreateTaskRequest) {
    await apiClient.post('/api/user/tasks', task)
    router.refresh()  // Revalidates Server Component
  }
}
```

### Alternatives Considered

| Alternative | Rejected Because |
|-------------|------------------|
| SWR/React Query | Overkill for simple CRUD, additional complexity |
| Full server-side only | Poor interactivity (full page reloads) |

---

## RQ-5: Responsive Design Approach

**Question**: How to implement responsive design for mobile (320px+) and desktop?

### Decision

Use Tailwind CSS 4+ with mobile-first responsive breakpoints

### Rationale

- Utility-first approach (rapid development)
- Excellent mobile support (mobile-first by default)
- Zero runtime CSS-in-JS overhead
- Industry standard for Next.js applications

### Implementation Pattern

```tsx
// Mobile-first: default styles apply to mobile
<div className="p-4">  {/* 16px padding on mobile */}
  <div className="md:p-8">  {/* 32px padding on desktop */}
    {/* Task card: single column mobile, multi-column desktop */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <TaskCard />
    </div>
  </div>
</div>
```

### Breakpoints

| Breakpoint | Min Width | Target |
|------------|-----------|--------|
| (default) | 0px | Mobile (320px+) |
| `sm:` | 640px | Large phones, small tablets |
| `md:` | 768px | Tablets portrait |
| `lg:` | 1024px | Tablets landscape, small desktops |
| `xl:` | 1280px | Desktops |
| `2xl:` | 1536px | Large desktops |

### Alternatives Considered

| Alternative | Rejected Because |
|-------------|------------------|
| CSS Modules | More verbose class names, no utility classes |
| Styled Components | Runtime overhead, larger bundle size |

---

## RQ-6: Error Handling and Loading States

**Question**: How to display loading indicators and error messages for API operations?

### Decision

Use React Suspense for loading states and error boundaries for error handling

### Rationale

- Suspense provides built-in loading state management
- Error boundaries catch component errors gracefully
- Declarative API (no manual loading flags for Server Components)
- Industry best practice for Next.js App Router

### Implementation Pattern

```tsx
// app/dashboard/page.tsx
import { Suspense } from 'react'

export default async function DashboardPage() {
  return (
    <Suspense fallback={<TaskListSkeleton />}>
      <TaskList />
    </Suspense>
  )
}

// Client-side mutations use boolean loading states
const [isLoading, setIsLoading] = useState(false)

async function handleSubmit() {
  setIsLoading(true)
  try {
    await apiClient.post('/api/tasks', data)
  } finally {
    setIsLoading(false)
  }
}
```

### Alternatives Considered

| Alternative | Rejected Because |
|-------------|------------------|
| Manual loading flags | Boilerplate, error-prone |
| Global loading store | Unnecessary complexity for simple CRUD |

---

## RQ-7: Form Validation Strategy

**Question**: How to validate task creation/edit forms with immediate feedback?

### Decision

Use controlled form components with client-side validation

### Rationale

- Real-time feedback as user types
- No additional library dependencies
- Simple for 2-field forms (title, description)
- API validation enforces backend constraints

### Implementation Pattern

```tsx
const [title, setTitle] = useState('')
const [error, setError] = useState('')

function validateTitle(value: string): boolean {
  return value.trim().length > 0
}

function handleChange(e: ChangeEvent<HTMLInputElement>) {
  setTitle(e.target.value)
  if (!validateTitle(e.target.value)) {
    setError('Title is required')
  } else {
    setError('')
  }
}

<button disabled={!validateTitle(title) || isLoading}>
  Create Task
</button>
```

### Alternatives Considered

| Alternative | Rejected Because |
|-------------|------------------|
| React Hook Form | Overkill for simple 2-field forms |
| Zod schema validation | Unnecessary complexity for client-side only |

---

## RQ-8: Testing Strategy

**Question**: How to test the frontend application effectively?

### Decision

Multi-layer testing: Vitest (unit), React Testing Library (component), Playwright (e2e)

### Rationale

- Unit tests verify utility functions and API client logic
- Component tests verify UI behavior and user interactions
- E2e tests verify critical user journeys (signin, create task, delete task)
- Defense in depth: catch issues at different layers

### Test Coverage

| Layer | Tool | Coverage Target |
|-------|------|-----------------|
| Unit | Vitest | Utilities, API client, helpers |
| Component | React Testing Library | All interactive components |
| Integration | Vitest + RTL | API client + auth session |
| E2E | Playwright | Critical user paths |

### Implementation Pattern

```typescript
// Unit test (Vitest)
import { describe, it, expect } from 'vitest'
import { formatTaskDate } from './utils'

describe('formatTaskDate', () => {
  it('formats ISO date to readable string', () => {
    expect(formatTaskDate('2026-02-02T12:00:00Z')).toBe('Feb 2, 2026')
  })
})

// Component test (React Testing Library)
import { render, screen } from '@testing-library/react'
import { TaskCard } from './TaskCard'

describe('TaskCard', () => {
  it('displays task title and description', () => {
    render(<TaskCard task={mockTask} />)
    expect(screen.getByText('Test Task')).toBeInTheDocument()
  })
})

// E2E test (Playwright)
import { test, expect } from '@playwright/test'

test('user can create a task', async ({ page }) => {
  await page.goto('/dashboard')
  await page.fill('input[name="title"]', 'New Task')
  await page.click('button[type="submit"]')
  await expect(page.locator('text=New Task')).toBeVisible()
})
```

### Alternatives Considered

| Alternative | Rejected Because |
|-------------|------------------|
| Jest | Slower than Vitest, no native ESM support |
| Cypress | Heavier than Playwright, worse multi-browser support |

---

## Summary of Technology Decisions

| Area | Technology | Key Benefit |
|------|------------|-------------|
| Framework | Next.js 16+ (App Router) | Server Components, performance |
| Auth | Better Auth | JWT mode, Next.js integration |
| Styling | Tailwind CSS 4+ | Utility-first, mobile-first |
| State | Server Components + useState | Best of both worlds |
| Forms | Controlled components | Real-time validation |
| Testing | Vitest + RTL + Playwright | Multi-layer coverage |
| API Client | Fetch wrapper | No additional dependencies |

All decisions align with the Todo AI Chatbot constitution and support the spec requirements.
