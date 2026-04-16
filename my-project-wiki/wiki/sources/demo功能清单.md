---
title: Demo 功能清单（demo-0408）
type: source
created: 2026-04-10
updated: 2026-04-10
sources: [raw/docs/demo-0408/index.html, raw/docs/demo-0408/app.html, raw/docs/demo-0408/shared/]
tags: [demo, 功能清单, 视图, 交互逻辑]
---

# Demo 功能清单（demo-0408）

基于对 `raw/docs/demo-0408/` 全部 JS 源文件的代码级读取，整理的完整功能清单。涵盖 12 个角色、50 个视图、核心交互逻辑与业务规则。

---

## 一、数据结构（data.js）

### 角色列表（12 个）

| 角色 ID | 完整名称 | 简称 |
|---------|---------|------|
| `leadership-group` | 数智化建设领导小组 | 领导小组 |
| `leadership-office` | 领导小组办公室 | 领导小组办公室 |
| `info-leader` | 信息办领导 | 信息办领导 |
| `info-admin` | 信息办管理员 | 信息办管理员 |
| `unit-leader` | 用户单位分管领导 | 单位分管领导 |
| `unit-sysadmin` | 用户单位系统管理员 | 单位系统管理员 |
| `project-manager` | 用户单位项目负责人（李明·教务处） | 项目负责人 |
| `project-assistant` | 用户单位项目协助人 | 项目协助人 |
| `contract-admin` | 合同管理员 | 合同管理员 |
| `finance-admin` | 财务管理员 | 财务管理员 |
| `expert` | 专家委员会 | 专家 |
| `sys-admin` | 系统管理员 | 系统管理员 |

### 主要数据集合

| 集合 | 主要字段 |
|------|---------|
| `projects` | id, name, unit, manager, type, budget, status, progress, demandId, proposalId, contractId |
| `proposals` | projectName, budget, status, submittedAt, deadline, reviewRound, reviewTaskId, lastRejection |
| `experts` | name, title, org, type(tech/business/user), scope(internal/external), field, status |
| `expertInvites` | reviewName, reviewType, launchedAt, scheduledAt, invites[] |
| `collectionPlans` | title, startDate, endDate, status, workflowConfig |
| `contracts` | id, projectName, vendor, amount, signDate, endDate, warrantyYears, payments[] |
| `notifications` | title, type, level, sendTime, readStatus |
| `operationLogs` | time, operator, role, module, action, targetId, detail, changes |
| `workflowTemplates` | name, description, isDefault, steps[] |
| `changeRecords` | projectId, changeTypes, level, originalBudget, newBudget, status |

### 通知类型（16 种）
需求征集通知 | 征集方案退回 | 需求退回 | 需求不予支持 | 立项申报通知 | 申报书退回 | 专家评审邀请 | 评审结果通知 | 项目冻结通知 | 立项通知书 | 立项不通过通知 | 延期/变更/终止审批结果 | 汇报逾期预警 | 验收评审邀请 | 验收结果通知 | 重大故障上报 | 合同到期提醒

---

## 二、核心函数库（core.js）

### 角色与路由
- `getCurrentRole()` — 从 localStorage 获取当前角色（默认 project-manager）
- `switchRole(roleId)` — 切换角色，重新渲染导航和视图
- `registerView(id, fn)` — 注册视图函数
- `navigate(viewId, params)` — 导航到指定视图，支持传递参数
- `renderView(viewId)` — 渲染视图到 `#main-content`；监听 hashchange 自动触发

### 草稿管理
- `saveDraft(formId, data)` / `loadDraft(formId)` / `clearDraft(formId)` — localStorage 持久化

### UI 组件
- `toast(msg, type, duration)` — 临时提示（success/error/warning/info）
- `showModal(title, bodyHtml, buttons)` / `closeModal()` — 模态框
- `showReturnDialog(title, onConfirm)` — 退回原因对话框
- `showDrawer(title, bodyHtml)` / `closeDrawer()` — 侧边抽屉
- `renderTable(columns, rows)` — 通用表格渲染
- `breadcrumb(...items)` — 面包屑导航
- `renderStepWizard(steps, currentStep)` — 步骤向导

### 标签与格式化
- `projectTypeTag(type)` — 项目级别标签（微型/小型/中型/重大）
- `projectStatusTag(status)` — 项目状态标签
- `budgetToType(budget)` — 预算→项目级别
- `deadlineClass(dateStr)` — 截止日期 CSS 样式（超期红/临近橙/正常）
- `formatDate(d)` — 日期格式化
- `roleDisplayName(roleId)` — 角色 ID→人名（project-manager → 李明）

