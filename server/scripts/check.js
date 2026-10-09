import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

function checkDirectory(directory) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) checkDirectory(path);
    else if (entry.name.endsWith('.js')) {
      const result = spawnSync(process.execPath, ['--check', path], { stdio: 'inherit' });
      if (result.error || result.status !== 0) process.exit(1);
    }
  }
}

for (const directory of ['src', 'test', 'scripts']) checkDirectory(directory);
JSON.parse(readFileSync('postman/applications.postman_collection.json', 'utf8'));
const lock = JSON.parse(readFileSync('package-lock.json', 'utf8'));
console.log(`Node.js ${process.version}`);
for (const name of ['express', 'mongoose', 'mongodb', 'bson', 'dotenv', 'cors']) {
  console.log(`${name}: ${lock.packages[`node_modules/${name}`]?.version || 'not installed'}`);
}
console.log('JavaScript syntax and Postman collection JSON checks passed.');
