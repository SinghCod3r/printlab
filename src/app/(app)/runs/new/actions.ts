"use server";

import provider from "@/lib/provider";
import { PrintSystemType, ColorMode, DuplexMode, Orientation } from "@/lib/types";
import { redirect } from "next/navigation";

export async function createTestRunAction(formData: FormData) {
  const printerModelId = formData.get("printerModelId") as string;
  const simulatorId = formData.get("simulatorId") as string;
  const cupsVersionId = formData.get("cupsVersionId") as string;
  const printSystemType = formData.get("printSystemType") as PrintSystemType;
  const colorMode = formData.get("colorMode") as ColorMode;
  const duplexMode = formData.get("duplexMode") as DuplexMode;
  const orientation = formData.get("orientation") as Orientation;
  const dpi = parseInt(formData.get("dpi") as string, 10) || 600;
  const documentId = formData.get("documentId") as string;
  const testSuiteId = formData.get("testSuiteId") as string;

  const run = await provider.createTestRun({
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

  redirect(`/runs/${run.id}`);
}
