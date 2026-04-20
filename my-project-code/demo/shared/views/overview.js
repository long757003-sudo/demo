// shared/views/overview.js — V1.0 项目全景模块
// 两个顶级视图：
//   project-overview-board  — 生命周期看板（表格列表形态）
//   project-overview-detail — 项目全景详情（10 块阶段聚合）
// 仅只读聚合现有 DATA，不引入新的业务操作入口。

/* ====== 阶段枚举 ====== */
const OV_STAGES = [
  { status: 'demand',        label: '需求征集', color: 'blue'   },
  { status: 'reviewing',     label: '立项论证', color: 'blue'   },
  { status: 'procurement',   label: '采购中',   color: 'blue'   },
  { status: 'implementing',  label: '实施中',   color: 'blue'   },
  { status: 'acceptance',    label: '验收中',   color: 'blue'   },
  { status: 'ops',           label: '运维中',   color: 'blue'   },
  { status: 'completed',     label: '已完成',   color: 'gray'   },
  { status: 'frozen',        label: '冻结',     color: 'yellow' },
  { status: 'terminated',    label: '已终止',   color: 'red'    },
];

function _ovStatusLabel(s) {
  var it = OV_STAGES.find(function(x){ return x.status === s; });
  return it ? it.label : (s || '—');
}

function _ovStatusBadge(s) {
  var it = OV_STAGES.find(function(x){ return x.status === s; });
  if (!it) return '<span class="tag">—</span>';
  var clsMap = { blue: 'tag-blue', gray: 'tag', yellow: 'tag-warning', red: 'tag-danger' };
  return '<span class="tag ' + (clsMap[it.color] || 'tag-blue') + '">' + it.label + '</span>';
}

function _ovTypeLabel(t) {
  return ({ major: '重大', mid: '中型', small: '小型', micro: '微型' }[t]) || (t || '—');
}

/* ====== 角色权限过滤（双重防线） ====== */
window._ovFilterProjects = function(list) {
  var role = getCurrentRole();
  var me = DATA.currentUser || {};
  if (['info-admin','info-leader','leadership-office','leadership-group'].indexOf(role) >= 0) {
    return list.slice();
  }
  if (role === 'project-manager') {
    return list.filter(function(p){ return p.manager === me.name; });
  }
  if (role === 'unit-admin') {
    return list.filter(function(p){ return p.unit === me.unit; });
  }
  return []; // 其它角色（含 expert）— 即使菜单被绕过也返回空
};

/* ====== 项目最近更新时间 ====== */
function _ovProjectUpdatedAt(p) {
  var ids = [p.id, p.demandId, p.proposalId, p.contractId].filter(Boolean);
  var logs = (DATA.operationLogs || []).filter(function(l){ return ids.indexOf(l.targetId) >= 0; });
  if (!logs.length) return p.startDate || '';
  var max = logs[0].time;
  for (var i = 1; i < logs.length; i++) { if (logs[i].time > max) max = logs[i].time; }
  return (max || '').slice(0, 10); // YYYY-MM-DD
}

/* ====== 项目行数据预处理（给 board 用） ====== */
function _ovProjectRow(p) {
  return {
    id: p.id,
    name: p.name,
    unit: p.unit,
    manager: p.manager,
    type: p.type,
    typeLabel: _ovTypeLabel(p.type),
    budget: p.budget,
    status: p.status,
    statusLabel: _ovStatusLabel(p.status),
    progress: p.progress || 0,
    updatedAt: _ovProjectUpdatedAt(p),
  };
}

/* ====== 视图：生命周期看板（表格列表） ====== */
registerView('project-overview-board', function() {
  var visible = _ovFilterProjects(DATA.projects || []);
  var rows = visible.map(_ovProjectRow);
  // 默认排序：updatedAt 降序
  rows.sort(function(a,b){ return (a.updatedAt < b.updatedAt) ? 1 : (a.updatedAt > b.updatedAt ? -1 : 0); });

  // 单位下拉选项（从 visible 去重）
  var units = Array.from(new Set(rows.map(function(r){ return r.unit; }))).filter(Boolean).sort();
  var unitOpts = '<option value="">全部单位</option>' + units.map(function(u){ return '<option value="' + u + '">' + u + '</option>'; }).join('');

  var stageOpts = '<option value="">全部阶段</option>' + OV_STAGES.map(function(s){ return '<option value="' + s.status + '">' + s.label + '</option>'; }).join('');

  var typeOpts = '<option value="">全部类型</option>' +
    '<option value="major">重大</option>' +
    '<option value="mid">中型</option>' +
    '<option value="small">小型</option>' +
    '<option value="micro">微型</option>';

  // 存全量到 window 供后续过滤/排序/导出使用
  var rowsJson = JSON.stringify(rows);

  return '<div>' +
    breadcrumb('项目全景', '生命周期看板') +
    '<div class="page-header" style="display:flex;align-items:center;justify-content:space-between">' +
      '<div class="page-title">生命周期看板 <span id="ov-count" style="font-size:12px;color:var(--text-secondary);font-weight:normal;margin-left:8px">共 ' + rows.length + ' 个项目</span></div>' +
      '<button class="btn btn-primary" id="ov-export-csv" onclick="_ovExportCSV()"><i data-lucide="download" style="width:14px;height:14px;margin-right:4px"></i>导出 CSV</button>' +
    '</div>' +
    '<div class="card">' +
      '<div class="filter-bar" style="display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin-bottom:16px">' +
        '<select id="ov-filter-unit" class="select" style="width:150px" onchange="_ovBoardFilter()">' + unitOpts + '</select>' +
        '<select id="ov-filter-type" class="select" style="width:110px" onchange="_ovBoardFilter()">' + typeOpts + '</select>' +
        '<select id="ov-filter-stage" class="select" style="width:130px" onchange="_ovBoardFilter()">' + stageOpts + '</select>' +
        '<input id="ov-filter-kw" class="input" placeholder="编号/名称/负责人" style="width:200px" oninput="_ovBoardFilter()">' +
        '<button class="btn" id="ov-filter-reset" onclick="_ovBoardReset()">重置</button>' +
      '</div>' +
      '<div id="ov-board-table-wrap"></div>' +
      '<div id="ov-board-pagination" style="margin-top:12px;display:flex;justify-content:center;gap:4px"></div>' +
    '</div>' +
    '<script>(function(){' +
      'window._ovBoardState = { rows: ' + rowsJson + ', sortKey: "updatedAt", sortDir: "desc", page: 1, pageSize: 20 };' +
      '_ovBoardRender();' +
      'if (window.lucide) lucide.createIcons();' +
    '})();</script>' +
    '</div>';
});

