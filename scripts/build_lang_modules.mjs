import fs from 'fs';
import path from 'path';

const keys314 = JSON.parse(fs.readFileSync('scripts/314-keys.json', 'utf8'));
const allEnKeys = JSON.parse(fs.readFileSync('scripts/all-en-keys.json', 'utf8'));

console.log("Read 314 missing keys and allEnKeys:", Object.keys(allEnKeys).length);
