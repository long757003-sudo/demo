# Codebase Concerns

**Analysis Date:** 2026-04-12

---

## 结构性问题 (Structural Issues)

**my-project-code/ 没有 git 仓库：**
- 问题：`my-project-code/` 目录下不存在 `.git/`，代码仓库完全没有版本控制。demo HTML 文件、OpenSpec 变更文件、`doce/ui-spec.md` 均无历史记录。
- 文件：`my-project-code/`（整个目录）
- 影响：无法追溯变更历史，无法回滚，多人协作存在覆盖风险。
- 修复：在 `my-project-code/` 执行 `git init && git add . && git commit -m "chore: 初始化代码仓库"`，此后每次 `/opsx:archive` 后补一个 commit。

**wiki 有 git 仓库但提交状态不明：**
- 问题：`my-project-wiki/` 有 `.git/`（main 分支，commit `d493add`），但无法确认当前工作树是否干净。wiki 从 2026-04-07 到 2026-04-10 经历了大量 ingest 操作，若未及时 commit，这些内容处于未保护状态。
- 文件：`my-project-wiki/wiki/`（全部 wiki 页面）
- 影响：断电或误操作可能丢失所有 wiki 内容。
- 修复：定期执行 `git add -A && git commit -m "docs: 更新 wiki"` 或在每次 ingest 操作后提交。

**wiki/decisions/ 目录为空：**
- 问题：`wiki/decisions/` 目录存在但没有任何文件。`wiki/index.md` 的 decisions 区段仅有注释 `<!-- ADR：架构/业务决策存档 -->`，`wiki/overview.md` 的"近期重要决策"区块内容为 `<!-- 链接到 decisions/ 页面，待后续资料 ingest 后填充 -->`。
- 文件：`my-project-wiki/wiki/decisions/`，`my-project-wiki/wiki/index.md:44`，`my-project-wiki/wiki/overview.md:37`
- 影响：两次会议（260323、260409）中明确的架构和业务决策（协助人角色新增、专家评审规则变更、通知模板方案）均无 ADR 记录，决策依据只散落在 sources/ 摘要中，无法快速检索"为什么这么决策"。
- 修复：使用 wiki CLAUDE.md 中的 `/decision` 指令，为至少以下决策补录 ADR：(1) 协助人角色定义；(2) 通知模板独立功能决策；(3) 需求征集专家评审是否必选。

**graphify-out/ 不受任何 git 管理：**
- 问题：`graphify-out/` 位于 `my-project-wiki/` 之外的父目录 `信息化项目/`，该父目录没有 `.git/`。`my-project-wiki/.gitignore` 也不包含 `graphify-out`（因为它根本不在 wiki repo 内）。整个 `graphify-out/`（含 42 个缓存 JSON、`GRAPH_REPORT.md`、`graph.json`、`graph.html`）均无版本控制。
- 文件：`graphify-out/`（整个目录）
- 影响：图谱重建后旧报告不可找回；缓存损坏后需重新消耗 API 费用重建。
- 修复：在 `信息化项目/` 层级 `git init` 一个父仓库，或将 `graphify-out/` 加入 `my-project-wiki` 作为子目录并纳入 gitignore 中排除 cache/、保留 GRAPH_REPORT.md。

---

## 技术债 (Technical Debt)

**根 CLAUDE.md 中 OpenSpec 同步路径错误：**
- 问题：根 `CLAUDE.md` 第14行写的同步命令为：
  `cp -r ../my-project/openspec/changes/[变更名] ../my-project-wiki/raw/openspec/`
  路径 `../my-project/openspec/` 不存在。正确源路径应为 `../my-project-code/openspec/changes/`（与 `my-project-code/CLAUDE.md` 第38行一致）。
- 文件：`my-project-wiki/../信息化项目/CLAUDE.md:14`
- 影响：任何 AI agent 或新团队成员按根 CLAUDE.md 执行同步操作都会失败，且失败无明显错误提示（cp 静默失败时 wiki 不会报警）。
- 修复：将根 CLAUDE.md 第14行改为：
  `cp -r ../my-project-code/openspec/changes/[变更名] ../my-project-wiki/raw/openspec/`

