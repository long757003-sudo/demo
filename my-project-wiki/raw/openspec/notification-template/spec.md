---
change: notification-template
title: 新增【通知模板】功能 — 功能规格（已归档）
status: archived
---

# Spec：通知模板库

## 功能规格

### 1. 菜单入口

- 位置：侧边栏「通知管理」分组，排在「新建/编辑通知」之后
- 显示文字：通知模板
- 权限：`roles: ['info-admin','info-leader']`

### 2. 过滤行为

| 筛选项 | 控件 | 联动方式 |
|--------|------|---------|
| 阶段 | select#tf-module | onchange 触发 `_tmplFilter()` |
| 类型 | select#tf-kind | onchange 触发 `_tmplFilter()` |
| 重置 | button | 清空两个 select，重新过滤 |

过滤结果：实时更新 `#tmpl-content` 内容区 HTML 和 `#tmpl-count` 统计文字。

### 3. 模板条目

每条模板展示：
- `#`：矩阵序号
- 接收角色：文字
- 类型标签：待办（橙色 tag-orange）/ 待阅（蓝色 tag-blue）
- 渠道徽章：站内 / 钉钉 / 邮件 / 短信（channel-badge）
- 通知标题：原始模板标题含变量占位符
- 正文摘要：正文摘要首句
- 「使用」按钮：btn-primary，字号 11px

### 4. 使用模板跳转

`window._useTmpl(typeKey)`:
- `typeKey` 非空且在 `_typeMap` 中存在 → `navigate('notification-create', {typeKey})`
- 否则 → `navigate('notification-create')`

`notification-create` 初始化尾部：
```javascript
(function() {
  var p = getViewParams('notification-create');
  var initKey = p && p.typeKey ? p.typeKey : '';
  if (initKey && _typeMap[initKey]) { window._selectNotifType(initKey); }
})();
```

### 5. 模板数据覆盖范围

| 模块 | 覆盖节点 | 条目数 |
|------|---------|-------|
| 需求征集 | 1-1 到 1-5 | 6 |
| 立项论证 | 2-1 到 2-7 | 8 |
| 招采管理 | 3-1 到 3-3 | 5 |
| 项目实施 | 4-1 到 4-4 | 6 |
| 项目终止 | 4-5 | 2 |
| 项目验收 | 5-2 到 5-6 | 6 |
| 运维管理 | 6-1 到 6-4 | 4 |
| **合计** | | **37** |
