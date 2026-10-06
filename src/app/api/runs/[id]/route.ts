import { NextResponse } from "next/server";
import provider from "@/lib/provider";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const runId = resolvedParams.id;
  const run = await provider.getTestRun(runId);
  if (!run) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const results = await provider.getTestResults(runId);
  return NextResponse.json({ run, results });
}
