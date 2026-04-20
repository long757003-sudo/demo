---
change: project-overview
title: 新增【项目全景】顶级菜单 — 施工单
status: proposed
---

# Tasks：项目全景模块

> 控制在 15 项以内。每项完成后自检（浏览器点一遍）再勾选。
> 本版 14 项：T9 块 1 已合并入块 1+2 聚合任务，释放一项预算；看板视图形态改为表格列表（非卡片）。

## 待办任务

- [x] **T1** `wiki/glossary.md`：新增「项目全景模块」条目（已在 propose 阶段完成，作为术语前置）
- [ ] **T2** `shared/data.js`：为 `DATA.demands` 补字段 —
  - `tags: string[]`、`attachments: {name,size}[]` 两个**新字段**，所有条目默认 `[]`
  - D001 / D004 / D009 / D018 / D020 五条候选补 `summary` / `tags` / `attachments` 三字段 mock 值（`summary` 若已存在则保留；标签 2–4 个、附件 1–2 个，按 spec §5.1）
- [ ] **T3** `shared/nav.js`：在「运维管理」之后、「系统管理」之前插入「项目全景」分组，含 2 菜单项（roles 按 spec §1）
- [ ] **T4** `demo/index.html` 与 `demo/app.html`：在现有 `shared/views/*.js` 之后追加 `<script src="shared/views/overview.js"></script>`（两个入口 HTML 都要加）
- [ ] **T5** 新建 `shared/views/overview.js`，实现辅助函数 `_ovFilterProjects(list)`（按角色过滤，spec §2）
- [ ] **T6** `overview.js` — `registerView('project-overview-board', …)`：**表格列表**形态 —
  - 标题栏（含统计 + 「导出 CSV」按钮）
  - 过滤栏（单位 / 类型 / 阶段 / 关键字 / 重置，spec §3.1）
  - 10 列表格 DOM + 行渲染（spec §3.2）
  - 阶段徽章与颜色（spec §3.3）
- [ ] **T7** `overview.js` — board 联动逻辑：
  - `_ovBoardRender()` / `_ovBoardFilter()` / `_ovBoardReset()` / `_ovBoardSort(colKey)`（spec §3.2 排序，§3.1 过滤）
  - `_ovExportCSV()` 纯客户端 CSV 导出（spec §3.4）
  - 分页控件与换页逻辑（spec §3.5）
- [ ] **T8** `overview.js` — `registerView('project-overview-detail', …)` 骨架：面包屑 + 基本信息 card + 8 阶段时间线条 + **10 个空聚合块容器**（`#ov-stage-1 … #ov-stage-10`）
- [ ] **T9** detail：实现块 1 **需求征集**（征集名称 / 项目摘要（`demand.summary` 回退链）/ 标签 / 附件 / 基础字段）+ 块 2 **立项论证**（spec §4.3 block 1–2）
- [ ] **T10** detail：实现块 3 **专家评审记录** + 块 4 **合同采购**（spec §4.3）
- [ ] **T11** detail：实现块 5 **项目实施** + 块 6 **延期/变更**（spec §4.3）
- [ ] **T12** detail：实现块 7 **验收** + 块 8 **运维**（spec §4.3）
- [ ] **T13** detail：实现块 9 **终止/完成** + 块 10 **项目日志**（operationLogs 按 targetId 并集 time 升序，spec §4.3 block 10）
- [ ] **T14** detail 收尾：各块默认展开/折叠逻辑（当前阶段块展开，其余折叠；块 10 强制默认折叠）+ 块 1–9 "打开完整视图"跳转（spec §4.4）+ 全链路自检：
  1. 切换 6 授权角色 + expert，验证菜单可见性与 `_ovFilterProjects()` 数据过滤
  2. board 过滤组合 ≥3 组（无过滤 / 按单位 / 按阶段+关键字），验证行数、排序、阶段徽章
  3. 点击"导出 CSV"，用 Excel 打开验证中文不乱码、"进度"列为 `N%`、行数与过滤后一致
  4. 打开 P001 / P002 / P003 / P005（reviewing / implementing / completed / frozen）的 detail，截图验证：10 块聚合渲染、块 1 四新字段、块 10 日志时间线、当前阶段默认展开、块 10 默认折叠
  5. 控制台无 JS 报错；块 1–9 "打开完整视图"跳转全部生效

## 归档前检查清单（Step 4 自检报告在 T14 产出）

- [ ] 6 授权角色各打开 board + detail 一次，截图记录
- [ ] expert 角色菜单中**不**出现「项目全景」分组
- [ ] board 表格支持按任意列排序（默认按"最近更新"降序），导出的 CSV 在 Excel 中文显示正常
- [ ] 任一项目的 detail 打开后，10 块按当前阶段展开/折叠符合预期（块 10 始终默认折叠）
- [ ] 块 1 需求征集展示了**征集名称 / 项目摘要 / 标签 / 附件**四个新字段（至少在 D001 / D018 / D020 对应项目上有非空值）
- [ ] 块 10 项目日志至少在 P001 对应项目上展示了 ≥3 条 `operationLogs` 条目（L001 / L002 / L003 targetId=PR001）
- [ ] "打开完整视图"跳转到原有视图，浏览器控制台无 JS 报错
