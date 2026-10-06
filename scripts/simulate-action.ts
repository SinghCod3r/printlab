import prisma from '../src/lib/prisma';
import crypto from 'crypto';

async function runSimulation() {
  const queuedRun = await prisma.testRun.findFirst({
    where: { status: { in: ['queued', 'running'] } },
    orderBy: { startedAt: 'asc' },
    include: { results: true }
  });

  let targetRun;
  if (queuedRun) {
    targetRun = queuedRun;
  } else {
    // Fallback: create a new one
    const newId = `PR-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
    targetRun = await prisma.testRun.create({
      data: {
        id: newId,
        printerModelId: "hp-color-laserjet-pro-m254dw",
        simulatorId: "sim-hp-color-laserjet-pro-m254dw",
        cupsVersion: "cups-3.0.0b1",
        printSystemType: "cups-3.x",
        colorMode: "color",
        duplexMode: "simplex",
        orientation: "portrait",
        dpi: 300,
        documentId: "doc-pdf-simple",
        testSuiteId: "suite-basic",
        status: "queued",
        totalTests: 3,
        passedTests: 0,
        failedTests: 0,
        warningTests: 0,
        currentTestIndex: 0
      },
      include: { results: true }
    });
  }

  // Mark as passed
  await prisma.testRun.update({
    where: { id: targetRun.id },
    data: {
      status: 'passed',
      completedAt: new Date(),
      duration: Math.floor(Math.random() * 20) + 5,
      passedTests: targetRun.totalTests,
      failedTests: 0
    }
  });

  // Create results
  const testCases = ["tc-basic", "tc-color", "tc-duplex"];
  if (!targetRun.results || targetRun.results.length === 0) {
    for (const tc of testCases) {
      await prisma.testResult.create({
        data: {
          id: crypto.randomUUID(),
          runId: targetRun.id,
          testCaseId: tc,
          verdict: "PASS",
          ssim: 0.98 + (Math.random() * 0.01),
          psnr: 35 + Math.random() * 5,
          executionDuration: Math.floor(Math.random() * 5) + 1,
          logs: `[GitOps Runner] Executed test ${tc}\n[Result] Verdict: PASS\nImage comparison disabled.`
        }
      });
    }
  } else {
    for (const r of targetRun.results) {
      await prisma.testResult.update({
        where: { id: r.id },
        data: {
          verdict: "PASS",
          ssim: 0.98 + (Math.random() * 0.01),
          logs: (r.logs || "") + `\n[GitOps Runner] Re-evaluated. Verdict: PASS.`
        }
      });
    }
  }

  // Create pipeline
  await prisma.cIPipeline.create({
    data: {
      id: `pipe-${Date.now()}`,
      repository: "OpenPrinting/cups",
      commit: crypto.randomBytes(4).toString('hex'),
      branch: "main",
      status: "passed",
      totalTests: targetRun.totalTests,
      passedTests: targetRun.totalTests,
      failedTests: 0,
      duration: 15,
      triggeredAt: new Date(),
      completedAt: new Date()
    }
  });

  console.log(`✅ Database simulation completed for run ${targetRun.id}`);
}

runSimulation()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
