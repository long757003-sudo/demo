---
change: project-overview
title: 新增【项目全景】顶级菜单 — 功能规格
status: proposed
---

# Spec：项目全景模块

## 功能规格

### 1. 菜单入口

- 位置：侧边栏新分组「项目全景」，排在「运维管理」之后、「系统管理」之前。
- 菜单项（2 个）：
  | ID | 显示文字 | 图标 | 可见角色 |
  |----|---------|------|---------|
  | `project-overview-board` | 生命周期看板 | kanban | info-admin / info-leader / leadership-office / leadership-group / project-manager / unit-admin |
  | `project-overview-detail` | 项目全景详情 | telescope | 同上 |

### 2. 权限过滤规则

函数 `window._ovFilterProjects(list)` 统一处理：

| 角色 | 可见范围 |
|------|---------|
| `info-admin` / `info-leader` / `leadership-office` / `leadership-group` | 全量 `DATA.projects` |
| `project-manager` | `p.manager === DATA.currentUser.name` |
| `unit-admin` | `p.unit === DATA.currentUser.unit` |
| 其它角色（含 expert） | `[]`，即使菜单被绕过也返回空列表 |

### 3. 生命周期看板（project-overview-board）— 表格列表形态

> 本视图为**表格列表**（非卡片看板），理由：便于排序 / 导出 CSV / 分析处理。阶段维度通过"当前阶段"列与阶段过滤下拉表达。

#### 3.1 过滤与操作控件

| 控件 | HTML ID | 联动 |
|------|---------|------|
| 单位下拉 | `#ov-filter-unit` | onchange → `_ovBoardRender()` |
| 类型下拉 | `#ov-filter-type` | onchange → `_ovBoardRender()` |
| 阶段下拉 | `#ov-filter-stage` | onchange → `_ovBoardRender()` |
| 关键字输入 | `#ov-filter-kw` | oninput → `_ovBoardRender()`（防抖可选） |
| 重置按钮 | `#ov-filter-reset` | onclick → 清空四者并重渲 |
| 导出 CSV 按钮 | `#ov-export-csv` | onclick → `_ovExportCSV()` |

#### 3.2 表格列（10 列）

表格容器 ID：`#ov-board-table`。每列表头 `<th>` 点击触发 `_ovBoardSort(colKey)`（"操作"列除外）；同列二次点击反转升降序。

| 列 | colKey | 字段来源 | 排序方式 | 样式 |
|----|--------|---------|---------|------|
| 项目编号 | `id` | `project.id` | 字典序 | 定宽 80px |
| 项目名称 | `name` | `project.name` | 字典序 | 主列加粗，点击跳 detail |
| 单位 | `unit` | `project.unit` | 字典序 | — |
| 负责人 | `manager` | `project.manager` | 字典序 | — |
| 类型 | `type` | 映射 `major/mid/small/micro` → 重大/中型/小型/微型 | 按原始 type 值 | tag 样式 |
| 预算（万） | `budget` | `project.budget` | 数值 | 右对齐 |
| 当前阶段 | `status` | 映射 `status` → 阶段名（见 §3.3） | 按 §3.3 枚举序 | 徽章；颜色按阶段类别 |
| 进度 | `progress` | `project.progress` | 数值 | mini 进度条 + `N%` 文字 |
| 最近更新 | `updatedAt` | `max(operationLogs[].time WHERE targetId ∈ {project.id, demandId, proposalId, contractId})`；无则 `project.startDate` | 日期序 | `YYYY-MM-DD` |
| 操作 | — | 「查看全景 →」链接，onclick `navigate('project-overview-detail', {id: project.id})` | 不排序 | 链接样式 |

**默认排序：** `updatedAt` 降序。

**空态：** 过滤后无行时，表体显示单行跨列文案"无符合条件的项目"。

#### 3.3 阶段枚举（用于"当前阶段"列徽章与阶段过滤下拉）

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

#### 3.4 导出 CSV

函数：`window._ovExportCSV()`。
- 导出范围：应用当前所有过滤条件、按当前排序后的**全部行**（忽略分页）
- CSV 列：与表格列一致，**不含"操作"列**；"进度"写为百分比字符串如 `85%`；"当前阶段"写为阶段名文字
- 编码：UTF-8 with BOM（Excel 中文兼容）
- 文件名：`项目全景_{YYYYMMDD_HHmm}.csv`（使用本地时区）
- 实现：`Blob` + `URL.createObjectURL` + `<a download>` 纯客户端；不依赖任何第三方库

#### 3.5 分页

- 每页 20 行（常量 `OV_PAGE_SIZE = 20`）
- 总行数 ≤ `OV_PAGE_SIZE` 时**隐藏分页控件**
- 分页控件位置：表格底部居中
- 按钮：首页 / 上一页 / 页码按钮（当前高亮，最多显示 7 个页码）/ 下一页 / 末页
- 换页时仅重渲染行，不重新应用过滤/排序

