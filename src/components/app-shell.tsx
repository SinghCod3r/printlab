"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Play,
  FlaskConical,
  GitCompareArrows,
  AlertTriangle,
  Printer,
  FolderOpen,
  Network,
  TestTubes,
  GitBranch,
  Layers,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/runs/new", label: "New Test Run", icon: Play },
  { href: "/tests", label: "Test Suites", icon: TestTubes },
  { href: "/regressions", label: "Regressions", icon: AlertTriangle },
  { href: "/compare", label: "Compare", icon: GitCompareArrows },
  { href: "/batch", label: "Batch Testing", icon: Layers },
  { href: "/simulators", label: "Simulators", icon: Printer },
  { href: "/projects", label: "Projects", icon: FolderOpen },
  { href: "/architecture", label: "Architecture", icon: Network },
  { href: "/ci", label: "CI Pipelines", icon: GitBranch },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden">
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-60 border-r border-border bg-card flex flex-col transition-transform duration-200 lg:static lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center gap-2 px-4 py-4 border-b border-border">
          <img src="/logo.png" className="h-5 w-5 object-contain" />
          <Link href="/" className="font-semibold text-sm tracking-tight">
            OpenPrinting PrintLab
          </Link>
        </div>
        <nav className="flex-1 overflow-y-auto py-2 px-2" aria-label="Main navigation">
          {navItems.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-accent/10 text-accent"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-border px-4 py-3 flex items-center justify-center">
          <img src="/logo.png" alt="PrintLab Logo" className="h-10 w-10 opacity-50 grayscale object-contain" />
        </div>
      </aside>

      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/20 lg:hidden"
          onClick={() => setMobileOpen(false)}
          role="presentation"
        />
      )}

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex items-center gap-3 border-b border-border bg-card px-4 py-3 lg:px-6">
          <button
            className="lg:hidden p-1 rounded hover:bg-muted"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? "Close navigation" : "Open navigation"}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <div className="flex-1" />
          <span className="inline-flex items-center gap-1.5 rounded-full border border-green-200 bg-green-50 px-2.5 py-0.5 text-[11px] font-medium text-green-700">
            <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
            Live Platform
          </span>
        </header>
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
