# 操作日志

> 格式：`## [YYYY-MM-DD] 操作类型 | 标题`
> 查看最近10条：`grep "^## \[" wiki/log.md | tail -10`

## [2026-04-18] fix | C5 项目分级规则 重大项目预算边界明确

- `wiki/concepts/项目分级规则.md` 重大：`>200万` → `≥200万`；中型：`100-200万` → `100万（含）–200万（不含）`
- 用户决策：200万归重大，与 core.js budgetToType `>= 200` 对齐
- 来源：cross-repo audit 20260418 C5

## [2026-04-18] fix | C4 项目分级规则 重大项目专家数对齐

- `wiki/concepts/项目分级规则.md` 重大项目论证专家数：≥5 → ≥7（含校外，须为奇数，校外≥1/3）
- 来源：cross-repo audit 20260418 C4；对照 concepts/专家评审规则.md BR-05

## [2026-04-18] fix | C3 立项论证模块 BR-11 评审维度更新

- `wiki/concepts/立项论证模块.md` BR-11：8维度→4维度，列出具体维度及权重，保留原8维度历史注记
- 来源：cross-repo audit 20260418 C3；对照 data.js reviewDimensions.approval

## [2026-04-18] fix | C2 completed 状态显示名称对齐

- `code/demo/shared/core.js` — `completed → '已验收'` 改为 `completed → '已完成'`，与 glossary 规范名一致
- 来源：cross-repo audit 20260418 C2

## [2026-04-18] fix | C1 BR-06→BR-13 编号对齐（code + wiki）

- `code/demo/shared/views/approval.js` — 3处 BR-06 → BR-13（行778、885、886）
- `code/demo/shared/data.js` — P005 frozenReason BR-06 → BR-13
- `wiki/concepts/系统视图规范.md` — 第17行 BR-06→BR-13，顺手修正"五维度"→"四维度"（C3遗留）
- 来源：cross-repo audit 20260418 C1

## [2026-04-17] update | 业务流程状态机图.md — 专家评审子流程 A 同步

- 子流程 A 补充 BR-05 专家人数要求表（微型/小型3名，中型5名，重大7名）
- A3 新增：邀请卡利益冲突声明必填、3天提醒/5天超时自动拒绝机制
- A9 分支拆分：新增退回修改路径（rework-pending → A10）
- A10 新增：项目负责人修改提交流程，超时→timeout-rejected（BR-E05）
- 新增专家邀请状态机和评审状态全集（5个 status 值）
- 来源：_audit-20260417.md § D.2（过时 synthesis）；对照 concepts/专家评审规则.md Demo 实现流程

## [2026-04-17] propagate | 新建 concepts/项目锁定与解锁规则.md

- 创建 `wiki/concepts/项目锁定与解锁规则.md`（论证锁定1年/验收锁定6个月，两种触发路径，project_lock 实现建议）
- 更新 `concepts/立项论证模块.md` — BR-13 行补 [[项目锁定与解锁规则]] 引用
- 更新 `concepts/项目验收模块.md` — BR-29 行补 [[项目锁定与解锁规则]] 引用
- 来源：_audit-20260417.md § B.2（概念散落）

## [2026-04-17] propagate | 新建 concepts/钉钉集成规范.md

- 创建 `wiki/concepts/钉钉集成规范.md`（三大集成点：SSO、消息通知、微应用；TBD-D01~D03 待确认接口）
- 更新 `concepts/技术架构.md` — 原内容改为 [[钉钉集成规范]] 引用
- 更新 `concepts/申报书技术规范.md` — 原内容改为 [[钉钉集成规范]] 引用
- 更新 `entities/全生命周期管理系统.md` — 对接系统表钉钉行补链接
- 来源：_audit-20260417.md § B.1（概念散落）

## [2026-04-17] fix | AI 标签粒度矛盾解决

- `concepts/专家评审规则.md` — 新增"AI 标签层级说明"：人工智能为父标签，机器学习/计算机视觉/迁移学习为子标签，四者并列保留
- 决策依据：选项 A（2026-04-17 用户确认），匹配时不要求层级对齐，任意一个涵盖即满足条件
- 来源：_audit-20260417.md § F（矛盾标记第 3 条）

## [2026-04-17] fix | 类型误用修正（3个页面）

- `sources/业务流程说明书V1.1.md`：source → synthesis（整合8份来源，含跨文档推理）
- `sources/demo设计规格.md`：source → decision（含技术方案决策内容）
- `sources/demo功能清单.md`：source → synthesis（代码级分析汇总产出）
- 来源：_audit-20260417.md § C（类型误用）

