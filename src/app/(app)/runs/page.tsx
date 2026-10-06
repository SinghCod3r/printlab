import Link from "next/link";
import provider from "@/lib/provider";
import { PageHeader, Card, Badge } from "@/components/ui";
import { formatDate, statusBg, formatDuration } from "@/lib/utils";

export default async function RunsPage() {
  const runs = await provider.getTestRuns();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader 
        title="Test Runs" 
        description="History of all test executions"
      />

      <div className="flex flex-col gap-4">
        {runs.length === 0 ? (
          <Card className="p-8 text-center text-muted-foreground">
            No test runs have been executed yet.
            <div className="mt-4">
              <Link href="/runs/new" className="text-blue-600 hover:underline">
                Create a new run
              </Link>
            </div>
          </Card>
        ) : (
          runs.map((run) => (
            <Link key={run.id} href={`/runs/${run.id}`}>
              <Card className="p-4 hover:shadow-md transition-shadow flex items-center justify-between">
                <div>
                  <div className="font-semibold text-lg">{run.id}</div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {formatDate(run.startedAt)} • {run.config.printerModelId} • CUPS {run.config.cupsVersionId}
                  </div>
                </div>
                <div className="flex items-center gap-6 text-right">
                  <div className="hidden sm:block text-sm">
                    <div className="text-muted-foreground">Duration</div>
                    <div className="font-medium">{formatDuration(run.duration ?? 0)}</div>
                  </div>
                  <div className="hidden sm:block text-sm">
                    <div className="text-muted-foreground">Passed / Total</div>
                    <div className="font-medium">
                      <span className="text-green-600">{run.passedTests}</span> / {run.totalTests}
                    </div>
                  </div>
                  <Badge className={`${statusBg(run.status)} capitalize`}>
                    {run.status}
                  </Badge>
                </div>
              </Card>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
