---
change: notification-template
title: 新增【通知模板】功能 — 设计文档
---

# Design：通知模板库视图

## 页面布局

- 顶部：面包屑 `通知管理 > 通知模板库`
- 页面标题：通知模板库 + 右侧「+ 新建模板」按钮（跳转 notification-create）
- 过滤栏（card）：
  - 阶段下拉：全部 / 需求征集 / 立项论证 / 招采管理 / 项目实施 / 项目终止 / 项目验收 / 运维管理
  - 类型下拉：全部 / 待办 / 待阅
  - 模板总数统计文字
  - 右侧「重置」按钮
- 内容区（按模块分组，动态过滤）：
  - 每个模块为一个 card，标题如「模块一：需求征集」
  - 每个节点为一个子区块，标题如「节点 1-1 信息办发布征集通知」
  - 表格列：# | 接收角色 | 类型 | 渠道 | 通知标题 | 正文摘要 | 操作

## 视图注册

- 视图 ID：`notification-template`
- 文件：`shared/views/notification.js`（追加在末尾）

## 数据来源

静态数组 `_tmplData`，内联在视图函数内，覆盖矩阵全部 6 大模块约 40 条代表性模板。
字段：`module`, `moduleIndex`, `nodeKey`, `nodeLabel`, `seq`, `notifKind`, `channels`, `recipients`, `title`, `body`, `typeKey`

## 联动机制

- 「使用」按钮调用 `_useTmpl(typeKey)`
  - 有 typeKey → `navigate('notification-create', {typeKey})`，notification-create 初始化时自动调用 `_selectNotifType(typeKey)` 预选类型
  - 无 typeKey → `navigate('notification-create')`

## 权限

仅 `info-admin`、`info-leader` 在侧边栏可见。

## 修改文件清单

| 文件 | 变更 |
|------|------|
| `shared/nav.js` | 「通知管理」分组添加 `notification-template` 菜单项；parentMap 添加相关映射 |
| `shared/views/notification.js` | 追加 VIEW 4 `notification-template`；`notification-create` 内联脚本添加 typeKey 联动 |
