import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function main() {
  const dataDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir);
  }

  const projects = await prisma.repository.findMany();
  fs.writeFileSync(path.join(dataDir, 'projects.json'), JSON.stringify(projects, null, 2));

  const simulators = await prisma.simulator.findMany();
  fs.writeFileSync(path.join(dataDir, 'simulators.json'), JSON.stringify(simulators, null, 2));

  const runs = await prisma.testRun.findMany({ include: { results: true }});
  fs.writeFileSync(path.join(dataDir, 'runs.json'), JSON.stringify(runs, null, 2));

  const suites = await prisma.testSuite.findMany({ include: { testCases: true }});
  fs.writeFileSync(path.join(dataDir, 'suites.json'), JSON.stringify(suites, null, 2));

  const regressions = await prisma.regression.findMany();
  fs.writeFileSync(path.join(dataDir, 'regressions.json'), JSON.stringify(regressions, null, 2));

  const pipelines = await prisma.cIPipeline.findMany();
  fs.writeFileSync(path.join(dataDir, 'pipelines.json'), JSON.stringify(pipelines, null, 2));
  
  const models = await prisma.printerModel.findMany();
  fs.writeFileSync(path.join(dataDir, 'models.json'), JSON.stringify(models, null, 2));

  const cases = await prisma.testCase.findMany();
  fs.writeFileSync(path.join(dataDir, 'cases.json'), JSON.stringify(cases, null, 2));


  console.log("Database dumped to JSON files in /data.");
}

main().catch(console.error).finally(() => prisma.$disconnect());
