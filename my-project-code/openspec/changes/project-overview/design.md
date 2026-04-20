---
change: project-overview
title: 新增【项目全景】顶级菜单 — 设计文档
---

# Design：项目全景模块

## 菜单结构

在 `NAV_GROUPS` 末尾、「系统管理」之前插入新分组：

```
{ label: '项目全景', items: [
  { id: 'project-overview-board',  label: '生命周期看板', icon: 'kanban',
    roles: ['info-admin','info-leader','leadership-office','leadership-group','project-manager','unit-admin'] },
  { id: 'project-overview-detail', label: '项目全景详情', icon: 'telescope',
    roles: ['info-admin','info-leader','leadership-office','leadership-group','project-manager','unit-admin'] },
]}
```

`parentMap` 追加：两个视图互为父子关系时从 board 跳 detail，detail 高亮 detail 自身（已在菜单中显示，无需兜底父级映射）。

## 视图一：生命周期看板（project-overview-board）

> **形态：表格列表**（非卡片看板）。原因：便于排序、导出 CSV、分析处理；用户要求看板定位为"列表页面"。
> 阶段维度通过"当前阶段"列与阶段过滤下拉来表达，而非横向列分桶。

### 页面布局
- 顶部：面包屑 `项目全景 > 生命周期看板`
- 页面标题行：生命周期看板 + 项目总数统计（按角色权限过滤后） + 右上角「导出 CSV」按钮
- 过滤栏（card）：
  - 单位下拉：全部 / 按 DATA.projects.unit 去重
  - 类型下拉：全部 / 重大 / 中型 / 小型 / 微型
  - **阶段下拉：全部 / 9 个阶段**（见下表）
  - 关键字输入：匹配项目编号 / 名称 / 负责人
  - 「重置」按钮
- 主体：**项目列表表格**
  - 表头列（除"操作"外均可点击排序）：项目编号 | 项目名称 | 单位 | 负责人 | 类型 | 预算（万） | 当前阶段 | 进度 | 最近更新 | 操作
  - 行：每个项目一行；行点击整行跳 detail；"操作"列有「查看全景 →」按钮
  - 默认排序：按"最近更新"降序
  - 空态：无匹配行时表内显示"无符合条件的项目"
  - 分页：每页 20 行；总数 ≤20 时隐藏分页控件

### 表格列字段与来源

| 列 | 字段来源 | 样式 |
|----|---------|------|
| 项目编号 | `project.id` | 定宽 80px |
| 项目名称 | `project.name` | 加粗，点击跳 detail |
| 单位 | `project.unit` | — |
| 负责人 | `project.manager` | — |
| 类型 | `project.type` → 重大/中型/小型/微型 | tag 样式 |
| 预算（万） | `project.budget` | 右对齐 |
| 当前阶段 | `project.status` → 阶段名 | 徽章（颜色按阶段类别：运行蓝/完成灰/冻结黄/终止红） |
| 进度 | `project.progress` | mini 进度条 + 百分比 |
| 最近更新 | `max(operationLogs[].time WHERE targetId ∈ {id, demandId, proposalId, contractId})`；若无则 `project.startDate` | 日期格式 `YYYY-MM-DD` |
| 操作 | 「查看全景 →」按钮 | 链接样式 |

### 阶段枚举（用于"当前阶段"列与阶段过滤下拉）

| `status` | 阶段名 | 颜色类别 |
|----------|-------|---------|
| `demand` | 需求征集 | 运行-蓝 |
| `reviewing` | 立项论证 | 运行-蓝 |
| `procurement` | 采购中 | 运行-蓝 |
| `implementing` | 实施中 | 运行-蓝 |
| `acceptance` | 验收中 | 运行-蓝 |
| `ops` | 运维中 | 运行-蓝 |
| `completed` | 已完成 | 完成-灰 |
| `frozen` | 冻结 | 异常-黄 |
| `terminated` | 已终止 | 终止-红 |

### 导出 CSV
- 触发：页面标题右侧「导出 CSV」按钮
- 范围：当前过滤后的全部行（忽略分页，不仅导出当前页）
- 列：与表格列一致；"进度"写为 `85%` 字符串；"当前阶段"写为阶段名文字；"操作"列不导出
- 编码：UTF-8 with BOM（Excel 中文兼容）
- 文件名：`项目全景_{YYYYMMDD_HHmm}.csv`
- 实现：Blob + `URL.createObjectURL` + `<a download>`，纯客户端

### 数据来源与渲染管线
`DATA.projects` 全量 → `_ovFilterProjects()` 角色过滤 → 应用过滤栏条件 → 排序 → 分页 → 渲染行。

## 视图二：项目全景详情（project-overview-detail）

### 页面布局
- 顶部：面包屑 `项目全景 > 生命周期看板 > {项目名}`（无 params.id 时默认取角色可见项目的第一条）
- 项目基本信息 card：项目编号、名称、单位、负责人、预算、类型、进度、当前阶段徽章
- 8 阶段时间线条（复用 `project-detail` 的 `lcPhases` 样式，但仅显示、不做点击态）
- **阶段聚合块序列**（共 10 块：9 个阶段块 + 1 个跨阶段日志块，每块为一个 card，按阶段顺序排布，可折叠；当前阶段块默认展开，其余默认折叠；块 10 日志块默认折叠）：