### 业务规则
- `detectChangeLevel(originalBudget, newBudget, changeTypes)` — 变更等级判断（重大/一般/信息）
- `logOperation(module, action, targetId, targetName, detail, changes)` — 记录操作日志

---

## 三、导航菜单（nav.js）

菜单共 7 个分组，按角色动态显示：

| 分组 | 菜单项 | 可见角色 |
|------|--------|---------|
| 首页 | 工作台首页（dashboard） | 所有 |
| 通知管理 | 通知列表 | 所有 |
| 通知管理 | 新建/编辑通知 | info-admin, info-leader |
| 需求管理 | 需求征集、需求管理 | info-admin/leader/unit-admin/unit-leader/project-manager |
| 项目管理 | 立项管理、项目列表、采购、实施、延期变更、终止 | 多角色 |
| 专家管理 | 专家库、黑名单、邀请记录 | info-admin/leader; 专家有单独入口 |
| 评审管理 | 评审列表、创建任务、我的任务（expert）、邀请响应（expert） | 多角色 |
| 运维管理 | 验收、运维记录、故障工单、系统使用、合同台账、经费管理 | 多角色 |
| 系统管理 | 用户权限、流程配置、操作日志 | sys-admin/info-leader |

---

## 四、视图清单与功能说明（50 个视图）

### 4.1 工作台（dashboard.js）

**`dashboard` — 工作台首页（所有角色）**
- 统计卡片：待办数、在建项目数、即将超期数、待审批数（随角色变化）
- 快捷入口：按角色显示不同的高频操作入口
- 待办事项：urgent（红）/ reminder（橙）/ normal 三级；点击跳转对应视图
- 项目动态：5条最新状态变化
- 系统通知：按 sendTime 倒序，显示未读标记，按通知类型自动分级（urgent/warning/info）

---

### 4.2 需求管理（demand.js，8 个视图）

**`collection-create` — 创建征集方案**（info-admin）
- 标题、描述、起止日期、附件
- 通知配置：接收单位、联系人、发送方式
- 流程模板选择与节点配置（需求填报→单位审核→需求遴选）

**`collection-detail` — 征集方案详情**（info-admin, info-leader）
- Tab：基本信息 | 通知记录 | 工作流配置 | 统计分析
- 统计：已提交单位数、总需求数、总预算、分派数、单位提交进度表

**`demand-list` — 需求管理列表**（多角色，按角色过滤数据）
- 表格：项目名称、单位、预算、优先级、状态、需求人、确认人
- 按角色分化操作：project-manager 可编辑/查看；unit-leader 可批准/驳回；info-leader 遴选确认
- 状态：待单位审核 / 待遴选 / 已采纳 / 已实施 / 已否决

**`demand-fill` — 填报需求申请**（project-manager, project-assistant）
- 字段：项目名称、单位、负责人、联系方式、功能描述、技术方案、预期投入金额、优先级
- 草稿自动保存；退回后可修改重提
- 提交后状态变为"待单位审核"

**`demand-assign` — 需求分派**（unit-sysadmin）
- 为每个需求指派填写人（可多选）
- 生成授权二维码，支持权限有效期设置

**`demand-sort` — 需求排序**（unit-sysadmin 提交，unit-leader 审核）
- 拖拽排序需求优先级
- 显示各需求预算总额
- 提交后进入单位领导审核

**`demand-collect` — 需求填报入口**（project-manager, project-assistant）
- 4 步向导：基本信息→功能描述→技术要求→附件上传
- 草稿保存与加载；附件多文件上传

**`demand-select` — 需求遴选**（info-leader）
- 汇总全部已提交需求，多选框选择采纳
- 筛选：按单位、按预算范围、按优先级
- 实时显示已遴选数量和总采纳预算
- 生成遴选结果通知

---

### 4.3 立项管理（approval.js，7 个视图）

**`proposal-list` — 立项申报列表**（多角色）
- 表格：项目名称、预算级别（标色）、单位、状态、负责人、截止日期
- 按角色和状态显示不同操作按钮：
  - project-manager → 填报申报书
  - unit-leader → 审核（status=待单位审核）
  - info-admin → 初审（status=初审中）
  - info-leader → 审批（status=审批中）
  - leadership-office → 审定（status=审定中，小型及以上）
  - leadership-group → 审定（status=审定中，重大项目）

