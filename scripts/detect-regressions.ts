import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

async function detectRegressions() {
  console.log("Running Regression Detection Engine...");

  const recentRuns = await prisma.testRun.findMany({
    orderBy: { startedAt: 'desc' },
    include: { results: true }
  });

  if (recentRuns.length < 2) {
    console.log("Not enough runs to detect regressions.");
    return;
  }

  console.log("Scanning history for regressions...");
  
  const runsByPrinter = recentRuns.reduce((acc, run) => {
    if (!acc[run.printerModelId]) acc[run.printerModelId] = [];
    acc[run.printerModelId].push(run);
    return acc;
  }, {} as Record<string, typeof recentRuns>);

  let detected = 0;
  for (const [printerId, runs] of Object.entries(runsByPrinter)) {
    runs.sort((a, b) => a.startedAt.getTime() - b.startedAt.getTime());
    
    const baseline: Record<string, { ssim: number, psnr: number, runId: string, version: string }> = {};

    for (const run of runs) {
      for (const res of run.results) {
        if (res.ssim == null || res.psnr == null) continue;

        const prev = baseline[res.testCaseId];
        if (prev && prev.ssim - res.ssim > 0.05) {
          await prisma.regression.create({
            data: {
              id: crypto.randomUUID(),
              testCaseId: res.testCaseId,
              printerModelId: printerId,
              firstGoodRunId: prev.runId,
              firstBadRunId: run.id,
              firstGoodVersion: prev.version,
              firstBadVersion: run.cupsVersion,
              status: 'open',
              suspectedComponent: null,
              relatedRepository: null,
              beforeSsim: prev.ssim,
              afterSsim: res.ssim,
              beforePsnr: prev.psnr,
              afterPsnr: res.psnr
            }
          });
          detected++;
          baseline[res.testCaseId] = { ssim: res.ssim, psnr: res.psnr, runId: run.id, version: run.cupsVersion };
        } else if (!prev || res.ssim > prev.ssim) {
          baseline[res.testCaseId] = { ssim: res.ssim, psnr: res.psnr, runId: run.id, version: run.cupsVersion };
        }
      }
    }
  }
  console.log(`Detected ${detected} regressions based on actual metrics history.`);
}

detectRegressions().catch(console.error).finally(() => prisma.$disconnect());
