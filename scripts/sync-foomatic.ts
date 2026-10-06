import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();
const FOOMATIC_REPO = 'https://github.com/OpenPrinting/foomatic-db.git';
const CLONE_DIR = path.join(process.cwd(), '.foomatic-db-temp');

function extractTag(xml: string, tag: string): string | null {
  const match = xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, 'i'));
  return match ? match[1].trim() : null;
}

async function syncFoomatic() {
  console.log('Syncing real Foomatic data...');
  
  if (!fs.existsSync(CLONE_DIR)) {
    console.log('Cloning foomatic-db (sparse checkout)...');
    execSync(`git clone --depth 1 --filter=blob:none --sparse ${FOOMATIC_REPO} ${CLONE_DIR}`, { stdio: 'inherit' });
    execSync(`git -C ${CLONE_DIR} sparse-checkout set db/source/printer`, { stdio: 'inherit' });
  } else {
    console.log('Updating foomatic-db...');
    execSync(`git -C ${CLONE_DIR} pull`, { stdio: 'inherit' });
  }
  
  const printerDir = path.join(CLONE_DIR, 'db/source/printer');
  const files = fs.readdirSync(printerDir).filter(f => f.endsWith('.xml'));
  console.log(`Found ${files.length} printer XML files.`);
  
  let count = 0;
  for (const file of files) {
    const xml = fs.readFileSync(path.join(printerDir, file), 'utf8');
    
    const id = extractTag(xml, 'id') || path.basename(file, '.xml');
    const make = extractTag(xml, 'make') || 'Unknown';
    const model = extractTag(xml, 'model') || file.replace('.xml', '');
    const mechanism = extractTag(xml, 'mechanism') || '';
    
    const color = mechanism.includes('<color>') || mechanism.includes('<color />') || (extractTag(mechanism, 'color') !== null);
    const duplex = mechanism.includes('duplex') || xml.toLowerCase().includes('duplex');
    
    let maxDpi: number | null = null;
    const resMatch = xml.match(/<resolution[^>]*>(\d+)\s*dpi<\/resolution>/i) || xml.match(/<resolution[^>]*>(\d+)x(\d+)\s*dpi<\/resolution>/i);
    if (resMatch && resMatch[1]) {
      maxDpi = parseInt(resMatch[1], 10);
    }
    
    await prisma.printerModel.upsert({
      where: { id: id },
      update: {
        name: model,
        manufacturer: make,
        colorSupport: color,
        duplexSupport: duplex,
        maxDpi: maxDpi,
        paperSizes: null,
        ippSupport: xml.toLowerCase().includes('ipp') || make.toLowerCase() === 'generic',
        simulatorAvailable: false
      },
      create: {
        id: id,
        name: model,
        manufacturer: make,
        colorSupport: color,
        duplexSupport: duplex,
        maxDpi: maxDpi,
        paperSizes: null,
        ippSupport: xml.toLowerCase().includes('ipp') || make.toLowerCase() === 'generic',
        simulatorAvailable: false
      }
    });
    count++;
    if (count % 500 === 0) console.log(`Processed ${count} printers...`);
  }
  
  console.log(`Successfully synced ${count} real printer models from Foomatic.`);
  await prisma.$disconnect();
}

syncFoomatic().catch(e => {
  console.error(e);
  process.exit(1);
});
