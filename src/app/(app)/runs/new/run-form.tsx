"use client";

import { useTransition } from "react";
import { PrinterModel, CUPSVersion, TestSuite, TestDocument, Simulator } from "@/lib/types";
import { createTestRunAction } from "./actions";
import { Card } from "@/components/ui";

interface RunFormProps {
  printers: PrinterModel[];
  simulators: Simulator[];
  cupsVersions: CUPSVersion[];
  testSuites: TestSuite[];
  documents: TestDocument[];
}

export function RunForm({ printers, simulators, cupsVersions, testSuites, documents }: RunFormProps) {
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(() => {
      createTestRunAction(formData);
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card className="flex flex-col gap-4">
        <h2 className="text-lg font-medium">Printer & Simulator</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="printerModelId" className="text-sm font-medium">Printer Model</label>
            <select
              id="printerModelId"
              name="printerModelId"
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              required
            >
              <option value="">Select a printer...</option>
              {printers.map((p) => (
                <option key={p.id} value={p.id}>{p.manufacturer} {p.name}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="simulatorId" className="text-sm font-medium">Simulator</label>
            <select
              id="simulatorId"
              name="simulatorId"
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              required
            >
              <option value="">Select a simulator...</option>
              {simulators.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      <Card className="flex flex-col gap-4">
        <h2 className="text-lg font-medium">Printing System</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="cupsVersionId" className="text-sm font-medium">CUPS Version</label>
            <select
              id="cupsVersionId"
              name="cupsVersionId"
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              required
            >
              <option value="">Select CUPS version...</option>
              {cupsVersions.map((v) => (
                <option key={v.id} value={v.id}>CUPS {v.version}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="printSystemType" className="text-sm font-medium">System Type</label>
            <select
              id="printSystemType"
              name="printSystemType"
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              required
            >
              <option value="cups-local">CUPS Local</option>
              <option value="cups-shared">CUPS Shared</option>
              <option value="cups-ipp">CUPS IPP Everywhere</option>
              <option value="cups-printer-app">CUPS Printer App</option>
            </select>
          </div>
        </div>
      </Card>

      <Card className="flex flex-col gap-4">
        <h2 className="text-lg font-medium">Print Modes</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="colorMode" className="text-sm font-medium">Color Mode</label>
            <select id="colorMode" name="colorMode" className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm" required>
              <option value="color">Color</option>
              <option value="monochrome">Monochrome</option>
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="duplexMode" className="text-sm font-medium">Duplex Mode</label>
            <select id="duplexMode" name="duplexMode" className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm" required>
              <option value="simplex">Simplex</option>
              <option value="duplex-long-edge">Duplex (Long Edge)</option>
              <option value="duplex-short-edge">Duplex (Short Edge)</option>
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="orientation" className="text-sm font-medium">Orientation</label>
            <select id="orientation" name="orientation" className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm" required>
              <option value="portrait">Portrait</option>
              <option value="landscape">Landscape</option>
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="dpi" className="text-sm font-medium">DPI</label>
            <input id="dpi" name="dpi" type="number" defaultValue="600" className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm" required />
          </div>
        </div>
      </Card>

      <Card className="flex flex-col gap-4">
        <h2 className="text-lg font-medium">Test Configuration</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="documentId" className="text-sm font-medium">Test Document</label>
            <select id="documentId" name="documentId" className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm" required>
              <option value="">Select a document...</option>
              {documents.map((d) => (
                <option key={d.id} value={d.id}>{d.name} ({d.type})</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="testSuiteId" className="text-sm font-medium">Test Suite</label>
            <select id="testSuiteId" name="testSuiteId" className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm" required>
              <option value="">Select a test suite...</option>
              {testSuites.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      <div className="flex justify-end gap-4 mt-6">
        <button
          type="button"
          className="px-4 py-2 text-sm font-medium text-foreground bg-transparent border border-input rounded-md shadow-sm hover:bg-accent hover:text-accent-foreground"
          onClick={() => window.history.back()}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="px-4 py-2 text-sm font-medium text-primary-foreground bg-primary rounded-md shadow-sm hover:bg-primary/90 disabled:opacity-50"
        >
          {isPending ? "Starting Run..." : "Start Test Run"}
        </button>
      </div>
    </form>
  );
}