| 块序 | 块名 | 数据源 | 关键字段 |
|------|------|--------|---------|
| 1 | 需求征集 | `DATA.demands` where `id === project.demandId`，关联 `DATA.collectionPlans` where `id === demand.collectionId` | **征集名称**（`collectionPlan.title`）、**项目摘要**（`demand.background` 回退 `project.background`）、**标签**（`demand.tags[]`，本变更新增字段）、**附件**（`demand.attachments[]`，本变更新增字段）、申报单位、填报人、预算估算、排序、申报状态、驳回/支持结论 |
| 2 | 立项论证 | `DATA.proposals` where `id === project.proposalId` | 申报书状态流转、建设目标、技术方案、审定决策、经费核定 |
| 3 | 专家评审记录 | `DATA.reviews` where `projectId === project.id` 或 `demandId === project.demandId` | 全部评审轮次（按 date 升序）：触发场景、专家清单、加权分、最终结论、退回修改要求 |
| 4 | 合同采购 | `DATA.contracts` where `projectId === project.id` | 供应商、金额、签订日期、付款节点与状态 |
| 5 | 项目实施 | `DATA.projects.progress` + `DATA.progressHistory` where `projectId === project.id` | 最新进度百分比、分期进展历史（按 period 倒序） |
| 6 | 延期/变更 | `DATA.operationLogs` where `targetId === project.proposalId/id` 且 `module === '立项管理' / 'delay-change'` （首版仅聚合；若发现字段缺口在 spec.md 记录） | 变更时间、操作人、变更说明 |
| 7 | 验收 | `DATA.acceptances` where `projectId === project.id` | 初验日期、试运行起止、试运行月数、正式验收状态与日期、验收结论 |
| 8 | 运维 | `DATA.opsRecords` + `DATA.faultTickets` where `projectId === project.id` | 运维记录（类型/操作人/内容/状态）、故障工单（级别/状态/处理结果） |
| 9 | 终止/完成 | `project.status === 'terminated'` / `'completed'` / `'frozen'`；若终止读 `project.frozenReason / frozenUntil` | 终止/冻结原因、冻结期限、完成归档时间 |
| 10 | 项目日志 | `DATA.operationLogs` where `targetId ∈ {project.id, project.demandId, project.proposalId, project.contractId}`，按 `time` 升序 | 完整操作时间线：时间、操作人、角色、模块、动作、目标名称、明细、字段变更对比（changes 数组），从项目创建起所有条目 |

### 通用块交互
- 每块顶部：块名 + 展开/收起图标 + "打开完整视图 →" 链接（跳原有功能菜单的对应详情，只读用）
  - 例：需求来源块 → `navigate('demand-detail', {id: demandId})`
  - 例：立项论证块 → `navigate('proposal-fill', {id: proposalId, readonly: true})`（若原视图不支持 readonly 参数，在 spec.md 标注但首版仍然跳转，不强改原视图）
- 块内数据为空时：显示"本阶段暂无记录"占位，不隐藏整块（保持时间线完整性，让"未进入"/"已跳过"一目了然）

### 不做的事（再次强调）
- 块内无任何提交/审批/修改按钮
- 不做阶段停留时长计算
- 不做跨项目趋势图

## 权限过滤

统一在视图入口处调用辅助函数 `_ovFilterProjects(list)`：

```js
function _ovFilterProjects(list) {
  var role = getCurrentRole();
  var me = DATA.currentUser || {};
  if (['info-admin','info-leader','leadership-office','leadership-group'].indexOf(role) >= 0) return list;
  if (role === 'project-manager') return list.filter(p => p.manager === me.name);
  if (role === 'unit-admin')      return list.filter(p => p.unit === me.unit);
  return []; // 未授权角色
}
```

菜单层面已由 `roles` 字段挡住专家等无权角色；此函数是第二层防线，同时覆盖"通过 URL 直接输入 viewId 访问"的场景。

## 视图注册

- 文件：**新建** `shared/views/overview.js`
- 注册 2 个 view：`registerView('project-overview-board', …)`、`registerView('project-overview-detail', …)`
- 在 `demo/index.html` 的 `<script>` 清单末尾追加（位置在其他 `shared/views/*.js` 之后）：
  ```html
  <script src="shared/views/overview.js"></script>
  ```

## 修改文件清单

| 文件 | 变更 |
|------|------|
| `shared/data.js` | `DATA.demands[*]` 补 `tags: string[]`、`attachments: {name, size}[]` 两字段；为 3–5 条代表性 demand 填 mock 值，其余默认空数组 |
| `shared/nav.js` | 追加「项目全景」分组及 2 菜单项 |
| `shared/views/overview.js` | **新建**，实现 2 个视图与辅助函数 |
| `demo/index.html` | 追加 `<script>` 标签 |
| `my-project-wiki/wiki/glossary.md` | 已完成：新增「项目全景模块」条目 |

不动：`shared/core.js`、`shared/style.css`（若样式有缺口，以内联 style 解决，不污染全局）、现有任何 `shared/views/*.js` 视图文件、`DATA.projects/proposals/reviews/contracts/acceptances/opsRecords/faultTickets/...` 其它数组的字段结构。
