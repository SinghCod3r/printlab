# OpenPrinting PrintLab

**Automated testing and regression visibility for the Linux printing stack.**

PrintLab is a community prototype demonstrating a centralized web interface and orchestration layer for automated Linux printing-system testing. It is designed around the real OpenPrinting architecture, utilizing concepts like driverless IPP, Printer Applications, and modern automated testing.

> **Note**: This is a community prototype and is not an official OpenPrinting service unless explicitly adopted by OpenPrinting. All test data provided in the prototype is for demonstration purposes.

## Why PrintLab?
As CUPS transitions to version 3.x (an all-IPP driverless architecture), ensuring the printing stack remains stable across hundreds of printer models is critical. OpenPrinting already has the components for virtual printing (`go-mfp`) and image output evaluation (SSIM/PSNR via OpenCV). PrintLab is the missing **orchestration and visibility layer** that connects these tools into a unified testing pipeline.

## Features
- **Test Orchestration**: Configure test runs combining specific CUPS versions, simulated printer models, print modes, and test documents.
- **Visual Regression Detection**: Side-by-side visual comparison of Expected vs. Actual raster output, complete with difference highlighting.
- **Ecosystem Explorer**: Browse OpenPrinting projects, their architectural roles, and dependencies.
- **Metric Tracking**: Granular tracking of structural similarity (SSIM) and peak signal-to-noise ratio (PSNR) across print output.
- **Batch Testing**: Compare pass rates across an entire matrix of printer models and CUPS builds.

## Setup and Installation

Requirements:
- Node.js 18+
- npm or pnpm

```bash
git clone https://github.com/OpenPrinting/printlab-prototype.git
cd printlab-prototype
npm install
npm run dev
```
Open `http://localhost:3000` to view the application.

## Architecture
See [ARCHITECTURE.md](ARCHITECTURE.md) for a detailed breakdown of how the UI connects to the test provider layer and future integration plans with real runners.

## Documentation
- [OpenPrinting Alignment](OPENPRINTING_ALIGNMENT.md) - How this project aligns with real OpenPrinting infrastructure.
- [Data Model](DATA_MODEL.md) - The core types and entities used in the system.
- [Development](DEVELOPMENT.md) - Guide for developers.
- [Roadmap](ROADMAP.md) - Future plans for integrating the real testing pipeline.
