'use server'

import { redirect } from 'next/navigation';
import provider from '@/lib/provider';

export async function submitTestRun(formData: FormData) {
  const printerModelId = formData.get("printerModelId") as string;
  const simulatorId = formData.get("simulatorId") as string;
  const cupsVersionId = formData.get("cupsVersionId") as string;
  const printSystemType = formData.get("printSystemType") as any;
  const colorMode = formData.get("colorMode") as any;
  const duplexMode = formData.get("duplexMode") as any;
  const orientation = formData.get("orientation") as any;
  const dpi = parseInt(formData.get("dpi") as string, 10);
  const documentId = formData.get("documentId") as string;
  const testSuiteId = formData.get("testSuiteId") as string;

  // 1. Create the TestRun in the Vercel Postgres Database
  const newRun = await provider.createTestRun({
    printerModelId,
    simulatorId,
    cupsVersionId,
    printSystemType,
    colorMode,
    duplexMode,
    orientation,
    dpi,
    documentId,
    testSuiteId,
  });

  // 2. Trigger the GitHub Action via API to do the actual background work
  if (process.env.GITHUB_PAT) {
    try {
      await fetch('https://api.github.com/repos/SinghCod3r/printlab/actions/workflows/run-tests.yml/dispatches', {
        method: 'POST',
        headers: {
          'Accept': 'application/vnd.github.v3+json',
          'Authorization': `token ${process.env.GITHUB_PAT}`,
        },
        body: JSON.stringify({
          ref: 'main',
          inputs: { runId: newRun.id }
        }),
      });
    } catch (e) {
      console.error("Failed to trigger GitHub Action:", e);
    }
  } else {
    console.warn("GITHUB_PAT is not set. The GitHub Action will not be triggered automatically.");
  }

  // 3. Redirect the user to the live tracking page!
  redirect(`/runs/${newRun.id}`);
}
