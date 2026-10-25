---
name: combine-dependabot-prs
description: Combines all open Dependabot pull requests in the rpdswtk/vsmqtt repo (VS Code MQTT extension) into one branch and one PR, fixes breaking changes from the upgrades, and runs lint, webview build, and the extension test suite. Use this skill whenever the user asks to combine, batch, bundle, consolidate, merge, or clean up Dependabot PRs, dependency updates, or dependency bumps in vsmqtt, even if they don't say "Dependabot".
---

# Combine Dependabot PRs (vsmqtt)

Turn the open Dependabot PRs for `rpdswtk/vsmqtt` into **one** tested PR against `master`. Fix breakage where reasonable; exclude and document what can't be fixed.

## Repo facts this skill relies on

- Default branch: **`master`**.
- **Two separate npm projects**, each with its own `package.json` and `package-lock.json`:
  - root: the VS Code extension (TypeScript, webpack, `ts-loader`, `mqtt`, `mqtt-packet`, `csv-writer`, `moment`, `path-validation`)
  - `webview-ui/`: the webview frontend (read its `package.json` for exact scripts and framework)
- Root scripts that matter:

  | Script | What it does |
  |---|---|
  | `npm run ci:all` | `npm ci` in root **and** `webview-ui` |
  | `npm run lint:all` | root lint (`eslint src` + `tsc --noEmit`) plus webview lint |
  | `npm run build:webview` | builds `webview-ui` |
  | `npm run package` | production webpack build of the extension |
  | `npm run test-compile` | compiles `src/tests` |
  | `npm test` | runs `cmd/runTests.js`; **`pretest`** runs `test-compile`, `build:webview`, `lint`, and starts the test broker via pm2 (`cmd/broker.js`, uses `aedes`); `posttest` stops it |
  | `npm run test:ci` | `lint:all` then `test` (this is the full gate) |
  | `npm run clean` | removes `dist`, `webview-ui/build`, `out`, `*.vsix` |

- UI tests use `vscode-extension-tester`, which downloads and drives a real VS Code. On headless Linux wrap the test command in `xvfb-run -a`.
- `package.json` has `engines.vscode` and `@types/vscode` pinned to the same minimum version (currently `^1.134.0`).
- ESLint uses a flat config (`eslint.config.js`) with Prettier (`.prettierrc`).

Check `.github/dependabot.yml` and `.github/workflows/*.yml` in the checkout. They are the source of truth for which ecosystems/directories Dependabot covers (root npm, `/webview-ui` npm, GitHub Actions) and how CI runs tests. If they disagree with this file, follow them and mention it.

## Ground rules

- Never push to `master`, never force-push, never merge the final PR.
- Never delete or weaken tests, add `.skip`, or loosen ESLint/TypeScript rules just to get green. Update a test only when the upgrade legitimately changed behavior, and say so in the PR.
- Never hand-edit `package-lock.json` files. Regenerate them with npm.
- Do not close the original Dependabot PRs unless the user explicitly asks.
- Do not bump the extension `version` in `package.json`. If `CHANGELOG.md` has an obvious unreleased/dependency section convention, follow it; otherwise leave it alone and mention that in the report.
- Maximum **3 fix attempts per dependency**, then exclude it.
- Stop and report if `gh` isn't authenticated or the working tree is dirty.

## Step 1: Preflight

```bash
gh auth status
git status --porcelain          # must be empty
git fetch origin
git checkout master && git pull --ff-only
```

## Step 2: List open Dependabot PRs

```bash
gh pr list --repo rpdswtk/vsmqtt --state open --author "app/dependabot" --base master \
  --json number,title,headRefName,url,labels,mergeable --limit 100
```

If none, tell the user and stop. For each PR record: number, package, old → new version, **which project it touches** (root, `webview-ui`, or GitHub Actions), and patch/minor/major. Show a short table to the user before continuing.

## Step 3: Baseline on master

```bash
npm run ci:all
xvfb-run -a npm run test:ci     # drop xvfb-run on a machine with a display
npm run stop-broker || true     # make sure the pm2 test broker isn't left running
```

Record what already fails so regressions can be told apart from existing problems. Also run `npm run package` once to confirm the production webpack build works on master.

## Step 4: Create the combined branch

```bash
BRANCH="deps/combined-$(date +%Y-%m-%d)"
git checkout -b "$BRANCH" master
```

## Step 5: Apply updates

Order: GitHub Actions bumps → patch → minor → major. Within a tier, apply related packages together:

- `mqtt` with `mqtt-packet` (keep `mqtt-packet` compatible with the version `mqtt` depends on, check `npm ls mqtt-packet` for duplicates)
- `typescript` with `ts-loader`, `@typescript-eslint/*`, and `webpack`/`webpack-cli`
- `eslint` with `eslint-config-prettier`, `eslint-plugin-prettier`, `@eslint/eslintrc`, and `@typescript-eslint/*`
- `@types/vscode` with `engines.vscode` (see below)

For each PR:

```bash
git fetch origin "pull/<N>/head:dependabot-pr-<N>"
git merge --no-ff --no-edit "dependabot-pr-<N>"
```

