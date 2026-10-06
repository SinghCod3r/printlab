import { PrismaClient } from "@prisma/client";
import { execSync } from "child_process";

const prisma = new PrismaClient();

async function main() {
  console.log("Synchronizing simulators...");
  
  await prisma.simulator.deleteMany({});
  
  try {
    const ippeveprinterPath = execSync("which ippeveprinter").toString().trim();
    if (ippeveprinterPath) {
      console.log(`Found ippeveprinter at ${ippeveprinterPath}`);
      
      const genericModel = await prisma.printerModel.upsert({
        where: { id: "generic-ipp-everywhere" },
        update: {},
        create: {
          id: "generic-ipp-everywhere",
          name: "IPP Everywhere Printer",
          manufacturer: "CUPS",
          colorSupport: true,
          duplexSupport: true,
          maxDpi: 1200,
          ippSupport: true,
          simulatorAvailable: true
        }
      });
      
      await prisma.simulator.create({
        data: {
          id: "sim-ippeveprinter",
          name: "IPP Everywhere Simulator",
          printerModelId: genericModel.id,
          status: "online",
          capabilities: "ipp,color,duplex",
          repository: "https://github.com/OpenPrinting/cups",
          lastUpdate: new Date()
        }
      });
      console.log("✅ Registered ippeveprinter");
    }
  } catch (err) {
    console.log("ippeveprinter not found, continuing...");
  }
  
  console.log("Simulator synchronization complete.");
}

main().catch(console.error).finally(() => prisma.$disconnect());
