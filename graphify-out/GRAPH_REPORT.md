# Graph Report - /Users/longhaisen/Documents/my-project/信息化项目  (2026-04-11)

## Corpus Check
- 78 files · ~60,264 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 236 nodes · 308 edges · 23 communities detected
- Extraction: 92% EXTRACTED · 8% INFERRED · 0% AMBIGUOUS · INFERRED: 26 edges (avg confidence: 0.83)
- Token cost: 34,600 input · 8,900 output

## God Nodes (most connected - your core abstractions)
1. `系统规则表（43条硬规则）` - 11 edges
2. `需求征集模块` - 10 edges
3. `项目验收模块` - 9 edges
4. `field()` - 8 edges
5. `全生命周期管理系统（实体页面）` - 8 edges
6. `Demo 功能清单（demo-0408）` - 8 edges
7. `西南大学信息化项目全生命周期管理系统` - 8 edges
8. `textArea()` - 7 edges
9. `项目实施模块（第四步）` - 7 edges
10. `立项论证模块（第二步）` - 7 edges

## Surprising Connections (you probably didn't know these)
- `项目分级引擎（重大/中型/小型/微型）` --semantically_similar_to--> `项目分级规则（预算驱动自动判定）`  [INFERRED] [semantically similar]
  my-project-wiki/wiki/overview.md → my-project-wiki/wiki/concepts/项目分级规则.md
- `本科生院-2026年信息化项目需求入库评审结果通知` --conceptually_related_to--> `需求征集模块`  [INFERRED]
  raw/decisions/本科生院-2026年信息化项目需求入库评审结果通知.md → wiki/concepts/需求征集模块.md
- `西南大学信息技术服务类（成品软件）采购合同模板` --references--> `项目验收模块`  [INFERRED]
  raw/decisions/西南大学信息技术服务类（成品软件）采购合同模板.md → wiki/concepts/项目验收模块.md
- `申报书技术规范（钉钉集成+数据治理+运维接管）` --semantically_similar_to--> `项目申报书（立项论证核心表单）`  [INFERRED] [semantically similar]
  my-project-wiki/wiki/concepts/申报书技术规范.md → my-project-wiki/wiki/concepts/立项论证模块.md
- `西南大学信息化项目全生命周期管理系统—产品详细设计方案（wiki摘要）` --references--> `产品详细设计方案（原始文档）`  [EXTRACTED]
  wiki/sources/产品详细设计方案.md → raw/docs/西南大学信息化项目全生命周期管理系统 — 产品详细设计方案.md

## Hyperedges (group relationships)
- **项目分级规则驱动六大业务模块差异化流程** — xiangmufenjiguize_xiangmufenjiguize, overview_liuchengliuxian, lixianglunzengmokuai_lixianglunzengmokuai, xiangmuzhaocaimokuai_xiangmuzhaocaimokuai, xiangmushishimokuai_xiangmushishimokuai [EXTRACTED 1.00]
- **验收三要素：等保前置+分级规则+内容规范共同约束验收流程** — yanshouneirongguifan_dengyuqianzhiyaoqiu, yanshofenjiguize_yanshofenjiguize, yanshouneirongguifan_yanshouneirongguifan [EXTRACTED 0.95]
- **钉钉集成贯通申报书规范、技术架构与通知矩阵** — jishujiagou_dingtalk, baoshujishuguifan_baoshujishuguifan, tongzhijuzhen_daibantonzhi [INFERRED 0.85]
- **全生命周期模块链：需求征集→项目验收→项目运维** — 需求征集模块_concept, 项目验收模块_concept, 项目运维模块_concept [EXTRACTED 1.00]
- **Demo设计规格族：设计规格→功能清单→专家评审设计** — demo设计规格_source, demo功能清单_source, 阶段五专家评审设计_source [INFERRED 0.85]
- **验收准入门禁：等保测评前置+试运行+验收实施细则共同构成验收前置条件** — 等保测评前置_concept, 项目验收模块_concept, 验收阶段实施细则_source [EXTRACTED 0.95]
- **信息化项目全生命周期管控文件体系（申请表、立项通知、申报书、采购合同、验收细则）** — xndxq_need_request_form, xndxq_project_approval_notice, xndxq_project_declaration, xndxq_it_service_contract_dev, xndxq_it_service_contract_nondev, xndxq_acceptance_rules [EXTRACTED 0.95]
- **通知模板功能OpenSpec三件套（proposal+design+spec 共同定义并实现功能）** — code_notif_template_proposal, code_notif_template_design, code_notif_template_spec [EXTRACTED 1.00]
- **两次会议共同细化了需求征集流程和通知机制设计** — meeting_260323, meeting_260409, concept_demand_collection, concept_notification_template_feature [INFERRED 0.80]

