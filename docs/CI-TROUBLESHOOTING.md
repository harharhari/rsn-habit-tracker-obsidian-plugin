# Repair the GitHub Build and review failure — 1.1.4

All three reported jobs stop while downloading the same unavailable which-typed-array 1.1.34 archive. The root package-lock.json is the shared cause. Windows EPERM messages occur during cleanup after installation failure; the supplied log does not establish a separate runtime permission problem. The ESLint deprecation is a warning, not the failing exit condition. This release keeps the compatible lint major; a separate major upgrade needs its own review.

## Upload and verify the fix

1. Extract upload-to-github-004.zip. Copy the CONTENTS of repository/ to the GitHub repository root, preserving hidden .github and directory structure. Do not upload the outer ZIP as the only source file.
2. In GitHub Code, open the ROOT package-lock.json. Search node_modules/which-typed-array. Its version must be 1.1.24 and resolved URL must end which-typed-array-1.1.24.tgz. The lockfile root, package.json and manifest.json must say 1.1.4. The preflight script deliberately retains the string 1.1.34 as a rejected value; that is expected.
3. Commit all supplied source changes together. The new workflow also needs scripts/check-lockfile.mjs and tests/build-metadata.test.mjs. For Git commands see GITHUB-AND-COMMUNITY-RELEASE.md.
4. Open Actions → Build and review → the run for the NEW commit. Rerunning an old failed run tests its old commit, not your repaired source. Alternatively Run workflow on the updated branch.
5. Open each Ubuntu, Windows and macOS job. The preflight prints commit, platform, Node version, lockfile SHA-256 and dependency URL before npm ci. Confirm the commit matches your upload.
6. Wait for installation, lint, build, JavaScript tests, Python tests and packaging to pass. Compare release SHA256SUMS across all three artifacts. CI performs no automatic release or submission.
7. Download the generated files and compare them with release-assets/. Publish only after the tested commit and actual device checks meet your acceptance criteria.

## Equivalent local checks

Install Node.js 22+ with npm and Python 3.9+ (CI uses Python 3.12). In a clean source checkout:

```text
node scripts/check-lockfile.mjs
npm ci --ignore-scripts --registry=https://registry.npmjs.org
npm run check
npm run test:helper
```

The helper test command invokes python. If your Ubuntu system offers only python3, run python3 -m unittest discover -s tests -p 'test_*.py' -v instead. On Windows run python -m pip install tzdata for the optional timezone-aware Python helper tests; CI includes this step. Python and npm are not needed to install or use the plugin in Obsidian.

If 1.1.34 is still fetched, inspect the job commit and root lockfile first. Do not remove npm integrity hashes, disable TLS, or edit only a URL. A future dependency refresh should regenerate the lock with npm against the public registry, review the diff and verify installation from a fresh cache. Deleting the lockfile and leaving it absent is not a fix for npm ci.

A recurring Windows EPERM after the 404 is fixed needs a new full log. On a local Windows checkout close programs locking node_modules and reinstall in a clean checkout. Do not change vault permissions for this build error.

## Test boundaries

The local validation record is VALIDATION.md. Native Windows/macOS runners must execute on GitHub after upload; this Linux environment cannot certify their results. All-platform Obsidian UI and real sync tests remain in PLATFORM-TESTING.md. A green CI build is not Community directory approval.

The workflow uses the current v7 examples from the official [checkout](https://github.com/actions/checkout), [setup-node](https://github.com/actions/setup-node), [setup-python](https://github.com/actions/setup-python) and [upload-artifact](https://github.com/actions/upload-artifact) documentation, checked 24 October 2026. Hosted runner execution is still required. Automatic npm caching is disabled for these diagnostic runs.
