# Architecture

PrintLab uses a modern, lightweight web stack optimized for static deployment or serverless execution.

## Stack
- **Framework**: Next.js (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Components**: Lucide Icons, Custom UI Primitives (inspired by shadcn/ui)
- **Data Layer**: Abstracted `TestProvider` interface

## Test Provider Abstraction
The data layer is completely abstracted behind `TestProvider` (`src/lib/types.ts`). 
Currently, the application is backed by `DemoProvider` (`src/lib/provider.ts`), which serves deterministic static fixtures.

In a real deployment, a `RealRunnerProvider` would implement the same interface and communicate with a backend REST/GraphQL API attached to the OpenPrinting CI orchestrator.

## Directory Structure
- `src/app`: Next.js App Router definitions.
  - `(app)`: Main dashboard routes utilizing the sidebar AppShell.
  - `welcome`: The landing/splash page.
- `src/components`: Reusable UI components (`ui.tsx`, `app-shell.tsx`).
- `src/lib`: Core logic, types, utilities, and data providers.

## Key Concepts
1. **TestRun**: A single execution of a test suite against a specific CUPS version and Printer Model.
2. **TestResult**: The outcome of a single `TestCase` within a `TestRun`, containing image metrics (SSIM, PSNR).
3. **Regression**: A detected failure in a test case that previously passed on an older CUPS version.
