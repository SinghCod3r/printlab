# Development Guide

This guide is for developers working on the PrintLab prototype.

## Prerequisites
- Node.js (v18+)
- npm

## Getting Started
1. Clone the repository
2. Install dependencies: `npm install`
3. Start the development server: `npm run dev`
4. Open [http://localhost:3000](http://localhost:3000)

## Code Quality Rules
**CRITICAL: DO NOT WRITE COMMENTS IN THE CODE.**
This repository enforces a strict zero-comment policy in the source files. 
- No inline comments `//`
- No block comments `/* */`
- No JSX comments `{/* */}`
Code should be perfectly self-documenting through clean variable naming, small functions, and clear types. All documentation must live in `.md` files like this one.

## Demo Data
All fixture data is located in `src/lib/demo-data.ts`. Modifying this file will change the data presented across the entire application. The data is deterministic based on hash functions to ensure consistency between test runs, regressions, and metrics.

## Building for Production
```bash
npm run build
npm start
```

## Adding a new Page
1. Create a new directory in `src/app/(app)/`.
2. Add a `page.tsx` file.
3. Import `provider` from `src/lib/provider.ts` to fetch data server-side.
4. If you need navigation, update `navItems` in `src/components/app-shell.tsx`.
