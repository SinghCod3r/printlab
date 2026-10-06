# OpenPrinting PrintLab

**Automated testing and regression visibility for the Linux printing stack.**

PrintLab is a community prototype demonstrating a centralized web interface and orchestration layer for automated Linux printing-system testing. It is designed around the real OpenPrinting architecture, utilizing concepts like driverless IPP, Printer Applications, and modern automated testing.

> **Note**: This is a community prototype and is not an official OpenPrinting service unless explicitly adopted by OpenPrinting. All test data provided in the prototype is for demonstration purposes.

## Why PrintLab?
As CUPS transitions to version 3.x (an all-IPP driverless architecture), ensuring the printing stack remains stable across hundreds of printer models is critical. OpenPrinting already has the components for virtual printing (`go-mfp`) and image output evaluation (SSIM/PSNR via OpenCV). PrintLab is the missing **orchestration and visibility layer** that connects these tools into a unified testing pipeline.

## 🚀 Live Demo
**PrintLab is live and fully automated on GitHub Pages:**
👉 **[https://singhcod3r.github.io/printlab/](https://singhcod3r.github.io/printlab/)**

## 🏗️ GitOps Architecture
PrintLab is built with a 100% serverless, zero-maintenance architecture:
- **No Database:** All test results and data are stored directly in this repository as static JSON files in the `data/` directory.
- **Frontend (GitHub Pages):** The dashboard is a Next.js static export. It is automatically built and deployed to GitHub Pages via the `.github/workflows/deploy.yml` action whenever changes are merged.
- **Automation Engine (GitHub Actions):** Test execution is handled completely by GitHub Actions (`.github/workflows/run-tests.yml`). The action installs CUPS, Ghostscript, and Python, runs the test runner, and commits the updated data back to the repository.
- **Triggering Tests:** You can request a new test run directly from the live dashboard. Doing so opens a GitHub Issue, which triggers the test automation pipeline securely without exposing API keys.

## Features
- **Test Orchestration**: Configure test runs combining specific CUPS versions, simulated printer models, print modes, and test documents.
- **Ecosystem Explorer**: Browse OpenPrinting projects, their architectural roles, and dependencies.
- **Metric Tracking**: Granular tracking of structural similarity (SSIM) and peak signal-to-noise ratio (PSNR) across print output.
- **Batch Testing**: Compare pass rates across an entire matrix of printer models and CUPS builds.

## Local Development (Optional)
If you wish to modify the dashboard UI locally:

```bash
git clone https://github.com/SinghCod3r/printlab.git
cd printlab
npm install
npm run dev
```
Open `http://localhost:3000` to view the application.

## Architecture
See [ARCHITECTURE.md](ARCHITECTURE.md) for a detailed breakdown of how the UI connects to the test provider layer.

## Documentation
- [OpenPrinting Alignment](OPENPRINTING_ALIGNMENT.md) - How this project aligns with real OpenPrinting infrastructure.
- [Data Model](DATA_MODEL.md) - The core types and entities used in the system.
- [Development](DEVELOPMENT.md) - Guide for developers.
- [Roadmap](ROADMAP.md) - Future plans for integrating the real testing pipeline.
