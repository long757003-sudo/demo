---
change: demand-collection-wizard-enhance
title: 优化【需求征集】列表字段与创建向导流程 — 设计文档
---

# Design：demand-collection-wizard-enhance

## 一、整体改动范围

| 文件 | 变更类型 | 说明 |
|------|---------|------|
| `shared/data.js` | 新增字段 | `collectionPlans` 每条补充 `summary`、`contactName`、`contactInfo`、`scopeDesc` |
| `shared/views/demand.js` | 修改 VIEW 1 | `demand-collect` 列表新增 4 列 |
| `shared/views/demand.js` | 重构 VIEW 2 | `collection-create` 从 4 步（Step 0-3）重组为 3 步 + 总览确认 |

---

## 二、data.js — collectionPlans 字段补充

### 2.1 新增字段定义

每条 `collectionPlans` 补充：
```js
{
  // 既有字段...
  summary: '2026年度学校各单位信息化建设需求统一征集',
  contactName: '张华',
  contactInfo: '023-68253188 / zhanghua@swu.edu.cn',
  scopeDesc: '全部单位（教务处/招生处/...共8个单位）',
}
```

### 2.2 Mock 数据建议

| 字段 | 说明 | 示例 |
|------|------|------|
| `summary` | 一句话摘要，≤100 字 | "2026年度学校各单位信息化建设需求统一征集" |
| `contactName` | 通知联系人姓名 | "张华" |
| `contactInfo` | 联系方式（电话/邮箱） | "023-68253188 / zhanghua@swu.edu.cn" |
| `scopeDesc` | 征集范围描述文本 | "全部单位（8个）" / "按角色：单位分管领导+信息员" / "指定：教务处/信息办" |

所有现存条目补充上述 4 字段。

---

## 三、demand-collect 列表视图改动

### 3.1 表头新增列

位置：在原「状态」列之后、「需求数」列之前插入 4 列。

**改动后表头：**
```js
['征集标题', '年度', '征集周期', '状态',
 '摘要', '通知联系人', '联系方式', '征集范围',
 '需求数', '操作']
```

### 3.2 行渲染逻辑

`rows.map` 中 `return` 的数组对应调整：
```js
return [
  '<b>' + plan.title + '</b>',
  plan.year,
  '<span style="font-size:12px">' + formatDate(plan.startDate) + ' ~ ' + formatDate(plan.endDate) + '</span>',
  _collectionStatusTag(plan.status),
  _truncate(plan.summary, 40),
  plan.contactName || '—',
  plan.contactInfo || '—',
  plan.scopeDesc || '—',
  (plan.submitStats ? plan.submitStats.totalDemands : '—'),
  opBtns,
];
```

`_truncate(s, n)` 辅助函数：若 `s.length > n` 则返回 `s.slice(0,n)+'…'`，否则原样返回。可内联为一行表达式，不必单独定义函数：
```js
(plan.summary && plan.summary.length > 40 ? plan.summary.slice(0,40)+'…' : (plan.summary || '—'))
```

### 3.3 样式建议

摘要、征集范围两列内容偏长，列宽可通过 `<td style="max-width:200px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">` 限制。若 `renderTable` 不支持列样式，接受换行显示。

---

## 四、collection-create 向导重构

### 4.1 步骤编号变化

| 旧 | 新 | 标题 | 变动 |
|----|-----|------|------|
| Step 0 | Step 0 | 征集基础信息 | 原「征集说明配置」改名，新增「摘要」字段 |
| Step 1 | Step 1 | 通知信息 | 原「通知设置」重写为 notification-create 风格 |
| Step 2 | Step 2 | 流程配置 | 原「业务流程配置」，节点间按钮改为评审开关 |
| Step 3 | Step 3 | 总览确认 | 原「总览与发布确认」，展示新字段 |

> 注：步骤索引仍使用 0-3（代码层面），但 UI 显示的是「Step 1/2/3 + 总览确认」，即索引 0/1/2 对应用户看到的 1/2/3，索引 3 是总览页。Step Bar 文案改为「1 征集基础信息 → 2 通知信息 → 3 流程配置 → 总览确认」。

### 4.2 Step 0（征集基础信息）— 新增摘要字段

在 `_collectStep0Html` 的 `form-grid` 中，「征集说明」textarea 之后、「开始日期」之前插入：

