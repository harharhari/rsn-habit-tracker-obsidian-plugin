// SPDX-License-Identifier: GPL-3.0-only
import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { ASSETS, sha256, validateLocal, planAssets } from '../scripts/release-tools.mjs';
import { runRelease } from '../scripts/remote-release.mjs';
const tag = '1.1.10';
const manifest = { id: 'rsn-habit-calendar-one-b', version: tag, name: 'rsn habit calendar one b' };
const files = { 'main.js': Buffer.from('portable bundle'), 'manifest.json': Buffer.from(JSON.stringify(manifest)), 'styles.css': Buffer.from('.hc-root {color:inherit;}') };
function fixture(fn) {
  const root = mkdtempSync(join(tmpdir(), 'habit-release-'));
  try { mkdirSync(join(root, 'community-release')); for (const name of ASSETS) {writeFileSync(join(root, name), files[name]);writeFileSync(join(root, 'community-release', name), files[name]);} fn(root); }
  finally { rmSync(root, {recursive:true,force:true}); }
}
function backend(initial, options = {}) {
  let release = initial === null ? undefined : {tag_name: tag, draft: true, assets: [], ...initial};
  const payload = new Map(), calls = [];
  let nextId = 1;
  const add = (name, bytes = files[name]) => { const id = nextId++; payload.set(id, bytes); release.assets.push({id,name,state:'uploaded',digest:`sha256:${sha256(bytes)}`}); };
  if (release) for (const n of options.existing || ASSETS) add(n, options.stale === n ? Buffer.from(n === 'manifest.json' ? JSON.stringify({...manifest,version:'1.1.7'}) : 'old bytes') : files[n]);
  const gh = args => {
    calls.push(args);
    if (args[0] === 'api') {
      if (args[1].endsWith('contents/manifest.json')) return Buffer.from(JSON.stringify(options.branch || manifest));
      if (args[1].includes('releases?')) { if (options.apiFailure) throw Error('HTTP 403: token cannot read releases'); return Buffer.from(JSON.stringify([release ? [release] : []])); }
      const id = Number(args[1].split('/').at(-1));return payload.get(id);
    }
    if (args[1] === 'create') { release = {tag_name:tag,draft:true,assets:[]}; return Buffer.from('created'); }
    if (args[1] === 'upload') { for (const p of args.slice(3,args.indexOf('--repo'))) add(p.split(/[\\/]/).at(-1));return Buffer.from('uploaded'); }
    throw Error(`Unexpected gh call: ${args}`);
  };
  return {gh,calls,get release(){return release;}};
}
function run(root, b, mode) {runRelease(mode,{root,repo:'owner/repo',tag,gh:b.gh,log:()=>{}});}
const writes = b => b.calls.filter(a => a[0] === 'release');
test('fresh draft created and all three attachments downloaded and verified',()=>fixture(root=>{const b=backend(null);run(root,b,'prepare');assert.equal(b.release.assets.length,3);assert.equal(writes(b).length,2);assert.ok(b.calls.some(a=>a[1].includes('releases/assets/')));}));
test('matching complete draft rerun makes no release mutations',()=>fixture(root=>{const b=backend({});run(root,b,'prepare');assert.equal(writes(b).length,0);}));
test('partial matching draft resumes only missing uploads',()=>fixture(root=>{const b=backend({}, {existing:['manifest.json']});run(root,b,'prepare');assert.equal(writes(b).length,1);assert.ok(!writes(b)[0].some(a=>a.endsWith('/manifest.json')));assert.ok(!writes(b)[0].includes('--clobber'));}));
test('stale 1.1.7 attachment is rejected without modifying draft',()=>fixture(root=>{const b=backend({}, {stale:'manifest.json'});assert.throws(()=>run(root,b,'prepare'),/expected version 1.1.10, received 1.1.7/);assert.equal(writes(b).length,0);}));
test('stale stylesheet is rejected even when manifest matches',()=>fixture(root=>{const b=backend({}, {stale:'styles.css'});assert.throws(()=>run(root,b,'prepare'),/styles.css: downloaded SHA256/);assert.equal(writes(b).length,0);}));
test('stale bundle is rejected',()=>fixture(root=>{const b=backend({draft:false},{stale:'main.js'});assert.throws(()=>run(root,b,'audit'),/main.js: downloaded SHA256/);}));
test('published release cannot be modified by preparation',()=>fixture(root=>{const b=backend({draft:false});assert.throws(()=>run(root,b,'prepare'),/already published/);assert.equal(writes(b).length,0);}));
test('published matching release passes read-only audit',()=>fixture(root=>{const b=backend({draft:false});run(root,b,'audit');assert.equal(writes(b).length,0);}));
test('audit distinguishes an unpublished draft',()=>fixture(root=>{const b=backend({});assert.throws(()=>run(root,b,'audit'),/still a draft/);}));
test('audit distinguishes missing release',()=>fixture(root=>{const b=backend(null);assert.throws(()=>run(root,b,'audit'),/does not exist/);}));
test('default branch mismatch prevents release creation',()=>fixture(root=>{const b=backend(null,{branch:{...manifest,version:'1.1.9'}});assert.throws(()=>run(root,b,'prepare'),/Current default branch/);assert.equal(writes(b).length,0);}));
test('API permission failure is not mistaken for absent release',()=>fixture(root=>{const b=backend(null,{apiFailure:true});assert.throws(()=>run(root,b,'prepare'),/403/);assert.equal(writes(b).length,0);}));
test('preflight with no release never creates a draft',()=>fixture(root=>{const b=backend(null);run(root,b,'preflight');assert.equal(writes(b).length,0);}));
test('local stale staging is rejected before remote access',()=>fixture(root=>{writeFileSync(join(root,'community-release/manifest.json'),JSON.stringify({...manifest,version:'1.1.7'}));assert.throws(()=>validateLocal(root,tag),/Staged manifest.json/);}));
test('unexpected and duplicate release files are rejected',()=>{const r={tag_name:tag,draft:true,assets:[{name:'SHA256SUMS'}]};assert.throws(()=>planAssets(r,tag,'draft'),/only/);r.assets=[{name:'main.js'},{name:'main.js'}];assert.throws(()=>planAssets(r,tag,'draft'),/unique/);});
test('incomplete published release fails audit',()=>fixture(root=>{const b=backend({draft:false},{existing:['manifest.json']});assert.throws(()=>run(root,b,'audit'),/missing/);}));