**Conflicts**
- `package-lock.json` (root or `webview-ui/`): take the current branch's side, make sure the `package.json` changes from both PRs are present, then run `npm install` in that directory to regenerate the lockfile.
- `package.json`: resolve so both version bumps are kept.
- `.github/workflows/*`: keep both changes.
- Anything else you can't resolve confidently: `git merge --abort`, mark the PR **excluded: conflict**, continue.

If two PRs bump the same package, keep the higher version and list the other as superseded.

After all merges, run `npm install` in both root and `webview-ui/` once to normalize the lockfiles, and commit them if they changed.

## Step 6: Verify

```bash
npm run clean
npm run ci:all
xvfb-run -a npm run test:ci
npm run stop-broker || true
npm run package
```

`posttest` does **not** run when tests fail, so always run `npm run stop-broker || true` after a failed run, or the next run will hit a port/pm2 conflict.

If all green, go to Step 8.

## Step 7: Fix breaking changes

Find which update caused the failure **before** fixing. Use the failing command to locate the area:

| Failing piece | Likely culprits |
|---|---|
| `tsc` / `test-compile` errors | `typescript`, `@types/node`, `@types/vscode`, `@types/ws`, `@types/mocha`, `@types/chai`, `mqtt` types |
| `eslint` errors or config load failure | `eslint`, `@typescript-eslint/*`, `eslint-config-prettier`, `eslint-plugin-prettier`, `@eslint/eslintrc`, `prettier` (formatting rule changes). Note the root lint script passes `--ext ts`; if a new ESLint major rejects it, fix the script and keep flat-config behavior. |
| webpack / `npm run package` | `webpack`, `webpack-cli`, `ts-loader`, `typescript` |
| `build:webview` / webview lint | anything in `webview-ui/package.json` (read it and its changelogs) |
| MQTT connect/publish/subscribe test failures | `mqtt`, `mqtt-packet`, `aedes` (test broker), `ws` |
| UI test harness won't launch or can't find elements | `vscode-extension-tester`, `mocha`, `chai`, VS Code engine version |
| broker start/stop issues | `pm2` |
| CSV export tests | `csv-writer` |

Bisect when unclear: start from master, apply updates one tier at a time (or by halves) and re-run only the failing command.

Then:
1. Read the Dependabot PR body for release notes and breaking changes: `gh pr view <N> --repo rpdswtk/vsmqtt --json body -q .body`, and the package's migration guide if linked.
2. Fix the code or config, minimally (renamed APIs, changed `tsconfig` options, new ESLint config shape, webpack options, Prettier formatting via `npx prettier --write` only on files the new version actually reformats).
3. Commit each fix separately: `fix: adapt to <package> v<new>`.
4. Re-run the failing command, then the full Step 6.

**`@types/vscode` rule:** it must not be newer than `engines.vscode`. If Dependabot bumps `@types/vscode` alone, either bump `engines.vscode` to match (only if the user is OK raising the minimum supported VS Code version, so flag it clearly in the PR) or exclude that PR. Never leave them mismatched; `vsce` packaging fails on it.

After 3 failed attempts, or if the fix needs a large refactor or a product decision, run `git revert -m 1 <merge-commit>` for that PR, mark it **excluded: needs manual migration** with a short explanation, and re-run Step 6 on the remaining set.

Call out in the PR even when tests pass: major bumps of `typescript`, `eslint`, `webpack`, `mqtt`, `vscode-extension-tester`, `@types/node` (should stay compatible with the Node version bundled in the targeted VS Code/Electron), and anything that changes the shipped bundle in `dist/`.

## Step 8: Open the PR

```bash
git push -u origin "$BRANCH"
gh pr create --repo rpdswtk/vsmqtt --base master --head "$BRANCH" \
  --title "chore(deps): combined dependency updates ($(date +%Y-%m-%d))" \
  --body-file /tmp/combined-pr-body.md
```

Body template:

```markdown
## Summary
Combines N open Dependabot PRs. X included, Y excluded.

## Included updates
| PR | Package | Project | From → To | Type |
|----|---------|---------|-----------|------|
| #… | … | root / webview-ui / actions | … | patch/minor/major |

## Code changes required
- `<package>` vX: what changed and why (<commit>), or "None".

## Excluded updates
| PR | Package | Reason |
|----|---------|--------|

## Verification
| Check | master | This branch |
|-------|--------|-------------|
| `npm run ci:all` | | |
| `npm run lint:all` | | |
| `npm run build:webview` | | |
| `npm run package` | | |
| `npm test` (UI + broker tests) | | |

Pre-existing failures on master: <list or "none">

## Reviewer notes
- Major bumps to look at closely: …
- `@types/vscode` / `engines.vscode` status: …
- Original Dependabot PRs are left open; they should close automatically once these versions land on master.
```

## Step 9: Report to the user

Give the PR link, what was included and excluded (with reasons), what code changed, and the test results. Offer to close the superseded Dependabot PRs with a comment linking the combined PR, but only do it if the user agrees.