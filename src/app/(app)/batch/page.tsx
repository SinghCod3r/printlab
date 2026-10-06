import provider from "@/lib/provider"
import { PageHeader, Card, Badge } from "@/components/ui"
import { TestRun } from "@/lib/types"

export default async function BatchPage() {
  const runs = await provider.getTestRuns()

  const groupedRuns = runs.reduce((acc: Record<string, TestRun[]>, run: TestRun) => {
    const printer = run.config.printerModelId || "Unknown"
    if (!acc[printer]) {
      acc[printer] = []
    }
    acc[printer].push(run)
    return acc
  }, {})

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Batch Testing" description="Matrix of printers, CUPS versions, and test suites" />

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs uppercase bg-muted/50 border-b">
              <tr>
                <th className="px-6 py-3 font-medium">Printer</th>
                <th className="px-6 py-3 font-medium">CUPS</th>
                <th className="px-6 py-3 font-medium">Tests</th>
                <th className="px-6 py-3 font-medium">Pass</th>
                <th className="px-6 py-3 font-medium">Fail</th>
                <th className="px-6 py-3 font-medium">Regression</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(groupedRuns).map(([printer, printerRuns]: [string, TestRun[]]) => (
                printerRuns.map((run: TestRun, index: number) => (
                  <tr key={run.id} className="border-b last:border-0 hover:bg-muted/50">
                    {index === 0 ? (
                      <td className="px-6 py-4 font-medium" rowSpan={printerRuns.length}>
                        {printer}
                      </td>
                    ) : null}
                    <td className="px-6 py-4">{run.config.cupsVersionId || "2.4.7"}</td>
                    <td className="px-6 py-4">{run.totalTests}</td>
                    <td className="px-6 py-4 text-green-600 font-medium">{run.passedTests}</td>
                    <td className="px-6 py-4 text-red-600 font-medium">{run.failedTests}</td>
                    <td className="px-6 py-4">
                      {run.failedTests > 0 ? (
                        <Badge >Yes</Badge>
                      ) : (
                        <Badge >No</Badge>
                      )}
                    </td>
                  </tr>
                ))
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
