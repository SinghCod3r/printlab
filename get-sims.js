const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
p.simulator.findMany().then(s => { console.log(JSON.stringify(s, null, 2)); p.$disconnect(); });
