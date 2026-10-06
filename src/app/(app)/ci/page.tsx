import { PageHeader, Card, Badge, EmptyState } from "@/components/ui"
import provider from "@/lib/provider"
import { CheckCircle2, XCircle, Clock, ChevronLeft, ChevronRight, ExternalLink, Search } from "lucide-react"
import { CIPipeline } from "@/lib/types"
import Link from "next/link"

export default async function CIPage() {
  const pageSize = 100; // Just load the top 100 for static dashboard
  
  const pipelines = await provider.getCIPipelines(1, pageSize);

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex justify-between items-start">
        <PageHeader title="CI Pipelines" description="Continuous Integration runs from OpenPrinting GitHub repositories." />
      </div>
      <div className="flex flex-col gap-4">
        {pipelines.length === 0 ? (
           <EmptyState title="No Pipelines Found" description={"Could not find any CI pipeline data."} />
        ) : (
          pipelines.map((pipeline: CIPipeline) => {
            const url = `https://github.com/OpenPrinting/${pipeline.repository}/actions/runs/${pipeline.id}`;
            return (
              <a key={pipeline.id} href={url} target="_blank" rel="noreferrer" className="block transition-transform hover:-translate-y-0.5">
                <Card className="p-4 flex flex-row items-center gap-4 hover:shadow-md transition-shadow">
                  <div className="flex-none">
                    {['success', 'passed'].includes(pipeline.status) ? <CheckCircle2 className="text-green-500 h-6 w-6" /> : null}
                    {['failure', 'failed', 'action_required'].includes(pipeline.status) ? <XCircle className="text-red-500 h-6 w-6" /> : null}
                    {['in_progress', 'running'].includes(pipeline.status) ? <Clock className="text-yellow-500 h-6 w-6" /> : null}
                  </div>
                  <div className="flex-grow flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{pipeline.repository}</span>
                      <span className="text-muted-foreground text-sm">{pipeline.branch}</span>
                    </div>
                    <div className="text-sm text-muted-foreground font-mono flex items-center gap-2">
                      {pipeline.commit.substring(0, 7)}
                      <ExternalLink className="h-3 w-3" />
                    </div>
                  </div>
                  <div className="flex-none flex items-center gap-4">
                    <div className="text-sm flex flex-col items-end">
                      <span className="text-muted-foreground">Duration</span>
                      <span>{pipeline.duration}s</span>
                    </div>
                    <Badge className={['success', 'passed'].includes(pipeline.status) ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                      {pipeline.status}
                    </Badge>
                  </div>
                </Card>
              </a>
            )
          })
        )}
      </div>
    </div>
  )
}
