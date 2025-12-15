import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function fixExports(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // Fix: export default { ModelName } => export { ModelName } (for models)
  content = content.replace(
    /export\s+default\s+\{\s*(\w+)\s*\};?$/gm,
    (match, exportName) => {
      modified = true;
      return `export { ${exportName} };`;
    }
  );

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Fixed exports: ${filePath}`);
  }
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);

  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory() && file !== 'node_modules') {
      walkDir(filePath);
    } else if (file.endsWith('.model.js')) {
      fixExports(filePath);
    }
  });
}

const modelsDir = path.join(__dirname, 'src/models');
walkDir(modelsDir);
console.log('Done fixing exports!');
