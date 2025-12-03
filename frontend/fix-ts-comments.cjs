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

    // Fix inline // @ts-expect-error comments with TS error codes
    // Replace lines like: "          // @ts-expect-error TS(2322): ..." with "          {/* @ts-expect-error */}"
    content = content.replace(/^(\s*)\/\/\s*@ts-expect-error\s+TS\(\d+\):.*$/gm, '$1{/* @ts-expect-error */}');

    // Also handle @ts-ignore comments
    content = content.replace(/^(\s*)\/\/\s*@ts-ignore\s+TS\(\d+\):.*$/gm, '$1{/* @ts-ignore */}');

    // Fix block comments with TS errors
    content = content.replace(/\/\*\s*@ts-expect-error.*?TS\(\d+\):.*?\*\//g, '/* @ts-expect-error */');
    content = content.replace(/\/\*\s*@ts-ignore.*?TS\(\d+\):.*?\*\//g, '/* @ts-ignore */');

    if (content !== original) {
      fs.writeFileSync(file, content, 'utf-8');
      fixedCount++;
      console.log(`Fixed: ${file}`);
    }
  } catch (error) {
    console.error(`Error processing ${file}:`, error.message);
  }
});

console.log(`\nFixed ${fixedCount} files with problematic comments.`);
