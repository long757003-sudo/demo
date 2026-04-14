// shared/views/notification.js  —  V2.1

/* ============================================================
   MODULE-LEVEL: 从模板导入 — notification-create 辅助函数
   定义在顶层确保 onclick 可直接调用（innerHTML 不执行 <script>）
   ============================================================ */
var _notifImportTmplData = [
  { module:'需求征集', nodeKey:'1-1', nodeLabel:'信息办发布征集通知',    seq:1,   notifKind:'待阅', title:'【征集通知】{{批次名称}} 信息化项目需求征集开始',                                        body:'征集时间：{{开始日期}} 至 {{截止日期}}，请登录系统填报需求申请表。' },
  { module:'需求征集', nodeKey:'1-2', nodeLabel:'指派项目负责人',         seq:3,   notifKind:'待办', title:'【待办】您被指派为「{{项目名称}}」项目负责人，请填报需求申请表',                         body:'截止日期：{{征集截止日期}}，请尽快完成需求填报并提交单位负责人审核。' },
  { module:'需求征集', nodeKey:'1-3', nodeLabel:'需求申请表提交单位审批', seq:4,   notifKind:'待办', title:'【待审批】「{{项目名称}}」需求申请表待您审批',                                         body:'申报人：{{经办人姓名}}，预估预算：{{预算金额}}，请审核后决定是否通过。' },
  { module:'需求征集', nodeKey:'1-3', nodeLabel:'需求申请表提交单位审批', seq:6,   notifKind:'待办', title:'【已驳回】「{{项目名称}}」需求申请被驳回，请修改后重新提交',                            body:'驳回原因：{{驳回原因}}，请修改后重新提交。' },
  { module:'需求征集', nodeKey:'1-4', nodeLabel:'单位内项目排序',         seq:7,   notifKind:'待办', title:'【待办】请对本单位 {{N}} 个需求申请完成优先级排序后提交',                               body:'排序截止：{{截止日期}}，请登录系统完成排序并提交信息办。' },
  { module:'需求征集', nodeKey:'1-5', nodeLabel:'自动初筛 & 人工复核',    seq:10,  notifKind:'待阅', title:'【未通过】「{{项目名称}}」未通过需求初筛',                                            body:'原因：{{初筛原因}}。如有疑问请联系信息化建设办公室。' },
  { module:'需求征集', nodeKey:'1-5', nodeLabel:'自动初筛 & 人工复核',    seq:11,  notifKind:'待阅', title:'【通过初筛】「{{项目名称}}」已通过需求初筛，进入立项论证阶段',                          body:'请关注后续立项论证安排通知。' },
  { module:'立项论证', nodeKey:'2-1', nodeLabel:'填报立项申报书',          seq:13,  notifKind:'待办', title:'【待办】请完成「{{项目名称}}」立项申报书及建设方案填报',                               body:'截止日期：{{申报截止日期}}，请及时提交信息办审核。' },
  { module:'立项论证', nodeKey:'2-2', nodeLabel:'信息办审核申报材料',      seq:17,  notifKind:'待办', title:'【材料退回】「{{项目名称}}」申报材料需补充修改',                                      body:'退回意见：{{退回意见}}，请在 {{截止日期}} 前重新提交。' },
  { module:'立项论证', nodeKey:'2-3', nodeLabel:'论证专家选取与邀请',      seq:21,  notifKind:'待办', title:'【论证邀请】邀请您参与「{{项目名称}}」立项论证，请确认是否接受',                        body:'论证时间：{{时间}}，地点/方式：{{地点/线上}}，请在 {{响应截止}} 前确认。' },
  { module:'立项论证', nodeKey:'2-4', nodeLabel:'专家论证与评审',          seq:29,  notifKind:'待办', title:'【催办】请在 {{截止时间}} 前完成「{{项目名称}}」论证评审意见提交',                      body:'您尚未提交评审意见，逾期将影响论证结果，请尽快操作。' },
  { module:'立项论证', nodeKey:'2-5', nodeLabel:'论证意见审核与公示',      seq:32,  notifKind:'待阅', title:'【论证结果】「{{项目名称}}」专家论证意见已可查看',                                    body:'论证结论：{{通过/修改后通过/不通过}}，请登录系统查看详细意见。' },
  { module:'立项论证', nodeKey:'2-6', nodeLabel:'领导小组审定与立项下达',  seq:36,  notifKind:'待阅', title:'【立项通知】「{{项目名称}}」已正式立项，立项通知书已下达',                            body:'采购截止：{{采购截止日期}}，合同截止：{{合同截止日期}}，请及时启动采购流程。' },
  { module:'立项论证', nodeKey:'2-7', nodeLabel:'立项有效期预警',          seq:40,  notifKind:'待办', title:'【紧急预警】「{{项目名称}}」采购截止日还剩 30 天，请尽快启动采购',                      body:'采购截止：{{日期}}，超期立项自动失效。' },
  { module:'招采管理', nodeKey:'3-1', nodeLabel:'采购文件编制 & 技术审核', seq:47,  notifKind:'待办', title:'【待审核】「{{项目名称}}」采购文件待技术审核',                                       body:'请审核技术规范与建设方案一致性、接口标准、安全防护等内容。' },
  { module:'招采管理', nodeKey:'3-2', nodeLabel:'供应商调研校验',          seq:51,  notifKind:'待办', title:'【提交失败】「{{项目名称}}」调研供应商不足 3 家，无法提交',                           body:'当前调研供应商：{{N}} 家，非单一来源采购须至少调研 3 家供应商方可提交。' },
  { module:'招采管理', nodeKey:'3-3', nodeLabel:'合同审核与签订',          seq:52,  notifKind:'待办', title:'【待审核】「{{项目名称}}」合同草稿待审核',                                          body:'合同金额：{{金额}}，请审核关键条款：建设内容、周期、数据治理、付款方式、维保年限。' },
  { module:'招采管理', nodeKey:'3-3', nodeLabel:'合同审核与签订',          seq:58,  notifKind:'待阅', title:'【合同已签订】「{{项目名称}}」合同签订完成，项目正式进入实施阶段',                     body:'合同金额：{{金额}}，建设周期：{{起止日期}}。' },
  { module:'项目实施', nodeKey:'4-1', nodeLabel:'组建工作小组',            seq:61,  notifKind:'待阅', title:'【工作小组成立】「{{项目名称}}」工作小组已成立，您是其中成员',                        body:'您的角色：{{角色}}，项目周期：{{起止日期}}，请关注后续实施安排。' },
  { module:'项目实施', nodeKey:'4-2', nodeLabel:'定期进度汇报',            seq:63,  notifKind:'待办', title:'【催办】「{{项目名称}}」进度汇报逾期未提交，请立即提交',                            body:'已逾期 {{N}} 天，请尽快补交，连续未报将通知单位领导。' },
  { module:'项目实施', nodeKey:'4-3', nodeLabel:'变更申请',                seq:70,  notifKind:'待阅', title:'【变更批准】「{{项目名称}}」变更申请已批准',                                        body:'变更内容：{{摘要}}，生效日期：{{日期}}。' },
  { module:'项目实施', nodeKey:'4-4', nodeLabel:'延期申请',                seq:73,  notifKind:'待办', title:'【延期预警】「{{项目名称}}」距建设截止还剩 30 个工作日，如需延期请立即申请',           body:'延期申请须提前 30 个工作日提交，请尽快评估。' },
  { module:'项目终止', nodeKey:'4-5', nodeLabel:'终止申请',                seq:82,  notifKind:'待阅', title:'【项目终止】「{{项目名称}}」已获批终止',                                            body:'终止通知书已生成，请配合完成善后工作（资金退回/资产清查等）。' },
  { module:'项目验收', nodeKey:'5-2', nodeLabel:'内部初验',                seq:88,  notifKind:'待办', title:'【待初验】「{{项目名称}}」内部初验已开始，请按检查项逐一确认并填写结果',               body:'检查维度：功能、性能、数据、培训、文档，完成后提交初验结论。' },
  { module:'项目验收', nodeKey:'5-3', nodeLabel:'试运行监控',              seq:92,  notifKind:'待办', title:'【待办】「{{项目名称}}」试运行期满，可提交正式验收申请',                            body:'请整理验收材料并提交验收申请。' },
  { module:'项目验收', nodeKey:'5-4', nodeLabel:'信息办组织正式验收',      seq:95,  notifKind:'待办', title:'【验收邀请】邀请您参与「{{项目名称}}」项目验收，请确认出席',                         body:'验收时间：{{时间}}，地点/方式：{{地点/链接}}，请在 {{截止日期}} 前确认。' },
  { module:'项目验收', nodeKey:'5-5', nodeLabel:'验收评审结果',            seq:98,  notifKind:'待阅', title:'【验收通过】「{{项目名称}}」正式验收通过！请完成文档归档与资产移交',                  body:'验收日期：{{日期}}，请在 {{截止日期}} 前完成资产移交和文档归档。' },
  { module:'项目验收', nodeKey:'5-6', nodeLabel:'资产移交与归档',          seq:107, notifKind:'待办', title:'【待确认】「{{项目名称}}」资产移交清单待确认',                                      body:'请核对移交资产清单并签字确认。' },
  { module:'运维管理', nodeKey:'6-1', nodeLabel:'运维团队组建',            seq:110, notifKind:'待阅', title:'【运维接管】「{{项目名称}}」已移交运维，您是运维团队成员',                           body:'维保起始：{{日期}}，维保截止：{{日期}}，请熟悉运维规范。' },
  { module:'运维管理', nodeKey:'6-2', nodeLabel:'定期巡检',                seq:115, notifKind:'待办', title:'【巡检异常待处理】「{{项目名称}}」巡检发现异常，已创建故障工单，请及时处理',           body:'工单号：{{工单号}}，异常项：{{摘要}}。' },
  { module:'运维管理', nodeKey:'6-3', nodeLabel:'故障上报',                seq:116, notifKind:'待办', title:'【重大故障】「{{项目名称}}」发生重大故障，请立即处理',                               body:'故障描述：{{描述}}，发现时间：{{时间}}，影响范围：{{范围}}，请2小时内提交处置方案。' },
  { module:'运维管理', nodeKey:'6-4', nodeLabel:'合同到期提醒',            seq:117, notifKind:'待阅', title:'【合同到期】「{{项目名称}}」维保合同将于 {{日期}} 到期，请及时处理续签',               body:'合同号：{{contractId}}，到期日：{{expireDate}}，请提前评估是否续签或重新采购。' },
];

window._toggleImportCard = function() {
  var b = document.getElementById('notif-import-body');
  var i = document.getElementById('notif-import-ico');
  var l = document.getElementById('notif-import-lbl');
  var open = b && b.style.display !== 'none';
  if (b) b.style.display = open ? 'none' : 'block';
  if (i) i.textContent = open ? '▶' : '▼';
  if (l) l.textContent = open ? '展开' : '收起';
  if (!open) window._filterImport();
};

window._updateImportNodes = function() {
  var mod = (document.getElementById('notif-im-mod') || {}).value || '';
  var nd = document.getElementById('notif-im-node');
  if (!nd) return;
  var seen = {};
  var opts = '<option value="">全部节点</option>';
  _notifImportTmplData.forEach(function(t) {
    if ((!mod || t.module === mod) && !seen[t.nodeLabel]) {
      seen[t.nodeLabel] = 1;
      opts += '<option>' + t.nodeLabel + '</option>';
    }
  });
  nd.innerHTML = opts;
  window._filterImport();
};

window._filterImport = function() {
  var mod  = (document.getElementById('notif-im-mod')  || {}).value || '';
  var node = (document.getElementById('notif-im-node') || {}).value || '';
  var filtered = _notifImportTmplData.filter(function(t) {
    if (mod  && t.module    !== mod)  return false;
    if (node && t.nodeLabel !== node) return false;
    return true;
  });
  var el = document.getElementById('notif-im-result');
  if (!el) return;
  if (!filtered.length) {
    el.innerHTML = '<div style="text-align:center;padding:16px;color:var(--text-secondary)">暂无匹配模板</div>';
    return;
  }
  var html = '<div class="table-wrap"><table class="data-table"><thead><tr>' +
    '<th style="width:160px">节点</th><th style="width:50px">类型</th><th>通知标题</th><th style="width:55px">操作</th>' +
    '</tr></thead><tbody>';
  var shown = filtered.length > 8 ? filtered.slice(0, 8) : filtered;
  shown.forEach(function(t) {
    var kc  = t.notifKind === '待办' ? 'orange' : 'blue';
    var kt  = '<span class="tag tag-' + kc + '" style="font-size:11px">' + t.notifKind + '</span>';
    var nc  = '<span style="font-size:11px;color:var(--text-muted)">' + t.nodeKey + '</span> ' + t.nodeLabel;
    var btn = '<button class="btn btn-sm btn-primary" onclick="_doImport(' + t.seq + ')" style="font-size:11px;padding:2px 8px">导入</button>';
    html += '<tr><td style="font-size:12px">' + nc + '</td><td>' + kt + '</td><td style="font-size:12px">' + t.title + '</td><td>' + btn + '</td></tr>';
  });
  html += '</tbody></table></div>';
  if (filtered.length > 8) {
    html += '<div style="text-align:center;font-size:12px;color:var(--text-secondary);padding:4px 0">显示前 8 条，共 ' + filtered.length + ' 条，请缩小筛选范围</div>';
  }
  el.innerHTML = html;
};

window._resetImport = function() {
  var m = document.getElementById('notif-im-mod');
  var n = document.getElementById('notif-im-node');
  if (m) m.value = '';
  if (n) n.innerHTML = '<option value="">全部节点</option>';
  var el = document.getElementById('notif-im-result');
  if (el) el.innerHTML = '<div style="text-align:center;padding:8px;font-size:12px;color:var(--text-secondary)">请选择模块和节点后查询</div>';
};

window._doImport = function(seq) {
  var t = _notifImportTmplData.find(function(x) { return x.seq === seq; });
  if (!t) return;
  var te = document.getElementById('notif-title');
  var ce = document.getElementById('notif-content');
  if (te) te.value = t.title;
  if (ce) ce.value = t.body || '';
  toast('已导入模板：' + t.title.slice(0, 20) + (t.title.length > 20 ? '…' : ''), 'success');
  var fc = document.getElementById('notif-form-card');
  if (fc) fc.scrollIntoView({ behavior: 'smooth' });
};


/* ============================================================
   HELPERS (local, module-scoped via IIFE closure at bottom)
   ============================================================ */

/* channel icon helper */
function _channelIcon(c) {
  return { system: '<span class="channel-badge">站内</span>', dingtalk: '<span class="channel-badge">APP</span>', sms: '<span class="channel-badge">APP</span>', email: '<span class="channel-badge">邮件</span>' }[c] || '<span class="channel-badge">邮件</span>';
}
function _channelLabel(c) {
  return { system: '系统消息', dingtalk: '钉钉', sms: '短信', email: '邮件' }[c] || c;
}
function _channelBadges(channels) {
  return (channels || []).map(c =>
    '<span title="' + _channelLabel(c) + '" style="margin-right:4px">' + _channelIcon(c) + '</span>'
  ).join('');
}

/* build type → name map from DATA */
function _typeNameMap() {
  const m = {};
  (DATA.notificationTypes || []).forEach(t => { m[t.key] = t.name; });
  return m;
}

/* delivery status tag */
function _deliveryTag(status) {
  if (status === 'delivered') return '<span class="tag tag-green">已送达</span>';
  if (status === 'failed')    return '<span class="tag tag-red">未送达</span>';
  return '<span class="tag tag-gray">发送中</span>';
}