/* ====== 视图：项目全景详情 ====== */
// status → 默认展开的块序号（块 3/6/10 始终默认折叠）
const OV_STATUS_TO_BLOCK = {
  demand: 1, reviewing: 2, procurement: 4, implementing: 5,
  acceptance: 7, ops: 8, completed: 9, frozen: 9, terminated: 9,
};

registerView('project-overview-detail', function() {
  var params = getViewParams('project-overview-detail') || {};
  var visible = _ovFilterProjects(DATA.projects || []);
  var project = params.id
    ? (DATA.projects.find(function(p){ return p.id === params.id; }) || null)
    : (visible[0] || null);

  if (!project) {
    return '<div>' +
      breadcrumb('项目全景', '项目全景详情') +
      '<div class="page-header"><div class="page-title">项目全景详情</div></div>' +
      '<div class="card" style="text-align:center;padding:48px;color:var(--text-secondary)">' +
        '无可查看的项目（您当前角色 <strong>' + getCurrentRole() + '</strong> 无可见项目数据）' +
      '</div></div>';
  }

  // 角色权限二次校验：避免 project-manager/unit-admin 通过 URL 直接访问其它项目
  var role = getCurrentRole();
  var me = DATA.currentUser || {};
  if (role === 'project-manager' && project.manager !== me.name) {
    return '<div>' + breadcrumb('项目全景', '项目全景详情') +
      '<div class="card" style="text-align:center;padding:48px;color:var(--text-secondary)">无权查看该项目</div></div>';
  }
  if (role === 'unit-admin' && project.unit !== me.unit) {
    return '<div>' + breadcrumb('项目全景', '项目全景详情') +
      '<div class="card" style="text-align:center;padding:48px;color:var(--text-secondary)">无权查看该项目</div></div>';
  }

  var activeBlock = OV_STATUS_TO_BLOCK[project.status] || 0;

  // 基本信息 card
  var infoCard =
    '<div class="card" style="margin-bottom:16px">' +
      '<div class="detail-grid" style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px 20px">' +
        '<div class="detail-item"><span class="detail-label">项目编号</span><span class="detail-value"><strong>' + project.id + '</strong></span></div>' +
        '<div class="detail-item"><span class="detail-label">项目名称</span><span class="detail-value">' + project.name + '</span></div>' +
        '<div class="detail-item"><span class="detail-label">申报单位</span><span class="detail-value">' + (project.unit || '—') + '</span></div>' +
        '<div class="detail-item"><span class="detail-label">负责人</span><span class="detail-value">' + (project.manager || '—') + '</span></div>' +
        '<div class="detail-item"><span class="detail-label">类型</span><span class="detail-value">' + _ovTypeLabel(project.type) + '</span></div>' +
        '<div class="detail-item"><span class="detail-label">预算</span><span class="detail-value">' + (project.budget != null ? project.budget + ' 万' : '—') + '</span></div>' +
        '<div class="detail-item"><span class="detail-label">当前阶段</span><span class="detail-value">' + _ovStatusBadge(project.status) + '</span></div>' +
        '<div class="detail-item"><span class="detail-label">整体进度</span><span class="detail-value">' + _ovProgressBar(project.progress || 0) + '</span></div>' +
      '</div>' +
    '</div>';

  // 8 阶段时间线条（只显示，不可交互）
  var lcHtml = _ovLifecycleBar(project.status);

  // 10 个聚合块
  var blocks = [
    _ovBlockShell(1,  '需求征集',       _ovBlock1Demand(project),     _ovJumpBtn('demand-detail',    project.demandId   ? { id: project.demandId }   : null), activeBlock === 1),
    _ovBlockShell(2,  '立项论证',       _ovBlock2Proposal(project),   _ovJumpBtn('proposal-fill',    project.proposalId ? { id: project.proposalId } : null), activeBlock === 2),
    _ovBlockShell(3,  '专家评审记录',   _ovBlock3Reviews(project),    _ovJumpBtn('review-list',      { projectId: project.id }), false),
    _ovBlockShell(4,  '合同采购',       _ovBlock4Contracts(project),  _ovJumpBtn('contract-ledger',  { projectId: project.id }), activeBlock === 4),
    _ovBlockShell(5,  '项目实施',       _ovBlock5Implement(project),  _ovJumpBtn('implement',        { id: project.id }), activeBlock === 5),
    _ovBlockShell(6,  '延期/变更',      _ovBlock6Changes(project),    _ovJumpBtn('delay-change',     { id: project.id }), false),
    _ovBlockShell(7,  '验收',           _ovBlock7Acceptance(project), _ovJumpBtn('acceptance-list',  { projectId: project.id }), activeBlock === 7),
    _ovBlockShell(8,  '运维',           _ovBlock8Ops(project),        _ovJumpBtn('ops-records',      { projectId: project.id }), activeBlock === 8),
    _ovBlockShell(9,  '终止/完成',      _ovBlock9Terminal(project),   project.status === 'completed' ? '' : _ovJumpBtn('terminate', { id: project.id }), activeBlock === 9),
    _ovBlockShell(10, '项目日志',       _ovBlock10Logs(project),      '', false), // 块 10 不提供跳转，始终默认折叠
  ].join('');

  return '<div>' +
    breadcrumb('项目全景', '生命周期看板', project.name) +
    '<div class="page-header"><div class="page-title">项目全景详情 · ' + project.name + '</div></div>' +
    infoCard +
    '<div class="card" style="margin-bottom:16px;padding:12px 16px">' + lcHtml + '</div>' +
    blocks +
    '</div>';
});

