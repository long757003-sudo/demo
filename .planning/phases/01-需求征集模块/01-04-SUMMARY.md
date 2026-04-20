---
phase: 01-需求征集模块
plan: "04"
subsystem: demo-0408 / demand-sort（DEM-04）+ demand-approve（DEM-05）
tags: [demand-sort, demand-approve, lifecycle-bar, vanilla-js, T4]
dependency_graph:
  requires:
    - Plan 01（DATA.demandUsers 数据层，含 unit-sysadmin/unit-leader 角色）
    - Plan 03（DATA.demands 记录，含 sortOrder/status/unitId 字段）
  provides:
    - demand-sort 视图（D-13 上移/下移排序，提交单位领导审批）
    - demand-approve 视图（D-14 T4 详情页：进度条+排序区块+审批面板+操作记录Tab）
    - _dsGetList/_dsMove/_dsSave/_dsSubmitForApproval/_dsConfirmSubmit（5个 _ds* 函数）
    - _renderLifecycleBar/_daSwitchTab/_daGetList/_daMove/_daToggleNeedNext/_daApprove/_daReject/_daRenderContent/_daRenderLogs（9个 _da* 函数）
    - nav.js 新增 demand-sort(unit-admin)/demand-approve(unit-leader)/demand-select(info-admin/info-leader) 菜单入口
  affects:
    - Plan 05（demand-select 遴选视图读取 unit-approved 状态需求）
tech_stack:
  added: []
  patterns:
    - 纯 Vanilla JS 上下移按钮排序（D-13 禁止拖拽库）
    - window._daTab / window._daNeedNext 全局状态跨渲染周期持久化
    - T4 详情页模板（Tabs + 生命周期进度条 + 内容区块）
    - <style> 标签内嵌样式定义 .lifecycle-bar 等 CSS 类（非内联 style="" 属性）
key_files:
  created: []
  modified:
    - my-project-code/demo/shared/views/demand.js
    - my-project-code/demo/shared/nav.js
decisions:
  - "demand-sort 入口检查兼容 unit-sysadmin 和 unit-admin，因 DATA.roles 使用 unit-admin 作为角色 ID"
  - "_renderLifecycleBar 生命周期进度条样式通过 demand-approve 视图头部 <style> 标签注入（非 style.css 修改）"
  - "nav.js 新增 demand-sort/demand-approve/demand-select 直接菜单入口，替代原通过 demand-list 跳转的隐式路径"
metrics:
  duration: "~20 分钟"
  completed: "2026-04-13"
  tasks_completed: 2
  files_modified: 2
---

# Phase 01 Plan 04: demand-sort 改造 + demand-approve 新建 Summary

**一句话：** 改造 demand-sort 为纯排序视图（移除 isLeader 分支，修复 unit-admin 角色检查），新建 demand-approve T4 详情页（生命周期进度条 + 内嵌排序区块 + 审批面板 + 操作记录Tab），完成 DEM-04/DEM-05 闭环。

---

## Tasks Completed

| # | Task | Commit | Files |
|---|------|--------|-------|
| 1 | 改造 demand-sort 纯排序视图（DEM-04/D-13）+ 修复 unit-admin 角色检查 + nav 入口 | 2ddcd7a | demand.js, nav.js |
| 2 | 新建 demand-approve T4 审批详情页（DEM-05/D-14）— 内容已在 Task 1 commit 中（预实现） | 2ddcd7a | demand.js |

---

## demand-sort 改造详情（D-13）

**视图入口行号：** line 1717（demand.js）

**角色检查（修复）：**
```javascript
var role = getCurrentRole();
if (role !== 'unit-sysadmin' && role !== 'unit-admin') { ... }
```
- 兼容 DATA.roles 中实际角色 ID `unit-admin`（单位系统管理员）

**核心函数清单（5个）：**

| 函数 | 位置 | 说明 |
|------|------|------|
| `_dsGetList()` | line ~1673 | 按 unit-sysadmin 角色的 unitId 筛 submitted 需求，按 sortOrder 排序 |
| `_dsMove(id, dir)` | line ~1683 | 交换相邻条目 sortOrder，越界检查后 re-render |
| `_dsSave()` | line ~1694 | logOperation + toast 保存确认 |
| `_dsSubmitForApproval()` | line ~1699 | 空列表校验 + showModal 二次确认 |
| `_dsConfirmSubmit()` | line ~1708 | 批量改 status→unit-pending + closeModal + toast + re-render |

**视图 HTML 要素：**
- `breadcrumb('需求征集','需求排序')`
- 摘要卡片（需求数/合计预算/征集截止）
- data-table（序号/项目名称/负责人/预算+类型/摘要/操作）
- 操作列：↑/↓ 按钮，首行↑ disabled，末行↓ disabled
- 底部：「保存排序」+「提交单位领导审批」

---

## demand-approve 新建详情（D-14）

**视图注册位置：** line 2255（demand.js）

**T4 四要素清单：**

| 要素 | 实现方式 |
|------|----------|
| 生命周期进度条 | `_renderLifecycleBar('需求征集')` — 6阶段 flex 横排，当前阶段高亮 |
| 需求排序内嵌区块 | `_daRenderContent(list)` — data-table + ↑/↓ 按钮（`_daMove`） |
| 审批意见面板 | `#da-comment` textarea（必填）+ `#da-need-next` 开关（D-12 默认开启）+ 审批通过/退回按钮 |
| 操作记录 Tab | `_daSwitchTab('logs')` → `_daRenderLogs()` — 过滤 demand-sort/demand-approve/demand-fill 模块日志 |

**核心函数清单（9个）：**

