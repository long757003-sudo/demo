# Phase 1: 需求征集模块 - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-13
**Phase:** 01-需求征集模块
**Areas discussed:** Demo架构模式、需求申请表细节、拖拽排序体验、遴选页BR-04展示、260409会议to-do处理

---

## Demo 架构模式

| Option | Description | Selected |
|--------|-------------|----------|
| 继续内嵌到 app.html | 延续 demo-0408 模式，demand.js 新增/改造视图，navigate() 切换 | ✓ |
| 每个 OpenSpec 变更生成独立 HTML | pages/ 下新建 4 个独立文件，页面间跳转链接 | |

**User's choice:** 继续内嵌到 app.html

---

## 通知跳转方式

| Option | Description | Selected |
|--------|-------------|----------|
| navigate() 切到通知预填视图 | 固定跳转 notification-compose 视图 | |
| 判断 notification-template 是否已有视图 | 有则导航，无则 toast 提示 | ✓ |

**User's choice:** 判断 notification-template 是否已有视图

---

## 需求申请表字段深度

| Option | Description | Selected |
|--------|-------------|----------|
| 完整可交互 | 摘要可输入，标签可点选，多份提交可展示，自动填充有 toast | |
| 字段展示即可 | 字段渲染在表单中，不强制真实交互逻辑 | ✓ |

**User's choice:** 字段展示即可

---

## 暂存/提交按钮行为

| Option | Description | Selected |
|--------|-------------|----------|
| 两个按钮均有 toast 反馈 | 暂存 toast，提交跳转流程 | ✓ |
| 仅提交按钮有跳转 | 暂存不反馈 | |

**User's choice:** 两个按钮均有 toast 反馈

---

## 拖拽排序实现方式

| Option | Description | Selected |
|--------|-------------|----------|
| 引入 Sortable.js CDN | 真实拖拽体验，无需构建工具 | |
| 纯 vanilla JS 模拟 | 不引入新 CDN | ✓ |

**User's choice:** 纯 vanilla JS

---

## 拖拽交互形式

| Option | Description | Selected |
|--------|-------------|----------|
| 上移/下移按钮 | 每行旁边 ↑↓ 按钮，点击调整顺序 | ✓ |
| 真实鼠标拖拽 | dragstart/dragover/drop 原生 API | |

**User's choice:** 上移/下移按钮

---

## 单位领导审批时排序

| Option | Description | Selected |
|--------|-------------|----------|
| 审批页有独立排序展示 | T4 内嵌排序区块，也有上移/下移按钮 | ✓ |
| toast 提示即可 | 不在审批页实现排序 | |

**User's choice:** 审批页有独立排序展示

---

## 遴选页 BR-04 展示方式

| Option | Description | Selected |
|--------|-------------|----------|
| 行内展开精简选择 | 点「不支持」后行内展开 6 项 radio | |
| 弹窗 Modal | 弹出对话框展示 6 类原因 | |
| 右侧抽屉 Drawer | 右侧滑入抽屉展示六类原因 | ✓ |

**User's choice:** 右侧抽屉 Drawer

---

## BR-04 抽屉交互深度

| Option | Description | Selected |
|--------|-------------|----------|
| 单选 + 确认按钮 | 6 项 radio，选一个后确认 | |
| 展示即可不需选择 | 仅展示六类原因文字说明 | ✓ |

**User's choice:** 展示即可不需选择

---

## 专家评审入口

| Option | Description | Selected |
|--------|-------------|----------|
| 按钮展示，点击 toast 提示 | 展示入口但提示 Phase 3 实现 | |
| 不展示该入口 | Phase 1 遴选页不含专家评审入口 | ✓ |
| 跳转到专家评审页面 | Phase 3 完成后联通 | |

**User's choice:** 不展示该入口

---

## 遴选提交

| Option | Description | Selected |
|--------|-------------|----------|
| 需要提交按钮 | 标记完所有需求后，整体提交遴选结果 | ✓ |
| 即时生效无需提交 | 每条标记后立即保存 | |

**User's choice:** 需要提交按钮

---

## 260409 会议 To-Do 处理（Phase 1 相关）

| # | 项目 | 决策 |
|---|------|------|
| 1 | 摘要必填字段 | 展示即可 |
| 2 | 标签选择 + 标签库模块 | 完整可交互，Phase 1 纳入 |
| 3 | 多份需求申请表 | 列表展示多条 + 「新建一份需求」按钮 |
| 4 | 关键字段提示说明 | tooltip `?` icon |
| 5 | 单位领导审批排序 | T4 内嵌上移/下移（discuss-phase 已覆盖） |
| 6 | 审批开关 | 默认开启，可关闭跳过下一级 |
| 7 | 选人组件工号展示 | 所有场景统一「姓名 + 工号」 |
| 8 | 指派填报人交互 | 搜索 → 加入备选 → 二次确认 |
| 9 | 时间校验 | Demo 不做校验 |
| 10 | 流程阶段配置位置 | 征集配置页内嵌流程开关 |

---

## Claude's Discretion

- Mock 数据字段值和条数
- T2 需求列表筛选具体 filter 逻辑
- 标签库预设标签类目
- 各状态流转的状态名称和颜色标签

## Deferred Ideas

- 专家评审入口 — Phase 3
- 文件自动识别填充 — 展示字段不实现 AI 逻辑
- Phase 2-6 相关优化项 — 对应阶段处理