/* ====== 详情页辅助组件 ====== */
function _ovProgressBar(pct) {
  if (!pct) return '—';
  return '<div style="display:flex;align-items:center;gap:6px"><div class="progress-bar-wrap" style="width:100px"><div class="progress-bar" style="width:' + pct + '%"></div></div><span style="font-size:11px;color:#666">' + pct + '%</span></div>';
}

function _ovLifecycleBar(status) {
  var phases = ['需求征集','立项论证','采购','实施','验收','运维','已完成/终止'];
  var idxMap = { demand:0, reviewing:1, procurement:2, implementing:3, acceptance:4, ops:5, completed:6, terminated:6, frozen:6 };
  var cur = idxMap[status] !== undefined ? idxMap[status] : 0;
  var html = '<div class="lifecycle-bar" style="display:flex;align-items:center;flex-wrap:nowrap;overflow-x:auto;padding:4px 0">';
  phases.forEach(function(label, i){
    var done = i < cur, active = i === cur;
    var dot = done
      ? '<div style="width:24px;height:24px;border-radius:50%;background:var(--success);display:flex;align-items:center;justify-content:center;color:#fff;font-size:12px;flex-shrink:0">✓</div>'
      : active
        ? '<div style="width:24px;height:24px;border-radius:50%;background:var(--primary);display:flex;align-items:center;justify-content:center;color:#fff;font-size:11px;font-weight:700;flex-shrink:0">' + (i+1) + '</div>'
        : '<div style="width:24px;height:24px;border-radius:50%;background:#d9d9d9;display:flex;align-items:center;justify-content:center;color:#999;font-size:11px;flex-shrink:0">' + (i+1) + '</div>';
    var labelStyle = done ? 'color:var(--success);font-size:11px;margin-top:3px' : active ? 'color:var(--primary);font-size:11px;font-weight:600;margin-top:3px' : 'color:#bbb;font-size:11px;margin-top:3px';
    html += '<div style="display:flex;flex-direction:column;align-items:center;min-width:56px">' + dot + '<div style="' + labelStyle + '">' + label + '</div></div>';
    if (i < phases.length - 1) {
      var lineColor = i < cur ? 'var(--success)' : '#d9d9d9';
      html += '<div style="flex:1;height:2px;background:' + lineColor + ';min-width:12px;margin:0 2px;margin-bottom:14px"></div>';
    }
  });
  html += '</div>';
  return html;
}

function _ovBlockShell(seq, title, bodyHtml, jumpHtml, defaultOpen) {
  var isEmpty = !bodyHtml || /本阶段暂无记录|无相关数据/.test(bodyHtml);
  return '<details class="card" id="ov-stage-' + seq + '" style="margin-bottom:12px;padding:0"' + (defaultOpen ? ' open' : '') + '>' +
    '<summary style="cursor:pointer;padding:12px 16px;display:flex;align-items:center;justify-content:space-between;list-style:none;user-select:none">' +
      '<span style="font-size:14px;font-weight:600">第 ' + seq + ' 阶段 · ' + title + '</span>' +
      '<span style="display:flex;align-items:center;gap:8px">' + (isEmpty ? '' : (jumpHtml || '')) + '</span>' +
    '</summary>' +
    '<div style="padding:12px 16px 16px;border-top:1px solid #f0f0f0">' + (bodyHtml || '本阶段暂无记录') + '</div>' +
    '</details>';
}

