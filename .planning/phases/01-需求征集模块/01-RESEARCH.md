# Phase 1: 需求征集模块 - Research

**Researched:** 2026-04-13
**Domain:** 纯 HTML + Vanilla JS Demo 前端，需求征集业务流程
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01:** 继续内嵌到 app.html，在 demand.js 里新增/改造视图，通过 `navigate()` 切换，不新建独立 HTML 文件
- **D-02:** 发起征集配置页提交后跳转通知预填页：判断 notification-template 是否已有对应视图——有则 `navigate()` 导航，无则 toast 提示「Demo：通知功能待完善」
- **D-03:** 征集配置页内嵌流程开关（如「是否需要专家评审」toggle），流程节点配置在发起征集表单里直接完成，不跳转独立配置模块
- **D-04:** Demo 不做征集时间校验，任何时候均可操作，不因时间未到而锁定功能
- **D-05:** 260409 新增字段（摘要、标签选择、文件自动识别填充）**展示即可**，字段渲染在表单中但不强制真实交互逻辑
- **D-06:** 暂存/提交两个按钮均有 toast 反馈；点「提交」后跳转到单位系统管理员视图以推进流程演示
- **D-07:** 允许多份需求申请表：填报列表页展示多条记录，表单页有「新建一份需求」按钮
- **D-08:** 关键字段旁加 tooltip `?` icon 作为提示说明（hover 展示说明文字）
- **D-09:** 完整可交互的标签库管理视图，需求申请表中的标签选择从中取数，Phase 1 完整实现
- **D-10:** 所有选人组件统一展示「姓名 + 工号」，如「王一凡 50240014」
- **D-11:** 单位系统管理员指派填报人：「搜索 → 加入备选列表 → 可多次搜索累积 → 二次确认提交」交互
- **D-12:** 审批页「是否需要下一级审批」开关**默认开启**，可手动关闭跳过；选「是」时展示审批人选择栏
- **D-13:** 单位系统管理员排序页：纯 vanilla JS，用**上移/下移按钮**模拟排序，不引入拖拽库
- **D-14:** 单位领导 T4 审批详情页：页面内嵌独立的需求排序区块，同样用上移/下移按钮，展示领导也可调整排序
- **D-15:** 每条需求标记「支持/不支持」；选「不支持」时从右侧滑入 Drawer，展示 BR-04 六类不予支持原因文字说明（仅展示，无需用户选择具体原因）
- **D-16:** Phase 1 遴选页**不展示**「发起专家评审」入口，该入口在 Phase 3 实现
- **D-17:** 遴选页底部有「提交遴选结果」按钮，点击后批量更新需求状态并发送通知（toast 反馈）

### Claude's Discretion

- 各视图内 Mock 数据的具体字段值和条数
- 需求列表 T2 筛选的具体 filter 实现方式（UI 展示筛选器，逻辑可简化）
- 标签库的预设标签类目（Claude 按业务场景合理设计）
- 各状态流转的具体状态名称和颜色标签

### Deferred Ideas (OUT OF SCOPE)

- 专家评审入口及流程 — Phase 3 实现
- 「发起专家评审」按钮 — Phase 3 联通后补充
- 上传文件自动识别内容并填充 — 会议要求中的高级功能，Demo 中展示字段但不实现 AI 识别逻辑
- Phase 2-6 相关的会议优化项（通知模板、立项配置等）— 已记录在对应阶段规划中
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| DEM-01 | 信息办管理员发起需求征集，配置时间和通知范围，跳转通知页预填 | collection-create 视图已在 demo-0408 有基础实现，需改造以符合 D-01~D-03；notification-create 视图已注册，跳转逻辑可直接使用 `navigate('notification-create', {prefill:{...}})` |
| DEM-02 | 单位系统管理员查看授权，指派本单位填报人 | demand-assign 视图已在 demo-0408 注册，需按 D-10/D-11 改造选人组件交互 |
| DEM-03 | 项目负责人填写需求申请表（T3），暂存/提交 | demand-fill 视图已在 demo-0408 有基础实现，需按 D-05~D-08 扩展字段（摘要、标签、tooltip） |
| DEM-04 | 单位系统管理员拖拽排序本单位需求，提交单位领导审批 | demand-sort 视图已在 demo-0408 注册，但实现为文字占位符；需按 D-13 改造为上移/下移按钮 |
| DEM-05 | 单位领导审批需求排序（T4，含审批意见） | demand-sort 共用视图或新建 demand-approve 视图；demo-0408 中 demand-sort 已有 isLeader 分支，需按 D-14 改造为独立 T4 详情结构 |
| DEM-06 | 信息办管理员需求遴选（标记支持/不支持，含 BR-04 六类不予支持提示） | demand-select 视图已在 demo-0408 注册且含 BR-04 六类数据；需按 D-15 改为 Drawer 展示，按 D-17 添加「提交遴选结果」按钮 |
| DEM-07 | 需求列表（T2），按状态和单位筛选 | demand-list 视图已在 demo-0408 注册，需确认筛选器字段完整（状态/单位）并对齐 UI-SPEC 表格列定义 |
</phase_requirements>

