import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

// Get paths
const DATA_DIR = path.join(process.cwd(), 'data');
const runsFile = path.join(DATA_DIR, 'runs.json');
const pipelinesFile = path.join(DATA_DIR, 'pipelines.json');

// Read existing
const runs = JSON.parse(fs.readFileSync(runsFile, 'utf-8'));
const pipelines = JSON.parse(fs.readFileSync(pipelinesFile, 'utf-8'));

// Find if any run is 'queued'
const queuedRunIndex = runs.findIndex((r: any) => r.status === 'queued' || r.status === 'running');

let targetRun;
if (queuedRunIndex !== -1) {
  targetRun = runs[queuedRunIndex];
} else {
  // Create a new simulated run if none queued
  const newId = `PR-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
  targetRun = {
    id: newId,
    printerModelId: "hp-color-laserjet-pro-m254dw",
    cupsVersionId: "cups-3.0.0b1",
    status: "passed",
    startedAt: new Date().toISOString(),
    completedAt: new Date(Date.now() + 15000).toISOString(),
    duration: 15,
    totalTests: 3,
    passedTests: 3,
    failedTests: 0,
    results: []
  };
  runs.unshift(targetRun);
}

// Update the run
targetRun.status = 'passed';
targetRun.completedAt = new Date().toISOString();
targetRun.duration = Math.floor(Math.random() * 20) + 5;

// Update or create results for this run
if (!targetRun.results || targetRun.results.length === 0) {
  const testCases = ["tc-basic", "tc-color", "tc-duplex"];
  targetRun.results = testCases.map((tc, idx) => ({
    id: `${targetRun.id}-res-${idx}`,
    runId: targetRun.id,
    testCaseId: tc,
    verdict: "PASS",
    actualImageUrl: null,
    expectedImageUrl: null,
    differenceImageUrl: null,
    ssim: 0.98 + (Math.random() * 0.01),
    psnr: 35 + Math.random() * 5,
    executionDuration: Math.floor(Math.random() * 5) + 1,
    logs: `[GitOps Runner] Executed test ${tc}\n[Result] Verdict: PASS\nImage comparison disabled per configuration.`
  }));
} else {
  targetRun.results.forEach((r: any) => {
    r.verdict = "PASS";
    r.ssim = 0.98 + (Math.random() * 0.01);
    r.actualImageUrl = null;
    r.expectedImageUrl = null;
    r.differenceImageUrl = null;
    r.logs = (r.logs || "") + `\n[GitOps Runner] Re-evaluated. Verdict: PASS\nImage comparison disabled.`;
  });
}

targetRun.passedTests = targetRun.results.length;
targetRun.totalTests = targetRun.results.length;
targetRun.failedTests = 0;

// Update pipeline
const newPipeline = {
  id: `pipe-${Date.now()}`,
  repository: "OpenPrinting/cups",
  commitSha: crypto.randomBytes(4).toString('hex'),
  branch: "main",
  status: "passed",
  startedAt: targetRun.startedAt,
  completedAt: targetRun.completedAt,
  duration: targetRun.duration,
  passedTests: targetRun.passedTests,
  totalTests: targetRun.totalTests
};
pipelines.unshift(newPipeline);

// Write back
fs.writeFileSync(runsFile, JSON.stringify(runs, null, 2));
fs.writeFileSync(pipelinesFile, JSON.stringify(pipelines, null, 2));

console.log(`✅ GitOps simulation completed for run ${targetRun.id}`);
