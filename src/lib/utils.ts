import { type ClassValue, clsx } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}m ${secs}s`;
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatShortDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export function passRate(passed: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((passed / total) * 1000) / 10;
}

export function verdictColor(verdict: string): string {
  switch (verdict) {
    case "pass":
      return "text-emerald-600";
    case "fail":
      return "text-red-600";
    case "warning":
      return "text-amber-600";
    case "running":
      return "text-blue-600";
    default:
      return "text-zinc-500";
  }
}

export function verdictBg(verdict: string): string {
  switch (verdict) {
    case "pass":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "fail":
      return "bg-red-50 text-red-700 border-red-200";
    case "warning":
      return "bg-amber-50 text-amber-700 border-amber-200";
    case "running":
      return "bg-blue-50 text-blue-700 border-blue-200";
    default:
      return "bg-zinc-50 text-zinc-700 border-zinc-200";
  }
}

export function statusColor(status: string): string {
  switch (status) {
    case "completed":
    case "passed":
    case "online":
      return "text-emerald-600";
    case "failed":
    case "offline":
      return "text-red-600";
    case "running":
    case "preparing":
    case "printing":
    case "evaluating":
      return "text-blue-600";
    case "queued":
    case "pending":
      return "text-zinc-500";
    default:
      return "text-zinc-500";
  }
}

export function statusBg(status: string): string {
  switch (status) {
    case "completed":
    case "passed":
    case "online":
      return "bg-emerald-50 text-emerald-700";
    case "failed":
    case "offline":
      return "bg-red-50 text-red-700";
    case "running":
    case "preparing":
    case "printing":
    case "evaluating":
      return "bg-blue-50 text-blue-700";
    default:
      return "bg-zinc-50 text-zinc-700";
  }
}
