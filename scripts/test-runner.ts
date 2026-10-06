import { PrismaClient } from '@prisma/client';
import { exec, spawn } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();
const execAsync = promisify(exec);

async function checkDependencies() {
  console.log("Checking for OpenPrinting test infrastructure...");
  const missing = [];
  
  try {
    await execAsync('which cupsd');
    console.log("✅ cupsd found");
  } catch { missing.push('cupsd'); }
  
  try {
    await execAsync('which ippeveprinter');
    console.log("✅ ippeveprinter found");
  } catch { missing.push('ippeveprinter'); }
  
  try {
    await execAsync('./venv/bin/python3 -c "import cv2; import skimage"');
    console.log("✅ Image evaluation dependencies found");
  } catch { missing.push('python-opencv-skimage'); }
  
  if (missing.length > 0) {
    console.warn("⚠️ Required OpenPrinting infrastructure missing:", missing.join(', '));
    return { ok: false, missing };
  }
  return { ok: true, missing: [] };
}

import * as net from 'net';

async function getFreePort(): Promise<number> {
  return new Promise((resolve, reject) => {
    const srv = net.createServer();
    srv.listen(0, '127.0.0.1', () => {
      const port = (srv.address() as net.AddressInfo).port;
      srv.close(() => resolve(port));
    });
    srv.on('error', reject);
  });
}