## Communities

### Community 0 - "核心工具层（core.js）"
Cohesion: 0.08
Nodes (16): budgetToType(), closeDrawer(), closeModal(), confirmReturn(), detectChangeLevel(), getCurrentRole(), getCurrentRoleObj(), getCurrentView() (+8 more)

### Community 1 - "设计文档与Demo规格"
Cohesion: 0.12
Nodes (32): 2026-03-23 会议纪要（wiki摘要）, 260409 会议纪要（wiki摘要）, BR-05 校外专家比例验证规则, Demo 功能清单（demo-0408）, Demo 设计规格（2026-03-26）, Demo 设计规格原始文档（2026-03-26）, 阶段五专家评审管理设计原始文档（2026-03-27）, 产品详细设计方案（原始文档） (+24 more)

### Community 2 - "OpenSpec变更工作流"
Cohesion: 0.09
Nodes (27): 代码仓库规范 CLAUDE.md, 通知模板功能 Proposal（代码仓库）, UI规范 ui-spec.md（shadcn/ui风格）, 项目验收阶段, 需求征集阶段, 钉钉平台集成（单点登录+消息通知）, 专家评审机制, 通知矩阵（全生命周期通知设计） (+19 more)

### Community 3 - "立项论证与合同管理"
Cohesion: 0.12
Nodes (25): 合同关键条款（三类合同模板）, 经费管理规则（统一预算管用分离）, 质量保证金（验收合格前预留）, 项目申报书（立项论证核心表单）, 供应商调研（非单一来源≥3家）, 立项论证模块（第二步）, 二次论证不通过锁定规则（锁定1年）, 立项遴选规则（重点/优先支持类型） (+17 more)

### Community 4 - "全生命周期实体与角色"
Cohesion: 0.12
Nodes (20): 申报书技术规范（钉钉集成+数据治理+运维接管）, 角色体系（12类，含用户单位系统管理员）, 全生命周期管理系统（实体页面）, 协助人角色, 监督与评估机制（领导小组/审计处/师生举报）, 钉钉深度集成（SSO+消息+微应用）, 工作流引擎（Flowable/Activiti）, 技术架构（Vue3+SpringBoot+Flowable+钉钉） (+12 more)

### Community 5 - "通知视图模块（notification.js）"
Cohesion: 0.12
Nodes (4): _renderFieldPanel(), _renderTmplContent(), _tmplChannelBadges(), _updateFieldPanel()

### Community 6 - "审批流程视图（approval.js）"
Cohesion: 0.28
Nodes (11): field(), renderChapter0(), renderChapter1(), renderChapter2(), renderChapter3(), renderChapter4(), renderChapter5(), renderChapter6() (+3 more)

### Community 7 - "需求征集视图（demand.js）"
Cohesion: 0.17
Nodes (0): 

### Community 8 - "经费财务视图（finance.js）"
Cohesion: 0.39
Nodes (5): computeWarrantyEnd(), warrantyDays(), warrantyEndCell(), warrantyEndStr(), warrantyRemainingCell()

### Community 9 - "通知模板OpenSpec变更集"
Cohesion: 0.32
Nodes (8): 通知模板功能 Design（代码仓库）, 通知模板功能 Spec（代码仓库，已归档）, 通知模板功能 Tasks（代码仓库，施工单）, nav.js（侧边栏导航配置文件）, notification.js（通知视图文件）, 通知模板功能 Design（wiki归档）, 通知模板功能 Spec（wiki归档，已归档）, 通知模板功能 Tasks（wiki归档，施工单）

