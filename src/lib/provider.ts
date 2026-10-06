import crypto from "crypto";
import prisma from './prisma';
import { 
  OpenPrintingProject, PrinterModel, Simulator, CUPSVersion, TestDocument, 
  TestCase, TestSuite, TestRun, TestResult, Regression, RegressionStatus, CIPipeline, TestSuiteType, TestRunConfig,
  PrintSystemType, ColorMode, DuplexMode, Orientation, TestStatus, TestVerdict
} from './types';

export class DatabaseProvider {
  async getProjects(): Promise<OpenPrintingProject[]> {
    const repos = await prisma.repository.findMany();
    return repos.map(r => ({
      id: r.id,
      name: r.name,
      slug: r.slug,
      description: r.description,
      repository: r.url,
      language: r.language ?? 'Unknown',
      role: r.role,
      architectureLayer: r.architectureLayer,
      dependencies: [],
      relatedProjectIds: [],
      stars: r.stars,
      openIssues: r.openIssues,
      latestRelease: r.latestRelease ?? undefined,
      lastCommitDate: r.lastCommitDate?.toISOString()
    }));
  }

  async getProject(slug: string): Promise<OpenPrintingProject | null> {
    const r = await prisma.repository.findUnique({ where: { slug } });
    if (!r) return null;
    return {
      id: r.id,
      name: r.name,
      slug: r.slug,
      description: r.description,
      repository: r.url,
      language: r.language ?? 'Unknown',
      role: r.role,
      architectureLayer: r.architectureLayer,
      dependencies: [],
      relatedProjectIds: [],
      stars: r.stars,
      openIssues: r.openIssues,
      latestRelease: r.latestRelease ?? undefined,
      lastCommitDate: r.lastCommitDate?.toISOString()
    };
  }

  async getPrinterModels(): Promise<PrinterModel[]> {
    const models = await prisma.printerModel.findMany();
    return models.map(m => ({
      id: m.id,
      name: m.name,
      manufacturer: m.manufacturer,
      colorSupport: m.colorSupport,
      duplexSupport: m.duplexSupport,
      maxDpi: m.maxDpi ?? 600,
      paperSizes: (m.paperSizes || "").split(','),
      ippSupport: m.ippSupport,
      simulatorAvailable: m.simulatorAvailable,
      isDemo: false
    }));
  }

  async getSimulators(): Promise<Simulator[]> {
    const sims = await prisma.simulator.findMany();
    return sims.map(s => ({
      id: s.id,
      printerModelId: s.printerModelId,
      name: s.name,
      status: s.status as Simulator["status"],
      capabilities: s.capabilities.split(','),
      repository: s.repository,
      lastUpdate: s.lastUpdate.toISOString()
    }));
  }

  async getCupsVersions(): Promise<CUPSVersion[]> {
    return [
      {
        id: "cups-2.4.11",
        version: "2.4.11",
        releaseDate: "2025-01-15",
        isLatest: false,
        components: ["cupsd", "cupsfilters", "libcups"],
      },
      {
        id: "cups-2.5.0",
        version: "2.5.0",
        releaseDate: "2025-06-01",
        isLatest: true,
        components: ["cupsd", "libcups3", "cups-local", "cups-sharing"],
      }
    ];
  }

  async getTestDocuments(): Promise<TestDocument[]> {
    return [
      { id: "doc-pdf-simple", name: "Simple Text Page", type: "pdf", description: "Single-page PDF with formatted text", pages: 1, hasColor: false },
      { id: "doc-pdf-multi", name: "Multi-Page Document", type: "pdf", description: "5-page PDF with mixed content", pages: 5, hasColor: true },
      { id: "doc-color-chart", name: "Color Test Chart", type: "color-test", description: "Standard color accuracy test chart", pages: 1, hasColor: true },
    ];
  }

  async getTestCases(): Promise<TestCase[]> {
    const cases = await prisma.testCase.findMany();
    return cases.map(c => ({
      id: c.id,
      name: c.name,
      category: c.category,
      requirements: c.requirements.split(','),
      expectedResult: c.expectedResult,
      threshold: c.threshold,
      suites: [] as TestSuiteType[]
    }));
  }

  async getTestSuites(): Promise<TestSuite[]> {
    const suites = await prisma.testSuite.findMany({ include: { testCases: true } });
    return suites.map(s => ({
      id: s.id,
      name: s.name,
      type: s.type as TestSuite["type"],
      description: s.description,
      estimatedDuration: s.estimatedDuration,
      testCaseIds: s.testCases.map(c => c.id)
    }));
  }

  async getTestRuns(): Promise<TestRun[]> {
    const runs = await prisma.testRun.findMany({
      orderBy: { startedAt: 'desc' }
    });
    return runs.map(r => ({
      id: r.id,
      config: {
        printerModelId: r.printerModelId,
        simulatorId: r.simulatorId,
        cupsVersionId: r.cupsVersion,
        printSystemType: r.printSystemType as PrintSystemType,
        colorMode: r.colorMode as ColorMode,
        duplexMode: r.duplexMode as DuplexMode,
        orientation: r.orientation as Orientation,
        dpi: r.dpi,
        testSuiteId: r.testSuiteId,
        documentId: r.documentId
      },
      status: r.status as TestStatus,
      startedAt: r.startedAt.toISOString(),
      completedAt: r.completedAt?.toISOString() ?? null,
      duration: r.duration,
      totalTests: r.totalTests,
      passedTests: r.passedTests,
      failedTests: r.failedTests,
      warningTests: r.warningTests,
      currentTestIndex: r.currentTestIndex,
      isDemo: false
    }));
  }

