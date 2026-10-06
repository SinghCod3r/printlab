export const dynamic = 'force-dynamic';

import provider from "@/lib/provider"
import { PageHeader, Card, Badge } from "@/components/ui"
import { Regression } from "@/lib/types"

export default async function RegressionsPage() {
  const regressions = await provider.getRegressions()

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Regressions"
        description="List of detected regressions across test runs"
      />
      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">ID</th>
                <th className="px-4 py-3 font-medium">Test Case</th>
                <th className="px-4 py-3 font-medium">Printer Model</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">First Good Run</th>
                <th className="px-4 py-3 font-medium">First Bad Run</th>
                <th className="px-4 py-3 font-medium">SSIM Change</th>
                <th className="px-4 py-3 font-medium">Suspected Component</th>
                <th className="px-4 py-3 font-medium">Repo Link</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {regressions.map((regression: Regression) => (
                <tr key={regression.id} className="hover:bg-muted/50">
                  <td className="px-4 py-3 font-mono text-xs">{regression.id}</td>
                  <td className="px-4 py-3">{regression.testCaseId}</td>
                  <td className="px-4 py-3">{regression.printerModelId}</td>
                  <td className="px-4 py-3">
                    <Badge>{regression.status}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    {regression.firstGoodRunId} <span className="text-muted-foreground text-xs">({regression.firstGoodVersion})</span>
                  </td>
                  <td className="px-4 py-3">
                    {regression.firstBadRunId} <span className="text-muted-foreground text-xs">({regression.firstBadVersion})</span>
                  </td>
                  <td className="px-4 py-3 text-destructive">
                    {regression.metricsChange.before.ssim} → {regression.metricsChange.after.ssim}
                  </td>
                  <td className="px-4 py-3">{regression.suspectedComponent}</td>
                  <td className="px-4 py-3">
                    {regression.relatedRepository ? (
                      <a href={regression.relatedRepository} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                        View
                      </a>
                    ) : (
                      <span className="text-muted-foreground">N/A</span>
                    )}
                  </td>
                </tr>
              ))}
              {regressions.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-muted-foreground">
                    No regressions found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
