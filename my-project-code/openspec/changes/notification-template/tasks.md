---
change: notification-template
title: 新增【通知模板】功能 — 施工单
status: done
---

# Tasks：通知模板库

## 已完成任务

- [x] nav.js：「通知管理」分组添加 `notification-template` 菜单项（roles: info-admin, info-leader）
- [x] nav.js：parentMap 添加 `notification-template`、`notification-template-create`、`notification-template-edit` 映射
- [x] notification.js：追加 VIEW 4 `registerView('notification-template', ...)`
  - [x] 静态模板数据 `_tmplData`（37 条，覆盖 6 大模块）
  - [x] 过滤栏：阶段 + 类型双维度过滤
  - [x] 内容区：按模块→节点两级分组渲染
  - [x] `_tmplFilter()` / `_tmplReset()` / `_useTmpl()` 全局函数
- [x] notification.js：`notification-create` 视图末尾添加 typeKey 联动初始化逻辑