| 函数 | 说明 |
|------|------|
| `_renderLifecycleBar(stage)` | 生成 6阶段进度条 HTML，done/current/pending 三态 |
| `_daSwitchTab(tab)` | 切换审批内容/操作记录 Tab，window._daTab 持久化 |
| `_daGetList()` | 筛 unit-pending 状态的本单位需求 |
| `_daMove(id, dir)` | 领导可在审批页调整排序，同 _dsMove 逻辑 |
| `_daToggleNeedNext()` | 控制 D-12 下一级审批开关，re-render |
| `_daApprove()` | 非空校验 → 批量改 status→unit-approved → logOperation → toast |
| `_daReject()` | showReturnDialog → 批量改 status→unit-rejected → logOperation → toast |
| `_daRenderContent(list)` | 渲染排序区块 + 审批面板 |
| `_daRenderLogs()` | 渲染操作记录表格 |

**生命周期进度条样式实现：**
- 方式：demand-approve 视图字符串开头注入 `<style>` 标签（内嵌视图样式，非 HTML 内联 style="" 属性）
- 定义类：`.lifecycle-bar`（flex 横排）、`.lifecycle-stage.done`（绿色）、`.lifecycle-stage.current`（蓝色高亮+阴影）、`.lifecycle-stage.pending`（灰色）、`.lifecycle-line.done`（绿色连接线）

---

## Nav 入口新增

| 视图 | 标签 | 角色 |
|------|------|------|
| demand-sort | 需求排序 | unit-admin |
| demand-approve | 需求审批 | unit-leader |
| demand-select | 需求遴选 | info-admin, info-leader |

---

## Plan 05 下游接口

- **unit-approved 状态的需求**将在 demand-select 视图作为遴选候选（`in-selection`/`supported`/`not-supported` 流转）
- `DATA.demands[x].unitLeaderComment` 字段由 _daApprove/_daReject 写入，可在需求详情中展示
- `DATA.demands[x].sortOrder` 经领导调整后持久化，demand-select 视图可按此排序展示

---

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] demand-sort 角色检查与 DATA.roles 实际 ID 不匹配**
- **Found during:** Task 1 — 发现 DATA.roles 中单位系统管理员角色 ID 为 `unit-admin`，而 demand-sort 视图仅检查 `'unit-sysadmin'`
- **Issue:** 用户切换到「单位系统管理员」（role ID: unit-admin）时，demand-sort 始终显示"请切换到单位系统管理员角色"，无法进入视图
- **Fix:** 将角色检查改为 `role !== 'unit-sysadmin' && role !== 'unit-admin'`，兼容两种 ID
- **Files modified:** demand.js
- **Commit:** 2ddcd7a

**2. [Rule 2 - Missing Critical Functionality] demand-sort/demand-approve 无 Nav 菜单入口**
- **Found during:** Task 1 — 检查 nav.js 发现两个视图均无直接导航入口，用户无法从侧边栏访问
- **Issue:** 演示时用户无法通过角色切换后直接点击菜单进入视图，Demo 流程不通
- **Fix:** nav.js 需求管理分组新增 demand-sort(unit-admin)/demand-approve(unit-leader)/demand-select(info-admin,info-leader) 三条菜单入口；同步清理 parentMap 中 demand-sort/demand-select 的冗余父映射
- **Files modified:** nav.js
- **Commit:** 2ddcd7a

---

## Known Stubs

- `_daNeedNext` 下一级审批人 select 仅有「林已杰 20054379（信息办管理员）」一个 Demo 选项，Plan 05/06 可扩充真实可选人员列表

---

## Threat Flags

无新增安全面——所有改动均在既有 demo-0408 框架内，未引入新的网络端点、文件访问路径或认证路径。T-04-01 至 T-04-06 威胁已按计划缓解：
- T-04-01：render 入口角色检查（兼容 unit-admin/unit-sysadmin / unit-leader）
- T-04-02：_daApprove 非空校验
- T-04-03：_dsMove/_daMove 越界检查
- T-04-04：approve/reject 均调用 logOperation
- T-04-05：Demo 级 XSS 接受（Plan 03 summary/name 已 maxlength 限制）
- T-04-06：unitId fallback 'unit-edu' 接受（Demo 级）

---

## Self-Check: PASSED

| Check | Result |
|-------|--------|
| my-project-code/demo/shared/views/demand.js | FOUND |
| my-project-code/demo/shared/nav.js | FOUND |
| _dsGetList/_dsMove/_dsSave/_dsSubmitForApproval/_dsConfirmSubmit（5函数，15 matches） | FOUND |
| demand-sort 无 isLeader（0 matches） | FOUND |
| demand-sort 无 draggable（0 matches） | FOUND |
| demand-sort 无 Sortable（0 matches） | FOUND |
| onclick _dsMove 出现 2 次 | FOUND |
| registerView('demand-approve') | FOUND (line 2255) |
| _daApprove/_daReject/_daMove/_daSwitchTab/_daToggleNeedNext/_renderLifecycleBar（14 matches） | FOUND |
| da-comment（2 matches）| FOUND |
| da-need-next（2 matches）| FOUND |
| 请填写审批意见（2 matches，含校验和 placeholder）| FOUND |
| unit-approved（10 matches）| FOUND |
| unit-rejected（5 matches）| FOUND |
| _daRenderLogs / 操作记录（4 matches）| FOUND |
| 生命周期6阶段 ['需求征集','立项论证','采购','实施','验收','运维'] | FOUND |
| nav.js demand-sort/demand-approve/demand-select 菜单入口 | FOUND |
| commit 2ddcd7a (Task 1+2) | FOUND |