**`proposal-fill` — 填报/编辑申报书**（project-manager）
- 分 7 章（步骤向导）：
  - 第0章：基本信息（项目名称、单位、负责人、协助人选择 modal、类型、来源、建设性质、预算、经费来源拆分、建设期）
  - 第1章：基本情况（背景、必要性、与规划关系）
  - 第2章：建设方案（目标、功能需求、技术方案、集成方案、安全方案）
  - 第3章：基础设施需求（服务器/存储/网络；**BR-11**：通用硬件不得自行采购）
  - 第4章：数据与安全（数据来源分类、共享需求、安全措施、个人信息保护）
  - 第5章：经费预算（科目明细、软/硬/服务采购清单）
  - 第6章：其他说明
- 预算输入自动触发 `budgetToType` 判断项目级别
- 草稿自动保存；提交后状态→"待单位审核"

**`proposal-approve` — 申报书审批**（按状态分角色）
- 完整申报书 6 Tab 展示（只读）
- 审批操作面板（按当前角色和状态动态渲染）：
  - unit-leader：单位审核通过 / 退回修改（`showReturnDialog`）
  - info-admin：初审通过（触发微型/重大/其他分支逻辑）/ 初审退回
  - info-leader：审批通过 / 退回修改
  - leadership-office/group：审定通过 → navigate to `approval-notice` / 审定不通过
- 所有操作通过 `logOperation` 记录

**`approval-notice` — 下达立项通知书**（info-admin）
- 自动生成项目编号（P+年份+序号）
- 含项目名称、预算、负责人、建设期、通知正文（模板化）
- 生成 PDF 下载；确认发送后 navigate 回列表

**`self-review` — 微型项目自行论证**（project-manager）
- 论证方式选择（会议论证/专家评议）
- 论证日期、参与人员表格、论证意见、结论 radio（通过/不通过）
- 附件上传（纪要、签到表）
- 提交后 navigate to `info-confirm`

**`info-confirm` — 微型项目确认**（info-admin）
- 展示自行论证材料
- 确认通过 → navigate to `proposal-approve`
- 退回补充 → `showReturnDialog`，navigate to `self-review`

**`preliminary-review` — 初审视图**（info-admin）
- 申报书初审展示、材料完整性核对清单
- 初审意见输入；审核通过 / 退回按钮

---

### 4.4 专家管理（expert.js，4 个视图）

**`expert-pool` — 专家库**（info-admin/leader）
- 表格：姓名、职称、单位、类别（技术/业务/用户）、来源（校内/校外）、研究领域、状态
- 统计：正常专家数、校内数、校外数
- 搜索/筛选（姓名/单位、类别、来源）
- info-admin 可：编辑、加入/移出黑名单、新增；其他角色只读
- **BR-05** 说明：校外专家须不少于 1/3

**`expert-blacklist` — 专家黑名单**（info-admin）
- 表格：姓名、职称、单位、加入原因、加入时间
- 移出黑名单按钮
- 黑名单专家在发起评审时自动排除（disabled）

**`expert-respond` — 专家评审邀请响应**（expert）
- 待回复邀请卡片（评审名称、类型、有效期提醒：3天内确认，超5天视为拒绝）
- 接受邀请 / 拒绝邀请（填写拒绝原因）→ `logOperation` & 刷新
- 已确认评审卡片分离展示

**`expert-invitations` — 专家邀请记录**（info-admin, info-leader）
- 表格：项目名称、评审类型、发起/评审时间、已邀请数、已确认数、校外已确认数、BR-05 状态
- BR-05 实时校验（人数奇数 + 校外≥1/3 + 总人数≥3）
- 邀请详情 modal（点击操作列）

---

### 4.5 评审管理（review.js，5 个视图）

**`review-list` — 评审列表**（info-admin, info-leader, leadership-office）
- 表格：项目名称、评审类型、发起时间、评审日期、状态（未开始/进行中/已完成）
- info-admin 可发起评审（"+ 发起评审"按钮）
- 操作：查看详情；进行中可点击"填写意见"

**`review-launch` — 创建评审任务（4步向导）**（info-admin）
- Step 0：选择评审项目（单选）
- Step 1：评审类型 radio（论证/验收） + 评审日期
- Step 2：选择评审专家（多选，过滤黑名单；实时显示 BR-05 校验结果和校内/校外比例）
- Step 3：汇总确认 → 发起 → `logOperation` & navigate to `review-list`
- 状态管理：`window._reviewLaunchStep`