/* mini read-rate progress bar (inline) */
function _readRateBar(readCount, total) {
  const pct = total > 0 ? Math.round(readCount / total * 100) : 0;
  return '<span style="white-space:nowrap">' + readCount + '/' + total +
    '&nbsp;<span style="display:inline-block;vertical-align:middle;width:48px;height:6px;background:#f0f0f0;border-radius:3px;overflow:hidden">' +
    '<span style="display:block;height:100%;width:' + pct + '%;background:var(--primary);border-radius:3px"></span></span>' +
    '&nbsp;<span style="font-size:11px;color:var(--text-secondary)">' + pct + '%</span></span>';
}

/* overall delivery status for list column */
function _overallDeliveryTag(n) {
  const vals = Object.values(n.deliveryStatus || {});
  if (!vals.length) return '<span class="tag tag-gray">未知</span>';
  if (vals.every(v => v === 'delivered')) return '<span class="tag tag-green">已发送</span>';
  if (vals.some(v => v === 'failed'))     return '<span class="tag tag-orange">部分失败</span>';
  return '<span class="tag tag-gray">发送中</span>';
}

/* ============================================================
   VIEW 1: notification-list  通知列表
   ============================================================ */
registerView('notification-list', function() {
  const role = getCurrentRole();
  const canCreate = role === 'info-admin' || role === 'info-leader';
  const typeNameMap = _typeNameMap();

  /* sort by sendTime desc */
  const sorted = (DATA.notifications || []).slice().sort((a, b) =>
    (b.sendTime || '').localeCompare(a.sendTime || '')
  );

  /* build type options from DATA.notificationTypes */
  const typeOptions = (DATA.notificationTypes || []).map(t =>
    '<option value="' + t.key + '">' + t.name + '</option>'
  ).join('');

  /* table rows */
  const rows = sorted.map(n => {
    const isDraft   = n.status === 'draft';
    const readCount = Object.values(n.readStatus || {}).filter(Boolean).length;
    const total     = Object.keys(n.readStatus || {}).length;
    const typeName  = typeNameMap[n.type] || n.type;
    const sendTimeCell = isDraft ? '<span class="tag tag-gray">草稿</span>' : (n.sendTime || '—');
    const readRateCell = isDraft ? '<span style="color:var(--text-secondary)">—</span>' : _readRateBar(readCount, total);
    const deliveryCell = isDraft ? '<span style="color:var(--text-secondary)">—</span>' : _overallDeliveryTag(n);
    const titleCell    = isDraft
      ? '<span style="color:var(--text-secondary)">' + n.title + '</span>'
      : '<a onclick="navigate(\'notification-detail\',{id:\'' + n.id + '\'})" style="color:var(--primary);cursor:pointer">' + n.title + '</a>';
    const opBtn = isDraft && canCreate
      ? '<button class="btn btn-sm btn-primary" style="font-size:11px" onclick="navigate(\'notification-create\',{id:\'' + n.id + '\'})">编辑草稿</button>'
      : '<button class="btn btn-sm" onclick="navigate(\'notification-detail\',{id:\'' + n.id + '\'})">查看详情</button>';
    return '<tr>' +
      '<td>' + notifLevelTag(n.level) + '</td>' +
      '<td>' + titleCell + '</td>' +
      '<td><span class="tag tag-blue" style="font-size:11px">' + typeName + '</span></td>' +
      '<td>' + _channelBadges(n.channel) + '</td>' +
      '<td>' + (n.sender || '—') + '</td>' +
      '<td>' + sendTimeCell + '</td>' +
      '<td>' + readRateCell + '</td>' +
      '<td>' + deliveryCell + '</td>' +
      '<td>' + opBtn + '</td>' +
    '</tr>';
  }).join('');

  return '' +
    breadcrumb('通知管理', '通知列表') +
    '<div class="page-header">' +
      '<div class="page-title">通知列表</div>' +
      (canCreate ? '<button class="btn btn-primary" onclick="navigate(\'notification-create\')">+ 发送通知</button>' : '') +
    '</div>' +
    /* filter bar */
    '<div class="card" style="margin-bottom:12px;padding:14px 16px">' +
      '<div class="search-bar" style="flex-wrap:wrap;gap:8px" id="notif-filter-bar">' +
        '<input class="form-control" id="nf-keyword" placeholder="搜索通知标题..." style="width:200px">' +
        '<select class="form-control" id="nf-type" style="width:170px">' +
          '<option value="">全部类型</option>' +
          typeOptions +
        '</select>' +
        '<select class="form-control" id="nf-level" style="width:110px">' +
          '<option value="">全部级别</option>' +
          '<option value="urgent">紧急</option>' +
          '<option value="warning">提醒</option>' +
          '<option value="info">通知</option>' +
        '</select>' +
        '<select class="form-control" id="nf-status" style="width:120px">' +
          '<option value="">全部状态</option>' +
          '<option value="sent">已发送</option>' +
          '<option value="partial">部分失败</option>' +
          '<option value="draft">草稿</option>' +
        '</select>' +
        '<button class="btn btn-primary btn-sm" onclick="_notifListFilter()">查询</button>' +
        '<button class="btn btn-sm" onclick="_notifListReset()">重置</button>' +
      '</div>' +
    '</div>' +
    /* table */
    '<div class="table-wrap">' +
      '<table class="data-table" id="notif-list-table">' +
        '<thead><tr>' +
          '<th style="width:70px">通知级别</th>' +
          '<th>通知标题</th>' +
          '<th style="width:150px">通知类型</th>' +
          '<th style="width:90px">发送渠道</th>' +
          '<th style="width:90px">发送人</th>' +
          '<th class="sortable" style="width:150px">发送时间<span class="sort-icon">↑↓</span></th>' +
          '<th style="width:130px">已读率</th>' +
          '<th style="width:90px">发送状态</th>' +
          '<th style="width:80px">操作</th>' +
        '</tr></thead>' +
        '<tbody id="notif-list-body">' + (rows || '<tr><td colspan="9" style="text-align:center;padding:32px;color:var(--text-secondary)">暂无数据</td></tr>') + '</tbody>' +
      '</table>' +
      '<div class="table-pagination">' +
        '<span id="notif-list-count">共 ' + sorted.length + ' 条记录</span>' +
        '<span>第 1/1 页 &nbsp; &lt; 1 &gt;</span>' +
      '</div>' +
    '</div>' +
    /* client-side filter script */
    '<script>' +
    '(function() {' +
    '  var _allRows = ' + JSON.stringify(sorted.map(n => ({
        id: n.id, title: n.title, type: n.type, level: n.level,
        delivery: n.status === 'draft' ? 'draft' : (Object.values(n.deliveryStatus || {}).every(v => v === 'delivered') ? 'sent' : 'partial')
      }))) + ';' +
    '  window._notifListFilter = function() {' +
    '    var kw = (document.getElementById("nf-keyword")||{}).value || "";' +
    '    var tp = (document.getElementById("nf-type")||{}).value || "";' +
    '    var lv = (document.getElementById("nf-level")||{}).value || "";' +
    '    var st = (document.getElementById("nf-status")||{}).value || "";' +
    '    var matched = _allRows.filter(function(r) {' +
    '      if (kw && r.title.indexOf(kw) === -1) return false;' +
    '      if (tp && r.type !== tp) return false;' +
    '      if (lv && r.level !== lv) return false;' +
    '      if (st && r.delivery !== st) return false;' +
    '      return true;' +
    '    });' +
    '    var tbody = document.getElementById("notif-list-body");' +
    '    var countEl = document.getElementById("notif-list-count");' +
    '    if (!tbody) return;' +
    '    if (!matched.length) {' +
    '      tbody.innerHTML = \'<tr><td colspan="9" style="text-align:center;padding:32px;color:var(--text-secondary)">暂无符合条件的通知</td></tr>\';' +
    '    } else {' +
    '      var ids = matched.map(function(r){return r.id;});' +
    '      var allTrs = tbody.querySelectorAll("tr[data-id]");' +
    '      allTrs.forEach(function(tr){ tr.style.display = ids.indexOf(tr.dataset.id) !== -1 ? "" : "none"; });' +
    '    }' +
    '    if (countEl) countEl.textContent = "共 " + matched.length + " 条记录";' +
    '  };' +
    '  window._notifListReset = function() {' +
    '    ["nf-keyword","nf-type","nf-level","nf-status"].forEach(function(id){ var el=document.getElementById(id); if(el)el.value=""; });' +
    '    _notifListFilter();' +
    '  };' +
    '  /* add data-id to rows for filter */' +
    '  (function addIds() {' +
    '    var tbody = document.getElementById("notif-list-body");' +
    '    if (!tbody) return;' +
    '    var rows = tbody.querySelectorAll("tr");' +
    '    var ids = _allRows.map(function(r){return r.id;});' +
    '    rows.forEach(function(tr, i){ if(ids[i]) tr.dataset.id = ids[i]; });' +
    '  })();' +
    '})();' +
    '<\/script>';
});


/* ============================================================
   VIEW 2: notification-create  新建通知
   ============================================================ */
