import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function getModelName(filePath) {
  const fileName = path.basename(filePath, '.model.js');
  // Convert kebab-case to PascalCase
  return fileName.split(/[-_]/).map(word =>
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join('');
}

function fixModelImports(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  const original = content;

  // Pattern 1: import ModelName from '../models/xxx.model.js';
  // Convert to: import { ModelName } from '../models/xxx.model.js';
  content = content.replace(
    /^import\s+(\w+)\s+from\s+['"]([^'"]*\/models\/[^'"]+\.model\.js)['"]/gm,
    "import { $1 } from '$2'"
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
    } else if (file.endsWith('.js') && !file.endsWith('.model.js')) {
      if (fixModelImports(filePath)) {
        count++;
      }
    }
  });

  return count;
}

const srcDir = path.join(__dirname, 'src');
const count = walkDir(srcDir);
console.log(`\nDone! Fixed ${count} files.`);
