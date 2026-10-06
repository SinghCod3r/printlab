import provider from "@/lib/provider"
import { PageHeader, Card, Badge,} from "@/components/ui"
import { GitBranch, Package, Puzzle, GitFork } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"

interface ProjectPageProps {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const projects = await provider.getProjects()
  return projects.map((project) => ({
    slug: project.slug,
  }))
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;
  const project = await provider.getProject(slug)

  if (!project) {
    notFound()
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader 
        title={project.name} 
        description={project.description}
      />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 flex flex-col gap-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Package className="w-5 h-5" />
              Overview
            </h2>
            <div className="prose dark:prose-invert max-w-none">
              <p>{project.description}</p>
            </div>
            
            {project.repository && (
              <div className="mt-6">
                <a 
                  href={project.repository} 
                  target="_blank" 
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-blue-600 hover:underline dark:text-blue-400"
                >
                  <GitBranch className="w-4 h-4" />
                  View Repository
                </a>
              </div>
            )}
          </Card>

          {project.dependencies && project.dependencies.length > 0 && (
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <GitFork className="w-5 h-5" />
                Dependencies
              </h2>
              <div className="flex flex-wrap gap-2">
                {project.dependencies.map((dep: string) => (
                  <Link key={dep} href={`/projects/${dep}`}>
                    <Badge className="cursor-pointer hover:bg-secondary/80">
                      {dep}
                    </Badge>
                  </Link>
                ))}
              </div>
            </Card>
          )}

          {project.relatedProjectIds && project.relatedProjectIds.length > 0 && (
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Puzzle className="w-5 h-5" />
                Related Projects
              </h2>
              <div className="flex flex-wrap gap-2">
                {project.relatedProjectIds.map((rel: string) => (
                  <Link key={rel} href={`/projects/${rel}`}>
                    <Badge className="cursor-pointer hover:bg-muted">
                      {rel}
                    </Badge>
                  </Link>
                ))}
              </div>
            </Card>
          )}
        </div>
        
        <div className="flex flex-col gap-6">
          <Card className="p-6">
            <h3 className="font-semibold mb-3">Project Details</h3>
            <div className="space-y-4">
              {project.architectureLayer && (
                <div>
                  <span className="text-sm text-muted-foreground block">Architecture Layer</span>
                  <span className="text-sm font-medium">{project.architectureLayer}</span>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
