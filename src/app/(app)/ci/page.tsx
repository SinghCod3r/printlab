import { PageHeader, Card, Badge, EmptyState } from "@/components/ui"
import provider from "@/lib/provider"
import { CheckCircle2, XCircle, Clock, ChevronLeft, ChevronRight, ExternalLink, Search } from "lucide-react"
import { CIPipeline } from "@/lib/types"
import Link from "next/link"

export default async function CIPage({ searchParams }: { searchParams: Promise<{ page?: string, q?: string }> }) {
  const resolvedParams = await searchParams;
  const page = parseInt(resolvedParams.page || "1", 10);
  const q = resolvedParams.q || "";
  const pageSize = 15;
  
  const totalCount = await provider.getCIPipelinesCount(q);
  const pipelines = await provider.getCIPipelines(page, pageSize, q);
  
  const totalPages = Math.ceil(totalCount / pageSize) || 1;
  const hasNext = page < totalPages;
  const hasPrev = page > 1;

  const startPage = Math.max(1, page - 2);
  const endPage = Math.min(totalPages, Math.max(startPage + 4, 5));
  const normalizedStart = Math.max(1, Math.min(startPage, endPage - 4));
  
  const pages = Array.from({ length: endPage - normalizedStart + 1 }, (_, i) => normalizedStart + i).filter(p => p <= totalPages);

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex justify-between items-start">
        <PageHeader title="CI Pipelines" description="Continuous Integration runs from OpenPrinting GitHub repositories." />
        <form action="/ci" method="GET" className="relative mt-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            name="q"
            defaultValue={q}
            placeholder="Search repositories..."
            className="pl-9 pr-4 py-2 border rounded-md text-sm w-64 bg-background"
          />
        </form>
      </div>
      <div className="flex flex-col gap-4">
        {pipelines.length === 0 ? (
           <EmptyState title="No Pipelines Found" description={q ? `No pipeline found matching "${q}".` : "Could not find any CI pipeline data."} />
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
      
      {totalPages > 1 && (
        <div className="flex justify-center items-center mt-6 gap-2">
          <Link href={`/ci?page=${page - 1}${q ? `&q=${q}` : ''}`} className={`flex items-center justify-center p-2 rounded-md border ${!hasPrev ? 'pointer-events-none opacity-50 bg-muted' : 'hover:bg-muted bg-background'}`}>
            <ChevronLeft className="h-4 w-4" />
          </Link>
          
          {pages.map(p => (
            <Link key={p} href={`/ci?page=${p}${q ? `&q=${q}` : ''}`} className={`flex items-center justify-center h-9 w-9 rounded-md border text-sm font-medium ${p === page ? 'bg-blue-600 text-white pointer-events-none border-blue-600' : 'hover:bg-muted bg-background'}`}>
              {p}
            </Link>
          ))}

          <Link href={`/ci?page=${page + 1}${q ? `&q=${q}` : ''}`} className={`flex items-center justify-center p-2 rounded-md border ${!hasNext ? 'pointer-events-none opacity-50 bg-muted' : 'hover:bg-muted bg-background'}`}>
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      )}
    </div>
  )
}