---

## Summary

Phase 1 在技术上是对 demo-0408 现有需求模块视图的**改造与扩展**，而非从零构建。`demand.js` 文件中已注册了 `demand-collect`、`collection-create`、`collection-detail`、`demand-list`、`demand-fill`、`demand-assign`、`demand-sort`、`demand-select` 共 8 个视图——这些是本阶段所有目标视图的直接前体。`notification-create` 视图同样已存在于 `notification.js` 中，DEM-01 的跳转预填逻辑因此可直接实现，不存在「notification-template 未实现」的回退分支问题。

本阶段新增的主要内容有三处：（1）标签库（tag-library）视图是全新功能，demo-0408 中不存在，需要从零创建；（2）单位领导审批详情页（demand-approve）需要按 T4 模板重构，demo-0408 中仅用 `demand-sort` 的 `isLeader` 分支粗略模拟；（3）需求申请表需要补充摘要、标签选择、tooltip 等 260409 新增字段。其余视图均以 demo-0408 代码为基础做针对性改造。

改造核心约束：所有输出必须内嵌在 app.html 同一文件体系中（通过 `<script>` 引入各 view JS 文件），使用 `registerView` 模式，不新建独立 HTML 文件。Mock 数据中指定人员为：唐明-20053964（信息办领导/单位领导）、林已杰-20054379（信息办管理员/单位管理员）、王一凡-50240014（项目负责人）。

**Primary recommendation:** 以 `my-project-code/demo/shared/views/demand.js` 为改造基础，逐视图对照 UI-SPEC 和 CONTEXT.md 决策进行增量修改，保持 `registerView` + `navigate` + `toast` 的既有模式。新建 `tag-library` 视图和 `demand-approve` 视图，改造其余已有视图。

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| 纯 HTML + Vanilla JS | — | 全部视图和交互 | demo-0408 确立模式，无构建工具，浏览器双击可运行 [VERIFIED: demo-0408 codebase] |
| Tailwind CSS (CDN) | latest via cdn.tailwindcss.com | 工具类样式 | demo-0408 头部模板已使用 [VERIFIED: demo-0408/shared/views/] |
| Lucide Icons (CDN) | latest via unpkg.com/lucide | 图标库 | demo-0408 头部模板已使用，tooltip `?` icon、排序 grip-vertical 均来源此库 [VERIFIED: ui-spec.md] |
| demo-0408 style.css | — | CSS 变量、组件类（btn、tag、card、data-table） | 权威样式来源，新视图必须引入 [VERIFIED: UI-SPEC.md] |
| demo-0408 core.js | — | `registerView`、`navigate`、`toast`、`showModal`、`showDrawer`、`saveDraft`、`loadDraft` 等核心函数 | 全部交互必须复用此 API [VERIFIED: demo-0408/shared/core.js] |
| demo-0408 data.js | — | `DATA.demands`、`DATA.collectionPlans`、`DATA.roles` 等 Mock 数据 | 所有视图从此读写状态 [VERIFIED: demo-0408/shared/data.js] |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Google Fonts (CDN) | — | Noto Serif SC（display）+ LXGW WenKai（body） | 每个 HTML 文件头部必须引入，与 demo-0408 保持一致 [VERIFIED: UI-SPEC.md] |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| 上移/下移按钮排序 | Sortable.js CDN | 用户决策 D-13：不引入新 CDN，保持零依赖 |
| Drawer 展示 BR-04 | 行内展开 / Modal | 用户决策 D-15：Drawer 右侧滑入 |

**Installation:** 无需安装，所有依赖通过 CDN 引入，参见 UI-SPEC.md CDN Header Template 章节。

---

## Architecture Patterns

### 文件结构（改造后）