### 4. 项目全景详情（project-overview-detail）

#### 4.1 URL 参数

| 参数 | 说明 |
|------|------|
| `id` | 项目 ID。缺省时取 `_ovFilterProjects(DATA.projects)[0].id`；仍为空则渲染空占位"无可查看的项目"。 |

#### 4.2 基本信息 card 字段

| 字段 | 来源 |
|------|------|
| 项目编号 | `project.id` |
| 项目名称 | `project.name` |
| 单位 | `project.unit` |
| 负责人 | `project.manager` |
| 类型标签 | `project.type` → 重大/中型/小型/微型（沿用 `adaptProject` 的映射，若无则 inline 映射） |
| 预算 | `project.budget` + "万" |
| 当前阶段徽章 | 按 `project.status` → 阶段名 + 颜色（绿色=运行中，灰色=已完成/终止，黄色=冻结） |
| 整体进度 | `project.progress` 渲染为进度条 |

#### 4.3 阶段聚合块（10 块 = 9 阶段 + 1 日志）

每块的 HTML 容器 ID 规则：`#ov-stage-{seq}`，seq ∈ 1..10。

**通用渲染规则：**
- 块标题行：`第 {seq} 阶段 · {阶段名}` + 折叠切换 icon + "打开完整视图 →" 链接（无关联数据或无跳转目标时隐藏链接）
- 数据为空时块内文案："本阶段暂无记录"
- 当前阶段（`statusToStageSeq[project.status] === seq`）默认展开，其余默认折叠；**块 10 项目日志**默认折叠（不因 currentStage 命中而展开）

**各块字段清单：**

| 块 | 数据源与 where | 字段展示顺序 |
|----|---------------|------------|
| 1 需求征集 | `demand = DATA.demands.find(d => d.id === project.demandId)`；`plan = DATA.collectionPlans.find(cp => cp.id === demand.collectionId)` | **征集名称**（`plan.title`；无则显示"—"）、**项目摘要**（`demand.summary`，即需求填报页 `df-summary` 字段、maxlength 200；回退顺序 `demand.summary \|\| demand.background \|\| project.background`，全无则显示"—"）、**标签**（`demand.tags[]`，渲染为 tag-pill，若空数组显示"暂未打标签"）、**附件**（`demand.attachments[]`，以 `{name, size}` 列表渲染成可点击条目；Demo 阶段 onclick 仅弹 toast "Demo 不支持下载"，若空数组显示"无附件"）、征集批次编号（`demand.collectionId`）、申报单位（`demand.unitId`）、填报人（`demand.submittedBy`）、预算估算（`demand.budgetEstimate + "万"`）、排序（`demand.sortOrder`）、申报状态徽章（`demand.status`）、驳回原因（`demand.unitRejectionReason \|\| demand.rejectionCategory`，若有） |
| 2 立项论证 | `DATA.proposals.find(p => p.id === project.proposalId)` | 申报书状态、submittedAt、建设目标（goal 截断 120 字）、technicalReview 路径（reviewPath）、轮次（reviewRound）、审定决策（approvalDecision.result + approvedBy + comment）、经费核定（fundingAllocation.confirmedAmount + 万） |
| 3 专家评审记录 | `DATA.reviews.filter(r => r.projectId === project.id \|\| r.demandId === project.demandId)`，按 `date` 升序 | 每条评审：triggerScene、date、experts（映射为姓名）、weightedScore、finalConclusion、reworkRequirement（若有） |
| 4 合同采购 | `DATA.contracts.filter(c => c.projectId === project.id)` | 合同号、供应商、金额、签订日期、状态、付款节点表格（node/ratio/amount/status/date） |
| 5 项目实施 | `project.progress` + `DATA.progressHistory.filter(h => h.projectId === project.id)` 按 period 倒序 | 当前进度条、汇报历史表格（period/pct/submittedBy/submittedAt） |
| 6 延期/变更 | `DATA.operationLogs.filter(l => l.targetId === project.proposalId \|\| l.targetId === project.id)` 且 `action` 含 "变更"/"延期"/"驳回" | 时间、操作人、action、detail、changes（前后对比） |
| 7 验收 | `DATA.acceptances.filter(a => a.projectId === project.id)` | 初验通过时间、试运行起止、试运行月数、正式验收状态、正式验收日期、验收结论、报告文件名 |
| 8 运维 | `DATA.opsRecords.filter(o => o.projectId === project.id)` + `DATA.faultTickets.filter(f => f.projectId === project.id)` | 运维记录表（日期/类型/操作人/内容/状态）、故障工单表（级别/标题/上报/处理状态/解决时间） |
| 9 终止/完成 | `project.status === 'terminated' \|\| 'completed' \|\| 'frozen'`；否则空 | 状态徽章、frozenReason（若冻结）、frozenUntil（若冻结）、归档完成日期（completed 取 `project.deadline` 或实际完成日期，若无则显示"—"） |
| 10 项目日志 | `DATA.operationLogs.filter(l => [project.id, project.demandId, project.proposalId, project.contractId].filter(Boolean).indexOf(l.targetId) >= 0)`，按 `time` 升序 | 完整操作时间线表格：时间、操作人、角色、所属模块（module）、动作（action）、目标名称（targetName）、明细（detail）、字段变更（changes 数组渲染为 `字段: before → after` 列表）。表头右上角显示"共 N 条"计数。 |