## [2026-04-17] update | 系统规则表.md — BR 编号全量同步

- 新增第十节：专家评审独立流程（BR-E01~E09，软规则）
- 全部 R 规则表新增"BR 对应"列，标注与 concepts 页 BR 编号的对应关系
- 第二节添加注释，明确"论证专家配置（硬规则）"与"专家评审独立流程（软规则）"的边界
- 架构决策：2026-04-17 确认专家评审为软规则（选项 A），结果仅作参考，不阻断主流程
- sources 字段补入 7 个 concepts 页路径

## [2026-04-17] audit | Wiki 全面体检 _audit-20260417.md

- 执行 `/audit`，生成 `wiki/_audit-20260417.md`
- 扫描 41 个页面，总体评分 7.8/10
- 关键发现：6 个高频术语未入 glossary（P0）、BR 编号待同步（P0）、2 个 synthesis 过时、3 处类型误用

## [2026-04-17] glossary | 新增"机构与参与方术语"分区

- 新增 6 个术语：二级单位、信息化建设办公室、数智化建设领导小组、承建方、工作小组、运维团队
- 来源：_audit-20260417.md § G.1（glossary 漂移 — 高频术语未收录）

## [2026-04-17] update | 专家评审规则.md — 补充 demo 实现流程

- 更新 `wiki/concepts/专家评审规则.md`（新增"Demo 实现流程"章节）
- 内容来源：demo 代码分析（review.js / expert.js / data.js）
- 新增内容：4步发起向导、BR-05分级规格、专家邀请状态机、须知门控页、意见填写结构、退回修改后续（BR-E04/E05）、评审状态全集、角色权限汇总

## [2026-04-16] ingest | 专家库标签.md

- 创建 `wiki/sources/专家库标签.md`（41行原始标签，去重后35个，分职能标签6个+专业领域标签29个）
- 更新 `wiki/concepts/专家评审规则.md`（新增"专家标签体系"章节，含标签分类与语义重叠⚠️标注）
- 更新 `wiki/index.md`（sources 区新增专家库标签条目）
- 语义合并：「计算机科学/计算机科学技术/计算机/计算机应用/计算机技术」→ 计算机科学与技术；「教育技术」→ 教育技术学
- 合并后专业领域标签从 29 → 24 个，总标签 30 个
- AI 子领域粒度不一致（迁移学习/计算机视觉/机器学习 vs 人工智能）暂不调整

---

## [2026-04-15] ingest | 业务流程说明书V1.2（增加业务状态表）

- raw/docs 下 6 份详细说明书 + 独立流程说明书更新（详细 V1.1→V1.2，独立流程 V1.0→V1.1）
- 变更说明：每一步骤增加双视角状态列（信办管理员视角 + 参与角色视角）
- 创建 `wiki/synthesis/业务状态表.md`（合并 6 模块 + 专家评审独立流程全部状态对照表）
- 更新 `wiki/sources/业务流程说明书V1.1.md`（标题改 V1.2，文档版本列更新，新增 V1.2 变更说明章节）
- 更新 `wiki/index.md`（synthesis 区新增「业务状态表」条目）
- 注：03~06 详细说明书 V1.2 精简了 BR 业务规则表；01/02 及独立流程保留 BR 列表
- 注：模块 concept 页的流程叙述内容仍与 V1.1 一致（V1.2 未改流程，仅增加状态标签），未重写

---

## [2026-04-15] ingest | 业务流程说明书V1.1（8份体系）

- 新增文件：概要说明书 + 6 份详细说明书（01-06）+ 独立流程说明书-专家评审，共 8 份
- 创建 `wiki/sources/业务流程说明书V1.1.md`（合并摘要页，覆盖 8 份文档）
- **V1.1 核心变化**：专家评审从需求征集子流程抽离为独立支撑流程，取消冷却期，评审结果仅作参考
- 重构 `wiki/concepts/专家评审规则.md`（独立流程 5 阶段 + BR-E01~E09 + 服务场景三态）
- 重写 `wiki/concepts/需求征集模块.md`（V1.1 三阶段流程 + BR-01~09 + 历史沿革对照表）
- 更新 `wiki/concepts/立项论证模块.md`（主流程 10 步 + 子流程 B/C/D/E + BR-10~15）
- 更新 `wiki/concepts/项目招采模块.md`（主流程 7 步 + 子流程 F + BR-16~20 + 自动监控规则）
- 更新 `wiki/concepts/项目实施模块.md`（主流程 8 步 + 子流程 G/H/I/J + BR-21~25）
- 更新 `wiki/concepts/项目验收模块.md`（主流程 9 步 + 子流程 K/L/M/N + BR-26~30）
- 更新 `wiki/concepts/项目运维模块.md`（主流程 7 步 + 子流程 O/P/Q + BR-31~36）
- 更新 `wiki/entities/角色体系.md`（补充视角说明：UI 12 类 vs 业务流程 9 类，非矛盾）
- 更新 `wiki/index.md`（sources 区新增业务流程说明书V1.1；需求征集、专家评审描述更新为 V1.1）
- 注：[[系统规则表]] 与 [[业务流程状态机图]] 的 BR 编号尚未按新体系同步，后续 `/lint` 时处理