**my-project-code/CLAUDE.md 中 ui-spec.md 路径引用错误：**
- 问题：`my-project-code/CLAUDE.md` 第53行写 `详见 docs/ui-spec.md`，但实际文件路径为 `my-project-code/doce/ui-spec.md`（目录名为 `doce`，非 `docs`）。
- 文件：`my-project-code/CLAUDE.md:53`，`my-project-code/doce/ui-spec.md`
- 影响：执行 `/opsx:apply` 时 AI 会尝试读取 `docs/ui-spec.md`，找不到文件后可能跳过或静默忽略，导致生成的 HTML 不符合 UI 规范（CDN 引入模板、Tailwind 类使用等）。
- 修复：将 `my-project-code/CLAUDE.md:53` 改为 `详见 doce/ui-spec.md`，或将目录 `doce/` 重命名为 `docs/`（用 `git mv` 操作，但 my-project-code 目前无 git，先初始化再 mv）。

**notification-template 已归档但未 ingest 进 wiki decisions/：**
- 问题：`notification-template` OpenSpec 变更已于 2026-04-10 完成归档（`status: archived`），文件已从代码仓库同步至 `my-project-wiki/raw/openspec/notification-template/`（含 proposal.md、design.md、spec.md、tasks.md），但 `wiki/log.md` 中没有任何 `ingest | notification-template` 记录，`wiki/decisions/` 为空，`wiki/concepts/` 中也无对应更新。
- 文件：
  - `my-project-wiki/raw/openspec/notification-template/proposal.md`（已同步，未 ingest）
  - `my-project-wiki/raw/openspec/notification-template/design.md`（已同步，未 ingest）
  - `my-project-wiki/raw/openspec/notification-template/spec.md`（已同步，未 ingest）
  - `my-project-wiki/wiki/log.md`（无 notification-template 记录）
- 影响：通知模板功能的设计决策（为什么需要独立模板库页面、16种模板的触发条件）未沉淀进知识库，wiki 与代码库产生知识断层。
- 修复：在 wiki 仓库执行 `/ingest raw/openspec/notification-template/proposal.md`，然后 `/ingest raw/openspec/notification-template/design.md`（spec.md 按 wiki CLAUDE.md 规范应更新 concepts/ 页面并标注功能已上线）。

**本科生院通知 PDF 及 .md 文件为空，未处理：**
- 问题：`raw/decisions/本科生院-2026年信息化项目需求入库评审结果通知.pdf` 存在（原始 PDF），对应的 `.md` 转写文件 `raw/decisions/本科生院-2026年信息化项目需求入库评审结果通知.md` 内容为空（wiki/log.md 2026-04-07 条目记录"文件为空，跳过"）。PDF 本体从未被解析。
- 文件：
  - `my-project-wiki/raw/decisions/本科生院-2026年信息化项目需求入库评审结果通知.pdf`
  - `my-project-wiki/raw/decisions/本科生院-2026年信息化项目需求入库评审结果通知.md`（空文件）
- 影响：该通知是需求入库评审结果，与 `需求征集模块` 直接相关（graphify 推断为 INFERRED 关联），内容未知。如果包含特定项目被拒或特殊评审规则，会影响需求征集模块的实现。
- 修复：手动阅读 PDF，将关键内容补写进 `.md` 文件，然后执行 `/ingest`。

---

## 文档缺失 (Missing Documentation)

**wiki/decisions/ 完全为空——所有决策只存在于 sources/ 摘要中：**
- 缺失内容：无任何 ADR（架构决策记录）。已知至少以下决策需要文档化：
  - 协助人角色的引入（260323 会议决定，与产品方案不一致）
  - 需求征集阶段专家评审的可选性（260409 确认）
  - 通知模板作为独立功能页面的决策
  - 专家评审意见采纳规则（待确认：50% 还是 100%）