  async getTestRun(id: string): Promise<TestRun | null> {
    const r = await prisma.testRun.findUnique({ where: { id } });
    if (!r) return null;
    return {
      id: r.id,
      config: {
        printerModelId: r.printerModelId,
        simulatorId: r.simulatorId,
        cupsVersionId: r.cupsVersion,
        printSystemType: r.printSystemType as PrintSystemType,
        colorMode: r.colorMode as ColorMode,
        duplexMode: r.duplexMode as DuplexMode,
        orientation: r.orientation as Orientation,
        dpi: r.dpi,
        testSuiteId: r.testSuiteId,
        documentId: r.documentId
      },
      status: r.status as TestStatus,
      startedAt: r.startedAt.toISOString(),
      completedAt: r.completedAt?.toISOString() ?? null,
      duration: r.duration,
      totalTests: r.totalTests,
      passedTests: r.passedTests,
      failedTests: r.failedTests,
      warningTests: r.warningTests,
      currentTestIndex: r.currentTestIndex,
      isDemo: false
    };
  }

  async getTestResults(runId: string): Promise<TestResult[]> {
    const results = await prisma.testResult.findMany({ where: { runId } });
    return results.map(r => ({
      id: r.id,
      runId: r.runId,
      testCaseId: r.testCaseId,
      verdict: r.verdict as TestVerdict,
      metrics: r.ssim !== null ? {
        ssim: r.ssim,
        psnr: r.psnr ?? 0,
        pixelDifference: r.pixelDifference ?? 0,
        affectedAreaPercent: r.affectedAreaPercent ?? 0,
        threshold: r.threshold ?? 0.95
      } : null,
      executionDuration: r.executionDuration,
      timestamp: r.timestamp.toISOString(),
      expectedImageUrl: r.expectedImageUrl ?? '',
      actualImageUrl: r.actualImageUrl ?? '',
      differenceImageUrl: r.differenceImageUrl ?? '',
      isDemo: false,
      logs: r.logs ?? null
    }));
  }

  async getTestResult(runId: string, testId: string): Promise<TestResult | null> {
    const results = await this.getTestResults(runId);
    return results.find(r => r.testCaseId === testId) ?? null;
  }

  async getRegressions(): Promise<Regression[]> {
    const regs = await prisma.regression.findMany();
    return regs.map(r => ({
      id: r.id,
      testCaseId: r.testCaseId,
      printerModelId: r.printerModelId,
      firstGoodRunId: r.firstGoodRunId,
      firstBadRunId: r.firstBadRunId,
      firstGoodVersion: r.firstGoodVersion,
      firstBadVersion: r.firstBadVersion,
      status: r.status as RegressionStatus,
      metricsChange: {
        before: {
          ssim: r.beforeSsim ?? 0,
          psnr: r.beforePsnr ?? 0,
          pixelDifference: 0,
          affectedAreaPercent: 0,
          threshold: 0
        },
        after: {
          ssim: r.afterSsim ?? 0,
          psnr: r.afterPsnr ?? 0,
          pixelDifference: 0,
          affectedAreaPercent: 0,
          threshold: 0
        }
      },
      suspectedComponent: r.suspectedComponent ?? '',
      relatedRepository: r.relatedRepository ?? '',
      detectedAt: r.detectedAt.toISOString(),
      isDemo: false
    }));
  }

  async getCIPipelinesCount(search?: string): Promise<number> {
    const where = search ? { repository: { contains: search } } : {};
    return await prisma.cIPipeline.count({ where });
  }

  async getCIPipelines(page: number = 1, limit: number = 20, search?: string): Promise<CIPipeline[]> {
    const where = search ? { repository: { contains: search } } : {};
    const pipelines = await prisma.cIPipeline.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { triggeredAt: 'desc' }
    });
    return pipelines.map(p => ({
      ...p,
      status: p.status as CIPipeline["status"],
      triggeredAt: p.triggeredAt.toISOString(),
      completedAt: p.completedAt?.toISOString() ?? null,
      isDemo: false
    }));
  }

  async createTestRun(config: TestRunConfig): Promise<TestRun> {
    const id = `RUN-${Date.now()}`;
    const suite = await prisma.testSuite.findUnique({
      where: { id: config.testSuiteId },
      include: { testCases: true }
    });
    
    await prisma.testRun.create({
      data: {
        id,
        printerModelId: config.printerModelId,
        simulatorId: config.simulatorId,
        cupsVersion: config.cupsVersionId,
        printSystemType: config.printSystemType,
        colorMode: config.colorMode,
        duplexMode: config.duplexMode,
        orientation: config.orientation,
        dpi: config.dpi,
        documentId: config.documentId,
        testSuiteId: config.testSuiteId,
        status: "queued",
        totalTests: suite ? suite.testCases.length : 0,
        passedTests: 0,
        failedTests: 0,
        warningTests: 0,
        currentTestIndex: 0
      }
    });

    if (suite && suite.testCases.length > 0) {
      await prisma.testResult.createMany({
        data: suite.testCases.map((tc: { id: string; threshold: number }) => ({
          id: crypto.randomUUID(),
          runId: id,
          testCaseId: tc.id,
          verdict: 'PENDING',
          executionDuration: 0,
          threshold: tc.threshold
        }))
      });
    }

    return (await this.getTestRun(id))!;
  }
}

const provider = new DatabaseProvider();
export default provider;