```
my-project-code/
└── pages/
    └── (本阶段不新建独立 HTML，所有视图内嵌在主应用中)

my-project-code/demo/shared/
├── views/
│   ├── demand.js          ← 本阶段主要改造目标
│   │   ├── demand-collect      视图（已有，保留）
│   │   ├── collection-create   视图（已有，改造 → 发起征集配置页）
│   │   ├── collection-detail   视图（已有，保留/微调）
│   │   ├── demand-assign       视图（已有，改造 → D-10/D-11 选人组件）
│   │   ├── demand-fill         视图（已有，改造 → 增摘要/标签/tooltip）
│   │   ├── demand-sort         视图（已有，改造 → 上移/下移按钮）
│   │   ├── demand-approve      视图（新建 → T4 单位领导审批详情）
│   │   ├── demand-select       视图（已有，改造 → Drawer/提交按钮）
│   │   ├── demand-list         视图（已有，改造 → 对齐筛选器和列）
│   │   └── tag-library         视图（新建 → 标签库管理）
│   └── notification.js    ← notification-create 已注册，无需改动
├── data.js                ← 需补充 collectionPlans、demands Mock 数据和标签库数据
├── core.js                ← 不改动
└── style.css              ← 不改动
```

### Pattern 1: 视图注册模式

**What:** 所有视图通过 `registerView(id, fn)` 注册，`fn` 返回 HTML 字符串，`navigate(id, params)` 切换。
**When to use:** 本阶段所有视图，无例外。

```javascript
// Source: demo-0408/shared/core.js [VERIFIED]
registerView('view-id', function() {
  const params = getViewParams('view-id') || {};
  const role = getCurrentRole();
  // ...构建 HTML 字符串...
  return html;
});
```

### Pattern 2: Toast 反馈模式

**What:** 所有操作必须有 toast 反馈，禁止无响应操作。
**When to use:** 所有按钮点击事件。

```javascript
// Source: demo-0408/shared/core.js [VERIFIED]
toast('操作成功描述', 'success');  // duration 默认 2500ms
toast('错误信息', 'error');         // duration 建议 3000ms
toast('提示内容', 'info');
toast('警告内容', 'warning');
```

### Pattern 3: Drawer 模式（BR-04 不支持原因）

**What:** `showDrawer(title, html)` 从右侧滑入抽屉，展示内容信息。
**When to use:** DEM-06 遴选页点击「不支持」时展示 BR-04 六类原因。

```javascript
// Source: demo-0408/shared/core.js [VERIFIED]
showDrawer('不予支持原因（BR-04）', brHtml);
closeDrawer();
```

### Pattern 4: Modal 确认模式

**What:** `showModal(title, bodyHtml, buttons)` 弹出确认对话框。
**When to use:** 提交排序确认、遴选结果确认、退回操作确认。

```javascript
// Source: demo-0408/shared/core.js [VERIFIED]
showModal('确认标题', '<p>确认文案</p>',
  '<button class="btn" onclick="closeModal()">取消</button>' +
  '<button class="btn btn-primary" onclick="closeModal();doAction()">确认</button>'
);
```

### Pattern 5: 选人组件模式（D-11，指派填报人）

**What:** 搜索 → 加入备选列表 → 二次确认提交。无真实搜索后端，从 `DATA.roles` 或 Mock 用户列表筛选。
**When to use:** demand-assign 视图的指派填报人功能。

```javascript
// 展示格式：姓名 + 工号（D-10）[ASSUMED: 工号格式为 8 位数字字符串]
// 参考 Mock 人员：王一凡 50240014、林已杰 20054379、唐明 20053964
window._assignCandidates = [];  // 备选列表
function _addCandidate(user) {
  if (_assignCandidates.find(u => u.id === user.id)) {
    toast('该人员已在列表中', 'warning'); return;
  }
  _assignCandidates.push(user);
  renderCandidateList();
}
```

### Pattern 6: 上移/下移排序模式（D-13）

**What:** 每行展示 ↑ ↓ 按钮，点击后对 `DATA.demands` 中的 `sortOrder` 字段执行数组重排，重新渲染视图。
**When to use:** demand-sort 视图（单位系统管理员）和 demand-approve 视图内嵌排序区块（单位领导，D-14）。

```javascript
// [ASSUMED: 基于 demo-0408 既有模式的合理推断]
function _moveDemand(id, dir) {  // dir: 'up' | 'down'
  const list = getCurrentSortList();
  const idx = list.findIndex(d => d.id === id);
  if (dir === 'up' && idx > 0) {
    [list[idx-1], list[idx]] = [list[idx], list[idx-1]];
  } else if (dir === 'down' && idx < list.length - 1) {
    [list[idx], list[idx+1]] = [list[idx+1], list[idx]];
  }
  list.forEach((d, i) => d.sortOrder = i + 1);
  renderView('demand-sort');  // 或 renderView('demand-approve')
}
```

