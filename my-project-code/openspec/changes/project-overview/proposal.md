---
change: project-overview
title: 新增【项目全景】顶级菜单 — 全生命周期纵向追溯
type: feature
status: proposed
created: 2026-04-20
---

# Proposal：新增【项目全景】顶级菜单

## 为什么做

现有菜单（需求管理 / 项目管理 / 运维管理 …）是**按"谁来做"组织**的：每个角色只看到自己那段工作队列，同一个项目的完整来龙去脉被切碎在 `demand-list`、`proposal-list`、`project-list`、`review-list`、`acceptance-list`、`ops-records`、`terminate` 等 10+ 个菜单项下。

这带来两个实际问题：

1. **信息办/领导无法纵览**：当领导问"P002 现在卡在哪、当初立项为什么批这个金额、评审意见是什么、合同付款到哪一步、运维有没有重大故障"，需要在 6+ 个菜单间来回跳转并自行拼接。
2. **全生命周期管理理念落空**：项目章程强调"从需求创建到验收上线进入运维阶段，再到项目终止下线"的完整链条，但 UI 没有一个单独的功能区能完整承载这条链。

`project-detail` 虽然已有 8 阶段生命周期进度条（`shared/views/project.js:148`），但定位是"项目管理操作面板"（含采购/进展/延期/终止按钮），不是纵向追溯视图，且入口仅在"项目列表"里。

## 需求边界

**做什么：**
- 在侧边栏新增顶级菜单分组「项目全景」，包含 2 个视图入口：
  - **项目生命周期看板**（`project-overview-board`）：跨项目、按阶段横切的卡片看板，一眼看出所有项目分别卡在哪个阶段。
  - **项目全景详情**（`project-overview-detail`）：以单个项目为主语、按阶段纵向铺开时间线，每个阶段聚合其所有关联信息并提供跳转到原有详情视图的只读入口。
- 仅向下列角色可见：`info-admin`、`info-leader`、`leadership-office`、`leadership-group`、`project-manager`、`unit-admin`（专家不可见）。
- 数据范围按角色收敛：
  - `leadership-*` / `info-*` → 全量项目
  - `project-manager` → `manager === currentUser.name` 的项目
  - `unit-admin` → `unit === currentUser.unit` 的项目
- 所有数据来自 `DATA.projects` 为中心的跨表聚合（demands / proposals / reviews / contracts / acceptances / opsRecords / faultTickets / progressHistory 等）。

**不做什么：**
- 不新增任何业务操作入口（不改状态、不提交表单、不审批）——全景模块纯只读，保留给原有功能模块。
- 不修改现有 `project-detail`（其"管理操作面板"定位不变，避免伤及稳定路径）。
- 不引入新的 `DATA` 顶层数组；仅给 `DATA.demands` 补 **两个新字段**（`tags: string[]`、`attachments: {name, size}[]`）并为 3–5 条代表性 demand 填 mock 值，其余条目默认空数组。此范围改动在 spec §5 显式记录。
- 不做跨阶段停留时长统计、预警、趋势图等高级分析——首版聚焦"看得见全链条"，分析能力留给后续变更。
- 不涉及后端/持久化——Demo 阶段数据均为 `window.DATA` 静态 mock。

## 影响面

| 文件 | 变更性质 |
|------|---------|
| `shared/data.js` | 给 `DATA.demands[*]` 补 `tags`、`attachments` 两个字段；为 3–5 条代表性 demand 填 mock 值 |
| `shared/nav.js` | 追加「项目全景」分组及 2 个菜单项；parentMap 追加相关映射 |
| `shared/views/overview.js` | **新建**，注册 2 个视图 |
| `demo/index.html` | 追加 `<script src="shared/views/overview.js"></script>` |
| `my-project-wiki/wiki/glossary.md` | 已同步新增「项目全景模块」条目（术语权威源规则） |

不动：现有任何 `shared/views/*.js`、现有任何 HTML 页面、`DATA.projects/proposals/reviews/contracts/acceptances/...` 其它数组的字段。
