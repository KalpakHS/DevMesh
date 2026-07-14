const fs = require('fs');
const path = require('path');

const directory = './';

function scan(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      if (file !== 'node_modules' && file !== '.git') {
        scan(fullPath);
      }
    } else {
      if (file.endsWith('.js')) {
        const content = fs.readFileSync(fullPath, 'utf8');
        if (content.includes("role: 'Developer'") || content.includes('role: "Developer"') || content.includes("'Developer'") || content.includes('"Developer"')) {
          console.log(`Found developer string in: ${fullPath}`);
        }
      }
    }
  }
}

console.log('Scanning backend...');
scan(directory);
