import fs from 'fs';
import path from 'path';

// Load our reference dictionaries
const enKeys = JSON.parse(fs.readFileSync('scripts/all-en-keys.json', 'utf8'));

console.log("Building modular translations...");
