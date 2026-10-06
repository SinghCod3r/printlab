export type TestStatus = "queued" | "preparing" | "creating_queue" | "printing" | "capturing" | "evaluating" | "completed" | "failed" | "passed" | "running";

export type TestVerdict = "pass" | "fail" | "warning" | "pending" | "running";

export type ColorMode = "color" | "monochrome" | "grayscale";

export type DuplexMode = "simplex" | "duplex";

export type Orientation = "portrait" | "landscape";

export type DocumentType = "pdf" | "png" | "svg" | "text" | "multi-page" | "color-test" | "grayscale-test" | "duplex-test";

export type TestSuiteType = "single" | "smoke" | "full" | "regression" | "custom";

export type RegressionStatus = "open" | "investigating" | "resolved" | "wontfix";

export type PrintSystemType = "driverless-ipp" | "printer-application" | "legacy-ppd";

export interface CUPSVersion {
  id: string;
  version: string;
  releaseDate: string;
  isLatest: boolean;
  components: string[];
}

export interface PrinterModel {
  id: string;
  name: string;
  manufacturer: string;
  colorSupport: boolean;
  duplexSupport: boolean;
  maxDpi: number;
  paperSizes: string[];
  ippSupport: boolean;
  simulatorAvailable: boolean;
  isDemo: boolean;
}

export interface Simulator {
  id: string;
  printerModelId: string;
  name: string;
  status: "online" | "offline" | "maintenance";
  capabilities: string[];
  repository: string;
  lastUpdate: string;
}

export interface TestDocument {
  id: string;
  name: string;
  type: DocumentType;
  description: string;
  pages: number;
  hasColor: boolean;
}

export interface TestCase {
  id: string;
  name: string;
  category: string;
  requirements: string[];
  expectedResult: string;
  threshold: number;
  suites: TestSuiteType[];
}

export interface TestSuite {
  id: string;
  name: string;
  type: TestSuiteType;
  testCaseIds: string[];
  description: string;
  estimatedDuration: number;
}

export interface TestRunConfig {
  printerModelId: string;
  simulatorId: string;
  cupsVersionId: string;
  printSystemType: PrintSystemType;
  colorMode: ColorMode;
  duplexMode: DuplexMode;
  orientation: Orientation;
  dpi: number;
  testSuiteId: string;
  documentId: string;
}

export interface TestRun {
  id: string;
  config: TestRunConfig;
  status: TestStatus;
  startedAt: string;
  completedAt: string | null;
  duration: number | null;
  totalTests: number;
  passedTests: number;
  failedTests: number;
  warningTests: number;
  currentTestIndex: number;
  isDemo: boolean;
}

export interface ImageMetrics {
  ssim: number;
  psnr: number;
  pixelDifference: number;
  affectedAreaPercent: number;
  threshold: number;
}

export interface TestResult {
  id: string;
  runId: string;
  testCaseId: string;
  verdict: TestVerdict;
  metrics: ImageMetrics | null;
  executionDuration: number;
  timestamp: string;
  expectedImageUrl: string;
  actualImageUrl: string;
  differenceImageUrl: string;
  isDemo: boolean;
  logs?: string | null;
}

export interface Regression {
  id: string;
  testCaseId: string;
  printerModelId: string;
  firstGoodRunId: string;
  firstBadRunId: string;
  firstGoodVersion: string;
  firstBadVersion: string;
  status: RegressionStatus;
  metricsChange: { before: ImageMetrics; after: ImageMetrics };
  suspectedComponent: string;
  relatedRepository: string;
  detectedAt: string;
  isDemo: boolean;
}

export interface OpenPrintingProject {
  id: string;
  name: string;
  slug: string;
  description: string;
  repository: string;
  language: string;
  role: string;
  architectureLayer: string;
  dependencies: string[];
  relatedProjectIds: string[];
  stars?: number;
  openIssues?: number;
  latestRelease?: string;
  lastCommitDate?: string;
}

export interface RunComparison {
  runA: TestRun;
  runB: TestRun;
  passRateA: number;
  passRateB: number;
  newFailures: TestResult[];
  newPasses: TestResult[];
  regressions: Regression[];
  improvements: string[];
}

export interface BatchConfig {
  printerModelIds: string[];
  cupsVersionIds: string[];
  testSuiteIds: string[];
}

export interface BatchResult {
  printerModelId: string;
  cupsVersionId: string;
  testSuiteId: string;
  runId: string;
  totalTests: number;
  passed: number;
  failed: number;
  regressions: number;
}

export interface CIPipeline {
  id: string;
  repository: string;
  commit: string;
  branch: string;
  status: string;
  totalTests: number;
  passedTests: number;
  failedTests: number;
  duration: number;
  triggeredAt: string;
  completedAt: string | null;
  isDemo: boolean;
}

export interface ArchitectureNode {
  id: string;
  label: string;
  description: string;
  projectId?: string;
  repository?: string;
  documentationUrl?: string;
  layer: "application" | "dialog" | "cups" | "filter" | "backend" | "printer" | "transport";
  x: number;
  y: number;
}

export interface ArchitectureEdge {
  from: string;
  to: string;
  label?: string;
  style?: "solid" | "dashed";
}

export interface TestProvider {
  getProjects(): Promise<OpenPrintingProject[]>;
  getProject(slug: string): Promise<OpenPrintingProject | null>;
  getPrinterModels(): Promise<PrinterModel[]>;
  getSimulators(): Promise<Simulator[]>;
  getCupsVersions(): Promise<CUPSVersion[]>;
  getTestDocuments(): Promise<TestDocument[]>;
  getTestCases(): Promise<TestCase[]>;
  getTestSuites(): Promise<TestSuite[]>;
  getTestRuns(): Promise<TestRun[]>;
  getTestRun(id: string): Promise<TestRun | null>;
  getTestResults(runId: string): Promise<TestResult[]>;
  getTestResult(runId: string, testId: string): Promise<TestResult | null>;
  getRegressions(): Promise<Regression[]>;
  getCIPipelines(): Promise<CIPipeline[]>;
  createTestRun(config: TestRunConfig): Promise<TestRun>;
}