**`expert-confirm` — 领导专家名单确认**（info-leader）
- 展示信息办已选专家名单
- 领导可调整（移除/补增）；确认后 BR-05 重新检查
- 确认后 navigate to `review-launch`

**`my-reviews` — 我的评审任务**（expert）
- 表格：项目名称、评审类型、评审日期、状态（待填写/已填写）
- 有待回复邀请时显示提醒链接到 `expert-respond`
- "填写意见"按钮 → navigate to `review-opinion`

**`review-opinion` — 填写论证意见**（expert）
- 项目详情展示（只读）
- 评审意见 textarea
- 评审结论 radio：通过 / 不通过 / 需补充
- 附件上传（评审意见书）
- 提交后状态→"已填写"，logOperation 记录

---

### 4.6 项目管理（project.js，9 个视图）

**`project-list` — 项目列表**（所有角色）
- 表格：项目名称、单位、建设周期、状态（进度条）、负责人、截止日期
- 按状态/单位筛选
- 状态：需求阶段/立项论证/采购中/实施中/验收中/已验收/运维中/冻结/已终止

**`project-detail` — 项目详情**（所有角色，操作按角色分化）
- 三列布局：左侧进度信息、中间详情、右侧操作按钮
- 操作按角色显示：
  - project-manager：采购管理 / 进展报告 / 延期变更 / 终止申请
  - info-leader：审查
  - info-admin：编辑
  - 其他：只读

**`procurement` — 采购管理**（project-manager, contract-admin）
- Tab：采购方案 | 招标/比选 | 合同管理
- 采购方案：需求描述、采购方式（公开招标/竞争性磋商/单一来源/框架协议）、预期供应商
- 招标/比选：招标文件生成、投标单位评分、中标单位选择
- 合同管理：合同文件上传、金额、质保期、付款节点配置（预付/中期/尾款比例）

**`implement` — 实施进展报告**（project-manager）
- 表单：报告期（季度）、完成工作、遇到问题、下一步计划、进度百分比、里程碑状态
- 历史报告列表（表格）
- 提交后 navigate to `project-detail`；支持修改重提

**`delay-change` — 延期/变更申请**（project-manager）
- Tab：延期申请 | 项目变更
- 延期：原截止日期（只读）、新截止日期、原因、风险评估、附件
- 变更：变更类型 checkbox（预算/进度/技术路线/建设范围等）、变更内容详述、原/新预算、理由、影响评估
  - 预算变更自动调用 `detectChangeLevel` 判断变更等级（重大/一般/信息）

**`project-change` — 变更审批**（info-leader）

**`terminate` — 项目终止申请**（project-manager）
- 终止原因 radio（用户单位要求/上级要求/技术不可行/经费不足/其他）
- 终止说明、已完成工作汇总、遗留问题说明、附件（终止报告）
- 提交后 navigate to `project-list`

**`terminate-apply` — 终止申请详情**（info-leader 审批）

---

### 4.7 验收与运维（acceptance.js，6 个视图）

**`acceptance-list` — 验收管理列表**（所有角色）
- 表格：项目名称、内部初验状态（待开始/进行中/已完成）、正式验收状态（待组织/进行中/已完成）
- info-leader/info-admin 在"待组织"状态时显示"组织正式验收"按钮

**`internal-check` — 内部初验**（project-manager）
- 初验清单（功能/性能/安全/文档，每项 checkbox）
- 初验意见、结论 radio（通过/不通过）
- 初验报告上传

**`formal-acceptance` — 正式验收**（info-leader 组织，expert 填写意见）
- 组织信息：组织单位、组织人、验收日期
- 验收专家多选；综合验收意见；验收结论 radio
- 验收报告生成与下载

**`ops-records` — 运维记录**（project-manager）
- 运维操作日志表格（日期、类型、操作人、状态、说明）
- 新增运维记录表单（操作类型、描述、附件）

**`fault-tickets` — 故障工单**（project-manager, info-leader）
- 表格：编号、项目、故障描述、优先级（低/中/高/严重）、状态（待处理/处理中/已解决/已关闭）、处理人
- 新增工单按钮；工单详情与处理流程

**`system-usage` — 系统使用情况仪表盘**（info-leader, leadership-office, leadership-group）
- 统计：总项目数、在运行项目、完成项目、系统可用性、平均响应时间、日活跃用户
- 月度使用趋势图；故障统计（按类型/按项目）