### Pattern 7: 草稿存取模式

**What:** `saveDraft(formId, data)` → localStorage；`loadDraft(formId)` 恢复；`clearDraft(formId)` 提交后清除。
**When to use:** demand-fill（需求申请表）、collection-create（征集配置页）。

```javascript
// Source: demo-0408/shared/core.js [VERIFIED]
saveDraft('demand-fill', window._demandFormData);
const draft = loadDraft('demand-fill') || {};
clearDraft('demand-fill');  // 提交成功后调用
```

### Pattern 8: 跨视图预填模式（DEM-01）

**What:** `navigate(viewId, {prefill: {...}})` 传递预填参数；目标视图通过 `getViewParams(viewId)` 读取并填充字段。
**When to use:** collection-create 提交后跳转 notification-create。

```javascript
// Source: demo-0408/shared/core.js + notification.js [VERIFIED: notification-create 已实现 prefill 参数读取]
navigate('notification-create', {
  prefill: {
    title: year + '年度需求征集通知',
    type: '需求征集通知',
    recipients: selectedUnits,
    contact: contactPerson
  }
});
```

### Anti-Patterns to Avoid

- **在视图函数外修改 DATA 全局状态:** 所有状态变更必须在按钮回调中进行，不在视图渲染函数顶层执行副作用
- **新建独立 HTML 文件:** D-01 明确禁止，所有视图内嵌在 app.html 体系中
- **引入新 CDN 库:** D-13 明确禁止引入 Sortable.js 等拖拽库，保持零额外依赖
- **内联 style="" 属性:** CLAUDE.md（my-project-code）明确禁止内联样式——注意：demo-0408 代码中存在大量 `style=""` 内联样式，但这是旧代码遗留；新增/改造的代码应尽量用 CSS 类和 Tailwind，若必须内联请在注释中说明原因
- **使用 npm/import/require:** CLAUDE.md 明确禁止，所有依赖通过 CDN 引入

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Modal 弹窗 | 自定义 modal 组件 | `showModal()` / `closeModal()` (core.js) | 已有完整实现，含遮罩/关闭/按钮 |
| 右侧抽屉 | 自定义 drawer 组件 | `showDrawer()` / `closeDrawer()` (core.js) | `_showNotifDrawer` 已演示正确用法 |
| 退回对话框 | 自定义退回表单 | `showReturnDialog(title, fn)` (core.js) | 含原因分类 select + 说明 textarea |
| 步骤向导 | 自定义步骤组件 | `renderStepWizard(steps, n)` (core.js) | 已有 4 步向导实现，demand-fill 需复用 |
| 状态 Badge | 自定义样式 | `tag tag-{color}` CSS 类 (style.css) | 颜色语义已在 UI-SPEC 中规范化 |
| Toast 提示 | alert / 自定义提示 | `toast(msg, type)` (core.js) | 标准化反馈，含 icon 和淡出动画 |
| 项目类型 Badge | 自定义预算判断 | `budgetToType(budget)` + `projectTypeTag(type)` (core.js) | 分级规则（<20万/20-100万/100-200万/≥200万）已统一 |
| 截止日期样式 | 自定义日期比较 | `deadlineClass(dateStr)` (core.js) | 7天内橙色/超期红色逻辑已封装 |
| 面包屑导航 | 自定义面包屑 | `breadcrumb(...items)` (core.js) | 标准结构，统一 navigate 行为 |
| 操作日志 | 自定义日志 | `logOperation(module, action, ...)` (core.js) | 写入 `DATA.operationLogs`，T4 操作记录 Tab 依赖此数据 |

**Key insight:** demo-0408 的 core.js 已将所有通用 UI 交互封装完毕，Phase 1 的任务是**组合这些工具**实现业务逻辑，而非重造基础设施。

---

## Critical Facts for Planning

### 已存在于 demo-0408、无需新建的视图

