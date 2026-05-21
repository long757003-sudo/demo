---
status: testing
phase: 01-需求征集模块
source:
  - 01-01-SUMMARY.md
  - 01-02-SUMMARY.md
  - 01-03-SUMMARY.md
  - 01-04-SUMMARY.md
  - 01-05-SUMMARY.md
started: 2026-04-20T00:00:00Z
updated: 2026-04-20T00:00:00Z
---

## Current Test

number: 1
name: 信息办管理员发起需求征集
expected: |
  切换到「信息办管理员」（林已杰）角色，侧边栏进入「发起需求征集」页面，填写征集标题、起止日期（如 2026-04-15 ~ 2026-05-15）、至少勾选 1 个接收单位、发送方式默认「系统+钉钉」，点「提交并发送通知」后页面自动跳转到 notification-create 通知创建页，标题/类型/接收单位字段已预填（例如标题预填为「2026年度信息化项目需求征集通知」，按单位模式勾选刚才所选单位）。
awaiting: user response

## Tests

### 1. 信息办管理员发起需求征集
expected: 切换到「信息办管理员」角色 → 发起需求征集页 → 填写时间范围和通知范围 → 提交后自动跳转 notification-create，标题/接收单位已预填
result: [pending]

### 2. 单位系统管理员指派填报人
expected: 切换到「单位系统管理员」（林已杰 unit-admin）角色 → 进入「指派填报人」/demand-assign → 顶部显示当前征集批次信息 → 搜索框输入关键词过滤 project-manager 用户（格式「姓名 工号」如「王一凡 50240014」）→「加入备选」→ 备选列表出现该人 → 填权限有效期 → 点「保存指派」→ 二次确认 modal → 确认后 toast 成功
result: [pending]

### 3. 项目负责人填写需求申请表
expected: 切换到「项目负责人」（王一凡）角色 → 进入「需求申请」/demand-fill → 四步向导（基本信息→需求描述→技术要求→附件上传）→ 每步字段可填写，Step 1 预算数额低于 100 万显示「小型」徽章、≥500 万显示「重大」等；Step 2 摘要 textarea 带字数计数；Step 3 技术标签按类目分组展示 checkbox（来自 DATA.tagLibrary 25 条）→ 点「暂存草稿」toast 保存；再次进入表单能恢复 → 最后一步「提交」后跳 demand-list，新需求出现在列表顶部且状态为「已提交」
result: [pending]

### 4. 单位系统管理员排序并提交审批
expected: 切换到「单位系统管理员」（unit-admin）角色 → 进入「需求排序」/demand-sort → 列表展示本单位 submitted 状态需求 → 每行有↑↓按钮（首行↑ disabled、末行↓ disabled）→ 点↑↓可交换相邻两条顺序 → 点「保存排序」toast 保存 →「提交单位领导审批」→ 二次确认 modal → 确认后列表条目状态变为「待审批」
result: [pending]

### 5. 单位领导 T4 详情页审批
expected: 切换到「单位领导」（唐明 unit-leader）角色 → 进入「需求审批」/demand-approve → 页面顶部生命周期进度条 6 阶段（需求征集/立项论证/采购/实施/验收/运维），当前高亮「需求征集」→ 内嵌排序区块（可继续微调 ↑↓）→ 审批意见面板：textarea 必填 + 「下一级审批」开关默认开启 → 点「审批通过」：意见为空时报错；填写后批量改状态为「待遴选」（unit-approved）→「操作记录」Tab 切换可查看本阶段日志
result: [pending]

### 6. 信息办遴选 + BR-04 Drawer 六类原因
expected: 切换到「信息办管理员」（info-admin）角色 → 进入「需求遴选」/demand-select → 列表展示 unit-approved 状态的需求 → 每行「支持」按钮点击后 Badge 变绿 + toast；「不支持」按钮点击后 Badge 立即变红 + toast + 右侧抽屉 Drawer 自动弹出展示 BR-04 六条完整规则原文（（一）已建成… （二）需求不明确… 直到（六）不符合学校其他相关规定），Drawer 内仅展示文字，没有「确认不支持」按钮和 radio 选项 → 底部「提交遴选结果」按钮点击后二次确认 → 确认 toast
result: [pending]

### 7. 需求列表筛选与状态可视化
expected: 任意角色进入「需求列表」/demand-list → 顶部筛选：关键词搜索框（dl-kw）+ 按单位下拉（dl-unit）+ 按状态下拉（dl-status），任一改动实时 re-render → 表格行状态列显示彩色 Badge 覆盖 8 种状态（草稿/已提交/待审批/待遴选/已退回/遴选中/已支持/不支持），颜色分别为灰/橙/橙/绿/红/蓝/绿/红 → project-manager 角色可见「新建一份需求」按钮，点击走 _dfStartNew 重置表单后跳转 demand-fill
result: [pending]

## Summary

total: 7
passed: 0
issues: 0
pending: 7
skipped: 0

## Gaps

[none yet]