- 文件：`my-project-wiki/wiki/decisions/`（空目录）

**wiki/synthesis/ 中系统规则表和通知矩阵未关联 decisions/：**
- 问题：`wiki/synthesis/系统规则表.md`（43条规则）和 `wiki/synthesis/通知矩阵.md`（130条通知）是高价值综合文档，但它们引用的业务决策没有对应 ADR 支撑，无法追溯"为什么是这条规则"。
- 文件：`my-project-wiki/wiki/synthesis/系统规则表.md`，`my-project-wiki/wiki/synthesis/通知矩阵.md`

**wiki/overview.md 最后更新时间为 2026-04-07，落后5天：**
- 问题：`wiki/overview.md` 头部标注"最后更新：2026-04-07"，但此后发生了大量 ingest（260409会议纪要、demo-0408代码、阶段五专家评审设计、notification-template 归档），overview 的"待解问题"列表和"近期重要决策"均未更新。
- 文件：`my-project-wiki/wiki/overview.md:3`

**graphify 图谱中37个孤立节点未处理：**
- 问题：`graphify-out/GRAPH_REPORT.md` 标识37个孤立节点（≤1条连接），包括 `260409会议纪要（功能确认会）`、`六大业务模块（线性流程）` 等核心概念，可能是缺失边或未文档化的组件。
- 文件：`graphify-out/GRAPH_REPORT.md:142`

---

## 流程缺口 (Process Gaps)

**OpenSpec 归档后 wiki ingest 步骤没有被执行：**
- 问题：`my-project-code/CLAUDE.md` 和 `my-project-wiki/CLAUDE.md` 都规定了 OpenSpec 归档后需执行 wiki ingest，但 notification-template 已归档（2026-04-10），raw/openspec/ 也已同步，wiki/log.md 中至今没有 ingest 记录。说明这个两步流程在实践中容易被遗漏。
- 影响：代码仓库和 wiki 产生知识断层，每次归档后需人工记住执行第二步。
- 建议：在 `my-project-code/CLAUDE.md` 的"归档前检查清单"中增加一项 `[ ] 已执行 wiki ingest`，或在 `/opsx:archive` 指令中内置提示。

**my-project-code/ 无 git，无法执行 CLAUDE.md 中规定的 `git mv` 重命名规范：**
- 问题：根 CLAUDE.md 规定文件重命名必须用 `git mv`，但代码仓库没有 git，该规范实际上无法执行。
- 文件：`CLAUDE.md:20`，`my-project-code/`（无 .git）

**260323 会议产生的4项待确认事项至今未关闭：**
- 问题：`wiki/sources/260323会议纪要.md` 第78-83行列出4项待确认：系统角色表、系统规则表、元数据表、专家评分模板。`wiki/overview.md` 也保留同样标注。系统规则表已在 2026-04-08 完成（synthesis/系统规则表.md），但其余3项无关闭记录。
- 文件：`my-project-wiki/wiki/sources/260323会议纪要.md:78-83`，`my-project-wiki/wiki/overview.md:31`
- 建议：执行 `/lint` 核查所有 `⚠️` 和 `*（待确认）*` 标注的关闭状态，逐项确认或更新。

---

## 工具风险 (Tooling Risks)

**graphify-out/ 内嵌了一份重复的 graphify 缓存：**
- 问题：`my-project-code/demo/shared/graphify-out/cache/` 下存在13个 JSON 缓存文件，这是 graphify 在 raw/docs/demo-0408/ 子目录中意外生成的第二份缓存。与根目录 `graphify-out/cache/`（42个文件）并存，可能导致图谱重建时混入 demo 源文件的局部子图。
- 文件：`my-project-code/demo/shared/graphify-out/`（整个目录）
- 建议：确认这是误生成的副产物后删除，并在 graphify 配置中排除 `raw/docs/demo-0408/` 或将其加入 `.graphifyignore`。

