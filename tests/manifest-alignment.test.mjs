import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,mkdtempSync,writeFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {spawnSync} from 'node:child_process';
const manifest=JSON.parse(readFileSync('manifest.json','utf8'));
function check(branch,asset,tag=manifest.version){
 const dir=mkdtempSync(join(tmpdir(),'habit-manifest-'));
 try {const a=join(dir,'default.json'),b=join(dir,'release.json');writeFileSync(a,JSON.stringify(branch));writeFileSync(b,JSON.stringify(asset));return spawnSync(process.execPath,['scripts/check-manifest-alignment.mjs',a,b,tag],{encoding:'utf8'});} finally {rmSync(dir,{recursive:true,force:true});}
}
test('matching default, tag and downloaded manifest pass',()=>assert.equal(check(manifest,manifest).status,0));
test('stale default-branch version fails',()=>assert.notEqual(check({...manifest,version:'1.0.0'},manifest).status,0));
test('stale release attachment fails',()=>assert.notEqual(check(manifest,{...manifest,version:'1.0.0'}).status,0));
test('non-version metadata mismatch fails',()=>assert.notEqual(check(manifest,{...manifest,name:'Other name'}).status,0));
test('wrong release tag fails',()=>assert.notEqual(check(manifest,manifest,'v'+manifest.version).status,0));
