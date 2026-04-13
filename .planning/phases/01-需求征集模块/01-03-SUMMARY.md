---
phase: 01-需求征集模块
plan: "03"
subsystem: demo-0408 / demand-assign（DEM-02）+ demand-fill（DEM-03）
tags: [demand-assign, demand-fill, step-wizard, tag-library, vanilla-js]
dependency_graph:
  requires:
    - Plan 01（DATA.tagLibrary、DATA.demandUsers 数据层）
    - Plan 02（DATA.collectionPlans 征集批次数据）
  provides:
    - demand-assign 视图（D-10/D-11 三段式选人：搜索→备选→二次确认）
    - demand-fill 视图（D-05~D-08 四步向导）
    - _da* 函数组（5个，demand-assign 配套）
    - _df* 函数组（6个，demand-fill 配套）
    - DATA.demands.unshift（首次 demand 记录写入）
    - _dfStartNew()（D-07 多份需求入口，demand-list 按钮已接入）
  affects:
    - Plan 04（demand-sort 排序视图读取 DATA.demands 的新记录）
    - Plan 05（demand-list 列定义对齐，新记录字段：name/summary/tags/budget/priority/status）
tech_stack:
  added: []
  patterns:
    - renderStepWizard 四步向导（core.js 已有函数，首次在 demand-fill 中调用）
    - window._demandFormData / window._demandFormStep 全局状态管理
    - loadDraft/saveDraft/clearDraft 草稿机制（core.js）
    - DATA.tagLibrary 按 category 分组动态渲染 checkbox 标签组
    - window._daCandidates 数组管理备选列表（跨渲染周期持久化）
key_files:
  created: []
  modified:
    - my-project-wiki/raw/docs/demo-0408/shared/views/demand.js
decisions:
  - "demand-fill 改为四步向导替代旧单页表单，renderStepWizard + window._demandFormStep 实现步骤切换"
  - "草稿恢复仅在 _demandFormData 为空时触发，避免 _dfStartNew 后重新进入时回带旧数据"
  - "demand-fill 提交后 navigate('demand-list') 而非 demand-assign，符合 D-06（推进流程演示）"
  - "budget 负值校验（Number < 0）加入 _dfSubmit，缓解 T-03-01"
metrics:
  duration: "~35 分钟"
  completed: "2026-04-13"
  tasks_completed: 2
  files_modified: 1
---

# Phase 01 Plan 03: demand-assign 改造 + demand-fill 四步向导 Summary

**一句话：** 将 demand-assign 从静态人员列表改造为符合 D-10/D-11 的三段式选人交互（搜索→备选列表→二次确认），将 demand-fill 改造为四步向导并新增摘要/标签/tooltip/多份需求支持（D-05~D-08），完成 DEM-02/DEM-03 闭环。

---

## Tasks Completed

| # | Task | Files |
|---|------|-------|
| 1 | 改造 demand-assign — D-10/D-11 搜索备选确认选人组件 | demand.js（line 1538~1637） |
| 2 | 改造 demand-fill — 四步向导 + 摘要/标签/tooltip/多份需求（D-05~D-08） | demand.js（line 1241~1537） |

---

## demand-assign 改造后交互三段式（D-11）

**视图入口：** 角色「单位系统管理员」→ 指派填报人

**交互流程：**
1. 顶部信息卡：显示当前征集批次标题、截止日期、已指派人数（从 DATA.collectionPlans[0] 取）
2. 搜索区（D-11）：输入框 `#da-search` + 「搜索」按钮 → `_daSearch()` 过滤 `DATA.demandUsers` 中 `roles.includes('project-manager')` 的用户
3. 搜索结果以「姓名 工号」格式（D-10）展示，每人有「加入备选」按钮 → `_daAddCandidate(uid)`
4. 备选列表区：`window._daCandidates` 数组渲染，含移除按钮 → `_daRemoveCandidate(uid)`
5. 权限有效期：`#da-expire` 日期输入，默认填入征集批次截止日期
6. 「保存指派」→ `_daSubmit()` 前置校验（备选不为空）→ 二次确认 modal → `_daConfirmSubmit()` 提交后重置数组（T-03-06 mitigate）

