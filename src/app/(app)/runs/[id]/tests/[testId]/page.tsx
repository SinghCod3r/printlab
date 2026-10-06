import { Suspense } from "react";
import provider from "@/lib/provider"
import TestResultClient from "./TestResultClient";

export async function generateStaticParams() {
  const runs = await provider.getTestRuns()
  const params: { id: string, testId: string }[] = [];
  
  for (const run of runs) {
    const results = await provider.getTestResults(run.id)
    for (const result of results) {
      params.push({ id: run.id, testId: result.testCaseId })
    }
  }
  
  return params;
}

export default async function TestResultPage({ params }: { params: Promise<{ id: string, testId: string }> }) {
  const resolvedParams = await params;
  const { id, testId } = resolvedParams;
  const [run, result] = await Promise.all([
    provider.getTestRun(id),
    provider.getTestResult(id, testId)
  ])

  if (!run || !result) {
    return <div>Test run or result not found</div>;
  }

  return (
    <Suspense fallback={<div>Loading test details...</div>}>
      <TestResultClient initialRun={run} initialResult={result} runId={id} testId={testId} />
    </Suspense>
  )
}
