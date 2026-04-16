// shared/views/logs.js  —  V2.1 (merged biz + system logs with Tab switch)

// ── Demo business log records ─────────────────────────────────────────────────
var DEMO_BIZ_LOGS = [
  { id:'LD001', time:'2025-11-08 09:12', operator:'李明',   role:'项目负责人',   module:'项目管理',  action:'提交进展报告', targetId:'P001',  targetName:'本科教学质量分析平台', detail:'Q3进展报告已提交', ip:'10.0.1.42' },
  { id:'LD002', time:'2025-11-07 17:30', operator:'刘主任', role:'信息办领导',   module:'立项管理',  action:'审批通过',     targetId:'PR001', targetName:'本科教学质量分析平台', detail:'通过初审，进入专家论证', ip:'10.0.1.11' },
  { id:'LD003', time:'2025-11-06 14:20', operator:'陈管理', role:'信息办管理员', module:'通知管理',  action:'发送通知',     targetId:'N001',  targetName:'2025年度需求征集', detail:'已向42个单位发送通知', ip:'10.0.1.5' },
  { id:'LD004', time:'2025-11-05 10:05', operator:'陈管理', role:'信息办管理员', module:'合同管理',  action:'合同备案',     targetId:'C001',  targetName:'HT-2025-008', detail:'合同文件已上传备案', ip:'10.0.1.5' },
  { id:'LD005', time:'2025-11-04 16:44', operator:'李明',   role:'项目负责人',   module:'项目管理',  action:'提交延期申请', targetId:'P001',  targetName:'本科教学质量分析平台', detail:'申请延期30天', ip:'10.0.1.42' },
  { id:'LD006', time:'2025-11-03 11:30', operator:'陈管理', role:'信息办管理员', module:'专家管理',  action:'加入黑名单',   targetId:'E008',  targetName:'周大鹏', detail:'原因：信息泄露违规', ip:'10.0.1.5' },
];

// ── Demo system log records ───────────────────────────────────────────────────
var DEMO_SYS_LOGS = [
  { id:'SL001', time:'2025-11-08 08:00', operator:'系统管理员', action:'用户登录', detail:'用户陈管理登录系统，IP：10.0.1.5', ip:'10.0.1.5',   browser:'Chrome 120 / Windows 11' },
  { id:'SL002', time:'2025-11-07 10:30', operator:'系统管理员', action:'权限变更', detail:'为用户李明新增「项目负责人」角色权限', ip:'10.0.1.8',  browser:'Chrome 119 / macOS' },
  { id:'SL003', time:'2025-11-06 09:00', operator:'系统管理员', action:'配置修改', detail:'修改流程模板「标准项目流程」节点顺序', ip:'10.0.1.8',  browser:'Chrome 119 / macOS' },
  { id:'SL004', time:'2025-11-05 16:00', operator:'系统管理员', action:'账户停用', detail:'停用已离职用户账户 U099（原科研处）', ip:'10.0.1.8',  browser:'Chrome 119 / macOS' },
  { id:'SL005', time:'2025-11-04 07:30', operator:'系统',       action:'自动备份', detail:'系统数据库定时备份完成，备份大小：3.8GB', ip:'127.0.0.1', browser:'系统任务' },
];

// ── Action tag helper ─────────────────────────────────────────────────────────
function actionTag(action) {
  if (/提交|通过|发送|备案|完成|自动备份/.test(action)) return '<span class="tag tag-success">' + action + '</span>';
  if (/退回|冻结|终止|驳回|停用/.test(action))          return '<span class="tag tag-danger">'  + action + '</span>';
  if (/黑名单|延期申请/.test(action))                    return '<span class="tag tag-warning">' + action + '</span>';
  return '<span class="tag tag-blue">' + action + '</span>';
}

