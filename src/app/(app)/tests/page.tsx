import { PageHeader, Card, Badge, EmptyState } from "@/components/ui";
import { TestSuite, TestCase } from "@/lib/types";
import provider from "@/lib/provider";
import { ListChecks,LayoutList, Layers } from "lucide-react";

export default async function TestsPage() {
  const [testSuites, testCases] = await Promise.all([
    provider.getTestSuites(),
    provider.getTestCases()
  ]);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <PageHeader 
        title="Test Suites & Cases" 
        description="Definitions of available testing workflows" 
      />

      <section>
        <div className="flex items-center gap-2 mb-4">
          <Layers className="h-5 w-5 text-blue-600" />
          <h2 className="text-lg font-semibold tracking-tight">Test Suites</h2>
        </div>
        
        {testSuites.length === 0 ? (
          <EmptyState title="No Test Suites" description="No test suites are currently defined." />
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {testSuites.map((suite: TestSuite) => (
              <Card key={suite.id} className="flex flex-col h-full">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-foreground">{suite.name}</h3>
                  <Badge className="bg-blue-50 text-blue-700 border-blue-200 uppercase text-[10px]">
                    {suite.type}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-4">{suite.description}</p>
                <div className="mt-auto pt-4 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5 font-medium text-foreground">
                    <ListChecks className="h-4 w-4 text-muted-foreground" />
                    {suite.testCaseIds.length} tests
                  </span>
                  <span>~{Math.round(suite.estimatedDuration / 60)} min</span>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>

      <section>
        <div className="flex items-center gap-2 mb-4">
          <LayoutList className="h-5 w-5 text-indigo-600" />
          <h2 className="text-lg font-semibold tracking-tight">All Test Cases</h2>
        </div>

        {testCases.length === 0 ? (
          <EmptyState title="No Test Cases" description="No test cases are currently defined." />
        ) : (
          <div className="rounded-lg border border-border bg-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b border-border">
                  <tr>
                    <th className="px-4 py-3 font-medium">Test Case</th>
                    <th className="px-4 py-3 font-medium">Category</th>
                    <th className="px-4 py-3 font-medium">Expected Result</th>
                    <th className="px-4 py-3 font-medium">Threshold</th>
                    <th className="px-4 py-3 font-medium">Requirements</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {testCases.map((tc: TestCase) => (
                    <tr key={tc.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 font-medium text-foreground">
                        {tc.name}
                        <div className="text-[10px] text-muted-foreground font-normal font-mono mt-0.5">{tc.id}</div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge className="bg-slate-100 text-slate-700 border-slate-200 font-normal">
                          {tc.category}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {tc.expectedResult}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <span className={`font-medium ${tc.threshold >= 0.95 ? 'text-emerald-600' : 'text-amber-600'}`}>
                            {tc.threshold}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {tc.requirements.length > 0 && tc.requirements[0] !== "" ? tc.requirements.map(req => (
                            <span key={req} className="px-1.5 py-0.5 rounded text-[10px] bg-muted text-muted-foreground border border-border">
                              {req}
                            </span>
                          )) : (
                            <span className="text-xs text-muted-foreground italic">None</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
