# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview
This is a Hacker News client built with TanStack Start (React framework), TanStack Router for routing, and TanStack Query for data fetching. The app provides a modern, responsive interface for browsing Hacker News stories with infinite scrolling, real-time comments, and user settings management.

## Common Development Commands
- `bun dev` - Start development server (runs on port 3001)
- `bun run build` - Build for production (includes TypeScript type checking)
- `bun start` - Start production server
- `bun run lint` - Format and fix code using Ultracite (Biome-based linter/formatter)

## Architecture & Code Structure

### Key Technologies
- **Framework**: TanStack Start (full-stack React framework)
- **Routing**: TanStack Router with file-based routing
- **Data Fetching**: TanStack Query for caching and infinite queries
- **Styling**: Tailwind CSS with custom components
- **Type Safety**: TypeScript with strict configuration
- **Linting/Formatting**: Ultracite (extends Biome) with pre-commit hooks

### Directory Structure
```
src/
├── components/       # Reusable React components
│   ├── ui/          # Shadcn/ui-style components (Button, Dialog, etc.)
│   └── *.tsx        # App-specific components (PostList, Comments, etc.)
├── lib/             # Core utilities and data fetching
│   ├── hooks/       # Custom React hooks (useInfinitePosts, etc.)
│   ├── fetch-*.ts   # Data fetching functions for posts/comments
│   ├── types.ts     # TypeScript type definitions
│   └── user-settings.ts # Isomorphic user preferences management
├── routes/          # File-based routing structure
│   ├── __root.tsx   # Root layout component
│   ├── _app.tsx     # Main app layout with sidebar/mobile nav
│   └── _app.*.tsx   # Category-specific routes (top, new, ask, etc.)
├── styles/          # Global CSS and Tailwind configuration
└── utils/           # Utility functions
```

### Data Flow Architecture
1. **Route Loaders**: Each route pre-fetches initial data on the server
2. **Query Client**: TanStack Query manages caching, with 5min stale time, 10min gc time
3. **Infinite Queries**: Posts load in batches of 10 with infinite scrolling
4. **Optimistic Updates**: Post data is cached when fetched in lists for instant navigation

### Key Patterns
- **File-based Routing**: Routes follow `_app.$category.tsx` pattern for nested layouts
- **Isomorphic Functions**: User settings work both client/server-side using TanStack Start utilities
- **Error Boundaries**: Global error handling with custom catch boundary components
- **Mobile-First**: Responsive design with mobile overlay patterns for navigation

### API Integration
- **Hacker News Firebase API**: Fetches posts/comments via Firebase REST API
- **Error Handling**: Graceful handling of deleted/missing posts with retry logic
- **Rate Limiting**: Respects API constraints with proper batching

### Styling Guidelines
- **Tailwind CSS**: Utility-first styling with custom theme extensions
- **Dark Mode**: Theme switching via next-themes with user preference persistence
- **Component Library**: Radix UI primitives with custom styling
- **Responsive**: Mobile-first design with desktop sidebar layout

### Development Workflow
- **Pre-commit Hooks**: Lefthook runs Ultracite formatting on staged files
- **Type Safety**: Strict TypeScript with path mapping (`~/*` for src)
- **Code Quality**: Biome rules extended by Ultracite for consistent formatting
- **Git Hooks**: Automatic code formatting and organization on commit

## Testing & Quality
- TypeScript compilation check included in build process
- Ultracite enforces strict code quality and accessibility standards
- Pre-commit hooks ensure consistent code formatting

## Deployment
- Target: Cloudflare modules (configured in vite.config.ts)
- Build output: `.output/` directory with server and client bundles
- SSR: Full server-side rendering support with TanStack Start