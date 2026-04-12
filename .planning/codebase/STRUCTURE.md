# Codebase Structure

**Analysis Date:** 2026-04-12

## Directory Layout

```
信息化项目/                        # 项目父目录（非 Git 仓库）
├── my-project-code/               # 代码仓库（Git）
│   ├── openspec/                  # OpenSpec 变更管理系统
│   │   └── changes/               # 各变更目录（每个为一次功能变更）
│   │       └── notification-template/   # 示例变更目录
│   │           ├── proposal.md    # 变更提案（为什么做）
│   │           ├── design.md      # 页面布局与技术方案
│   │           ├── spec.md        # 功能规格（归档后更新）
│   │           └── tasks.md       # AI 施工任务列表（≤15项）
│   ├── doce/                      # 文档辅助
│   │   └── ui-spec.md             # UI 规范（shadcn 风格，Tailwind + Lucide）
│   ├── pages/                     # HTML 页面输出目录（当前为空，待生成）
│   ├── assets/                    # 静态资源目录（当前为空）
│   └── CLAUDE.md                  # 代码仓库 AI 工作规范
│
├── my-project-wiki/               # Wiki 知识库仓库（Git，Obsidian Vault）
│   ├── raw/                       # 只读原始资料区
│   │   ├── docs/                  # 需求文档、PRD、演示规格
│   │   │   └── demo-0408/         # 0408 Demo 原始文件
│   │   │       ├── index.html     # Demo 主入口
│   │   │       ├── app.html       # Demo 应用框架
│   │   │       └── shared/        # 共享模块
│   │   │           ├── views/     # 各视图 JS 文件（11个）
│   │   │           └── graphify-out/  # Demo 知识图谱快照
│   │   ├── meetings/              # 会议纪要原文
│   │   ├── decisions/             # 原始决策文件（PDF/DOCX + MD 转写）
│   │   ├── assets/                # 图片附件
│   │   └── openspec/              # 从代码仓库同步的 OpenSpec 归档
│   │       └── notification-template/  # 已同步变更示例
│   │
│   ├── wiki/                      # AI 维护的知识层（读写）
│   │   ├── index.md               # Wiki 总索引（AI 维护）
│   │   ├── overview.md            # 项目全局概述
│   │   ├── log.md                 # ingest 操作日志
│   │   ├── entities/              # 实体页（系统、角色等）
│   │   ├── concepts/              # 概念页（业务规则、模块说明）
│   │   ├── sources/               # 来源摘要页（对应 raw/ 文件）
│   │   ├── decisions/             # ADR 决策记录
│   │   └── synthesis/             # 综合分析页（跨模块关联）
│   │
│   └── CLAUDE.md                  # Wiki AI 维护规范（含所有指令定义）
│
├── graphify-out/                  # 知识图谱自动生成输出（非 Git 提交）
│   ├── GRAPH_REPORT.md            # 社区结构、核心节点、知识缺口报告
│   ├── graph.json                 # 图数据（236节点，308边）
│   ├── graph.html                 # 交互式可视化
│   ├── manifest.json              # graphify 构建清单
│   └── cache/                     # graphify 增量缓存
│
├── .planning/                     # GSD 规划文档（本目录）
│   └── codebase/                  # 代码库分析文档
│
├── .claude/                       # Claude 配置
├── .obsidian/                     # Obsidian 配置
└── CLAUDE.md                      # 顶层项目约定（跨仓库操作规范）
```

## Directory Purposes

**`my-project-code/openspec/changes/`**
- Purpose: 每次功能变更的完整生命周期记录
- Contains: 每个子目录对应一次变更，包含 `proposal.md`、`design.md`、`spec.md`、`tasks.md` 四个标准文件
- Key files: `my-project-code/openspec/changes/notification-template/design.md`（变更设计示例）
- 归档后通过 `cp -r` 同步到 `my-project-wiki/raw/openspec/`

**`my-project-code/doce/`**
- Purpose: 开发过程文档，供 AI 执行时读取
- Key files: `my-project-code/doce/ui-spec.md`（必须在执行 `/opsx:apply` 前读取）

**`my-project-code/pages/`**
- Purpose: HTML 页面输出目录，存放生成的演示页面
- 文件为浏览器直接双击可运行的单文件 HTML，无需服务器

**`my-project-wiki/raw/`**
- Purpose: 只读原始资料存档区，永远不修改
- Contains: PDF/DOCX 原件及其 Markdown 转写版本、会议纪要、OpenSpec 同步文件
- Key files:
  - `my-project-wiki/raw/decisions/西南大学信息化项目管理办法.md`（制度蓝本）
  - `my-project-wiki/raw/docs/demo-0408/shared/views/`（11个视图 JS 文件）

