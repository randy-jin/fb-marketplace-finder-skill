# Facebook Marketplace Finder

A standalone skill for any agent with browser automation. Search Marketplace, compare used items, and return a ranked shortlist with caveats. Optional watch instructions cover reruns when your agent supports scheduling. No dependency on another skill or a particular agent vendor.

## Safety — read first

**Read only:** never message sellers, make offers, save/share/report listings, or buy. Use **low volume**: a few searches per run, pauses of at least 2 seconds between navigations, and a small shortlist; avoid bulk scraping. **Stop at captchas, checkpoints, login/2FA, or payment prompts.** Never bypass access controls.

A secondary account is suggested to reduce exposure of your main account, subject to Facebook's account rules. It does not eliminate risk. Automated access may violate Facebook's Terms of Service and lead to account restrictions; use at your own risk. Pauses are not a guarantee of safety.

## Requirements

- An agent that can read Markdown instructions and use a **browser automation tool**, for example [Playwright MCP](https://github.com/microsoft/playwright-mcp).
- A **signed-in personal Facebook session in that tool's browser**, with Marketplace available. Sign in yourself before the run; never paste passwords, cookies, or 2FA codes into agent prompts. A session in another browser/profile does not automatically transfer.
- HTML reading / Playwright code execution for the optional parser. Agents with only visual browser tools can read rendered cards and mark missing fields unknown. Node.js is optional for local parser use; no npm dependencies are required by the helper.

Installing this skill does not install a browser tool, create a session, or provide a scheduler.

## Install

Clone or download this repository first. Run these commands from its root to stage a portable skill folder (requires `sed`; use a fresh staging directory when updating):

```bash
mkdir -p /tmp/marketplace-finder-package/marketplace-finder
sed -e 's|\.\./docs/|docs/|g' -e 's|\.\./scripts/|scripts/|g' -e 's|\.\./examples/|examples/|g' marketplace-finder/SKILL.md > /tmp/marketplace-finder-package/marketplace-finder/SKILL.md
cp -R docs scripts examples /tmp/marketplace-finder-package/marketplace-finder/
```

This rewrites resource links in the staged copy only. The core `SKILL.md` works on its own; bundling the supporting files also makes the parser, guides, and examples available. Choose one destination below and use a fresh destination folder when updating to avoid mixing versions.

### Claude Code

Install in `~/.claude/skills/marketplace-finder/`:

```bash
mkdir -p ~/.claude/skills
cp -R /tmp/marketplace-finder-package/marketplace-finder ~/.claude/skills/
```

For project-only installation, use `.claude/skills/` instead of `~/.claude/skills/`. Start a session, configure the signed-in browser tool, and invoke `/marketplace-finder` or ask for a Marketplace search. See [Claude Code skills documentation](https://code.claude.com/docs/en/skills).

### Cursor

Install into the target project's `.cursor/skills/` (or `~/.cursor/skills/` for personal use):

```bash
mkdir -p .cursor/skills
cp -R /tmp/marketplace-finder-package/marketplace-finder .cursor/skills/
```

Ask Agent to use `marketplace-finder`, with your browser tool connected. See [Cursor skills documentation](https://cursor.com/help/customization/skills).

### Claude Desktop

ZIP the staged folder from the Install step (requires `zip`):

```bash
(cd /tmp/marketplace-finder-package && zip -r marketplace-finder.zip marketplace-finder)
```

Upload `/tmp/marketplace-finder-package/marketplace-finder.zip` through **Customize → Skills**, then enable it. If required, enable code execution/file creation in Settings → Capabilities. See [custom skill packaging](https://support.claude.com/en/articles/12512198-how-to-create-custom-skills) and [enabling skills](https://support.claude.com/en/articles/12512180-use-skills-in-claude). Browser automation must also be available to that Desktop session; uploading a skill does not grant browser access. If skill upload is unavailable, attach `SKILL.md` as instructions and provide supporting files when needed.

### Codex and other agents

Keep the cloned repository accessible and add a pointer to your project's `AGENTS.md` (adjust to an actual absolute path):

```markdown
For Facebook Marketplace buying searches, read
/absolute/path/fb-marketplace-finder-skill/marketplace-finder/SKILL.md
and follow its read-only workflow and stop rules. Use the configured
browser automation tool with the user's signed-in Facebook session.
```

Codex reads [project instructions from AGENTS.md](https://developers.openai.com/codex/guides/agents-md/). For agents that do not read that file, put the same pointer in their instruction file or explicitly ask them to read `SKILL.md`. No skill-discovery mechanism is necessary.

## Use

> Use marketplace-finder to find a used solid-wood desk under CAD 250 in Calgary, pickup only. Run a few searches and return the best three candidates with caveats. Do not contact sellers.

Start with [the skill](marketplace-finder/SKILL.md), [city slugs](docs/city-slugs.md), and [deal checklist](docs/deal-checklist.md). Worked examples: [winter tires and rims](examples/winter-tires.md), [used furniture](examples/used-furniture.md), [used-car watch](examples/used-car-watch.md). Example outcomes and [sample JSON](examples/sample-output.json) are **fictional**, not live recommendations.

## Parser

[scripts/parse_results.js](scripts/parse_results.js) is an `async (page) =>` expression: paste its full contents into a Playwright-compatible code tool. It reads embedded first-page `marketplace_search.feed_units` JSON from `page.content()`, returning sanitized `edges`, `page_info`, `location_id`, and normalized `listings`. It does not navigate, scroll, or detect access walls; the agent must check page text and URLs using the skill's stop rules.

For an existing Playwright `page` in a Node.js script:

```js
const fs = require('node:fs');
const vm = require('node:vm');
const parseResults = vm.runInNewContext(
  '(' + fs.readFileSync('scripts/parse_results.js', 'utf8') + ')'
);
const result = await parseResults(page);
```

`edges: null` means extraction failed; `[]` is a parsed empty feed. Missing listing fields are `null`, including unknown sold/pending flags. Listings are deduplicated by ID; prices retain their displayed text. Photo URLs expire. `location_id` is a nearby echo, not independent proof of location. Do not publish full HTML or session information. Facebook can change its undocumented markup and filter behavior at any time.

Run the offline parser checks with `node scripts/parse_results.test.js` (Node.js 18+). They use synthetic HTML and never contact Facebook.
