import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function addJsExtensions(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  content = content.replace(
    /from\s+['"](\.[^'"]+)['"]/g,
    (match, importPath) => {
      if (!importPath.endsWith('.js') && !importPath.endsWith('.json')) {
        modified = true;
        return `from '${importPath}.js'`;
      }
      return match;
    }
  );

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Fixed: ${filePath}`);
  }
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);

  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory() && file !== 'node_modules') {
      walkDir(filePath);
    } else if (file.endsWith('.js')) {
      addJsExtensions(filePath);
    }
  });
}

const srcDir = path.join(__dirname, 'src');
walkDir(srcDir);
console.log('Done!');