**`my-project-wiki/wiki/`**
- Purpose: AI 维护的结构化知识库，是项目知识的权威来源
- Key files:
  - `my-project-wiki/wiki/index.md`（总索引，导航入口）
  - `my-project-wiki/wiki/synthesis/通知矩阵.md`（130条通知，跨模块综合分析）
  - `my-project-wiki/wiki/synthesis/系统规则表.md`（43条硬规则）
  - `my-project-wiki/wiki/entities/角色体系.md`（12类角色权限）

**`graphify-out/`**
- Purpose: graphify 工具自动生成的知识图谱，供回答架构问题前预读
- Generated: 是（运行 `python3 -c "from graphify.watch import _rebuild_code; ..."` 更新）
- Committed: 否（构建产物，不提交）
- Key files: `graphify-out/GRAPH_REPORT.md`（架构问题必读）

## Key File Locations

**入口与规范：**
- `my-project-code/CLAUDE.md` — OpenSpec 工作流完整规范，AI 操作权威指南
- `my-project-wiki/CLAUDE.md` — Wiki 维护规范，含所有 `/ingest`、`/decision`、`/query` 等指令
- `my-project-code/doce/ui-spec.md` — UI 规范，执行页面生成前必须读取
- `graphify-out/GRAPH_REPORT.md` — 回答架构/代码库问题前必须读取

**知识库导航：**
- `my-project-wiki/wiki/index.md` — wiki 所有页面的导航总索引

**演示原型：**
- `my-project-wiki/raw/docs/demo-0408/index.html` — 0408 Demo 主入口
- `my-project-wiki/raw/docs/demo-0408/shared/views/` — 各视图实现（11个 JS 文件）

**变更管理：**
- `my-project-code/openspec/changes/[变更名]/proposal.md` — 变更提案
- `my-project-code/openspec/changes/[变更名]/design.md` — 页面布局设计（核心文件，Review 重点）
- `my-project-code/openspec/changes/[变更名]/tasks.md` — AI 施工任务（≤15项）

## Naming Conventions

**变更目录：**
- 格式：`kebab-case`（小写连字符），例：`notification-template`
- 描述性名称，对应一个页面或功能模块

**Wiki 页面：**
- 格式：中文描述性标题，例：`通知矩阵.md`、`角色体系.md`
- Obsidian 内部链接用 `[[页面名]]` 格式（不含 `.md` 后缀）

**会议纪要文件：**
- 格式：`YYMMDD会议纪要.md`，例：`260409会议纪要.md`

**HTML 页面：**
- 格式：与视图功能对应的英文名，例：`demand.html`、`approval.html`

**OpenSpec 文件：**
- 固定四个文件名：`proposal.md`、`design.md`、`spec.md`、`tasks.md`

## Where to Add New Code

**新 HTML 页面（通过 OpenSpec 流程生成）：**
1. 提案：`my-project-code/openspec/changes/[变更名]/proposal.md`
2. 设计：`my-project-code/openspec/changes/[变更名]/design.md`
3. 输出：`my-project-code/pages/[页面名].html`
4. 归档后同步：`my-project-wiki/raw/openspec/[变更名]/`

**新 Wiki 知识页面：**
- 实体（系统/角色）：`my-project-wiki/wiki/entities/[页面名].md`
- 业务概念/模块规则：`my-project-wiki/wiki/concepts/[页面名].md`
- 来源摘要：`my-project-wiki/wiki/sources/[页面名].md`
- 架构/业务决策记录：`my-project-wiki/wiki/decisions/[页面名].md`
- 跨模块综合分析：`my-project-wiki/wiki/synthesis/[页面名].md`
- 新增页面后更新：`my-project-wiki/wiki/index.md`

**新原始资料：**
- 文档/PRD：`my-project-wiki/raw/docs/[文件名]`
- 会议纪要：`my-project-wiki/raw/meetings/[YYMMDD会议纪要.md]`
- 决策文件：`my-project-wiki/raw/decisions/[文件名]`
- 入库后执行：`/ingest` 指令处理

## Special Directories

**`graphify-out/`：**
- 工具自动生成，不手动编辑
- 更新命令：`python3 -c "from graphify.watch import _rebuild_code; from pathlib import Path; _rebuild_code(Path('.'))"` （在项目根目录执行）
- 修改代码文件后应重新运行以保持图谱同步

**`my-project-wiki/raw/`：**
- 只读，永远不修改其中任何文件
- 过时文件加 `-archived` 后缀，不删除
- 文件重命名必须使用 `git mv` 并通知 Claude Code 更新 `sources:` 引用

**`.planning/codebase/`：**
- GSD 工具自动生成的代码库分析文档
- 供 `/gsd-plan-phase` 和 `/gsd-execute-phase` 读取

---

*Structure analysis: 2026-04-12*