```js
'<div class="form-item span-2">' +
  '<label class="form-label">摘要 <span class="req">*</span></label>' +
  '<input class="form-control" id="cc-summary" placeholder="请输入一句话摘要（100字以内）" maxlength="100" value="' + (data.summary || '') + '">' +
'</div>' +
```

「下一步」按钮的 onclick 校验追加：
```js
var s = document.getElementById('cc-summary').value;
if (!t || !s || !d) { toast('请填写征集标题、摘要和征集说明','warning'); return; }
window._collectWizard.data.summary = s;
```

卡片标题从「征集说明配置」改为「征集基础信息」。

### 4.3 Step 1（通知信息）— 重写为 notification-create 风格

**整体布局：**
```
┌─ Card A：从模板导入（默认展开） ──────────────────┐
│ 模块: [需求征集 ▼]  节点: [全部节点 ▼] [查询][重置] │
│ # │ 模块节点 │ 类型 │ 标题 │ 操作                  │
│ 1 │ 1-1 … │ 待办 │ 【征集通知】… │ [导入]           │
└─────────────────────────────────────────────────┘
┌─ Card B：通知内容 ───────────────────────────────┐
│ 通知标题* │ 通知正文* (textarea)                  │
│ 联系人    │ 联系方式                              │
│ 接收范围* │ 发送渠道*  │ 发送时间*                │
└─────────────────────────────────────────────────┘
[上一步] [暂存草稿] [下一步]
```

**Card A 实现：**

与 `notification-create` 的 Card A 结构完全相同。关键差异：
- 默认展开（`collapsed = false`），不需要折叠交互（但保留折叠头部可选）
- 模块下拉默认选中 `需求征集`（而非 `全部`），首次渲染即过滤
- 模板数据 `_importTmplData` 内联到脚本段（从 `notification-template` 视图的 `_tmplData` 独立复制一份）
- 「导入」按钮回填 `#cn-title`（通知标题）和 `#cn-body`（通知正文），不是 `#notif-title`

```js
window._importTmplCC = function(seq) {
  var tmpl = _importTmplData.find(function(x){ return x.seq === seq; });
  if (!tmpl) return;
  document.getElementById('cn-title').value = tmpl.title;
  document.getElementById('cn-body').value  = tmpl.body;
  showToast('已导入模板：' + tmpl.title.slice(0,20) + '…');
  document.getElementById('cn-form-card').scrollIntoView({behavior:'smooth'});
};
```

**Card B 通知内容：**

字段与原 Step 1 相同，字段 id 保持：
- `cn-title`（通知标题）
- `cn-body`（通知正文）
- `cn-contact`（联系人姓名）
- `cn-phone`（联系电话）— 文案改为「联系方式」，允许输入电话或邮箱
- `cn-email`（备用字段，若保留则与 cn-phone 并列）
- `cn-r-all` / `cn-r-role` / `cn-r-person`（接收范围）
- `cn-send-time`（发送时间 radio）
- 新增 `cn-channel`（发送渠道 checkbox 组：系统、钉钉、短信）

**简化建议**：若「联系人 / 联系方式」希望与 notification-create 一致，统一为两个字段：
- `cn-contact-name`（联系人姓名）
- `cn-contact-info`（联系方式，电话或邮箱任一，placeholder 示例 `023-68251234 / zhanghua@swu.edu.cn`）

并删除原 `cn-phone`、`cn-email` 字段。以此为准。

**下一步按钮校验：**
```js
var nt = document.getElementById('cn-title').value;
var nb = document.getElementById('cn-body').value;
if (!nt || !nb) { toast('请填写通知标题和通知正文','warning'); return; }
window._collectWizard.data.notifTitle = nt;
window._collectWizard.data.notifBody  = nb;
window._collectWizard.data.contactName = document.getElementById('cn-contact-name').value;
window._collectWizard.data.contactInfo = document.getElementById('cn-contact-info').value;
// 接收范围 / 发送渠道 / 发送时间同步
_goCollectStep(2);
```

### 4.4 Step 2（流程配置）— 节点间评审开关

**原节点渲染逻辑改动：**

在 `_collectStep2Html` 的 `defaultNodes.map` 中，将原「+ 插入评审节点」按钮移出节点卡，改为在 `flow-arrow` 位置渲染评审开关。

**新节点渲染结构：**
```
[节点A] — [→ + ☐需要专家评审] — [节点B] — [→ + ☐需要专家评审] — [节点C] ...
```

