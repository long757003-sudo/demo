---
phase: 01-需求征集模块
plan: "01"
subsystem: demo-0408 / 需求管理数据层 + 标签库视图
tags: [data-layer, tag-library, demo, vanilla-js]
dependency_graph:
  requires: []
  provides:
    - DATA.tagLibrary（25条预设标签，4类目）
    - DATA.demandUsers（10条演示用户，含3个核心账号）
    - roleDisplayName 返回演示真实姓名
    - tag-library 视图（registerView + CRUD）
    - nav.js 菜单入口（info-admin / unit-admin）
  affects:
    - Plan 02-05（需求申请表标签选择字段依赖 DATA.tagLibrary）
    - Plan 02（指派/选人组件依赖 DATA.demandUsers）
    - 所有视图 logOperation（roleDisplayName 修正影响操作日志显示名）
tech_stack:
  added: []
  patterns:
    - 纯 Vanilla JS registerView 模式
    - DATA.xxx 全局对象追加赋值（IIFE 外直接挂载）
    - XSS 基础过滤：name.replace(/[<>"]/g,'') 在拼接 HTML 前执行
key_files:
  created: []
  modified:
    - my-project-code/demo/shared/data.js
    - my-project-code/demo/shared/core.js
    - my-project-code/demo/shared/views/demand.js
    - my-project-code/demo/shared/nav.js
decisions:
  - "tagLibrary 和 demandUsers 作为 DATA 对象的属性内联在 data.js，维持全局赋值风格，不新建文件"
  - "roleDisplayName 映射在 core.js 修改（函数定义在 core.js），而非 data.js"
  - "标签库菜单入口使用 role: unit-admin（对应 nav.js 已有角色 id），覆盖 unit-sysadmin 功能"
  - "XSS 基础过滤（T-01-03 mitigate）在 _tlOpenEdit/_tlSubmitCreate/_tlSubmitEdit 中 replace /[<>\"]/g"
metrics:
  duration: "~25 分钟"
  completed: "2026-04-13"
  tasks_completed: 2
  files_modified: 4
---

# Phase 01 Plan 01: 数据基础层 + 标签库视图 Summary

**一句话：** 在 data.js 中注入 DATA.tagLibrary（25条/4类目）和 DATA.demandUsers（10条含真实演示账号），修正 core.js roleDisplayName 映射，并在 demand.js 实现完整可交互的 tag-library CRUD 视图，通过 nav.js 菜单向 info-admin/unit-admin 开放入口。

---

## Tasks Completed

| # | Task | Commit | Files |
|---|------|--------|-------|
| 1 | 扩展 data.js — tagLibrary / demandUsers / roleDisplayName | 6bf0ed0 | data.js, core.js |
| 2 | 新建 tag-library 视图（D-09）+ 菜单入口 | 88a9146 | demand.js, nav.js |

---

## DATA.tagLibrary 详情

- **总条目：** 25 条（均为内置标签，builtin: true）
- **业务领域：** 8 条（教学管理、科研管理、学生事务、行政办公、财务管理、人事管理、招生就业、图书档案）
- **技术类型：** 8 条（数据分析、移动端、集成接口、报表统计、AI/智能化、云部署、安全合规、数据治理）
- **建设类型：** 5 条（全新建设、功能扩展、系统替换、接口改造、升级改造）
- **项目规模：** 4 条（微型/小型/中型/重大，含金额区间说明）

---

## DATA.demandUsers 详情

- **总条目：** 10 条
- **三个核心演示账号（260409 会议确认）：**
  - 唐明 / empNo: 20053964 / roles: info-leader, unit-leader
  - 林已杰 / empNo: 20054379 / roles: info-admin, unit-sysadmin
  - 王一凡 / empNo: 50240014 / roles: project-manager
- **其他 Mock 用户：** 7 条（u-m01~u-m07），覆盖 project-manager、unit-sysadmin、unit-leader 角色，供选人组件筛选

---

## roleDisplayName 修正

| 角色 ID | 修改前 | 修改后 |
|---------|--------|--------|
| info-leader | 王主任 | 唐明 |
| unit-leader | 陈副处长 | 唐明 |
| info-admin | 张华 | 林已杰 |
| unit-admin | 刘管理员 | 林已杰 |
| unit-sysadmin | （无） | 林已杰（新增） |
| project-manager | 李明 | 王一凡 |

---

## tag-library 视图实现要点

- **注册：** `registerView('tag-library', function() { ... })` 追加在 demand.js 末尾
- **筛选：** `window._tlCatFilter`（类目）+ `window._tlKw`（关键词），onchange/oninput 实时重渲染
- **表格列：** 序号 / 类目 / 标签名 / 类型（内置tag-blue/自定义tag-green）/ 创建时间 / 操作
- **内置标签：** 删除按钮 disabled + title 提示，编辑按钮可用
- **CRUD 函数清单：** `_tlRender`, `_tlOpenCreate`, `_tlSubmitCreate`, `_tlOpenEdit`, `_tlSubmitEdit`, `_tlDelete`, `_tlConfirmDelete`（7个）
- **操作日志：** 每个写操作均调用 `logOperation('tag-library', action, ...)` 写入 DATA.operationLogs
- **XSS 缓解（T-01-03）：** 标签名在新增/编辑时 trim + `.replace(/[<>"]/g,'')` 过滤后再拼入 HTML

---

## 菜单注入位置

- **文件：** `my-project-code/demo/shared/nav.js`
- **分组：** 「系统管理」组，追加在 audit-log 之后
- **角色：** `roles: ['info-admin', 'unit-admin']`（对应信息办管理员和单位系统管理员）

---

## DATA.demands 状态覆盖

现在 demands 数组覆盖全部8种状态：
`draft` / `submitted` / `sorted` / `unit-approved` / `unit-rejected` / `in-selection` / `supported` / `not-supported`（新增 D014）

---

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] nav.js 菜单角色与计划描述差异**
- **Found during:** Task 2
- **Issue:** 计划描述菜单对 `info-admin`、`unit-sysadmin` 显示，但 nav.js 已有角色 ID 为 `unit-admin`（不是 `unit-sysadmin`）
- **Fix:** 使用 `unit-admin`（nav.js 中对应「用户单位系统管理员」的既有 ID），与现有 NAV_GROUPS 角色体系一致
- **Files modified:** nav.js
- **Commit:** 88a9146

---

## Known Stubs

无——DATA.tagLibrary 已完整注入，tag-library 视图直接从 DATA.tagLibrary 读取渲染，无占位符数据。

---

## Threat Flags

无新增安全面——所有改动均在既有 demo-0408 框架内；tag-library 视图未引入新的网络端点、文件访问路径或认证路径。

---

## Downstream Dependencies

以下 Plan 02-05 依赖本 Plan 提供的数据基础：
- **Plan 02（需求申请表）：** 标签选择字段从 `DATA.tagLibrary` 取数（按类目分组 `<select>` 或多选组件）
- **Plan 02（指派填报人）：** 选人组件从 `DATA.demandUsers` 筛选，展示「姓名 工号」（D-10）
- **Plan 03-05（各视图操作日志）：** `roleDisplayName` 现在返回演示真实姓名，所有视图的 logOperation 受益

---

## Self-Check: PASSED

| Check | Result |
|-------|--------|
| my-project-code/demo/shared/data.js | FOUND |
| my-project-code/demo/shared/core.js | FOUND |
| my-project-code/demo/shared/views/demand.js | FOUND |
| my-project-code/demo/shared/nav.js | FOUND |
| commit 6bf0ed0 (Task 1) | FOUND |
| commit 88a9146 (Task 2) | FOUND |