---

### 4.8 经费与合同（finance.js，2 个视图）

**`contract-ledger` — 合同台账**（contract-admin 可备案，其余只读）
- 表格：合同 ID、项目名称、承建单位、合同金额、签订日期、合同/质保截止日期、质保剩余天数（红/橙/绿示警）、状态
- 付款进度按钮：展示预付款/中期款/尾款各节点状态
- 按状态筛选；keyword 搜索

**`finance-overview` — 经费管理**（finance-admin, info-leader）
- 统计卡片：年度预算总额 / 已批准经费 / 已支出经费 / 可用余额
- 年度使用进度条（已支出蓝 + 质保预留橙 + 可用余额灰）
  - 质保预留说明：验收后预留合同总价 10% 作为质保金
- 各项目经费明细表（批准经费、已支出、质保预留、使用进度条）
- 待审批付款申请表（项目、付款节点、金额、申请人；finance-admin/info-leader 可审批通过/退回）

---

### 4.9 通知管理（notification.js，3 个视图）

**`notification-list` — 通知列表**（所有角色）
- 表格：标题、级别（紧急红/提醒橙/通知蓝）、接收单位数、发送时间、状态（草稿/已发送/已过期）
- info-admin/info-leader 可发送通知；按级别筛选

**`notification-create` — 新建/编辑通知**（info-admin, info-leader）
- 字段：通知标题、级别 radio、通知内容、接收对象（按角色多选 / 按单位多选，radio 切换模式）、联系人
- 发送方式 radio（立即发送/定时发送）；附件上传
- 草稿自动保存；发送后 toast 提示
- 支持从其他模块携带上下文预填（跨模块联动）

**`notification-detail` — 通知详情**（所有角色）
- 通知内容展示；收件人列表（姓名、接收时间、已读/未读状态）
- 设为已读按钮（未读时）

---

### 4.10 日志管理（logs.js，2 个视图）

**`audit-log` — 操作日志（Tab 切换）**（sys-admin, info-leader）
- Tab 0 业务操作日志：操作时间、操作人、角色、模块、操作类型（提交/通过-绿；退回/驳回-红；黑名单/延期-橙；其他-蓝）、操作对象、详情摘要
  - 搜索/按操作类型/按日期范围筛选；导出按钮
- Tab 1 系统操作日志：登录、权限变更、配置修改、账户停用、自动备份等
- 标注："已锁定 — 操作日志为系统自动记录，不可修改或删除"
- 点击行 → navigate to `log-detail`

**`log-detail` — 日志详情**（sys-admin, info-leader）
- 基本信息卡片：日志编号、操作时间/人/角色/类型/模块/对象/IP/浏览器
- 字段变更记录表：字段名 | 变更前（红背景）| 变更后（绿背景）
- 标注："已锁定 — 本日志由系统自动生成，任何修改或删除操作均被禁止并记录"

---

### 4.11 系统管理（system.js，2 个视图）

**`user-permissions` — 用户与权限管理**（sys-admin）
- 用户列表：姓名、部门、角色（彩色标签）、状态（正常/停用）、最后登录
- 搜索：按姓名/部门 + 按角色筛选
- 操作：编辑（角色/部门）/ 停用（modal 确认）；新增用户按钮

**`flow-config` — 流程配置**（sys-admin）
- 流程模板卡片列表（默认模板不可删除）
- 默认模板流程图可视化（4个阶段，每节点含名称/操作类型/责任角色/颜色）：
  - 需求阶段：项目负责人填报 → 单位排序审核 → 信息办遴选
  - 立项阶段：填报申报书 → 信息办初审 → 专家论证 → 领导审定 → 下达立项通知
  - 采购阶段：采购调研填报 → 技术方案审核 → 合同备案
  - 验收阶段：内部初验 → 正式验收组织 → 专家综合评分

---

## 五、核心业务规则（代码级确认）

| 规则 | 逻辑 |
|------|------|
| **BR-01 项目级别** | <20万=微型；20-100万=小型；100-200万=中型；≥200万=重大 |
| **BR-05 专家组成** | 总人数须为奇数；校外比例≥1/3（总人数≥3时）；黑名单自动排除 |
| **BR-11 硬件采购** | 通用基础硬件（服务器/存储/网络）由信息办统筹，申报书中不得自采 |
| **BR-20 变更等级** | 重大：预算变更≥20% 或级别变化 或技术路线/范围大幅调整；一般：其他预算调整；信息：仅联系方式等基本信息 |
| **BR-40 质保金** | 验收后预留合同总价 10% 作为质保金，质保期满全额支付 |
| **BR-80 邀请超时** | 专家 3 天内确认；5 天未回复视为拒绝，自动补选 |