---

## [2026-04-14] update | 业务流程状态机图（按角色泳道重构）

- 重构 `wiki/synthesis/业务流程状态机图.md`：由混合流程图改为按角色泳道 + 子流程分离结构
- 每个模块独立展示参与角色、主流程步骤表（含操作角色列）、各子流程拆出独立表格
- 新增子流程：需求专家评审(A)、供应商调研(B)、专家论证会组织(C)、论证整改(D)、论证不通过(E)、采购执行方式(F)、进度汇报(G)、变更申请(H)、延期申请(I)、项目终止(J)、验收前置校验(K)、内部初验整改(L)、验收专家要求(M)、验收不合格(N)、巡检(O)、故障工单(P)、数据备份(Q)
- 新增附表：系统自动监控规则汇总（10条，含触发条件、自动动作、来源条文）

---

## [2026-04-14] query+synthesis | 业务流程状态机图

- 创建 `wiki/synthesis/业务流程状态机图.md`（六大模块完整状态机，含所有状态节点、流转条件、自动化规则与冷却期约束）
- 更新 `wiki/index.md`（synthesis 区新增条目）

---

## [2026-04-14] ingest | notification-template OpenSpec（proposal + design + spec）

- 创建 `wiki/decisions/通知模板库功能决策.md`（为什么新增独立模板库而非扩展现有新建通知页）
- 创建 `wiki/concepts/通知管理模块.md`（渠道策略、通知模板库视图规格：37条静态模板、typeKey联动逻辑、权限 info-admin/info-leader）
- 更新 `wiki/index.md`（concepts 新增通知管理模块、decisions 新增通知模板库功能决策）
- 注：tasks.md 按规范跳过

---

## [2026-04-10] ingest | 260409会议纪要.md

- 创建 `wiki/sources/260409会议纪要.md`（参会6人，功能确认会，9项待办）
- 更新 `wiki/concepts/需求征集模块.md`（升级为260409版流程：新增需求征集阶段专家评审环节；新增摘要/标签字段；支持多份申请；分管领导审批时可排序）
- 更新 `wiki/concepts/专家评审规则.md`（新增260409规则：多项目按最高级别、优先响应模式、留言讨论、修改摘要要求、手写签名功能、采纳规则待确认）

---

## [2026-04-10] ingest | 2026-03-27-阶段五专家评审管理-design.md

- 创建 `wiki/sources/阶段五专家评审设计.md`（技术施工文档：专家7字段规范、黑名单独立存储、7个视图ID、BR-05验证逻辑）

---

## [2026-04-10] ingest | demo-0408（raw/docs/demo-0408/）

- 代码级读取 index.html + app.html + 全部11个 JS 文件（共约8000行）
- 创建 `wiki/sources/demo功能清单.md`（12角色、50视图、核心交互逻辑、6条业务规则代码确认、状态流转图、完整视图权限映射表）
- 更新 `wiki/index.md`

---

## [2026-04-10] ingest | 2026-03-26-信息化项目全生命周期管理系统-demo-design.md

- 创建 `wiki/sources/demo设计规格.md`（Demo技术方案、12角色、4类通知联动机制、25步演示脚本）
- 创建 `wiki/concepts/系统视图规范.md`（40视图完整清单、4种页面模板T1-T4详细规格、通知联动说明）
- 更新 `wiki/entities/角色体系.md`（角色数从11→12，新增用户单位系统管理员独立角色、合同管理员独立列出、财务管理员只读权限说明）
- 更新 `wiki/index.md`

---

## [2026-04-09] synthesis | 通知矩阵

- 创建 `wiki/synthesis/通知矩阵.md`（6大模块、31个操作节点、130条通知、11类角色）
- 包含待办/待阅区分、通知渠道策略、触发方式说明
- 更新 `wiki/index.md`（synthesis 区新增条目）

