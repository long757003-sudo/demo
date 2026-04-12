# Testing Patterns

**Analysis Date:** 2026-04-12

## Overview

This project produces static HTML demo files and Markdown wiki pages — it
is not a software engineering project with a compiled runtime or test suite.
No automated test framework is present. Quality assurance is performed
through a structured manual review process built into the OpenSpec workflow.

## Test Framework

**Runner:** Not applicable — no test runner configured.

**Assertion Library:** Not applicable.

**Test Files:** None detected (no `*.test.*` or `*.spec.*` files exist).

**Run Commands:** No test commands defined.

## Quality Verification Process

The project uses a **manual pre-archive checklist** defined in
`my-project-code/CLAUDE.md` and mirrored in `my-project-wiki/CLAUDE.md`.
This checklist serves as the acceptance gate before any OpenSpec change is
archived.

**Pre-Archive Checklist (run before `/opsx:archive`):**
- [ ] HTML 文件在浏览器双击可正常打开
- [ ] 所有页面跳转链接指向正确文件
- [ ] Mock 数据覆盖了主要演示场景
- [ ] 页面菜单结构与其他页面保持一致

**How to run:** Open the generated HTML file directly in a browser (no server
needed). Verify each checklist item manually before running the archive
command.

## OpenSpec Review Gate

Every change passes through a two-stage design review before code is
generated:

| Stage | Artifact | What to check |
|-------|----------|---------------|
| Propose | `openspec/changes/[name]/proposal.md` | Scope boundary, why it's needed |
| Design | `openspec/changes/[name]/design.md` | Layout correctness, data structure, file list |

The `design.md` **must** include a full layout description with: 顶部 (top
nav), 左侧 (left menu, 240px), 右侧主区域 top/middle/bottom breakdown.
Missing layout sections are a blocking review failure.

**Verify command (post-generation):**
```
/opsx:verify
```
This triggers AI self-review against `design.md` to check conformance before
archive.

## Wiki Health Check (`/lint`)

Ongoing quality of wiki content is maintained through the `/lint` command,
which checks for:

- `⚠️` contradiction markers — require user confirmation to resolve
- Potentially stale synthesis pages (compared against source update dates)
- Orphaned pages (no inlinks from other pages)
- Concepts mentioned in documents but lacking a dedicated wiki page
- Suggested areas for additional source material

**Contradiction handling in wiki pages:**
```markdown
> ⚠️ 与 [[页面名]] 存在矛盾，待确认
```
Place inline at the point of conflict. Do not resolve silently; surface it
for user decision.

## Ingest Confirmation Pattern

When running `/ingest` on new source material, the process requires a
confirmation step before writing any wiki pages:

1. Summarize 3–5 key findings from the source document
2. Present to user for direction confirmation
3. Check new content against existing wiki pages for contradictions
4. Mark any conflicts with `⚠️` before finalizing

This prevents wiki pages from drifting from the user's actual understanding.

## What Is Not Tested

**No automated coverage for:**
- JavaScript logic inside HTML demo pages (no unit tests)
- Navigation/routing between pages (manual link verification only)
- Mock data completeness (manual scenario walkthrough)
- Wiki frontmatter validity (no schema validator configured)

**Risk areas:**
- `pages/*.html` inter-page navigation links — easy to introduce broken
  relative paths when files are renamed or moved
- Mock data in HTML files — no contract between demo data and actual system
  rules; can become stale as business rules evolve
- Wiki `sources:` frontmatter fields — if a `raw/` file is renamed, existing
  wiki pages referencing it will silently contain stale paths

## Coverage Gaps

**Broken link detection:**
- No automated check for dead `href` links between HTML pages
- Files: any file under `my-project-code/pages/`
- Risk: renaming one page breaks silently until manual review
- Priority: Medium

**Frontmatter path validation:**
- Wiki `sources:` fields reference `raw/` paths; no validator enforces
  existence
- Files: all files under `my-project-wiki/wiki/`
- Risk: stale source references after `git mv` renames
- Priority: Low

---

*Testing analysis: 2026-04-12*