registerView('notification-create', function(params) {
  params = params || {};
  const role = getCurrentRole();

  /* draft edit mode */
  const _draftNotif = params.id
    ? (DATA.notifications || []).find(n => n.id === params.id && n.status === 'draft') || null
    : null;
  const _isEdit = !!_draftNotif;

  /* flat type list for typeKey prefill (from template library navigation) */
  const allTypes = [
    { key: 'collection-notice',    level: 'info',    title: '{{year}}年度信息化项目需求征集通知', content: '各单位：\n\n根据学校信息化建设工作安排，现启动{{year}}年度信息化项目需求征集工作，请各单位于{{deadline}}前登录系统提交项目需求申请，逾期将不予受理。\n\n请各单位负责人认真组织，填报内容务必真实、准确。\n\n信息化管理办公室\n{{date}}' },
    { key: 'collection-returned',  level: 'warning', title: '征集方案退回通知', content: '您好：\n\n您提交的{{year}}年度征集方案存在以下问题需要修改：\n\n【退回原因】{{reason}}\n\n请于3个工作日内登录系统修改并重新提交。如有疑问请联系信息办。\n\n信息化管理办公室\n{{date}}' },
    { key: 'demand-returned',      level: 'warning', title: '需求申请退回通知 — {{project}}', content: '您好：\n\n您提交的「{{project}}」需求申请未能通过初审，已退回，具体原因如下：\n\n【退回原因】{{reason}}\n\n请登录系统查看退回意见并修改后重新提交。\n\n信息化管理办公室\n{{date}}' },
    { key: 'approval-invite',      level: 'info',    title: '立项申报通知书 — {{project}}', content: '您好，{{user}}：\n\n您申报的「{{project}}」项目需求已通过遴选，请于{{deadline}}前登录系统完整填写《信息化项目建设申报书》，并上传相关附件。\n\n逾期未提交将影响本年度立项进程，请予以重视。\n\n信息化管理办公室\n{{date}}' },
    { key: 'proposal-return',      level: 'warning', title: '申报书退回通知 — {{project}}', content: '您好：\n\n您提交的「{{project}}」建设申报书已被退回，请查看退回意见并修改后重新提交。\n\n【退回原因】{{reason}}\n\n信息化管理办公室\n{{date}}' },
    { key: 'expert-invite',        level: 'info',    title: '专家评审邀请 — {{project}}立项论证', content: '尊敬的{{expert}}专家：\n\n诚邀您参加「{{project}}」立项论证评审会议。\n\n会议时间：{{meetingTime}}\n会议地点：{{meetingPlace}}\n\n请于收到本通知48小时内在系统中确认是否参会。如不能参会，请说明原因，以便我们及时调整安排。\n\n信息化管理办公室\n{{date}}' },
    { key: 'review-result',        level: 'info',    title: '评审结果通知 — {{project}}', content: '您好：\n\n「{{project}}」立项论证评审已完成，评审结论如下：\n\n【评审结论】{{conclusion}}\n\n如有疑问请联系信息办。\n\n信息化管理办公室\n{{date}}' },
    { key: 'frozen-notice',        level: 'urgent',  title: '项目冻结通知 — {{project}}', content: '您好：\n\n「{{project}}」因{{reason}}，已依规冻结，冻结期至{{frozenUntil}}。\n\n冻结期间不得开展任何采购及建设活动。如需解冻，请向信息办提出申请。\n\n信息化管理办公室\n{{date}}' },
    { key: 'approval-notice',      level: 'info',    title: '立项通知书 — {{project}}', content: '您好：\n\n「{{project}}」项目已正式获批立项，具体信息如下：\n\n项目编号：{{projectId}}\n批复金额：{{budget}}万元\n计划周期：{{planStart}} 至 {{planEnd}}\n\n请严格按照批复方案推进实施，尽快启动采购程序。如有变更需求，须提前申报。\n\n信息化管理办公室\n{{date}}' },
    { key: 'approval-result-reject', level: 'warning', title: '立项不通过通知 — {{project}}', content: '您好：\n\n「{{project}}」未能通过本次立项审定，具体原因如下：\n\n【未通过原因】{{reason}}\n\n您可在整改完善后，于下一年度重新申报。如有疑问，请联系信息办。\n\n信息化管理办公室\n{{date}}' },
    { key: 'change-result',        level: 'info',    title: '审批结果通知 — {{project}}变更申请', content: '您好：\n\n您提交的「{{project}}」变更申请已完成审批，结果如下：\n\n【审批结论】{{conclusion}}\n\n请按批复结果推进后续工作。\n\n信息化管理办公室\n{{date}}' },
    { key: 'overdue-warning',      level: 'urgent',  title: '汇报逾期预警 — {{project}}', content: '您好：\n\n系统检测到「{{project}}」已超过规定汇报周期（每半月）未提交进展报告，请于24小时内登录系统提交。\n\n如持续逾期，将影响项目正常推进并计入考核。\n\n信息化管理办公室\n{{date}}' },
    { key: 'acceptance-invite',    level: 'info',    title: '验收评审邀请 — {{project}}', content: '尊敬的{{expert}}专家：\n\n诚邀您参加「{{project}}」正式验收评审会议。\n\n会议时间：{{meetingTime}}\n会议地点：{{meetingPlace}}\n\n请于收到本通知48小时内在系统中确认是否参会。\n\n信息化管理办公室\n{{date}}' },
    { key: 'acceptance-result',    level: 'info',    title: '验收结果通知 — {{project}}', content: '您好：\n\n「{{project}}」验收评审已完成，评审结论如下：\n\n【验收结论】{{conclusion}}\n\n请按验收结论推进后续工作（如尾款支付、运维移交等）。\n\n信息化管理办公室\n{{date}}' },
    { key: 'major-fault',          level: 'urgent',  title: '重大故障上报 — {{project}}', content: '【紧急通知】\n\n「{{project}}」系统发生重大故障，概况如下：\n\n故障描述：{{faultDesc}}\n发现时间：{{faultTime}}\n影响范围：{{faultScope}}\n\n请相关负责人立即处理，并在2小时内提交应急处置方案。\n\n信息化管理办公室\n{{date}}' },
    { key: 'contract-expiry',      level: 'warning', title: '合同到期提醒 — {{project}}', content: '您好：\n\n「{{project}}」相关合同（合同号：{{contractId}}）将于{{expireDate}}到期，届时服务/维保即告终止。\n\n请提前评估是否续签或重新采购，以避免服务中断。\n\n信息化管理办公室\n{{date}}' },
  ];

  /* today */
  const todayStr = new Date().toISOString().slice(0,10);
  const yearStr  = new Date().getFullYear();

  /* project options */
  const projectOptions = (DATA.projects || []).map(p =>
    '<option value="' + p.id + '">' + p.name + '</option>'
  ).join('');

  /* role checkboxes */
  const roleCheckboxes = (DATA.roles || []).map(r =>
    '<label style="display:flex;align-items:center;gap:5px;cursor:pointer;min-width:140px">' +
    '<input type="checkbox" class="notif-role-cb" value="' + r.id + '"> ' + r.name + '</label>'
  ).join('');

  /* unit checkboxes */
  const unitCheckboxes = ['教务处','招生处','学生工作处','科研处','党政办公室','图书馆','财务处'].map(u =>
    '<label style="display:flex;align-items:center;gap:5px;cursor:pointer;min-width:120px">' +
    '<input type="checkbox" class="notif-unit-cb" value="' + u + '"> ' + u + '</label>'
  ).join('');

  const defaultTitle   = _isEdit && _draftNotif ? _draftNotif.title   || '' : '';
  const defaultContent = _isEdit && _draftNotif ? _draftNotif.content || '' : '';

  const _pageTitle = _isEdit ? '编辑草稿通知' : '新建通知';

  return '' +
    breadcrumb('通知管理', _pageTitle) +
    '<div class="page-header">' +
      '<div class="page-title">' + _pageTitle + '</div>' +
      '<button class="btn" onclick="navigate(\'notification-list\')">← 返回列表</button>' +
    '</div>' +

    /* CARD A: 从模板导入（默认折叠） */
    '<div class="card" style="padding:0;margin-bottom:0" id="notif-import-card">' +
      '<div id="notif-import-hdr" onclick="_toggleImportCard()" style="display:flex;align-items:center;justify-content:space-between;padding:14px 16px;cursor:pointer;user-select:none">' +
        '<div style="font-weight:600;font-size:14px">从模板导入</div>' +
        '<div style="font-size:12px;color:var(--text-secondary);display:flex;align-items:center;gap:4px"><span id="notif-import-ico">▶</span><span id="notif-import-lbl">展开</span></div>' +
      '</div>' +
      '<div id="notif-import-body" style="display:none;border-top:1px solid #f0f0f0;padding:14px 16px">' +
        '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px">' +
          '<select class="form-control" id="notif-im-mod" onchange="_updateImportNodes()" style="width:140px">' +
            '<option value="">全部模块</option>' +
            '<option>需求征集</option><option>立项论证</option><option>招采管理</option>' +
            '<option>项目实施</option><option>项目终止</option><option>项目验收</option><option>运维管理</option>' +
          '</select>' +
          '<select class="form-control" id="notif-im-node" style="width:220px"><option value="">全部节点</option></select>' +
          '<button class="btn btn-sm btn-primary" onclick="_filterImport()">查询</button>' +
          '<button class="btn btn-sm" onclick="_resetImport()">重置</button>' +
        '</div>' +
        '<div id="notif-im-result" style="font-size:12px;color:var(--text-secondary);text-align:center;padding:8px">请选择模块和节点后查询</div>' +
      '</div>' +
    '</div>' +

    /* FORM CARD */
    '<div class="card" id="notif-form-card" style="margin-top:0">' +
      '<div class="card-title" style="margin-bottom:16px">通知内容</div>' +
      '<div class="form-grid">' +

        /* title */
        '<div class="form-item" style="grid-column:1/-1">' +
          '<label class="form-label required">通知标题</label>' +
          '<input class="form-control" id="notif-title" value="' + defaultTitle + '" placeholder="请输入通知标题（必填）">' +
        '</div>' +

        /* content */
        '<div class="form-item" style="grid-column:1/-1">' +
          '<label class="form-label required">通知正文</label>' +
          '<textarea class="form-control" id="notif-content" rows="7" placeholder="请输入通知正文（必填）">' + defaultContent + '</textarea>' +
        '</div>' +

        /* level */
        '<div class="form-item">' +
          '<label class="form-label required">通知级别</label>' +
          '<select class="form-control" id="notif-level">' +
            '<option value="urgent">紧急</option>' +
            '<option value="warning">提醒</option>' +
            '<option value="info" selected>通知</option>' +
          '</select>' +
        '</div>' +

        /* associated project */
        '<div class="form-item">' +
          '<label class="form-label">关联项目（选填）</label>' +
          '<select class="form-control" id="notif-project">' +
            '<option value="">— 不关联项目 —</option>' +
            projectOptions +
          '</select>' +
        '</div>' +

        /* contact name */
        '<div class="form-item">' +
          '<label class="form-label">通知联系人（选填）</label>' +
          '<input class="form-control" id="notif-contact-name" placeholder="如：张建国" value="' + (_isEdit && _draftNotif.contactName ? _draftNotif.contactName : '') + '">' +
        '</div>' +

        /* contact info */
        '<div class="form-item">' +
          '<label class="form-label">联系方式（选填）</label>' +
          '<input class="form-control" id="notif-contact-info" placeholder="如：023-68251234 / zjg@swu.edu.cn" value="' + (_isEdit && _draftNotif.contactInfo ? _draftNotif.contactInfo : '') + '">' +
        '</div>' +

        /* recipients */
        '<div class="form-item" style="grid-column:1/-1">' +
          '<label class="form-label required">发送对象</label>' +
          '<div style="border:1px solid #d9d9d9;border-radius:6px;padding:14px;background:#fafafa">' +
            '<div style="display:flex;gap:24px;margin-bottom:12px">' +
              '<label style="display:flex;align-items:center;gap:5px;cursor:pointer"><input type="radio" name="notif-rcpt-mode" value="role" checked onchange="_updateRcptMode()"> 按角色</label>' +
              '<label style="display:flex;align-items:center;gap:5px;cursor:pointer"><input type="radio" name="notif-rcpt-mode" value="unit" onchange="_updateRcptMode()"> 按单位</label>' +
              '<label style="display:flex;align-items:center;gap:5px;cursor:pointer"><input type="radio" name="notif-rcpt-mode" value="person" onchange="_updateRcptMode()"> 按人员</label>' +
            '</div>' +
            /* role mode */
            '<div id="rcpt-mode-role" style="display:flex;flex-wrap:wrap;gap:8px">' +
              roleCheckboxes +
            '</div>' +
            /* unit mode */
            '<div id="rcpt-mode-unit" style="display:none;flex-wrap:wrap;gap:8px">' +
              unitCheckboxes +
            '</div>' +
            /* person mode */
            '<div id="rcpt-mode-person" style="display:none">' +
              '<input class="form-control" id="rcpt-person-input" placeholder="搜索人员姓名，多人用逗号分隔" style="max-width:400px">' +
            '</div>' +
          '</div>' +
        '</div>' +

        /* channels */
        '<div class="form-item" style="grid-column:1/-1">' +
          '<label class="form-label required">发送渠道</label>' +
          '<div style="display:flex;gap:20px;flex-wrap:wrap;padding-top:4px">' +
            '<label style="display:flex;align-items:center;gap:6px;cursor:pointer"><input type="checkbox" id="ch-system" checked> <span class="channel-badge">站内</span> 系统消息</label>' +
            '<label style="display:flex;align-items:center;gap:6px;cursor:pointer"><input type="checkbox" id="ch-dingtalk"> <span class="channel-badge">APP</span> 钉钉</label>' +
            '<label style="display:flex;align-items:center;gap:6px;cursor:pointer"><input type="checkbox" id="ch-sms"> <span class="channel-badge">APP</span> 短信</label>' +
            '<label style="display:flex;align-items:center;gap:6px;cursor:pointer"><input type="checkbox" id="ch-email"> <span class="channel-badge">邮件</span> 邮件</label>' +
          '</div>' +
        '</div>' +

        /* schedule */
        '<div class="form-item" style="grid-column:1/-1">' +
          '<label class="form-label">发送时间</label>' +
          '<div style="display:flex;gap:20px;flex-wrap:wrap;align-items:center;padding-top:4px">' +
            '<label style="display:flex;align-items:center;gap:6px;cursor:pointer"><input type="radio" name="notif-send-time" value="now" checked onchange="_toggleScheduleInput()"> 立即发送</label>' +
            '<label style="display:flex;align-items:center;gap:6px;cursor:pointer"><input type="radio" name="notif-send-time" value="schedule" onchange="_toggleScheduleInput()"> 定时发送</label>' +
            '<input type="datetime-local" class="form-control" id="notif-schedule-dt" style="width:200px;display:none" min="' + todayStr + 'T00:00">' +
          '</div>' +
        '</div>' +

      '</div>' +

      /* action buttons */
      '<div style="display:flex;gap:10px;margin-top:8px;padding-top:16px;border-top:1px solid #f0f0f0">' +
        '<button class="btn btn-primary" onclick="_sendNotification()">发送</button>' +
        '<button class="btn btn-default" onclick="_previewNotification()">预览</button>' +
        '<button class="btn" onclick="_saveDraftNotification()">保存草稿</button>' +
        '<button class="btn" onclick="navigate(\'notification-list\')" style="margin-left:auto">取消</button>' +
      '</div>' +
    '</div>' +

    /* inline script */
    '<script>' +
    '(function(){' +

    /* all type data */
    '  var _allTypes = ' + JSON.stringify(allTypes) + ';' +
    '  var _typeMap = {};' +
    '  _allTypes.forEach(function(t){ _typeMap[t.key]=t; });' +
    '  var _year = ' + yearStr + ';' +
    '  var _today = "' + todayStr + '";' +

    /* recipient mode toggle */
    '  window._updateRcptMode = function() {' +
    '    var val = document.querySelector("input[name=notif-rcpt-mode]:checked");' +
    '    val = val ? val.value : "role";' +
    '    ["role","unit","person"].forEach(function(m) {' +
    '      var el = document.getElementById("rcpt-mode-"+m);' +
    '      if (el) el.style.display = m===val ? (m==="person" ? "block" : "flex") : "none";' +
    '    });' +
    '  };' +

    /* schedule input toggle */
    '  window._toggleScheduleInput = function() {' +
    '    var val = document.querySelector("input[name=notif-send-time]:checked");' +
    '    val = val ? val.value : "now";' +
    '    var dt = document.getElementById("notif-schedule-dt");' +
    '    if (dt) dt.style.display = val==="schedule" ? "inline-block" : "none";' +
    '  };' +

    /* validation helper */
    '  function _validateForm() {' +
    '    var title = (document.getElementById("notif-title")||{}).value||"";' +
    '    var content = (document.getElementById("notif-content")||{}).value||"";' +
    '    if (!title.trim()) { toast("请填写通知标题","warning"); return null; }' +
    '    if (!content.trim()) { toast("请填写通知正文","warning"); return null; }' +
    '    var levelVal = (document.getElementById("notif-level")||{}).value || "info";' +
    '    var chSystem  = document.getElementById("ch-system")  && document.getElementById("ch-system").checked;' +
    '    var chDing    = document.getElementById("ch-dingtalk") && document.getElementById("ch-dingtalk").checked;' +
    '    var chSms     = document.getElementById("ch-sms")     && document.getElementById("ch-sms").checked;' +
    '    var chEmail   = document.getElementById("ch-email")   && document.getElementById("ch-email").checked;' +
    '    if (!chSystem && !chDing && !chSms && !chEmail) { toast("请至少选择一个发送渠道","warning"); return null; }' +
    '    var channels = [];' +
    '    if(chSystem) channels.push("system");' +
    '    if(chDing)   channels.push("dingtalk");' +
    '    if(chSms)    channels.push("sms");' +
    '    if(chEmail)  channels.push("email");' +
    '    return { title:title.trim(), content:content.trim(), level:levelVal, channels:channels };' +
    '  }' +

    /* preview */
    '  window._previewNotification = function() {' +
    '    var d = _validateForm(); if(!d) return;' +
    '    var channelLabels = {system:\'<span class=\\"channel-badge\\">站内</span>系统消息\',dingtalk:\'<span class=\\"channel-badge\\">APP</span>钉钉\',sms:\'<span class=\\"channel-badge\\">APP</span>短信\',email:\'<span class=\\"channel-badge\\">邮件</span>邮件\'};' +
    '    var chStr = d.channels.map(function(c){return channelLabels[c]||c;}).join("　");' +
    '    var body = \'<div style="border:1px solid #f0f0f0;border-radius:8px;padding:20px;background:#fafafa">\'' +
    '      + \'<div style="margin-bottom:12px"><span style="font-size:13px;color:var(--text-secondary)">级别：</span>\' + notifLevelTag(d.level) + \'</div>\'' +
    '      + \'<div style="font-size:17px;font-weight:700;margin-bottom:14px">\' + d.title + \'</div>\'' +
    '      + \'<div style="font-size:14px;line-height:1.9;white-space:pre-wrap;color:#333">\' + d.content + \'</div>\'' +
    '      + \'<div style="margin-top:14px;font-size:12px;color:var(--text-secondary)">发送渠道：\' + chStr + \'</div>\'' +
    '      + \'</div>\';' +
    '    showModal("通知预览", body, \'<button class="btn" onclick="closeModal()">关闭</button><button class="btn btn-primary" onclick="closeModal();_sendNotification()">确认发送</button>\');' +
    '  };' +

    /* send */
    '  window._sendNotification = function() {' +
    '    var d = _validateForm(); if(!d) return;' +
    '    logOperation("通知管理","发送通知","N-NEW",d.title,"渠道:"+d.channels.join(","),null);' +
    '    toast("通知已成功发送","success");' +
    '    navigate("notification-list");' +
    '  };' +

    /* save draft */
    '  window._saveDraftNotification = function() {' +
    '    var title = (document.getElementById("notif-title")||{}).value||"";' +
    '    var content = (document.getElementById("notif-content")||{}).value||"";' +
    '    saveDraft("notification-create",{ title:title, content:content });' +
    '    toast("草稿已保存","success");' +
    '  };' +

    '  var _draftData = ' + JSON.stringify(_draftNotif) + ';' +

    /* apply typeKey prefill when navigated from template library */
    '  (function() {' +
    '    var p = getViewParams("notification-create");' +
    '    /* prefill from typeKey (navigated via template library 使用 button) */' +
    '    var initKey = p && p.typeKey ? p.typeKey : "";' +
    '    if (initKey && _typeMap[initKey]) {' +
    '      var t = _typeMap[initKey];' +
    '      var te = document.getElementById("notif-title");' +
    '      var ce = document.getElementById("notif-content");' +
    '      var le = document.getElementById("notif-level");' +
    '      if (te && !te.value) te.value = t.title.replace(/\\{\\{year\\}\\}/g,_year).replace(/\\{\\{date\\}\\}/g,_today);' +
    '      if (ce && !ce.value) ce.value = t.content.replace(/\\{\\{year\\}\\}/g,_year).replace(/\\{\\{date\\}\\}/g,_today);' +
    '      if (le) le.value = t.level;' +
    '    }' +
    '    /* apply prefill from collection-create */' +
    '    var pf = p && p.prefill ? p.prefill : null;' +
    '    if (pf) {' +
    '      /* prefill title/content/level from type if provided */' +
    '      if (pf.type && _typeMap[pf.type]) {' +
    '        var pt = _typeMap[pf.type];' +
    '        var tle = document.getElementById("notif-title");' +
    '        var cle = document.getElementById("notif-content");' +
    '        var lle = document.getElementById("notif-level");' +
    '        if (tle && !tle.value) tle.value = pt.title.replace(/\\{\\{year\\}\\}/g,_year).replace(/\\{\\{date\\}\\}/g,_today);' +
    '        if (cle && !cle.value) cle.value = pt.content.replace(/\\{\\{year\\}\\}/g,_year).replace(/\\{\\{date\\}\\}/g,_today);' +
    '        if (lle) lle.value = pt.level;' +
    '      }' +
    '      /* pre-fill title (overrides type default if explicitly provided) */' +
    '      var titleEl = document.getElementById("notif-title");' +
    '      if (titleEl && pf.title) titleEl.value = pf.title;' +
    '      /* switch to unit mode and check matching units */' +
    '      if (pf.recipients && pf.recipients.length) {' +
    '        var unitRadio = document.querySelector("input[name=notif-rcpt-mode][value=unit]");' +
    '        if (unitRadio) { unitRadio.checked = true; window._updateRcptMode(); }' +
    '        var unitCbs = document.querySelectorAll("#rcpt-mode-unit input[type=checkbox]");' +
    '        unitCbs.forEach(function(cb) {' +
    '          cb.checked = pf.recipients.indexOf(cb.value) >= 0;' +
    '        });' +
    '      }' +
    '      /* pre-fill contact into person input as hint */' +
    '      if (pf.contact) {' +
    '        var personInput = document.getElementById("rcpt-person-input");' +
    '        if (personInput) personInput.placeholder = "联系人：" + pf.contact;' +
    '      }' +
    '    }' +
    '    /* draft edit prefill (level) */' +
    '    if (_draftData) {' +
    '      var dle = document.getElementById("notif-level");' +
    '      if (dle && _draftData.level) dle.value = _draftData.level;' +
    '    }' +
    '  })();' +

    '})();' +
    '<\/script>';
});