#### 4.4 "打开完整视图" 跳转映射

| 块 | 跳转目标 | 参数 |
|----|---------|------|
| 需求征集 | `demand-detail` | `{id: demandId}` |
| 立项论证 | `proposal-fill` | `{id: proposalId}`（现有视图已支持按 ID 查看） |
| 专家评审记录 | `review-list` | `{projectId: project.id}`（若现有视图不支持该过滤参数则直接跳列表，首版不强改 review-list） |
| 合同采购 | `contract-ledger` | `{projectId: project.id}`（同上，首版不强改） |
| 项目实施 | `implement` | `{id: project.id}` |
| 延期/变更 | `delay-change` | `{id: project.id}` |
| 验收 | `acceptance-list` | `{projectId: project.id}`（同上） |
| 运维 | `ops-records` | `{projectId: project.id}` |
| 终止/完成 | `terminate` | `{id: project.id}`（若已完成则不显示链接） |
| 项目日志 | **不提供跳转** | 全量日志条目直接在块内表格呈现；`audit-log` 视图仅 `sys-admin` / `info-leader` 可见，跳转会因角色权限掉线，故此块不设"打开完整视图"链接 |

### 5. 本变更引入的 DATA 字段 & 字段缺口

#### 5.1 本变更新增 / 补齐 mock 的字段

| 字段路径 | 类型 | 状态 | 说明 | Mock 覆盖策略 |
|---------|------|------|------|-------------|
| `DATA.demands[*].summary` | `string` (≤200) | **既有字段**（`demand-fill` 页已写入 `df-summary`），但现有 mock 记录多数未填 | 需求填报页"摘要"字段（maxlength 200）；用于块 1 项目摘要展示 | 5 条候选 demand 各补 1 句 2-3 行摘要（贴合各自 projectName） |
| `DATA.demands[*].tags` | `string[]` | **本变更新增字段** | 需求标签，值域参考 `DATA.tagLibrary`（若已定义），否则自由字符串 | 5 条候选各填 2–4 个标签；其余条目填 `[]` |
| `DATA.demands[*].attachments` | `{name:string, size:string}[]` | **本变更新增字段** | 需求申请附件，格式参照 `DATA.collectionPlans[*].attachments` | 5 条候选各填 1–2 个附件；其余条目填 `[]` |

Mock 候选 demand（覆盖多状态，保证块 1 展示效果完整）：
- D001（已支持进入实施，对应 P001 有完整日志）
- D004（草稿态，对应 P004 刚入需求阶段）
- D018（单位已批准）
- D020（信办筛选中）
- D009（驳回，便于演示驳回原因展示）

实现时检查每条 demand 是否已有 `summary` 值；若已有保留不覆盖，只补缺失的 5 条。`tags` / `attachments` 由于是新增字段，所有条目均需写入（候选条目填值，其余填 `[]`）。

#### 5.2 字段缺口（不阻塞本变更）

以下视图参数**可能**不支持，首版按"能跳就跳、不能跳就只展示本块聚合"的原则处理，不强改现有视图：

- `review-list` / `contract-ledger` / `acceptance-list` 是否接受 `projectId` 过滤参数 — 实现时以 `getViewParams('<view>')?.projectId` 实测为准；若不支持，跳转后用户看到的是全量列表，不影响本块已聚合的数据。
- `proposal-fill` 是否有 `readonly` 模式 — 首版照常跳转（用户可自行返回）。

以上缺口**不阻塞**本变更交付；若缺口导致跳转体验明显割裂，在归档前补一轮小变更处理。

### 6. 不做的事（与 design.md 对齐）

- 不改 `DATA.projects/proposals/reviews/contracts/acceptances/opsRecords/...` 等其它数组的字段结构（仅 `DATA.demands` 扩 2 个字段，已在 §5.1 明确）
- 不动 `project-detail` 及任何既有视图
- 不引入第三方图表库（看板用纯 CSS Grid）
- 不新增样式到 `shared/style.css`（全部内联 style）