---

## demand-fill 四步向导 Step 定义

```javascript
var steps = ['基本信息', '需求描述', '技术要求', '附件上传'];
```

| Step | 字段 ID | 类型 | 必填 |
|------|---------|------|------|
| 0 基本信息 | `df-name` | input[text] maxlength=60 + tooltip | 是 |
| 0 基本信息 | `df-unit` | input[readonly]，由 demandUsers 反查 unitId | 只读 |
| 0 基本信息 | `df-leader` | input[readonly]，自动填入王一凡 50240014 | 只读 |
| 0 基本信息 | `df-contact` | input[text] | 是 |
| 0 基本信息 | `df-budget` | input[number] + tooltip + `#df-budget-badge` | 是 |
| 1 需求描述 | `df-summary` | textarea maxlength=200 + `#df-summary-count` + tooltip | 是（D-05） |
| 1 需求描述 | `df-desc` | textarea | 是 |
| 1 需求描述 | radio `df-priority` | 高/中/低，默认中 | 否 |
| 2 技术要求 | `df-tech` | textarea | 否 |
| 2 技术要求 | `.df-tag` checkbox | 按 DATA.tagLibrary category 分组动态渲染 | 否（D-05/D-09） |
| 2 技术要求 | `df-relation` | select（全新建设/功能扩展/系统替换） | 否 |
| 3 附件上传 | `df-files` | input[file] multiple（Demo 展示占位） | 否 |
| 3 附件上传 | `df-remark` | textarea | 否 |

**Tooltip 覆盖（D-08）：** `df-name`（格式建议）、`df-budget`（金额区间说明）、`df-summary`（遴选用途）、标签选择区（用途说明）共 4 处

---

## _df* / _da* 函数清单

### demand-assign 函数（_da*）

| 函数 | 说明 |
|------|------|
| `_daSearch()` | 读取 `#da-search` 关键词，过滤 `DATA.demandUsers`（project-manager），渲染搜索结果 |
| `_daAddCandidate(uid)` | 去重后 push 到 `window._daCandidates`，toast + re-render |
| `_daRemoveCandidate(uid)` | filter 移除，re-render |
| `_daSubmit()` | 前置校验（length===0 报错），showModal 二次确认 |
| `_daConfirmSubmit()` | logOperation + toast + closeModal + 重置数组 + navigate('demand-list') |

### demand-fill 函数（_df*）

| 函数 | 说明 |
|------|------|
| `_dfCaptureStep()` | 按当前 step 读取 DOM 写入 `window._demandFormData` |
| `_dfSaveDraft()` | `_dfCaptureStep` + `saveDraft('demand-fill')` + toast |
| `_dfNextStep()` | `_dfCaptureStep` + 必填校验 + step++ + re-render |
| `_dfPrevStep()` | `_dfCaptureStep` + step-- + re-render |
| `_dfSubmit()` | `_dfCaptureStep` + 完整校验 + budget负值校验 + `DATA.demands.unshift` + `logOperation` + `clearDraft` + 重置状态 + navigate('demand-list') |
| `_dfStartNew()` | 重置 `window._demandFormData={}` + step=0 + `clearDraft` + navigate('demand-fill')（D-07） |
| `_dfUpdateTypeBadge()` | 读取 `#df-budget` → `budgetToType` → 更新 `#df-budget-badge` |
| `_val(id)` | 辅助：`document.getElementById(id).value`，空值返回 '' |

---

## DATA.demands 新记录字段结构（供 Plan 04 排序/审批视图读取）