/* ============================================================
   VIEW 3: notification-detail  通知发送详情
   ============================================================ */
registerView('notification-detail', function() {
  const params = getViewParams('notification-detail');
  const nid = (params && params.id) ? params.id
    : (params && typeof params === 'string' && params.includes('id='))
      ? params.split('id=')[1]
      : 'N001';

  const n = (DATA.notifications || []).find(x => x.id === nid) || (DATA.notifications || [])[0];
  if (!n) {
    return breadcrumb('通知管理', '通知详情') +
      '<div class="card"><div style="text-align:center;padding:40px;color:var(--text-secondary)">通知不存在</div></div>';
  }

  const typeNameMap = _typeNameMap();
  const typeName    = typeNameMap[n.type] || n.type;

  /* stats */
  const readEntries     = Object.entries(n.readStatus || {});
  const deliveryEntries = Object.entries(n.deliveryStatus || {});
  const totalSent    = readEntries.length;
  const delivered    = deliveryEntries.filter(([,v]) => v === 'delivered').length;
  const readCount    = readEntries.filter(([,v]) => v).length;
  const readPct      = totalSent > 0 ? Math.round(readCount / totalSent * 100) : 0;

  /* channel badges (larger) */
  const channelBadgesDetailed = (n.channel || []).map(c =>
    '<span style="display:inline-flex;align-items:center;gap:4px;padding:3px 10px;background:#f5f5f5;border-radius:12px;font-size:12px;margin-right:6px">' +
    _channelIcon(c) + '&nbsp;' + _channelLabel(c) + '</span>'
  ).join('');

  /* mock unit/role per recipient */
  const mockUnits  = ['教务处','招生处','学生工作处','科研处','党政办公室','信息办','财务处','合同办'];
  const mockRoles  = ['项目负责人','信息办管理员','信息办领导','单位分管领导','单位系统管理员','专家委员会','合同管理员'];
  function _mockUnit(name, i) { return mockUnits[i % mockUnits.length]; }
  function _mockRole(name, i) { return mockRoles[i % mockRoles.length]; }

  /* mock receive / read times */
  function _mockReceiveTime(sendTime, i) {
    if (!sendTime) return '—';
    const d = new Date(sendTime.replace(' ', 'T'));
    d.setMinutes(d.getMinutes() + 2 + i);
    return d.toISOString().slice(0,16).replace('T',' ');
  }
  function _mockReadTime(sendTime, read, i) {
    if (!read) return '—';
    const d = new Date(sendTime.replace(' ', 'T'));
    d.setMinutes(d.getMinutes() + 15 + i * 7);
    return d.toISOString().slice(0,16).replace('T',' ');
  }

  /* recipient detail rows */
  const recipientRows = readEntries.map(([name, read], i) => {
    const delStatus = (n.deliveryStatus || {})[name] || 'pending';
    const rcvTime   = delStatus === 'delivered' ? _mockReceiveTime(n.sendTime, i) : '—';
    const rdTime    = _mockReadTime(n.sendTime, read, i);
    const channels  = (n.channel || []).map(c => _channelIcon(c)).join(' ');
    return '<tr>' +
      '<td>' + name + '</td>' +
      '<td>' + _mockUnit(name, i) + '</td>' +
      '<td>' + _mockRole(name, i) + '</td>' +
      '<td>' + channels + '</td>' +
      '<td>' + n.sendTime + '</td>' +
      '<td>' + rcvTime + '</td>' +
      '<td>' + rdTime + '</td>' +
      '<td>' + _deliveryTag(delStatus) + '</td>' +
    '</tr>';
  }).join('');

  /* expert reply section — shown for expert-invite and acceptance-invite */
  const isExpertType = n.type === 'expert-invite' || n.type === 'acceptance-invite';
  const expertReplyHtml = isExpertType ? (function() {
    /* use review data if available */
    const rv = (DATA.reviews || []).find(r =>
      (n.type === 'expert-invite' && r.type === 'approval' && r.projectName && n.title.includes(r.projectName.slice(0,6))) ||
      (n.type === 'acceptance-invite' && r.type === 'acceptance')
    );
    const mockExperts = [
      { name:'张国强', org:'西南大学计算机学院', status:'confirmed' },
      { name:'陈志远', org:'重庆大学计算机学院', status:'confirmed' },
      { name:'王小燕', org:'西南大学教务处',     status:'pending'   },
      { name:'赵明华', org:'四川大学信息化办',   status:'pending'   },
      { name:'吴晓峰', org:'西南大学科研处',      status:'declined'  },
    ];
    const inviteMap = (rv && rv.inviteStatus) ? rv.inviteStatus : {};
    const experts = (rv && rv.experts && rv.experts.length)
      ? rv.experts.map(eid => {
          const ex = (DATA.experts || []).find(e => e.id === eid) || {};
          const s = inviteMap[eid] || 'pending';
          return { name: ex.name || eid, org: ex.org || '—', status: s };
        })
      : mockExperts;

    const expertStatusTag = function(s) {
      if (s === 'accepted' || s === 'confirmed') return '<span class="tag tag-green">已确认</span>';
      if (s === 'declined' || s === 'rejected')  return '<span class="tag tag-red">已拒绝</span>';
      return '<span class="tag tag-orange">待回复</span>';
    };

    const eRows = experts.map(e =>
      '<tr><td>' + e.name + '</td><td>' + e.org + '</td><td>' + expertStatusTag(e.status) + '</td></tr>'
    ).join('');

    return '<div class="card" style="margin-top:16px">' +
      '<div class="card-title">专家回执状态</div>' +
      renderTable(
        [{ label:'专家姓名', key:'n' }, { label:'所属单位', key:'o' }, { label:'回复状态', key:'s' }],
        experts.map(e => ({ n: e.name, o: e.org, s: expertStatusTag(e.status) }))
      ) +
    '</div>';
  })() : '';

  return '' +
    breadcrumb('通知管理', '通知详情') +
    '<div class="page-header">' +
      '<div class="page-title">通知发送详情</div>' +
      '<button class="btn" onclick="navigate(\'notification-list\')">← 返回列表</button>' +
    '</div>' +

    /* Basic info card */
    '<div class="card">' +
      '<div class="card-title">基本信息</div>' +
      '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px 24px">' +
        '<div style="grid-column:1/-1">' +
          '<div class="detail-label">通知标题</div>' +
          '<div style="font-size:16px;font-weight:600;color:#1a1a1a">' + n.title + '</div>' +
        '</div>' +
        '<div>' +
          '<div class="detail-label">通知类型</div>' +
          '<span class="tag tag-blue">' + typeName + '</span>' +
        '</div>' +
        '<div>' +
          '<div class="detail-label">通知级别</div>' +
          notifLevelTag(n.level) +
        '</div>' +
        '<div>' +
          '<div class="detail-label">发送人</div>' +
          '<div>' + n.sender + '</div>' +
        '</div>' +
        '<div>' +
          '<div class="detail-label">发送时间</div>' +
          '<div>' + n.sendTime + '</div>' +
        '</div>' +
        '<div style="grid-column:2/-1">' +
          '<div class="detail-label">发送渠道</div>' +
          '<div style="padding-top:2px">' + channelBadgesDetailed + '</div>' +
        '</div>' +
      '</div>' +
    '</div>' +

    /* Read statistics */
    '<div class="card" style="margin-top:16px">' +
      '<div class="card-title">发送统计</div>' +
      '<div style="display:flex;gap:0;margin-bottom:20px">' +
        _statBlock(totalSent, '总发送', 'var(--text-primary)') +
        _statDivider() +
        _statBlock(delivered, '已送达', 'var(--success)') +
        _statDivider() +
        _statBlock(readCount, '已读', 'var(--primary)') +
      '</div>' +
      '<div style="max-width:420px">' +
        '<div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:6px">' +
          '<span style="color:var(--text-secondary)">已读率</span>' +
          '<span style="font-weight:600;color:var(--primary)">' + readPct + '%</span>' +
        '</div>' +
        '<div style="height:10px;background:#f0f0f0;border-radius:5px;overflow:hidden">' +
          '<div style="height:100%;width:' + readPct + '%;background:var(--primary);border-radius:5px;transition:width 0.5s ease"></div>' +
        '</div>' +
        '<div style="display:flex;justify-content:space-between;font-size:11px;color:var(--text-secondary);margin-top:4px">' +
          '<span>0%</span><span>100%</span>' +
        '</div>' +
      '</div>' +
    '</div>' +

    /* Notification content */
    '<div class="card" style="margin-top:16px">' +
      '<div class="card-title">通知正文</div>' +
      '<div style="background:#fafafa;border:1px solid #f0f0f0;border-radius:6px;padding:18px 20px;font-size:14px;line-height:1.9;white-space:pre-wrap;color:#333;font-family:inherit">' + n.content + '</div>' +
    '</div>' +

    /* Recipient detail table */
    '<div class="card" style="margin-top:16px">' +
      '<div class="card-title">收件人明细</div>' +
      '<table class="data-table">' +
        '<thead><tr>' +
          '<th>收件人姓名</th><th>所属单位</th><th>角色</th><th>发送渠道</th>' +
          '<th>发送时间</th><th>接收时间</th><th>已读时间</th><th>接收状态</th>' +
        '</tr></thead>' +
        '<tbody>' + (recipientRows || '<tr><td colspan="8" style="text-align:center;padding:24px;color:var(--text-secondary)">暂无数据</td></tr>') + '</tbody>' +
      '</table>' +
    '</div>' +

    /* Expert reply (conditional) */
    expertReplyHtml +

    /* Bottom action bar */
    '<div style="display:flex;gap:10px;padding:16px 0 8px;margin-top:4px">' +
      '<button class="btn btn-warning" onclick="toast(\'已重新发送给未送达收件人\',\'success\')">重发给未送达</button>' +
      '<button class="btn btn-default" onclick="toast(\'已重新发送给未读收件人\',\'success\')">重发给未读</button>' +
      '<button class="btn" onclick="toast(\'发送记录导出中，请稍候…\',\'info\')">导出发送记录</button>' +
    '</div>';
});

/* stat block helper */
function _statBlock(value, label, color) {
  return '<div style="flex:1;text-align:center;padding:16px 8px">' +
    '<div style="font-size:32px;font-weight:700;color:' + color + ';line-height:1.2">' + value + '</div>' +
    '<div style="font-size:13px;color:var(--text-secondary);margin-top:4px">' + label + '</div>' +
  '</div>';
}
function _statDivider() {
  return '<div style="width:1px;background:#f0f0f0;margin:12px 0"></div>';
}


/* ============================================================
   VIEW 4: notification-template  通知模板库
   ============================================================ */
