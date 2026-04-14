---
change: notification-compose-enhance
title: 优化【新建/编辑通知】页面入口与表单字段 — 设计文档
---

# Design：notification-compose-enhance

## 一、整体改动范围

| 文件 | 变更类型 | 说明 |
|------|----------|------|
| `shared/nav.js` | 删除菜单项 | 移除 `notification-create` |
| `shared/data.js` | 新增字段 + 补充数据 | notifications 增加 `status` 字段；补充 1-2 条草稿通知 |
| `shared/views/notification.js` | 修改 VIEW 1 | notification-list：操作列草稿行改为「编辑」按钮 |
| `shared/views/notification.js` | 修改 VIEW 2 | notification-create：新增模板导入区、联系人字段、params.id 预填逻辑 |

---

## 二、nav.js — 删除菜单项

删除「通知管理」分组中的以下菜单项：
```js
{ id: 'notification-create', label: '新建/编辑通知', icon: 'bell-plus', roles: ['info-admin','info-leader'] },
```

---

## 三、data.js — notifications 数据结构调整

### 3.1 新增 `status` 字段
所有现有通知补充 `status: 'sent'`。

### 3.2 新增 2 条草稿通知
```js
{
  id: 'N009',
  type: 'overdue-warning',
  title: '汇报逾期预警 — 智慧校园统一身份认证平台',
  content: '您好：\n\n系统检测到「智慧校园统一身份认证平台」已超过规定汇报周期……',
  sender: '信息办管理员',
  sendTime: null,
  recipients: ['project-manager'],
  level: 'urgent',
  readStatus: {},
  deliveryStatus: {},
  channel: ['system', 'dingtalk'],
  status: 'draft',
  contactName: '张建国',
  contactInfo: 'zjg@swu.edu.cn / 023-68251234'
},
{
  id: 'N010',
  type: 'collection-notice',
  title: '2026年度信息化项目需求征集通知',
  content: '各单位：\n\n根据学校信息化建设工作安排，现启动2026年度……',
  sender: '信息办管理员',
  sendTime: null,
  recipients: [],
  level: 'info',
  readStatus: {},
  deliveryStatus: {},
  channel: ['system', 'email'],
  status: 'draft',
  contactName: '',
  contactInfo: ''
}
```

---

## 四、notification-list 视图改动

### 4.1 行渲染逻辑
草稿通知（`n.status === 'draft'`）：
- 操作列渲染「编辑草稿」按钮，`onclick="navigate('notification-create',{id:'N009'})"`
- 「发送时间」列显示 `<span class="tag tag-gray">草稿</span>`
- 「已读率」和「发送状态」列显示 `—`

已发送通知（`n.status === 'sent'` 或无 status）：行为保持不变。

### 4.2 状态筛选下拉
`nf-status` select 新增一项：
```html
<option value="draft">草稿</option>
```

客户端过滤 `_allRows` 数据需同步补充 `status` 字段。

---

## 五、notification-create 视图改动

### 5.1 页面顶部布局（从上到下）

```
[面包屑]
[页面标题行]  "新建通知" | "编辑草稿通知"（有 params.id 时）
─────────────────────────────────────
[Card A] 从模板导入（默认折叠）
─────────────────────────────────────
[Card B] 通知内容（表单，含新字段）
─────────────────────────────────────
```

> ⚠️ 「选择通知类型」Card 已移除（2026-04-14）。typeKey 导航仍支持，会直接预填标题/正文/级别字段，不再有类型选择卡片 UI。

### 5.2 Card A — 从模板导入

**折叠/展开行为：**
- 默认折叠，标题行右侧显示 `▶ 展开` / `▼ 收起`
- 点击标题行整行触发折叠

**内部布局：**
```
┌─────────────────────────────────────────────────────┐
│ 从模板导入                               ▶ 展开      │
└─────────────────────────────────────────────────────┘
（展开后）
┌─────────────────────────────────────────────────────┐
│  模块: [下拉▼]  节点: [下拉▼]  [查询]  [重置]        │
├─────────────────────────────────────────────────────┤
│  # │ 模块节点 │ 类型 │ 标题                │ 操作    │
│  1 │ 1-1 信息... │ 待阅 │ 【征集通知】...    │ [导入]  │
│  2 │ ...         │ 待办 │ ...               │ [导入]  │
│  （最多显示 8 条，无分页）                           │
└─────────────────────────────────────────────────────┘
```

**模块下拉选项：**
全部 / 需求征集 / 立项论证 / 招采管理 / 项目实施 / 项目终止 / 项目验收 / 运维管理

**节点下拉：**
- 默认「全部节点」
- 选择模块后，节点选项动态变更为该模块下所有 `nodeLabel` 去重列表（JS 过滤 `_importTmplData`）

**导入行为（`_importTmpl(seq)`）：**
1. 从 `_importTmplData` 找到对应 seq 的模板
2. `document.getElementById('notif-title').value = tmpl.title`
3. `document.getElementById('notif-content').value = tmpl.body`
4. 调用 `showToast('已导入模板：' + tmpl.title.slice(0,20) + '…')`
5. `document.querySelector('#notif-form-card').scrollIntoView({behavior:'smooth'})`

**模板数据：**
内联同名变量 `_importTmplData`（与 `notification-template` 视图中的 `_tmplData` 结构完全相同，独立复制，不跨视图引用）。

### 5.3 Card C — 表单新增字段

在「关联项目（选填）」字段之后，新增两个字段：

```html
<!-- 通知联系人 -->
<div class="form-item">
  <label class="form-label">通知联系人（选填）</label>
  <input class="form-control" id="notif-contact-name" placeholder="如：张建国">
</div>

<!-- 联系方式 -->
<div class="form-item">
  <label class="form-label">联系方式（选填）</label>
  <input class="form-control" id="notif-contact-info" placeholder="如：023-68251234 / zjg@swu.edu.cn">
</div>
```

### 5.4 params.id — 编辑草稿预填

视图函数入参改为 `function(params)`，在脚本段处理：
```js
var _draftId = params && params.id ? params.id : null;
if (_draftId) {
  // 从内联 _draftData（对应 data.js notifications 中 status==='draft' 的条目）找到记录
  // 填入：title, content, level, contactName, contactInfo
  // 页面标题改为「编辑草稿通知」，面包屑末尾改为「编辑草稿」
}
```

`_draftData` 为从 `DATA.notifications` 筛出 `status==='draft'` 的条目，结构与 `DATA.notifications` 一致。

---

## 六、权限

本变更不新增权限逻辑：
- `notification-create` 视图本身不做角色限制（由入口控制）
- 通知列表「+ 发送通知」按钮仅对 `info-admin` / `info-leader` 显示（原有逻辑保持不变）
- 草稿通知的「编辑草稿」按钮同样仅对 `info-admin` / `info-leader` 可见

---

## 七、修改文件清单

| 文件 | 具体变更 |
|------|---------|
| `shared/nav.js` | 删除 `notification-create` 菜单项 |
| `shared/data.js` | `notifications` 每条加 `status: 'sent'`；追加 N009、N010 草稿通知（含 `contactName`/`contactInfo`） |
| `shared/views/notification.js` | VIEW 1：草稿行操作列改为「编辑草稿」按钮，`nf-status` 加「草稿」选项，`_allRows` 补充 status 字段 |
| `shared/views/notification.js` | VIEW 2：入参改为 `(params)`；新增 Card A（模板导入，含折叠逻辑、两级联动筛选、导入回填）；新增联系人/联系方式字段；新增草稿预填脚本 `_draftData` |