---

## 六、状态流转（项目生命周期）

```
需求阶段（demand）
    ↓ 遴选确认
立项论证（reviewing）
    ├─ 初审通过 → 微型：自行论证（self-review → info-confirm）
    │              其他：可免评审 或 专家评审（review-launch）
    │              重大：必须专家评审
    ├─ 专家评审完成 → 领导审定（leadership-office/group）
    ├─ 领导审定通过 → 下达立项通知书（approval-notice）
    ├─ 领导审定不通过 → 冻结（frozen），一年后可重提
    └─ 任意环节退回 → 待修改（project-manager 修改重提）
采购中（procurement）
    ↓ 合同签订
实施中（implementing）
    ├─ 按节点提交进展报告
    ├─ 延期/变更申请
    └─ 终止申请
验收中（acceptance）
    ↓ 内部初验 → 正式验收（专家评审）
已验收/运维中（ops）
    └─ 运维记录 | 故障工单 | 质保期内故障处理
```

---

## 七、视图注册完整映射表

| 视图 ID | 所在文件 | 角色权限（简） |
|---------|---------|--------------|
| `dashboard` | dashboard.js | 所有 |
| `collection-create` | demand.js | info-admin |
| `collection-detail` | demand.js | info-admin, info-leader |
| `demand-list` | demand.js | 多角色 |
| `demand-fill` | demand.js | project-manager, project-assistant |
| `demand-assign` | demand.js | unit-sysadmin |
| `demand-sort` | demand.js | unit-sysadmin, unit-leader |
| `demand-collect` | demand.js | project-manager, project-assistant |
| `demand-select` | demand.js | info-leader |
| `proposal-list` | approval.js | 多角色 |
| `proposal-fill` | approval.js | project-manager |
| `proposal-approve` | approval.js | unit-leader, info-admin, info-leader, leadership-office/group |
| `approval-notice` | approval.js | info-admin |
| `self-review` | approval.js | project-manager |
| `info-confirm` | approval.js | info-admin |
| `preliminary-review` | approval.js | info-admin |
| `expert-pool` | expert.js | info-admin, info-leader |
| `expert-blacklist` | expert.js | info-admin |
| `expert-respond` | expert.js | expert |
| `expert-invitations` | expert.js | info-admin, info-leader |
| `review-list` | review.js | info-admin, info-leader, leadership-office |
| `review-launch` | review.js | info-admin |
| `expert-confirm` | review.js | info-leader |
| `my-reviews` | review.js | expert |
| `review-opinion` | review.js | expert |
| `project-list` | project.js | 所有 |
| `project-detail` | project.js | 所有（操作按角色分化） |
| `procurement` | project.js | project-manager, contract-admin |
| `implement` | project.js | project-manager |
| `delay-change` | project.js | project-manager |
| `project-change` | project.js | info-leader |
| `terminate` | project.js | project-manager |
| `terminate-apply` | project.js | info-leader |
| `acceptance-list` | acceptance.js | 所有 |
| `internal-check` | acceptance.js | project-manager |
| `formal-acceptance` | acceptance.js | info-leader（组织），expert（填写） |
| `ops-records` | acceptance.js | project-manager |
| `fault-tickets` | acceptance.js | project-manager, info-leader |
| `system-usage` | acceptance.js | info-leader, leadership-office, leadership-group |
| `contract-ledger` | finance.js | contract-admin（可备案），其他只读 |
| `finance-overview` | finance.js | finance-admin, info-leader |
| `notification-list` | notification.js | 所有 |
| `notification-create` | notification.js | info-admin, info-leader |
| `notification-detail` | notification.js | 所有 |
| `audit-log` | logs.js | sys-admin, info-leader |
| `log-detail` | logs.js | sys-admin, info-leader |
| `user-permissions` | system.js | sys-admin |
| `flow-config` | system.js | sys-admin |

---

## 关联
- [[demo设计规格]] — 本文档对应的设计规格原文
- [[系统视图规范]] — 4种页面模板规范（T1-T4）
- [[角色体系]] — 完整角色定义
- [[系统规则表]] — 业务规则完整清单
- [[通知矩阵]] — 通知节点全量梳理
