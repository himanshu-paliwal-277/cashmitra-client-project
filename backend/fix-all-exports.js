import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function fixExports(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  const original = content;

  // Pattern: export default { func1, func2, ... };
  // We need to convert each function to named export
  const defaultExportMatch = content.match(/export\s+default\s+\{([^}]+)\};?\s*$/m);

  if (defaultExportMatch) {
    const exports = defaultExportMatch[1]
      .split(',')
      .map(e => e.trim())
      .filter(e => e);

    // Find each function and add export keyword
    exports.forEach(exportName => {
      // Match: const funcName = or function funcName
      content = content.replace(
        new RegExp(`^(const|let|var|function)\\s+(${exportName})\\s*=`, 'gm'),
        `export $1 $2 =`
      );
      content = content.replace(
        new RegExp(`^(function)\\s+(${exportName})\\s*\\(`, 'gm'),
        `export $1 $2(`
      );
    });

    // Remove the default export line
    content = content.replace(/export\s+default\s+\{[^}]+\};?\s*$/m, '');
  }

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
    } else if (file.endsWith('.js')) {
      if (fixExports(filePath)) {
        count++;
      }
    }
  });

  return count;
}

const srcDir = path.join(__dirname, 'src');
const count = walkDir(srcDir);
console.log(`\nDone! Fixed ${count} files.`);
