# Quickstart Guide: Frontend Web Application — Authenticated Todo UI

**Feature**: 003-frontend-ui
**Last Updated**: 2026-02-02

---

## Prerequisites

Before starting, ensure you have:

- **Node.js 20+** installed ([nodejs.org](https://nodejs.org/))
- **npm** or **yarn** package manager
- **FastAPI backend** running on port 8000
- **Better Auth** configured and accessible

---

## Installation

### 1. Navigate to Frontend Directory

```bash
cd frontend
```

### 2. Install Dependencies

```bash
npm install
```

This installs:
- Next.js 16+ (React framework)
- React 19+ (UI library)
- Better Auth (Authentication)
- Tailwind CSS 4+ (Styling)
- TypeScript (Type safety)

### 3. Configure Environment Variables

```bash
# Copy the environment template
cp .env.example .env.local
```

Edit `.env.local` and set the following variables:

```bash
# FastAPI backend URL
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000

# JWT secret (MUST match backend BETTER_AUTH_SECRET)
BETTER_AUTH_SECRET=dev-secret-key-change-in-production-32chars

# Frontend URL for auth callbacks
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Development

### Start Development Server

```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000)

### Development Features

- **Hot Module Replacement**: Changes refresh automatically
- **Fast Refresh**: Preserves React component state during updates
- **TypeScript Checking**: Errors shown in browser and terminal
- **Tailwind JIT**: Styles generated on-demand

---

## Testing

### Unit Tests

```bash
npm run test
```

Runs Vitest unit tests for utilities and API client.

### Component Tests

```bash
npm run test:component
```

Runs React Testing Library tests for UI components.

### E2E Tests

```bash
npm run test:e2e
```

Runs Playwright end-to-end tests for critical user paths.

### All Tests

```bash
npm run test:all
```

Runs all test suites with coverage report.

---

## Build for Production

### Create Production Build

```bash
npm run build
```

This:
- Optimizes code for production
- Minifies JavaScript and CSS
- Generates static assets
- Creates `.next/` build directory

### Start Production Server

```bash
npm start
```

Starts the production server on port 3000.

---

## Environment Configuration

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `NEXT_PUBLIC_API_BASE_URL` | FastAPI backend URL | `http://localhost:8000` | Yes |
| `BETTER_AUTH_SECRET` | JWT secret (must match backend) | `dev-secret-key...` | Yes |
| `NEXT_PUBLIC_APP_URL` | Frontend URL for auth callbacks | `http://localhost:3000` | Yes |

### Production Environment

For production, create `.env.production`:

```bash
NEXT_PUBLIC_API_BASE_URL=https://api.yourdomain.com
BETTER_AUTH_SECRET=your-production-secret-min-32-chars
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

---

## First-Time Setup

### Step 1: Start Backend

Ensure the FastAPI backend is running:

```bash
cd ../backend
uv run uvicorn src.main:app --reload
```

Backend should be available at http://localhost:8000

### Step 2: Start Frontend

```bash
cd frontend
npm run dev
```

Frontend should be available at http://localhost:3000

### Step 3: Create Account

1. Navigate to http://localhost:3000
2. Click "Sign up"
3. Enter email and password
4. Submit form

### Step 4: Access Dashboard

1. After signup, you'll be redirected to the dashboard
2. View your tasks (empty state initially)
3. Create your first task

---

## Project Structure

```
frontend/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── (auth)/            # Authentication routes
│   │   │   ├── signin/        # Signin page
│   │   │   └── signup/        # Signup page
│   │   ├── dashboard/         # Protected dashboard
│   │   │   ├── layout.tsx     # Dashboard layout
│   │   │   └── page.tsx       # Task list
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Landing page
│   ├── components/            # React components
│   │   ├── ui/               # Reusable UI components
│   │   ├── tasks/            # Task-specific components
│   │   └── auth/             # Auth-related components
│   ├── lib/                  # Utility libraries
│   │   ├── api-client.ts     # API client with JWT
│   │   ├── auth.ts           # Better Auth client
│   │   └── utils.ts          # General utilities
│   └── styles/               # Global styles
├── public/                   # Static assets
├── tests/                    # Test files
├── .env.local               # Environment variables (gitignored)
├── .env.example             # Environment template
├── next.config.ts           # Next.js config
├── tailwind.config.ts       # Tailwind config
├── tsconfig.json            # TypeScript config
└── package.json             # Dependencies
```

---

## Troubleshooting

### Issue: 401 Errors on API Calls

**Symptoms**: API requests return 401 Unauthorized

**Solutions**:
1. Verify `BETTER_AUTH_SECRET` matches backend value
2. Check that backend is running on port 8000
3. Ensure Better Auth session is valid
4. Clear browser cookies and re-authenticate

### Issue: CORS Errors

**Symptoms**: Browser console shows CORS errors

**Solutions**:
1. Ensure backend CORS allows frontend origin
2. Check `NEXT_PUBLIC_API_BASE_URL` is correct
3. Verify backend CORS middleware is configured

### Issue: Route Protection Not Working

**Symptoms**: Can access dashboard without signin

**Solutions**:
1. Verify `middleware.ts` exists at project root
2. Check middleware matcher includes `/dashboard/*`
3. Ensure Better Auth session retrieval works

### Issue: Tasks Not Loading

**Symptoms**: Dashboard shows loading spinner indefinitely

**Solutions**:
1. Check browser console for errors
2. Verify backend `/api/{user_id}/tasks` endpoint works
3. Ensure JWT token is being sent in Authorization header
4. Check network tab in browser DevTools

### Issue: Styles Not Applied

**Symptoms**: Page looks unstyled

**Solutions**:
1. Verify Tailwind CSS is installed
2. Check `tailwind.config.ts` is correct
3. Ensure global styles import Tailwind directives
4. Restart dev server

---

## Common Tasks

### Add a New UI Component

```bash
# Create component file
touch src/components/ui/NewComponent.tsx

# Add "use client" directive if using hooks
```

### Add Environment Variable

1. Add to `.env.local` (gitignored)
2. Add to `.env.example` (committed)
3. Use as `process.env.VARIABLE_NAME`
4. Prefix public variables with `NEXT_PUBLIC_`

### Run Type Checking

```bash
npm run type-check
```

### Format Code

```bash
npm run format
```

### Lint Code

```bash
npm run lint
```

---

## Development Workflow

1. **Create feature branch**: `git checkout -b feature/my-feature`
2. **Make changes**: Edit files in `src/`
3. **Test locally**: Run `npm run test:all`
4. **Build production**: Run `npm run build`
5. **Commit changes**: `git commit -am "Description"`
6. **Push branch**: `git push origin feature/my-feature`

---

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Better Auth Documentation](https://better-auth.com)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

---

## Support

For issues or questions:
1. Check this quickstart guide
2. Review the [spec](../spec.md) for requirements
3. Review the [plan](../plan.md) for architecture
4. Check the [research](../research.md) for technical decisions
