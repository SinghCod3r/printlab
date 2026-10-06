import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

const demoDir = path.join(process.cwd(), 'public/demo-images');

// 1. Basic Print (test-doc.txt) - Already exists, but let's make sure
fs.writeFileSync(path.join(demoDir, 'test-basic.txt'), 'Basic Print Test\nLine 2');

// 2. Color Print (test-color.txt)
fs.writeFileSync(path.join(demoDir, 'test-color.txt'), 'Color Accuracy Test\nRequires color rendering');

// 3. Duplex Print (test-duplex.txt)
fs.writeFileSync(path.join(demoDir, 'test-duplex.txt'), 'Duplex Print Test Page 1\n\x0C\nDuplex Print Test Page 2');

console.log("Test documents generated.");