/* ====== 操作日志（合并业务 + 系统，Tab切换） ====== */
registerView('audit-log', function() {
  // merge DATA logs + demo biz logs
  var bizBase = (DATA.operationLogs && DATA.operationLogs.length) ? DATA.operationLogs : [];
  var bizAll  = bizBase.concat(DEMO_BIZ_LOGS);
  bizAll.sort(function(a, b) { return b.time.localeCompare(a.time); });

  var currentTab = window._logTab || 0;

  // ── Tab 0: Business logs ────────────────────────────────────────────────────
  var bizRows = bizAll.map(function(log) {
    return '<tr>'
      + '<td>' + log.time + '</td>'
      + '<td>' + log.operator + '</td>'
      + '<td>' + log.role + '</td>'
      + '<td>' + (log.module || '—') + '</td>'
      + '<td>' + actionTag(log.action) + '</td>'
      + '<td>' + (log.targetName || '—') + '</td>'
      + '<td style="max-width:200px;font-size:12px;color:var(--text-secondary)">' + (log.detail || '—') + '</td>'
      + '<td><a onclick="navigate(\'log-detail\',{id:\'' + log.id + '\'})">查看详情</a></td>'
      + '</tr>';
  }).join('');

  var bizTable = '<table class="data-table">'
    + '<thead><tr>'
    +   '<th>操作时间</th><th>操作人</th><th>角色</th><th>模块</th>'
    +   '<th>操作类型</th><th>操作对象</th><th>详情摘要</th><th>操作</th>'
    + '</tr></thead>'
    + '<tbody>' + (bizRows || '<tr><td colspan="8" style="text-align:center;padding:32px;color:var(--text-secondary)">暂无数据</td></tr>') + '</tbody>'
    + '</table>'
    + '<div class="table-pagination"><span>共 ' + bizAll.length + ' 条记录（演示数据）</span><span>第 1/1 页</span></div>';

  // ── Tab 1: System logs ──────────────────────────────────────────────────────
  var sysRows = DEMO_SYS_LOGS.map(function(log) {
    return '<tr>'
      + '<td>' + log.time + '</td>'
      + '<td>' + log.operator + '</td>'
      + '<td>' + actionTag(log.action) + '</td>'
      + '<td>' + log.detail + '</td>'
      + '<td>' + log.ip + '</td>'
      + '<td style="font-size:12px;color:var(--text-secondary)">' + log.browser + '</td>'
      + '</tr>';
  }).join('');

  var sysTable = '<table class="data-table">'
    + '<thead><tr>'
    +   '<th>时间</th><th>操作人</th><th>操作类型</th><th>详情</th><th>IP地址</th><th>客户端</th>'
    + '</tr></thead>'
    + '<tbody>' + sysRows + '</tbody>'
    + '</table>'
    + '<div class="table-pagination"><span>共 ' + DEMO_SYS_LOGS.length + ' 条记录（演示数据）</span></div>';

  // ── Action type options ─────────────────────────────────────────────────────
  var actionOpts = ['提交进展报告','审批通过','审批退回','发送通知','合同备案','加入黑名单','驳回申报书','重新提交申报书','修改用户权限','用户登录','权限变更','配置修改'];
  var actionOptsHtml = actionOpts.map(function(a) { return '<option>' + a + '</option>'; }).join('');

  return '<div class="breadcrumb">首页 / 日志管理 / <span>操作日志</span></div>'
    + '<div class="page-header">'
    +   '<div class="page-title">操作日志</div>'
    + '</div>'

    // read-only notice
    + '<div style="background:#fff7e6;border:1px solid #ffd591;border-radius:4px;padding:8px 14px;margin-bottom:12px;font-size:12px;color:#d46b08">'
    +   '<span class="inline-notice lock">已锁定</span> 操作日志为系统自动记录，不可修改或删除'
    + '</div>'

    // tab bar
    + '<div style="display:flex;border-bottom:2px solid #f0f0f0;margin-bottom:16px">'
    +   '<div id="logtab-0" onclick="window._logTab=0;renderView(\'audit-log\')" style="padding:8px 24px;cursor:pointer;font-size:14px;'
    +     (currentTab === 0 ? 'border-bottom:2px solid var(--primary);color:var(--primary);font-weight:600;margin-bottom:-2px' : 'color:var(--text-secondary)')
    +   '">业务操作日志</div>'
    +   '<div id="logtab-1" onclick="window._logTab=1;renderView(\'audit-log\')" style="padding:8px 24px;cursor:pointer;font-size:14px;'
    +     (currentTab === 1 ? 'border-bottom:2px solid var(--primary);color:var(--primary);font-weight:600;margin-bottom:-2px' : 'color:var(--text-secondary)')
    +   '">系统操作日志</div>'
    + '</div>'

    // filter bar
    + '<div class="card" style="margin-bottom:12px">'
    +   '<div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center">'
    +     '<input class="form-control" placeholder="搜索操作人/项目名称..." style="width:200px">'
    +     '<select class="form-control" style="width:160px"><option value="">全部操作类型</option>' + actionOptsHtml + '</select>'
    +     '<input class="form-control" type="date" title="开始日期" style="width:140px">'
    +     '<input class="form-control" type="date" title="结束日期" style="width:140px">'
    +     '<button class="btn btn-primary btn-sm" onclick="toast(\'演示模式：查询条件已模拟\',\'info\')">查询</button>'
    +     '<button class="btn btn-sm" onclick="toast(\'演示模式：日志导出功能\',\'info\')">导出</button>'
    +   '</div>'
    + '</div>'

    // table
    + '<div class="table-wrap">'
    +   (currentTab === 0 ? bizTable : sysTable)
    + '</div>';
});


