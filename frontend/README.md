# Todo Frontend

Next.js 16+ frontend application with Better Auth JWT authentication and task management.

## Quick Start

### Prerequisites

- Node.js 20+
- npm or yarn
- FastAPI backend running on port 8000

### Installation

```bash
# Copy environment template
cp .env.example .env.local

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000)

## Features

- **User Authentication**: Signup, signin, signout with Better Auth JWT
- **Task Management**: Create, view, edit, delete, and toggle task completion
- **Responsive Design**: Mobile-first design with Tailwind CSS 4+
- **Loading States**: Skeleton loaders and error boundaries
- **Route Protection**: Middleware-based authentication

## Project Structure

```
frontend/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── (auth)/            # Authentication routes
│   │   │   ├── signin/        # Signin page
│   │   │   └── signup/        # Signup page
│   │   ├── dashboard/         # Protected dashboard
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Landing page
│   ├── components/            # React components
│   │   ├── ui/               # Reusable UI components
│   │   ├── tasks/            # Task-specific components
│   │   └── auth/             # Auth-related components
│   ├── lib/                  # Utility libraries
│   │   ├── api-client.ts     # API client with JWT
│   │   ├── auth.ts           # Better Auth client
│   │   ├── types.ts          # TypeScript types
│   │   └── utils.ts          # General utilities
│   └── styles/               # Global styles
├── tests/                    # Test files
│   └── e2e/                 # Playwright E2E tests
├── .env.example             # Environment template
├── next.config.ts           # Next.js config
├── tailwind.config.ts       # Tailwind config
├── tsconfig.json            # TypeScript config
└── package.json             # Dependencies
```

## Environment Variables

```bash
# FastAPI backend URL
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000

# JWT secret (MUST match backend BETTER_AUTH_SECRET)
BETTER_AUTH_SECRET=dev-secret-key-change-in-production-32chars

# Frontend URL for auth callbacks
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Scripts

```bash
# Development
npm run dev              # Start dev server on port 3000

# Production
npm run build           # Build for production
npm start              # Start production server

# Testing
npm run test            # Run unit tests (Vitest)
npm run test:component  # Run component tests
npm run test:e2e        # Run E2E tests (Playwright)
npm run test:all        # Run all tests

# Code Quality
npm run lint            # Run ESLint
npm run type-check      # Run TypeScript type check
```

## API Integration

The frontend communicates with the FastAPI backend using JWT authentication:

- All API requests include `Authorization: Bearer <token>` header
- 401 responses trigger automatic redirect to signin
- User ID is extracted from JWT, never from user input

## Testing

### Unit Tests

```bash
npm run test
```

### E2E Tests

```bash
# Install Playwright browsers (first time only)
npx playwright install

# Run E2E tests
npm run test:e2e
```

## Troubleshooting

### 401 Errors on API Calls

1. Verify `BETTER_AUTH_SECRET` matches backend value
2. Check that backend is running on port 8000
3. Ensure Better Auth session is valid

### CORS Errors

1. Ensure backend CORS allows frontend origin
2. Check `NEXT_PUBLIC_API_BASE_URL` is correct

### Route Protection Not Working

1. Verify `middleware.ts` exists at project root
2. Check middleware matcher includes `/dashboard/*`

## Tech Stack

- **Framework**: Next.js 16+ (App Router)
- **UI Library**: React 19+
- **Styling**: Tailwind CSS 4+
- **Auth**: Better Auth (JWT mode)
- **Language**: TypeScript 5.8+
- **Testing**: Vitest, React Testing Library, Playwright

## License

MIT
