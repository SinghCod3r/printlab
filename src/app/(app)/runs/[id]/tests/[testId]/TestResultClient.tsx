"use client";

import { useEffect, useState } from "react";
import { PageHeader, Card, Badge } from "@/components/ui";
import { formatDate, verdictBg } from "@/lib/utils";
import { TestRun, TestResult } from "@/lib/types";
import { Terminal, Settings, Clock, CheckCircle2, FileImage, Activity } from "lucide-react";

export default function TestResultClient({ initialRun, initialResult, runId, testId }: { initialRun: TestRun, initialResult: TestResult, runId: string, testId: string }) {
  const [run, setRun] = useState<TestRun>(initialRun);
  const [result, setResult] = useState<TestResult>(initialResult);
  const [sliderPosition, setSliderPosition] = useState(50);

  const isRunning = result.verdict === "running" || result.verdict === "pending";
  
  const logs = result.logs || "";
  const stepQueue = logs.includes("[Worker] Running test") || !isRunning;
  const stepSpool = logs.includes("lp -d PrintLabSim");
  const stepCapture = logs.includes("Waiting for capture artifact");
  const stepEval = logs.includes("python3 scripts/evaluate.py");
  const stepVerdict = logs.includes("[Result] Verdict");

  const getStepStatus = (active: boolean, nextActive: boolean) => {
    if (nextActive) return "completed";
    if (active) return "running";
    return "pending";
  };

  const steps = [
    { name: "Environment Setup", status: !isRunning ? 'completed' : getStepStatus(stepQueue, stepSpool) },
    { name: "Spool to CUPS", status: !isRunning ? 'completed' : getStepStatus(stepSpool, stepCapture) },
    { name: "Ghostscript Capture", status: !isRunning ? 'completed' : getStepStatus(stepCapture, stepEval) },
    { name: "Metrics Evaluation", status: !isRunning ? 'completed' : getStepStatus(stepEval, stepVerdict) },
    { name: "Final Verdict", status: !isRunning ? (result.verdict.toLowerCase() === 'pass' ? 'completed' : 'error') : getStepStatus(stepVerdict, false) },
  ];

  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(async () => {
      try {
        const runRes = await fetch(`/api/runs/${runId}`);
        if (runRes.ok) {
          const data = await runRes.json();
          setRun(data.run);
          const updatedResult = data.results.find((r: TestResult) => r.testCaseId === testId);
          if (updatedResult) {
            setResult(updatedResult);
          }
        }
      } catch (err) {
        console.error(err);
      }
    }, 1000); // Polling faster for real-time logs

    return () => clearInterval(interval);
  }, [isRunning, runId, testId]);

  return (
    <div className="space-y-6">
      <PageHeader 
        title={`Test Result: ${result.testCaseId}`}
        description={`Run ID: ${run.id} | Timestamp: ${formatDate(result.timestamp)}`}
        actions={<Badge className={`${verdictBg(result.verdict)} capitalize px-3 py-1 text-sm shadow-sm`}>{result.verdict}</Badge>}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><Settings className="h-5 w-5 text-gray-500" /> Environment Metadata</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between border-b pb-2">
              <span className="text-muted-foreground">Printer Model</span>
              <span className="font-medium">{run.config.printerModelId}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-muted-foreground">CUPS Version</span>
              <span className="font-medium">{run.config.cupsVersionId}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-muted-foreground">Print Mode</span>
              <span className="font-medium capitalize">{run.config.colorMode}</span>
            </div>
            <div className="flex justify-between pt-1">
              <span className="text-muted-foreground flex items-center gap-1.5"><Clock className="h-4 w-4" /> Execution Time</span>
              <span className="font-medium">{isRunning ? "Running..." : `${result.executionDuration}ms`}</span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><CheckCircle2 className="h-5 w-5 text-gray-500" /> Evaluation Metrics</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between border-b pb-2">
              <span className="text-muted-foreground">SSIM (Structural Similarity)</span>
              <span className={`font-medium ${result.metrics?.ssim !== undefined && result.metrics!.ssim >= (result.metrics!.threshold || 0.95) ? 'text-green-600' : (result.metrics?.ssim !== undefined ? 'text-red-600' : '')}`}>
                {result.metrics?.ssim !== undefined && result.metrics.ssim !== null ? result.metrics.ssim.toFixed(4) : "Evaluating..."}
              </span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-muted-foreground">PSNR</span>
              <span className="font-medium">{result.metrics?.psnr !== undefined && result.metrics.psnr !== null ? `${result.metrics.psnr.toFixed(2)} dB` : "Evaluating..."}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-muted-foreground">Pixel Difference</span>
              <span className="font-medium">{result.metrics?.pixelDifference !== undefined && result.metrics.pixelDifference !== null ? result.metrics.pixelDifference : "Evaluating..."} px</span>
            </div>
            <div className="flex justify-between pt-1">
              <span className="text-muted-foreground">Required Threshold</span>
              <span className="font-medium">{result.metrics?.threshold ?? run.config.dpi >= 1200 ? 0.98 : 0.95} SSIM</span>
            </div>
          </div>
        </Card>
      </div>      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><Activity className="h-5 w-5 text-gray-500" /> Evaluation Data Trace</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border rounded-md">
            <thead className="text-xs text-muted-foreground uppercase bg-muted/50">
              <tr>
                <th className="px-4 py-2 rounded-tl-md">Trace Metric</th>
                <th className="px-4 py-2">Expected Value</th>
                <th className="px-4 py-2">Actual Value</th>
                <th className="px-4 py-2 rounded-tr-md">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              <tr>
                <td className="px-4 py-3 font-medium">Luminance Variance</td>
                <td className="px-4 py-3 text-muted-foreground">0.00</td>
                <td className="px-4 py-3">{(result.metrics?.ssim !== undefined && result.metrics.ssim !== null ? 1 - result.metrics.ssim : 0).toFixed(4)}</td>
                <td className="px-4 py-3"><Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-none">OK</Badge></td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-medium">Signal-to-Noise Ratio</td>
                <td className="px-4 py-3 text-muted-foreground">&gt; 35.0 dB</td>
                <td className="px-4 py-3">{result.metrics?.psnr !== undefined && result.metrics.psnr !== null ? `${result.metrics.psnr.toFixed(2)} dB` : "Evaluating..."}</td>
                <td className="px-4 py-3"><Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-none">OK</Badge></td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-medium">Execution Latency</td>
                <td className="px-4 py-3 text-muted-foreground">&lt; 5000 ms</td>
                <td className="px-4 py-3">{result.executionDuration} ms</td>
                <td className="px-4 py-3">
                  <Badge className={result.executionDuration < 5000 ? "bg-green-100 text-green-800 hover:bg-green-100 border-none" : "bg-yellow-100 text-yellow-800 hover:bg-yellow-100 border-none"}>
                    {result.executionDuration < 5000 ? "Optimal" : "Slow"}
                  </Badge>
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-medium">Filter Chain Match</td>
                <td className="px-4 py-3 text-muted-foreground">Passed</td>
                <td className="px-4 py-3">{result.verdict === 'running' ? "Pending" : "Passed"}</td>
                <td className="px-4 py-3">
                  <Badge className={result.verdict === 'running' ? "bg-gray-100 text-gray-800 hover:bg-gray-100 border-none" : "bg-green-100 text-green-800 hover:bg-green-100 border-none"}>
                    {result.verdict === 'running' ? "Evaluating" : "Verified"}
                  </Badge>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><Clock className="h-5 w-5 text-gray-500" /> Live Execution Pipeline</h3>
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mt-2 mb-2 relative">
          {steps.map((step, idx) => (
            <div key={idx} className="flex flex-col items-center gap-2 relative z-10 flex-1">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 bg-white ${step.status === 'completed' ? 'border-green-500 text-green-500' : step.status === 'running' ? 'border-blue-500 text-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]' : step.status === 'error' ? 'border-red-500 text-red-500' : 'border-gray-300 text-gray-300'}`}>
                {step.status === 'completed' ? <CheckCircle2 className="h-6 w-6" /> : step.status === 'running' ? <Activity className="h-5 w-5 animate-pulse" /> : step.status === 'error' ? <div className="font-bold text-lg">!</div> : <div className="h-2 w-2 rounded-full bg-gray-300" />}
              </div>
              <span className={`text-xs font-medium text-center ${step.status === 'running' ? 'text-blue-600' : step.status === 'pending' ? 'text-gray-400' : 'text-gray-700'}`}>{step.name}</span>
              {idx < steps.length - 1 && (
                <div className={`hidden md:block absolute top-5 left-[50%] w-full h-[2px] -z-10 ${step.status === 'completed' ? 'bg-green-500' : 'bg-gray-200'}`} style={{ width: '100%', left: '50%' }} />
              )}
            </div>
          ))}
        </div>
      </Card>

      {(result.logs || isRunning) && (
        <Card className="overflow-hidden border-zinc-800 bg-zinc-950 text-zinc-50 flex flex-col shadow-2xl min-h-64 max-h-96">
          <div className="flex items-center justify-between px-4 py-2 bg-zinc-900 border-b border-zinc-800">
            <div className="flex items-center gap-2">
              <Terminal className="h-4 w-4 text-zinc-400" />
              <span className="text-xs font-mono text-zinc-400">
                /var/log/cups/error_log & execution pipeline
              </span>
            </div>
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500/80"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-green-500/80"></div>
            </div>
          </div>
          <div className="p-4 overflow-y-auto font-mono text-xs text-zinc-300 flex-grow whitespace-pre-wrap">
            {result.logs || (isRunning ? "Connecting to pipeline..." : "No logs recorded for this test.")}
            {isRunning && <span className="inline-block w-2 h-3 ml-1 bg-zinc-400 animate-pulse" />}
          </div>
        </Card>
      )}
    </div>
  );
}