function _ovJumpBtn(viewId, params) {
  if (!viewId) return '';
  var paramStr = params ? JSON.stringify(params) : 'null';
  return '<a class="link" style="font-size:12px" onclick="event.stopPropagation();event.preventDefault();navigate(\'' + viewId + '\',' + paramStr.replace(/"/g,'&quot;') + ')">打开完整视图 →</a>';
}

/* ====== 10 个聚合块的实现（T9-T13 填充，T8 先给空占位） ====== */
/* --- 通用工具 --- */
function _ovEsc(s) { return (s == null ? '' : String(s)).replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
function _ovTrunc(s, n) { if (!s) return ''; s = String(s); return s.length > n ? s.slice(0, n) + '…' : s; }
function _ovKv(label, value) {
  return '<div style="display:flex;margin-bottom:6px"><span style="min-width:90px;color:var(--text-secondary);font-size:12px">' + label + '</span><span style="flex:1;font-size:12px">' + (value != null && value !== '' ? value : '—') + '</span></div>';
}
function _ovDemandStatusBadge(s) {
  var m = {
    draft: ['草稿', 'tag'],
    submitted: ['已提交', 'tag-blue'],
    sorted: ['已排序', 'tag-blue'],
    'unit-pending': ['单位待审批', 'tag-warning'],
    'unit-approved': ['单位已批准', 'tag-success'],
    'unit-rejected': ['单位已驳回', 'tag-danger'],
    'in-selection': ['信办筛选中', 'tag-warning'],
    'supported': ['已支持', 'tag-success'],
    'not-supported': ['不支持', 'tag-danger'],
  };
  var it = m[s] || [s || '—', 'tag'];
  return '<span class="tag ' + it[1] + '">' + it[0] + '</span>';
}

/* --- 块 1 需求征集 --- */
function _ovBlock1Demand(project) {
  if (!project.demandId) return '本阶段暂无记录';
  var demand = (DATA.demands || []).find(function(d){ return d.id === project.demandId; });
  if (!demand) return '本阶段暂无记录（关联需求 ' + project.demandId + ' 未找到）';
  var plan = (DATA.collectionPlans || []).find(function(cp){ return cp.id === demand.collectionId; });

  var summary = demand.summary || demand.background || project.background || '';
  var summaryHtml = summary ? _ovEsc(_ovTrunc(summary, 200)) : '—';

  var tags = Array.isArray(demand.tags) ? demand.tags : [];
  var tagsHtml = tags.length
    ? tags.map(function(t){ return '<span class="tag tag-blue" style="margin-right:4px">' + _ovEsc(t) + '</span>'; }).join('')
    : '<span style="color:var(--text-secondary);font-size:12px">暂未打标签</span>';

  var attachments = Array.isArray(demand.attachments) ? demand.attachments : [];
  var attachmentsHtml = attachments.length
    ? attachments.map(function(a){
        return '<a class="link" style="font-size:12px;margin-right:12px" onclick="toast(\'Demo 不支持下载\',\'info\')"><i data-lucide="paperclip" style="width:12px;height:12px;margin-right:2px"></i>' + _ovEsc(a.name) + ' <span style="color:var(--text-secondary)">(' + _ovEsc(a.size || '') + ')</span></a>';
      }).join('')
    : '<span style="color:var(--text-secondary);font-size:12px">无附件</span>';

  var rejection = demand.unitRejectionReason || demand.rejectionCategory;

  return (
    _ovKv('征集名称', plan ? (_ovEsc(plan.title) + ' <span style="color:var(--text-secondary);font-size:11px">(' + demand.collectionId + ')</span>') : demand.collectionId || '—') +
    _ovKv('项目摘要', summaryHtml) +
    _ovKv('标签',     tagsHtml) +
    _ovKv('附件',     attachmentsHtml) +
    _ovKv('申报单位', _ovEsc(demand.unitId || '')) +
    _ovKv('填报人',   _ovEsc(demand.submittedBy || '')) +
    _ovKv('预算估算', (demand.budgetEstimate != null ? demand.budgetEstimate + ' 万' : '—')) +
    _ovKv('排序',     (demand.sortOrder != null ? String(demand.sortOrder) : '—')) +
    _ovKv('申报状态', _ovDemandStatusBadge(demand.status)) +
    (rejection ? _ovKv('驳回原因', '<span style="color:var(--danger)">' + _ovEsc(rejection) + '</span>') : '')
  );
}

/* --- 块 2 立项论证 --- */
function _ovBlock2Proposal(project) {
  if (!project.proposalId) return '本阶段暂无记录';
  var pr = (DATA.proposals || []).find(function(p){ return p.id === project.proposalId; });
  if (!pr) return '本阶段暂无记录（关联申报书 ' + project.proposalId + ' 未找到）';

  var reviewPathLabel = { 'standard-review': '标准评审', 'self-organized': '自组织评审', 'exempt': '免评审' }[pr.reviewPath] || pr.reviewPath || '—';

  var approval = '—';
  if (pr.approvalDecision) {
    var a = pr.approvalDecision;
    var resultTag = a.result === 'approved'
      ? '<span class="tag tag-success">同意立项</span>'
      : a.result === 'rejected' ? '<span class="tag tag-danger">不予立项</span>' : '<span class="tag">' + (a.result || '—') + '</span>';
    approval = resultTag + ' · ' + _ovEsc(a.approvedBy || '') + ' · ' + _ovEsc(a.approvedAt || '') + (a.comment ? '<div style="margin-top:4px;color:var(--text-secondary);font-size:11px">' + _ovEsc(a.comment) + '</div>' : '');
  }

  var funding = '—';
  if (pr.fundingAllocation) {
    var f = pr.fundingAllocation;
    funding = (f.confirmedAmount != null ? f.confirmedAmount + ' 万' : '—') + ' · ' + _ovEsc(f.confirmedBy || '') + ' · ' + _ovEsc(f.confirmedAt || '');
  }

  return (
    _ovKv('申报书编号', '<strong>' + pr.id + '</strong>') +
    _ovKv('申报书状态', '<span class="tag tag-blue">' + _ovEsc(pr.status || '—') + '</span>') +
    _ovKv('提交时间',   _ovEsc(pr.submittedAt || '')) +
    _ovKv('建设目标',   _ovEsc(_ovTrunc(pr.goal || '', 120))) +
    _ovKv('评审路径',   _ovEsc(reviewPathLabel) + ' · 第 ' + (pr.reviewRound != null ? pr.reviewRound : 1) + ' 轮') +
    _ovKv('审定决策',   approval) +
    _ovKv('经费核定',   funding)
  );
}
/* --- 块 3 专家评审记录 --- */
function _ovBlock3Reviews(project) {
  var reviews = (DATA.reviews || []).filter(function(r){
    return (project.id && r.projectId === project.id) || (project.demandId && r.demandId === project.demandId);
  });
  if (!reviews.length) return '本阶段暂无记录';
  reviews.sort(function(a,b){ return (a.date || '') < (b.date || '') ? -1 : 1; });

  var expertName = function(eid){
    var e = (DATA.experts || []).find(function(x){ return x.id === eid; });
    return e ? e.name : eid;
  };

  var conclusionTag = function(fc){
    if (!fc) return '<span class="tag">进行中</span>';
    if (fc === '通过')  return '<span class="tag tag-success">通过</span>';
    if (fc === '不通过') return '<span class="tag tag-danger">不通过</span>';
    if (fc === '退回修改') return '<span class="tag tag-warning">退回修改</span>';
    return '<span class="tag">' + _ovEsc(fc) + '</span>';
  };

  var rows = reviews.map(function(r){
    var exps = (r.experts || []).map(expertName).join('、');
    var rework = r.reworkRequirement
      ? '<div style="margin-top:4px;font-size:11px;color:var(--text-secondary);white-space:pre-wrap">退回修改要求：' + _ovEsc(r.reworkRequirement) + '</div>'
      : '';
    return '<tr>' +
      '<td>' + _ovEsc(r.triggerScene || '—') + '</td>' +
      '<td>' + _ovEsc(r.date || '—') + '</td>' +
      '<td>第 ' + (r.round != null ? r.round : 1) + ' 轮</td>' +
      '<td style="font-size:11px">' + _ovEsc(exps) + '</td>' +
      '<td style="text-align:right">' + (r.weightedScore != null ? r.weightedScore : '—') + '</td>' +
      '<td>' + conclusionTag(r.finalConclusion) + rework + '</td>' +
    '</tr>';
  }).join('');

  return '<div style="font-size:12px;color:var(--text-secondary);margin-bottom:6px">共 ' + reviews.length + ' 条评审记录（按时间升序）</div>' +
    '<table class="data-table" style="font-size:12px"><thead><tr>' +
      '<th>触发场景</th><th style="width:100px">时间</th><th style="width:70px">轮次</th><th>专家</th><th style="width:80px;text-align:right">加权分</th><th style="width:140px">结论</th>' +
    '</tr></thead><tbody>' + rows + '</tbody></table>';
}

/* --- 块 4 合同采购 --- */
function _ovBlock4Contracts(project) {
  var contracts = (DATA.contracts || []).filter(function(c){ return c.projectId === project.id; });
  if (!contracts.length) return '本阶段暂无记录';

  return contracts.map(function(c){
    var statusTag = c.status === 'completed'
      ? '<span class="tag tag-success">已完成</span>'
      : c.status === 'active' ? '<span class="tag tag-blue">履行中</span>' : '<span class="tag">' + _ovEsc(c.status || '—') + '</span>';

    var payRows = (c.payments || []).map(function(p){
      var payTag = p.status === 'paid'
        ? '<span class="tag tag-success">已支付</span>'
        : '<span class="tag tag-warning">待支付</span>';
      return '<tr>' +
        '<td>' + _ovEsc(p.node || '—') + '</td>' +
        '<td style="text-align:right">' + (p.ratio != null ? p.ratio + '%' : '—') + '</td>' +
        '<td style="text-align:right">' + (p.amount != null ? p.amount + ' 万' : '—') + '</td>' +
        '<td>' + payTag + '</td>' +
        '<td>' + _ovEsc(p.date || '—') + '</td>' +
      '</tr>';
    }).join('');

    return '<div style="padding:8px 0;border-bottom:1px dashed #eee;margin-bottom:8px">' +
      _ovKv('合同编号', '<strong>' + c.id + '</strong> · ' + statusTag) +
      _ovKv('供应商',   _ovEsc(c.vendor || '—')) +
      _ovKv('合同金额', (c.amount != null ? c.amount + ' 万' : '—')) +
      _ovKv('签订日期', _ovEsc(c.signDate || '—')) +
      _ovKv('结束日期', _ovEsc(c.endDate || '—') + (c.warrantyYears ? ' · 保修 ' + c.warrantyYears + ' 年' : '')) +
      (payRows ? '<div style="margin-top:8px"><div style="font-size:12px;color:var(--text-secondary);margin-bottom:4px">付款节点</div>' +
        '<table class="data-table" style="font-size:11px"><thead><tr><th>节点</th><th style="width:60px;text-align:right">比例</th><th style="width:90px;text-align:right">金额</th><th style="width:80px">状态</th><th style="width:100px">日期</th></tr></thead><tbody>' + payRows + '</tbody></table></div>' : '') +
    '</div>';
  }).join('');
}
/* --- 块 5 项目实施 --- */
function _ovBlock5Implement(project) {
  var history = (DATA.progressHistory || []).filter(function(h){ return h.projectId === project.id; });
  history.sort(function(a,b){ return (a.period || '') < (b.period || '') ? 1 : -1; });

  var currentBar = '<div style="margin-bottom:12px">' +
    '<div style="font-size:12px;color:var(--text-secondary);margin-bottom:4px">当前进度</div>' +
    _ovProgressBar(project.progress || 0) +
    '</div>';

  if (!history.length) return currentBar + '<div style="color:var(--text-secondary);font-size:12px">无分期汇报历史</div>';

  var rows = history.map(function(h){
    return '<tr>' +
      '<td>' + _ovEsc(h.period || '—') + '</td>' +
      '<td>' + _ovProgressBar(h.pct || 0) + '</td>' +
      '<td>' + _ovEsc(h.submittedBy || '—') + '</td>' +
      '<td>' + _ovEsc(h.submittedAt || '—') + '</td>' +
    '</tr>';
  }).join('');

  return currentBar +
    '<div style="font-size:12px;color:var(--text-secondary);margin-bottom:4px">分期汇报历史（按周期倒序，共 ' + history.length + ' 期）</div>' +
    '<table class="data-table" style="font-size:12px"><thead><tr>' +
      '<th style="width:100px">周期</th><th>进度</th><th style="width:100px">提交人</th><th style="width:120px">提交时间</th>' +
    '</tr></thead><tbody>' + rows + '</tbody></table>';
}

/* --- 块 6 延期/变更 --- */
function _ovBlock6Changes(project) {
  var ids = [project.id, project.proposalId].filter(Boolean);
  var logs = (DATA.operationLogs || []).filter(function(l){
    if (ids.indexOf(l.targetId) < 0) return false;
    var a = l.action || '';
    return /变更|延期|驳回/.test(a);
  });
  if (!logs.length) return '本阶段暂无记录';
  logs.sort(function(a,b){ return (a.time || '') < (b.time || '') ? -1 : 1; });

  var rows = logs.map(function(l){
    var changes = '';
    if (Array.isArray(l.changes) && l.changes.length) {
      changes = '<div style="font-size:11px;color:var(--text-secondary);margin-top:4px">' +
        l.changes.map(function(c){ return _ovEsc(c.field) + '：' + _ovEsc(c.before) + ' → <span style="color:var(--primary)">' + _ovEsc(c.after) + '</span>'; }).join('<br>') +
      '</div>';
    }
    return '<tr>' +
      '<td style="white-space:nowrap">' + _ovEsc(l.time || '—') + '</td>' +
      '<td>' + _ovEsc(l.operator || '—') + '<div style="font-size:10px;color:var(--text-secondary)">' + _ovEsc(l.role || '') + '</div></td>' +
      '<td><span class="tag tag-warning">' + _ovEsc(l.action || '—') + '</span></td>' +
      '<td style="font-size:11px">' + _ovEsc(l.detail || '—') + changes + '</td>' +
    '</tr>';
  }).join('');

  return '<div style="font-size:12px;color:var(--text-secondary);margin-bottom:4px">共 ' + logs.length + ' 条变更/延期/驳回记录</div>' +
    '<table class="data-table" style="font-size:12px"><thead><tr>' +
      '<th style="width:130px">时间</th><th style="width:100px">操作人</th><th style="width:110px">动作</th><th>说明</th>' +
    '</tr></thead><tbody>' + rows + '</tbody></table>';
}
/* --- 块 7 验收 --- */
function _ovBlock7Acceptance(project) {
  var acs = (DATA.acceptances || []).filter(function(a){ return a.projectId === project.id; });
  if (!acs.length) return '本阶段暂无记录';

  return acs.map(function(a){
    var formalTag = a.formalStatus === '已通过'
      ? '<span class="tag tag-success">已通过</span>'
      : a.formalStatus === '不通过'
        ? '<span class="tag tag-danger">不通过</span>'
        : '<span class="tag tag-warning">' + _ovEsc(a.formalStatus || '待组织') + '</span>';

    var report = a.reportFile
      ? '<a class="link" onclick="toast(\'Demo 不支持下载\',\'info\')"><i data-lucide="file-text" style="width:12px;height:12px;margin-right:2px"></i>' + _ovEsc(a.reportFile) + '</a>'
      : '<span style="color:var(--text-secondary)">暂无</span>';

    return '<div style="padding:8px 0;border-bottom:1px dashed #eee;margin-bottom:8px">' +
      _ovKv('验收编号',   '<strong>' + a.id + '</strong>') +
      _ovKv('初验通过',   _ovEsc(a.internalPassedAt || '—')) +
      _ovKv('试运行起止', (a.trialStartAt ? _ovEsc(a.trialStartAt) : '—') + (a.trialMonths ? ' · ' + a.trialMonths + ' 个月' : '')) +
      _ovKv('正式验收',   formalTag + (a.formalPassedAt ? ' · ' + _ovEsc(a.formalPassedAt) : '')) +
      _ovKv('验收结论',   _ovEsc(a.conclusion || '—')) +
      _ovKv('验收报告',   report) +
    '</div>';
  }).join('');
}

/* --- 块 8 运维 --- */
function _ovBlock8Ops(project) {
  var recs = (DATA.opsRecords || []).filter(function(r){ return r.projectId === project.id; });
  var faults = (DATA.faultTickets || []).filter(function(f){ return f.projectId === project.id; });
  if (!recs.length && !faults.length) return '本阶段暂无记录';

  var recTypeLabel = { inspection: '巡检', backup: '备份', incident: '事件', patch: '补丁' };
  var recStatusTag = function(s){
    if (s === 'normal')   return '<span class="tag tag-success">正常</span>';
    if (s === 'abnormal') return '<span class="tag tag-danger">异常</span>';
    return '<span class="tag">' + _ovEsc(s || '—') + '</span>';
  };

  var recsHtml = '';
  if (recs.length) {
    var rows = recs.map(function(r){
      return '<tr>' +
        '<td>' + _ovEsc(r.date || '—') + '</td>' +
        '<td>' + _ovEsc(recTypeLabel[r.type] || r.type || '—') + '</td>' +
        '<td>' + _ovEsc(r.operator || '—') + '</td>' +
        '<td style="font-size:11px">' + _ovEsc(r.content || '—') + '</td>' +
        '<td>' + recStatusTag(r.status) + '</td>' +
      '</tr>';
    }).join('');
    recsHtml =
      '<div style="font-size:12px;color:var(--text-secondary);margin-bottom:4px">运维记录（共 ' + recs.length + ' 条）</div>' +
      '<table class="data-table" style="font-size:12px;margin-bottom:12px"><thead><tr>' +
        '<th style="width:110px">日期</th><th style="width:70px">类型</th><th style="width:80px">操作人</th><th>内容</th><th style="width:70px">状态</th>' +
      '</tr></thead><tbody>' + rows + '</tbody></table>';
  }

  var faultsHtml = '';
  if (faults.length) {
    var levelTag = function(l){
      if (l === 'major')    return '<span class="tag tag-danger">重大</span>';
      if (l === 'critical') return '<span class="tag tag-danger">严重</span>';
      if (l === 'normal')   return '<span class="tag tag-warning">一般</span>';
      return '<span class="tag">' + _ovEsc(l || '—') + '</span>';
    };
    var statusTag = function(s){
      if (s === 'resolved')     return '<span class="tag tag-success">已解决</span>';
      if (s === 'in-progress')  return '<span class="tag tag-warning">处理中</span>';
      if (s === 'open')         return '<span class="tag tag-danger">待处理</span>';
      return '<span class="tag">' + _ovEsc(s || '—') + '</span>';
    };
    var rows = faults.map(function(f){
      return '<tr>' +
        '<td>' + levelTag(f.level) + '</td>' +
        '<td style="font-size:11px">' + _ovEsc(f.title || '—') + '</td>' +
        '<td>' + _ovEsc(f.reportTime || '—') + '<div style="font-size:10px;color:var(--text-secondary)">' + _ovEsc(f.reporter || '') + '</div></td>' +
        '<td>' + statusTag(f.status) + '</td>' +
        '<td style="font-size:11px">' + _ovEsc(f.resolveTime || '—') + (f.resolution ? '<div style="font-size:10px;color:var(--text-secondary)">' + _ovEsc(f.resolution) + '</div>' : '') + '</td>' +
      '</tr>';
    }).join('');
    faultsHtml =
      '<div style="font-size:12px;color:var(--text-secondary);margin-bottom:4px">故障工单（共 ' + faults.length + ' 条）</div>' +
      '<table class="data-table" style="font-size:12px"><thead><tr>' +
        '<th style="width:60px">级别</th><th>标题</th><th style="width:130px">上报</th><th style="width:80px">状态</th><th>解决</th>' +
      '</tr></thead><tbody>' + rows + '</tbody></table>';
  }

  return recsHtml + faultsHtml;
}
function _ovBlock9Terminal(project)   { return '本阶段暂无记录'; }
function _ovBlock10Logs(project)      { return '本阶段暂无记录'; }

/* ====== Board 渲染（T6 占位版，T7 补完过滤/排序/导出/分页） ====== */
window._ovBoardRender = function() {
  var st = window._ovBoardState || {};
  var rows = (st.rows || []).slice();
  // 简单排序（T7 会扩展为按列排序）
  var dir = st.sortDir === 'asc' ? 1 : -1;
  var key = st.sortKey || 'updatedAt';
  rows.sort(function(a,b){
    var av = a[key], bv = b[key];
    if (av === bv) return 0;
    return (av < bv ? -1 : 1) * dir;
  });
  var total = rows.length;
  var pageSize = st.pageSize || 20;
  var page = st.page || 1;
  var slice = rows.slice((page - 1) * pageSize, page * pageSize);

  var wrap = document.getElementById('ov-board-table-wrap');
  if (!wrap) return;
  var countEl = document.getElementById('ov-count');
  if (countEl) countEl.textContent = '共 ' + total + ' 个项目';

  wrap.innerHTML = _ovBoardRenderTable(slice);
  document.getElementById('ov-board-pagination').innerHTML = _ovBoardRenderPagination(total, page, pageSize);
};

function _ovBoardRenderTable(rows) {
  var cols = [
    { label: '项目编号',   key: 'id',        width: '80px'  },
    { label: '项目名称',   key: 'name'                       },
    { label: '单位',       key: 'unit'                       },
    { label: '负责人',     key: 'manager'                    },
    { label: '类型',       key: 'type'                       },
    { label: '预算（万）', key: 'budget',    width: '90px'  },
    { label: '当前阶段',   key: 'status'                     },
    { label: '进度',       key: 'progress',  width: '130px' },
    { label: '最近更新',   key: 'updatedAt', width: '110px' },
    { label: '操作',                          width: '100px' },
  ];
  var thead = cols.map(function(c, i){
    var sortable = i < cols.length - 1;
    var attr = (c.width ? ' style="width:' + c.width + ';' + (sortable ? 'cursor:pointer' : '') + '"' : (sortable ? ' style="cursor:pointer"' : ''));
    var clickAttr = sortable ? ' onclick="_ovBoardSort(\'' + c.key + '\')"' : '';
    return '<th' + attr + clickAttr + '>' + c.label + (sortable ? ' <span style="font-size:10px;color:#bbb">↕</span>' : '') + '</th>';
  }).join('');

  var tbody = rows.length
    ? rows.map(function(r){
        var pct = r.progress || 0;
        var pc = pct > 0
          ? '<div style="display:flex;align-items:center;gap:6px"><div class="progress-bar-wrap" style="width:80px"><div class="progress-bar" style="width:' + pct + '%"></div></div><span style="font-size:11px;color:#666">' + pct + '%</span></div>'
          : '—';
        var jumpDetail = 'navigate(\'project-overview-detail\',{id:\'' + r.id + '\'})';
        return '<tr style="cursor:pointer" onclick="' + jumpDetail + '">' +
          '<td><strong>' + r.id + '</strong></td>' +
          '<td><a class="link" onclick="event.stopPropagation();' + jumpDetail + '">' + r.name + '</a></td>' +
          '<td>' + r.unit + '</td>' +
          '<td>' + r.manager + '</td>' +
          '<td>' + r.typeLabel + '</td>' +
          '<td style="text-align:right">' + (r.budget != null ? r.budget : '—') + '</td>' +
          '<td>' + _ovStatusBadge(r.status) + '</td>' +
          '<td>' + pc + '</td>' +
          '<td>' + (r.updatedAt || '—') + '</td>' +
          '<td onclick="event.stopPropagation()"><button class="btn" style="padding:2px 10px;font-size:12px" onclick="' + jumpDetail + '">查看全景 →</button></td>' +
        '</tr>';
      }).join('')
    : '<tr><td colspan="' + cols.length + '" style="text-align:center;padding:32px;color:var(--text-secondary)">无符合条件的项目</td></tr>';

  return '<table class="data-table"><thead><tr>' + thead + '</tr></thead><tbody>' + tbody + '</tbody></table>';
}

function _ovBoardRenderPagination(total, page, pageSize) {
  if (total <= pageSize) return '';
  var totalPages = Math.ceil(total / pageSize);
  var btn = function(label, p, active, disabled) {
    if (disabled) return '<button class="btn" disabled style="padding:2px 10px;font-size:12px;opacity:0.5">' + label + '</button>';
    var cls = active ? 'btn btn-primary' : 'btn';
    return '<button class="' + cls + '" style="padding:2px 10px;font-size:12px" onclick="_ovBoardGoPage(' + p + ')">' + label + '</button>';
  };
  var html = '';
  html += btn('首页', 1, false, page === 1);
  html += btn('上一页', page - 1, false, page === 1);
  // 页码按钮最多 7 个
  var start = Math.max(1, page - 3);
  var end = Math.min(totalPages, start + 6);
  start = Math.max(1, end - 6);
  for (var p = start; p <= end; p++) html += btn(String(p), p, p === page, false);
  html += btn('下一页', page + 1, false, page === totalPages);
  html += btn('末页', totalPages, false, page === totalPages);
  return html;
}

/* ====== Board 联动：过滤 / 重置 / 排序 / 翻页 ====== */
window._ovBoardFilter = function() {
  var st = window._ovBoardState;
  if (!st) return;
  // 从全部 rows（存在 st._allRows 或首次从 st.rows 拷贝）过滤
  if (!st._allRows) st._allRows = st.rows.slice();
  var u  = (document.getElementById('ov-filter-unit')  || {}).value || '';
  var t  = (document.getElementById('ov-filter-type')  || {}).value || '';
  var s  = (document.getElementById('ov-filter-stage') || {}).value || '';
  var kw = ((document.getElementById('ov-filter-kw')   || {}).value || '').trim().toLowerCase();
  st.rows = st._allRows.filter(function(r){
    if (u && r.unit !== u)   return false;
    if (t && r.type !== t)   return false;
    if (s && r.status !== s) return false;
    if (kw) {
      var hay = (r.id + ' ' + r.name + ' ' + r.manager).toLowerCase();
      if (hay.indexOf(kw) < 0) return false;
    }
    return true;
  });
  st.page = 1;
  _ovBoardRender();
};

window._ovBoardReset = function() {
  ['ov-filter-unit','ov-filter-type','ov-filter-stage','ov-filter-kw'].forEach(function(id){
    var el = document.getElementById(id);
    if (el) el.value = '';
  });
  _ovBoardFilter();
};

window._ovBoardSort = function(key) {
  var st = window._ovBoardState;
  if (!st) return;
  if (st.sortKey === key) {
    st.sortDir = (st.sortDir === 'asc') ? 'desc' : 'asc';
  } else {
    st.sortKey = key;
    st.sortDir = (key === 'updatedAt' || key === 'budget' || key === 'progress') ? 'desc' : 'asc';
  }
  st.page = 1;
  _ovBoardRender();
};

window._ovBoardGoPage = function(p) {
  var st = window._ovBoardState;
  if (!st) return;
  var totalPages = Math.ceil(st.rows.length / (st.pageSize || 20));
  if (p < 1 || p > totalPages) return;
  st.page = p;
  _ovBoardRender();
};

/* ====== 导出 CSV ====== */
window._ovExportCSV = function() {
  var st = window._ovBoardState;
  if (!st) return;
  var rows = (st.rows || []).slice();
  // 当前排序下全部导出（不限制当前页）
  var dir = st.sortDir === 'asc' ? 1 : -1;
  var key = st.sortKey || 'updatedAt';
  rows.sort(function(a,b){
    var av = a[key], bv = b[key];
    if (av === bv) return 0;
    return (av < bv ? -1 : 1) * dir;
  });

  var headers = ['项目编号','项目名称','单位','负责人','类型','预算（万）','当前阶段','进度','最近更新'];
  var csvEscape = function(v) {
    if (v == null) return '';
    var s = String(v);
    if (s.indexOf(',') >= 0 || s.indexOf('"') >= 0 || s.indexOf('\n') >= 0) {
      s = '"' + s.replace(/"/g, '""') + '"';
    }
    return s;
  };
  var lines = [headers.join(',')];
  rows.forEach(function(r){
    lines.push([
      r.id, r.name, r.unit, r.manager, r.typeLabel,
      (r.budget != null ? r.budget : ''),
      r.statusLabel,
      (r.progress != null ? r.progress + '%' : ''),
      r.updatedAt || ''
    ].map(csvEscape).join(','));
  });
  var csvText = lines.join('\r\n');
  var blob = new Blob(['\ufeff' + csvText], { type: 'text/csv;charset=utf-8' });

  var now = new Date();
  var pad = function(n){ return String(n).padStart(2, '0'); };
  var fn = '项目全景_' + now.getFullYear() + pad(now.getMonth()+1) + pad(now.getDate()) + '_' + pad(now.getHours()) + pad(now.getMinutes()) + '.csv';

  var a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = fn;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(a.href);
  if (typeof toast === 'function') toast('已导出 ' + rows.length + ' 行到 CSV', 'success');
};
