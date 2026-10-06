import { Suspense } from "react";
import provider from "@/lib/provider"
import TestResultClient from "./TestResultClient";

export const dynamic = "force-dynamic";

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
