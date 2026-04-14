---
change: demand-collection-wizard-enhance
title: 优化【需求征集】列表字段与创建向导流程 — 施工单
status: proposed
---

# Tasks：demand-collection-wizard-enhance

## T1 — data.js 字段补充
- [ ] `collectionPlans` 每条补充 `summary` / `contactName` / `contactInfo` / `scopeDesc` 四字段
- [ ] 现有条目填写 Mock 数据（摘要 ≤100 字，联系方式如 `023-68253188 / zhanghua@swu.edu.cn`，范围描述如 "全部单位（8个）"）

## T2 — demand-collect 列表视图新增列
- [ ] `demand.js` VIEW 1 表头：在「状态」和「需求数」之间插入 `摘要`、`通知联系人`、`联系方式`、`征集范围` 四列
- [ ] `rows.map` 同步返回新字段值，摘要字段超过 40 字截断加 `…`
- [ ] 空值统一显示 `—`

## T3 — collection-create Step 0（征集基础信息）改名与新增摘要字段
- [ ] `_collectStep0Html` 卡片标题从「征集说明配置」改为「征集基础信息」
- [ ] 在「征集说明」textarea 之后插入 `<input id="cc-summary">` 字段（必填，maxlength=100）
- [ ] 「下一步」按钮 onclick 校验追加 summary 非空检查
- [ ] 提交时写入 `window._collectWizard.data.summary`

## T4 — collection-create Step 1（通知信息）重写
- [ ] 卡片标题从「通知设置」改为「通知信息」
- [ ] 脚本段内联 `_importTmplData`（从 `notification-template` 的 `_tmplData` 复制一份）
- [ ] 新增 Card A「从模板导入」：默认展开，模块下拉默认选中「需求征集」，节点下拉级联过滤，表格显示过滤结果和「导入」按钮
- [ ] 实现 `window._importTmplCC(seq)`：回填 `#cn-title` 和 `#cn-body`，调用 `showToast` 并滚动到 Card B
- [ ] 实现 `window._ccTmplFilter()` 和 `window._ccTmplReset()`（两级联动过滤）
- [ ] Card B「通知内容」：合并原三字段为 `cn-contact-name` + `cn-contact-info`
- [ ] Card B 新增发送渠道 checkbox 组 `cn-channel`（系统 / 钉钉 / 短信，默认勾选系统+钉钉）
- [ ] 「下一步」按钮校验与写入草稿：`notifTitle` / `notifBody` / `contactName` / `contactInfo` / `channels` / `recipientMode` / `sendMode`
- [ ] 删除原 `cn-phone` / `cn-email` 字段定义和相关 onclick 读取

## T5 — collection-create Step 2（流程配置）评审开关
- [ ] 删除每个节点卡内的「+ 插入评审节点」按钮
- [ ] 在 `flow-arrow` 位置渲染评审 checkbox：`<input class="cc-review-toggle" data-gap="i">`
- [ ] 实现 `window._onReviewToggle(el)`：写入 `window._collectWizard.data.reviewConfig[idx]`，切换 arrow 虚线样式
- [ ] 重渲染时根据 `reviewConfig[i]` 回填 checkbox 的 `checked` 状态
- [ ] 初始化 `reviewConfig` 为长度 `nodes.length-1` 的 `false` 数组

## T6 — collection-create Step 3（总览确认）展示新字段
- [ ] 征集基础信息卡追加「摘要」行
- [ ] 通知信息卡字段标签统一为「联系人」+「联系方式」
- [ ] 通知信息卡追加「发送渠道」字段显示
- [ ] 流程配置卡追加「专家评审节点：N 个」统计（从 `reviewConfig.filter(Boolean).length` 计算）

## T7 — Step Bar 文案调整
- [ ] 向导顶部 step bar 四步文案改为：「1 征集基础信息 → 2 通知信息 → 3 流程配置 → 总览确认」

## T8 — 联调与验证
- [ ] 浏览器打开 `demo/app.html#demand-collect`，检查列表新 4 列渲染正常
- [ ] 点击「+ 创建征集方案」，逐步走完 Step 0 → Step 1 → Step 2 → Step 3，每步暂存草稿 → 下一步 → 上一步数据回填正常
- [ ] Step 1 从模板导入功能生效（模板下拉过滤、导入按钮回填）
- [ ] Step 2 评审开关勾选后 Step 3 总览页统计数字正确
- [ ] 提交审批后返回列表，`logOperation` 成功记录

## T9 — 提交
- [ ] git commit：`feat(demand-collect): 列表新增4列 + 创建向导重构为3步流程`
