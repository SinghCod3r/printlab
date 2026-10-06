import { Suspense } from "react";
import RunDetailsClient from "./RunDetailsClient";
import provider from "@/lib/provider";

export async function generateStaticParams() {
  const runs = await provider.getTestRuns()
  return runs.map((run) => ({
    id: run.id,
  }))
}

export default async function RunDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const runId = resolvedParams.id;
  const initialRun = await provider.getTestRun(runId);
  const initialResults = await provider.getTestResults(runId);

  if (!initialRun) {
    return <div>Run not found</div>;
  }

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RunDetailsClient initialRun={initialRun} initialResults={initialResults} runId={runId} />
    </Suspense>
  );
}
