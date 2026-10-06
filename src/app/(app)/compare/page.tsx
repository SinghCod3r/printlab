export const dynamic = 'force-dynamic';

import provider from "@/lib/provider"
import { TestRun, TestResult } from "@/lib/types"
import { PageHeader, Card, EmptyState } from "@/components/ui"
import Link from "next/link"

export default async function ComparePage({ searchParams }: { searchParams: Promise<{ runA?: string, runB?: string }> }) {
  const resolvedParams = await searchParams;
  let runIdA = resolvedParams.runA;
  let runIdB = resolvedParams.runB;

  if (!runIdA || !runIdB) {
    const recentRuns = await provider.getTestRuns();
    const completedRuns = recentRuns.filter(r => r.status === 'passed' || r.status === 'failed');
    if (completedRuns.length >= 2) {
      runIdB = completedRuns[0].id; // newer
      runIdA = completedRuns[1].id; // older
    }
  }

  if (!runIdA || !runIdB) {
    return (
      <div className="flex flex-col gap-6 p-6">
        <PageHeader title="Compare Runs" description="Compare metrics and results across two test executions." />
        <EmptyState title="Not Enough Data" description="At least two completed test runs are required to perform a comparison." />
      </div>
    );
  }

  const [runA, runB, resultsA, resultsB] = await Promise.all([
    provider.getTestRun(runIdA),
    provider.getTestRun(runIdB),
    provider.getTestResults(runIdA),
    provider.getTestResults(runIdB)
  ]);

  const calculatePassRate = (run: TestRun | null) => {
    if (!run || run.totalTests === 0) return 0
    return (run.passedTests / run.totalTests) * 100
  }

  const passRate1 = calculatePassRate(runA)
  const passRate2 = calculatePassRate(runB)
  const passRateChange = passRate2 - passRate1

  // Calculate specific regressions and improvements
  const dictA: Record<string, TestResult> = {};
  resultsA.forEach((r: TestResult) => dictA[r.testCaseId] = r);
  
  const newlyFailing: TestResult[] = [];
  const improvements: TestResult[] = [];

  resultsB.forEach((rB: TestResult) => {
    const rA = dictA[rB.testCaseId];
    if (rA) {
      const passA = rA.verdict?.toLowerCase() === 'pass';
      const passB = rB.verdict?.toLowerCase() === 'pass';
      if (passA && !passB) newlyFailing.push(rB);
      if (!passA && passB) improvements.push(rB);
    }
  });

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Compare Runs" description={`Comparing ${runA?.id} (Baseline) vs ${runB?.id} (Target)`} />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-medium">Pass Rate Change</h3>
            <div className={`mt-2 text-3xl font-bold ${passRateChange > 0 ? 'text-green-600' : passRateChange < 0 ? 'text-red-600' : ''}`}>
              {passRateChange > 0 ? "+" : ""}{passRateChange.toFixed(2)}%
            </div>
            <div className="mt-1 text-sm text-muted-foreground">
              {passRate1.toFixed(2)}% &rarr; {passRate2.toFixed(2)}%
            </div>
          </div>
        </Card>
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-medium">Newly Failing</h3>
            <div className={`mt-2 text-3xl font-bold ${newlyFailing.length > 0 ? 'text-red-600' : ''}`}>{newlyFailing.length}</div>
            <div className="mt-1 text-sm text-muted-foreground">Tests failed in Target but passed in Baseline</div>
          </div>
        </Card>
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-medium">Improvements</h3>
            <div className={`mt-2 text-3xl font-bold ${improvements.length > 0 ? 'text-green-600' : ''}`}>{improvements.length}</div>
            <div className="mt-1 text-sm text-muted-foreground">Tests passed in Target but failed in Baseline</div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <div className="p-6 border-b">
            <h3 className="text-lg font-medium">Run Metadata</h3>
          </div>
          <div className="p-6">
            <div className="flex justify-between py-2 border-b">
              <span className="font-medium">Total Tests</span>
              <span>{runA?.totalTests} vs {runB?.totalTests}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="font-medium">Duration</span>
              <span>{runA?.duration}s vs {runB?.duration}s</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="font-medium">CUPS Version</span>
              <span>{runA?.config?.cupsVersionId} vs {runB?.config?.cupsVersionId}</span>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6 border-b">
            <h3 className="text-lg font-medium">Detailed Changes</h3>
          </div>
          <div className="p-6 flex flex-col gap-4">
            {newlyFailing.length === 0 && improvements.length === 0 && (
              <div className="text-sm text-muted-foreground">No test verdict differences detected between these runs.</div>
            )}
            
            {newlyFailing.length > 0 && (
              <div>
                <h4 className="font-semibold text-red-600 mb-2">New Regressions</h4>
                <ul className="list-disc pl-5 text-sm space-y-1">
                  {newlyFailing.map(t => (
                    <li key={t.id}><Link href={`/runs/${runB?.id}/tests/${t.testCaseId}`} className="hover:underline">{t.testCaseId}</Link></li>
                  ))}
                </ul>
              </div>
            )}

            {improvements.length > 0 && (
              <div>
                <h4 className="font-semibold text-green-600 mb-2">Improvements</h4>
                <ul className="list-disc pl-5 text-sm space-y-1">
                  {improvements.map(t => (
                    <li key={t.id}><Link href={`/runs/${runB?.id}/tests/${t.testCaseId}`} className="hover:underline">{t.testCaseId}</Link></li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