| 视图 ID | 状态 | 改造方向 |
|---------|------|---------|
| `demand-collect` | 完整实现 | 仅微调（如有需要） |
| `collection-create` | 完整实现（4步向导） | 改造：添加流程开关、调整提交后跳转逻辑（D-02/D-03） |
| `collection-detail` | 完整实现（Tab 结构） | 改造：对齐 UI-SPEC 视图 B 的 Tab 定义 |
| `demand-list` | 完整实现 | 改造：筛选器字段对齐 UI-SPEC，列定义对齐 |
| `demand-fill` | 基础实现（单表单，无向导） | 改造：改为 4 步向导，添加摘要/标签/tooltip 字段（D-05~D-08） |
| `demand-assign` | 基础实现 | 改造：实现 D-11 搜索→备选→确认交互，D-10 姓名+工号格式 |
| `demand-sort` | 基础实现（文字排序占位） | 改造：实现上移/下移按钮（D-13），单位系统管理员视图 |
| `demand-select` | 基础实现（BR-04 卡片式展示） | 改造：改为 Drawer 展示（D-15），添加「提交遴选结果」按钮（D-17） |

### 需要新建的视图

| 视图 ID | 来源 | 说明 |
|---------|------|------|
| `demand-approve` | 全新 | T4 单位领导审批详情页，含内嵌排序区块（D-14），demo-0408 中 `demand-sort` 的 `isLeader` 分支不足以满足要求 |
| `tag-library` | 全新 | 标签库管理视图（D-09），demo-0408 中不存在 |

### notification-create 的跳转问题（D-02 关键事实）

demo-0408 中 `notification-create` 视图**已注册并实现**（notification.js line 189）。D-02 的「判断是否存在」逻辑实际上永远走「有则 navigate」分支，不会出现 toast 回退。实现时可简化为直接 `navigate('notification-create', {prefill:{...}})`，但保留 VIEWS['notification-create'] 的判断也是防御性好实践。

### BR-04 六类不予支持原因（精确来源）

来源：《西南大学信息化项目管理办法》第十三条 [VERIFIED: my-project-wiki/raw/decisions/西南大学信息化项目管理办法.md]

1. 已经启动建设，或已建成并正常运行的项目，再次报送需求申请重建且无正当理由的
2. 项目需求不明确、不合理，市场调研不充分，预算经费严重背离实际，或无法确定牵头业务责任部门或分管领导的
3. 项目需求与现有系统功能或数字资源有较大重叠，且无正当理由的
4. 项目的建设理念和技术路线已经过时或属于当前落后并被行业或市场淘汰的
5. 已经被否决的项目建设需求，且没有新的理由支持再次研究论证的
6. 不符合学校其他相关规定的

注意：demo-0408 中已有这六类的简化版标签（BR-04-1 ~ BR-04-6），Drawer 展示时应使用上述**完整原文**，而非简化标签。

### 演示账号 Mock 数据规范（D-10 具体值）

| 角色 | 姓名 | 工号 | 角色 ID |
|------|------|------|---------|
| 信息办领导 / 单位领导 | 唐明 | 20053964 | `info-leader` / `unit-leader` |
| 信息办管理员 / 单位管理员 | 林已杰 | 20054379 | `info-admin` / `unit-admin` |
| 项目负责人 | 王一凡 | 50240014 | `project-manager` |

注意：demo-0408 的 `core.js` 中 `roleDisplayName()` 函数使用的是旧 Mock 人名（如「张华」「王主任」），Phase 1 改造后需将这三个核心演示账号的引用替换为上述真实姓名和工号。

### DATA 层需要新增的 Mock 数据

以下条目在 demo-0408 `data.js` 中不存在，需在 Phase 1 实现时添加：

1. **`DATA.tagLibrary`** — 标签库数组（D-09），供需求申请表标签选择和标签库管理视图使用
2. **`DATA.demandUsers`**（或扩展 `DATA.roles`）— 含工号信息的用户列表，供指派填报人选人组件搜索
3. **需求状态补充** — 现有 `DATA.demands` 状态集为：`draft / submitted / sorted / unit-approved / unit-rejected / in-selection / supported / not-supported`；Phase 1 视图需要完整覆盖这些状态的流转

### 标签库预设类目建议（Claude's Discretion）

基于高校信息化业务场景 [ASSUMED: 合理业务推断，无官方来源]:

| 类目 | 标签示例 |
|------|---------|
| 业务领域 | 教学管理、科研管理、学生事务、行政办公、财务管理、人事管理、招生就业、图书档案 |
| 技术类型 | 数据分析、移动端、集成接口、报表统计、AI/智能化、云部署、安全合规、数据治理 |
| 建设类型 | 全新建设、功能扩展、系统替换、接口改造、升级改造 |
| 项目规模 | 微型（<20万）、小型（20-100万）、中型（100-200万）、重大（≥200万） |

---

## Common Pitfalls

### Pitfall 1: demand-sort 和 demand-approve 职责混淆

