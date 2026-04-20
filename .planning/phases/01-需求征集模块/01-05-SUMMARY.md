---
phase: 01-需求征集模块
plan: "05"
subsystem: demo-0408 / demand-select（DEM-06）+ demand-list（DEM-07）
tags: [demand-select, demand-list, BR-04, drawer, status-badge, vanilla-js]
dependency_graph:
  requires:
    - Plan 01（DATA.demandUsers、DATA.tagLibrary 数据层）
    - Plan 03（DATA.demands 记录，含 summary/name/priority/budget 字段）
    - Plan 04（unit-approved 状态需求，demand-select 遴选候选来源）
  provides:
    - demand-select 视图（D-15 Drawer + D-16 无评审入口 + D-17 提交按钮）
    - BR04_REASONS 数组（六类完整原文）
    - _dselSetFilter / _dselSupport / _dselReject / _dselSubmitSelection / _dselConfirmSubmit（5函数）
    - demand-list 视图（DEM-07 T2 筛选器 + UI-SPEC 视图 H 表格列）
    - _dlSetFilter / _dlStatusBadge（2函数）
  affects:
    - Phase 1 全流程闭环（信息办遴选环节完成，需求可进入支持/不支持终态）
tech_stack:
  added: []
  patterns:
    - showDrawer 仅展示静态规则原文（无确认按钮，Pitfall 3 合规）
    - window._dselUnit / _dselStatus / _dselKw 全局筛选状态持久化
    - window._dlKw / _dlUnit / _dlStatus 全局筛选状态，re-render 时恢复选中状态
    - logOperation 所有写操作均调用（T-05-04 mitigate）
key_files:
  created: []
  modified:
    - my-project-code/demo/shared/views/demand.js
decisions:
  - "demand-select 完整替换旧实现（旧版 Modal 选原因 → 新版 Drawer 仅展示原文），符合 D-15 精确描述"
  - "demand-list 完整替换旧实现（旧版带批量勾选/排序 → 新版 _dlSetFilter 实时 re-render），符合 Claude's Discretion 允许简化筛选逻辑"
  - "_demandSendNotice 函数保留（立项申报通知功能，被后续 Phase 2 逻辑依赖）"
  - "demand-list 不再包含 _demandSupport/_demandReject（遴选操作已迁移到 demand-select 专属视图）"
metrics:
  duration: "~20 分钟"
  completed: "2026-04-13"
  tasks_completed: 2
  files_modified: 1
---

# Phase 01 Plan 05: demand-select 改造 + demand-list 对齐 Summary

**一句话：** 完整替换 demand-select 视图落实 D-15（不支持→立即改状态+Drawer 展示 BR-04 六条完整原文）/D-16（无评审入口）/D-17（提交按钮），同时完整替换 demand-list 视图对齐 UI-SPEC 视图 H 筛选器（dl-kw/dl-unit/dl-status）和表格列（含 _dlStatusBadge 覆盖 8 种状态），完成 Phase 1 闭环。

---

## Tasks Completed

| # | Task | Commit | Files |
|---|------|--------|-------|
| 1 | 改造 demand-select — D-15 Drawer + D-16 无评审入口 + D-17 提交按钮 | d4bbf5d | demand.js（line 1680~1808） |
| 2 | 改造 demand-list — DEM-07 T2 筛选器和列对齐 UI-SPEC 视图 H | b2f2477 | demand.js（line 983~1142） |

---

## demand-select 改造后关键函数（D-15/D-16/D-17）

**视图注册位置：** line 1689（demand.js）
**BR04_REASONS 数组位置：** line 1680（demand.js）

**D-15 交互验证：**

| 操作 | 实现方式 | 状态顺序（T-05-02 mitigate）|
|------|----------|--------------------------|
| 点「支持」 | `_dselSupport(id)` → d.status='supported' + logOperation + toast + renderView | 立即 |
| 点「不支持」 | `_dselReject(id)` → d.status='not-supported' + logOperation + toast + renderView → showDrawer | 先改状态，后 Drawer |
| Drawer 内容 | BR04_REASONS 六条完整原文，无按钮（Pitfall 3 合规） | 仅展示 |

**D-16 确认：** grep "发起专家评审" 返回 0——视图中无任何评审入口。

**D-17 确认：** line 1804 包含 `onclick="_dselSubmitSelection()">提交遴选结果`。

---

## BR-04 六条原文位置（demand.js line 1680-1687）

```javascript
var BR04_REASONS = [
  '（一）已经启动建设，或已建成并正常运行的项目，再次报送需求申请重建且无正当理由的',
  '（二）项目需求不明确、不合理，市场调研不充分，预算经费严重背离实际，或无法确定牵头业务责任部门或分管领导的',
  '（三）项目需求与现有系统功能或数字资源有较大重叠，且无正当理由的',
  '（四）项目的建设理念和技术路线已经过时或属于当前落后并被行业或市场淘汰的',
  '（五）已经被否决的项目建设需求，且没有新的理由支持再次研究论证的',
  '（六）不符合学校其他相关规定的'
];
```

来源：《西南大学信息化项目管理办法（试行）》第十三条。

---

## demand-list 筛选器字段 ID 与状态 Badge 映射表

**筛选器 ID（line 1062-1096）：**

| 字段 | ID | 事件 |
|------|-----|------|
| 关键词搜索 | `dl-kw` | `oninput="_dlSetFilter('kw',this.value)"` |
| 按单位筛选 | `dl-unit` | `onchange="_dlSetFilter('unit',this.value)"` |
| 按状态筛选 | `dl-status` | `onchange="_dlSetFilter('status',this.value)"` |

**`_dlStatusBadge` 8种状态映射（line 983-999）：**