/* ====== 日志详情 ====== */
registerView('log-detail', function() {
  var params = getViewParams('log-detail');
  var logId = params && params.id;

  // Find in all logs
  var bizBase = (DATA.operationLogs && DATA.operationLogs.length) ? DATA.operationLogs : [];
  var bizAll  = bizBase.concat(DEMO_BIZ_LOGS);
  var found   = logId ? bizAll.find(function(l) { return l.id === logId; }) : null;
  var log     = found || bizAll[0];

  if (!log) {
    return '<div class="empty-state"><p>未找到日志记录</p></div>';
  }

  // Diff table
  var diffHtml = '';
  if (log.changes && log.changes.length) {
    var diffRows = log.changes.map(function(d) {
      return '<tr>'
        + '<td style="font-size:13px;font-weight:500">' + d.field + '</td>'
        + '<td style="background:#fff1f0;color:#cf1322;font-family:monospace;font-size:12px;padding:6px 10px">' + d.before + '</td>'
        + '<td style="background:#f6ffed;color:#389e0d;font-family:monospace;font-size:12px;padding:6px 10px">' + d.after + '</td>'
        + '</tr>';
    }).join('');
    diffHtml = '<div class="card">'
      + '<div class="card-title">字段变更记录</div>'
      + '<table class="data-table">'
      + '<thead><tr><th>字段名称</th><th style="background:#fff1f0">变更前</th><th style="background:#f6ffed">变更后</th></tr></thead>'
      + '<tbody>' + diffRows + '</tbody>'
      + '</table>'
      + '<div style="margin-top:14px;font-size:12px;color:var(--text-secondary);text-align:center">'
      +   '<span class="inline-notice lock">已锁定</span> 以上为系统自动记录的不可篡改变更日志'
      + '</div>'
      + '</div>';
  } else {
    diffHtml = '<div class="card">'
      + '<div class="card-title">字段变更记录</div>'
      + '<div style="text-align:center;padding:20px;color:var(--text-secondary);font-size:13px">本次操作无字段变更记录</div>'
      + '</div>';
  }

  var mockIp      = log.ip || '10.0.' + Math.floor(Math.random() * 2 + 1) + '.' + Math.floor(Math.random() * 50 + 1);
  var mockBrowser = 'Chrome 120 / Windows 11';

  return '<div class="breadcrumb">首页 / 日志管理 / <a onclick="navigate(\'audit-log\')">操作日志</a> / <span>日志详情</span></div>'
    + '<div class="page-header">'
    +   '<div class="page-title">日志详情</div>'
    +   '<button class="btn" onclick="navigate(\'audit-log\')">← 返回日志列表</button>'
    + '</div>'

    + '<div class="card" style="margin-bottom:12px">'
    +   '<div class="card-title">基本信息</div>'
    +   '<div class="detail-grid">'
    +     '<div class="detail-item"><span class="detail-label">日志编号</span><span>' + log.id + '</span></div>'
    +     '<div class="detail-item"><span class="detail-label">操作时间</span><span>' + log.time + '</span></div>'
    +     '<div class="detail-item"><span class="detail-label">操作人</span><span>' + log.operator + '</span></div>'
    +     '<div class="detail-item"><span class="detail-label">角色</span><span>' + (log.role || '—') + '</span></div>'
    +     '<div class="detail-item"><span class="detail-label">操作类型</span><span>' + actionTag(log.action) + '</span></div>'
    +     '<div class="detail-item"><span class="detail-label">所属模块</span><span>' + (log.module || '—') + '</span></div>'
    +     '<div class="detail-item" style="grid-column:span 2"><span class="detail-label">操作对象</span><span>'
    +       (log.targetId ? '[' + log.targetId + '] ' : '') + (log.targetName || '—')
    +     '</span></div>'
    +     '<div class="detail-item"><span class="detail-label">IP 地址</span><span>' + mockIp + '</span></div>'
    +     '<div class="detail-item"><span class="detail-label">浏览器/系统</span><span>' + mockBrowser + '</span></div>'
    +     '<div class="detail-item" style="grid-column:span 2"><span class="detail-label">详情摘要</span><span>' + (log.detail || '—') + '</span></div>'
    +   '</div>'
    + '</div>'

    + diffHtml

    + '<div style="margin-top:12px;padding:10px 16px;background:#fffbe6;border:1px solid #ffe58f;border-radius:4px;font-size:12px;color:#ad6800;text-align:center">'
    +   '<span class="inline-notice lock">已锁定</span> 不可篡改记录 — 本日志由系统自动生成，任何修改或删除操作均被禁止并记录'
    + '</div>';
});
