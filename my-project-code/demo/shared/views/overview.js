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

/* ====== 视图骨架（正式实现在 T6-T13） ====== */
registerView('project-overview-board',  function() {
  return '<div class="page-header"><h2>生命周期看板</h2></div><div class="card">视图建设中…</div>';
});

registerView('project-overview-detail', function() {
  return '<div class="page-header"><h2>项目全景详情</h2></div><div class="card">视图建设中…</div>';
});
