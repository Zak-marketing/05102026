import fs from 'fs';
import path from 'path';

// Read all English and French reference dictionaries
const enKeys = JSON.parse(fs.readFileSync('scripts/all-en-keys.json', 'utf8'));

console.log("Total reference keys in English:", Object.keys(enKeys).length);
