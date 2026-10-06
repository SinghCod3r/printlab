"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PageHeader, Card, Badge, ProgressBar } from "@/components/ui";
import { formatDuration, formatDate, statusBg } from "@/lib/utils";
import { TestRun, TestResult } from "@/lib/types";
import { Terminal, Settings, Printer, Cpu, FileText, LayoutTemplate, Copy } from "lucide-react";

export default function RunDetailsClient({ initialRun, initialResults, runId }: { initialRun: TestRun, initialResults: TestResult[], runId: string }) {
  const [run, setRun] = useState<TestRun>(initialRun);
  const [results, setResults] = useState<TestResult[]>(initialResults);

  const isRunning = run.status === "queued" || run.status === "preparing" || run.status === "running";

  useEffect(() => {
    if (!isRunning) return;
    
    const interval = setInterval(async () => {
      try {
        const runRes = await fetch(`/api/runs/${runId}`);
        if (runRes.ok) {
          const data = await runRes.json();
          setRun(data.run);
          setResults(data.results);
        }
      } catch (err) {
        console.error(err);
      }
    }, 1000); // Polling faster for real-time logs

    return () => clearInterval(interval);
  }, [isRunning, runId]);

  const passed = results.filter((r) => r.verdict?.toLowerCase() === "pass").length;
  const failed = results.filter((r) => r.verdict?.toLowerCase() === "fail").length;
  const total = results.length || run.totalTests || 1;
  const progress = Math.round(((passed + failed) / total) * 100);

  // Find the currently running test for live logs
  const runningTest = results.find(r => r.verdict === "running" || r.verdict === "pending");
  const liveLogs = runningTest?.logs || (isRunning && run.status === "queued" ? "Queued and waiting for daemon..." : (isRunning ? "Initializing pipeline..." : null));

  return (
    <div className="flex flex-col gap-6">
      <PageHeader 
        title={`Run ${run.id}`} 
        description={`Started ${formatDate(run.startedAt)}`} 
        actions={<Badge className={`${statusBg(run.status)} capitalize text-sm px-3 py-1`}>{run.status}</Badge>}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 flex flex-col gap-6">
          <Card className="p-6 flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <div>
                <div className="text-sm text-gray-500">Duration</div>
                <div className="font-medium text-lg">{formatDuration(run.duration ?? 0)}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Avg SSIM</div>
                <div className="font-medium text-blue-600 text-lg">
                  {results.filter(r => r.metrics?.ssim).length > 0 
                    ? (results.filter(r => r.metrics?.ssim).reduce((acc, r) => acc + (r.metrics?.ssim || 0), 0) / results.filter(r => r.metrics?.ssim).length).toFixed(4)
                    : "--"}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Passed</div>
                <div className="font-medium text-green-600 text-lg">{passed}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Failed</div>
                <div className="font-medium text-red-600 text-lg">{failed}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Total</div>
                <div className="font-medium text-lg">{total}</div>
              </div>
            </div>
            <div className={isRunning ? "animate-pulse" : ""}>
              <ProgressBar value={progress} max={100} />
              <div className="flex justify-between mt-2 mb-6">
                <span className="text-sm font-medium text-gray-600">{progress}% Complete</span>
                {isRunning && <span className="text-sm text-blue-600 font-medium animate-pulse">Running test {passed + failed + 1} of {total}...</span>}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-100">
                <div className="flex flex-col">
                  <span className="text-xs text-gray-500 uppercase font-semibold">Test Cases</span>
                  <span className="font-medium text-gray-900">{total}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-gray-500 uppercase font-semibold">Passing Rate</span>
                  <span className={`font-medium ${progress === 100 && failed === 0 ? 'text-green-600' : 'text-gray-900'}`}>{total > 0 ? Math.round((passed / total) * 100) : 0}%</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-gray-500 uppercase font-semibold">Avg Execution</span>
                  <span className="font-medium text-gray-900">{results.length > 0 ? (results.reduce((acc, r) => acc + r.executionDuration, 0) / results.length).toFixed(0) : 0}ms</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-gray-500 uppercase font-semibold">Print Queue Size</span>
                  <span className="font-medium text-gray-900">{isRunning ? '1 Active' : '0 Idle'}</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Live Logs Terminal */}
          {(liveLogs || isRunning) && (
            <Card className="overflow-hidden border-zinc-800 bg-zinc-950 text-zinc-50 flex flex-col shadow-2xl h-80">
              <div className="flex items-center justify-between px-4 py-2 bg-zinc-900 border-b border-zinc-800">
                <div className="flex items-center gap-2">
                  <Terminal className="h-4 w-4 text-zinc-400" />
                  <span className="text-xs font-mono text-zinc-400">
                    {runningTest ? `Executing: ${runningTest.testCaseId}` : 'Daemon Pipeline Logs'}
                  </span>
                </div>
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/80"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500/80"></div>
                </div>
              </div>
              <div className="p-4 overflow-y-auto font-mono text-xs text-zinc-300 flex-grow whitespace-pre-wrap">
                {liveLogs || (run.status === "completed" ? "Pipeline execution completed." : "Awaiting logs...")}
                {isRunning && <span className="inline-block w-2 h-3 ml-1 bg-zinc-400 animate-pulse" />}
              </div>
            </Card>
          )}

          <h2 className="text-xl font-semibold mt-2">Test Cases ({results.length})</h2>
          <div className="flex flex-col gap-3">
            {results.map((result) => (
              <Link key={result.id} href={`/runs/${run.id}/tests/${result.testCaseId}`}>
                <Card className={`p-4 hover:shadow-md transition-all flex flex-col gap-3 ${result.verdict === 'running' ? 'border-blue-500 bg-blue-50' : ''}`}>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-gray-100 rounded-md">
                        <LayoutTemplate className="h-5 w-5 text-gray-500" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">{result.testCaseId}</div>
                        <div className="text-sm text-gray-500">
                          {result.verdict === 'running' ? 'Executing now...' : `${formatDuration(result.executionDuration ?? 0)} execution time`}
                        </div>
                      </div>
                    </div>
                    <Badge className={`${statusBg(result.verdict)} capitalize font-medium px-3 py-1 shadow-sm`}>
                      {result.verdict}
                    </Badge>
                  </div>
                  
                  {/* Detailed inline metrics */}
                  {result.metrics && (
                    <div className="grid grid-cols-3 gap-2 pt-3 border-t text-sm">
                      <div className="flex flex-col">
                        <span className="text-xs text-gray-500 uppercase tracking-wider">SSIM</span>
                        <span className={`font-medium ${(result.metrics.ssim || 0) >= (result.metrics.threshold || 0.95) ? 'text-green-600' : 'text-red-600'}`}>
                          {(result.metrics.ssim || 0).toFixed(4)}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs text-gray-500 uppercase tracking-wider">PSNR</span>
                        <span className="font-medium text-gray-900">{(result.metrics.psnr || 0).toFixed(2)} dB</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs text-gray-500 uppercase tracking-wider">Pixel Diff</span>
                        <span className="font-medium text-gray-900">{result.metrics.pixelDifference || 0} px</span>
                      </div>
                    </div>
                  )}
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Configuration Sidebar */}
        <div className="flex flex-col gap-6">
          <Card className="p-5 flex flex-col gap-4">
            <h3 className="font-semibold flex items-center gap-2 border-b pb-2">
              <Settings className="h-4 w-4" /> Environment Config
            </h3>
            <div className="flex flex-col gap-3 text-sm">
              <div className="flex justify-between items-start">
                <span className="text-gray-500 flex items-center gap-1.5"><Printer className="h-3.5 w-3.5" /> Printer</span>
                <span className="font-medium text-right">{run.config.printerModelId}</span>
              </div>
              <div className="flex justify-between items-start">
                <span className="text-gray-500 flex items-center gap-1.5"><Cpu className="h-3.5 w-3.5" /> CUPS</span>
                <span className="font-medium text-right">{run.config.cupsVersionId}</span>
              </div>
              <div className="flex justify-between items-start">
                <span className="text-gray-500 flex items-center gap-1.5"><Settings className="h-3.5 w-3.5" /> System</span>
                <span className="font-medium text-right capitalize">{run.config.printSystemType.replace('-', ' ')}</span>
              </div>
            </div>
          </Card>

          <Card className="p-5 flex flex-col gap-4">
            <h3 className="font-semibold flex items-center gap-2 border-b pb-2">
              <FileText className="h-4 w-4" /> Print Settings
            </h3>
            <div className="flex flex-col gap-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Document</span>
                <span className="font-medium">{run.config.documentId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Color Mode</span>
                <span className="font-medium capitalize">{run.config.colorMode}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Duplex</span>
                <span className="font-medium capitalize">{run.config.duplexMode}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Quality</span>
                <span className="font-medium">{run.config.dpi} DPI</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
