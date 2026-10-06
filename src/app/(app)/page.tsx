import provider from "@/lib/provider";
import { Card, StatCard, PageHeader, Badge } from "@/components/ui";
import { formatDuration, formatDate, passRate, verdictBg, statusBg } from "@/lib/utils";
import Link from "next/link";
import { ArrowRight, XCircle } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  const runs = await provider.getTestRuns();
  const allResults = await Promise.all(runs.map((r) => provider.getTestResults(r.id)));
  const flatResults = allResults.flat();
  const regressions = await provider.getRegressions();
  const projects = await provider.getProjects();
  const simulators = await provider.getSimulators();
  
  const totalTests = flatResults.length;
  const passed = flatResults.filter((r) => r.verdict?.toLowerCase() === "pass").length;
  const failed = flatResults.filter((r) => r.verdict?.toLowerCase() === "fail").length;
  const rate = passRate(passed, totalTests);
  const activeRuns = runs.filter((r) => ["queued", "preparing", "printing", "evaluating", "running"].includes(r.status.toLowerCase())).length;
  const openRegressions = regressions.filter((r) => r.status.toLowerCase() === "open").length;
  
  const validSsim = flatResults.map(r => r.metrics?.ssim).filter(s => s !== undefined && s !== null) as number[];
  const avgSsim = validSsim.length > 0 ? (validSsim.reduce((a, b) => a + b, 0) / validSsim.length).toFixed(4) : "--";

  const totalDuration = flatResults.reduce((acc, r) => acc + (r.executionDuration || 0), 0);
  const avgDuration = totalTests > 0 ? Math.round(totalDuration / totalTests) : 0;
  
  const recentRuns = runs.sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()).slice(0, 5);
  const recentFailures = flatResults.filter((r) => r.verdict?.toLowerCase() === "fail").sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 5);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <PageHeader 
        title="PrintLab Dashboard" 
        description="System health and OpenPrinting test execution overview"
        actions={
          <Link href="/runs/new" className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-blue-700 text-white hover:bg-blue-800 h-9 px-4 py-2 transition-all hover:shadow-md hover:scale-[1.02]">
            Start New Run
          </Link>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Link href="/tests" className="group">
          <StatCard className="col-span-1 transition-all group-hover:border-blue-300 group-hover:shadow-md" label="System Pass Rate" value={`${rate}%`} detail={`${passed} / ${totalTests} passing`} />
        </Link>
        <Link href="/compare" className="group">
          <StatCard className="col-span-1 transition-all group-hover:border-blue-300 group-hover:shadow-md" label="Avg Image SSIM" value={avgSsim} detail="Across all test runs" />
        </Link>
        <Link href="/runs" className="group">
          <StatCard className="col-span-1 transition-all group-hover:border-blue-300 group-hover:shadow-md" label="Avg Execution" value={`${avgDuration}ms`} detail="Per test case" />
        </Link>
        <Link href="/regressions" className="group">
          <StatCard className="col-span-1 transition-all group-hover:border-red-300 group-hover:shadow-md" label="Open Regressions" value={openRegressions} detail={openRegressions > 0 ? "Requires attention" : "System stable"} />
        </Link>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold tracking-tight">Recent Test Runs</h2>
            <Link href="/runs" className="text-sm font-medium text-blue-600 hover:underline">View all</Link>
          </div>
          <div className="divide-y divide-border -mx-4 -mb-4 overflow-hidden">
            {recentRuns.map((run) => (
              <Link key={run.id} href={`/runs/${run.id}`} className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{run.id}</span>
                    <Badge className={statusBg(run.status)}>{run.status}</Badge>
                  </div>
                  <span className="text-xs text-muted-foreground">{formatDate(run.startedAt)}</span>
                </div>
                <div className="flex items-center gap-4 text-right">
                  <div className="flex flex-col text-xs">
                    <span className="font-medium">{run.passedTests} / {run.totalTests} Passed</span>
                    <span className="text-muted-foreground">{run.duration ? formatDuration(run.duration) : "--"}</span>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </Link>
            ))}
            {recentRuns.length === 0 && (
              <div className="p-8 text-center text-sm text-muted-foreground">No recent runs</div>
            )}
          </div>
        </Card>

        <Card className="flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold tracking-tight">Recent Failures</h2>
          </div>
          <div className="divide-y divide-border -mx-4 -mb-4 overflow-hidden">
            {recentFailures.map((res) => (
              <Link key={res.id} href={`/runs/${res.runId}/tests/${res.testCaseId}`} className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
                <div className="flex items-start gap-3">
                  <XCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                  <div className="flex flex-col gap-0.5">
                    <span className="font-medium text-sm">{res.testCaseId}</span>
                    <span className="text-xs text-muted-foreground">Run {res.runId}</span>
                  </div>
                </div>
                <div className="text-right flex flex-col items-end gap-1">
                  <Badge className={verdictBg(res.verdict)}>{res.verdict}</Badge>
                  <span className="text-xs text-muted-foreground">{formatDate(res.timestamp)}</span>
                </div>
              </Link>
            ))}
            {recentFailures.length === 0 && (
              <div className="p-8 text-center text-sm text-muted-foreground">No recent failures found</div>
            )}
          </div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card>
          <h2 className="text-lg font-semibold tracking-tight mb-4">Ecosystem Health</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Open Projects</span>
              <span className="font-medium">{projects.length}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Active Simulators</span>
              <span className="font-medium">{simulators.filter((s) => s.status === "online").length} / {simulators.length}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Known Regressions</span>
              <span className="font-medium">{regressions.length}</span>
            </div>
          </div>
        </Card>

        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold tracking-tight">Active Simulators</h2>
            <Link href="/simulators" className="text-sm font-medium text-blue-600 hover:underline">View all</Link>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            {simulators.slice(0, 4).map((sim) => (
              <div key={sim.id} className="flex items-center justify-between p-3 rounded-md border border-border bg-muted/30">
                <div className="flex flex-col">
                  <span className="text-sm font-medium line-clamp-1">{sim.name}</span>
                  <span className="text-xs text-muted-foreground">{sim.capabilities.length} capabilities</span>
                </div>
                <Badge className={sim.status === "online" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-red-50 text-red-700 border-red-200"}>
                  {sim.status}
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
