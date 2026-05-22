---
phase: 01-需求征集模块
plan: "02"
subsystem: demo-0408 / collection-create 视图 + notification-create 预填
tags: [collection-create, demand-form, navigation, prefill, vanilla-js]
dependency_graph:
  requires:
    - Plan 01（DATA.demandUsers、roleDisplayName、DATA.collectionPlans 数据层）
  provides:
    - collection-create 视图（单页表单，含 D-03 流程开关）
    - _ccSubmitAndJump（DEM-01 提交跳转逻辑）
    - DATA.collectionPlans.unshift（新征集方案写入）
    - notification-create prefill 读取（按单位预勾选 + 标题预填）
  affects:
    - Plan 03+（征集方案已写入 DATA.collectionPlans，下游视图可读取）
    - notification-create 视图（新增 prefill 参数处理逻辑）
tech_stack:
  added: []
  patterns:
    - 纯 Vanilla JS registerView 单页表单（替代原 4 步向导）
    - loadDraft 草稿预加载（在 render 函数内直接填入 value 属性）
    - navigate + prefill 对象跨视图参数传递
    - getViewParams + 内联 script IIFE 读取 prefill 并操作 DOM
key_files:
  created: []
  modified:
    - my-project-code/demo/shared/views/demand.js
    - my-project-code/demo/shared/views/notification.js
decisions:
  - "单页表单替代 4 步向导：符合 D-03 要求，流程开关直接内嵌在征集表单中"
  - "loadDraft 在 render 函数内同步读取并填入 value 属性，无需 setTimeout，更可靠"
  - "notification.js prefill 通过内联 script IIFE 读取，与既有 typeKey 自动选类型逻辑并列执行"
  - "发送方式默认选中「系统+钉钉」（system+dd），与征集场景最常用模式匹配"
metrics:
  duration: "~30 分钟"
  completed: "2026-04-13"
  tasks_completed: 2
  files_modified: 2
---

# Phase 01 Plan 02: collection-create 视图改造 + DEM-01 提交跳转 Summary

**一句话：** 将 collection-create 从 4 步向导改造为符合 UI-SPEC 视图 A 的单页表单，内嵌 D-03 流程开关，实现 _ccSubmitAndJump 写入 DATA.collectionPlans 并 navigate 至 notification-create 预填标题/接收单位/联系人，完成 DEM-01 闭环。

---

## Tasks Completed

| # | Task | Commit | Files |
|---|------|--------|-------|
| 1 | 改造 collection-create 视图字段清单 + 流程开关 | f4511ad | demand.js |
| 2 | 实现 _ccSubmitAndJump 提交 + 跳转 notification-create 预填 | 50108d7 | demand.js, notification.js |

---

## collection-create 视图字段清单

| 字段 ID | 类型 | 必填 | 说明 |
|---------|------|------|------|
| `cc-title` | `input[text]` maxlength=60 | 是 | 征集批次标题，有 tooltip |
| `cc-desc` | `textarea` rows=3 | 否 | 征集说明 |
| `cc-start` | `input[date]` | 是 | 开始日期 |
| `cc-end` | `input[date]` | 是 | 截止日期，有 tooltip（D-04 说明） |
| `cc-file` | `input[file]` | 否 | 附件上传（Demo 占位） |
| `cc-units` | `div` 包裹 8 个 checkbox | 是（至少1项） | 通知接收单位，有 tooltip |
| `cc-contact` | `input[text]` | 否 | 通知联系人，默认 roleDisplayName 或「林已杰 20054379」 |
| `cc-send-mode` | radio group（3选1） | 是 | 系统消息/系统+钉钉/系统+钉钉+短信，默认选中「系统+钉钉」 |
| `cc-flow-sort` | checkbox | — | 单位排序环节，默认 checked |
| `cc-flow-approve` | checkbox | — | 单位领导审批环节，默认 checked |
| `cc-flow-expert` | checkbox | — | 专家评审环节（Phase 3 后启用），有 tooltip |
| `cc-flow-notify` | checkbox | — | 遴选结果通知，默认 checked |

**8 个接收单位：** 教务处 / 招生处 / 科研处 / 学工处 / 党政办 / 图书馆 / 信息化办 / 资产处

**tooltip 字段：** cc-title（「建议格式」）、cc-end（「Demo 不做时间锁定」）、cc-units（「向所选单位系统管理员发送通知」）、cc-flow-expert（「Phase 3 实现」）

---

## _cc* 函数清单和行号

