const fs = require('fs');
const path = require('path');

// Read the SellConfigurationManagement.js file
const filePath = 'src/pages/admin/SellConfigurationManagement.js';
const fileContent = fs.readFileSync(filePath, 'utf8');

// Extract the import statement from lucide-react
const importMatch = fileContent.match(/import\s+React[^}]+\{\s*([\s\S]*?)\s*\}\s+from\s+['"]lucide-react['"];/);

if (!importMatch) {
  console.log('Could not find lucide-react import statement');
  process.exit(1);
}

const importContent = importMatch[1];

// Parse all imported icons (including aliases)
const importedIcons = [];
const iconMatches = importContent.match(/(\w+)(?:\s+as\s+(\w+))?/g);

if (iconMatches) {
  iconMatches.forEach(match => {
    const parts = match.trim().split(/\s+as\s+/);
    const originalName = parts[0];
    const aliasName = parts[1] || originalName;
    
    importedIcons.push({
      original: originalName,
      alias: aliasName,
      fullMatch: match.trim()
    });
  });
}

console.log(`Found ${importedIcons.length} imported icons`);

// Get the content after the import statement to search for usage
const importEndIndex = fileContent.indexOf(importMatch[0]) + importMatch[0].length;
const codeContent = fileContent.substring(importEndIndex);

// Find which icons are actually used in the code
const usedIcons = [];
const unusedIcons = [];

importedIcons.forEach(icon => {
  // Check if the icon (alias name) is used in the code
  const iconRegex = new RegExp(`\\b${icon.alias}\\b`, 'g');
  const matches = codeContent.match(iconRegex);
  
  if (matches && matches.length > 0) {
    usedIcons.push({
      ...icon,
      usageCount: matches.length
    });
  } else {
    unusedIcons.push(icon);
  }
});

console.log(`\nUsed icons (${usedIcons.length}):`);
usedIcons.forEach(icon => {
  console.log(`  ${icon.alias} (${icon.usageCount} times)${icon.original !== icon.alias ? ` - imported as ${icon.original}` : ''}`);
});

console.log(`\nUnused icons (${unusedIcons.length}):`);
unusedIcons.forEach(icon => {
  console.log(`  ${icon.fullMatch}`);
});

// Generate the new import statement with only used icons
const usedImports = usedIcons.map(icon => icon.fullMatch).sort();
const newImportStatement = `import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import {
  theme } from '../../theme';
import {
  ${usedImports.join(',\n  ')}
} from 'lucide-react';`;

console.log(`\nNew import statement would have ${usedIcons.length} icons instead of ${importedIcons.length}`);
console.log(`This removes ${unusedIcons.length} unused icons`);

// Write the analysis results to a file
const analysisResult = {
  totalImported: importedIcons.length,
  totalUsed: usedIcons.length,
  totalUnused: unusedIcons.length,
  usedIcons: usedIcons,
  unusedIcons: unusedIcons,
  newImportStatement: newImportStatement
};

fs.writeFileSync('icon_analysis_result.json', JSON.stringify(analysisResult, null, 2));
console.log('\nAnalysis results saved to icon_analysis_result.json');