registerView('notification-template', function() {

  /* ---- 全量模板数据（来源：通知矩阵.md） ---- */
  const _tmplData = [
    /* 模块一：需求征集 */
    { module:'需求征集', moduleIndex:1, nodeKey:'1-1', nodeLabel:'信息办发布征集通知',
      seq:1, notifKind:'待阅', level:'普通', channels:['system','email'],
      recipients:'UnitHandler、UnitLeader',
      title:'【征集通知】{{批次名称}} 信息化项目需求征集开始',
      body:'征集时间：{{开始日期}} 至 {{截止日期}}，请登录系统填报需求申请表。',
      typeKey:'collection-notice' },
    { module:'需求征集', moduleIndex:1, nodeKey:'1-2', nodeLabel:'指派项目负责人',
      seq:3, notifKind:'待办', level:'重要', channels:['system','dingding'],
      recipients:'UnitHandler（被指派）',
      title:'【待办】您被指派为「{{项目名称}}」项目负责人，请填报需求申请表',
      body:'截止日期：{{征集截止日期}}，请尽快完成需求填报并提交单位负责人审核。',
      typeKey:'' },
    { module:'需求征集', moduleIndex:1, nodeKey:'1-3', nodeLabel:'需求申请表提交单位审批',
      seq:4, notifKind:'待办', level:'重要', channels:['system','dingding'],
      recipients:'UnitLeader',
      title:'【待审批】「{{项目名称}}」需求申请表待您审批',
      body:'申报人：{{经办人姓名}}，预估预算：{{预算金额}}，请审核后决定是否通过。',
      typeKey:'' },
    { module:'需求征集', moduleIndex:1, nodeKey:'1-3', nodeLabel:'需求申请表提交单位审批',
      seq:6, notifKind:'待办', level:'重要', channels:['system','email'],
      recipients:'UnitHandler',
      title:'【已驳回】「{{项目名称}}」需求申请被驳回，请修改后重新提交',
      body:'驳回原因：{{驳回原因}}，请修改后重新提交。',
      typeKey:'demand-returned' },
    { module:'需求征集', moduleIndex:1, nodeKey:'1-4', nodeLabel:'单位内项目排序',
      seq:7, notifKind:'待办', level:'重要', channels:['system','dingding'],
      recipients:'SysAdmin（二级单位）',
      title:'【待办】请对本单位 {{N}} 个需求申请完成优先级排序后提交',
      body:'排序截止：{{截止日期}}，请登录系统完成排序并提交信息办。',
      typeKey:'' },
    { module:'需求征集', moduleIndex:1, nodeKey:'1-5', nodeLabel:'自动初筛 & 人工复核',
      seq:10, notifKind:'待阅', level:'普通', channels:['system','email'],
      recipients:'UnitHandler',
      title:'【未通过】「{{项目名称}}」未通过需求初筛',
      body:'原因：{{初筛原因}}。如有疑问请联系信息化建设办公室。',
      typeKey:'collection-returned' },
    { module:'需求征集', moduleIndex:1, nodeKey:'1-5', nodeLabel:'自动初筛 & 人工复核',
      seq:11, notifKind:'待阅', level:'普通', channels:['system'],
      recipients:'UnitHandler',
      title:'【通过初筛】「{{项目名称}}」已通过需求初筛，进入立项论证阶段',
      body:'请关注后续立项论证安排通知。',
      typeKey:'' },

    /* 模块二：立项论证 */
    { module:'立项论证', moduleIndex:2, nodeKey:'2-1', nodeLabel:'填报立项申报书',
      seq:13, notifKind:'待办', level:'重要', channels:['system','email'],
      recipients:'UnitHandler',
      title:'【待办】请完成「{{项目名称}}」立项申报书及建设方案填报',
      body:'截止日期：{{申报截止日期}}，协助人可在此阶段协同填报，请及时提交信息办审核。',
      typeKey:'approval-invite' },
    { module:'立项论证', moduleIndex:2, nodeKey:'2-2', nodeLabel:'信息办审核申报材料',
      seq:17, notifKind:'待办', level:'重要', channels:['system','email'],
      recipients:'UnitHandler',
      title:'【材料退回】「{{项目名称}}」申报材料需补充修改',
      body:'退回意见：{{退回意见}}，请在 {{截止日期}} 前重新提交。',
      typeKey:'proposal-return' },
    { module:'立项论证', moduleIndex:2, nodeKey:'2-3', nodeLabel:'论证专家选取与邀请',
      seq:21, notifKind:'待办', level:'重要', channels:['system','email','dingding'],
      recipients:'Expert（被邀请）',
      title:'【论证邀请】邀请您参与「{{项目名称}}」立项论证，请确认是否接受',
      body:'论证时间：{{时间}}，地点/方式：{{地点/线上}}，请在 {{响应截止}} 前确认，逾期视为放弃。',
      typeKey:'expert-invite' },
    { module:'立项论证', moduleIndex:2, nodeKey:'2-3', nodeLabel:'论证专家选取与邀请',
      seq:24, notifKind:'待办', level:'紧急', channels:['system','email'],
      recipients:'InfoStaff',
      title:'【预警】「{{项目名称}}」专家确认数量不足，需及时处理',
      body:'已确认 {{已确认数}} 人，缺 {{缺口数}} 人，请补充邀请或延期论证。',
      typeKey:'' },
    { module:'立项论证', moduleIndex:2, nodeKey:'2-4', nodeLabel:'专家论证与评审',
      seq:29, notifKind:'待办', level:'紧急', channels:['system','email','dingding'],
      recipients:'Expert',
      title:'【催办】请在 {{截止时间}} 前完成「{{项目名称}}」论证评审意见提交',
      body:'您尚未提交评审意见，逾期将影响论证结果，请尽快操作。',
      typeKey:'' },
    { module:'立项论证', moduleIndex:2, nodeKey:'2-5', nodeLabel:'论证意见审核与公示',
      seq:32, notifKind:'待阅', level:'普通', channels:['system','email'],
      recipients:'UnitHandler',
      title:'【论证结果】「{{项目名称}}」专家论证意见已可查看',
      body:'论证结论：{{通过/修改后通过/不通过}}，请登录系统查看详细意见。',
      typeKey:'review-result' },
    { module:'立项论证', moduleIndex:2, nodeKey:'2-6', nodeLabel:'领导小组审定与立项下达',
      seq:36, notifKind:'待阅', level:'普通', channels:['system','email'],
      recipients:'UnitHandler',
      title:'【立项通知】「{{项目名称}}」已正式立项，立项通知书已下达',
      body:'采购截止：{{采购截止日期}}，合同截止：{{合同截止日期}}，请及时启动采购流程。',
      typeKey:'approval-notice' },
    { module:'立项论证', moduleIndex:2, nodeKey:'2-7', nodeLabel:'立项有效期预警',
      seq:40, notifKind:'待办', level:'紧急', channels:['system','email','dingding'],
      recipients:'UnitHandler',
      title:'【紧急预警】「{{项目名称}}」采购截止日还剩 30 天，请尽快启动采购',
      body:'采购截止：{{日期}}，超期立项自动失效。',
      typeKey:'frozen-notice' },
    { module:'立项论证', moduleIndex:2, nodeKey:'2-7', nodeLabel:'立项有效期预警',
      seq:43, notifKind:'待阅', level:'重要', channels:['system','email'],
      recipients:'UnitHandler',
      title:'【项目失效】「{{项目名称}}」因超过 6 个月未启动采购，项目已自动失效',
      body:'如需继续推进，请重新提交需求申请。',
      typeKey:'' },

    /* 模块三：招采管理 */
    { module:'招采管理', moduleIndex:3, nodeKey:'3-1', nodeLabel:'采购文件编制 & 技术审核',
      seq:47, notifKind:'待办', level:'重要', channels:['system','dingding'],
      recipients:'InfoStaff',
      title:'【待审核】「{{项目名称}}」采购文件待技术审核',
      body:'请审核技术规范与建设方案一致性、接口标准、安全防护、数据治理等内容。',
      typeKey:'' },
    { module:'招采管理', moduleIndex:3, nodeKey:'3-1', nodeLabel:'采购文件编制 & 技术审核',
      seq:49, notifKind:'待办', level:'重要', channels:['system','email'],
      recipients:'Procurement',
      title:'【退回修改】「{{项目名称}}」采购文件需修改',
      body:'退回意见：{{意见}}，请修改后重新提交。',
      typeKey:'' },
    { module:'招采管理', moduleIndex:3, nodeKey:'3-2', nodeLabel:'供应商调研校验',
      seq:51, notifKind:'待办', level:'普通', channels:['system'],
      recipients:'Procurement',
      title:'【提交失败】「{{项目名称}}」调研供应商不足 3 家，无法提交',
      body:'当前调研供应商：{{N}} 家，非单一来源采购须至少调研 3 家供应商方可提交。',
      typeKey:'' },
    { module:'招采管理', moduleIndex:3, nodeKey:'3-3', nodeLabel:'合同审核与签订',
      seq:52, notifKind:'待办', level:'重要', channels:['system','dingding'],
      recipients:'InfoStaff',
      title:'【待审核】「{{项目名称}}」合同草稿待审核',
      body:'合同金额：{{金额}}，请审核关键条款：建设内容、周期、数据治理、付款方式、维保年限。',
      typeKey:'' },
    { module:'招采管理', moduleIndex:3, nodeKey:'3-3', nodeLabel:'合同审核与签订',
      seq:58, notifKind:'待阅', level:'普通', channels:['system','email'],
      recipients:'UnitHandler',
      title:'【合同已签订】「{{项目名称}}」合同签订完成，项目正式进入实施阶段',
      body:'合同金额：{{金额}}，建设周期：{{起止日期}}。',
      typeKey:'' },

    /* 模块四：项目实施 */
    { module:'项目实施', moduleIndex:4, nodeKey:'4-1', nodeLabel:'组建工作小组',
      seq:61, notifKind:'待阅', level:'普通', channels:['system','email'],
      recipients:'全体小组成员',
      title:'【工作小组成立】「{{项目名称}}」工作小组已成立，您是其中成员',
      body:'您的角色：{{角色}}，项目周期：{{起止日期}}，请关注后续实施安排。',
      typeKey:'' },
    { module:'项目实施', moduleIndex:4, nodeKey:'4-2', nodeLabel:'定期进度汇报',
      seq:62, notifKind:'待办', level:'重要', channels:['system','dingding'],
      recipients:'UnitHandler',
      title:'【待提交】「{{项目名称}}」定期进度汇报待提交',
      body:'汇报周期：{{当前周期}}，截止时间：{{截止时间}}，请按时提交。',
      typeKey:'' },
    { module:'项目实施', moduleIndex:4, nodeKey:'4-2', nodeLabel:'定期进度汇报',
      seq:63, notifKind:'待办', level:'紧急', channels:['system','email','dingding'],
      recipients:'UnitHandler',
      title:'【催办】「{{项目名称}}」进度汇报逾期未提交，请立即提交',
      body:'已逾期 {{N}} 天，请尽快补交，连续未报将通知单位领导。',
      typeKey:'overdue-warning' },
    { module:'项目实施', moduleIndex:4, nodeKey:'4-3', nodeLabel:'变更申请',
      seq:70, notifKind:'待阅', level:'普通', channels:['system','email'],
      recipients:'UnitHandler',
      title:'【变更批准】「{{项目名称}}」变更申请已批准',
      body:'变更内容：{{摘要}}，生效日期：{{日期}}。',
      typeKey:'change-result' },
    { module:'项目实施', moduleIndex:4, nodeKey:'4-4', nodeLabel:'延期申请',
      seq:73, notifKind:'待办', level:'紧急', channels:['system','email','dingding'],
      recipients:'UnitHandler',
      title:'【延期预警】「{{项目名称}}」距建设截止还剩 30 个工作日，如需延期请立即申请',
      body:'延期申请须提前 30 个工作日提交（R20），请尽快评估。',
      typeKey:'' },
    { module:'项目实施', moduleIndex:4, nodeKey:'4-4', nodeLabel:'延期申请',
      seq:77, notifKind:'待阅', level:'重要', channels:['system','email'],
      recipients:'UnitHandler',
      title:'【负面清单】「{{项目名称}}」延期超过 6 个月，已列入负面清单',
      body:'负面清单将上报领导小组，对单位后续项目申报有影响。',
      typeKey:'' },

    /* 项目终止 */
    { module:'项目终止', moduleIndex:45, nodeKey:'4-5', nodeLabel:'终止申请',
      seq:82, notifKind:'待阅', level:'重要', channels:['system','email'],
      recipients:'UnitHandler',
      title:'【项目终止】「{{项目名称}}」已获批终止',
      body:'终止通知书已生成，请配合完成善后工作（资金退回/资产清查等）。',
      typeKey:'' },
    { module:'项目终止', moduleIndex:45, nodeKey:'4-5', nodeLabel:'终止申请',
      seq:83, notifKind:'待阅', level:'重要', channels:['system','email'],
      recipients:'Finance',
      title:'【项目终止】「{{项目名称}}」已批准终止，请处理剩余经费',
      body:'',
      typeKey:'' },

    /* 模块五：项目验收 */
    { module:'项目验收', moduleIndex:5, nodeKey:'5-2', nodeLabel:'内部初验',
      seq:88, notifKind:'待办', level:'重要', channels:['system'],
      recipients:'UnitHandler',
      title:'【待初验】「{{项目名称}}」内部初验已开始，请按检查项逐一确认并填写结果',
      body:'检查维度：功能、性能、数据、培训、文档，完成后提交初验结论。',
      typeKey:'' },
    { module:'项目验收', moduleIndex:5, nodeKey:'5-3', nodeLabel:'试运行监控',
      seq:92, notifKind:'待办', level:'重要', channels:['system','dingding'],
      recipients:'UnitHandler',
      title:'【待办】「{{项目名称}}」试运行期满，可提交正式验收申请',
      body:'请整理验收材料并提交验收申请。',
      typeKey:'' },
    { module:'项目验收', moduleIndex:5, nodeKey:'5-4', nodeLabel:'信息办组织正式验收',
      seq:95, notifKind:'待办', level:'重要', channels:['system','email','dingding'],
      recipients:'Expert',
      title:'【验收邀请】邀请您参与「{{项目名称}}」项目验收，请确认出席',
      body:'验收时间：{{时间}}，地点/方式：{{地点/链接}}，请在 {{截止日期}} 前确认。',
      typeKey:'acceptance-invite' },
    { module:'项目验收', moduleIndex:5, nodeKey:'5-5', nodeLabel:'验收评审结果',
      seq:98, notifKind:'待阅', level:'普通', channels:['system','email'],
      recipients:'UnitHandler',
      title:'【验收通过】「{{项目名称}}」正式验收通过！请完成文档归档与资产移交',
      body:'验收日期：{{日期}}，请在 {{截止日期}} 前完成资产移交和文档归档。',
      typeKey:'acceptance-result' },
    { module:'项目验收', moduleIndex:5, nodeKey:'5-5', nodeLabel:'验收评审结果',
      seq:101, notifKind:'待办', level:'重要', channels:['system','email'],
      recipients:'UnitHandler',
      title:'【验收不合格】「{{项目名称}}」验收未通过，请在整改期内完成整改',
      body:'不合格项：{{问题列表}}，整改截止：{{整改截止日期}}，整改后可申请复验。',
      typeKey:'' },
    { module:'项目验收', moduleIndex:5, nodeKey:'5-6', nodeLabel:'资产移交与归档',
      seq:107, notifKind:'待办', level:'重要', channels:['system'],
      recipients:'InfoStaff',
      title:'【待确认】「{{项目名称}}」资产移交清单待确认',
      body:'请核对移交资产清单并签字确认。',
      typeKey:'' },

    /* 模块六：运维管理 */
    { module:'运维管理', moduleIndex:6, nodeKey:'6-1', nodeLabel:'运维团队组建',
      seq:110, notifKind:'待阅', level:'普通', channels:['system','email'],
      recipients:'运维团队全体成员',
      title:'【运维接管】「{{项目名称}}」已移交运维，您是运维团队成员',
      body:'维保起始：{{日期}}，维保截止：{{日期}}，请熟悉运维规范。',
      typeKey:'' },
    { module:'运维管理', moduleIndex:6, nodeKey:'6-2', nodeLabel:'定期巡检',
      seq:113, notifKind:'待办', level:'普通', channels:['system','dingding'],
      recipients:'UnitHandler',
      title:'【待巡检】「{{项目名称}}」本周期系统巡检待执行',
      body:'巡检项：硬件状态、功能、安全漏洞，完成后提交巡检记录。',
      typeKey:'' },
    { module:'运维管理', moduleIndex:6, nodeKey:'6-2', nodeLabel:'定期巡检',
      seq:115, notifKind:'待办', level:'紧急', channels:['system','dingding'],
      recipients:'UnitHandler',
      title:'【巡检异常待处理】「{{项目名称}}」巡检发现异常，已创建故障工单，请及时处理',
      body:'工单号：{{工单号}}，异常项：{{摘要}}。',
      typeKey:'major-fault' },
    { module:'运维管理', moduleIndex:6, nodeKey:'6-3', nodeLabel:'故障上报',
      seq:116, notifKind:'待办', level:'紧急', channels:['system','dingding','email'],
      recipients:'InfoStaff、UnitHandler',
      title:'【重大故障】「{{项目名称}}」发生重大故障，请立即处理',
      body:'故障描述：{{描述}}，发现时间：{{时间}}，影响范围：{{范围}}，请2小时内提交处置方案。',
      typeKey:'major-fault' },
    { module:'运维管理', moduleIndex:6, nodeKey:'6-4', nodeLabel:'合同到期提醒',
      seq:117, notifKind:'待阅', level:'重要', channels:['system','email'],
      recipients:'UnitHandler、Procurement',
      title:'【合同到期】「{{项目名称}}」维保合同将于 {{日期}} 到期，请及时处理续签',
      body:'合同号：{{contractId}}，到期日：{{expireDate}}，请提前评估是否续签或重新采购。',
      typeKey:'contract-expiry' },
  ];

  /* 通知级别徽章 */
  function _tmplLevelBadge(level) {
    var cls = level === '紧急' ? 'tag-red' : level === '重要' ? 'tag-orange' : 'tag-gray';
    return '<span class="tag ' + cls + '" style="font-size:11px">' + (level || '普通') + '</span>';
  }

  /* 渠道显示 */
  function _tmplChannelBadges(channels) {
    const map = { system:'站内', dingding:'钉钉', email:'邮件', sms:'短信' };
    return (channels || []).map(c =>
      '<span class="channel-badge" style="margin-right:3px">' + (map[c] || c) + '</span>'
    ).join('');
  }

  /* 模块顺序 */
  const moduleOrder = ['需求征集','立项论证','招采管理','项目实施','项目终止','项目验收','运维管理'];

  /* 渲染内容区 */
  function _renderTmplContent(data) {
    if (!data.length) {
      return '<div class="card" style="text-align:center;padding:48px;color:var(--text-secondary)">暂无符合条件的模板</div>';
    }

    /* 按模块分组（平铺，不再按节点嵌套） */
    const moduleMap = {};
    data.forEach(function(t) {
      if (!moduleMap[t.module]) moduleMap[t.module] = [];
      moduleMap[t.module].push(t);
    });

    var html = '';
    moduleOrder.forEach(function(mod, mi) {
      if (!moduleMap[mod]) return;
      var items = moduleMap[mod];
      var idx = data.find(function(t){ return t.module===mod; });
      var modIdx = idx ? idx.moduleIndex : (mi+1);
      var modTitle = mod === '项目终止' ? '模块四附：项目终止' : ('模块' + modIdx + '：' + mod);

      html += '<div class="card" style="margin-top:16px">' +
        '<div class="card-title" style="font-size:15px;margin-bottom:14px">' + modTitle + '</div>' +
        '<div class="table-wrap">' +
        '<table class="data-table" style="font-size:13px">' +
          '<thead><tr>' +
            '<th style="width:32px">#</th>' +
            '<th style="min-width:120px">节点</th>' +
            '<th style="width:58px">类型</th>' +
            '<th style="width:58px">级别</th>' +
            '<th style="width:100px">渠道</th>' +
            '<th>通知标题</th>' +
            '<th>正文摘要</th>' +
            '<th style="width:110px">操作</th>' +
          '</tr></thead>' +
          '<tbody>';
      items.forEach(function(t) {
        var kindTag = t.notifKind === '待办'
          ? '<span class="tag tag-orange" style="font-size:11px">待办</span>'
          : '<span class="tag tag-blue" style="font-size:11px">待阅</span>';
        var levelBadge = _tmplLevelBadge(t.level);
        var nodeCell = '<span style="font-size:11px;color:var(--text-muted);margin-right:4px">' + t.nodeKey + '</span>' + t.nodeLabel;
        var useBtn = '<button class="btn btn-sm btn-primary" onclick="_useTmpl(\'' + (t.typeKey||'') + '\')" style="font-size:11px;padding:2px 8px">使用</button>';
        var editBtn = '<button class="btn btn-sm" onclick="navigate(\'notification-template-edit\',{seq:' + t.seq + '})" style="font-size:11px;padding:2px 8px;margin-left:4px">编辑</button>';
        html += '<tr>' +
          '<td style="color:var(--text-muted)">' + t.seq + '</td>' +
          '<td style="color:var(--text-secondary);font-size:12px">' + nodeCell + '</td>' +
          '<td>' + kindTag + '</td>' +
          '<td>' + levelBadge + '</td>' +
          '<td>' + _tmplChannelBadges(t.channels) + '</td>' +
          '<td style="max-width:260px;word-break:break-all">' + t.title + '</td>' +
          '<td style="max-width:200px;color:var(--text-secondary);font-size:12px;word-break:break-all">' + (t.body||'—') + '</td>' +
          '<td>' + useBtn + editBtn + '</td>' +
        '</tr>';
      });
      html += '</tbody></table></div></div>';
    });
    return html;
  }

  /* 初始渲染 */
  var initialHtml = _renderTmplContent(_tmplData);
  var totalCount = _tmplData.length;

  return '' +
    breadcrumb('通知管理', '通知模板库') +
    '<div class="page-header">' +
      '<div class="page-title">通知模板库</div>' +
      '<button class="btn btn-primary" onclick="navigate(\'notification-template-create\')">+ 新建模板</button>' +
    '</div>' +

    /* filter bar */
    '<div class="card" style="margin-bottom:0;padding:14px 16px">' +
      '<div class="search-bar" style="flex-wrap:wrap;gap:8px">' +
        '<select class="form-control" id="tf-module" style="width:150px" onchange="_tmplFilter()">' +
          '<option value="">全部阶段</option>' +
          '<option value="需求征集">需求征集</option>' +
          '<option value="立项论证">立项论证</option>' +
          '<option value="招采管理">招采管理</option>' +
          '<option value="项目实施">项目实施</option>' +
          '<option value="项目终止">项目终止</option>' +
          '<option value="项目验收">项目验收</option>' +
          '<option value="运维管理">运维管理</option>' +
        '</select>' +
        '<select class="form-control" id="tf-kind" style="width:120px" onchange="_tmplFilter()">' +
          '<option value="">全部类型</option>' +
          '<option value="待办">待办</option>' +
          '<option value="待阅">待阅</option>' +
        '</select>' +
        '<span id="tmpl-count" style="font-size:13px;color:var(--text-secondary);align-self:center">共 ' + totalCount + ' 条模板</span>' +
        '<button class="btn" onclick="_tmplReset()" style="margin-left:auto">重置</button>' +
      '</div>' +
    '</div>' +

    /* content area */
    '<div id="tmpl-content">' + initialHtml + '</div>' +

    /* inline script */
    '<script>' +
    '(function(){' +
    '  var _data = ' + JSON.stringify(_tmplData) + ';' +
    '  var _moduleOrder = ' + JSON.stringify(moduleOrder) + ';' +

    '  function _tmplChannelBadges(channels) {' +
    '    var map = {system:"站内",dingding:"钉钉",email:"邮件",sms:"短信"};' +
    '    return (channels||[]).map(function(c){ return \'<span class="channel-badge" style="margin-right:3px">\'+(map[c]||c)+\'</span>\'; }).join("");' +
    '  }' +
    '  function _tmplLevelBadge(level) {' +
    '    var cls = level==="紧急" ? "tag-red" : level==="重要" ? "tag-orange" : "tag-gray";' +
    '    return \'<span class="tag \'+cls+\'" style="font-size:11px">\'+(level||"普通")+"</span>";' +
    '  }' +

    '  function _renderContent(data) {' +
    '    if (!data.length) return \'<div class="card" style="text-align:center;padding:48px;color:var(--text-secondary)">暂无符合条件的模板</div>\';' +
    '    var moduleMap = {};' +
    '    data.forEach(function(t) {' +
    '      if (!moduleMap[t.module]) moduleMap[t.module] = [];' +
    '      moduleMap[t.module].push(t);' +
    '    });' +
    '    var html = "";' +
    '    _moduleOrder.forEach(function(mod, mi) {' +
    '      if (!moduleMap[mod]) return;' +
    '      var items = moduleMap[mod];' +
    '      var idx = data.find(function(t){ return t.module===mod; });' +
    '      var modIdx = idx ? idx.moduleIndex : (mi+1);' +
    '      var modTitle = mod==="项目终止" ? "模块四附：项目终止" : ("模块"+modIdx+"："+mod);' +
    '      html += \'<div class="card" style="margin-top:16px"><div class="card-title" style="font-size:15px;margin-bottom:14px">\'+modTitle+\'</div><div class="table-wrap"><table class="data-table" style="font-size:13px"><thead><tr><th style="width:32px">#</th><th style="min-width:120px">节点</th><th style="width:58px">类型</th><th style="width:58px">级别</th><th style="width:100px">渠道</th><th>通知标题</th><th>正文摘要</th><th style="width:110px">操作</th></tr></thead><tbody>\';' +
    '      items.forEach(function(t) {' +
    '        var kt = t.notifKind==="待办" ? \'<span class="tag tag-orange" style="font-size:11px">待办</span>\' : \'<span class="tag tag-blue" style="font-size:11px">待阅</span>\';' +
    '        var nc = \'<span style="font-size:11px;color:var(--text-muted);margin-right:4px">\'+t.nodeKey+"</span>"+t.nodeLabel;' +
    '        var ub = \'<button class="btn btn-sm btn-primary" onclick="_useTmpl(\\\'\'+( t.typeKey||"")+\'\\\')" style="font-size:11px;padding:2px 8px">使用</button>\';' +
    '        var eb = \'<button class="btn btn-sm" onclick="navigate(\\\'notification-template-edit\\\',{seq:\'+t.seq+\'})" style="font-size:11px;padding:2px 8px;margin-left:4px">编辑</button>\';' +
    '        var lb = _tmplLevelBadge(t.level);' +
    '        html += "<tr><td style=\\"color:var(--text-muted)\\">" + t.seq + "</td><td style=\\"color:var(--text-secondary);font-size:12px\\">" + nc + "</td><td>" + kt + "</td><td>" + lb + "</td><td>" + _tmplChannelBadges(t.channels) + "</td><td style=\\"max-width:260px;word-break:break-all\\">" + t.title + "</td><td style=\\"max-width:200px;color:var(--text-secondary);font-size:12px;word-break:break-all\\">" + (t.body||"—") + "</td><td>" + ub + eb + "</td></tr>";' +
    '      });' +
    '      html += "</tbody></table></div></div>";' +
    '    });' +
    '    return html;' +
    '  }' +

    '  window._tmplFilter = function() {' +
    '    var mod = (document.getElementById("tf-module")||{}).value || "";' +
    '    var kind = (document.getElementById("tf-kind")||{}).value || "";' +
    '    var filtered = _data.filter(function(t) {' +
    '      if (mod && t.module !== mod) return false;' +
    '      if (kind && t.notifKind !== kind) return false;' +
    '      return true;' +
    '    });' +
    '    var ct = document.getElementById("tmpl-count");' +
    '    if (ct) ct.textContent = "共 " + filtered.length + " 条模板";' +
    '    var area = document.getElementById("tmpl-content");' +
    '    if (area) area.innerHTML = _renderContent(filtered);' +
    '  };' +

    '  window._tmplReset = function() {' +
    '    var m = document.getElementById("tf-module"); if(m) m.value="";' +
    '    var k = document.getElementById("tf-kind"); if(k) k.value="";' +
    '    _tmplFilter();' +
    '  };' +

    '  window._useTmpl = function(typeKey) {' +
    '    if (typeKey) { navigate("notification-create", {typeKey: typeKey}); }' +
    '    else { navigate("notification-create"); }' +
    '  };' +

    '})();' +
    '<\/script>';
});


