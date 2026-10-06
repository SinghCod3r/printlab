import { PageHeader, Card, Badge, EmptyState } from "@/components/ui";
import { Simulator } from "@/lib/types";
import provider from "@/lib/provider";
import { Printer, Settings2, GitCommit,XCircle } from "lucide-react";

export default async function SimulatorsPage() {
  const simulators = await provider.getSimulators();

  if (!simulators || simulators.length === 0) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto">
        <PageHeader 
          title="Printer Simulators" 
          description="Virtual models available for testing" 
        />
        <EmptyState 
          title="No Simulators Found" 
          description="There are currently no active printer simulators connected to the PrintLab network."
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <PageHeader 
        title="Printer Simulators" 
        description="Virtual models dynamically discovered and available for testing" 
      />

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {simulators.map((simulator: Simulator) => (
          <Card key={simulator.id} className="flex flex-col h-full hover:shadow-sm transition-all border-border">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-50 rounded-md">
                  <Printer className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground line-clamp-1">{simulator.name}</h3>
                </div>
              </div>
              <Badge className={simulator.status.toLowerCase() === 'online' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'}>
                {simulator.status}
              </Badge>
            </div>

            <div className="flex-1 space-y-4">
              <div>
                <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Settings2 className="h-3.5 w-3.5" /> Capabilities
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  <Badge className="bg-muted text-muted-foreground font-normal border-transparent">
                    {simulator.capabilities.includes('color') ? 'Color' : 'Monochrome'}
                  </Badge>
                  <Badge className="bg-muted text-muted-foreground font-normal border-transparent">
                    {simulator.capabilities.includes('duplex') ? 'Duplex' : 'Simplex'}
                  </Badge>
                  {simulator.capabilities.map(cap => {
                    if (cap.includes('dpi')) {
                      return <Badge key={cap} className="bg-muted text-muted-foreground font-normal border-transparent">{cap.toUpperCase()}</Badge>;
                    }
                    if (cap === 'ipp') {
                      return <Badge key={cap} className="bg-blue-50 text-blue-700 font-normal border-blue-100">IPP Everywhere</Badge>;
                    }
                    return null;
                  })}
                </div>
              </div>

              <div>
                <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Paper Sizes</h4>
                <div className="flex flex-wrap gap-1.5">
                  {simulator.capabilities.filter(c => !['color', 'monochrome', 'duplex', 'simplex', 'ipp'].includes(c) && !c.includes('dpi')).map((size: string) => (
                    <Badge key={size} className="bg-slate-50 text-slate-600 font-normal border-slate-200">
                      {size}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
              <a 
                href={simulator.repository}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 hover:text-foreground transition-colors"
              >
                <GitCommit className="h-3.5 w-3.5" />
                Repository
              </a>
              <span className="flex items-center gap-1">
                Updated: {new Date(simulator.lastUpdate).toLocaleDateString()}
              </span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