async function runWorker() {
  console.log("Starting OpenPrinting PrintLab Local Worker...");
  const deps = await checkDependencies();
  
  while (true) {
    const run = await prisma.testRun.findFirst({
      where: { status: 'queued' },
      orderBy: { startedAt: 'asc' },
      include: { results: true }
    });

    if (!run) {
      // Sleep for 2 seconds and check again
      await new Promise(resolve => setTimeout(resolve, 2000));
      continue;
    }

    console.log(`[Worker] Picked up job: ${run.id}`);
    
    await prisma.testRun.update({
      where: { id: run.id },
      data: { status: 'preparing' }
    });

    if (!deps.ok) {
      console.log(`[Worker] Job ${run.id} failed: Missing infrastructure`);
      await prisma.testRun.update({
        where: { id: run.id },
        data: { status: 'failed', completedAt: new Date(), duration: 0, failedTests: run.totalTests }
      });
      continue;
    }

    try {
      console.log(`[Worker] Starting isolated execution for run ${run.id}...`);
      
      const cupsPort = await getFreePort();
      const ippPort = await getFreePort();
      
      const runDir = path.join('/tmp', `printlab_cups_${run.id}`);
      fs.mkdirSync(path.join(runDir, 'log'), { recursive: true });
      fs.mkdirSync(path.join(runDir, 'cache'), { recursive: true });
      fs.mkdirSync(path.join(runDir, 'spool'), { recursive: true });
      
      const cupsConf = `
Listen 127.0.0.1:${cupsPort}
ServerBin /usr/lib/cups
ServerRoot ${runDir}
StateDir ${runDir}
DataDir /usr/share/cups
CacheDir ${runDir}/cache
ErrorLog ${runDir}/log/error_log
AccessLog ${runDir}/log/access_log
PageLog ${runDir}/log/page_log
RequestRoot ${runDir}/spool
StrictPermissions No
User ${process.env.USER || 'root'}
Group ${process.env.USER || 'root'}
<Location />
  Order allow,deny
  Allow all
</Location>
<Location /admin>
  Order allow,deny
  Allow all
</Location>
`;
      fs.writeFileSync(path.join(runDir, 'cupsd.conf'), cupsConf);
      fs.writeFileSync(path.join(runDir, 'cups-files.conf'), `
StateDir ${runDir}
CacheDir ${runDir}/cache
ErrorLog ${runDir}/log/error_log
AccessLog ${runDir}/log/access_log
PageLog ${runDir}/log/page_log
RequestRoot ${runDir}/spool
`);

      // Start cupsd
      const cupsd = spawn('/usr/sbin/cupsd', ['-c', path.join(runDir, 'cupsd.conf'), '-s', path.join(runDir, 'cups-files.conf'), '-f']);
      await new Promise(r => setTimeout(r, 2000));
      
      const captureScript = path.join(runDir, 'capture.sh');
      fs.writeFileSync(captureScript, `#!/bin/bash
IN_FILE="$1"
OUT_FILE="${runDir}/captured.png"
gs -dQUIET -dPARANOIDSAFER -dBATCH -dNOPAUSE -dNOPROMPT -sDEVICE=png16m -dTextAlphaBits=4 -dGraphicsAlphaBits=4 -r300 -sOutputFile="$OUT_FILE" "$IN_FILE"
`);
      fs.chmodSync(captureScript, '755');

      const ippeve = spawn('/usr/sbin/ippeveprinter', ['-f', 'application/pdf', '-c', captureScript, '-p', (ippPort as number).toString(), 'PrintLabSim']);
      await new Promise(r => setTimeout(r, 2000));

      await execAsync(`CUPS_SERVER=127.0.0.1:${cupsPort} lpadmin -p PrintLabSim -v ipp://localhost:${ippPort}/ipp/print -m everywhere -E`);

      let passedCount = 0;
      let failedCount = 0;
      
      for (const res of run.results) {
        if (fs.existsSync(path.join(runDir, 'captured.png'))) {
          fs.unlinkSync(path.join(runDir, 'captured.png'));
        }
        
        let inputFile = 'public/demo-images/test-basic.txt';
        let expectedFile = 'public/demo-images/expected-basic.png';
        
        if (res.testCaseId === 'tc-color') {
          inputFile = 'public/demo-images/test-color.txt';
          expectedFile = 'public/demo-images/expected-basic.png'; // Will intentionally have lower SSIM if different
        } else if (res.testCaseId === 'tc-duplex') {
          inputFile = 'public/demo-images/test-duplex.txt';
          expectedFile = 'public/demo-images/expected-basic.png';
        }
        
        let testLog = `[Worker] Running test ${res.testCaseId}...\n`;
        testLog += `> CUPS_SERVER=127.0.0.1:${cupsPort} lpadmin -p PrintLabSim -v ipp://localhost:${ippPort}/ipp/print -m everywhere -E\n`;
        testLog += `> CUPS_SERVER=127.0.0.1:${cupsPort} lp -d PrintLabSim ${inputFile}\n`;
        console.log(`[Worker] Running test ${res.testCaseId}...`);
        
        try {
          const lpOut = await execAsync(`CUPS_SERVER=127.0.0.1:${cupsPort} lp -d PrintLabSim ${path.join(process.cwd(), inputFile)}`);
          testLog += `${lpOut.stdout}\n`;
        } catch (e: any) {
          testLog += `Error: ${e.message}\n`;
        }
        
        testLog += `> Waiting for capture artifact...\n`;
        let attempts = 0;
        let found = false;
        while(attempts < 15) {
          if (fs.existsSync(path.join(runDir, 'captured.png'))) { found = true; break; }
          await new Promise(r => setTimeout(r, 1000));
          attempts++;
        }
        
        if (!found) {
          testLog += `Error: Test timeout: No capture artifact\n`;
          throw new Error(`Test timeout: No capture artifact for ${res.testCaseId}`);
        }
        
        const outPdf = path.join(process.cwd(), 'public/uploads', `${res.id}-actual.png`);
        fs.mkdirSync(path.join(process.cwd(), 'public/uploads'), { recursive: true });
        fs.copyFileSync(path.join(runDir, 'captured.png'), outPdf);
        
        testLog += `> python3 scripts/evaluate.py\n`;
        const evalOut = await execAsync(`./venv/bin/python3 scripts/evaluate.py ${outPdf} ${path.join(process.cwd(), expectedFile)}`);
        testLog += `${evalOut.stderr}\n`;
        const resultDictStr = evalOut.stdout.trim().replace(/'/g, '"');
        const metrics = JSON.parse(resultDictStr);
        
        const pass = metrics.ssim > (res.threshold || 0.95);
        if (pass) passedCount++; else failedCount++;
        testLog += `[Result] Verdict: ${pass ? 'PASS' : 'FAIL'} (SSIM: ${metrics.ssim})\n`;
        
        await prisma.testResult.update({
          where: { id: res.id },
          data: {
            verdict: pass ? 'PASS' : 'FAIL',
            actualImageUrl: `/uploads/${res.id}-actual.png`,
            expectedImageUrl: `/${expectedFile.replace('public/', '')}`,
            differenceImageUrl: metrics.diff ? `/uploads/${path.basename(metrics.diff)}` : null,
            ssim: metrics.ssim,
            psnr: metrics.psnr,
            executionDuration: 2,
            logs: testLog
          }
        });
      }

      try { ippeve.kill(); } catch (_e) {}
      try { cupsd.kill(); } catch (_e) {}
      
      await prisma.testRun.update({
        where: { id: run.id },
        data: {
          status: failedCount > 0 ? 'failed' : 'passed',
          completedAt: new Date(),
          duration: 10,
          passedTests: passedCount,
          failedTests: failedCount,
        }
      });
      console.log(`[Worker] Run ${run.id} finished successfully!`);
      
    } catch (e) {
      console.error(`[Worker] Run ${run.id} execution failed:`, e);
      await prisma.testRun.update({
        where: { id: run.id },
        data: { status: 'failed', completedAt: new Date(), duration: 0 }
      });
    }
  }
}

runWorker().catch(e => {
  console.error("Worker error:", e);
  prisma.$disconnect();
  process.exit(1);
});
