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

    // Remove standalone // @ts-expect-error lines (on their own line)
    content = content.replace(/^\s*\/\/\s*@ts-expect-error\s*\n/gm, '');

    // Remove standalone // @ts-ignore lines (on their own line)
    content = content.replace(/^\s*\/\/\s*@ts-ignore\s*\n/gm, '');

    if (content !== original) {
      fs.writeFileSync(file, content, 'utf-8');
      fixedCount++;
      console.log(`Fixed: ${file}`);
    }
  } catch (error) {
    console.error(`Error processing ${file}:`, error.message);
  }
});

console.log(`\nRemoved unused @ts-expect-error/@ts-ignore from ${fixedCount} files.`);
