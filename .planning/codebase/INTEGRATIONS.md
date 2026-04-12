# Integrations

**Analysis Date:** 2026-04-12

## Internal Integrations

### Three-Repo Structure
The project root (`信息化项目/`) acts as a parent container for two git-tracked sub-repos and one generated output directory:

```
信息化项目/          ← Obsidian vault (parent, contains CLAUDE.md + graphify-out/)
├── my-project-code/    ← Code repo (Obsidian vault, OpenSpec workspace, HTML demo output)
├── my-project-wiki/    ← Wiki repo (git-tracked, Obsidian vault, knowledge base)
└── graphify-out/       ← Generated knowledge graph output (not a separate repo)
```

### my-project-code → my-project-wiki (OpenSpec Archive Sync)
After an OpenSpec change is archived via `/opsx:archive`, the change folder is manually copied to the wiki:

```bash
cp -r my-project-code/openspec/changes/[change-name]/ my-project-wiki/raw/openspec/[change-name]/
```

- Source: `my-project-code/openspec/changes/[change-name]/` (proposal.md, design.md, tasks.md, spec.md)
- Destination: `my-project-wiki/raw/openspec/[change-name]/`
- Trigger: Manual, after `/opsx:archive` completes
- Currently synced: `notification-template` change exists in both locations

### my-project-wiki/raw/ → my-project-wiki/wiki/ (Ingest Workflow)
Raw source documents are processed into structured wiki pages via the `/ingest` command in the wiki repo:

- Source: `my-project-wiki/raw/docs/`, `raw/meetings/`, `raw/decisions/`, `raw/openspec/`
- Destination: `my-project-wiki/wiki/entities/`, `wiki/concepts/`, `wiki/sources/`, `wiki/decisions/`, `wiki/synthesis/`
- Trigger: Manual (`/ingest <文件路径>`)
- Rule: `raw/` is read-only; only `wiki/` is writable

### graphify ← Both Repos (Graph Ingestion)
The graphify tool reads all files across the project root (including both sub-repos) and builds a unified knowledge graph:

- Input: All `.md` and `.js` files under `信息化项目/` (78 files total as of 2026-04-11)
- Output: `graphify-out/GRAPH_REPORT.md`, `graphify-out/graph.json`, `graphify-out/graph.html`, `graphify-out/manifest.json`
- Trigger: Manual CLI command from project root
- Cache: `graphify-out/cache/` (per-file content hashes)

### OpenSpec config.yaml → HTML Generation
The `config.yaml` feeds directly into AI-driven HTML generation:

- `my-project-code/openspec/config.yaml` — read by Claude Code at `/opsx:apply` time
- `my-project-code/doce/ui-spec.md` — also read at apply time; defines component patterns
- Together they constrain all generated HTML output (layout, colors, mock data volume, workflow states)

## External Tools

### Obsidian
- Both `my-project-code/` and `my-project-wiki/` are opened as separate Obsidian vaults
- Wikilinks (`[[页面名]]`) allow navigation across pages within each vault
- Plugins extend functionality per vault (see STACK.md for plugin list)
- Config stored in `.obsidian/` within each vault directory

### Tailwind CSS (CDN)
- URL: `https://cdn.tailwindcss.com`
- Used in: All generated HTML demo pages in `my-project-code/pages/`
- No local install — fetched from CDN at browser load time
- Custom theme configured inline in each HTML file's `<script>` block

### Lucide Icons (CDN)
- URL: `https://unpkg.com/lucide@latest/dist/umd/lucide.min.js`
- Used in: All generated HTML demo pages
- Initialized via `lucide.createIcons()` at end of each HTML body

### DingTalk (钉钉) — Target System Integration (Not in Demo)
- The production system being designed targets DingTalk integration: SSO + message notifications + mini-app
- Specified in `my-project-wiki/wiki/concepts/技术架构.md` and `申报书技术规范.md`
- **Not implemented in the current HTML demo** — mock data simulates all interactions
- Referenced in OpenSpec and wiki as a key architectural constraint

### Flowable / Activiti — Target Workflow Engine (Not in Demo)
- The production system architecture specifies Flowable or Activiti as the workflow engine
- Referenced in `graphify-out/GRAPH_REPORT.md` Community 4 ("工作流引擎（Flowable/Activiti）")
- **Not implemented in the current HTML demo**

### Vue3 + SpringBoot — Target Tech Stack (Not in Demo)
- Production system target: Vue3 frontend + SpringBoot backend
- Referenced in `graphify-out/GRAPH_REPORT.md` ("技术架构（Vue3+SpringBoot+Flowable+钉钉）")
- **Not implemented** — current deliverable is static HTML demo only

## Data Flows

### Specification → Demo Flow
```
Business requirements (raw/docs/, raw/meetings/, raw/decisions/)
    ↓ /ingest
wiki/concepts/, wiki/entities/, wiki/synthesis/
    ↓ (human decision)
openspec/changes/[name]/proposal.md    ← /opsx:propose
    ↓
openspec/changes/[name]/design.md      ← /opsx:continue or /opsx:ff
    ↓
openspec/changes/[name]/tasks.md
    ↓
my-project-code/pages/[page].html      ← /opsx:apply
    ↓
openspec/changes/[name]/spec.md        ← /opsx:archive (captures final state)
    ↓
my-project-wiki/raw/openspec/[name]/   ← cp (manual sync)
    ↓
wiki/concepts/ or wiki/decisions/      ← /ingest
```

### Knowledge Graph Flow
```
All .md + .js files in 信息化项目/
    ↓ graphify rebuild (python3 CLI)
graphify-out/graph.json    (machine-readable graph)
graphify-out/GRAPH_REPORT.md    (human-readable summary: god nodes, communities, gaps)
graphify-out/graph.html    (visual browser-based graph)
    ↓ (read by Claude Code before answering architecture questions)
```

### Wiki Maintenance Flow
```
New raw file added to raw/docs/, raw/meetings/, or raw/decisions/
    ↓ /ingest <file-path>
wiki/sources/[摘要页].md    (created or updated)
wiki/entities/[实体].md     (updated)
wiki/concepts/[概念].md     (updated)
wiki/index.md               (updated)
wiki/log.md                 (entry appended)
```

## Sync Mechanisms

### OpenSpec → Wiki (Manual Copy)
- Mechanism: Shell `cp -r` command, run manually after `/opsx:archive`
- Defined in: Root `CLAUDE.md` and `my-project-code/CLAUDE.md`
- Command: `cp -r my-project-code/openspec/changes/[变更名] my-project-wiki/raw/openspec/`
- No automation — human-triggered

### Wiki Drift Detection
- Mechanism: `/sync` command in wiki repo
- Lists all `raw/` files not yet ingested by comparing against `wiki/log.md`
- Identifies files added since last `/ingest` run

### Wiki Health Check
- Mechanism: `/lint` command in wiki repo
- Reports: contradiction markers (`⚠️`), stale synthesis pages, orphaned pages, missing concept pages
- Fully manual — run on demand

### Git Tracking
- Only `my-project-wiki/` has an active `.git` directory (confirmed by presence of `.git/`)
- `my-project-code/` git status: not confirmed as separate git repo from exploration
- Commit message convention: `类型: 简短描述` (feat / fix / docs / refactor / chore)
- File renames: must use `git mv`, not direct `mv`

---

*Integration audit: 2026-04-12*
