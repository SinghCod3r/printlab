import { PageHeader } from "@/components/ui";
import provider from "@/lib/provider";
import { RunForm } from "./run-form";

export const dynamic = "force-dynamic";

export default async function NewTestRunPage() {
  const [printers, simulators, cupsVersions, testSuites, documents] = await Promise.all([
    provider.getPrinterModels(),
    provider.getSimulators(),
    provider.getCupsVersions(),
    provider.getTestSuites(),
    provider.getTestDocuments(),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="New Test Run"
        description="Configure and start a new printing system test run"
      />
      <RunForm
        printers={printers}
        simulators={simulators}
        cupsVersions={cupsVersions}
        testSuites={testSuites}
        documents={documents}
      />
    </div>
  );
}
