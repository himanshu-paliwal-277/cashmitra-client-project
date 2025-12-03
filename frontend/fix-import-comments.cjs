const fs = require('fs');
const { execSync } = require('child_process');

// Get all .ts and .tsx files
const files = execSync('find ./src -name "*.ts" -o -name "*.tsx"', { encoding: 'utf-8' })
  .trim()
  .split('\n')
  .filter(Boolean);

console.log(`Processing ${files.length} files...`);

let fixedCount = 0;

files.forEach(file => {
  try {
    let content = fs.readFileSync(file, 'utf-8');
    const original = content;

    // Fix JSX-style comments that are at the start of a line (not inside JSX)
    // These are in import sections or at top level and should be // comments
    content = content.replace(/^(\s*){\/\* @ts-expect-error \*\/}$/gm, '$1// @ts-expect-error');
    content = content.replace(/^(\s*){\/\* @ts-ignore \*\/}$/gm, '$1// @ts-ignore');

    if (content !== original) {
      fs.writeFileSync(file, content, 'utf-8');
      fixedCount++;
      console.log(`Fixed: ${file}`);
    }
  } catch (error) {
    console.error(`Error processing ${file}:`, error.message);
  }
});

console.log(`\nFixed ${fixedCount} files with import comment issues.`);