```javascript
{
  id:           'dm-' + Date.now(),          // 唯一 ID
  name:         '...',                        // 项目名称（同 projectName）
  projectName:  '...',                        // 兼容旧字段
  unitId:       'unit-edu',                   // 由 demandUsers.unitId 反查
  collectionId: 'cp-xxx' | 'CP001',          // 征集批次 ID
  submitterId:  'u-wangyifan',
  submittedBy:  '王一凡 50240014',            // 姓名+工号格式（D-10）
  submitter:    '王一凡 50240014',            // 同上
  summary:      '...',                        // D-05 新字段，≤200字
  description:  '...',                        // 功能描述
  budgetEstimate: 50,                         // 数值（万元）
  budget:       50,                           // 兼容旧字段
  priority:     '高' | '中' | '低',
  tech:         '...',
  tags:         [{ id, category, name }],    // 来自 DATA.tagLibrary
  relation:     '全新建设' | '功能扩展' | '系统替换',
  remark:       '...',
  status:       'submitted',
  sortOrder:    999,
  submitDate:   'YYYY-MM-DD',
  createdAt:    'YYYY-MM-DD'
}
```

---

## demand-list「新建一份需求」按钮（D-07）

旧实现：`onclick="navigate('demand-fill')"`

新实现：`onclick="_dfStartNew()"` — 调用 `_dfStartNew` 重置表单状态后再导航，确保每次新建都是空表单（T-03-03 mitigate）

---

## 已知残留

- demand-list 视图的列定义（columns）和筛选器将在 Plan 05 最终对齐；新建的 demand 记录已有 `summary/tags/priority` 字段，但 demand-list 表格尚未展示这些新列
- demand-fill 在 `role !== 'project-manager'` 时仍可进入（Demo 级，无访问控制，T-03-05 accepted）
- `df-files` 附件上传仅占位展示，无真实文件处理（D-05 文件识别 Demo 占位，已在 demo-notice 中说明）

---

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical Functionality] budget 负值输入校验**
- **Found during:** Task 2 - _dfSubmit 实现
- **Issue:** T-03-01 威胁登记中明确要求缓解 budget 负值输入，但 plan 代码示例仅用 `Number()` 转换而未做范围校验
- **Fix:** 在 `_dfSubmit` 中加入 `if (Number(d.budget) < 0) { toast(...); return; }` 校验
- **Files modified:** demand.js
- **Commit:** 含于 Task 2 变更中

**2. [Rule 1 - Bug] demand 记录同时写入 name 和 projectName 字段**
- **Found during:** Task 2 - _dfSubmit，发现 demand-sort/demand-list 读取 `demand.projectName` 而新记录计划中只有 `name`
- **Fix:** 新记录同时写入 `name` 和 `projectName`，确保下游视图兼容
- **Files modified:** demand.js

---

## Known Stubs

- `df-files`：文件上传控件展示占位，不做真实文件处理；已在视图内加黄色 Demo 说明提示

---

## Threat Flags

无新增安全面——所有改动均在既有 demo-0408 框架内，未引入新的网络端点、文件访问路径或认证路径。

---

## Self-Check: PASSED

| Check | Result |
|-------|--------|
| my-project-wiki/raw/docs/demo-0408/shared/views/demand.js | FOUND |
| registerView('demand-assign') 存在（line 1538） | FOUND |
| registerView('demand-fill') 存在（line 1248） | FOUND |
| _daSearch / _daAddCandidate / _daRemoveCandidate / _daSubmit / _daConfirmSubmit | FOUND (11 matches) |
| window._daCandidates | FOUND |
| da-search / da-search-result / da-expire | FOUND |
| DATA.demandUsers（demand-assign 过滤） | FOUND |
| u.name + ' ' + u.empNo（D-10 格式） | FOUND (3 matches) |
| _dfCaptureStep / _dfSaveDraft / _dfNextStep / _dfPrevStep / _dfSubmit / _dfStartNew | FOUND (15 matches) |
| df-name / df-contact / df-budget / df-summary / df-desc / df-tech / df-relation / df-remark | FOUND (17 matches) |
| df-summary-count | FOUND (2 matches) |
| DATA.tagLibrary（demand-fill 标签渲染） | FOUND (10 matches) |
| renderStepWizard | FOUND (1 match) |
| tooltip-icon / data-tip= | FOUND (8 matches) |
| _dfStartNew + 新建一份需求 （demand-list） | FOUND (2 matches) |
| DATA.demands.unshift | FOUND (1 match) |