### Community 10 - "评审流程视图（review.js）"
Cohesion: 0.29
Nodes (0): 

### Community 11 - "系统管理视图（system.js）"
Cohesion: 0.48
Nodes (6): arrow(), doQuery(), flowNode(), flowRow(), renderUserTable(), roleTag()

### Community 12 - "仪表盘视图（dashboard.js）"
Cohesion: 0.5
Nodes (0): 

### Community 13 - "导航模块（nav.js）"
Cohesion: 1.0
Nodes (2): highlightNav(), renderNav()

### Community 14 - "项目列表视图（project.js）"
Cohesion: 0.67
Nodes (0): 

### Community 15 - "采购合同体系"
Cohesion: 1.0
Nodes (3): 信息化采购合同体系, 信息技术服务类（软件开发）采购合同模板, 信息技术服务类（非软件开发）采购合同模板

### Community 16 - "专家列表视图（expert.js）"
Cohesion: 1.0
Nodes (0): 

### Community 17 - "操作日志视图（logs.js）"
Cohesion: 1.0
Nodes (0): 

### Community 18 - "Wiki与代码仓库规范"
Cohesion: 1.0
Nodes (2): 项目仓库结构约定（代码库+Wiki库）, Wiki Schema — 知识库维护规范

### Community 19 - "数据层（data.js）"
Cohesion: 1.0
Nodes (0): 

### Community 20 - "验收视图（acceptance.js）"
Cohesion: 1.0
Nodes (0): 

### Community 21 - "信息办（信息化建设办公室）"
Cohesion: 1.0
Nodes (1): 信息办（信息化建设办公室）

### Community 22 - "西南大学"
Cohesion: 1.0
Nodes (1): 西南大学

## Knowledge Gaps
- **37 isolated node(s):** `信息办（信息化建设办公室）`, `项目仓库结构约定（代码库+Wiki库）`, `Wiki Schema — 知识库维护规范`, `六大业务模块（线性流程）`, `260409会议纪要（功能确认会）` (+32 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `专家列表视图（expert.js）`** (2 nodes): `expert.js`, `renderExpertRows()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `操作日志视图（logs.js）`** (2 nodes): `logs.js`, `actionTag()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Wiki与代码仓库规范`** (2 nodes): `项目仓库结构约定（代码库+Wiki库）`, `Wiki Schema — 知识库维护规范`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `数据层（data.js）`** (1 nodes): `data.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `验收视图（acceptance.js）`** (1 nodes): `acceptance.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `信息办（信息化建设办公室）`** (1 nodes): `信息办（信息化建设办公室）`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `西南大学`** (1 nodes): `西南大学`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `系统规则表（43条硬规则）` connect `立项论证与合同管理` to `全生命周期实体与角色`?**
  _High betweenness centrality (0.018) - this node is a cross-community bridge._
- **Why does `全生命周期管理系统（实体页面）` connect `全生命周期实体与角色` to `立项论证与合同管理`?**
  _High betweenness centrality (0.017) - this node is a cross-community bridge._
- **Are the 3 inferred relationships involving `系统规则表（43条硬规则）` (e.g. with `二次论证不通过锁定规则（锁定1年）` and `等保测评前置要求（竣工验收前提）`) actually correct?**
  _`系统规则表（43条硬规则）` has 3 INFERRED edges - model-reasoned connections that need verification._
- **Are the 2 inferred relationships involving `需求征集模块` (e.g. with `本科生院-2026年信息化项目需求入库评审结果通知` and `通知联动机制（4类通知）`) actually correct?**
  _`需求征集模块` has 2 INFERRED edges - model-reasoned connections that need verification._
- **Are the 2 inferred relationships involving `项目验收模块` (e.g. with `西南大学信息技术服务类（成品软件）采购合同模板` and `BR-05 校外专家比例验证规则`) actually correct?**
  _`项目验收模块` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `信息办（信息化建设办公室）`, `项目仓库结构约定（代码库+Wiki库）`, `Wiki Schema — 知识库维护规范` to the rest of the system?**
  _37 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `核心工具层（core.js）` be split into smaller, more focused modules?**
  _Cohesion score 0.08 - nodes in this community are weakly interconnected._