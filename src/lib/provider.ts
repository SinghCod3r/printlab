import { TestProvider, OpenPrintingProject as Project, PrinterModel, Simulator, TestSuite, TestCase, TestRun, TestResult, Regression, CIPipeline, CUPSVersion, TestDocument, TestRunConfig, PrintSystemType, ColorMode, DuplexMode, Orientation, TestStatus, TestVerdict, RegressionStatus } from "./types";
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

// Since we are exporting a static site, we read the JSON files directly.
const DATA_DIR = path.join(process.cwd(), 'data');

function readJson<T>(filename: string, fallback: T): T {
  try {
    const filePath = path.join(DATA_DIR, filename);
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    }
    return fallback;
  } catch (e) {
    console.error(`Error reading ${filename}:`, e);
    return fallback;
  }
}

function writeJson(filename: string, data: any) {
  try {
    fs.writeFileSync(path.join(DATA_DIR, filename), JSON.stringify(data, null, 2));
  } catch (e) {
    console.error(`Error writing ${filename}:`, e);
  }
}

class JsonProvider implements TestProvider {
  async getProjects(): Promise<Project[]> {
    return readJson<any[]>('projects.json', []).map(p => ({
      ...p,
      architectureLayer: p.architectureLayer as any,
      role: p.role as any
    }));
  }

  async getProject(slug: string): Promise<Project | null> {
    const projects = await this.getProjects();
    return projects.find(p => p.slug === slug) ?? null;
  }

  async getPrinterModels(): Promise<PrinterModel[]> {
    return readJson<PrinterModel[]>('models.json', []);
  }

  async getSimulators(): Promise<Simulator[]> {
    return readJson<Simulator[]>('simulators.json', []).map((s: any) => ({
      ...s,
      capabilities: typeof s.capabilities === 'string' ? s.capabilities.split(',') : (s.capabilities || []),
      status: s.status as any
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
    const cases = readJson<any[]>('cases.json', []);
    return cases.map(c => ({
      id: c.id,
      name: c.name,
      category: c.category as any,
      requirements: Array.isArray(c.requirements) ? c.requirements : (c.requirements?.split(',') ?? []),
      expectedResult: c.expectedResult,
      threshold: c.threshold,
      suites: []
    }));
  }

  async getTestSuites(): Promise<TestSuite[]> {
    const suites = readJson<any[]>('suites.json', []);
    return suites.map(s => ({
      id: s.id,
      name: s.name,
      type: s.type as any,
      description: s.description,
      estimatedDuration: s.estimatedDuration,
      testCaseIds: (s.testCases || []).map((tc: any) => tc.id)
    }));
  }

  async getTestRuns(): Promise<TestRun[]> {
    const runs = readJson<any[]>('runs.json', []);
    runs.sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());
    return runs.map(r => ({
      id: r.id,
      config: {
        printerModelId: r.printerModelId || r.config?.printerModelId,
        simulatorId: r.simulatorId || r.config?.simulatorId,
        cupsVersionId: r.cupsVersion || r.config?.cupsVersionId,
        printSystemType: (r.printSystemType || r.config?.printSystemType) as PrintSystemType,
        colorMode: (r.colorMode || r.config?.colorMode) as ColorMode,
        duplexMode: (r.duplexMode || r.config?.duplexMode) as DuplexMode,
        orientation: (r.orientation || r.config?.orientation) as Orientation,
        dpi: r.dpi || r.config?.dpi,
        testSuiteId: r.testSuiteId || r.config?.testSuiteId,
        documentId: r.documentId || r.config?.documentId
      },
      status: r.status as TestStatus,
      startedAt: r.startedAt,
      completedAt: r.completedAt ?? null,
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
    const runs = await this.getTestRuns();
    return runs.find(r => r.id === id) ?? null;
  }

  async getTestResults(runId: string): Promise<TestResult[]> {
    const runs = readJson<any[]>('runs.json', []);
    const run = runs.find(r => r.id === runId);
    if (!run || !run.results) return [];
    
    return run.results.map((r: any) => ({
      id: r.id,
      runId: r.runId,
      testCaseId: r.testCaseId,
      verdict: r.verdict as TestVerdict,
      metrics: r.ssim !== null && r.ssim !== undefined ? {
        ssim: r.ssim,
        psnr: r.psnr ?? 0,
        pixelDifference: r.pixelDifference ?? 0,
        affectedAreaPercent: r.affectedAreaPercent ?? 0,
        threshold: r.threshold ?? 0.95
      } : null,
      executionDuration: r.executionDuration,
      timestamp: r.timestamp,
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
    const regs = readJson<any[]>('regressions.json', []);
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
      detectedAt: r.detectedAt,
      isDemo: false
    }));
  }

  async getCIPipelinesCount(search?: string): Promise<number> {
    const pipelines = await this.getCIPipelines(1, 10000, search);
    return pipelines.length;
  }

  async getCIPipelines(page: number = 1, limit: number = 20, search?: string): Promise<CIPipeline[]> {
    let pipelines = readJson<any[]>('pipelines.json', []);
    if (search) {
      pipelines = pipelines.filter(p => p.repository.toLowerCase().includes(search.toLowerCase()));
    }
    pipelines.sort((a, b) => new Date(b.triggeredAt).getTime() - new Date(a.triggeredAt).getTime());
    
    const start = (page - 1) * limit;
    return pipelines.slice(start, start + limit).map(p => ({
      ...p,
      status: p.status as CIPipeline["status"],
      completedAt: p.completedAt ?? null,
      isDemo: false
    }));
  }

  async createTestRun(config: TestRunConfig): Promise<TestRun> {
    const id = `RUN-${Date.now()}`;
    const suites = readJson<any[]>('suites.json', []);
    const suite = suites.find(s => s.id === config.testSuiteId);
    
    const newRun = {
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
      startedAt: new Date().toISOString(),
      completedAt: null,
      totalTests: suite && suite.testCases ? suite.testCases.length : 0,
      passedTests: 0,
      failedTests: 0,
      warningTests: 0,
      currentTestIndex: 0,
      results: [] as any[]
    };

    if (suite && suite.testCases) {
      newRun.results = suite.testCases.map((tc: any) => ({
        id: crypto.randomUUID(),
        runId: id,
        testCaseId: tc.id,
        verdict: 'PENDING',
        executionDuration: 0,
        threshold: tc.threshold,
        timestamp: new Date().toISOString()
      }));
    }

    if (process.env.NODE_ENV !== 'production') {
      const allRuns = readJson<any[]>('runs.json', []);
      allRuns.push(newRun);
      writeJson('runs.json', allRuns);
    } else {
      console.warn("createTestRun called in production. Data will not persist to runs.json statically.");
    }

    return (await this.getTestRun(id))!;
  }
}

const provider = new JsonProvider();
export default provider;