/* ============================================================
   SHARED: 各业务阶段元数据字段表（VIEW 5 / VIEW 6 公用）
   ============================================================ */
var _STAGE_FIELDS = {
  '需求征集': [
    { v:'项目名称',   d:'需求申请的项目名称',          e:'图书馆RFID管理系统' },
    { v:'征集批次',   d:'当前需求征集的批次名称',       e:'2026年度信息化项目' },
    { v:'截止日期',   d:'需求填报截止日期',             e:'2026-05-15' },
    { v:'预算金额',   d:'项目预算估算（万元）',         e:'50' },
    { v:'经办人姓名', d:'需求申请的项目经办人',         e:'张三' },
    { v:'单位名称',   d:'提交单位名称',                 e:'图书馆' },
    { v:'退回原因',   d:'需求被退回时的原因说明',       e:'材料不完整' },
    { v:'初筛原因',   d:'需求未通过初筛的具体原因',     e:'预算超出上限' },
    { v:'当前日期',   d:'通知发送日期',                 e:'2026-04-10' },
  ],
  '立项论证': [
    { v:'项目名称',     d:'立项申报的项目名称',         e:'教务系统升级改造' },
    { v:'项目编号',     d:'立项后分配的项目编号',       e:'PROJ-2026-001' },
    { v:'预算金额',     d:'批复预算金额（万元）',       e:'120' },
    { v:'申报截止日期', d:'申报书填报截止日期',         e:'2026-05-30' },
    { v:'截止日期',     d:'通用截止日期',               e:'2026-05-30' },
    { v:'退回意见',     d:'材料退回的具体意见',         e:'技术方案描述不清晰' },
    { v:'专家姓名',     d:'被邀请参与评审的专家姓名',   e:'李教授' },
    { v:'论证时间',     d:'论证会议时间',               e:'2026-05-10 14:00' },
    { v:'会议地点',     d:'论证会议地点',               e:'行政楼203会议室' },
    { v:'响应截止',     d:'专家确认参会的截止时间',     e:'2026-05-08 17:00' },
    { v:'评审结论',     d:'专家论证评审结论',           e:'通过' },
    { v:'已确认数',     d:'已确认参会的专家数量',       e:'3' },
    { v:'缺口数',       d:'还缺少的专家数量',           e:'2' },
    { v:'采购截止日期', d:'采购程序启动截止日期',       e:'2026-11-30' },
    { v:'合同截止日期', d:'合同签订截止日期',           e:'2026-12-31' },
    { v:'计划开始',     d:'项目计划开始日期',           e:'2026-06-01' },
    { v:'计划结束',     d:'项目计划结束日期',           e:'2026-12-31' },
    { v:'当前日期',     d:'通知发送日期',               e:'2026-04-10' },
  ],
  '招采管理': [
    { v:'项目名称',     d:'采购项目名称',               e:'教务系统升级改造' },
    { v:'合同金额',     d:'合同签订金额（万元）',       e:'98' },
    { v:'供应商名称',   d:'中标供应商名称',             e:'华为技术有限公司' },
    { v:'合同号',       d:'合同编号',                   e:'HT-2026-001' },
    { v:'起止日期',     d:'合同建设周期起止',           e:'2026-07-01 至 2026-12-31' },
    { v:'退回意见',     d:'采购文件或合同退回意见',     e:'技术规范不符合要求' },
    { v:'调研供应商数', d:'已调研供应商数量',           e:'2' },
    { v:'当前日期',     d:'通知发送日期',               e:'2026-04-10' },
  ],
  '项目实施': [
    { v:'项目名称',   d:'项目名称',                     e:'教务系统升级改造' },
    { v:'当前周期',   d:'当前汇报周期描述',             e:'第3期（07-01至07-15）' },
    { v:'截止时间',   d:'汇报提交截止时间',             e:'2026-07-16 18:00' },
    { v:'逾期天数',   d:'汇报逾期天数',                 e:'3' },
    { v:'变更摘要',   d:'变更申请内容摘要',             e:'建设周期延长30天' },
    { v:'生效日期',   d:'变更批准生效日期',             e:'2026-08-01' },
    { v:'成员角色',   d:'成员在项目中的角色',           e:'项目负责人' },
    { v:'当前日期',   d:'通知发送日期',                 e:'2026-04-10' },
  ],
  '项目终止': [
    { v:'项目名称',   d:'被终止的项目名称',             e:'图书馆RFID管理系统' },
    { v:'终止原因',   d:'项目终止的原因说明',           e:'预算削减，无法继续实施' },
    { v:'当前日期',   d:'通知发送日期',                 e:'2026-04-10' },
  ],
  '项目验收': [
    { v:'项目名称',     d:'被验收的项目名称',           e:'教务系统升级改造' },
    { v:'验收时间',     d:'验收会议时间',               e:'2026-12-15 10:00' },
    { v:'会议地点',     d:'验收会议地点',               e:'行政楼203会议室' },
    { v:'专家姓名',     d:'被邀请的验收专家姓名',       e:'王教授' },
    { v:'截止日期',     d:'专家确认或归档截止日期',     e:'2026-12-13 17:00' },
    { v:'验收结论',     d:'验收评审结论',               e:'通过' },
    { v:'问题列表',     d:'验收不合格项列表',           e:'功能模块A存在缺陷' },
    { v:'整改截止日期', d:'整改完成截止日期',           e:'2027-01-15' },
    { v:'当前日期',     d:'通知发送日期',               e:'2026-04-10' },
  ],
  '运维管理': [
    { v:'项目名称',   d:'运维项目名称',                 e:'教务系统' },
    { v:'巡检周期',   d:'当前巡检周期描述',             e:'2026年4月第2周' },
    { v:'工单号',     d:'故障工单编号',                 e:'FT-2026-042' },
    { v:'异常摘要',   d:'巡检发现异常的摘要',           e:'CPU使用率持续超95%' },
    { v:'故障描述',   d:'重大故障详细描述',             e:'系统无法登录，影响全校用户' },
    { v:'发现时间',   d:'故障发现时间',                 e:'2026-04-10 08:30' },
    { v:'影响范围',   d:'故障影响的用户或系统范围',     e:'全校师生约2万人' },
    { v:'合同号',     d:'维保合同编号',                 e:'HT-2024-001' },
    { v:'到期日期',   d:'维保合同到期日期',             e:'2026-06-30' },
    { v:'维保起始',   d:'维保服务开始日期',             e:'2024-07-01' },
    { v:'维保截止',   d:'维保服务截止日期',             e:'2026-06-30' },
    { v:'当前日期',   d:'通知发送日期',                 e:'2026-04-10' },
  ],
};

