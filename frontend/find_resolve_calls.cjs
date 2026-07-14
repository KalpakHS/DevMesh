const fs = require('fs');
const path = require('path');

const walk = (dir) => {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const fPath = path.join(dir, file);
    const stat = fs.statSync(fPath);
    if (stat && stat.isDirectory()) {
      if (file !== 'node_modules' && file !== '.git') {
        results = results.concat(walk(fPath));
      }
    } else {
      if (file.endsWith('.jsx') || file.endsWith('.js')) {
        results.push(fPath);
      }
    }
  });
  return results;
};

const files = walk('src');
files.forEach(f => {
  const content = fs.readFileSync(f, 'utf8');
  if (content.includes('resolve') || content.includes('applications/')) {
    console.log(`Matched: ${f}`);
    const lines = content.split('\n');
    lines.forEach((l, idx) => {
      if (l.includes('resolve') || l.includes('applications/')) {
        console.log(`  Line ${idx + 1}: ${l.trim()}`);
      }
    });
  }
});
