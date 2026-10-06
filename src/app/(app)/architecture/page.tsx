import provider from "@/lib/provider";
import { PageHeader, Card, Badge } from "@/components/ui";
import { ArrowDown, Cpu, Layers, Monitor, Network, Printer, Server, Settings, Webhook } from "lucide-react";
import Link from "next/link";


export default async function ArchitecturePage() {
  const projects = await provider.getProjects();

  const getProjectsByLayer = (layer: string) => {
    return projects.filter(p => p.architectureLayer === layer);
  };

  const LayerCard = ({ title, icon: Icon, description, layer, colorClass, children }: any) => {
    const layerProjects = getProjectsByLayer(layer);
    
    return (
      <div className={`relative flex flex-col rounded-xl border p-5 shadow-sm transition-all hover:shadow-md ${colorClass}`}>
        <div className="flex items-center gap-3 mb-3 border-b border-black/5 pb-3">
          <div className="p-2 bg-white rounded-lg shadow-sm">
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-bold text-lg">{title}</h3>
            <p className="text-xs opacity-80">{description}</p>
          </div>
        </div>
        
        {children}
        
        {layerProjects.length > 0 && (
          <div className="mt-4 pt-3 border-t border-black/5">
            <div className="text-[10px] font-semibold uppercase tracking-wider mb-2 opacity-70">Core Projects</div>
            <div className="flex flex-wrap gap-2">
              {layerProjects.map(p => (
                <Link key={p.id} href={`/projects/${p.slug}`}>
                  <span className="inline-flex items-center rounded-md bg-white/60 px-2 py-1 text-xs font-medium text-black/80 hover:bg-white transition-colors border border-black/10">
                    {p.name}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-8 max-w-6xl mx-auto">
      <PageHeader 
        title="Printing Stack Explorer" 
        description="Interactive architecture diagram of the modern Linux printing ecosystem." 
      />
      
      <div className="grid lg:grid-cols-2 gap-10">
        
        {/* Modern IPP Everywhere Stack */}
        <div className="flex flex-col relative">
          <div className="absolute top-0 bottom-0 left-1/2 w-1 bg-gradient-to-b from-blue-200 via-indigo-200 to-purple-200 -translate-x-1/2 -z-10 rounded-full" />
          
          <h2 className="text-xl font-bold text-center mb-8 bg-background inline-block mx-auto px-4 py-1 rounded-full border shadow-sm">Modern Stack (CUPS 3.x)</h2>
          
          <div className="flex flex-col gap-6 w-full max-w-md mx-auto">
            <LayerCard 
              title="Application / UI" 
              icon={Monitor} 
              description="User-facing applications initiating print jobs" 
              layer="application"
              colorClass="bg-blue-50/50 border-blue-200 text-blue-950"
            >
              <div className="text-sm font-medium opacity-80 text-center py-2 bg-white/50 rounded border border-blue-100">Common Print Dialog Backends (CPDB)</div>
            </LayerCard>
            
            <div className="flex justify-center -my-2"><ArrowDown className="text-blue-300 h-8 w-8" /></div>
            
            <LayerCard 
              title="Print Server (CUPS)" 
              icon={Server} 
              description="Central spooler and routing" 
              layer="cups"
              colorClass="bg-indigo-50 border-indigo-200 text-indigo-950 shadow-indigo-100/50"
            >
              <div className="flex flex-col gap-2">
                <div className="text-sm font-medium text-center py-2 bg-white rounded border border-indigo-100 shadow-sm">CUPS 3.x (Driverless)</div>
                <div className="text-xs text-center opacity-80">All-IPP architecture, no local PPDs</div>
              </div>
            </LayerCard>
            
            <div className="flex justify-center -my-2">
              <div className="flex items-center gap-2">
                <ArrowDown className="text-indigo-300 h-8 w-8" />
                <span className="text-[10px] font-mono bg-white px-2 py-0.5 rounded border border-indigo-100 text-indigo-500 shadow-sm">IPP Everywhere</span>
              </div>
            </div>
            
            <LayerCard 
              title="Printer Application" 
              icon={Layers} 
              description="Software emulation of an IPP printer for legacy devices" 
              layer="backend"
              colorClass="bg-purple-50/50 border-purple-200 text-purple-950"
            >
              <div className="text-sm text-center py-2 bg-white/50 rounded border border-purple-100">PAPPL Framework</div>
            </LayerCard>

            <div className="flex justify-center -my-2"><ArrowDown className="text-purple-300 h-8 w-8" /></div>
            
            <LayerCard 
              title="Physical Printer / Sim" 
              icon={Printer} 
              description="Final output device or simulator" 
              layer="printer"
              colorClass="bg-slate-50 border-slate-200 text-slate-900"
            >
              <div className="flex items-center justify-between px-2">
                <Badge className="bg-white">IPP Printer</Badge>
                <Badge className="bg-white">Legacy Printer</Badge>
              </div>
            </LayerCard>
          </div>
        </div>

        {/* Legacy PPD Stack */}
        <div className="flex flex-col relative opacity-90 hover:opacity-100 transition-opacity">
          <div className="absolute top-0 bottom-0 left-1/2 w-1 bg-gradient-to-b from-orange-200 via-amber-200 to-slate-200 -translate-x-1/2 -z-10 rounded-full" />
          
          <h2 className="text-xl font-bold text-center mb-8 bg-background inline-block mx-auto px-4 py-1 rounded-full border shadow-sm">Legacy Stack (CUPS 2.x)</h2>
          
          <div className="flex flex-col gap-6 w-full max-w-md mx-auto">
            <LayerCard 
              title="Application / UI" 
              icon={Monitor} 
              description="User-facing applications" 
              layer="application"
              colorClass="bg-orange-50/50 border-orange-200 text-orange-950"
            />
            
            <div className="flex justify-center -my-2"><ArrowDown className="text-orange-300 h-8 w-8" /></div>
            
            <LayerCard 
              title="Print Server (CUPS)" 
              icon={Server} 
              description="Central spooler and PPD management" 
              layer="cups"
              colorClass="bg-amber-50 border-amber-200 text-amber-950"
            >
               <div className="text-sm font-medium text-center py-2 bg-white rounded border border-amber-100 shadow-sm">CUPS 2.x (PPD-based)</div>
            </LayerCard>
            
            <div className="flex justify-center -my-2">
              <div className="flex items-center gap-2">
                <ArrowDown className="text-amber-300 h-8 w-8" />
                <span className="text-[10px] font-mono bg-white px-2 py-0.5 rounded border border-amber-100 text-amber-600 shadow-sm">PostScript / PDF</span>
              </div>
            </div>
            
            <LayerCard 
              title="Filter Chain" 
              icon={Settings} 
              description="Format conversion and processing" 
              layer="filter"
              colorClass="bg-yellow-50/50 border-yellow-200 text-yellow-950"
            >
              <div className="text-xs text-center py-2 bg-white/50 rounded border border-yellow-100">pdftopdf → ghostscript → rastertopcl</div>
            </LayerCard>

            <div className="flex justify-center -my-2">
               <div className="flex items-center gap-2">
                <ArrowDown className="text-yellow-300 h-8 w-8" />
                <span className="text-[10px] font-mono bg-white px-2 py-0.5 rounded border border-yellow-100 text-yellow-600 shadow-sm">Raster / PCL</span>
              </div>
            </div>
            
            <LayerCard 
              title="Backend / Driver" 
              icon={Cpu} 
              description="Device specific communication" 
              layer="backend"
              colorClass="bg-slate-50 border-slate-200 text-slate-900"
            >
              <div className="flex items-center justify-between px-2">
                <Badge className="bg-white">USB</Badge>
                <Badge className="bg-white">Socket</Badge>
                <Badge className="bg-white">LPD</Badge>
              </div>
            </LayerCard>
          </div>
        </div>

      </div>

      {/* Network / Transport Layer */}
      <div className="mt-8 max-w-4xl mx-auto w-full">
        <LayerCard 
          title="Transport & Discovery Layer" 
          icon={Network} 
          description="How devices are found and communicated with across the network" 
          layer="transport"
          colorClass="bg-teal-50 border-teal-200 text-teal-950"
        >
          <div className="grid grid-cols-3 gap-4 text-center mt-2">
            <div className="p-3 bg-white rounded border border-teal-100 shadow-sm text-sm font-medium">mDNS / DNS-SD</div>
            <div className="p-3 bg-white rounded border border-teal-100 shadow-sm text-sm font-medium">IPP over USB</div>
            <div className="p-3 bg-white rounded border border-teal-100 shadow-sm text-sm font-medium">SNMP</div>
          </div>
        </LayerCard>
      </div>

    </div>
  );
}
