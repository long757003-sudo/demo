# Conventions

**Analysis Date:** 2026-04-12

## Writing Standards

**Language:**
- 所有文档（wiki 页面、proposal、design、源文件摘要）一律用中文编写
- HTML demo 页面语言设定为 `zh-CN`

**Uncertainty Marking:**
- 不确定内容标注 `*（待确认）*`，而非留白或直接断言
- 真实矛盾（两份文档内容冲突）在原页面标注 `> ⚠️ 与 [[xxx]] 存在矛盾，待确认`，不擅自选边

**Citation Rules:**
- 所有结论必须标注来源（原始文件路径或 wiki 页面链接）
- wiki 内引用使用 `[[页面名]]` 格式（Obsidian 兼容）

**Objectivity:**
- 保持客观陈述，不在 wiki 页面中混入主观判断
- 矛盾解决前保持 `⚠️` 标注，通过 `/lint` 统一管理

## Git Conventions

**Commit Message Format:**
```
类型: 简短描述
```
类型枚举：`feat` / `fix` / `docs` / `refactor` / `chore`

示例：
- `docs: 新增通知模板 proposal`
- `feat: 完成通知模板库视图`
- `chore: 同步 openspec 变更至 wiki`

**File Rename Rule:**
- 文件重命名必须使用 `git mv`，禁止直接 `mv`
- `raw/` 文件重命名后，必须更新所有引用该文件路径的 `sources:` 字段

**Raw File Lifecycle:**
- `raw/` 目录下文件只增不删
- 过时文件加 `-archived` 后缀，不直接删除

## Documentation Structure

**Two-Repo Layout:**
```
my-project-parent/
├── my-project-code/     # 代码仓库：HTML demo + OpenSpec 变更管理
└── my-project-wiki/     # wiki 仓库：知识库，分 raw/ 和 wiki/ 两区
```

**Wiki Directory Schema:**

| 目录 | 内容 | 可写 |
|------|------|------|
| `raw/docs/` | 需求文档、PRD、规格说明 | 只读 |
| `raw/meetings/` | 会议记录、访谈笔记 | 只读 |
| `raw/decisions/` | 原始决策邮件、讨论记录 | 只读 |
| `raw/assets/` | 图片、附件 | 只读 |
| `raw/openspec/` | 从代码仓库同步过来的 OpenSpec 文件 | 只读 |
| `wiki/entities/` | 系统/角色/产品等实体页面 | 读写 |
| `wiki/concepts/` | 业务规则、技术方案等概念页面 | 读写 |
| `wiki/sources/` | 原始资料摘要页 | 读写 |
| `wiki/decisions/` | ADR 决策记录 | 读写 |
| `wiki/synthesis/` | 跨文档综合分析 | 读写 |

**Wiki Page Frontmatter（每页必须）:**
```yaml
---
title: 页面标题
type: entity | concept | source | decision | synthesis
created: YYYY-MM-DD
updated: YYYY-MM-DD
sources: [raw/docs/xxx.md]
openspec_change: ""        # 对应 OpenSpec Change 名称，无则留空
tags: []
---
```

**Contradiction Handling:**
- 版本迭代矛盾：以较新文档为准，旧页面加历史注记
- 真实矛盾：在 `wiki/synthesis/` 创建专门矛盾记录页，标注"待业务确认"

## OpenSpec Process

**Scope Rules:**
- 每个 OpenSpec 变更只对应一个页面或一个功能模块
- `tasks.md` 控制在 15 项以内，超出则拆分为多个变更
- 严禁跳过 propose 流程直接让 AI 生成完整页面

**Standard Workflow:**

| 步骤 | 指令 | 产物 |
|------|------|------|
| Step 1 Propose | `/opsx:propose [变更描述]` | `proposal.md`, `design.md`, `tasks.md` |
| Step 2 Apply | `/opsx:apply [变更名称]` | HTML 文件 |
| Step 3 Archive | `/opsx:archive [变更名称]` | 变更归入 `openspec/changes/[变更名]/spec.md` |
| Step 4 Wiki Sync | `cp -r openspec/changes/[变更名] ../my-project-wiki/raw/openspec/` | wiki 原始资料更新 |

**Extended Commands:**

| 指令 | 用途 |
|------|------|
| `/opsx:explore` | 需求不清晰时与 AI 讨论，不生成文件 |
| `/opsx:continue` | 逐步生成，先审查 proposal 再生成 design |
| `/opsx:ff` | 需求明确时一次性补全所有规划 |
| `/opsx:verify` | 生成完成后让 AI 自查是否符合 design.md |

**OpenSpec Change Directory Structure:**
```
openspec/changes/[变更名]/
├── proposal.md    # 为什么做 + 需求边界
├── design.md      # 页面布局 + 数据结构 + 修改文件清单
├── tasks.md       # 施工单（不存入 wiki）
└── spec.md        # 归档后生成的最终规格
```

**OpenSpec → Wiki Ingest Rules:**
- `proposal.md` → 提取"为什么做"和需求边界 → 更新 `wiki/decisions/`
- `design.md` → 提取技术选型和架构决策 → 更新 `wiki/concepts/`
- `tasks.md` → **不存入 wiki**（施工单不是知识）
- `spec.md`（归档后）→ 更新对应 `concepts/` 页面，标注功能已上线

## Naming Conventions

**OpenSpec Change Names:**
- 使用小写连字符格式，如 `notification-template`、`project-list`
- 变更名直接对应 `openspec/changes/` 下的目录名

**Wiki Page Names:**
- 使用中文，与业务概念一致，如 `需求征集模块.md`、`角色体系.md`
- 内部链接使用 `[[页面名]]`（不含 `.md` 后缀）

**HTML Demo Files:**
- 页面文件放在 `pages/` 目录下，如 `pages/notification-template.html`
- 跳转使用相对路径，如 `href="pages/xxx.html"`
- 入口文件：`index.html`

**Log Entry Format (wiki/log.md):**
```
## [YYYY-MM-DD] 操作类型 | 标题
```

## Review & Quality Standards

**Design Review (OpenSpec Propose 后必做):**
- 重点 review `design.md` 中的页面布局描述是否准确
- 确认布局描述包含：顶部、左侧、右侧主区域（含顶部/中部/底部）的完整说明

**Pre-Archive Checklist (`my-project-code/CLAUDE.md`):**
- [ ] HTML 文件在浏览器双击可正常打开
- [ ] 所有页面跳转链接指向正确文件
- [ ] Mock 数据覆盖了主要演示场景
- [ ] 页面菜单结构与其他页面保持一致

**Wiki Health Check (`/lint`):**
- 矛盾标记（`⚠️`）清单 — 需用户确认
- 可能已过时的 synthesis 页面（对比 sources 更新时间）
- 孤立页面（无其他页面链接到它）
- 被提及但缺少独立页面的重要概念
- 建议补充的资料方向

**Ingest Confirmation Step:**
- 每次 `/ingest` 时，先向用户简述 3-5 个关键要点，确认理解方向，再创建/更新页面
- 检查新内容是否与现有页面矛盾，有则标注 `⚠️`

---

*Convention analysis: 2026-04-12*
