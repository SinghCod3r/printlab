import fs from 'fs';
import path from 'path';
import prisma from '../src/lib/prisma';

async function seed() {
  console.log('Reading JSON files...');
  const dataDir = path.join(process.cwd(), 'data');
  
  const repos = JSON.parse(fs.readFileSync(path.join(dataDir, 'projects.json'), 'utf-8'));
  const models = JSON.parse(fs.readFileSync(path.join(dataDir, 'models.json'), 'utf-8'));
  const simulators = JSON.parse(fs.readFileSync(path.join(dataDir, 'simulators.json'), 'utf-8'));
  const cases = JSON.parse(fs.readFileSync(path.join(dataDir, 'cases.json'), 'utf-8'));
  const suites = JSON.parse(fs.readFileSync(path.join(dataDir, 'suites.json'), 'utf-8'));

  console.log('Inserting repositories...');
  for (const repo of repos) {
    await prisma.repository.upsert({
      where: { slug: repo.slug },
      update: {},
      create: {
        id: repo.id,
        name: repo.name,
        slug: repo.slug,
        description: repo.description,
        url: repo.url,
        architectureLayer: repo.architectureLayer,
        role: repo.role,
        stars: 0,
        forks: 0,
        openIssues: 0,
      }
    });
  }

  console.log('Inserting models...');
  for (const model of models) {
    await prisma.printerModel.upsert({
      where: { id: model.id },
      update: {},
      create: {
        id: model.id,
        name: model.name,
        manufacturer: model.manufacturer,
        colorSupport: model.colorSupport,
        duplexSupport: model.duplexSupport,
        ippSupport: model.ippSupport,
        simulatorAvailable: model.simulatorAvailable,
      }
    });
  }

  console.log('Inserting simulators...');
  for (const sim of simulators) {
    await prisma.simulator.upsert({
      where: { id: sim.id },
      update: {},
      create: {
        id: sim.id,
        name: sim.name,
        printerModelId: sim.printerModelId,
        status: sim.status,
        capabilities: Array.isArray(sim.capabilities) ? sim.capabilities.join(',') : sim.capabilities,
        repository: sim.repository,
        lastUpdate: new Date(sim.lastUpdate),
      }
    });
  }

  console.log('Inserting cases...');
  for (const c of cases) {
    await prisma.testCase.upsert({
      where: { id: c.id },
      update: {},
      create: {
        id: c.id,
        name: c.name,
        category: c.category,
        requirements: Array.isArray(c.requirements) ? c.requirements.join(',') : c.requirements,
        expectedResult: c.expectedResult,
        threshold: c.threshold,
      }
    });
  }

  console.log('Inserting suites...');
  for (const s of suites) {
    await prisma.testSuite.upsert({
      where: { id: s.id },
      update: {},
      create: {
        id: s.id,
        name: s.name,
        type: s.type,
        description: s.description,
        estimatedDuration: s.estimatedDuration,
        testCases: {
          connect: (s.testCases || []).map((tc: any) => ({ id: tc.id }))
        }
      }
    });
  }

  console.log('✅ Seeding complete!');
}

seed()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
