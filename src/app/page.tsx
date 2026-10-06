import Link from "next/link";
import { ArrowRight, Network } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="flex items-center justify-between px-6 py-4 border-b border-border bg-card">
        <div className="flex items-center gap-2">
          <img src="/printlab/logo.png" className="h-5 w-5 object-contain" />
          <span className="font-semibold text-sm">OpenPrinting PrintLab</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-green-200 bg-green-50 px-2.5 py-0.5 text-[11px] font-medium text-green-700">
            <span className="h-1.5 w-1.5 rounded-full bg-green-600 animate-pulse" />
            Live Platform
          </span>
          <a
            href="https://github.com/OpenPrinting"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            OpenPrinting
          </a>
        </div>
      </header>

      <main className="flex-1">
        <section className="max-w-3xl mx-auto px-6 pt-20 pb-16 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
            OpenPrinting PrintLab
          </h1>
          <p className="mt-3 text-lg text-muted-foreground max-w-xl mx-auto">
            Automated testing and regression visibility for the Linux printing stack
          </p>

          <div className="mt-8 flex items-center justify-center gap-3 text-sm font-medium text-muted-foreground">
            <span className="px-3 py-1.5 rounded-md bg-muted">Run</span>
            <ArrowRight className="h-4 w-4" />
            <span className="px-3 py-1.5 rounded-md bg-muted">Compare</span>
            <ArrowRight className="h-4 w-4" />
            <span className="px-3 py-1.5 rounded-md bg-muted">Detect</span>
            <ArrowRight className="h-4 w-4" />
            <span className="px-3 py-1.5 rounded-md bg-muted">Understand</span>
          </div>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-md bg-blue-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-800 transition-colors"
            >
              Open Test Lab
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/architecture"
              className="inline-flex items-center gap-2 rounded-md border border-border px-5 py-2.5 text-sm font-medium text-foreground hover:bg-muted transition-colors"
            >
              <Network className="h-4 w-4" />
              Explore Architecture
            </Link>
          </div>
        </section>

        <section className="max-w-4xl mx-auto px-6 pb-20">
          <div className="rounded-lg border border-border bg-card p-8">
            <h2 className="text-lg font-semibold mb-3">Why PrintLab?</h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              OpenPrinting already has important pieces of the testing infrastructure &mdash;
              including printer simulation via <strong>go-mfp</strong> and image evaluation
              using SSIM/PSNR metrics with OpenCV. PrintLab demonstrates how those components
              could be connected into an automated testing and regression workflow.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed mb-6">
              As CUPS transitions from 2.x to 3.x with its all-IPP driverless architecture,
              and Printer Applications replace traditional drivers, systematic testing across
              versions, printer models, and configurations becomes essential.
            </p>

            <div className="grid sm:grid-cols-3 gap-4">
              <div className="rounded-md border border-border p-4">
                <h3 className="text-sm font-medium mb-1">Simulate</h3>
                <p className="text-xs text-muted-foreground">
                  Test against virtual printer models without physical hardware using
                  Go-based MFP simulation.
                </p>
              </div>
              <div className="rounded-md border border-border p-4">
                <h3 className="text-sm font-medium mb-1">Evaluate</h3>
                <p className="text-xs text-muted-foreground">
                  Compare expected vs actual output with SSIM, PSNR, and pixel-level
                  difference analysis.
                </p>
              </div>
              <div className="rounded-md border border-border p-4">
                <h3 className="text-sm font-medium mb-1">Detect</h3>
                <p className="text-xs text-muted-foreground">
                  Automatically detect regressions across CUPS versions and printer models
                  with regression tracking.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-lg border border-border bg-card p-6">
            <h2 className="text-sm font-semibold mb-3">Conceptual Pipeline</h2>
            <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-muted-foreground">
              {[
                "Printer Model",
                "Test Config",
                "CUPS",
                "Print Queue",
                "Print Job",
                "Printer Simulator",
                "Captured Output",
                "Image Evaluation",
                "Pass / Fail",
                "Regression History",
                "CI Integration",
              ].map((step, i) => (
                <span key={step} className="flex items-center gap-2">
                  <span className="px-2 py-1 rounded bg-muted text-foreground">
                    {step}
                  </span>
                  {i < 10 && <ArrowRight className="h-3 w-3" />}
                </span>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border bg-card px-6 py-4">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
          <p>OpenPrinting PrintLab &middot; Automated testing pipeline</p>
          <div className="flex items-center gap-4">
            <a
              href="https://github.com/OpenPrinting"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors"
            >
              GitHub
            </a>
            <a
              href="https://openprinting.github.io/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors"
            >
              OpenPrinting
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
