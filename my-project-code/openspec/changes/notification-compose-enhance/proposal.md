---
change: notification-compose-enhance
title: 优化【新建/编辑通知】页面入口与表单字段
type: feature
status: deprecated
created: 2026-04-XX
deprecated: 2026-04-20
deprecated_reason: "工作流对齐时作废 —— 本 change 只有 design.md 无 proposal.md，且改动范围属于 Phase 6 `notification-management` 的子集，应在 Phase 6 启动后作为该阶段 plan 的一部分重新组织"
---

# Proposal：已废弃

## 废弃说明

本 change 在 2026-04-20 的 GSD/OpenSpec 工作流对齐时被作废，原因：

1. **流程不完整**：仅有 `design.md`，从未生成 `proposal.md`，未走过 `/opsx:propose` 流程。
2. **归属错位**：改动范围（notification-list 草稿编辑 / notification-create 模板导入 + 联系人字段 / nav 精简）属于 ROADMAP Phase 6「通知&日志&系统管理模块」中 `notification-management` 这个 change 的子集，不应以独立 change 形式先行。
3. **与 `demand-collection-wizard-enhance` 中的"模板导入 Card"改动重叠**：那个 change 已经实现了向导内复用 notification-create 的模板导入 UI，本 change 再独立做一份会产生两条不同步的实现路径。

## 保留的设计线索

`design.md` 中对通知表单字段（联系人 / 联系方式 / 草稿编辑按钮 / notifications 新增 status 字段）的具体描述**可在 Phase 6 执行时作为参考**，但需要重新走完整 propose 流程，不再沿用本 change 的 id。

## 不做什么

- 不删除本目录 —— 保留 design.md 作为历史记录（符合主 CLAUDE.md "原始资料永远只增不删" 元原则）。
- 不在 ROADMAP 里单独登记本 change —— 相关需求已由 Phase 6 `notification-management` 覆盖。