**What goes wrong:** 将单位系统管理员的排序操作和单位领导的审批操作放在同一个视图里用 `isLeader` 分支区分，导致 T4 详情结构（生命周期进度条、操作记录 Tab、审批意见面板）无法在排序视图的简单表格结构中正确实现。

**Why it happens:** demo-0408 的 `demand-sort` 视图已有 `isLeader` 分支，看起来像是可以复用。

**How to avoid:** 严格按 UI-SPEC 要求：`demand-sort` 负责单位系统管理员排序（T3 结构），`demand-approve` 是独立的 T4 详情视图（含生命周期进度条、需求排序内嵌区块、审批意见面板、操作记录 Tab）。两者必须分开。

**Warning signs:** 如果发现 `demand-sort` 视图代码超过 200 行且包含审批意见 textarea，说明职责已混淆。

### Pitfall 2: 上移/下移排序未同步到 DATA 层

**What goes wrong:** 点击 ↑↓ 按钮后仅操作 DOM，`DATA.demands[x].sortOrder` 未更新，导致视图重新渲染后排序结果丢失。

**Why it happens:** 纯 DOM 操作比更新状态+重渲染看起来更简单。

**How to avoid:** 排序操作必须更新 `DATA.demands` 中对应条目的 `sortOrder` 字段，然后调用 `renderView('demand-sort')` 重新渲染。

**Warning signs:** 刷新视图（切走再切回）后排序不保持。

### Pitfall 3: Drawer 关闭后状态未更新

**What goes wrong:** 遴选页点击「不支持」打开 Drawer 展示 BR-04，但 Drawer 是单纯展示，D-15 要求「不支持」标记在点击按钮时即刻更新（不需要在 Drawer 内确认）。若混淆为「在 Drawer 内确认」则与决策 D-15 相悖。

**Why it happens:** UI-SPEC 中的 `demand-select` 视图描述了一个「Modal + radio 选择」交互，但 CONTEXT.md D-15 已将其锁定为「Drawer 仅展示，无需选择」。UI-SPEC 描述优先级低于 CONTEXT.md 决策。

**How to avoid:** 点击「不支持」按钮时：立即更新 `demand.status = 'not-supported'`，立即更新状态 Badge，立即 toast 反馈，同时调用 `showDrawer(...)` 展示 BR-04 原因（Drawer 无确认按钮）。

**Warning signs:** Drawer 内有「确认不支持」按钮——这是 UI-SPEC 旧版描述，与 CONTEXT.md D-15 冲突，应删除。

### Pitfall 4: 标签库视图与需求申请表数据源不一致

**What goes wrong:** 标签库管理视图中新增/删除标签，但需求申请表的标签 checkbox 仍使用硬编码列表，两者不共享 `DATA.tagLibrary`。

**How to avoid:** `DATA.tagLibrary` 是唯一数据源，标签库视图写入，需求申请表读取并动态渲染 checkbox。

### Pitfall 5: roleDisplayName 映射未更新

**What goes wrong:** 操作日志（`logOperation`）中的操作人显示为 demo-0408 旧名字（如「张华」），而非会议指定的真实演示账号（林已杰-20054379）。

**How to avoid:** 在 `demand.js` 中使用当前角色的真实姓名时，通过 `getCurrentRole()` 映射到演示账号，而不是使用 core.js 的 `roleDisplayName()`（后者仍是旧映射）。或在 data.js 中直接修正 `roleDisplayName` 的映射表。

### Pitfall 6: T4 页面缺少操作记录 Tab

**What goes wrong:** `demand-approve`（单位领导审批 T4）建成后没有「操作记录 Tab」。

**Why it happens:** 实现时关注了核心审批功能，忽略了 T4 规范要求。

**How to avoid:** UI-SPEC 明确要求「所有 T4 必须包含操作记录 Tab」，`demand-approve` 的操作记录数据来自 `DATA.operationLogs`（由 `logOperation()` 写入）。

---

## Code Examples

### 征集配置页提交后跳转通知页（DEM-01）

```javascript
// Source: 基于 demo-0408/shared/core.js navigate/getViewParams 机制 [VERIFIED]
// 在 collection-create 视图的提交按钮 onclick 中：
function _submitCollectionAndJump() {
  var year = document.getElementById('cc-year').value;
  var selectedUnits = Array.from(document.querySelectorAll('.unit-checkbox:checked')).map(function(el) { return el.value; });
  var contact = document.getElementById('cc-contact').value;
  // 检查 notification-create 视图是否已注册
  if (VIEWS['notification-create']) {
    navigate('notification-create', {
      prefill: {
        title: year + '年度信息化项目需求征集通知',
        type: 'collection-notice',
        recipients: selectedUnits,
        contact: contact
      }
    });
    toast('征集方案已发起，通知正在预填', 'success');
  } else {
    toast('Demo：通知功能待完善', 'info');
  }
}
```

