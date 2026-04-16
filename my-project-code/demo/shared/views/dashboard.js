// shared/views/dashboard.js  —  V2.1 Enhanced Dashboard

registerView('dashboard', function() {
  const role = getCurrentRole();

  // ── Stat cards (all 12 roles) ──────────────────────────────────────────────
  const stats = {
    'project-manager':   { todo: 4, active: 1,  overdue: 0, pending: 0 },
    'info-admin':        { todo: 5, active: 12, overdue: 1, pending: 3 },
    'info-leader':       { todo: 4, active: 12, overdue: 1, pending: 5 },
    'leadership-office':     { todo: 2, active: 12, overdue: 0, pending: 2 },
    'unit-leader':       { todo: 2, active: 2,  overdue: 0, pending: 2 },
    'unit-admin':     { todo: 3, active: 2,  overdue: 0, pending: 0 },
    'expert':            { todo: 2, active: 0,  overdue: 0, pending: 2 },
    'contract-admin':    { todo: 1, active: 2,  overdue: 0, pending: 1 },
    'finance-admin':     { todo: 0, active: 5,  overdue: 0, pending: 0 },
    'sys-admin':         { todo: 2, active: 0,  overdue: 0, pending: 0 },
    'leadership-group':    { todo: 1, active: 12, overdue: 1, pending: 1 },
    'project-assistant': { todo: 1, active: 1,  overdue: 0, pending: 0 },
  };
  const s = stats[role] || { todo: 0, active: 0, overdue: 0, pending: 0 };

  // ── Quick entry cards (role-specific) ──────────────────────────────────────
  const quickEntriesByRole = {
    'info-admin': [
      { icon: '', label: '特殊通道立项', desc: '紧急/重大项目直接立项', action: "navigate('proposal-fill')" },
      { icon: '', label: '微型项目抽查', desc: '随机抽查微型项目进展', action: "navigate('proposal-list')" },
      { icon: '', label: '创建征集方案', desc: '新建年度需求征集方案', action: "navigate('collection-create')" },
      { icon: '', label: '专家库管理', desc: '维护专家信息', action: "navigate('expert-pool')" },
    ],
    'project-manager': [
      { icon: '', label: '我的项目', desc: '查看负责的项目列表', action: "navigate('project-list')" },
      { icon: '', label: '填写进展报告', desc: '提交本期进展报告', action: "navigate('implement')" },
      { icon: '', label: '填报需求申请', desc: '提交项目需求申请', action: "navigate('demand-fill')" },
      { icon: '', label: '填报申报书', desc: '填写立项申报书', action: "navigate('proposal-fill')" },
    ],
    'project-assistant': [
      { icon: '', label: '协助项目', desc: '查看协助的项目', action: "navigate('project-list')" },
      { icon: '', label: '协助填报', desc: '协助填写进展报告', action: "navigate('implement')" },
      { icon: '', label: '需求申请', desc: '协助填报需求', action: "navigate('demand-fill')" },
    ],
    'info-leader': [
      { icon: '', label: '需求遴选', desc: '审核本轮需求申请', action: "navigate('demand-select')" },
      { icon: '', label: '待审项目', desc: '查看待审批项目', action: "navigate('proposal-list')" },
      { icon: '', label: '评审管理', desc: '管理论证评审任务', action: "navigate('review-list')" },
    ],
    'leadership-office': [
      { icon: '', label: '待审定项目', desc: '查看待审定立项', action: "navigate('proposal-list')" },
      { icon: '', label: '项目总览', desc: '查看所有在建项目', action: "navigate('project-list')" },
      { icon: '', label: '季度汇报', desc: '查看项目汇报情况', action: "navigate('project-list')" },
    ],
    'unit-leader': [
      { icon: '', label: '审核需求', desc: '审核本单位需求申请', action: "navigate('demand-sort')" },
      { icon: '', label: '本单位项目', desc: '查看本单位项目', action: "navigate('project-list')" },
    ],
    'unit-admin': [
      { icon: '', label: '分派需求', desc: '指派需求填写人并授权', action: "navigate('demand-assign')" },
      { icon: '', label: '排序提交', desc: '提交本单位需求优先级', action: "navigate('demand-sort')" },
    ],
    'expert': [
      { icon: '', label: '我的评审', desc: '查看待处理评审任务', action: "navigate('my-reviews')" },
      { icon: '', label: '填写意见', desc: '填写评审论证意见', action: "navigate('review-opinion')" },
    ],
    'contract-admin': [
      { icon: '', label: '合同台账', desc: '查看合同列表', action: "navigate('contract-ledger')" },
      { icon: '', label: '上传备案', desc: '上传合同文件', action: "navigate('project-procurement')" },
    ],
    'finance-admin': [
      { icon: '', label: '经费总览', desc: '查看经费使用情况', action: "navigate('finance-overview')" },
      { icon: '', label: '付款审批', desc: '审批付款申请', action: "navigate('finance-overview')" },
    ],
    'sys-admin': [
      { icon: '', label: '用户管理', desc: '管理系统用户权限', action: "navigate('user-permissions')" },
      { icon: '', label: '流程配置', desc: '配置审批流程节点', action: "navigate('flow-config')" },
      { icon: '', label: '操作日志', desc: '查看系统操作记录', action: "navigate('audit-log')" },
    ],
    'leadership-group': [
      { icon: '', label: '项目总览', desc: '查看全部在建项目', action: "navigate('project-list')" },
      { icon: '', label: '年度汇报', desc: '查看年度建设汇报', action: "navigate('project-list')" },
    ],
  };
  const quickEntries = quickEntriesByRole[role] || [];

  // ── Pending todos (role-specific) ─────────────────────────────────────────
  // Issue A: 为每个跨角色交接点补充待办入口
  const todosByRole = {
    'project-manager': [
      { level: 'urgent',   text: '【申报】2026年度需求征集通知 — 请填报需求', link: 'collection-detail', params: {id:'CP001'} },
      { level: 'urgent',   text: '【申报】本科教学质量分析平台立项申报通知 — 请填报申报书', link: 'proposal-fill', params: {id:'PR001'} },  // 2.1→2.2
      { level: 'reminder', text: '【修改】心理健康预警系统申报书已退回 — 请修改后重新提交', link: 'proposal-fill', params: {id:'PR008'} },
      { level: 'normal',   text: '【需求】确认需求优先级排序', link: 'demand-sort' },
    ],
    'info-admin': [
      { level: 'urgent',   text: '【初审】智慧教室管理平台申报书待初审', link: 'preliminary-review', params: {id:'PR006'} },  // 2.3→2.4
      { level: 'urgent',   text: '【评审】选择论证专家（待领导确认）', link: 'review-launch' },
      { level: 'urgent',   text: '【审核】院系网站群模板升级微型项目自行论证材料确认', link: 'info-confirm' },  // 2.5m→2.6m
      { level: 'reminder', text: '【通知】本科教学质量分析平台立项通知书待发送', link: 'approval-notice', params: {id:'PR001'} },  // 2.7→2.8
      { level: 'normal',   text: '【合同】「招生系统」合同备案确认', link: 'contract-ledger' },
    ],
    'info-leader': [
      { level: 'urgent',   text: '【审批】2026年度需求征集通知 — 待审核', link: 'collection-detail', params: {id:'CP001'} },
      { level: 'urgent',   text: '【遴选】完成2026年度需求遴选', link: 'demand-select' },
      { level: 'urgent',   text: '【审批】本科教学质量分析平台评审专家名单确认', link: 'expert-confirm' },  // 2.5→领导确认
      { level: 'normal',   text: '【审批】审定「本科教学质量分析平台」立项', link: 'proposal-list' },
    ],
    'leadership-office': [
      { level: 'urgent',   text: '【审定】数据共享交换平台升级小型项目立项审定', link: 'proposal-approve', params: {id:'PR007'} },  // 2.6→2.7
      { level: 'normal',   text: '【汇报】查看季度项目汇报', link: 'project-list' },
    ],
    'unit-leader': [
      { level: 'urgent',   text: '【审批】学生资助管理系统申报书审核', link: 'proposal-approve', params: {id:'PR005'} },  // 2.2→2.3
      { level: 'urgent',   text: '【需求】审核「学生资助管理系统」需求申请', link: 'demand-sort' },
    ],
    'unit-admin': [
      { level: 'urgent',   text: '【通知】2026年度需求征集通知确认 — 请知晓', link: 'collection-detail', params: {id:'CP001'} },
      { level: 'reminder', text: '【分派】指派需求填写人并授权', link: 'demand-assign' },
      { level: 'normal',   text: '【排序】提交本单位需求优先级排序', link: 'demand-sort' },
    ],
    'expert': [
      { level: 'urgent',   text: '【评审】请确认参加「本科教学质量分析平台」论证评审邀请', link: 'expert-respond' },  // 2.5a
      { level: 'urgent',   text: '【评审】填写「本科教学质量分析平台」论证意见', link: 'review-opinion' },  // 2.5b
    ],
    'contract-admin': [
      { level: 'urgent',   text: '【合同】「本科教学质量分析平台」合同待审定', link: 'contract-ledger' },
    ],
    'finance-admin': [],
    'sys-admin': [
      { level: 'reminder', text: '【系统】定期检查用户权限配置', link: 'user-permissions' },
      { level: 'normal',   text: '【日志】查看最新操作日志', link: 'audit-log' },
    ],
    'leadership-group': [
      { level: 'normal',   text: '【审定】暂无重大项目待审定', link: 'proposal-list' },
    ],
    'project-assistant': [
      { level: 'normal',   text: '【协助】协助填写「本科教学质量分析平台」进展报告', link: 'implement' },
    ],
  };
  const todos = todosByRole[role] || [];

  // ── Urgency dot helper ─────────────────────────────────────────────────────
  function urgencyDot(level) {
    if (level === 'urgent')   return '<span style="color:var(--danger);font-size:12px;flex-shrink:0">●</span>';
    if (level === 'reminder') return '<span style="color:var(--warning);font-size:12px;flex-shrink:0">●</span>';
    return '<span style="color:#d4d4d8;font-size:12px;flex-shrink:0">●</span>';
  }
  function urgencyTextStyle(level) {
    if (level === 'urgent')   return 'color:var(--danger);font-weight:500';
    if (level === 'reminder') return 'color:var(--warning)';
    return '';
  }

  // ── Project dynamics (5 recent events) ────────────────────────────────────
  const dynamics = [
    { text: '「本科教学质量分析平台」立项论证评审通过，进入采购阶段', time: '2025-03-27' },
    { text: '「招生系统升级改造」完成二阶段里程碑，进度升至55%',    time: '2025-03-25' },
    { text: '「院系网站群模板升级」微型项目已完成自行论证并确认',    time: '2025-04-12' },
    { text: '「OA协同办公平台升级」验收通过，已进入运维阶段',        time: '2025-01-25' },
    { text: '「科研项目全程管理平台」二次论证未通过，已冻结一年',    time: '2025-02-01' },
  ];

  // ── Notifications: top-5 sorted by sendTime desc ───────────────────────────
  const urgentTypes   = new Set(['overdue-warning','major-fault','frozen-notice']);
  const warningTypes  = new Set(['collection-returned','demand-returned','proposal-return','contract-expiry','approval-result-reject']);

  function notifLevelFromType(type) {
    if (urgentTypes.has(type))  return 'urgent';
    if (warningTypes.has(type)) return 'warning';
    return 'info';
  }

  const sorted = (DATA.notifications || [])
    .filter(function(n) { return n.sendTime; })
    .slice()
    .sort(function(a, b) { return b.sendTime.localeCompare(a.sendTime); })
    .slice(0, 5);

  const notifHtml = sorted.map(function(n) {
    const level    = notifLevelFromType(n.type);
    const cssClass = notifLevelClass(level);           // 'danger' | 'warning' | 'info'
    const tag      = notifLevelTag(level);
    // unread badge: check if any recipient is unread
    const hasUnread = n.readStatus && Object.values(n.readStatus).some(function(v) { return v === false; });
    const unreadBadge = hasUnread ? '<span class="badge" style="background:var(--danger);color:#fff;font-size:10px;padding:1px 5px;border-radius:8px;margin-left:4px">未读</span>' : '';
    return '<div class="notice-item ' + cssClass + '" style="cursor:pointer" onclick="navigate(\'notification-list\')">'
      + '<div style="display:flex;align-items:center;gap:6px;margin-bottom:4px">'
      + tag + unreadBadge
      + '<span style="font-weight:500;font-size:13px;flex:1">' + n.title + '</span>'
      + '</div>'
      + '<div style="font-size:12px;color:var(--text-secondary)">' + n.sendTime + '</div>'
      + '</div>';
  }).join('');

  // ── Quick entry HTML ───────────────────────────────────────────────────────
  const quickHtml = quickEntries.length ? quickEntries.map(function(e) {
    return '<div class="quick-entry-card" onclick="' + e.action + '" style="'
      + 'flex:1;min-width:130px;background:#fafafa;border:1px solid #e4e4e7;border-radius:6px;'
      + 'padding:14px 12px;cursor:pointer;transition:box-shadow .15s;display:flex;flex-direction:column;gap:6px;'
      + '" onmouseover="this.style.boxShadow=\'0 2px 8px rgba(0,0,0,.06)\'" onmouseout="this.style.boxShadow=\'none\'">'
      + (e.icon ? '<div style="font-size:18px">' + e.icon + '</div>' : '')
      + '<div style="font-size:13px;font-weight:600;color:var(--text-primary)">' + e.label + '</div>'
      + '<div style="font-size:11px;color:var(--text-secondary)">' + e.desc + '</div>'
      + '</div>';
  }).join('') : '';

  return '<div class="breadcrumb">首页 / <span>工作台</span></div>'
    + '<div class="page-header">'
    +   '<div class="page-title">工作台</div>'
    +   '<span style="font-size:13px;color:var(--text-secondary)">'
    +     new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })
    +   '</span>'
    + '</div>'

    // ── Stat row ──
    + '<div class="stat-row">'
    +   '<div class="stat-card"><div class="stat-value">' + s.todo + '</div><div class="stat-label">待办事项</div></div>'
    +   '<div class="stat-card success"><div class="stat-value">' + s.active + '</div><div class="stat-label">在建项目</div></div>'
    +   '<div class="stat-card warning"><div class="stat-value">' + s.overdue + '</div><div class="stat-label">即将超期</div></div>'
    +   '<div class="stat-card purple"><div class="stat-value">' + s.pending + '</div><div class="stat-label">待我审批</div></div>'
    + '</div>'

    // ── Quick entries ──
    + (quickEntries.length ? '<div class="card" style="margin-bottom:16px">'
      + '<div class="card-title">快捷入口</div>'
      + '<div class="quick-entries" style="display:flex;gap:12px;flex-wrap:wrap">' + quickHtml + '</div>'
      + '</div>' : '')

    // ── Main 2-column layout ──
    + '<div style="display:flex;gap:16px;align-items:flex-start">'

    // Left 2/3
    +   '<div style="flex:2;min-width:0;display:flex;flex-direction:column;gap:16px">'

    //   Pending todos
    +     '<div class="card">'
    +       '<div class="card-title">待办事项'
    +         (s.todo > 0 ? '<span class="badge" style="margin-left:8px">' + s.todo + '</span>' : '')
    +       '</div>'
    +       (todos.length
          ? todos.map(function(t) {
              var navCall = t.params
                ? 'navigate(\'' + t.link + '\',' + JSON.stringify(t.params).replace(/"/g, '&quot;') + ')'
                : 'navigate(\'' + t.link + '\')';
              return '<div style="padding:9px 0;border-bottom:1px solid #f4f4f5;display:flex;align-items:center;gap:8px;cursor:pointer" onclick="' + navCall + '">'
                + urgencyDot(t.level)
                + '<span style="font-size:13px;flex:1;' + urgencyTextStyle(t.level) + '">' + t.text + '</span>'
                + '<span style="font-size:11px;color:var(--primary);white-space:nowrap">处理 →</span>'
                + '</div>';
            }).join('')
          : '<div style="text-align:center;padding:28px;color:var(--text-secondary)">暂无待办事项</div>')
    +     '</div>'

    //   Project dynamics
    +     '<div class="card">'
    +       '<div class="card-title">项目动态</div>'
    +       dynamics.map(function(d) {
              return '<div style="padding:8px 0;border-bottom:1px solid #f9f9f9;font-size:13px;display:flex;justify-content:space-between;align-items:flex-start;gap:8px">'
                + '<span>' + d.text + '</span>'
                + '<span style="font-size:11px;color:var(--text-secondary);white-space:nowrap;flex-shrink:0;margin-left:8px">' + d.time + '</span>'
                + '</div>';
            }).join('')
    +     '</div>'
    +   '</div>'

    // Right 1/3
    +   '<div style="flex:1;min-width:220px">'
    +     '<div class="card">'
    +       '<div class="card-title">系统通知'
    +         '<span class="badge" style="margin-left:8px">' + sorted.length + '</span>'
    +       '</div>'
    +       (notifHtml || '<div style="text-align:center;padding:24px;color:var(--text-secondary)">暂无通知</div>')
    +       '<div style="text-align:center;margin-top:10px">'
    +         '<a onclick="navigate(\'notification-list\')" style="font-size:12px">查看全部通知 →</a>'
    +       '</div>'
    +     '</div>'
    +   '</div>'

    + '</div>';
});
