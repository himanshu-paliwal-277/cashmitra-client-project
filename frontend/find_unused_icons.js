const fs = require('fs');

// Read the file
const filePath = 'src/pages/admin/SellConfigurationManagement.js';
const content = fs.readFileSync(filePath, 'utf8');

// Find the lucide-react import section
const importStart = content.indexOf('import {');
const importEnd = content.indexOf("} from 'lucide-react';");

if (importStart === -1 || importEnd === -1) {
  console.log('Could not find lucide-react import');
  process.exit(1);
}

// Extract import content
const importSection = content.substring(importStart + 8, importEnd);
const codeAfterImport = content.substring(importEnd + 22);

// Parse imported icons
const icons = [];
const lines = importSection.split('\n');

lines.forEach(line => {
  const trimmed = line.trim().replace(/,$/, '');
  if (trimmed && !trimmed.startsWith('//') && trimmed !== 'theme }' && trimmed !== 'theme') {
    if (trimmed.includes(' as ')) {
      const [original, alias] = trimmed.split(' as ');
      icons.push({ name: alias.trim(), original: original.trim() });
    } else if (/^[A-Z]/.test(trimmed)) {
      icons.push({ name: trimmed, original: trimmed });
    }
  }
});

console.log(`Found ${icons.length} imported icons`);

// Check usage
const used = [];
const unused = [];

icons.forEach(icon => {
  const regex = new RegExp(`\\b${icon.name}\\b`, 'g');
  const matches = codeAfterImport.match(regex);
  
  if (matches && matches.length > 0) {
    used.push({ ...icon, count: matches.length });
  } else {
    unused.push(icon);
  }
});

console.log(`Used: ${used.length}, Unused: ${unused.length}`);

// Create new import with only used icons
const usedImports = used.map(icon => {
  return icon.original === icon.name ? icon.name : `${icon.original} as ${icon.name}`;
}).sort();

const newImport = `import {
  ${usedImports.join(',\n  ')}
} from 'lucide-react';`;

console.log('\nUsed icons:');
used.forEach(icon => console.log(`  ${icon.name} (${icon.count}x)`));

console.log('\nSample unused icons:');
unused.slice(0, 10).forEach(icon => console.log(`  ${icon.name}`));

// Save the new import
fs.writeFileSync('new_import.txt', newImport);
console.log(`\nNew import saved to new_import.txt`);
console.log(`Removed ${unused.length} unused icons!`);