### BR-04 Drawer 展示（DEM-06，D-15）

```javascript
// Source: 基于 demo-0408/shared/core.js showDrawer [VERIFIED]
var BR04_REASONS = [
  '（一）已经启动建设，或已建成并正常运行的项目，再次报送需求申请重建且无正当理由的',
  '（二）项目需求不明确、不合理，市场调研不充分，预算经费严重背离实际，或无法确定牵头业务责任部门或分管领导的',
  '（三）项目需求与现有系统功能或数字资源有较大重叠，且无正当理由的',
  '（四）项目的建设理念和技术路线已经过时或属于当前落后并被行业或市场淘汰的',
  '（五）已经被否决的项目建设需求，且没有新的理由支持再次研究论证的',
  '（六）不符合学校其他相关规定的'
];

function _selectRejectWithDrawer(demandId, demandName) {
  // 立即更新状态（D-15：仅展示，无需在 Drawer 内选择）
  var d = DATA.demands.find(function(x) { return x.id === demandId; });
  if (d) { d.status = 'not-supported'; }
  toast('已标记为不支持', 'success');
  renderView('demand-select');  // 刷新列表更新 Badge
  // 展示 BR-04 Drawer
  var html = '<div style="font-size:13px;line-height:1.8">' +
    '<p style="margin-bottom:12px;color:var(--text-secondary)">根据《西南大学信息化项目管理办法》第十三条，下列情形不予支持：</p>' +
    BR04_REASONS.map(function(r) {
      return '<div style="padding:8px 12px;margin-bottom:8px;background:#fff5f5;border-left:3px solid var(--danger);border-radius:0 4px 4px 0">' + r + '</div>';
    }).join('') +
  '</div>';
  showDrawer('不予支持原因说明（BR-04）', html);
}
```

### 上移/下移排序（D-13）

```javascript
// Source: 基于 demo-0408 data.js 数据结构推导 [ASSUMED: 合理实现模式]
window._demandSortList = null;  // 工作副本，避免直接修改 DATA

function _initSortList(collectionId, unitId) {
  window._demandSortList = DATA.demands
    .filter(function(d) { return d.collectionId === collectionId && d.unitId === unitId && d.status === 'submitted'; })
    .sort(function(a, b) { return (a.sortOrder || 999) - (b.sortOrder || 999); });
}

function _moveSortItem(idx, dir) {
  var list = window._demandSortList;
  var swapIdx = dir === 'up' ? idx - 1 : idx + 1;
  if (swapIdx < 0 || swapIdx >= list.length) return;
  var tmp = list[idx]; list[idx] = list[swapIdx]; list[swapIdx] = tmp;
  list.forEach(function(d, i) { d.sortOrder = i + 1; });
  renderView('demand-sort');
}
```

### T4 生命周期进度条（demand-approve 视图）

