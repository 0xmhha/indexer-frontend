# CLAUDE.md - AI Assistant Guide for indexer-frontend

> **Last Updated**: 2025-11-18
> **Repository**: indexer-frontend
> **Owner**: 0xmhha
> **License**: Apache 2.0

## Table of Contents

- [Repository Overview](#repository-overview)
- [Current State](#current-state)
- [Technology Stack (Planned)](#technology-stack-planned)
- [Project Structure](#project-structure)
- [Development Workflows](#development-workflows)
- [Key Conventions](#key-conventions)
- [AI Assistant Guidelines](#ai-assistant-guidelines)
- [Common Tasks](#common-tasks)
- [Git Workflow](#git-workflow)

---

## Repository Overview

**indexer-frontend** is a frontend web application project currently in its initialization phase. The repository is intended to serve as the user interface for an indexer system.

### Current Status: 🚧 Uninitialized

This repository is in its initial state with only licensing established. The project structure, technology stack, and codebase are yet to be defined.

---

## Current State

### What Exists
- **LICENSE**: Apache 2.0 license file
- **Git Repository**: Initialized with remote origin
- **Branch**: `claude/claude-md-mi3xygmziw6cms5f-01TgNRkqJ9McnW28AXx6QsrS`

### What's Missing
- ❌ No package.json or dependencies
- ❌ No source code structure
- ❌ No build configuration
- ❌ No testing framework
- ❌ No CI/CD pipeline
- ❌ No development tooling (linters, formatters)
- ❌ No README or documentation
- ❌ No .gitignore file

---

## Technology Stack (Planned)

When initializing this project, consider the following modern frontend stack:

### Recommended Core Technologies

**Framework Options:**
- **React 18+** with TypeScript (Most popular, large ecosystem)
- **Vue 3** with TypeScript (Progressive, easy learning curve)
- **Svelte/SvelteKit** (Lightweight, compiled framework)
- **Solid.js** (Reactive, performant)

**Build Tools:**
- **Vite** (Recommended: Fast, modern, excellent DX)
- **Next.js** (If SSR/SSG needed)
- **Remix** (Full-stack framework alternative)

**Language:**
- **TypeScript** (Strongly recommended for type safety)

**Styling:**
- **Tailwind CSS** (Utility-first CSS framework)
- **CSS Modules** (Scoped CSS)
- **Styled-components** or **Emotion** (CSS-in-JS)

**State Management:**
- **Zustand** (Lightweight, simple API)
- **Redux Toolkit** (Complex state, established pattern)
- **Jotai** or **Recoil** (Atomic state management)
- **TanStack Query** (Server state management)

**Testing:**
- **Vitest** (Fast, Vite-native unit testing)
- **Jest** (Mature, widely adopted)
- **React Testing Library** (Component testing)
- **Playwright** or **Cypress** (E2E testing)

**Code Quality:**
- **ESLint** (Linting)
- **Prettier** (Code formatting)
- **Husky** (Git hooks)
- **lint-staged** (Staged files linting)

---

## Project Structure

### Recommended Directory Structure

Once initialized, the project should follow this structure:

```
indexer-frontend/
├── .github/                    # GitHub specific files
│   └── workflows/              # CI/CD workflows
├── public/                     # Static assets
│   ├── favicon.ico
│   └── robots.txt
├── src/                        # Source code
│   ├── components/             # Reusable UI components
│   │   ├── common/            # Generic components (Button, Input, etc.)
│   │   ├── layout/            # Layout components (Header, Footer, Sidebar)
│   │   └── features/          # Feature-specific components
│   ├── pages/                 # Page components (route-based)
│   ├── hooks/                 # Custom React hooks
│   ├── services/              # API services and external integrations
│   │   ├── api/              # API client and endpoints
│   │   └── indexer/          # Indexer-specific services
│   ├── stores/                # State management
│   │   ├── slices/           # State slices (Redux) or stores (Zustand)
│   │   └── index.ts          # Store configuration
│   ├── utils/                 # Utility functions
│   │   ├── helpers/          # Helper functions
│   │   ├── constants/        # Constants and enums
│   │   └── validators/       # Validation functions
│   ├── types/                 # TypeScript type definitions
│   │   ├── api.types.ts      # API response types
│   │   └── models.types.ts   # Domain model types
│   ├── styles/                # Global styles
│   │   ├── globals.css       # Global CSS
│   │   └── theme.ts          # Theme configuration
│   ├── assets/                # Assets (images, fonts, icons)
│   ├── config/                # Configuration files
│   │   ├── env.ts            # Environment variables
│   │   └── routes.ts         # Route definitions
│   ├── App.tsx                # Root component
│   ├── main.tsx               # Application entry point
│   └── vite-env.d.ts          # Vite type definitions
├── tests/                     # Test files
│   ├── unit/                  # Unit tests
│   ├── integration/           # Integration tests
│   └── e2e/                   # End-to-end tests
├── .env.example               # Environment variable template
├── .env.local                 # Local environment variables (gitignored)
├── .eslintrc.cjs              # ESLint configuration
├── .prettierrc                # Prettier configuration
├── .gitignore                 # Git ignore patterns
├── CLAUDE.md                  # This file
├── LICENSE                    # Apache 2.0 License
├── README.md                  # Project documentation
├── package.json               # Dependencies and scripts
├── tsconfig.json              # TypeScript configuration
├── tsconfig.node.json         # TypeScript config for Node
├── vite.config.ts             # Vite configuration
└── vitest.config.ts           # Vitest configuration
```

---

## Development Workflows

### Initial Setup

When setting up the project for the first time:

```bash
# 1. Initialize with Vite + React + TypeScript
npm create vite@latest . -- --template react-ts

# 2. Install dependencies
npm install

# 3. Install development dependencies
npm install -D eslint prettier husky lint-staged @typescript-eslint/parser @typescript-eslint/eslint-plugin

# 4. Initialize Husky
npx husky init

# 5. Create .gitignore
cat > .gitignore << EOF
# Dependencies
node_modules/
.pnp/
.pnp.js

# Build outputs
dist/
build/
.vite/

# Environment
.env.local
.env.*.local

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# OS
.DS_Store
Thumbs.db

# Logs
logs/
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Testing
coverage/
.nyc_output/

# Misc
.cache/
.temp/
EOF
```

### Development Scripts

Standard npm scripts to include in package.json:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "lint:fix": "eslint . --ext ts,tsx --fix",
    "format": "prettier --write \"src/**/*.{ts,tsx,css,md}\"",
    "format:check": "prettier --check \"src/**/*.{ts,tsx,css,md}\"",
    "type-check": "tsc --noEmit",
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage",
    "test:e2e": "playwright test",
    "prepare": "husky install"
  }
}
```

### Development Process

1. **Start Development Server**: `npm run dev`
2. **Run Tests**: `npm run test`
3. **Check Types**: `npm run type-check`
4. **Lint Code**: `npm run lint`
5. **Format Code**: `npm run format`
6. **Build for Production**: `npm run build`
7. **Preview Production Build**: `npm run preview`

---

## Key Conventions

### Code Style

**TypeScript:**
- Use TypeScript for all new files (.ts, .tsx)
- Define types explicitly, avoid `any` type
- Use interfaces for object shapes
- Use type aliases for unions and complex types
- Prefer `const` over `let`, avoid `var`

**Naming Conventions:**
- **Files**: PascalCase for components (`Button.tsx`), camelCase for utilities (`formatDate.ts`)
- **Components**: PascalCase (`UserProfile`)
- **Functions**: camelCase (`handleSubmit`)
- **Constants**: UPPER_SNAKE_CASE (`API_BASE_URL`)
- **Types/Interfaces**: PascalCase with descriptive names (`UserProfile`, `ApiResponse`)
- **Hooks**: camelCase starting with `use` (`useAuth`, `useFetchData`)

**Component Structure:**
```typescript
// 1. Imports (external first, then internal)
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { Button } from '@/components/common/Button';
import { formatDate } from '@/utils/helpers';
import type { User } from '@/types/models.types';

// 2. Types/Interfaces
interface UserCardProps {
  user: User;
  onEdit?: (id: string) => void;
}

// 3. Component
export const UserCard: React.FC<UserCardProps> = ({ user, onEdit }) => {
  // 3a. Hooks
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(false);

  // 3b. Effects
  useEffect(() => {
    // effect logic
  }, []);

  // 3c. Event handlers
  const handleClick = () => {
    setIsExpanded(!isExpanded);
  };

  // 3d. Render helpers
  const renderUserInfo = () => {
    // render logic
  };

  // 3e. Return JSX
  return (
    <div>
      {/* JSX */}
    </div>
  );
};
```

### File Organization

**Component Files:**
- One component per file
- Co-locate tests: `Button.tsx` and `Button.test.tsx` in same directory
- Co-locate styles if using CSS modules: `Button.module.css`
- Export components as named exports: `export const Button`

**Index Files:**
- Use `index.ts` files to re-export from directories
- Makes imports cleaner: `import { Button } from '@/components/common'`

### State Management

**Local State:**
- Use `useState` for component-local state
- Use `useReducer` for complex state logic

**Global State:**
- Use context for theme, auth, simple global state
- Use state management library (Zustand/Redux) for complex app state
- Keep API/server state separate with TanStack Query

### API Integration

**Structure:**
```typescript
// src/services/api/client.ts - API client setup
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
});

// src/services/api/endpoints/users.ts - Endpoint definitions
export const usersApi = {
  getUser: (id: string) => apiClient.get<User>(`/users/${id}`),
  listUsers: (params: ListParams) => apiClient.get<User[]>('/users', { params }),
};

// src/hooks/useUsers.ts - React Query hooks
export const useUser = (id: string) => {
  return useQuery({
    queryKey: ['user', id],
    queryFn: () => usersApi.getUser(id),
  });
};
```

### Error Handling

**Component Level:**
```typescript
try {
  await performAction();
} catch (error) {
  console.error('Action failed:', error);
  toast.error('Failed to perform action');
}
```

**API Level:**
- Use axios interceptors for global error handling
- Implement retry logic for network failures
- Handle authentication errors globally

### Testing

**Unit Tests:**
- Test utilities and pure functions thoroughly
- Use describe/it blocks for organization
- Aim for high coverage on business logic

**Component Tests:**
- Test user interactions, not implementation
- Use React Testing Library's user-centric queries
- Test accessibility

**E2E Tests:**
- Test critical user flows
- Test happy paths and error cases
- Keep E2E tests maintainable and fast

---

## AI Assistant Guidelines

### General Principles

1. **Understand Before Acting**: Always explore the codebase before making changes
2. **Follow Existing Patterns**: Match the established code style and architecture
3. **TypeScript First**: Always use TypeScript, never plain JavaScript
4. **Test Your Changes**: Run tests and type-checking before committing
5. **Small, Focused Changes**: Make atomic commits with clear purposes
6. **Ask When Uncertain**: If requirements are ambiguous, ask for clarification

### When Initializing the Project

If the user asks to set up or initialize the project:

1. **Confirm Technology Choices**: Ask about preferred framework (React/Vue/Svelte)
2. **Verify Requirements**: Understand the indexer system requirements
3. **Follow Modern Standards**: Use latest stable versions of tools
4. **Set Up Tooling**: Configure linting, formatting, and testing from the start
5. **Create Documentation**: Add README.md with setup instructions

### When Adding Features

1. **Plan First**: Use the TodoWrite tool to break down the task
2. **Check Dependencies**: Verify required packages are installed
3. **Follow Structure**: Place files in appropriate directories
4. **Type Everything**: Create proper TypeScript types
5. **Write Tests**: Add tests for new functionality
6. **Update Documentation**: Update README or comments as needed

### When Fixing Bugs

1. **Reproduce the Issue**: Understand the bug before fixing
2. **Find Root Cause**: Don't just patch symptoms
3. **Add Tests**: Prevent regression with tests
4. **Consider Edge Cases**: Think about boundary conditions
5. **Document the Fix**: Explain why the bug occurred

### When Refactoring

1. **Preserve Behavior**: Don't change functionality while refactoring
2. **Run Tests Frequently**: Ensure nothing breaks
3. **Incremental Changes**: Make small, verifiable steps
4. **Update References**: Find and update all usages
5. **Clean Up Imports**: Remove unused imports and dependencies

### Code Quality Checks

Before committing, always:

1. **Run Type Checker**: `npm run type-check`
2. **Run Linter**: `npm run lint`
3. **Format Code**: `npm run format`
4. **Run Tests**: `npm run test`
5. **Check Build**: `npm run build`

### Common Patterns

**When reading files:**
- Use Read tool for specific files
- Use Glob tool for finding files by pattern
- Use Grep tool for searching content
- Use Task/Explore tool for understanding large codebases

**When making changes:**
- Read the file first with Read tool
- Use Edit tool for modifications
- Use Write tool only for new files
- Verify changes by reading the file again

**When working with git:**
- Check git status before committing
- Write clear, descriptive commit messages
- Follow conventional commit format if established
- Push to the designated branch

---

## Common Tasks

### Task: Initialize Project with Vite + React + TypeScript

```bash
# Create Vite project
npm create vite@latest . -- --template react-ts

# Install additional dependencies
npm install react-router-dom zustand @tanstack/react-query axios

# Install dev dependencies
npm install -D @types/node eslint prettier tailwindcss postcss autoprefixer
npm install -D vitest @testing-library/react @testing-library/jest-dom
npm install -D husky lint-staged

# Initialize Tailwind
npx tailwindcss init -p
```

### Task: Add New Component

1. Create component file in appropriate directory
2. Define TypeScript interface for props
3. Implement component following conventions
4. Create test file
5. Export from index.ts
6. Update documentation if needed

### Task: Add New API Endpoint

1. Define TypeScript types for request/response
2. Add endpoint to API client
3. Create React Query hook
4. Add tests for the hook
5. Use in components

### Task: Add New Page/Route

1. Create page component in `src/pages/`
2. Define route in router configuration
3. Add navigation links if needed
4. Add page-level tests
5. Update documentation

---

## Git Workflow

### Branch Strategy

**Development Branch:** `claude/claude-md-mi3xygmziw6cms5f-01TgNRkqJ9McnW28AXx6QsrS`

- All development work happens on this branch
- Never push to main/master without permission
- Create feature branches if needed for complex features

### Commit Message Format

Use conventional commits format:

```
type(scope): subject

body (optional)

footer (optional)
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**
```
feat(auth): add user authentication flow

fix(api): handle timeout errors in user service

docs(readme): update installation instructions

refactor(components): extract common button logic
```

### Git Commands

**Push changes:**
```bash
# Push to development branch
git push -u origin claude/claude-md-mi3xygmziw6cms5f-01TgNRkqJ9McnW28AXx6QsrS
```

**Commit workflow:**
```bash
# Stage changes
git add .

# Commit with message
git commit -m "feat(init): initialize project with Vite and React"

# Push to remote
git push -u origin claude/claude-md-mi3xygmziw6cms5f-01TgNRkqJ9McnW28AXx6QsrS
```

### Pre-commit Checks

Configure Husky to run these checks before commits:

```bash
# .husky/pre-commit
npm run lint
npm run type-check
npm run test -- --run
```

---

## Environment Variables

### Environment Variable Management

**Files:**
- `.env.example`: Template with all required variables (committed)
- `.env.local`: Local development values (gitignored)
- `.env.production`: Production values (not in repo)

**Naming Convention:**
- Prefix with `VITE_` for client-side variables
- Use UPPER_SNAKE_CASE: `VITE_API_BASE_URL`

**Example .env.example:**
```bash
# API Configuration
VITE_API_BASE_URL=http://localhost:3000/api
VITE_API_TIMEOUT=10000

# Feature Flags
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_DEBUG=true

# External Services
VITE_INDEXER_WS_URL=ws://localhost:8080
```

**Accessing in Code:**
```typescript
// src/config/env.ts
export const env = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL,
  apiTimeout: Number(import.meta.env.VITE_API_TIMEOUT),
  enableAnalytics: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
} as const;
```

---

## Performance Guidelines

### Optimization Strategies

1. **Code Splitting**: Use dynamic imports for routes
2. **Lazy Loading**: Lazy load heavy components
3. **Memoization**: Use React.memo, useMemo, useCallback appropriately
4. **Bundle Size**: Monitor and optimize bundle size
5. **Image Optimization**: Use WebP, lazy loading for images
6. **Caching**: Implement proper caching strategies

### React Performance

```typescript
// Memoize expensive computations
const expensiveValue = useMemo(() => {
  return computeExpensiveValue(data);
}, [data]);

// Memoize callbacks
const handleClick = useCallback(() => {
  doSomething(id);
}, [id]);

// Memoize components
export const ExpensiveComponent = React.memo(({ data }) => {
  return <div>{/* render */}</div>;
});
```

---

## Security Guidelines

### Security Best Practices

1. **Sanitize User Input**: Always validate and sanitize
2. **XSS Prevention**: Use React's built-in XSS protection, avoid dangerouslySetInnerHTML
3. **CSRF Protection**: Implement CSRF tokens for mutations
4. **Authentication**: Store tokens securely (httpOnly cookies preferred)
5. **HTTPS Only**: Force HTTPS in production
6. **Content Security Policy**: Implement CSP headers
7. **Dependency Audits**: Regularly run `npm audit`

### Secure Coding

```typescript
// ❌ BAD: XSS vulnerability
<div dangerouslySetInnerHTML={{ __html: userInput }} />

// ✅ GOOD: React's built-in escaping
<div>{userInput}</div>

// ❌ BAD: Storing sensitive data in localStorage
localStorage.setItem('token', authToken);

// ✅ GOOD: Use httpOnly cookies or secure storage
// Let the backend handle token storage via httpOnly cookies
```

---

## Accessibility Guidelines

### A11y Best Practices

1. **Semantic HTML**: Use proper HTML elements
2. **ARIA Labels**: Add ARIA labels where needed
3. **Keyboard Navigation**: Ensure keyboard accessibility
4. **Color Contrast**: Meet WCAG AA standards (4.5:1 ratio)
5. **Screen Reader**: Test with screen readers
6. **Focus Management**: Manage focus properly in SPAs

### Accessible Components

```typescript
// Accessible button
<button
  type="button"
  aria-label="Close dialog"
  onClick={handleClose}
>
  <CloseIcon aria-hidden="true" />
</button>

// Accessible form
<form onSubmit={handleSubmit}>
  <label htmlFor="email">
    Email Address
    <input
      id="email"
      type="email"
      required
      aria-required="true"
      aria-describedby="email-error"
    />
  </label>
  <span id="email-error" role="alert">
    {emailError}
  </span>
</form>
```

---

## Troubleshooting

### Common Issues

**Build Fails:**
- Check TypeScript errors: `npm run type-check`
- Check for missing dependencies: `npm install`
- Clear cache: `rm -rf node_modules/.vite`

**Tests Failing:**
- Update snapshots if needed: `npm run test -- -u`
- Check for async issues: ensure proper `await` usage
- Verify mocks are set up correctly

**Linting Errors:**
- Auto-fix: `npm run lint:fix`
- Check ESLint configuration
- Verify peer dependencies are installed

**Type Errors:**
- Check tsconfig.json settings
- Verify type declaration files exist
- Install @types packages if needed

---

## Resources

### Documentation Links

Once the project is initialized, refer to:

- **React**: https://react.dev
- **TypeScript**: https://www.typescriptlang.org/docs
- **Vite**: https://vitejs.dev/guide
- **TanStack Query**: https://tanstack.com/query/latest
- **React Router**: https://reactrouter.com
- **Tailwind CSS**: https://tailwindcss.com/docs
- **Vitest**: https://vitest.dev/guide
- **Testing Library**: https://testing-library.com/docs/react-testing-library/intro

### Learning Resources

- **React Patterns**: https://reactpatterns.com
- **TypeScript Deep Dive**: https://basarat.gitbook.io/typescript
- **Web.dev Performance**: https://web.dev/performance
- **A11y Project**: https://www.a11yproject.com

---

## Changelog

### 2025-11-18
- Initial CLAUDE.md creation
- Documented empty repository state
- Established conventions and guidelines
- Added initialization instructions

---

## Notes for AI Assistants

### Current Priority
The repository is **uninitialized**. The first priority should be to:

1. Discuss with the user their vision for the indexer frontend
2. Confirm technology stack preferences
3. Initialize the project with chosen stack
4. Set up development tooling
5. Create initial project structure
6. Update this document with actual implementation details

### Questions to Ask User

Before proceeding with initialization:

1. **What type of indexer is this for?** (Blockchain, database, search, etc.)
2. **What data will be displayed?** (Helps determine state management needs)
3. **Real-time updates needed?** (WebSocket integration required?)
4. **Authentication required?** (Plan auth flow)
5. **Target users?** (Technical vs. general audience affects UX decisions)
6. **Deployment target?** (Affects build configuration)
7. **Framework preference?** (React, Vue, Svelte, etc.)

### Remember

- This document should evolve as the project develops
- Update conventions when patterns emerge
- Document architectural decisions
- Keep examples current with actual code
- Remove this "Notes for AI Assistants" section once project is established

---

**This CLAUDE.md file is a living document. Update it as the project evolves!**
