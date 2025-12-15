import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function fixControllerImports(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  const original = content;

  // Pattern: import controllerName from '../../controllers/xxx.controller.js';
  // Convert to: import * as controllerName from '../../controllers/xxx.controller.js';
  content = content.replace(
    /^import\s+(\w+)\s+from\s+['"]([^'"]*\/controllers\/[^'"]+\.controller\.js)['"]/gm,
    "import * as $1 from '$2'"
  );

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Fixed: ${filePath}`);
    return true;
  }
  return false;
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  let count = 0;

  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory() && file !== 'node_modules') {
      count += walkDir(filePath);
    } else if (file.endsWith('.routes.js')) {
      if (fixControllerImports(filePath)) {
        count++;
      }
    }
  });

  return count;
}

const routesDir = path.join(__dirname, 'src/routes');
const count = walkDir(routesDir);
console.log(`\nDone! Fixed ${count} route files.`);
