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

/* ====== 视图：项目全景详情（占位，T8+ 填充） ====== */
registerView('project-overview-detail', function() {
  return '<div class="page-header"><h2>项目全景详情</h2></div><div class="card">视图建设中…</div>';
});

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
