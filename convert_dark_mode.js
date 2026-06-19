const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'src', 'app');

// Simple regex based class replacement. We use boundary matches to avoid partial replacements.
const replacements = [
  { from: /\bbg-slate-950\b/g, to: 'bg-slate-50 dark:bg-slate-950' },
  { from: /\bbg-slate-900\b/g, to: 'bg-slate-100 dark:bg-slate-900' },
  { from: /\bbg-slate-800\b/g, to: 'bg-slate-200 dark:bg-slate-800' },
  
  { from: /\btext-white\b/g, to: 'text-slate-900 dark:text-white' },
  { from: /\btext-slate-200\b/g, to: 'text-slate-800 dark:text-slate-200' },
  { from: /\btext-slate-300\b/g, to: 'text-slate-700 dark:text-slate-300' },
  { from: /\btext-slate-400\b/g, to: 'text-slate-600 dark:text-slate-400' },
  { from: /\btext-slate-500\b/g, to: 'text-slate-500 dark:text-slate-500' },
  
  { from: /\bborder-white\/10\b/g, to: 'border-slate-300 dark:border-white/10' },
  { from: /\bborder-white\/5\b/g, to: 'border-slate-200 dark:border-white/5' },
  { from: /\bborder-slate-900\b/g, to: 'border-slate-200 dark:border-slate-900' },
  { from: /\bborder-slate-800\b/g, to: 'border-slate-300 dark:border-slate-800' },
  
  { from: /\bbg-white\/5\b/g, to: 'bg-slate-900/5 dark:bg-white/5' },
  { from: /\bbg-white\/10\b/g, to: 'bg-slate-900/10 dark:bg-white/10' },
  
  { from: /\bbg-slate-950\/80\b/g, to: 'bg-white/80 dark:bg-slate-950/80' },
  { from: /\bbg-slate-950\/50\b/g, to: 'bg-white/50 dark:bg-slate-950/50' },
  { from: /\bbg-slate-900\/40\b/g, to: 'bg-slate-50/40 dark:bg-slate-900/40' },
  { from: /\bbg-slate-900\/50\b/g, to: 'bg-slate-50/50 dark:bg-slate-900/50' },
  { from: /\bbg-slate-900\/60\b/g, to: 'bg-slate-50/60 dark:bg-slate-900/60' },
  { from: /\bbg-slate-900\/80\b/g, to: 'bg-slate-50/80 dark:bg-slate-900/80' },
  { from: /\bbg-slate-900\/95\b/g, to: 'bg-slate-50/95 dark:bg-slate-900/95' },
  { from: /bg-\[#050508\]/g, to: 'bg-slate-50 dark:bg-[#050508]' },
  { from: /\btext-slate-100\b/g, to: 'text-slate-800 dark:text-slate-100' },
  { from: /bg-\[#08080c\]/g, to: 'bg-white dark:bg-[#08080c]' },
  { from: /bg-\[#0c0d14\]/g, to: 'bg-slate-100 dark:bg-[#0c0d14]' },
  { from: /bg-\[#060608\]/g, to: 'bg-white dark:bg-[#060608]' },
  { from: /bg-\[#0b0c14\]/g, to: 'bg-slate-50 dark:bg-[#0b0c14]' },
  { from: /bg-\[#121422\]/g, to: 'bg-slate-100 dark:bg-[#121422]' },
  { from: /bg-\[#0d0f14\]/g, to: 'bg-slate-100 dark:bg-[#0d0f14]' },
  { from: /hover:bg-\[#141822\]/g, to: 'hover:bg-slate-200 dark:hover:bg-[#141822]' },
  { from: /bg-\[#08080c\]\/30/g, to: 'bg-slate-100/30 dark:bg-[#08080c]/30' }
];

function processDir(directory) {
  const files = fs.readdirSync(directory);
  for (const file of files) {
    const fullPath = path.join(directory, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.html') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let originalContent = content;
      
      // Don't replace if it already has dark: equivalent to avoid double replacing
      // We will do a clean pass
      
      // Specifically for text-white inside buttons, let's try to protect them
      // If we have a button with bg-blue-X, it should keep text-white
      
      for (const rep of replacements) {
        // Simple replace, but we must ignore if preceded by dark:
        // Since JS regex doesn't support variable length lookbehinds easily in all versions,
        // we can just replace and then clean up dark:dark:
        content = content.replace(rep.from, (match, offset, string) => {
          // If preceded by 'dark:', skip
          if (string.substring(offset - 5, offset) === 'dark:') {
            return match;
          }
          // If inside a button with bg-blue- or from-blue-, we MIGHT want to keep text-white,
          // but a simpler fix is to just let it replace, and we manually fix the main button
          // or we just replace.
          return rep.to;
        });
      }

      if (content !== originalContent) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated ${fullPath}`);
      }
    }
  }
}

processDir(dir);
console.log('Done!');
