# PrintLab Data Model

The data layer uses strict TypeScript interfaces defined in `src/lib/types.ts`.

## Core Entities

### PrinterModel & Simulator
Represents the target hardware or virtual simulator. `PrinterModel` defines capabilities (DPI, Color, Duplex), while `Simulator` represents the actual virtual instance running in the test infrastructure (backed by `go-mfp`).

### CUPSVersion
The specific build of the print system being tested. Crucial for detecting regressions between `2.4.x`, `2.5.x`, and future `3.x` branches.

### TestSuite & TestCase
A `TestCase` is a single verification (e.g. "Duplex Long Edge"). A `TestSuite` is a logical grouping (e.g. "Smoke Test", "Full Capability").

### TestRun & TestResult
The orchestration outputs. A `TestRun` groups the overall execution. It contains multiple `TestResult` objects, one for each `TestCase`. `TestResult` contains the `ImageMetrics`.

### ImageMetrics
The core of the visual regression system:
- `ssim`: Structural Similarity Index (1.0 = perfect match)
- `psnr`: Peak Signal-to-Noise Ratio 
- `pixelDifference`: Absolute number of differing pixels
- `affectedAreaPercent`: Percentage of the document area affected by differences.

### Regression
Created when a `TestCase` that previously yielded a `pass` on a prior `CUPSVersion` yields a `fail` on a newer `CUPSVersion` for the same `PrinterModel`.