**my-project-wiki/.gitignore 未排除 graphify 缓存和 .DS_Store：**
- 问题：`.gitignore` 当前内容只有3行（`.DS_Store`、`*.tmp`、`.obsidian/workspace*`）。`graphify-out/` 不在 wiki repo 内所以无需忽略，但 `raw/docs/demo-0408/shared/graphify-out/` 在 wiki repo 内且未被忽略，会被意外提交。`.DS_Store` 虽在 gitignore 中，但已有 `my-project-wiki/.git/refs/.DS_Store` 等 .DS_Store 文件存在于 .git 内部（只读区），说明系统层面 .DS_Store 生成未被前置拦截。
- 文件：`my-project-wiki/.gitignore`

**my-project-code/.obsidian/ 被当作代码仓库内容：**
- 问题：`my-project-code/` 下存在 `.obsidian/` 目录（含 graph.json、workspace.json、plugins 等 Obsidian 编辑器配置），说明该目录曾被当作 Obsidian Vault 打开过。这些编辑器配置文件与代码无关，但因为没有 .gitignore（也没有 git），将来初始化 git 时可能被意外提交。
- 文件：`my-project-code/.obsidian/`

---

## 开放问题 / 待确认项 (Open Questions)

以下为当前 wiki 中明确标注 `*（待确认）*` 的未解决事项，按来源整理：

**来自 260323 会议（wiki/sources/260323会议纪要.md:78-83）：**
- 系统角色表正式定义（协助人角色的正式编号和权限边界）
- 元数据表（字段规范）
- 专家评分模板（格式和评分维度）

**来自 260409 会议（wiki/concepts/专家评审规则.md:79）：**
- 专家评审意见采纳规则：大于 50% 通过还是 100% 通过？

**来自 wiki/overview.md:29-32：**
- 各模块具体 UI 原型尚未设计
- 与 OA/财务/资产/招采系统/钉钉的对接接口规范未明确
- 里程碑节点最终版本：产品方案 vs 260323 会议版本存在差异，需统一

**来自 wiki/synthesis/通知矩阵.md：**
- 通知编号60：工作小组成员名单确认流程
- 通知编号107：资产移交清单确认流程

---

## 建议改进（优先级排序）

**P0 — 立即处理（数据安全）：**
1. 在 `my-project-code/` 初始化 git 仓库并提交现有文件
2. 在 `my-project-wiki/` 确认当前工作树状态，提交未提交的 wiki 内容

**P1 — 尽快处理（影响 AI 工作流正确性）：**
3. 修正根 `CLAUDE.md:14` 的 OpenSpec 同步路径（`../my-project/` → `../my-project-code/`）
4. 修正 `my-project-code/CLAUDE.md:53` 的 ui-spec.md 路径（`docs/` → `doce/`）
5. 执行 `/ingest raw/openspec/notification-template/proposal.md` 和 `/ingest raw/openspec/notification-template/design.md`，关闭归档后 wiki 断层

**P2 — 近期处理（知识库完整性）：**
6. 手动读取 `raw/decisions/本科生院-2026年信息化项目需求入库评审结果通知.pdf`，填写空的 .md 文件后执行 ingest
7. 删除 `my-project-code/demo/shared/graphify-out/` 误生成的副缓存
8. 更新 `my-project-wiki/.gitignore`，添加 `raw/docs/demo-0408/shared/graphify-out/`
9. 更新 `wiki/overview.md` 的最后更新日期并补充 2026-04-08 至今的重要变更

**P3 — 计划处理（决策记录补全）：**
10. 为已做决策补录 ADR（`wiki/decisions/`）：至少协助人角色、通知模板功能、专家评审采纳规则
11. 跟进并关闭260323和260409会议的待确认事项
12. 在 `my-project-code/CLAUDE.md` 归档检查清单中增加 `[ ] 已执行 wiki ingest` 条目
13. 在 `my-project-code/` 初始化 git 后，将 `.obsidian/` 加入 `.gitignore`

---

*Concerns audit: 2026-04-12*
