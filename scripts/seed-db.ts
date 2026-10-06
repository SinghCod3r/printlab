import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seed() {
  console.log('Seeding test suite definitions...');

  const testCases = [
    { id: "tc-basic-print", name: "Basic Print", category: "basic", requirements: "printer", expectedResult: "Clean output", threshold: 0.95 },
    { id: "tc-color", name: "Color Accuracy", category: "color", requirements: "color", expectedResult: "Delta E < 3.0", threshold: 0.90 },
    { id: "tc-duplex", name: "Duplex Printing", category: "duplex", requirements: "duplex", expectedResult: "Correct binding", threshold: 0.95 },
  ];

  for (const tc of testCases) {
    await prisma.testCase.upsert({
      where: { id: tc.id },
      update: tc,
      create: tc
    });
  }

  await prisma.testSuite.upsert({
    where: { id: "suite-smoke" },
    update: {},
    create: {
      id: "suite-smoke",
      name: "Smoke Test",
      type: "smoke",
      description: "Basic functionality validation",
      estimatedDuration: 45,
      testCases: {
        connect: [{ id: "tc-basic-print" }]
      }
    }
  });

  await prisma.testSuite.upsert({
    where: { id: "suite-full" },
    update: {},
    create: {
      id: "suite-full",
      name: "Full Capability Test",
      type: "full",
      description: "Comprehensive hardware validation",
      estimatedDuration: 180,
      testCases: {
        connect: [{ id: "tc-basic-print" }, { id: "tc-color" }, { id: "tc-duplex" }]
      }
    }
  });

  console.log('Database seeded successfully.');
}

seed()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