/* 渲染字段面板 HTML（供 VIEW 5 / VIEW 6 共用） */
function _renderFieldPanel(module) {
  if (!module) {
    return '<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:160px;color:var(--text-secondary);font-size:13px;text-align:center">' +
      '<div style="font-size:28px;margin-bottom:8px">📋</div>' +
      '<div>请先选择所属阶段</div>' +
      '<div style="font-size:12px;margin-top:4px">选择后将显示该阶段的可用变量字段</div>' +
    '</div>';
  }
  var fields = _STAGE_FIELDS[module] || [];
  var rows = fields.map(function(f) {
    return '<tr>' +
      '<td style="padding:6px 8px;white-space:nowrap">' +
        '<code style="background:#f0f4ff;color:#1d4ed8;padding:2px 6px;border-radius:4px;font-size:12px;font-family:monospace;cursor:pointer" ' +
          'onclick="_copyField(\'{{' + f.v + '}}\')" title="点击复制">{{' + f.v + '}}</code>' +
      '</td>' +
      '<td style="padding:6px 8px;font-size:12px;color:var(--text-secondary)">' + f.d + '</td>' +
      '<td style="padding:6px 8px;font-size:11px;color:#999;font-family:monospace">' + f.e + '</td>' +
      '<td style="padding:6px 4px;text-align:right">' +
        '<button class="btn btn-sm" onclick="_copyField(\'{{' + f.v + '}}\')" ' +
          'style="font-size:11px;padding:1px 8px;color:var(--primary);border-color:var(--primary)">复制</button>' +
      '</td>' +
    '</tr>';
  }).join('');
  return '<div style="font-size:12px;font-weight:600;color:var(--text-secondary);margin-bottom:8px;letter-spacing:0.3px">' +
    module + ' · 可用变量字段（' + fields.length + ' 个）' +
  '</div>' +
  '<table style="width:100%;border-collapse:collapse">' +
    '<thead>' +
      '<tr style="border-bottom:1px solid #f0f0f0">' +
        '<th style="padding:4px 8px;font-size:11px;color:var(--text-secondary);font-weight:500;text-align:left">变量名</th>' +
        '<th style="padding:4px 8px;font-size:11px;color:var(--text-secondary);font-weight:500;text-align:left">说明</th>' +
        '<th style="padding:4px 8px;font-size:11px;color:var(--text-secondary);font-weight:500;text-align:left">示例值</th>' +
        '<th style="padding:4px 8px;width:44px"></th>' +
      '</tr>' +
    '</thead>' +
    '<tbody>' + rows + '</tbody>' +
  '</table>';
}

/* 全局复制函数，供字段面板「复制」按钮使用 */
function _copyField(text) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(function() { showToast('已复制：' + text); });
  } else {
    var ta = document.createElement('textarea');
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    showToast('已复制：' + text);
  }
}

/* 全局面板刷新函数，供两个视图的 onchange 直接调用 */
function _updateFieldPanel(panelId, module) {
  var el = document.getElementById(panelId);
  if (el) el.innerHTML = _renderFieldPanel(module);
}


/* ============================================================
   VIEW 5: notification-template-create  新建模板
   ============================================================ */
registerView('notification-template-create', function() {

  const moduleOptions = ['需求征集','立项论证','招采管理','项目实施','项目终止','项目验收','运维管理'].map(m =>
    '<option value="' + m + '">' + m + '</option>'
  ).join('');

  const initialFieldPanel = _renderFieldPanel('');

  return '' +
    breadcrumb('通知管理', '通知模板库', '新建模板') +
    '<div class="page-header">' +
      '<div class="page-title">新建模板</div>' +
      '<button class="btn" onclick="navigate(\'notification-template\')">← 返回模板库</button>' +
    '</div>' +

    '<div class="card">' +
      '<div class="card-title" style="margin-bottom:20px">模板信息</div>' +

      /* 双列布局：左侧表单 + 右侧字段面板 */
      '<div style="display:flex;gap:24px;align-items:flex-start">' +

        /* 左侧：表单 */
        '<div style="flex:1;min-width:0">' +
          '<div class="form-grid">' +

            /* 模板名称 */
            '<div class="form-item" style="grid-column:1/-1">' +
              '<label class="form-label required">模板名称</label>' +
              '<input class="form-control" id="tc-name" placeholder="请输入模板名称（必填）">' +
            '</div>' +

            /* 所属阶段 */
            '<div class="form-item">' +
              '<label class="form-label required">所属阶段</label>' +
              '<select class="form-control" id="tc-module" onchange="_updateFieldPanel(\'tc-field-panel\',this.value)">' +
                '<option value="">请选择阶段</option>' +
                moduleOptions +
              '</select>' +
            '</div>' +

            /* 所属节点 */
            '<div class="form-item">' +
              '<label class="form-label">所属节点</label>' +
              '<input class="form-control" id="tc-node" placeholder="如：1-1 信息办发布征集通知（选填）">' +
            '</div>' +

            /* 通知类型 */
            '<div class="form-item">' +
              '<label class="form-label required">通知类型</label>' +
              '<div style="display:flex;gap:24px;margin-top:6px">' +
                '<label style="display:flex;align-items:center;gap:6px;cursor:pointer"><input type="radio" name="tc-kind" value="待办" checked> 待办</label>' +
                '<label style="display:flex;align-items:center;gap:6px;cursor:pointer"><input type="radio" name="tc-kind" value="待阅"> 待阅</label>' +
              '</div>' +
            '</div>' +

            /* 发送渠道 */
            '<div class="form-item">' +
              '<label class="form-label required">发送渠道</label>' +
              '<div style="display:flex;gap:20px;margin-top:6px;flex-wrap:wrap">' +
                '<label style="display:flex;align-items:center;gap:6px;cursor:pointer"><input type="checkbox" class="tc-channel-cb" value="system" checked> 站内</label>' +
                '<label style="display:flex;align-items:center;gap:6px;cursor:pointer"><input type="checkbox" class="tc-channel-cb" value="dingding"> 钉钉</label>' +
                '<label style="display:flex;align-items:center;gap:6px;cursor:pointer"><input type="checkbox" class="tc-channel-cb" value="email"> 邮件</label>' +
                '<label style="display:flex;align-items:center;gap:6px;cursor:pointer"><input type="checkbox" class="tc-channel-cb" value="sms"> 短信</label>' +
              '</div>' +
            '</div>' +

            /* 接收角色 */
            '<div class="form-item" style="grid-column:1/-1">' +
              '<label class="form-label">接收角色</label>' +
              '<input class="form-control" id="tc-recipients" placeholder="如：UnitHandler、UnitLeader（选填）">' +
            '</div>' +

            /* 通知标题模板 */
            '<div class="form-item" style="grid-column:1/-1">' +
              '<label class="form-label required">通知标题模板</label>' +
              '<input class="form-control" id="tc-title" placeholder="支持 {{变量}} 占位，如：【待办】「{{项目名称}}」需填报申报书（必填）">' +
              '<div style="font-size:12px;color:var(--text-secondary);margin-top:4px">在右侧字段表中点击「复制」，粘贴到此处即可使用变量</div>' +
            '</div>' +

            /* 通知正文模板 */
            '<div class="form-item" style="grid-column:1/-1">' +
              '<label class="form-label">通知正文模板</label>' +
              '<textarea class="form-control" id="tc-body" rows="7" placeholder="支持 {{变量}} 占位（选填）"></textarea>' +
            '</div>' +

          '</div>' +

          /* 操作按钮 */
          '<div style="display:flex;gap:10px;margin-top:8px;padding-top:16px;border-top:1px solid #f0f0f0">' +
            '<button class="btn btn-primary" onclick="_saveTmplCreate()">保存模板</button>' +
            '<button class="btn" onclick="navigate(\'notification-template\')">取消</button>' +
          '</div>' +
        '</div>' +

        /* 右侧：字段面板 */
        '<div id="tc-field-panel" style="width:340px;flex-shrink:0;border:1px solid #e8e8e8;border-radius:8px;padding:14px;background:#fafafa;max-height:640px;overflow-y:auto">' +
          initialFieldPanel +
        '</div>' +

      '</div>' +
    '</div>' +

    '<script>' +
    'window._saveTmplCreate = function() {' +
    '  var name = (document.getElementById("tc-name")||{}).value||"";' +
    '  var mod  = (document.getElementById("tc-module")||{}).value||"";' +
    '  var title= (document.getElementById("tc-title")||{}).value||"";' +
    '  var cbs  = document.querySelectorAll(".tc-channel-cb:checked");' +
    '  if (!name.trim()) { showToast("请填写模板名称"); return; }' +
    '  if (!mod)         { showToast("请选择所属阶段"); return; }' +
    '  if (!title.trim()){ showToast("请填写通知标题模板"); return; }' +
    '  if (!cbs.length)  { showToast("请至少选择一个发送渠道"); return; }' +
    '  showToast("模板已保存");' +
    '  navigate("notification-template");' +
    '};' +
    '<\/script>';
});


/* ============================================================
   VIEW 6: notification-template-edit  模板编辑
   ============================================================ */
