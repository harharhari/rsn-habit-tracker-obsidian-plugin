// SPDX-License-Identifier: GPL-3.0-only
// Maintainer tooling only. This module is never bundled into the Obsidian plugin.
import { execFileSync } from 'node:child_process';
import { appendFileSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { ASSETS, validateLocal, compareManifest, planAssets, verifyDownload } from './release-tools.mjs';
export function runRelease(mode, { root = process.cwd(), repo = process.env.GITHUB_REPOSITORY, tag = process.env.RELEASE_TAG, gh = args => execFileSync('gh', args, { cwd: root, maxBuffer: 16 * 1024 * 1024 }), log = console.log } = {}) {
  if (!['preflight', 'prepare', 'verify-draft', 'audit'].includes(mode)) throw Error('Choose preflight, prepare, verify-draft or audit.');
  if (!/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(repo || '')) throw Error('GITHUB_REPOSITORY must be owner/repository.');
  const { manifest, files } = validateLocal(root, tag);
  const api = path => JSON.parse(gh(['api', `repos/${repo}/${path}`]).toString());
  const checkBranch = () => {
    const current = JSON.parse(gh(['api', `repos/${repo}/contents/manifest.json`, '-H', 'Accept: application/vnd.github.raw+json']).toString());
    compareManifest(manifest, current, 'Current default branch', tag);
    log(`Default branch and tagged source agree: ${tag}.`);
  };
  // Listing avoids treating authentication/permission/network failures as "release absent".
  const getRelease = () => {
    const pages = JSON.parse(gh(['api', `repos/${repo}/releases?per_page=100`, '--paginate', '--slurp']).toString());
    const matches = pages.flat().filter(r => r.tag_name === tag);
    if (matches.length > 1) throw Error(`More than one release has tag ${tag}. Inspect GitHub before continuing.`);
    return matches[0];
  };
  const verify = release => {
    for (const asset of release.assets) {
      if (!Number.isSafeInteger(asset.id) || asset.id <= 0) throw Error('Invalid GitHub release asset ID.');
      const bytes = gh(['api', `repos/${repo}/releases/assets/${asset.id}`, '-H', 'Accept: application/octet-stream']);
      const hash = verifyDownload(asset, bytes, files[asset.name], manifest, tag);
      log(`${asset.name}: asset ID ${asset.id}; SHA256 ${hash}; matches tagged build.`);
    }
  };
  checkBranch();
  let release = getRelease();
  let missing = planAssets(release, tag, mode === 'audit' ? 'audit' : 'draft');
  if (release) verify(release); // Reject conflicting draft assets BEFORE mutation.
  if (mode === 'preflight') {
    log(release ? `Existing draft verified; missing assets: ${missing.join(', ') || 'none'}. Safe to resume.` : `No existing release ${tag}; a new draft can be created.`);
    return;
  }
  if (mode === 'prepare') {
    if (!release) {
      gh(['release', 'create', tag, '--repo', repo, '--verify-tag', '--draft', '--title', `rsn habit calendar one b ${tag}`, '--notes-file', join(root, `docs/RELEASE-NOTES-${tag}.md`)]);
      release = getRelease();
      if (!release) throw Error('Draft creation returned but the draft is not visible. Retry after checking permissions.');
      missing = planAssets(release, tag, 'draft');
      verify(release);
    }
    if (missing.length) gh(['release', 'upload', tag, ...missing.map(n => join(root, 'community-release', n)), '--repo', repo]);
    // No --clobber, no delete, no publishing. Re-runs only add missing files to a matching draft.
    release = getRelease();
  }
  if (!release) throw Error(`Draft ${tag} is missing; run Prepare attested release first.`);
  missing = planAssets(release, tag, mode === 'audit' ? 'audit' : 'draft');
  if (missing.length) throw Error(`Release ${tag} is incomplete: ${missing.join(', ')}. Re-run preparation to upload missing files.`);
  verify(release);
  checkBranch();
  log(`${mode === 'audit' ? 'Published release' : 'Draft'} ${tag}: all ${ASSETS.length} assets verified against this tag's build. ${release.html_url || ''}`);
}
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const lines = [];
  try { runRelease(process.argv[2], { log: text => { console.log(text); lines.push(text); } }); }
  catch (error) { const message = error instanceof Error ? error.message : String(error); console.error(`Release check failed: ${message}`); lines.push(`FAILED: ${message}`); process.exitCode = 1; }
  finally { if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, `\n### Release verification\n\n${lines.map(line => `- ${line}`).join('\n')}\n`); }
}