## [2026-04-08] query+synthesis | 系统规则表

- 创建 `wiki/synthesis/系统规则表.md`（43条硬规则，9类，含触发方式与来源条文）
- 更新 `wiki/index.md`（synthesis 区新增条目）

---

## [2026-04-08] lint | 解决5组矛盾标记

- **M1** 协助人角色：更新 `entities/角色体系.md`（10→11类，正式加入协助人行），更新 `entities/协助人角色.md`（解除⚠️）
- **M2** 需求征集流程：按260323会议版本重写 `concepts/需求征集模块.md` 业务流程（新增系统管理员/排序步骤）
- **M3** 全局里程碑：更新 `entities/全生命周期管理系统.md`（新增绩效评估/报废节点），解除 `sources/260323会议纪要.md` 两处⚠️
- **M4** 钉钉集成：更新 `concepts/技术架构.md`（新增钉钉集成专节），更新 `concepts/申报书技术规范.md` 和 `entities/全生命周期管理系统.md`（去除待补充标注）
- **M5** 等保测评前置：更新 `concepts/项目验收模块.md`（流程图加前置校验步骤，关键规则区新增等保条款，解除⚠️）
- 更新 `wiki/index.md`（两处⚠️标注清除）

---

## [2026-04-07] ingest | 剩余7个文件批量处理

- `本科生院-2026年信息化项目需求入库评审结果通知.md`：文件为空，跳过
- 创建 `wiki/sources/表单模板汇总.md`（需求申请表/申报书/立项通知书/终止意见表）
- 创建 `wiki/concepts/申报书技术规范.md`（⚠️ 新增钉钉集成要求）
- 创建 `wiki/concepts/合同关键条款.md`（三类合同模板关键条款）
- 更新 `wiki/concepts/技术架构.md`（标注钉钉集成待补充）
- 更新 `wiki/entities/全生命周期管理系统.md`（新增钉钉/招采系统对接）
- 更新 `wiki/index.md`、`wiki/overview.md`

---

## [2026-04-07] ingest | 西南大学信息化建设项目验收阶段实施细则.md

- 创建 `wiki/sources/验收阶段实施细则.md`
- 创建 `wiki/concepts/验收分级规则.md`（⚠️ 标注与管理办法的矛盾）
- 创建 `wiki/concepts/验收内容规范.md`（六大验收维度）
- 更新 `wiki/concepts/项目验收模块.md`（标注等保前置要求和分级矛盾）
- 更新 `wiki/index.md`

---

## [2026-04-07] ingest | 西南大学信息化项目管理办法.md

- 创建 `wiki/sources/信息化项目管理办法.md`（文号：西校〔2025〕39号）
- 创建 `wiki/concepts/经费管理规则.md`（第十章）
- 创建 `wiki/concepts/监督与评估机制.md`（第十一章）
- 创建 `wiki/concepts/立项遴选规则.md`（第十八条）
- 更新 `wiki/concepts/项目分级规则.md`（补充微型项目简化路径）
- 更新 `wiki/index.md`

---

## [2026-04-07] ingest | 260323会议纪要.md

- 创建 `wiki/sources/260323会议纪要.md`
- 创建 `wiki/concepts/专家评审规则.md`
- 创建 `wiki/entities/协助人角色.md`
- 更新 `wiki/entities/角色体系.md`（标注矛盾：协助人角色待补充）
- 更新 `wiki/concepts/需求征集模块.md`（标注矛盾：流程待按会议决议更新）
- 更新 `wiki/index.md`、`wiki/overview.md`

---

## [2026-04-07] ingest | 西南大学信息化项目全生命周期管理系统 — 产品详细设计方案.md

- 创建 `wiki/sources/产品详细设计方案.md`
- 创建 `wiki/entities/全生命周期管理系统.md`
- 创建 `wiki/entities/角色体系.md`
- 创建 `wiki/concepts/项目分级规则.md`
- 创建 `wiki/concepts/技术架构.md`
- 创建 `wiki/concepts/需求征集模块.md`
- 创建 `wiki/concepts/立项论证模块.md`
- 创建 `wiki/concepts/项目招采模块.md`
- 创建 `wiki/concepts/项目实施模块.md`
- 创建 `wiki/concepts/项目验收模块.md`
- 创建 `wiki/concepts/项目运维模块.md`
- 更新 `wiki/index.md`、`wiki/overview.md`