| 函数 | 行号 | 说明 |
|------|------|------|
| `_ccCollectFormData()` | 599 | 读取所有表单字段，返回 data 对象 |
| `_ccSaveDraft()` | 619 | saveDraft + toast('草稿已保存', 'success') |
| `_ccValidate(data)` | 625 | 校验标题/日期/单位/发送方式，返回 bool |
| `_ccSubmitAndJump()` | 635 | 收集→校验→写入 DATA.collectionPlans→navigate 预填 |

所有函数均挂载到 `window.*` 供 onclick 调用。

---

## notification-create prefill 字段名（已确认）

从 `_ccSubmitAndJump` 传出的 prefill 对象结构：

```javascript
{
  title:        plan.year + '年度信息化项目需求征集通知',  // 预填通知标题
  type:         'collection-notice',                       // 自动选中通知类型
  recipients:   plan.units,                               // 接收单位数组（按单位模式预勾选）
  contact:      plan.contact,                             // 联系人（填入 person input placeholder）
  sourcePlanId: plan.id                                   // Demo 可追溯字段
}
```

notification.js 内联 script 读取方式：`getViewParams('notification-create').prefill`

读取后：
- `pf.type` → `_selectNotifType(pf.type)` 自动选类型卡片并填入模板
- `pf.title` → `document.getElementById('notif-title').value = pf.title`
- `pf.recipients` → 切换至「按单位」模式，逐一勾选匹配的 checkbox
- `pf.contact` → 填入 `rcpt-person-input` 的 placeholder（作为联系人提示）

**供 Plan 06+ 参考：** prefill 字段名为 `title / type / recipients / contact / sourcePlanId`，无需重新 read_first notification.js。

---

## DATA.collectionPlans 新增记录字段结构

```javascript
{
  id:        'cp-' + Date.now(),           // 唯一 ID
  year:      2026,                          // 从 startDate 年份提取
  title:     '2026年信息化项目需求征集',   // 用户填写
  desc:      '...',                         // 征集说明（选填）
  startDate: '2026-04-15',
  endDate:   '2026-05-15',
  units:     ['教务处', '招生处', ...],    // 勾选的接收单位数组
  contact:   '林已杰 20054379',
  sendMode:  'system+dd',
  flow: {
    sort:    true,
    approve: true,
    expert:  false,
    notify:  true
  },
  status:    '征集中',
  createdBy: '林已杰',                     // roleDisplayName(getCurrentRole())
  createdAt: '2026-04-13'
}
```

---

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical Functionality] notification.js 缺少 prefill 读取逻辑**
- **Found during:** Task 2
- **Issue:** 计划要求「跳转至 notification-create 视图且字段已预填征集批次信息」，但 notification.js 的 notification-create 视图中完全没有读取 prefill 参数的代码（grep 确认 0 个匹配）。若不添加，navigate + prefill 传参后表单字段保持空白，DEM-01 的「预填」要求无法满足
- **Fix:** 在 notification.js 的内联 script IIFE 中，紧随现有 typeKey 处理逻辑后，追加 prefill 读取分支：自动选类型、填标题、切换为按单位模式并勾选 recipients 对应 checkbox、联系人填入 placeholder
- **Files modified:** my-project-code/demo/shared/views/notification.js
- **Commit:** 50108d7

---

## Known Stubs

- `cc-flow-expert` checkbox：专家评审开关展示即可，Phase 3 实现实际联通；data-tip 中已注明「当前仅展示开关占位」
- notification.js 联系人预填：写入 `rcpt-person-input` 的 `placeholder` 而非 `value`，因该输入框主要用于搜索人员（与 contact 字段语义不完全匹配）；按需在 Plan 06 中精细化

---

## Threat Flags

无新增安全面——所有改动均在既有 demo-0408 框架内；collection-create 视图未引入新的网络端点、文件访问路径或认证路径。

---

## Self-Check: PASSED

| Check | Result |
|-------|--------|
| registerView('collection-create') 存在 | FOUND |
| cc-title / cc-start / cc-end / cc-units / cc-contact / cc-send-mode / cc-flow-* (全部 12 个字段) | FOUND |
| 8 个单位字符串（教务处/招生处/科研处/学工处/党政办/图书馆/信息化办/资产处） | FOUND |
| tooltip-icon / data-tip= | FOUND |
| loadDraft('collection-create') | FOUND |
| _ccCollectFormData / _ccSaveDraft / _ccValidate / _ccSubmitAndJump | FOUND |
| navigate('notification-create') | FOUND |
| DATA.collectionPlans.unshift | FOUND |
| clearDraft('collection-create') | FOUND |
| logOperation('demand-collect') | FOUND |
| new Date(data.endDate) 日期比较 | FOUND |
| commit f4511ad (Task 1) | FOUND |
| commit 50108d7 (Task 2) | FOUND |
| 无 import / require 新引入 | CONFIRMED |