```javascript
// Source: UI-SPEC.md Interaction Contracts [VERIFIED: 进度条规范]
function _renderLifecycleBar(currentStage) {
  var stages = ['需求征集', '立项论证', '采购', '实施', '验收', '运维'];
  var stageIdx = stages.indexOf(currentStage);
  return '<div style="display:flex;align-items:center;padding:16px 0;margin-bottom:16px">' +
    stages.map(function(s, i) {
      var isCurrent = i === stageIdx;
      var isDone = i < stageIdx;
      var dotColor = isDone ? 'var(--success)' : isCurrent ? 'var(--info)' : 'var(--text-muted)';
      var lineColor = i < stageIdx ? 'var(--success)' : '#e2e8f0';
      return (i > 0 ? '<div style="flex:1;height:2px;background:' + lineColor + '"></div>' : '') +
        '<div style="text-align:center">' +
          '<div style="width:12px;height:12px;border-radius:50%;background:' + dotColor + ';margin:0 auto 4px"></div>' +
          '<div style="font-size:11px;white-space:nowrap;' + (isCurrent ? 'font-weight:600;color:var(--info)' : 'color:var(--text-secondary)') + '">' + s + '</div>' +
        '</div>';
    }).join('') +
  '</div>';
}
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| demand-sort 用 isLeader 分支处理审批 | demand-approve 独立 T4 视图 | Phase 1 新决策 | planner 必须新建 demand-approve 视图 |
| BR-04 以卡片式行内展示 | 点击「不支持」时 Drawer 侧滑展示 | CONTEXT.md D-15 | 改造 demand-select 视图的 _selectReject 函数 |
| demand-fill 单页表单 | 4 步向导（renderStepWizard） | CONTEXT.md + UI-SPEC | 改造 demand-fill 为向导结构 |
| 无标签库 | tag-library 视图 + DATA.tagLibrary | Phase 1 新增（260409会议） | 需要新建视图和数据结构 |

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | 上移/下移排序使用工作副本 `window._demandSortList`，对 `DATA.demands` 的 `sortOrder` 字段原地更新 | Code Examples | 若 DATA 结构不支持原地修改，需调整为 Map/副本方案 |
| A2 | 标签库预设类目（业务领域/技术类型/建设类型/项目规模） | Critical Facts | Claude's Discretion 范围内，planner 可自由调整 |
| A3 | 工号格式为 8 位数字字符串（如 50240014） | Critical Facts | 仅影响 Mock 数据展示格式 |
| A4 | 标签库视图 ID 命名为 `tag-library` | Architecture Patterns | 若与现有视图冲突需改名，但当前 demo-0408 无此 ID |
| A5 | `roleDisplayName` 映射修改在 data.js 中完成（而非 core.js） | Common Pitfalls | 两者均可行，planner 自行决定修改位置 |

---

## Open Questions

1. **标签库视图的菜单入口**
   - What we know: 标签库是独立视图，需从导航菜单进入
   - What's unclear: 归属到哪个导航分组（「需求管理」下还是独立的「基础配置」）
   - Recommendation: 挂载到「需求管理」导航分组下，因为 Phase 1 的标签库仅服务于需求申请表

2. **collection-create 改造深度**
   - What we know: demo-0408 已有 4 步向导的 collection-create，但 UI-SPEC 视图 A 为单页表单（非向导）
   - What's unclear: 是保留 demo-0408 的 4 步向导结构，还是改为 UI-SPEC 要求的单页表单
   - Recommendation: 以 UI-SPEC 为准（单页表单，字段清单见 UI-SPEC 视图 A），demo-0408 的 4 步向导是早期版本

3. **demand-approve 的视图注册时机**
   - What we know: 需要新建 demand-approve 视图，从 demand-sort 的「提交单位领导审批」按钮跳转
   - What's unclear: demand-approve 是否需要接收 collectionId 和 unitId 参数来加载数据
   - Recommendation: 通过 `navigate('demand-approve', {collectionId, unitId})` 传参，视图内用 `getViewParams` 读取

---

## Environment Availability

Step 2.6: SKIPPED（本阶段为纯本地 HTML + CDN 方案，无外部服务/CLI 依赖。CDN 资源在浏览器打开时按需加载，无需本地安装）

---

## Sources

### Primary (HIGH confidence)
- `my-project-code/demo/shared/views/demand.js` — 8 个已有视图实现，代码验证
- `my-project-code/demo/shared/core.js` — 全部 core API（registerView、navigate、toast、showModal、showDrawer、saveDraft、renderStepWizard 等）
- `my-project-code/demo/shared/data.js` — DATA 结构（demands、collectionPlans、roles 等）
- `my-project-wiki/raw/decisions/西南大学信息化项目管理办法.md` — BR-04 六类不予支持原文（第十三条）
- `.planning/phases/01-需求征集模块/01-CONTEXT.md` — 所有锁定决策（D-01 ~ D-17）
- `.planning/phases/01-需求征集模块/01-UI-SPEC.md` — 视图结构、字段清单、组件目录、文案规范

### Secondary (MEDIUM confidence)
- `my-project-wiki/wiki/concepts/需求征集模块.md` — 业务流程和核心功能说明（260409版本）
- `my-project-wiki/raw/docs/2026-03-26-信息化项目全生命周期管理系统-demo-design.md` — BR-04 引用确认
- `my-project-code/doce/ui-spec.md` — CDN header 模板和 shadcn 风格规范（UI-SPEC.md 引用来源）

### Tertiary (LOW confidence)
- 标签库预设类目 — ASSUMED，基于高校信息化业务场景合理推断

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — demo-0408 代码库直接验证
- Architecture: HIGH — 视图注册模式和改造方向均来自代码库直接分析
- Business rules (BR-04): HIGH — 直接引用《管理办法》原文
- Pitfalls: MEDIUM — 基于代码分析和已有模式推断，部分 ASSUMED

**Research date:** 2026-04-13
**Valid until:** 2026-05-13（demo 代码结构稳定，30天内有效）
