// SPDX-License-Identifier: GPL-3.0-only
import { createHash } from 'node:crypto';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
export const ASSETS = ['main.js', 'manifest.json', 'styles.css'];
export const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');
export function validateTag(tag) {
  if (!/^\d+\.\d+\.\d+$/.test(tag || '')) throw Error('Use an exact x.y.z tag without v, for example 1.1.10.');
}
export function compareManifest(expected, actual, label, tag) {
  validateTag(tag);
  if (actual.version !== tag) throw Error(`${label}: expected version ${tag}, received ${String(actual.version)}. Rebuild/upload the files from the matching tag; do not rename an old release to update its contents.`);
  const keys = [...new Set([...Object.keys(expected), ...Object.keys(actual)])].sort();
  for (const key of keys) {
    if (JSON.stringify(actual[key]) !== JSON.stringify(expected[key])) throw Error(`${label}: manifest field ${key} differs from the tagged source.`);
  }
}
export function validateLocal(root, tag) {
  validateTag(tag);
  const manifest = JSON.parse(readFileSync(join(root, 'manifest.json'), 'utf8'));
  compareManifest(manifest, manifest, 'Tagged source', tag);
  const names = readdirSync(join(root, 'community-release')).sort();
  if (JSON.stringify(names) !== JSON.stringify([...ASSETS].sort())) throw Error('community-release must contain exactly main.js, manifest.json and styles.css.');
  const files = {};
  for (const name of ASSETS) {
    files[name] = readFileSync(join(root, 'community-release', name));
    if (!files[name].equals(readFileSync(join(root, name)))) throw Error(`Staged ${name} differs from the local source/build. Run npm run check from the matching tag.`);
  }
  compareManifest(manifest, JSON.parse(files['manifest.json']), 'Staged manifest', tag);
  return { manifest, files };
}
export function planAssets(release, tag, mode) {
  if (!release) {
    if (mode === 'audit') throw Error(`Release ${tag} does not exist or is not visible to this token. Publish its tested draft before auditing.`);
    return ASSETS;
  }
  if (release.tag_name !== tag) throw Error('GitHub returned a different release tag.');
  if (mode === 'audit' && release.draft) throw Error(`Release ${tag} is still a draft. Publish it after testing, then audit.`);
  if (mode !== 'audit' && !release.draft) throw Error(`Release ${tag} is already published. No files were changed. Run Audit published manifest; for corrections use a new version/tag.`);
  const names = release.assets.map(a => a.name);
  if (new Set(names).size !== names.length || names.some(n => !ASSETS.includes(n))) throw Error('Release assets must have unique names and contain only main.js, manifest.json and styles.css. Inspect the release; no files were removed.');
  const missing = ASSETS.filter(n => !names.includes(n));
  if (mode === 'audit' && missing.length) throw Error(`Release ${tag} is missing: ${missing.join(', ')}.`);
  return missing;
}
export function verifyDownload(asset, bytes, expected, manifest, tag) {
  if (asset.state !== 'uploaded') throw Error(`${asset.name}: asset is not fully uploaded.`);
  if (asset.name === 'manifest.json') compareManifest(manifest, JSON.parse(bytes.toString('utf8')), 'Downloaded release manifest', tag);
  const actualHash = sha256(bytes), expectedHash = sha256(expected);
  if (actualHash !== expectedHash) throw Error(`${asset.name}: downloaded SHA256 ${actualHash} differs from tagged build ${expectedHash}. No asset was overwritten. Check for files copied from an older release.`);
  if (asset.digest && asset.digest !== `sha256:${actualHash}`) throw Error(`${asset.name}: GitHub asset digest disagrees with downloaded content.`);
  return actualHash;
}
