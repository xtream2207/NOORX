// Simple key-value settings store (per-JID toggles: autoread, antilink, etc.)
const fs   = require('fs');
const path = require('path');
const FILE = path.join(__dirname, '../../data/settings.json');

function load() {
  try { return fs.existsSync(FILE) ? JSON.parse(fs.readFileSync(FILE,'utf8')) : {}; }
  catch(_){ return {}; }
}
function save(d) {
  try { fs.writeFileSync(FILE, JSON.stringify(d, null, 2)); } catch(_){}
}
const get    = (k, def=false) => load()[k] ?? def;
const set    = (k, v) => { const d=load(); d[k]=v; save(d); return v; };
const toggle = (k) => set(k, !get(k));

module.exports = { get, set, toggle };
