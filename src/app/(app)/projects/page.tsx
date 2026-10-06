import provider from "@/lib/provider";
import { PageHeader, Card, Badge } from "@/components/ui";
import { FolderOpen, GitBranch, Star, CircleDot } from "lucide-react";
import Link from "next/link";

export default async function ProjectsPage() {
  const projects = await provider.getProjects();

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <PageHeader 
        title="OpenPrinting Projects" 
        description="Explore the components that make up the OpenPrinting ecosystem" 
      />

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects.map((project) => (
          <Link key={project.id} href={`/projects/${project.slug}`}>
            <Card className="h-full flex flex-col hover:border-blue-500/50 hover:shadow-sm transition-all group">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <FolderOpen className="h-5 w-5 text-blue-600 group-hover:text-blue-700" />
                  <h3 className="font-semibold text-foreground group-hover:text-blue-700 transition-colors">
                    {project.name}
                  </h3>
                </div>
                <Badge className="bg-muted text-muted-foreground capitalize">
                  {project.architectureLayer}
                </Badge>
              </div>
              
              <p className="text-sm text-muted-foreground line-clamp-3 mb-4 flex-1">
                {project.description}
              </p>
              
              <div className="pt-4 border-t border-border mt-auto flex items-center justify-between text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5 font-medium">
                  <div className="w-2 h-2 rounded-full bg-slate-400" />
                  {project.language}
                </span>
                
                <div className="flex items-center gap-3">
                  {project.stars !== undefined && (
                    <span className="flex items-center gap-1">
                      <Star className="h-3.5 w-3.5" /> {project.stars}
                    </span>
                  )}
                  {project.openIssues !== undefined && (
                    <span className="flex items-center gap-1">
                      <CircleDot className="h-3.5 w-3.5" /> {project.openIssues}
                    </span>
                  )}
                  <GitBranch className="h-4 w-4" />
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
