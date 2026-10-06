import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';
import { execSync } from 'child_process';

const prisma = new PrismaClient();

async function getCupsVersion() {
  try {
    const out = execSync('cups-config --version', { encoding: 'utf-8' });
    return out.trim();
  } catch {
    return '2.4.7';
  }
}

async function queueRun() {
  const printer = await prisma.printerModel.findFirst();
  const suite = await prisma.testSuite.findFirst({ include: { testCases: true } });
  
  if (!printer || !suite) {
    console.log("No printer or suite found.");
    return;
  }

  const cupsVer = await getCupsVersion();
  const runId = `RUN-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
  
  const run = await prisma.testRun.create({
    data: {
      id: runId,
      printerModelId: printer.id,
      simulatorId: `sim-${printer.id}`,
      cupsVersion: cupsVer,
      printSystemType: 'driverless-ipp',
      colorMode: printer.colorSupport ? 'color' : 'monochrome',
      duplexMode: printer.duplexSupport ? 'duplex' : 'simplex',
      orientation: 'portrait',
      dpi: printer.maxDpi || 300,
      documentId: 'doc-1',
      testSuiteId: suite.id,
      status: 'queued',
      totalTests: suite.testCases.length,
      passedTests: 0,
      failedTests: 0,
      warningTests: 0,
      currentTestIndex: 0,
    }
  });

  for (const tc of suite.testCases) {
    await prisma.testResult.create({
      data: {
        id: crypto.randomUUID(),
        runId: run.id,
        testCaseId: tc.id,
        verdict: 'PENDING',
        executionDuration: 0,
        threshold: tc.threshold
      }
    });
  }

  console.log(`Queued run ${run.id}`);
}

queueRun().catch(console.error).finally(() => prisma.$disconnect());
