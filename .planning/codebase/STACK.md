# Technology Stack

**Analysis Date:** 2026-04-12

## Primary Technologies

- **Markdown (.md)** — All documentation, wiki pages, OpenSpec planning files, CLAUDE.md instructions
- **YAML (.yaml)** — OpenSpec project configuration (`my-project-code/openspec/config.yaml`)
- **HTML** — Deliverable output: local-runnable demo files generated into `my-project-code/pages/`
- **JavaScript (vanilla, no modules)** — Embedded in HTML demo files; also shared JS modules in `my-project-code/demo/shared/`

## Languages & Formats

| Format | Location | Purpose |
|--------|----------|---------|
| `.md` | All repos | Primary authoring format for all wiki, spec, and instruction files |
| `.yaml` | `my-project-code/openspec/config.yaml` | OpenSpec project configuration ("基础宪法") |
| `.html` | `my-project-code/pages/` | Output: browser-openable demo files |
| `.js` | `my-project-code/demo/shared/` | Shared view modules (core.js, data.js, nav.js, views/*.js) |
| `.json` | `graphify-out/`, `.obsidian/` | Graph output, Obsidian workspace config |
| `.pdf` | `my-project-wiki/raw/decisions/` | Original policy/contract source documents |

## Tooling

### Obsidian (Note-taking & Knowledge Management)
- Both `my-project-code/` and `my-project-wiki/` are Obsidian vaults (each has `.obsidian/` config)
- Internal links use `[[页面名]]` wikilink syntax
- Config files: `my-project-code/.obsidian/`, `my-project-wiki/.obsidian/`

**Obsidian plugins — my-project-code vault:**
- `obsidian-importer` — for importing external files into the vault

**Obsidian plugins — my-project-wiki vault:**
- `templater-obsidian` — template-based page creation
- `dataview` — query-based views over wiki pages
- `obsidian-kanban` — kanban boards (likely for task tracking)

### OpenSpec (Specification Change Management)
- Custom AI-driven workflow for structured feature specification
- Invoked via slash commands: `/opsx:propose`, `/opsx:apply`, `/opsx:archive`, `/opsx:explore`, `/opsx:continue`, `/opsx:ff`, `/opsx:verify`
- Config: `my-project-code/openspec/config.yaml`
- Change directories: `my-project-code/openspec/changes/[change-name]/`
- Each change contains: `proposal.md`, `design.md`, `tasks.md`, `spec.md`

### Graphify (Knowledge Graph)
- Python-based knowledge graph generator; run via `python3 -c "from graphify.watch import _rebuild_code; ..."`
- Analyzes all files in project and produces a graph of 236 nodes / 308 edges (as of 2026-04-11)
- Output directory: `graphify-out/`
- Output files: `graphify-out/GRAPH_REPORT.md`, `graphify-out/graph.json`, `graphify-out/graph.html`, `graphify-out/manifest.json`, `graphify-out/cache/`

### Claude Code (AI Assistant)
- Primary authoring and code-generation tool
- Instructions defined in layered CLAUDE.md files (root, per-repo)
- Slash commands defined in CLAUDE.md files drive workflows

## Build / Generation

### HTML Demo Generation
- Triggered by `/opsx:apply [change-name]`
- AI reads `my-project-code/openspec/config.yaml` and `my-project-code/doce/ui-spec.md` before generating
- Output: standalone `.html` files placed in `my-project-code/pages/`
- No build step — files are opened directly in the browser

### UI Framework (CDN-based, no install)
- **Tailwind CSS** — loaded via `https://cdn.tailwindcss.com`; configured inline with `tailwind.config` in each page
- **Lucide Icons** — loaded via `https://unpkg.com/lucide@latest/dist/umd/lucide.min.js`
- Style: shadcn/ui visual design language (neutral color theme)
- All mock data defined as JavaScript arrays inside each HTML file

### Knowledge Graph Rebuild
- Command: `python3 -c "from graphify.watch import _rebuild_code; from pathlib import Path; _rebuild_code(Path('.'))"`
- Run from project root after modifying files
- Requires Python 3 with `graphify` package installed

## Key Dependencies

| Tool/Package | Where | Required For |
|---|---|---|
| Python 3 + `graphify` | Local machine | Rebuilding knowledge graph in `graphify-out/` |
| Obsidian | Local machine | Navigating and editing both vaults with wikilinks |
| Claude Code | Local machine | Running OpenSpec workflows and wiki maintenance |
| Tailwind CSS CDN | `cdn.tailwindcss.com` | Styling demo HTML pages |
| Lucide Icons CDN | `unpkg.com/lucide@latest` | Icons in demo HTML pages |
| Obsidian plugins (see above) | `.obsidian/plugins/` | Templating, dataview queries, kanban in wiki |

## Configuration

**OpenSpec project config:**
- `my-project-code/openspec/config.yaml` — defines project name, tech stack type (`html-demo`), UI style (`shadcn`), business domain, user roles, core flows, mock data rules, and AI behavior rules

**UI spec:**
- `my-project-code/doce/ui-spec.md` — defines CDN template, layout pattern, component snippets, and coding prohibitions (no inline styles, no npm, no real API calls)

**CLAUDE.md instruction layers:**
- `信息化项目/CLAUDE.md` — root: cross-repo paths, writing rules, git conventions, graphify rules
- `my-project-code/CLAUDE.md` — code repo: OpenSpec workflow, UI spec reference, archival checklist
- `my-project-wiki/CLAUDE.md` — wiki repo: directory schema, page format, slash commands (ingest/decision/query/sync/lint)

## Platform Requirements

**Development:**
- macOS (darwin) — confirmed from environment
- Python 3 with `graphify` installed
- Obsidian desktop app
- Claude Code CLI

**Production / Demo:**
- Any modern web browser — HTML files run by double-clicking, no server needed
- No backend, no database, no deployment pipeline — all data is hardcoded mock data in HTML

---

*Stack analysis: 2026-04-12*