| 状态 | Badge 类 | 显示文字 |
|------|---------|---------|
| draft | tag-gray | 草稿 |
| submitted | tag-orange | 已提交 |
| unit-pending | tag-orange | 待审批 |
| unit-approved | tag-green | 待遴选 |
| unit-rejected | tag-red | 已退回 |
| in-selection | tag-blue | 遴选中 |
| supported | tag-green | 已支持 |
| not-supported | tag-red | 不支持 |

---

## Phase 1 全流程演示路径

```
1. 信息办管理员（info-admin）
   → demand-collect 视图：发起征集批次
   → collection-create 视图：配置征集参数，提交

2. 信息办领导（info-leader）
   → collection-detail 视图：审核通过征集方案

3. 单位系统管理员（unit-admin）
   → demand-assign 视图：搜索→备选→确认指派王一凡 50240014

4. 项目负责人（project-manager）
   → demand-fill 视图：填写四步向导（基本信息→需求描述→技术要求→附件上传）
   → 提交后 navigate('demand-list')

5. 单位系统管理员（unit-admin）
   → demand-sort 视图：上移/下移排序 → 提交单位领导审批（unit-pending）

6. 单位分管领导（unit-leader）
   → demand-approve 视图：T4 审批详情页
     - 生命周期进度条（需求征集阶段高亮）
     - 内嵌排序区块（D-14 领导可微调排序）
     - 审批意见面板（D-12 下一级审批开关默认开启）
     - 点「审批通过」→ status→unit-approved + logOperation

7. 信息办管理员（info-admin）
   → demand-select 视图：遴选页
     - 筛选器：单位/状态/关键词
     - 点「支持」→ Badge 变绿 + toast
     - 点「不支持」→ Badge 变红 + toast + 右侧 Drawer 展示 BR-04 六条原文（无确认按钮）
     - 点「提交遴选结果」→ confirm modal → 确认 → toast

8. 任意角色
   → demand-list 视图：需求列表
     - 筛选：dl-kw 关键词/dl-unit 单位/dl-status 状态 → 实时 re-render
     - 状态 Badge：_dlStatusBadge 覆盖 8 种状态
     - project-manager：可见「新建一份需求」按钮
     - info-admin：操作列显示「遴选」跳转 demand-select
```

---

## 遗留事项

- **生命周期进度条 CSS（Plan 04）：** demand-approve 视图头部通过 `<style>` 标签注入样式，未写入全局 style.css，后续 Phase 可考虑提取为全局样式
- **demand-list 优先级显示：** 当前只有 Plan 03 通过 demand-fill 提交的需求有 priority 字段，DATA.demands 中的 mock 数据若无 priority 则显示「—」，后续可在 data.js 中补充
- **性能优化：** 当前筛选每次触发完整 re-render，Demo 级别足够，生产环境需虚拟列表

---

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] budgetToType 返回对象而非字符串**
- **Found during:** Task 1 — demand.js 中 `projectTypeTag(budgetToType(budget))` 发现 budgetToType 在部分实现中返回对象 `{type:'...'}` 而非字符串
- **Fix:** demand-select 和 demand-list 中均改为 `budgetToType(budget).type || budgetToType(budget)` 兼容两种返回格式
- **Files modified:** demand.js（task 1 + task 2 commit）

无其他偏差——计划代码示例完整，直接采用。

---

## Known Stubs

无——demand-select 和 demand-list 均从 DATA.demands 真实读取，无硬编码占位数据。

---

## Threat Flags

无新增安全面——所有改动均在既有 demo-0408 框架内，未引入新的网络端点、文件访问路径或认证路径。

已缓解威胁：
- T-05-01：demand-select render 入口检查 role（info-admin/info-leader）
- T-05-02：_dselReject 先改状态再 showDrawer（状态持久化保障）
- T-05-03：XSS — demand-select 中 d.name 直接拼入 HTML，Plan 03 已限制 name maxlength=60，Demo 级接受（同 T-04-05）
- T-05-04：_dselSupport/_dselReject/_dselConfirmSubmit 均调用 logOperation
- T-05-05：BR-04 原文为公开规则，信息披露接受
- T-05-06：筛选器暴露所有单位数据，Demo 级接受

---

## Self-Check: PASSED

| Check | Result |
|-------|--------|
| my-project-code/demo/shared/views/demand.js | FOUND |
| BR04_REASONS（line 1680，6条） | FOUND |
| registerView('demand-select')（line 1689） | FOUND |
| _dselSetFilter/_dselSupport/_dselReject/_dselSubmitSelection/_dselConfirmSubmit（12 matches） | FOUND |
| dsel-unit/dsel-status/dsel-kw（3 matches） | FOUND |
| 发起专家评审（0 matches，D-16 合规） | FOUND |
| 提交遴选结果 按钮 _dselSubmitSelection | FOUND |
| _dselReject 中 d.status 赋值在 showDrawer 之前（line 1873 < line 1782） | FOUND |
| Drawer 内容无 _dselConfirm/确认不支持/radio | FOUND |
| registerView('demand-list')（line 1007） | FOUND |
| _dlStatusBadge/_dlSetFilter（6 matches） | FOUND |
| dl-kw/dl-unit/dl-status（3 matches） | FOUND |
| 8种状态（draft/submitted/unit-pending/unit-approved/unit-rejected/in-selection/supported/not-supported）| FOUND |
| _dlStatusBadge(d.status)（1 match） | FOUND |
| 新建一份需求 onclick _dfStartNew（demand-list，project-manager 条件） | FOUND |
| 共 N 条（table-pagination） | FOUND |
| commit d4bbf5d (Task 1) | FOUND |
| commit b2f2477 (Task 2) | FOUND |