**实现方式**：把 `(i > 0 ? '<div class="flow-arrow">→</div>' : '')` 替换为：
```js
(i > 0
  ? '<div class="flow-arrow-with-review" style="display:inline-flex;flex-direction:column;align-items:center;margin:0 8px">' +
      '<div class="flow-arrow">→</div>' +
      '<label style="font-size:11px;white-space:nowrap;margin-top:4px;cursor:pointer">' +
        '<input type="checkbox" class="cc-review-toggle" data-gap="' + (i-1) + '" onchange="_onReviewToggle(this)"> 需要专家评审' +
      '</label>' +
    '</div>'
  : '')
```

并删除节点卡内的「+ 插入评审节点」按钮。

**状态存储：**

```js
window._collectWizard.data.reviewConfig = window._collectWizard.data.reviewConfig || [];
// 长度 = 节点数 - 1，值为 boolean，默认全 false

window._onReviewToggle = function(el) {
  var idx = parseInt(el.getAttribute('data-gap'), 10);
  window._collectWizard.data.reviewConfig[idx] = el.checked;
  window._flowModified = true;
  // 视觉反馈：同级 flow-arrow 元素切换虚线样式
  var arrow = el.closest('.flow-arrow-with-review').querySelector('.flow-arrow');
  if (arrow) arrow.style.opacity = el.checked ? '1' : '0.5';
};
```

**初始化回填**：重渲染时根据 `data.reviewConfig[i]` 决定 checkbox 是否 `checked`。

### 4.5 Step 3（总览确认）— 新增字段展示

**征集基础信息卡追加：**
```js
'<div class="detail-item" style="grid-column:1/-1">' +
  '<span class="detail-label">摘要</span>' +
  '<span class="detail-value">' + (data.summary || '（未填写）') + '</span>' +
'</div>' +
```

**通知信息卡**：联系人/联系方式字段 label 保持一致；接收范围、发送渠道、发送时间字段从 `data` 中读取。

**流程配置卡追加专家评审数量：**
```js
var reviewCount = (data.reviewConfig || []).filter(function(x){ return x; }).length;
'<div style="margin-bottom:8px;font-size:13px">' +
  '<b>模板：</b>' + tplName + ' &nbsp; ' +
  '<b>材料节点数：</b>6 个节点 / 共 12 项材料 &nbsp; ' +
  '<b>专家评审节点：</b>' + reviewCount + ' 个' +
'</div>' +
```

---

## 五、Step Bar 文案调整

`collection-create` 视图顶部 step bar 从 4 步文案：
```
① 征集说明 → ② 通知设置 → ③ 流程配置 → ④ 总览确认
```
改为：
```
① 征集基础信息 → ② 通知信息 → ③ 流程配置 → 总览确认
```

如果 step bar 是通用组件或字符串数组，找到对应定义处一并修改。

---

## 六、权限

本变更不涉及权限变动：
- `demand-collect` 列表页新增列对所有角色可见
- `collection-create` 向导入口仍为 `info-admin`（原逻辑保持不变）
- `unit-admin` 只读视图保持只读

---

## 七、修改文件清单

| 文件 | 具体变更 |
|------|---------|
| `shared/data.js` | `collectionPlans` 每条补充 `summary`、`contactName`、`contactInfo`、`scopeDesc` |
| `shared/views/demand.js` | VIEW 1（`demand-collect`）：表头和 rows 新增 4 列 |
| `shared/views/demand.js` | VIEW 2（`collection-create`）：Step 0 新增「摘要」字段 + 卡片改名；Step 1 重写为 Card A 模板导入 + Card B 通知表单；Step 2 节点间按钮改为评审开关并存储 `reviewConfig`；Step 3 总览页展示新字段；Step Bar 文案调整 |

---

## 八、已确认决策（2026-04-14）

1. **联系人字段合并**：原 `cn-contact` + `cn-phone` + `cn-email` 三字段合并为 `cn-contact-name`（姓名）+ `cn-contact-info`（联系方式，电话或邮箱任一）两字段。
2. **发送渠道**：作为 Step 2 通知编辑页面的功能，新增 `cn-channel` checkbox 组（系统 / 钉钉 / 短信），默认勾选「系统+钉钉」。
3. **模板数据来源**：`_importTmplData` 从 `notification-template` 的 `_tmplData` 复制一份独立内联到 Step 1 脚本段，各视图数据解耦。