registerView('notification-template-edit', function(params) {
  params = params || {};

  const _allTmpl = [
    {seq:1,  module:'需求征集', nodeKey:'1-1', nodeLabel:'信息办发布征集通知',     notifKind:'待阅', channels:['system','email'],           recipients:'UnitHandler、UnitLeader',      title:'【征集通知】{{批次名称}} 信息化项目需求征集开始',                              body:'征集时间：{{开始日期}} 至 {{截止日期}}，请登录系统填报需求申请表。'},
    {seq:3,  module:'需求征集', nodeKey:'1-2', nodeLabel:'指派项目负责人',         notifKind:'待办', channels:['system','dingding'],         recipients:'UnitHandler（被指派）',         title:'【待办】您被指派为「{{项目名称}}」项目负责人，请填报需求申请表',                  body:'截止日期：{{征集截止日期}}，请尽快完成需求填报并提交单位负责人审核。'},
    {seq:4,  module:'需求征集', nodeKey:'1-3', nodeLabel:'需求申请表提交单位审批',  notifKind:'待办', channels:['system','dingding'],         recipients:'UnitLeader',                    title:'【待审批】「{{项目名称}}」需求申请表待您审批',                                    body:'申报人：{{经办人姓名}}，预估预算：{{预算金额}}，请审核后决定是否通过。'},
    {seq:6,  module:'需求征集', nodeKey:'1-3', nodeLabel:'需求申请表提交单位审批',  notifKind:'待办', channels:['system','email'],            recipients:'UnitHandler',                   title:'【已驳回】「{{项目名称}}」需求申请被驳回，请修改后重新提交',                       body:'驳回原因：{{驳回原因}}，请修改后重新提交。'},
    {seq:7,  module:'需求征集', nodeKey:'1-4', nodeLabel:'单位内项目排序',         notifKind:'待办', channels:['system','dingding'],         recipients:'SysAdmin（二级单位）',          title:'【待办】请对本单位 {{N}} 个需求申请完成优先级排序后提交',                          body:'排序截止：{{截止日期}}，请登录系统完成排序并提交信息办。'},
    {seq:10, module:'需求征集', nodeKey:'1-5', nodeLabel:'自动初筛 & 人工复核',    notifKind:'待阅', channels:['system','email'],            recipients:'UnitHandler',                   title:'【未通过】「{{项目名称}}」未通过需求初筛',                                        body:'原因：{{初筛原因}}。如有疑问请联系信息化建设办公室。'},
    {seq:11, module:'需求征集', nodeKey:'1-5', nodeLabel:'自动初筛 & 人工复核',    notifKind:'待阅', channels:['system'],                   recipients:'UnitHandler',                   title:'【通过初筛】「{{项目名称}}」已通过需求初筛，进入立项论证阶段',                     body:'请关注后续立项论证安排通知。'},
    {seq:13, module:'立项论证', nodeKey:'2-1', nodeLabel:'填报立项申报书',         notifKind:'待办', channels:['system','email'],            recipients:'UnitHandler',                   title:'【待办】请完成「{{项目名称}}」立项申报书及建设方案填报',                           body:'截止日期：{{申报截止日期}}，协助人可在此阶段协同填报，请及时提交信息办审核。'},
    {seq:17, module:'立项论证', nodeKey:'2-2', nodeLabel:'信息办审核申报材料',     notifKind:'待办', channels:['system','email'],            recipients:'UnitHandler',                   title:'【材料退回】「{{项目名称}}」申报材料需补充修改',                                   body:'退回意见：{{退回意见}}，请在 {{截止日期}} 前重新提交。'},
    {seq:21, module:'立项论证', nodeKey:'2-3', nodeLabel:'论证专家选取与邀请',     notifKind:'待办', channels:['system','email','dingding'], recipients:'Expert（被邀请）',              title:'【论证邀请】邀请您参与「{{项目名称}}」立项论证，请确认是否接受',                   body:'论证时间：{{时间}}，地点/方式：{{地点/线上}}，请在 {{响应截止}} 前确认，逾期视为放弃。'},
    {seq:24, module:'立项论证', nodeKey:'2-3', nodeLabel:'论证专家选取与邀请',     notifKind:'待办', channels:['system','email'],            recipients:'InfoStaff',                     title:'【预警】「{{项目名称}}」专家确认数量不足，需及时处理',                              body:'已确认 {{已确认数}} 人，缺 {{缺口数}} 人，请补充邀请或延期论证。'},
    {seq:29, module:'立项论证', nodeKey:'2-4', nodeLabel:'专家论证与评审',         notifKind:'待办', channels:['system','email','dingding'], recipients:'Expert',                        title:'【催办】请在 {{截止时间}} 前完成「{{项目名称}}」论证评审意见提交',                  body:'您尚未提交评审意见，逾期将影响论证结果，请尽快操作。'},
    {seq:32, module:'立项论证', nodeKey:'2-5', nodeLabel:'论证意见审核与公示',     notifKind:'待阅', channels:['system','email'],            recipients:'UnitHandler',                   title:'【论证结果】「{{项目名称}}」专家论证意见已可查看',                                  body:'论证结论：{{通过/修改后通过/不通过}}，请登录系统查看详细意见。'},
    {seq:36, module:'立项论证', nodeKey:'2-6', nodeLabel:'领导小组审定与立项下达',  notifKind:'待阅', channels:['system','email'],           recipients:'UnitHandler',                   title:'【立项通知】「{{项目名称}}」已正式立项，立项通知书已下达',                          body:'采购截止：{{采购截止日期}}，合同截止：{{合同截止日期}}，请及时启动采购流程。'},
    {seq:40, module:'立项论证', nodeKey:'2-7', nodeLabel:'立项有效期预警',         notifKind:'待办', channels:['system','email','dingding'], recipients:'UnitHandler',                   title:'【紧急预警】「{{项目名称}}」采购截止日还剩 30 天，请尽快启动采购',                  body:'采购截止：{{日期}}，超期立项自动失效。'},
    {seq:43, module:'立项论证', nodeKey:'2-7', nodeLabel:'立项有效期预警',         notifKind:'待阅', channels:['system','email'],            recipients:'UnitHandler',                   title:'【项目失效】「{{项目名称}}」因超过 6 个月未启动采购，项目已自动失效',               body:'如需继续推进，请重新提交需求申请。'},
    {seq:47, module:'招采管理', nodeKey:'3-1', nodeLabel:'采购文件编制 & 技术审核', notifKind:'待办', channels:['system','dingding'],         recipients:'InfoStaff',                     title:'【待审核】「{{项目名称}}」采购文件待技术审核',                                      body:'请审核技术规范与建设方案一致性、接口标准、安全防护、数据治理等内容。'},
    {seq:49, module:'招采管理', nodeKey:'3-1', nodeLabel:'采购文件编制 & 技术审核', notifKind:'待办', channels:['system','email'],            recipients:'Procurement',                   title:'【退回修改】「{{项目名称}}」采购文件需修改',                                        body:'退回意见：{{意见}}，请修改后重新提交。'},
    {seq:51, module:'招采管理', nodeKey:'3-2', nodeLabel:'供应商调研校验',         notifKind:'待办', channels:['system'],                   recipients:'Procurement',                   title:'【提交失败】「{{项目名称}}」调研供应商不足 3 家，无法提交',                         body:'当前调研供应商：{{N}} 家，非单一来源采购须至少调研 3 家供应商方可提交。'},
    {seq:52, module:'招采管理', nodeKey:'3-3', nodeLabel:'合同审核与签订',         notifKind:'待办', channels:['system','dingding'],         recipients:'InfoStaff',                     title:'【待审核】「{{项目名称}}」合同草稿待审核',                                          body:'合同金额：{{金额}}，请审核关键条款：建设内容、周期、数据治理、付款方式、维保年限。'},
    {seq:58, module:'招采管理', nodeKey:'3-3', nodeLabel:'合同审核与签订',         notifKind:'待阅', channels:['system','email'],            recipients:'UnitHandler',                   title:'【合同已签订】「{{项目名称}}」合同签订完成，项目正式进入实施阶段',                   body:'合同金额：{{金额}}，建设周期：{{起止日期}}。'},
    {seq:61, module:'项目实施', nodeKey:'4-1', nodeLabel:'组建工作小组',           notifKind:'待阅', channels:['system','email'],            recipients:'全体小组成员',                  title:'【工作小组成立】「{{项目名称}}」工作小组已成立，您是其中成员',                      body:'您的角色：{{角色}}，项目周期：{{起止日期}}，请关注后续实施安排。'},
    {seq:62, module:'项目实施', nodeKey:'4-2', nodeLabel:'定期进度汇报',           notifKind:'待办', channels:['system','dingding'],         recipients:'UnitHandler',                   title:'【待提交】「{{项目名称}}」定期进度汇报待提交',                                      body:'汇报周期：{{当前周期}}，截止时间：{{截止时间}}，请按时提交。'},
    {seq:63, module:'项目实施', nodeKey:'4-2', nodeLabel:'定期进度汇报',           notifKind:'待办', channels:['system','email','dingding'], recipients:'UnitHandler',                   title:'【催办】「{{项目名称}}」进度汇报逾期未提交，请立即提交',                            body:'已逾期 {{N}} 天，请尽快补交，连续未报将通知单位领导。'},
    {seq:70, module:'项目实施', nodeKey:'4-3', nodeLabel:'变更申请',               notifKind:'待阅', channels:['system','email'],            recipients:'UnitHandler',                   title:'【变更批准】「{{项目名称}}」变更申请已批准',                                        body:'变更内容：{{摘要}}，生效日期：{{日期}}。'},
    {seq:73, module:'项目实施', nodeKey:'4-4', nodeLabel:'延期申请',               notifKind:'待办', channels:['system','email','dingding'], recipients:'UnitHandler',                   title:'【延期预警】「{{项目名称}}」距建设截止还剩 30 个工作日，如需延期请立即申请',        body:'延期申请须提前 30 个工作日提交（R20），请尽快评估。'},
    {seq:77, module:'项目实施', nodeKey:'4-4', nodeLabel:'延期申请',               notifKind:'待阅', channels:['system','email'],            recipients:'UnitHandler',                   title:'【负面清单】「{{项目名称}}」延期超过 6 个月，已列入负面清单',                       body:'负面清单将上报领导小组，对单位后续项目申报有影响。'},
    {seq:82, module:'项目终止', nodeKey:'4-5', nodeLabel:'终止申请',               notifKind:'待阅', channels:['system','email'],            recipients:'UnitHandler',                   title:'【项目终止】「{{项目名称}}」已获批终止',                                            body:'终止通知书已生成，请配合完成善后工作（资金退回/资产清查等）。'},
    {seq:83, module:'项目终止', nodeKey:'4-5', nodeLabel:'终止申请',               notifKind:'待阅', channels:['system','email'],            recipients:'Finance',                       title:'【项目终止】「{{项目名称}}」已批准终止，请处理剩余经费',                            body:''},
    {seq:88, module:'项目验收', nodeKey:'5-2', nodeLabel:'内部初验',               notifKind:'待办', channels:['system'],                   recipients:'UnitHandler',                   title:'【待初验】「{{项目名称}}」内部初验已开始，请按检查项逐一确认并填写结果',             body:'检查维度：功能、性能、数据、培训、文档，完成后提交初验结论。'},
    {seq:92, module:'项目验收', nodeKey:'5-3', nodeLabel:'试运行监控',             notifKind:'待办', channels:['system','dingding'],         recipients:'UnitHandler',                   title:'【待办】「{{项目名称}}」试运行期满，可提交正式验收申请',                            body:'请整理验收材料并提交验收申请。'},
    {seq:95, module:'项目验收', nodeKey:'5-4', nodeLabel:'信息办组织正式验收',      notifKind:'待办', channels:['system','email','dingding'], recipients:'Expert',                        title:'【验收邀请】邀请您参与「{{项目名称}}」项目验收，请确认出席',                        body:'验收时间：{{时间}}，地点/方式：{{地点/链接}}，请在 {{截止日期}} 前确认。'},
    {seq:98, module:'项目验收', nodeKey:'5-5', nodeLabel:'验收评审结果',            notifKind:'待阅', channels:['system','email'],            recipients:'UnitHandler',                   title:'【验收通过】「{{项目名称}}」正式验收通过！请完成文档归档与资产移交',                 body:'验收日期：{{日期}}，请在 {{截止日期}} 前完成资产移交和文档归档。'},
    {seq:101,module:'项目验收', nodeKey:'5-5', nodeLabel:'验收评审结果',            notifKind:'待办', channels:['system','email'],            recipients:'UnitHandler',                   title:'【验收不合格】「{{项目名称}}」验收未通过，请在整改期内完成整改',                     body:'不合格项：{{问题列表}}，整改截止：{{整改截止日期}}，整改后可申请复验。'},
    {seq:107,module:'项目验收', nodeKey:'5-6', nodeLabel:'资产移交与归档',          notifKind:'待办', channels:['system'],                    recipients:'InfoStaff',                     title:'【待确认】「{{项目名称}}」资产移交清单待确认',                                      body:'请核对移交资产清单并签字确认。'},
    {seq:110,module:'运维管理', nodeKey:'6-1', nodeLabel:'运维团队组建',            notifKind:'待阅', channels:['system','email'],            recipients:'运维团队全体成员',              title:'【运维接管】「{{项目名称}}」已移交运维，您是运维团队成员',                           body:'维保起始：{{日期}}，维保截止：{{日期}}，请熟悉运维规范。'},
    {seq:113,module:'运维管理', nodeKey:'6-2', nodeLabel:'定期巡检',               notifKind:'待办', channels:['system','dingding'],         recipients:'UnitHandler',                   title:'【待巡检】「{{项目名称}}」本周期系统巡检待执行',                                    body:'巡检项：硬件状态、功能、安全漏洞，完成后提交巡检记录。'},
    {seq:115,module:'运维管理', nodeKey:'6-2', nodeLabel:'定期巡检',               notifKind:'待办', channels:['system','dingding'],         recipients:'UnitHandler',                   title:'【巡检异常待处理】「{{项目名称}}」巡检发现异常，已创建故障工单，请及时处理',         body:'工单号：{{工单号}}，异常项：{{摘要}}。'},
    {seq:116,module:'运维管理', nodeKey:'6-3', nodeLabel:'故障上报',               notifKind:'待办', channels:['system','dingding','email'],  recipients:'InfoStaff、UnitHandler',        title:'【重大故障】「{{项目名称}}」发生重大故障，请立即处理',                              body:'故障描述：{{描述}}，发现时间：{{时间}}，影响范围：{{范围}}，请2小时内提交处置方案。'},
    {seq:117,module:'运维管理', nodeKey:'6-4', nodeLabel:'合同到期提醒',            notifKind:'待阅', channels:['system','email'],            recipients:'UnitHandler、Procurement',      title:'【合同到期】「{{项目名称}}」维保合同将于 {{日期}} 到期，请及时处理续签',             body:'合同号：{{contractId}}，到期日：{{expireDate}}，请提前评估是否续签或重新采购。'},
  ];

  const targetSeq = parseInt(params.seq, 10);
  const tmpl = _allTmpl.find(function(t) { return t.seq === targetSeq; });

  if (!tmpl) {
    return '' +
      breadcrumb('通知管理', '通知模板库', '模板编辑') +
      '<div class="page-header">' +
        '<div class="page-title">编辑模板</div>' +
        '<button class="btn" onclick="navigate(\'notification-template\')">← 返回模板库</button>' +
      '</div>' +
      '<div class="card" style="text-align:center;padding:48px;color:var(--text-secondary)">' +
        '未找到对应模板，请返回模板库重新选择。' +
      '</div>';
  }

  const allChannels = ['system','dingding','email','sms'];
  const channelMap  = { system:'站内', dingding:'钉钉', email:'邮件', sms:'短信' };

  const moduleOptions = ['需求征集','立项论证','招采管理','项目实施','项目终止','项目验收','运维管理'].map(m =>
    '<option value="' + m + '"' + (m === tmpl.module ? ' selected' : '') + '>' + m + '</option>'
  ).join('');

  const channelCheckboxes = allChannels.map(c =>
    '<label style="display:flex;align-items:center;gap:6px;cursor:pointer">' +
    '<input type="checkbox" class="te-channel-cb" value="' + c + '"' + (tmpl.channels.indexOf(c) !== -1 ? ' checked' : '') + '> ' +
    (channelMap[c] || c) + '</label>'
  ).join('');

  const safeTitle = (tmpl.title||'').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  const safeRecipients = (tmpl.recipients||'').replace(/&/g,'&amp;').replace(/"/g,'&quot;');
  const safeBody = (tmpl.body||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');

  const initialFieldPanel = _renderFieldPanel(tmpl.module);

  return '' +
    breadcrumb('通知管理', '通知模板库', '模板编辑') +
    '<div class="page-header">' +
      '<div class="page-title">编辑模板</div>' +
      '<button class="btn" onclick="navigate(\'notification-template\')">← 返回模板库</button>' +
    '</div>' +

    '<div class="card">' +
      '<div class="card-title" style="margin-bottom:20px">模板信息</div>' +

      /* 双列布局：左侧表单 + 右侧字段面板 */
      '<div style="display:flex;gap:24px;align-items:flex-start">' +

        /* 左侧：表单 */
        '<div style="flex:1;min-width:0">' +
          '<div class="form-grid">' +

            /* 模板名称 */
            '<div class="form-item" style="grid-column:1/-1">' +
              '<label class="form-label required">模板名称</label>' +
              '<input class="form-control" id="te-name" value="' + safeTitle + '">' +
            '</div>' +

            /* 所属阶段 */
            '<div class="form-item">' +
              '<label class="form-label required">所属阶段</label>' +
              '<select class="form-control" id="te-module" onchange="_updateFieldPanel(\'te-field-panel\',this.value)">' + moduleOptions + '</select>' +
            '</div>' +

            /* 所属节点 */
            '<div class="form-item">' +
              '<label class="form-label">所属节点</label>' +
              '<input class="form-control" id="te-node" value="' + tmpl.nodeKey + ' ' + tmpl.nodeLabel + '">' +
            '</div>' +

            /* 通知类型 */
            '<div class="form-item">' +
              '<label class="form-label required">通知类型</label>' +
              '<div style="display:flex;gap:24px;margin-top:6px">' +
                '<label style="display:flex;align-items:center;gap:6px;cursor:pointer"><input type="radio" name="te-kind" value="待办"' + (tmpl.notifKind === '待办' ? ' checked' : '') + '> 待办</label>' +
                '<label style="display:flex;align-items:center;gap:6px;cursor:pointer"><input type="radio" name="te-kind" value="待阅"' + (tmpl.notifKind === '待阅' ? ' checked' : '') + '> 待阅</label>' +
              '</div>' +
            '</div>' +

            /* 发送渠道 */
            '<div class="form-item">' +
              '<label class="form-label required">发送渠道</label>' +
              '<div style="display:flex;gap:20px;margin-top:6px;flex-wrap:wrap">' + channelCheckboxes + '</div>' +
            '</div>' +

            /* 接收角色 */
            '<div class="form-item" style="grid-column:1/-1">' +
              '<label class="form-label">接收角色</label>' +
              '<input class="form-control" id="te-recipients" value="' + safeRecipients + '">' +
            '</div>' +

            /* 通知标题模板 */
            '<div class="form-item" style="grid-column:1/-1">' +
              '<label class="form-label required">通知标题模板</label>' +
              '<input class="form-control" id="te-title" value="' + safeTitle + '">' +
              '<div style="font-size:12px;color:var(--text-secondary);margin-top:4px">在右侧字段表中点击「复制」，粘贴到此处即可使用变量</div>' +
            '</div>' +

            /* 通知正文模板 */
            '<div class="form-item" style="grid-column:1/-1">' +
              '<label class="form-label">通知正文模板</label>' +
              '<textarea class="form-control" id="te-body" rows="7">' + safeBody + '</textarea>' +
            '</div>' +

          '</div>' +

          /* 操作按钮 */
          '<div style="display:flex;gap:10px;margin-top:8px;padding-top:16px;border-top:1px solid #f0f0f0">' +
            '<button class="btn btn-primary" onclick="_saveTmplEdit()">保存模板</button>' +
            '<button class="btn" onclick="navigate(\'notification-template\')">取消</button>' +
          '</div>' +
        '</div>' +

        /* 右侧：字段面板（初始展示当前模板所属阶段字段） */
        '<div id="te-field-panel" style="width:340px;flex-shrink:0;border:1px solid #e8e8e8;border-radius:8px;padding:14px;background:#fafafa;max-height:640px;overflow-y:auto">' +
          initialFieldPanel +
        '</div>' +

      '</div>' +
    '</div>' +

    '<script>' +
    'window._saveTmplEdit = function() {' +
    '  var name  = (document.getElementById("te-name")||{}).value||"";' +
    '  var mod   = (document.getElementById("te-module")||{}).value||"";' +
    '  var title = (document.getElementById("te-title")||{}).value||"";' +
    '  var cbs   = document.querySelectorAll(".te-channel-cb:checked");' +
    '  if (!name.trim()) { showToast("请填写模板名称"); return; }' +
    '  if (!mod)         { showToast("请选择所属阶段"); return; }' +
    '  if (!title.trim()){ showToast("请填写通知标题模板"); return; }' +
    '  if (!cbs.length)  { showToast("请至少选择一个发送渠道"); return; }' +
    '  showToast("模板已更新");' +
    '  navigate("notification-template");' +
    '};' +
    '<\/script>';
});
