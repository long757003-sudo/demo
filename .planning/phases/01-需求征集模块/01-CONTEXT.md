# Phase 1: 需求征集模块 - Context

**Gathered:** 2026-04-13
**Status:** Ready for planning

<domain>
## Phase Boundary

演示从信息办发起需求征集 → 单位系统管理员指派 → 项目负责人填报 → 单位排序/领导审批 → 信息办遴选的完整闭环。

**本阶段新增范围（260409会议补充）：**
- 标签库管理模块（独立视图，供需求填报时选择标签）

**明确不在本阶段：**
- 专家评审流程（Phase 3 实现，本阶段遴选页不展示该入口）

</domain>

<decisions>
## Implementation Decisions

### Demo 架构模式
- **D-01:** 继续内嵌到 app.html，在 demand.js 里新增/改造视图，通过 `navigate()` 切换，不新建独立 HTML 文件
- **D-02:** 发起征集配置页提交后跳转通知预填页：判断 notification-template 是否已有对应视图——有则 `navigate()` 导航，无则 toast 提示「Demo：通知功能待完善」

### 征集配置页（发起征集）
- **D-03:** 征集配置页内嵌流程开关（如「是否需要专家评审」toggle），流程节点配置在发起征集表单里直接完成，不跳转独立配置模块
- **D-04:** Demo 不做征集时间校验，任何时候均可操作，不因时间未到而锁定功能

### 需求申请表（项目负责人填报）
- **D-05:** 260409 新增字段（摘要、标签选择、文件自动识别填充）**展示即可**，字段渲染在表单中但不强制真实交互逻辑
- **D-06:** 暂存/提交两个按钮均有 toast 反馈；点「提交」后跳转到单位系统管理员视图以推进流程演示
- **D-07:** 允许多份需求申请表：填报列表页展示多条记录，表单页有「新建一份需求」按钮
- **D-08:** 关键字段旁加 tooltip `?` icon 作为提示说明（hover 展示说明文字）

### 标签库模块（新增）
- **D-09:** 完整可交互的标签库管理视图，需求申请表中的标签选择从中取数，Phase 1 完整实现

### 用户选择 & 审批交互
- **D-10:** 所有选人组件（指派填报人、审批人选择等）统一展示「姓名 + 工号」，如「王一凡 50240014」
- **D-11:** 单位系统管理员指派填报人：「搜索 → 加入备选列表 → 可多次搜索累积 → 二次确认提交」交互
- **D-12:** 审批页「是否需要下一级审批」开关**默认开启**，可手动关闭跳过；选「是」时展示审批人选择栏

### 拖拽排序
- **D-13:** 单位系统管理员排序页：纯 vanilla JS，用**上移/下移按钮**模拟排序，不引入拖拽库
- **D-14:** 单位领导 T4 审批详情页：页面内嵌独立的需求排序区块，同样用上移/下移按钮，展示领导也可调整排序

### 遴选页（信息办管理员）
- **D-15:** 每条需求标记「支持/不支持」；选「不支持」时从右侧滑入 Drawer，展示 BR-04 六类不予支持原因文字说明（仅展示，无需用户选择具体原因）
- **D-16:** Phase 1 遴选页**不展示**「发起专家评审」入口，该入口在 Phase 3 实现
- **D-17:** 遴选页底部有「提交遴选结果」按钮，点击后批量更新需求状态并发送通知（toast 反馈）

### Claude's Discretion
- 各视图内 Mock 数据的具体字段值和条数
- 需求列表 T2 筛选的具体 filter 实现方式（UI 展示筛选器，逻辑可简化）
- 标签库的预设标签类目（Claude 按业务场景合理设计）
- 各状态流转的具体状态名称和颜色标签

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### 业务流程与规则
- `my-project-wiki/wiki/concepts/需求征集模块.md` — 260409版完整业务流程、核心功能说明、数据表
- `my-project-wiki/wiki/synthesis/系统规则表.md` — BR-04 六类不予支持原因及所有硬规则
- `my-project-wiki/raw/meetings/260409会议纪要.md` — 功能优化要求（摘要字段、标签库、多份申请表、排序规则等）

### UI 与技术规范
- `my-project-code/doce/ui-spec.md` — shadcn 风格 UI 规范，CDN 引入模板，页面布局约定
- `my-project-wiki/wiki/concepts/系统视图规范.md` — 40个视图清单，T1/T2/T3/T4 页面模板说明

### 现有代码参考
- `my-project-code/demo/shared/views/demand.js` — 现有需求模块视图实现（demand-collect、collection-detail、demand-list 等），改造基础
- `my-project-code/demo/shared/` — 共享模块（core.js、data.js、nav.js）的现有模式

### 规划文档
- `.planning/ROADMAP.md` — Phase 1 的 4 个 OpenSpec 变更定义及 Success Criteria

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `demand.js` 中 `demand-collect`（征集列表）、`collection-detail`（征集详情）、`demand-list`（需求申报列表）视图已有基础实现，本阶段在此基础上改造扩展
- `_showNotifDrawer()` 抽屉组件已有实现，可参考用于 BR-04 右侧 Drawer
- `DATA.collectionPlans` Mock 数据结构已定义

### Established Patterns
- 视图注册：`registerView('view-name', function() { ... })`
- 导航：`navigate('view-name', {params})`
- 提示反馈：`toast('消息', 'info'|'success'|'error')`
- 抽屉组件：`showDrawer('标题', html内容)`
- 标签样式：`tag tag-green / tag-blue / tag-orange / tag-gray`

### Integration Points
- 需求申请表提交后需导航至单位系统管理员的排序视图
- 发起征集配置页提交后需判断 notification-template 视图是否存在
- 遴选页「提交遴选结果」后状态变更应反映在 T2 需求列表的筛选结果中

</code_context>

<specifics>
## Specific Ideas

- 260409 会议确认的演示账号：唐明-20053964（信息办领导/单位领导）、林已杰-20054379（信息办管理员/单位管理员）、王一凡-50240014（项目负责人）——Mock 数据应使用这些真实姓名和工号
- 遴选页 BR-04 Drawer 展示的六类原因来自系统规则表，下游 planner 需从 `系统规则表.md` 中提取准确原因列表
- 标签库视图是本阶段新增内容，roadmap 中未单独列为 OpenSpec 变更，planner 需决定是作为独立变更还是并入现有变更

</specifics>

<deferred>
## Deferred Ideas

- 专家评审入口及流程 — Phase 3 实现
- 「发起专家评审」按钮 — Phase 3 联通后补充
- 上传文件自动识别内容并填充 — 会议要求中的高级功能，Demo 中展示字段但不实现 AI 识别逻辑
- Phase 2-6 相关的会议优化项（通知模板、立项配置等）— 已记录在对应阶段规划中

</deferred>

---

*Phase: 01-需求征集模块*
*Context gathered: 2026-04-13 via discuss-phase + 260409 会议 to-do 处理*
