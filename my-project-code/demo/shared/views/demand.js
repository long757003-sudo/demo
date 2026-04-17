// shared/views/demand.js  — V2.1 需求管理模块（优化升级版）

/* ════════════════════════════════════════════════════════════════
   需求评审结论 helper：供 demand-select / demand-approve / collection-detail 复用
   关联规则：review.demandId === demand.id（单条 review 反向挂靠到 demand）
   ════════════════════════════════════════════════════════════════ */
function _getDemandReview(did) {
  return (DATA.reviews || []).find(function(r) { return r.demandId === did; });
}
function _reviewBadge(r) {
  if (!r) return '<span style="color:var(--text-secondary)">—</span>';
  var map = {
    'passed':             { cls: 'tag-green',  text: '已通过' },
    'rejected':           { cls: 'tag-red',    text: '不通过' },
    'timeout-rejected':   { cls: 'tag-red',    text: '超时未改' },
    'rework-pending':     { cls: 'tag-orange', text: '退回修改' },
    'in-progress':        { cls: 'tag-blue',   text: '进行中' },
    'invitation-pending': { cls: 'tag-gray',   text: '邀请中' },
    'not-started':        { cls: 'tag-gray',   text: '未开始' },
  };
  var m = map[r.status] || { cls: 'tag-gray', text: r.status };
  var score = (r.weightedScore != null) ? ' <b>' + r.weightedScore + '</b>' : '';
  var linkable = ['passed','rejected','timeout-rejected'].indexOf(r.status) >= 0;
  var view = linkable
    ? ' <a onclick="navigate(\'review-launch\',{id:\'' + r.id + '\'})">查看</a>'
    : '';
  return '<span class="tag ' + m.cls + '">' + m.text + '</span>' + score + view;
}

/* ════════════════════════════════════════════════════════════════
   MODULE-LEVEL: collection-create Step 1 从模板导入助手
   数据引用 notification.js 中的 _notifImportTmplData（运行时读取）
   ════════════════════════════════════════════════════════════════ */

function _ccGetTmplData() {
  return (typeof _notifImportTmplData !== 'undefined') ? _notifImportTmplData : (window._notifImportTmplData || []);
}

window._ccToggleImportCard = function() {
  var b = document.getElementById('cc-import-body');
  var i = document.getElementById('cc-import-ico');
  var l = document.getElementById('cc-import-lbl');
  var open = b && b.style.display !== 'none';
  if (b) b.style.display = open ? 'none' : 'block';
  if (i) i.textContent = open ? '▶' : '▼';
  if (l) l.textContent = open ? '展开' : '收起';
  if (!open) window._ccFilterImport();
};

window._ccUpdateImportNodes = function() {
  var mod = (document.getElementById('cc-im-mod') || {}).value || '';
  var nd = document.getElementById('cc-im-node');
  if (!nd) return;
  var seen = {};
  var opts = '<option value="">全部节点</option>';
  _ccGetTmplData().forEach(function(t) {
    if ((!mod || t.module === mod) && !seen[t.nodeLabel]) {
      seen[t.nodeLabel] = 1;
      opts += '<option>' + t.nodeLabel + '</option>';
    }
  });
  nd.innerHTML = opts;
  window._ccFilterImport();
};

window._ccFilterImport = function() {
  var mod  = (document.getElementById('cc-im-mod')  || {}).value || '';
  var node = (document.getElementById('cc-im-node') || {}).value || '';
  var filtered = _ccGetTmplData().filter(function(t) {
    if (mod  && t.module    !== mod)  return false;
    if (node && t.nodeLabel !== node) return false;
    return true;
  });
  var el = document.getElementById('cc-im-result');
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
    var btn = '<button class="btn btn-sm btn-primary" onclick="_ccDoImport(' + t.seq + ')" style="font-size:11px;padding:2px 8px">导入</button>';
    html += '<tr><td style="font-size:12px">' + nc + '</td><td>' + kt + '</td><td style="font-size:12px">' + t.title + '</td><td>' + btn + '</td></tr>';
  });
  html += '</tbody></table></div>';
  if (filtered.length > 8) {
    html += '<div style="text-align:center;font-size:12px;color:var(--text-secondary);padding:4px 0">显示前 8 条，共 ' + filtered.length + ' 条，请缩小筛选范围</div>';
  }
  el.innerHTML = html;
};

window._ccResetImport = function() {
  var m = document.getElementById('cc-im-mod');
  var n = document.getElementById('cc-im-node');
  if (m) m.value = '需求征集';
  if (n) n.innerHTML = '<option value="">全部节点</option>';
  window._ccFilterImport();
};

window._onReviewToggle = function(el) {
  var idx = parseInt(el.getAttribute('data-gap'), 10);
  if (!window._collectWizard) window._collectWizard = { step: 0, data: {} };
  window._collectWizard.data.reviewConfig = window._collectWizard.data.reviewConfig || [];
  window._collectWizard.data.reviewConfig[idx] = el.checked;
  window._flowModified = true;
  var wrap = el.closest ? el.closest('.flow-arrow-with-review') : null;
  if (wrap) {
    var arrow = wrap.querySelector('.flow-arrow');
    if (arrow) arrow.style.opacity = el.checked ? '1' : '0.5';
  }
};

window._ccDoImport = function(seq) {
  var t = _ccGetTmplData().find(function(x) { return x.seq === seq; });
  if (!t) return;
  var te = document.getElementById('cn-title');
  var ce = document.getElementById('cn-body');
  if (te) te.value = t.title;
  if (ce) ce.value = t.body || '';
  if (typeof toast === 'function') toast('已导入模板：' + t.title.slice(0, 20) + (t.title.length > 20 ? '…' : ''), 'success');
  var fc = document.getElementById('cn-form-card');
  if (fc) fc.scrollIntoView({ behavior: 'smooth' });
};

/* ════════════════════════════════════════════════════════════════
   1. demand-collect — 需求征集列表 (info-admin / info-leader / unit-admin[R])
   ════════════════════════════════════════════════════════════════ */

function _collectionStatusTag(status) {
  const map = {
    draft:            ['草稿',     'tag-gray'],
    'pending-review': ['待审核',   'tag-orange'],
    returned:         ['已退回',   'tag-orange'],
    active:           ['征集中',   'tag-green'],
    'selection-done': ['遴选完成', 'tag-blue'],
    closed:           ['已关闭',   'tag-gray'],
  };
  const [label, cls] = map[status] || ['未知', 'tag-gray'];
  return '<span class="tag ' + cls + '">' + label + '</span>';
}

/* _showNotifDrawer 已移除 — 通知详情统一使用 notification-detail 页面 */

registerView('demand-collect', function() {
  const role = getCurrentRole();
  const isUnitAdmin = role === 'unit-admin';

  const rows = DATA.collectionPlans.map(function(plan) {
    var opBtns =
      '<button class="btn btn-sm" style="margin-right:4px" onclick="navigate(\'collection-detail\',{id:\'' + plan.id + '\'})">查看征集详情</button>' +
      '<button class="btn btn-sm" style="margin-right:4px" onclick="navigate(\'notification-detail\',{planId:\'' + plan.id + '\',source:\'demand-collect\'})">通知详情</button>';

    if (!isUnitAdmin) {
      opBtns += '<button class="btn btn-sm" onclick="navigate(\'demand-list\',{collectionId:\'' + plan.id + '\'})">查看申报详情</button>';
    }

    // 补充优化5：unit-admin 在征集列表看到「需求排序」按钮
    if (isUnitAdmin && plan.status === 'active') {
      opBtns += '<button class="btn btn-sm" style="background:var(--primary);color:#fff;border-color:var(--primary)" onclick="navigate(\'demand-sort\',{collectionId:\'' + plan.id + '\'})">需求排序</button>';
    }

    // 遴选完成后 info-admin 可直接创建评审任务
    if (role === 'info-admin' && plan.status === 'selection-done') {
      opBtns += '<button class="btn btn-sm" style="background:var(--primary);color:#fff;border-color:var(--primary);margin-left:4px" onclick="navigate(\'review-launch\')">创建评审任务</button>';
    }

    var summaryCell = plan.summary
      ? (plan.summary.length > 40 ? plan.summary.slice(0,40) + '…' : plan.summary)
      : '—';

    return [
      '<b>' + plan.title + '</b>',
      plan.year,
      '<span style="font-size:12px">' + formatDate(plan.startDate) + ' ~ ' + formatDate(plan.endDate) + '</span>',
      _collectionStatusTag(plan.status),
      '<span style="font-size:12px">' + summaryCell + '</span>',
      plan.contactName || '—',
      '<span style="font-size:12px">' + (plan.contactInfo || '—') + '</span>',
      '<span style="font-size:12px">' + (plan.scopeDesc || '—') + '</span>',
      (plan.submitStats ? plan.submitStats.totalDemands : '—'),
      opBtns,
    ];
  });

  return (
    breadcrumb('首页', '需求管理', '需求征集') +
    '<div class="page-header">' +
      '<div class="page-title">需求征集</div>' +
      (role === 'info-admin'
        ? '<button class="btn btn-primary" onclick="window._collectStep=0;window._collectWizard={step:0,data:{}};navigate(\'collection-create\')">+ 创建征集方案</button>'
        : '') +
    '</div>' +
    (isUnitAdmin
      ? '<div style="margin-bottom:12px;padding:8px 12px;background:#fffbe6;border:1px solid #ffe58f;border-radius:4px;font-size:13px">' +
          '当前为只读视图。如需排序本单位需求，请点击对应征集项的「需求排序」按钮。' +
        '</div>'
      : '') +
    '<div class="table-wrap">' +
      renderTable(
        ['征集标题', '年度', '征集周期', '状态', '摘要', '通知联系人', '联系方式', '征集范围', '需求数', '操作'],
        rows
      ) +
      '<div class="table-pagination"><span>共 ' + DATA.collectionPlans.length + ' 条记录</span></div>' +
    '</div>'
  );
});


/* ════════════════════════════════════════════════════════════════
   2. collection-create — 创建征集方案（4步向导）
   ════════════════════════════════════════════════════════════════ */

window._collectStep = window._collectStep || 0;
window._collectWizard = window._collectWizard || { step: 0, data: {} };

function _goCollectStep(n) {
  window._collectStep = n;
  if (!window._collectWizard) window._collectWizard = { step: 0, data: {} };
  window._collectWizard.step = n;
  renderView('collection-create');
}
window._goCollectStep = _goCollectStep;

function _saveDraftCollect() {
  saveDraft('collection-create', window._collectWizard);
  toast('草稿已保存', 'info');
}
window._saveDraftCollect = _saveDraftCollect;

function _collectStep0Html(data) {
  data = data || {};
  return (
    '<div class="card">' +
      '<div class="card-title">征集基础信息</div>' +
      '<div class="form-grid">' +
        '<div class="form-item">' +
          '<label class="form-label">征集标题 <span class="req">*</span></label>' +
          '<input class="form-control" id="cc-title" placeholder="请输入征集标题" value="' + (data.title || '') + '">' +
        '</div>' +
        '<div class="form-item">' +
          '<label class="form-label">征集年度 <span class="req">*</span></label>' +
          '<select class="form-control" id="cc-year">' +
            ['2025','2026','2027','2028'].map(function(y) {
              return '<option value="' + y + '"' + ((!data.year && y==='2026') || data.year==y ? ' selected' : '') + '>' + y + '</option>';
            }).join('') +
          '</select>' +
        '</div>' +
        '<div class="form-item span-2">' +
          '<label class="form-label">摘要 <span class="req">*</span></label>' +
          '<input class="form-control" id="cc-summary" placeholder="请输入一句话摘要（100字以内）" maxlength="100" value="' + (data.summary || '') + '">' +
        '</div>' +
        '<div class="form-item span-2">' +
          '<label class="form-label">征集说明 <span class="req">*</span></label>' +
          '<textarea class="form-control" id="cc-desc" rows="4" placeholder="请输入征集说明内容...">' + (data.description || '') + '</textarea>' +
        '</div>' +
        '<div class="form-item">' +
          '<label class="form-label">开始日期 <span class="req">*</span></label>' +
          '<input type="date" class="form-control" id="cc-start" value="' + (data.startDate || '') + '">' +
        '</div>' +
        '<div class="form-item">' +
          '<label class="form-label">截止日期 <span class="req">*</span></label>' +
          '<input type="date" class="form-control" id="cc-end" value="' + (data.endDate || '') + '">' +
        '</div>' +
        '<div class="form-item span-2">' +
          '<label class="form-label">附件</label>' +
          '<input type="file" class="form-control" id="cc-file" accept=".pdf,.doc,.docx">' +
          '<div style="font-size:11px;color:var(--text-secondary);margin-top:4px">支持 PDF / Word 格式，最大 20MB（Demo 占位，不实际上传）</div>' +
        '</div>' +
      '</div>' +
      '<div class="form-footer">' +
        '<button class="btn" onclick="_saveDraftCollect()">暂存草稿</button>' +
        '<button class="btn btn-primary" onclick="' +
          'var t=document.getElementById(\'cc-title\').value;' +
          'var s=document.getElementById(\'cc-summary\').value;' +
          'var d=document.getElementById(\'cc-desc\').value;' +
          'if(!t||!s||!d){toast(\'请填写征集标题、摘要和征集说明\',\'warning\');return;}' +
          'window._collectWizard.data.title=t;' +
          'window._collectWizard.data.summary=s;' +
          'window._collectWizard.data.year=document.getElementById(\'cc-year\').value;' +
          'window._collectWizard.data.description=d;' +
          'window._collectWizard.data.startDate=document.getElementById(\'cc-start\').value;' +
          'window._collectWizard.data.endDate=document.getElementById(\'cc-end\').value;' +
          '_goCollectStep(1);">下一步</button>' +
      '</div>' +
    '</div>'
  );
}

function _collectStep1Html(data) {
  data = data || {};
  var defaultChannels = data.channels || ['system','dingtalk'];
  var chCheckbox = function(val, label) {
    return '<label style="margin-right:16px"><input type="checkbox" name="cn-channel" value="' + val + '"' +
      (defaultChannels.indexOf(val) >= 0 ? ' checked' : '') + '> ' + label + '</label>';
  };
  return (
    /* CARD A: 从模板导入（默认展开，模块预选"需求征集"） */
    '<div class="card" style="padding:0;margin-bottom:0" id="cc-import-card">' +
      '<div id="cc-import-hdr" onclick="_ccToggleImportCard()" style="display:flex;align-items:center;justify-content:space-between;padding:14px 16px;cursor:pointer;user-select:none">' +
        '<div style="font-weight:600;font-size:14px">从模板导入</div>' +
        '<div style="font-size:12px;color:var(--text-secondary);display:flex;align-items:center;gap:4px"><span id="cc-import-ico">▼</span><span id="cc-import-lbl">收起</span></div>' +
      '</div>' +
      '<div id="cc-import-body" style="display:block;border-top:1px solid #f0f0f0;padding:14px 16px">' +
        '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px">' +
          '<select class="form-control" id="cc-im-mod" onchange="_ccUpdateImportNodes()" style="width:140px">' +
            '<option value="">全部模块</option>' +
            '<option selected>需求征集</option><option>立项论证</option><option>招采管理</option>' +
            '<option>项目实施</option><option>项目终止</option><option>项目验收</option><option>运维管理</option>' +
          '</select>' +
          '<select class="form-control" id="cc-im-node" style="width:220px"><option value="">全部节点</option></select>' +
          '<button class="btn btn-sm btn-primary" onclick="_ccFilterImport()">查询</button>' +
          '<button class="btn btn-sm" onclick="_ccResetImport()">重置</button>' +
        '</div>' +
        '<div id="cc-im-result" style="font-size:12px;color:var(--text-secondary);text-align:center;padding:8px">正在加载模板…</div>' +
      '</div>' +
    '</div>' +

    /* CARD B: 通知内容 */
    '<div class="card" id="cn-form-card" style="margin-top:0">' +
      '<div class="card-title">通知内容</div>' +
      '<div class="form-grid">' +
        '<div class="form-item span-2">' +
          '<label class="form-label">通知标题 <span class="req">*</span></label>' +
          '<input class="form-control" id="cn-title" placeholder="请输入通知标题" value="' + (data.notifTitle || '') + '">' +
        '</div>' +
        '<div class="form-item span-2">' +
          '<label class="form-label">通知正文 <span class="req">*</span></label>' +
          '<textarea class="form-control" id="cn-body" rows="6" placeholder="请输入通知正文...">' + (data.notifBody || '') + '</textarea>' +
        '</div>' +
        '<div class="form-item">' +
          '<label class="form-label">联系人</label>' +
          '<input class="form-control" id="cn-contact-name" placeholder="如：张华" value="' + (data.contactName || '张华') + '">' +
        '</div>' +
        '<div class="form-item">' +
          '<label class="form-label">联系方式</label>' +
          '<input class="form-control" id="cn-contact-info" placeholder="如：023-68253188 / zhanghua@swu.edu.cn" value="' + (data.contactInfo || '023-68253188 / zhanghua@swu.edu.cn') + '">' +
        '</div>' +
        '<div class="form-item span-2">' +
          '<label class="form-label">接收范围 <span class="req">*</span></label>' +
          '<div style="display:flex;flex-wrap:wrap;gap:16px;padding-top:6px">' +
            '<label><input type="checkbox" id="cn-r-all" checked onchange="_updateRecipientCount()"> 全部单位</label>' +
            '<label><input type="checkbox" id="cn-r-role" onchange="_updateRecipientCount()"> 按角色类型选择</label>' +
            '<label><input type="checkbox" id="cn-r-person" onchange="_updateRecipientCount()"> 按个人选择</label>' +
          '</div>' +
          '<div style="margin-top:8px;font-size:13px;color:var(--primary);font-weight:600" id="cn-recipient-count">接收人汇总：42 人</div>' +
        '</div>' +
        '<div class="form-item span-2">' +
          '<label class="form-label">发送渠道 <span class="req">*</span></label>' +
          '<div style="display:flex;flex-wrap:wrap;padding-top:6px">' +
            chCheckbox('system','系统消息') +
            chCheckbox('dingtalk','钉钉') +
            chCheckbox('sms','短信') +
          '</div>' +
        '</div>' +
        '<div class="form-item span-2">' +
          '<label class="form-label">发送时间 <span class="req">*</span></label>' +
          '<div style="display:flex;flex-wrap:wrap;gap:16px;padding-top:6px">' +
            '<label><input type="radio" name="cn-send-time" value="immediate" checked onchange="document.getElementById(\'cn-scheduled-wrap\').style.display=\'none\'"> 审核通过后立即发送</label>' +
            '<label><input type="radio" name="cn-send-time" value="scheduled" onchange="document.getElementById(\'cn-scheduled-wrap\').style.display=\'inline-flex\'"> 定时发送</label>' +
          '</div>' +
          '<div id="cn-scheduled-wrap" style="display:none;align-items:center;gap:8px;margin-top:8px">' +
            '<span style="font-size:13px">发送时间：</span>' +
            '<input type="datetime-local" class="form-control" id="cn-scheduled-time" style="width:220px">' +
          '</div>' +
        '</div>' +
      '</div>' +
      '<div class="form-footer">' +
        '<button class="btn" onclick="_goCollectStep(0)">上一步</button>' +
        '<button class="btn" onclick="_saveDraftCollect()">暂存草稿</button>' +
        '<button class="btn btn-primary" onclick="' +
          'var nt=document.getElementById(\'cn-title\').value;' +
          'var nb=document.getElementById(\'cn-body\').value;' +
          'if(!nt||!nb){toast(\'请填写通知标题和通知正文\',\'warning\');return;}' +
          'var chs=[];document.querySelectorAll(\'input[name=cn-channel]:checked\').forEach(function(c){chs.push(c.value);});' +
          'if(!chs.length){toast(\'请至少选择一种发送渠道\',\'warning\');return;}' +
          'window._collectWizard.data.notifTitle=nt;' +
          'window._collectWizard.data.notifBody=nb;' +
          'window._collectWizard.data.contactName=document.getElementById(\'cn-contact-name\').value;' +
          'window._collectWizard.data.contactInfo=document.getElementById(\'cn-contact-info\').value;' +
          'window._collectWizard.data.channels=chs;' +
          '_goCollectStep(2);">下一步</button>' +
      '</div>' +
    '</div>' +
    /* 初始化模板列表渲染 */
    '<script>setTimeout(function(){if(window._ccFilterImport)window._ccFilterImport();},0)<\/script>'
  );
}

window._updateRecipientCount = function() {
  const all    = document.getElementById('cn-r-all');
  const byRole = document.getElementById('cn-r-role');
  const byPerson = document.getElementById('cn-r-person');
  let count = 0;
  if (all && all.checked)      count = 42;
  else if (byRole && byRole.checked) count = 18;
  else if (byPerson && byPerson.checked) count = 5;
  const el = document.getElementById('cn-recipient-count');
  if (el) el.textContent = '接收人汇总：' + count + ' 人';
};

/* ── 模板变更保存三选一弹窗 ── */
window._showTemplateSaveDialog = function() {
  var body =
    '<p style="margin-bottom:16px">您对流程模板进行了调整，请选择保存方式：</p>' +
    '<div style="display:flex;flex-direction:column;gap:12px">' +
      '<div style="padding:12px;border:1px solid #d6e8ff;border-radius:6px;cursor:pointer;background:#f8fbff" onclick="_templateSaveChoice(1)">' +
        '<div style="font-weight:600;color:var(--primary);margin-bottom:4px">① 新增为新模板</div>' +
        '<div style="font-size:12px;color:var(--text-secondary)">将调整后的流程保存为新模板，需补充模板标题等信息</div>' +
      '</div>' +
      '<div style="padding:12px;border:1px solid #ffe58f;border-radius:6px;cursor:pointer;background:#fffbe6" onclick="_templateSaveChoice(2)">' +
        '<div style="font-weight:600;color:var(--warning);margin-bottom:4px">② 覆盖原模板</div>' +
        '<div style="font-size:12px;color:var(--text-secondary)">此操作会覆盖原模板信息，请确认</div>' +
      '</div>' +
      '<div style="padding:12px;border:1px solid #e0e0e0;border-radius:6px;cursor:pointer;background:#fafafa" onclick="_templateSaveChoice(3)">' +
        '<div style="font-weight:600;margin-bottom:4px">③ 不做任何更改</div>' +
        '<div style="font-size:12px;color:var(--text-secondary)">仅将调整应用于当前征集方案，不影响模板</div>' +
      '</div>' +
    '</div>';
  showModal('流程模板保存方式', body, '<button class="btn" onclick="closeModal()">取消</button>');
};

window._templateSaveChoice = function(choice) {
  closeModal();
  if (choice === 1) {
    toast('Demo：新标签页打开流程模板管理，预填变更后的内容', 'info');
    window.open('#flow-config', '_blank');
  } else if (choice === 2) {
    showModal('覆盖确认', '<p>此操作会覆盖原模板信息，请确认。</p>',
      '<button class="btn" onclick="closeModal()">取消</button>' +
      '<button class="btn btn-warning" onclick="closeModal();toast(\'原模板已覆盖\',\'success\')">确认覆盖</button>');
  } else {
    toast('仅应用于当前征集方案', 'info');
  }
};

function _collectStep2Html(data) {
  data = data || {};

  const templateOptions = DATA.workflowTemplates.map(function(t) {
    return '<option value="' + t.id + '"' + (data.templateId === t.id ? ' selected' : '') + '>' + t.name + (t.isDefault ? '（默认）' : '') + '</option>';
  }).join('');

  const defaultNodes = [
    { name: '立项论证', type: 'main', materials: ['可行性报告', '技术方案书'] },
    { name: '招投标',   type: 'main', materials: ['招标文件', '投标报告'] },
    { name: '合同签订', type: 'main', materials: ['合同文本'] },
    { name: '项目实施', type: 'main', materials: ['进展报告', '阶段报告'] },
    { name: '验收',     type: 'main', materials: ['验收报告', '用户手册'] },
    { name: '运维',     type: 'main', materials: ['运维方案', '巡检记录'] },
  ];

  /* 初始化评审开关数组（长度 = 节点间隙数 = 节点数-1），默认不勾选 */
  data.reviewConfig = data.reviewConfig || [];
  while (data.reviewConfig.length < defaultNodes.length - 1) data.reviewConfig.push(false);

  const nodeHtml = defaultNodes.map(function(node, i) {
    const materialCheckboxes = node.materials.map(function(m) {
      return '<label style="display:block;font-size:11px;padding:2px 0">' +
        '<input type="checkbox" checked> ' + m +
      '</label>';
    }).join('');

    var gapHtml = '';
    if (i > 0) {
      var gapIdx = i - 1;
      var checked = data.reviewConfig[gapIdx] ? ' checked' : '';
      gapHtml =
        '<div class="flow-arrow-with-review" style="display:inline-flex;flex-direction:column;align-items:center;margin:0 6px">' +
          '<div class="flow-arrow" style="opacity:' + (data.reviewConfig[gapIdx] ? '1' : '0.5') + '">→</div>' +
          '<label style="font-size:11px;white-space:nowrap;margin-top:4px;cursor:pointer">' +
            '<input type="checkbox" class="cc-review-toggle" data-gap="' + gapIdx + '"' + checked + ' onchange="_onReviewToggle(this)"> 需要专家评审' +
          '</label>' +
        '</div>';
    }

    return gapHtml +
    '<div style="display:inline-flex;flex-direction:column;align-items:center;gap:4px">' +
      '<div class="flow-node ' + node.type + '">' +
        '<div class="flow-node-name">' + node.name + '</div>' +
        '<div class="flow-node-role" style="margin:2px 0">主流程</div>' +
        '<div style="margin-top:4px">' +
          '<button class="btn btn-sm" style="font-size:10px;padding:1px 6px" ' +
            'onclick="var el=this.parentNode.nextElementSibling;el.style.display=el.style.display===\'none\'?\'block\':\'none\'">' +
            '材料</button>' +
        '</div>' +
      '</div>' +
      '<div style="display:none;background:#f5f5f5;border:1px solid #e0e0e0;border-radius:4px;padding:6px;min-width:90px;font-size:11px">' +
        materialCheckboxes +
      '</div>' +
    '</div>';
  }).join('');

  return (
    '<div class="card">' +
      '<div class="card-title">业务流程配置</div>' +
      '<div style="display:flex;align-items:center;gap:12px;margin-bottom:16px">' +
        '<label class="form-label" style="margin-bottom:0;white-space:nowrap">流程模板</label>' +
        '<select class="form-control" id="cf-template" style="width:240px" onchange="' +
          'if(window._flowModified){' +
            'if(!confirm(\'切换模板将覆盖当前配置，是否继续？\')){this.value=window._collectWizard.data.templateId||\'TPL001\';return;}' +
          '}' +
          'window._flowModified=false;' +
          'toast(\'已加载模板配置\',\'info\');">' + templateOptions + '</select>' +
        '<a onclick="window.open(\'#flow-config\',\'_blank\')" style="font-size:13px;white-space:nowrap;cursor:pointer">管理模板 ↗</a>' +
      '</div>' +
      '<div class="flow-diagram" style="padding:16px 0;overflow-x:auto" onclick="window._flowModified=true;">' +
        nodeHtml +
      '</div>' +
      '<div style="font-size:12px;color:var(--text-secondary);margin-top:8px">提示：点击节点下方"材料"按钮可展开/收起材料清单；点击"+ 插入评审节点"可在该节点后插入评审环节</div>' +
      '<div class="form-footer">' +
        '<button class="btn" onclick="_goCollectStep(1)">上一步</button>' +
        '<button class="btn" onclick="_saveDraftCollect()">暂存草稿</button>' +
        '<button class="btn btn-primary" onclick="' +
          'window._collectWizard.data.templateId=document.getElementById(\'cf-template\').value;' +
          'if(window._flowModified){_showTemplateSaveDialog();}' +
          '_goCollectStep(3);">下一步</button>' +
      '</div>' +
    '</div>'
  );
}

function _collectStep3Html(data) {
  data = data || {};

  const miniFlow = ['立项论证', '招投标', '合同签订', '项目实施', '验收', '运维'].map(function(n, i) {
    return (i > 0 ? '<span class="flow-arrow" style="font-size:12px">→</span>' : '') +
      '<span class="flow-node main" style="min-width:60px;padding:4px 8px;font-size:11px">' + n + '</span>';
  }).join('');

  const tplName = (DATA.workflowTemplates.find(function(t) { return t.id === data.templateId; }) || DATA.workflowTemplates[0]).name;

  return (
    '<div class="card">' +
      '<div class="card-title">总览与发布确认</div>' +

      '<div class="card" style="border:1px solid #e0e0e0;margin-bottom:16px">' +
        '<div style="display:flex;justify-content:space-between;align-items:center">' +
          '<div class="card-title" style="margin-bottom:8px">征集说明信息</div>' +
          '<a onclick="_goCollectStep(0)" style="font-size:13px">返回修改</a>' +
        '</div>' +
        '<div class="detail-grid">' +
          '<div class="detail-item"><span class="detail-label">征集标题</span><span class="detail-value">' + (data.title || '（未填写）') + '</span></div>' +
          '<div class="detail-item"><span class="detail-label">征集年度</span><span class="detail-value">' + (data.year || '2026') + '</span></div>' +
          '<div class="detail-item"><span class="detail-label">开始日期</span><span class="detail-value">' + (data.startDate || '—') + '</span></div>' +
          '<div class="detail-item"><span class="detail-label">截止日期</span><span class="detail-value">' + (data.endDate || '—') + '</span></div>' +
          '<div class="detail-item" style="grid-column:1/-1"><span class="detail-label">摘要</span><span class="detail-value">' + (data.summary || '（未填写）') + '</span></div>' +
          '<div class="detail-item" style="grid-column:1/-1"><span class="detail-label">征集说明</span><span class="detail-value">' + (data.description || '（未填写）') + '</span></div>' +
        '</div>' +
      '</div>' +

      '<div class="card" style="border:1px solid #e0e0e0;margin-bottom:16px">' +
        '<div style="display:flex;justify-content:space-between;align-items:center">' +
          '<div class="card-title" style="margin-bottom:8px">通知信息</div>' +
          '<a onclick="_goCollectStep(1)" style="font-size:13px">返回修改</a>' +
        '</div>' +
        '<div class="detail-grid">' +
          '<div class="detail-item"><span class="detail-label">通知标题</span><span class="detail-value">' + (data.notifTitle || '（未填写）') + '</span></div>' +
          '<div class="detail-item"><span class="detail-label">接收人数</span><span class="detail-value">42 人（全部单位）</span></div>' +
          '<div class="detail-item"><span class="detail-label">发送时间</span><span class="detail-value">审核通过后立即发送</span></div>' +
          '<div class="detail-item"><span class="detail-label">联系人</span><span class="detail-value">' + (data.contactName || '张华') + '</span></div>' +
          '<div class="detail-item"><span class="detail-label">联系方式</span><span class="detail-value">' + (data.contactInfo || '023-68253188 / zhanghua@swu.edu.cn') + '</span></div>' +
          '<div class="detail-item"><span class="detail-label">发送渠道</span><span class="detail-value">' + ((data.channels || ['system','dingtalk']).map(function(c){return {system:'系统',dingtalk:'钉钉',sms:'短信'}[c]||c;}).join(' / ')) + '</span></div>' +
          '<div class="detail-item" style="grid-column:1/-1"><span class="detail-label">通知正文摘要</span><span class="detail-value">' + ((data.notifBody || '（未填写）').substring(0, 80)) + (data.notifBody && data.notifBody.length > 80 ? '...' : '') + '</span></div>' +
        '</div>' +
      '</div>' +

      '<div class="card" style="border:1px solid #e0e0e0;margin-bottom:16px">' +
        '<div style="display:flex;justify-content:space-between;align-items:center">' +
          '<div class="card-title" style="margin-bottom:8px">流程配置信息</div>' +
          '<a onclick="_goCollectStep(2)" style="font-size:13px">返回修改</a>' +
        '</div>' +
        '<div style="margin-bottom:8px;font-size:13px"><b>模板：</b>' + tplName + ' &nbsp; <b>材料节点数：</b>6 个节点 / 共 12 项材料 &nbsp; <b>专家评审节点：</b>' + ((data.reviewConfig || []).filter(function(x){return x;}).length) + ' 个</div>' +
        '<div class="flow-diagram" style="flex-wrap:wrap;padding:8px 0">' + miniFlow + '</div>' +
      '</div>' +

      '<div class="form-footer">' +
        '<button class="btn" onclick="_goCollectStep(2)">返回修改</button>' +
        '<button class="btn" onclick="_saveDraftCollect()">暂存草稿</button>' +
        /* 补充优化1：确认发布 → 提交审批 */
        '<button class="btn btn-primary" onclick="' +
          'logOperation(\'需求管理\',\'提交征集方案审批\',\'CP-NEW\',window._collectWizard.data.title||\'新征集方案\',\'征集方案已提交审批，等待信息办领导审核\',null);' +
          'clearDraft(\'collection-create\');' +
          'window._collectStep=0;window._collectWizard={step:0,data:{}};' +
          'toast(\'征集方案已提交审批！等待信息办领导审核\',\'success\');' +
          'setTimeout(function(){navigate(\'demand-collect\');},1500);">提交审批</button>' +
      '</div>' +
    '</div>'
  );
}

registerView('collection-create', function() {
  /* 首次进入时尝试从 localStorage 恢复草稿 */
  if (!window._collectWizard || !window._collectWizard.data) {
    window._collectWizard = { step: 0, data: loadDraft('collection-create') || {} };
  }
  if (typeof window._collectStep !== 'number') window._collectStep = window._collectWizard.step || 0;

  var step = window._collectStep;
  var data = window._collectWizard.data || {};

  /* Step Bar */
  var stepLabels = ['征集基础信息', '通知信息', '流程配置', '总览确认'];
  var stepBarHtml = '<div class="step-bar" style="display:flex;align-items:center;gap:6px;margin-bottom:16px;flex-wrap:wrap">';
  stepLabels.forEach(function(label, i) {
    var isActive = i === step;
    var isDone = i < step;
    var bg = isActive ? 'var(--primary)' : (isDone ? 'var(--success,#52c41a)' : '#e0e0e0');
    var fg = (isActive || isDone) ? '#fff' : '#999';
    var textColor = isActive ? 'var(--primary)' : (isDone ? 'var(--text-secondary)' : '#999');
    var weight = isActive ? '600' : '400';
    var num = isDone ? '✓' : (i + 1);
    stepBarHtml +=
      '<div style="display:inline-flex;align-items:center;gap:6px">' +
        '<span style="display:inline-flex;width:22px;height:22px;border-radius:50%;background:' + bg + ';color:' + fg + ';align-items:center;justify-content:center;font-size:12px;font-weight:600">' + num + '</span>' +
        '<span style="font-size:13px;color:' + textColor + ';font-weight:' + weight + '">' + label + '</span>' +
      '</div>';
    if (i < stepLabels.length - 1) {
      stepBarHtml += '<span style="color:#ccc;margin:0 4px">—</span>';
    }
  });
  stepBarHtml += '</div>';

  /* 步骤内容 */
  var stepHtml;
  if (step === 0)      stepHtml = _collectStep0Html(data);
  else if (step === 1) stepHtml = _collectStep1Html(data);
  else if (step === 2) stepHtml = _collectStep2Html(data);
  else                 stepHtml = _collectStep3Html(data);

  /* Step 1 渲染后初始化模板列表（innerHTML 后 setTimeout 生效） */
  if (step === 1) {
    setTimeout(function() {
      if (window._ccFilterImport) window._ccFilterImport();
    }, 0);
  }

  return (
    breadcrumb('首页', '需求管理', '需求征集', '创建征集方案') +
    '<div class="page-header">' +
      '<div class="page-title">创建征集方案</div>' +
      '<button class="btn" onclick="navigate(\'demand-collect\')">← 返回列表</button>' +
    '</div>' +
    stepBarHtml +
    stepHtml
  );
});


/* ════════════════════════════════════════════════════════════════
   2b. collection-create 提交 / 暂存 / 校验辅助函数
   ════════════════════════════════════════════════════════════════ */

function _ccCollectFormData() {
  var unitBoxes = document.querySelectorAll('#cc-units input[type=checkbox]:checked');
  return {
    title:     (document.getElementById('cc-title').value || '').trim(),
    desc:      document.getElementById('cc-desc').value || '',
    startDate: document.getElementById('cc-start').value,
    endDate:   document.getElementById('cc-end').value,
    units:     Array.prototype.map.call(unitBoxes, function(el) { return el.value; }),
    contact:   document.getElementById('cc-contact').value,
    sendMode:  (document.querySelector('input[name="cc-send-mode"]:checked') || {}).value,
    flow: {
      sort:    document.getElementById('cc-flow-sort').checked,
      approve: document.getElementById('cc-flow-approve').checked,
      expert:  document.getElementById('cc-flow-expert').checked,
      notify:  document.getElementById('cc-flow-notify').checked
    }
  };
}
window._ccCollectFormData = _ccCollectFormData;

function _ccSaveDraft() {
  saveDraft('collection-create', _ccCollectFormData());
  toast('草稿已保存', 'success');
}
window._ccSaveDraft = _ccSaveDraft;

function _ccValidate(data) {
  if (!data.title) { toast('请填写「征集批次标题」', 'error'); return false; }
  if (!data.startDate || !data.endDate) { toast('请填写开始日期和截止日期', 'error'); return false; }
  if (new Date(data.endDate) <= new Date(data.startDate)) { toast('截止日期必须晚于开始日期', 'error'); return false; }
  if (!data.units || data.units.length === 0) { toast('请至少选择 1 个通知接收单位', 'error'); return false; }
  if (!data.sendMode) { toast('请选择发送方式', 'error'); return false; }
  return true;
}
window._ccValidate = _ccValidate;

function _ccSubmitAndJump() {
  var data = _ccCollectFormData();
  if (!_ccValidate(data)) return;

  var plan = {
    id:        'cp-' + Date.now(),
    year:      (new Date(data.startDate)).getFullYear(),
    title:     data.title,
    desc:      data.desc,
    startDate: data.startDate,
    endDate:   data.endDate,
    units:     data.units,
    contact:   data.contact,
    sendMode:  data.sendMode,
    flow:      data.flow,
    status:    '征集中',
    createdBy: (typeof roleDisplayName === 'function' ? roleDisplayName(getCurrentRole()) : '林已杰'),
    createdAt: new Date().toISOString().slice(0, 10)
  };
  if (!Array.isArray(DATA.collectionPlans)) DATA.collectionPlans = [];
  DATA.collectionPlans.unshift(plan);
  logOperation('demand-collect', 'create', plan.title);
  clearDraft('collection-create');

  if (typeof VIEWS !== 'undefined' && VIEWS['notification-create']) {
    navigate('notification-create', {
      prefill: {
        title:       plan.year + '年度信息化项目需求征集通知',
        type:        'collection-notice',
        recipients:  plan.units,
        contact:     plan.contact,
        sourcePlanId: plan.id
      }
    });
    toast('征集方案已发起，通知正在预填', 'success');
  } else {
    toast('Demo：通知功能待完善', 'info');
  }
}
window._ccSubmitAndJump = _ccSubmitAndJump;


/* ════════════════════════════════════════════════════════════════
   3. collection-detail — 征集详情页（4 标签 + 角色操作按钮）
   ════════════════════════════════════════════════════════════════ */

window._collDetailTab = window._collDetailTab || 0;

function _goCollDetailTab(n, planId) {
  window._collDetailTab = n;
  if (planId) localStorage.setItem('viewParams_collection-detail', JSON.stringify({ id: planId }));
  renderView('collection-detail');
}
window._goCollDetailTab = _goCollDetailTab;

/* ── 步骤 1.2 截止日期校验 ── */
window._approveCollection = function(planId) {
  var plan = DATA.collectionPlans.find(function(p) { return p.id === planId; });
  if (!plan) return;

  var endDate = new Date(plan.endDate);
  var now = new Date();
  var daysLeft = Math.ceil((endDate - now) / 86400000);

  if (daysLeft < 0) {
    // 已过期：阻断
    showModal('无法通过审核',
      '<p style="color:var(--danger);font-weight:600">征集截止日期已过期（' + plan.endDate + '），无法通过审核，请退回修改。</p>',
      '<button class="btn btn-warning" onclick="closeModal();_rejectCollection(\'' + planId + '\')">退回修改</button>');
    return;
  }

  if (daysLeft < 7) {
    // < 7 天：警告
    showModal('截止日期即将到期',
      '<p style="color:var(--warning)">征集截止日期仅剩 <b>' + daysLeft + '</b> 天（' + plan.endDate + '），建议退回修改截止日期。</p>',
      '<button class="btn" onclick="closeModal();_rejectCollection(\'' + planId + '\')">退回修改</button>' +
      '<button class="btn btn-primary" onclick="closeModal();_doApproveCollection(\'' + planId + '\')">仍然通过</button>');
    return;
  }

  // ≥ 7 天：正常通过
  _doApproveCollection(planId);
};

window._doApproveCollection = function(planId) {
  var plan = DATA.collectionPlans.find(function(p) { return p.id === planId; });
  if (!plan) return;
  plan.status = 'active';
  logOperation('需求管理', '审核通过征集方案', planId, plan.title, '信息办领导审核通过，通知已发送', null);
  toast('审核通过！征集通知已发送给各单位管理员', 'success');
  renderView('collection-detail');
};

window._rejectCollection = function(planId) {
  showReturnDialog('退回征集方案', function(category, reason) {
    var plan = DATA.collectionPlans.find(function(p) { return p.id === planId; });
    if (plan) plan.status = 'draft';
    logOperation('需求管理', '退回征集方案', planId, (plan ? plan.title : ''), '退回原因：' + category + '：' + reason, null);
    toast('征集方案已退回', 'warning');
    renderView('collection-detail');
  });
};

/* ── 单位管理员已知晓 ── */
window._acknowledgeCollection = function(planId) {
  logOperation('需求管理', '确认知晓征集通知', planId, '', '单位管理员已确认知晓征集通知', null);
  toast('已确认知晓！您现在可以分派需求填报任务', 'success');
};

registerView('collection-detail', function() {
  const params = getViewParams('collection-detail');
  const plan   = (params && DATA.collectionPlans.find(function(p) { return p.id === params.id; }))
               || DATA.collectionPlans[0];
  const tab    = window._collDetailTab || 0;
  const role   = getCurrentRole();

  const allTabs = [
    { label: '基础信息',     idx: 0, roles: null },          // 所有角色可见
    { label: '需求提交统计', idx: 1, roles: ['info-leader', 'info-admin', 'unit-admin'] }, // 项目负责人不可见
    { label: '操作日志',     idx: 2, roles: ['info-leader', 'info-admin'] },                   // 仅信息办可见
    { label: '业务流程配置', idx: 3, roles: null },          // 所有角色可见
    { label: '需求评审',     idx: 4, roles: ['info-leader', 'info-admin', 'leadership-office', 'unit-leader'] }, // 决策相关角色可见
  ];
  const visibleTabs = allTabs.filter(function(t) { return !t.roles || t.roles.includes(role); });
  const tabBar = '<div class="tab-bar" style="margin-bottom:16px">' +
    visibleTabs.map(function(t) {
      return '<div class="tab-item' + (tab === t.idx ? ' active' : '') + '" ' +
        'onclick="_goCollDetailTab(' + t.idx + ',\'' + plan.id + '\')">' + t.label + '</div>';
    }).join('') +
  '</div>';

  /* ── 角色操作按钮区 ── */
  var actionBar = '';

  // 补充优化2：信息办领导审批
  if (role === 'info-leader' && (plan.status === 'pending-review' || plan.status === 'active')) {
    if (plan.status === 'pending-review') {
      actionBar = '<div style="display:flex;gap:8px;margin-left:auto">' +
        '<button class="btn btn-primary" onclick="_approveCollection(\'' + plan.id + '\')">通过</button>' +
        '<button class="btn btn-warning" onclick="_rejectCollection(\'' + plan.id + '\')">不通过</button>' +
      '</div>';
    }
  }

  // 补充优化3：单位管理员已知晓
  if (role === 'unit-admin' && plan.status === 'active') {
    actionBar = '<div style="display:flex;gap:8px;margin-left:auto">' +
      '<button class="btn btn-primary" onclick="_acknowledgeCollection(\'' + plan.id + '\')">已知晓</button>' +
    '</div>';
  }

  // 补充优化4：项目负责人填报入口
  if (role === 'project-manager' && plan.status === 'active') {
    actionBar = '<div style="display:flex;gap:8px;margin-left:auto">' +
      '<button class="btn btn-primary" onclick="navigate(\'demand-fill\')">需求填报</button>' +
    '</div>';
  }

  let body = '';

  /* ─ Tab 0: 基础信息 ─ */
  if (tab === 0) {
    const attachHtml = plan.attachments && plan.attachments.length
      ? plan.attachments.map(function(a) {
          return '<div style="display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:1px solid #f0f0f0">' +
            '<span style="font-size:13px">[附件] ' + a.name + '</span>' +
            '<span style="font-size:11px;color:var(--text-secondary)">' + a.size + '</span>' +
            '<a style="font-size:12px" onclick="toast(\'Demo：文件下载功能暂不可用\',\'info\')">下载</a>' +
          '</div>';
        }).join('')
      : '<div style="color:var(--text-secondary);font-size:13px">暂无附件</div>';

    const notif = plan.notification || {};

    body = (
      '<div class="card">' +
        '<div class="card-title">征集基础信息</div>' +
        '<div class="detail-grid">' +
          '<div class="detail-item"><span class="detail-label">征集标题</span><span class="detail-value"><b>' + plan.title + '</b></span></div>' +
          '<div class="detail-item"><span class="detail-label">征集年度</span><span class="detail-value">' + plan.year + '</span></div>' +
          '<div class="detail-item"><span class="detail-label">开始日期</span><span class="detail-value">' + formatDate(plan.startDate) + '</span></div>' +
          '<div class="detail-item"><span class="detail-label">结束日期</span><span class="detail-value">' + formatDate(plan.endDate) + '</span></div>' +
          '<div class="detail-item"><span class="detail-label">当前状态</span><span class="detail-value">' + _collectionStatusTag(plan.status) + '</span></div>' +
          '<div class="detail-item"><span class="detail-label">创建人</span><span class="detail-value">' + plan.createdBy + '</span></div>' +
          '<div class="detail-item"><span class="detail-label">创建时间</span><span class="detail-value">' + formatDate(plan.createdAt) + '</span></div>' +
          '<div class="detail-item" style="grid-column:1/-1"><span class="detail-label">征集说明</span><span class="detail-value">' + plan.description + '</span></div>' +
        '</div>' +
      '</div>' +
      '<div class="card">' +
        '<div class="card-title">附件列表</div>' + attachHtml +
      '</div>' +
      '<div class="card">' +
        '<div class="card-title">通知摘要</div>' +
        '<div class="detail-grid">' +
          '<div class="detail-item"><span class="detail-label">通知标题</span><span class="detail-value">' + (notif.title || '—') + '</span></div>' +
          '<div class="detail-item"><span class="detail-label">接收范围</span><span class="detail-value">' + (notif.recipients ? notif.recipients.join('、') : '—') + '</span></div>' +
          '<div class="detail-item"><span class="detail-label">接收人数</span><span class="detail-value">' + (notif.recipientCount || '—') + ' 人</span></div>' +
          '<div class="detail-item"><span class="detail-label">发送时间</span><span class="detail-value">' + (notif.sendTime === 'immediate' ? '审核通过后立即发送' : (notif.sendTime || '—')) + '</span></div>' +
          '<div class="detail-item"><span class="detail-label">联系人</span><span class="detail-value">' + (notif.contactName || '—') + '</span></div>' +
          '<div class="detail-item"><span class="detail-label">联系电话</span><span class="detail-value">' + (notif.contactPhone || '—') + '</span></div>' +
          '<div class="detail-item"><span class="detail-label">联系邮箱</span><span class="detail-value">' + (notif.contactEmail || '—') + '</span></div>' +
        '</div>' +
      '</div>'
    );
  }

  /* ─ Tab 1: 需求提交统计 ─ */
  else if (tab === 1) {
    const stats = plan.submitStats || { totalUnits: 0, submittedUnits: 0, notSubmittedUnits: 0, totalDemands: 0, totalBudget: 0, assignedCount: 0, unitDetails: [] };
    const unitRows = (stats.unitDetails || []).map(function(u) {
      const statusTag = u.submitted
        ? '<span class="tag tag-green">已提交</span>'
        : '<span class="tag tag-gray">未提交</span>';
      return '<tr>' +
        '<td>' + u.unit + '</td>' +
        '<td>' + statusTag + '</td>' +
        '<td>' + u.count + '</td>' +
        '<td>' + (u.assignedCount || 0) + '</td>' +
        '<td style="font-size:12px">' + (u.lastSubmit || '—') + '</td>' +
        '<td>' + (u.budget > 0 ? u.budget + ' 万元' : '—') + '</td>' +
        '<td><button class="btn btn-sm" onclick="navigate(\'demand-list\',{collectionId:\'' + plan.id + '\'})">查看详情</button></td>' +
      '</tr>';
    }).join('');

    body = (
      '<div style="display:grid;grid-template-columns:repeat(5,1fr);gap:12px;margin-bottom:20px">' +
        '<div class="stat-card"><div class="stat-value">' + stats.totalUnits     + '</div><div class="stat-label">应提交单位数</div></div>' +
        '<div class="stat-card"><div class="stat-value" style="color:var(--success)">' + stats.submittedUnits    + '</div><div class="stat-label">已提交</div></div>' +
        '<div class="stat-card"><div class="stat-value" style="color:var(--danger)">'  + stats.notSubmittedUnits + '</div><div class="stat-label">未提交</div></div>' +
        '<div class="stat-card"><div class="stat-value" style="color:var(--primary)">' + stats.totalDemands     + '</div><div class="stat-label">需求总条数</div></div>' +
        '<div class="stat-card"><div class="stat-value" style="color:var(--warning)">' + stats.totalBudget      + '</div><div class="stat-label">预算总额（万元）</div></div>' +
      '</div>' +
      '<div class="table-wrap">' +
        '<table class="data-table"><thead><tr>' +
          '<th>单位名称</th><th>提交状态</th><th>提交数量</th><th>已分派人数</th><th>最后提交时间</th><th>预算合计</th><th>操作</th>' +
        '</tr></thead><tbody>' + (unitRows || '<tr><td colspan="7" style="text-align:center;padding:32px;color:var(--text-secondary)">暂无数据</td></tr>') + '</tbody></table>' +
      '</div>'
    );
  }

  /* ─ Tab 2: 操作日志 ─ */
  else if (tab === 2) {
    const mockLogs = [
      { time: plan.createdAt + ' 09:00', operator: plan.createdBy, action: '创建征集方案', detail: '完成征集基础信息及通知配置' },
      { time: plan.createdAt + ' 09:15', operator: plan.createdBy, action: '配置业务流程', detail: '选用标准项目流程模板，共 7 个节点' },
      { time: plan.createdAt + ' 09:30', operator: plan.createdBy, action: '提交审批',     detail: '提交信息办领导审核' },
      { time: plan.createdAt + ' 14:00', operator: '王主任',       action: '审核通过',     detail: '征集方案审核通过，状态更新为审核通过' },
      { time: plan.startDate + ' 09:00', operator: '系统',          action: '发送通知',     detail: '已向 ' + (plan.notification ? plan.notification.recipientCount : 0) + ' 名接收人发送征集通知' },
      { time: plan.startDate + ' 09:00', operator: '系统',          action: '征集开启',     detail: '征集周期开始，状态更新为征集中' },
    ];

    const timelineHtml = mockLogs.map(function(log) {
      return '<div style="display:flex;gap:12px;margin-bottom:16px">' +
        '<div style="display:flex;flex-direction:column;align-items:center;min-width:12px">' +
          '<div style="width:10px;height:10px;border-radius:50%;background:var(--primary);flex-shrink:0;margin-top:4px"></div>' +
          '<div style="width:2px;flex:1;background:#e0e0e0;margin-top:4px"></div>' +
        '</div>' +
        '<div style="flex:1;padding-bottom:8px">' +
          '<div style="display:flex;gap:12px;align-items:center;margin-bottom:4px">' +
            '<b style="font-size:13px">' + log.action + '</b>' +
            '<span style="font-size:11px;color:var(--text-secondary)">' + log.operator + '</span>' +
            '<span style="font-size:11px;color:var(--text-secondary)">' + log.time + '</span>' +
          '</div>' +
          '<div style="font-size:12px;color:var(--text-secondary)">' + log.detail + '</div>' +
        '</div>' +
      '</div>';
    }).join('');

    body = '<div class="card"><div class="card-title">操作日志</div><div style="padding:4px 0">' + timelineHtml + '</div></div>';
  }

  /* ─ Tab 3: 业务流程配置 ─ */
  else if (tab === 3) {
    const nodes = (plan.workflowConfig && plan.workflowConfig.nodes) || [];

    const lockStatusMeta = {
      completed:           { label: '已完成', cls: 'completed',   color: 'var(--success)', icon: '已锁定', tip: '点击查看详情' },
      'in-progress':       { label: '进行中', cls: 'in-progress', color: 'var(--primary)', icon: '已锁定', tip: '点击查看详情' },
      unreached:           { label: '未到达', cls: 'unreached',   color: '#999',           icon: '未锁定', tip: '可编辑' },
      'rollback-unlocked': { label: '退回解锁', cls: 'rollback', color: 'var(--warning)', icon: '未锁定', tip: '可编辑' },
    };

    const nodesHtml = nodes.length
      ? nodes.map(function(node, i) {
          const meta = lockStatusMeta[node.lockStatus] || lockStatusMeta['unreached'];
          const isEditable = node.lockStatus === 'unreached' || node.lockStatus === 'rollback-unlocked';
          return (i > 0 ? '<div class="flow-arrow">→</div>' : '') +
            '<div class="flow-node ' + node.type + (isEditable ? ' editable' : ' locked') + '" ' +
              'title="' + meta.tip + '" ' +
              'onclick="toast(\'Demo：' + meta.tip + ' — ' + node.name + '\',\'info\')">' +
              '<div class="flow-node-name">' + node.name + '</div>' +
              '<div class="flow-node-role">' + node.role + '</div>' +
              '<div class="flow-node-status ' + meta.cls + '">' + meta.icon + ' ' + meta.label + '</div>' +
            '</div>';
        }).join('')
      : '<div style="color:var(--text-secondary);font-size:13px">暂无流程节点配置</div>';

    const saveBtn = role === 'info-admin'
      ? '<button class="btn btn-primary" style="margin-top:16px" onclick="showModal(\'保存更改确认\',\'<p>确定要保存流程配置更改吗？已锁定节点的配置将不会更改。</p>\',\'<button class=\\\"btn\\\" onclick=\\\"closeModal()\\\">取消</button><button class=\\\"btn btn-primary\\\" onclick=\\\"closeModal();logOperation(\\\\\'需求管理\\\\\',\\\\\'保存流程配置\\\\\',\\\\\'' + plan.id + '\\\\\',\\\\\'' + plan.title + '\\\\\',\\\\\'流程配置已保存\\\\\',null);toast(\\\\\'流程配置已保存\\\\\',\\\\\'success\\\\\')\\\">确认保存</button>\')">保存更改</button>'
      : '';

    body = (
      '<div class="card">' +
        '<div class="card-title">业务流程配置</div>' +
        '<div style="display:flex;gap:16px;margin-bottom:12px;flex-wrap:wrap;font-size:12px">' +
          '<span style="color:var(--success)"><span class="flow-lock locked">已锁定</span> 已完成</span>' +
          '<span style="color:var(--primary)"><span class="flow-lock locked">已锁定</span> 进行中（锁定）</span>' +
          '<span style="color:#999"><span class="flow-lock unlocked">未锁定</span> 未到达（可编辑）</span>' +
          '<span style="color:var(--warning)"><span class="flow-lock unlocked">未锁定</span> 退回解锁</span>' +
        '</div>' +
        '<div class="flow-diagram">' + nodesHtml + '</div>' +
        saveBtn +
      '</div>'
    );
  }

  /* ─ Tab 4: 需求评审（本批次所有需求评审任务汇总） ─ */
  else if (tab === 4) {
    const demandIds = (DATA.demands || [])
      .filter(function(d) { return d.collectionId === plan.id; })
      .map(function(d) { return d.id; });
    const reviewsInBatch = (DATA.reviews || []).filter(function(r) {
      return r.demandId && demandIds.indexOf(r.demandId) >= 0;
    });

    const reviewRows = reviewsInBatch.map(function(r) {
      const demand = (DATA.demands || []).find(function(d) { return d.id === r.demandId; }) || {};
      const linkable = ['passed','rejected','timeout-rejected'].indexOf(r.status) >= 0;
      const opBtn = linkable
        ? '<button class="btn btn-sm" onclick="navigate(\'review-launch\',{id:\'' + r.id + '\'})">查看评审结果</button>'
        : '<span style="color:var(--text-secondary);font-size:12px">进行中</span>';
      return '<tr>' +
        '<td>' + r.id + '</td>' +
        '<td>' + (demand.projectName || r.projectName || r.demandId) + '</td>' +
        '<td>' + (demand.unitId || '—') + '</td>' +
        '<td>' + (r.date || '—') + '</td>' +
        '<td>' + _reviewBadge(r) + '</td>' +
        '<td>' + opBtn + '</td>' +
      '</tr>';
    }).join('');

    body = (
      '<div class="card">' +
        '<div class="card-title">本批次需求评审任务（' + reviewsInBatch.length + ' 条）</div>' +
        '<div style="color:var(--text-secondary);font-size:12px;margin-bottom:12px">' +
          '领导在需求遴选前可在此汇总查看专家评审结论，辅助"支持 / 不支持"决策。' +
        '</div>' +
        '<table class="data-table"><thead><tr>' +
          '<th>评审编号</th><th>对应需求</th><th>申报单位</th><th>评审日期</th><th>状态 / 评分</th><th>操作</th>' +
        '</tr></thead><tbody>' +
        (reviewRows || '<tr><td colspan="6" style="text-align:center;padding:32px;color:var(--text-secondary)">本批次暂无需求评审任务</td></tr>') +
        '</tbody></table>' +
      '</div>'
    );
  }

  return (
    breadcrumb('首页', '需求管理', '需求征集', '征集详情') +
    '<div class="page-header" style="display:flex;align-items:center;gap:12px">' +
      '<div class="page-title">' + plan.title + '</div>' +
      _collectionStatusTag(plan.status) +
      actionBar +
    '</div>' +
    tabBar +
    body
  );
});


/* ════════════════════════════════════════════════════════════════
   4. demand-list — 需求管理列表
   ════════════════════════════════════════════════════════════════ */

function _demandStatusTag(status) {
  const map = {
    draft:           ['草稿',     'tag-gray'],
    submitted:       ['已提交',   'tag-blue'],
    sorted:          ['已排序',   'tag-cyan'],
    'unit-rejected': ['单位退回', 'tag-orange'],
    'unit-approved': ['单位审核通过', 'tag-green'],
    'in-selection':  ['遴选中',   'tag-purple'],
    supported:       ['遴选通过', 'tag-green'],
    'not-supported': ['不予支持', 'tag-red'],
  };
  const [label, cls] = map[status] || ['未知', 'tag-gray'];
  return '<span class="tag ' + cls + '">' + label + '</span>';
}

/* ── demand-list 状态 Badge 映射（DEM-07，UI-SPEC 视图 H Color 规则）── */
function _dlStatusBadge(status) {
  var map = {
    'draft':                     { cls: 'tag-gray',   text: '草稿' },
    'submitted':                 { cls: 'tag-orange', text: '已提交' },
    'unit-pending':              { cls: 'tag-orange', text: '待审批' },
    'unit-approved':             { cls: 'tag-green',  text: '待遴选' },
    'unit-rejected':             { cls: 'tag-red',    text: '已退回' },
    'sorted':                    { cls: 'tag-blue',   text: '已排序' },
    'in-selection':              { cls: 'tag-blue',   text: '遴选中' },
    'selection-pending-review':  { cls: 'tag-orange', text: '筛选结果待审核' },
    'supported':                 { cls: 'tag-green',  text: '已支持' },
    'not-supported':             { cls: 'tag-red',    text: '不支持' }
  };
  var m = map[status] || { cls: 'tag-gray', text: status };
  return '<span class="tag ' + m.cls + '">' + m.text + '</span>';
}

/* ── demand-list 操作列按角色 + 状态渲染（参考业务流程说明书-01-需求征集 §2）── */
function _dlOpBtns(role, d) {
  var id = d.id;
  var s = d.status;
  var view     = '<button class="btn btn-sm" onclick="navigate(\'demand-fill\',{id:\'' + id + '\'})">查看</button>';
  var edit     = '<button class="btn btn-sm btn-primary" onclick="navigate(\'demand-fill\',{id:\'' + id + '\'})">编辑</button>';
  var submit   = '<button class="btn btn-sm" onclick="toast(\'Demo：提交至单位管理员\',\'info\')">提交</button>';
  var del      = '<button class="btn btn-sm" onclick="toast(\'Demo：删除草稿\',\'info\')">删除</button>';
  var resubmit = '<button class="btn btn-sm" onclick="toast(\'Demo：重新提交\',\'info\')">重新提交</button>';
  var sortBtn  = '<button class="btn btn-sm" onclick="navigate(\'demand-sort\')">排序</button>';
  var submitToLeader = '<button class="btn btn-sm btn-primary" onclick="toast(\'Demo：提交单位领导审批\',\'info\')">提交审批</button>';
  var approve  = '<button class="btn btn-sm btn-primary" onclick="toast(\'Demo：审批通过\',\'info\')">通过</button>';
  var reject   = '<button class="btn btn-sm" onclick="toast(\'Demo：驳回\',\'info\')">驳回</button>';
  var selectBtn = '<button class="btn btn-sm btn-primary" onclick="navigate(\'demand-select\')">遴选</button>';

  if (role === 'project-manager') {
    if (s === 'draft')         return edit + ' ' + submit + ' ' + del;
    if (s === 'unit-rejected') return edit + ' ' + resubmit;
    return view;
  }
  if (role === 'unit-admin' || role === 'unit-sysadmin') {
    if (s === 'submitted') return sortBtn + ' ' + submitToLeader;
    if (s === 'sorted')    return submitToLeader;
    return view;
  }
  if (role === 'unit-leader') {
    if (s === 'unit-pending') return approve + ' ' + reject;
    return view;
  }
  if (role === 'info-admin') {
    if (s === 'in-selection') return selectBtn;
    return view;
  }
  if (role === 'info-leader') {
    if (s === 'selection-pending-review') return approve + ' ' + reject;
    return view;
  }
  // 专家等无操作角色显式只读兜底（非 else 滥用）
  return view;
}

/* ── demand-list 筛选状态（DEM-07，Claude's Discretion 允许简化逻辑）── */
function _dlSetFilter(key, val) {
  if (key === 'kw') window._dlKw = val;
  else if (key === 'unit') window._dlUnit = val;
  else if (key === 'status') window._dlStatus = val;
  renderView('demand-list');
}

registerView('demand-list', function() {
  var role = getCurrentRole();
  var kw     = window._dlKw     || '';
  var unit   = window._dlUnit   || 'all';
  var status = window._dlStatus || 'all';

  var demands = DATA.demands.slice();
  // 按筛选条件过滤（DEM-07，Claude's Discretion 允许 re-render 而非 DOM 操作）
  demands = demands.filter(function(d) {
    var dName = (d.name || d.projectName || '');
    var dSubmitter = (d.submitter || d.submittedBy || '');
    if (kw && dName.indexOf(kw) < 0 && dSubmitter.indexOf(kw) < 0) return false;
    if (unit !== 'all' && d.unitId !== unit) return false;
    if (status !== 'all' && d.status !== status) return false;
    return true;
  });

  var rows = demands.map(function(d) {
    var dName = d.name || d.projectName || '';
    var budget = d.budget || d.budgetEstimate || 0;
    var typeBadge = (typeof projectTypeTag === 'function' && typeof budgetToType === 'function')
      ? ' ' + projectTypeTag(budgetToType(budget).type || budgetToType(budget))
      : '';
    var priorityBadge = d.priority === '高' ? '<span class="tag tag-red">高</span>'
      : d.priority === '低' ? '<span class="tag tag-gray">低</span>'
      : (d.priority ? '<span class="tag tag-orange">中</span>' : '—');
    // 操作列按角色 + 状态区分（_dlOpBtns）
    var opBtns = _dlOpBtns(role, d);
    return '<tr>' +
      '<td><a onclick="navigate(\'demand-fill\',{id:\'' + d.id + '\'})" style="cursor:pointer">' + dName + '</a></td>' +
      '<td>' + (d.unitId || '—') + '</td>' +
      '<td>' + (d.submitter || d.submittedBy || '—') + '</td>' +
      '<td><b style="color:var(--primary)">' + budget + ' 万</b>' + typeBadge + '</td>' +
      '<td>' + priorityBadge + '</td>' +
      '<td>' + _dlStatusBadge(d.status) + '</td>' +
      '<td style="font-size:11px">' + (d.submitDate || d.createdAt || '—') + '</td>' +
      '<td style="white-space:nowrap">' + opBtns + '</td>' +
    '</tr>';
  }).join('');

  if (!rows) rows = '<tr><td colspan="8" style="text-align:center;padding:32px;color:var(--text-secondary)">暂无数据</td></tr>';

  return (
    breadcrumb('首页', '需求管理', '需求列表') +
    '<div class="page-header">' +
      '<div class="page-title">需求列表</div>' +
      (role === 'project-manager' ? '<button class="btn btn-primary" onclick="_dfStartNew()">新建一份需求</button>' : '') +
    '</div>' +
    '<div class="card" style="padding:12px 16px;margin-bottom:12px">' +
      '<div class="filter-bar" style="display:flex;flex-wrap:wrap;gap:8px;align-items:center">' +
        '<input class="form-control" id="dl-kw" placeholder="搜索项目名称或负责人" style="width:220px" oninput="_dlSetFilter(\'kw\',this.value)" value="' + kw + '">' +
        '<select class="form-control" id="dl-unit" style="width:140px" onchange="_dlSetFilter(\'unit\',this.value)">' +
          '<option value="all"' + (unit === 'all' ? ' selected' : '') + '>全部单位</option>' +
          '<option value="unit-edu"' + (unit === 'unit-edu' ? ' selected' : '') + '>教务处</option>' +
          '<option value="unit-sci"' + (unit === 'unit-sci' ? ' selected' : '') + '>科研处</option>' +
          '<option value="unit-stu"' + (unit === 'unit-stu' ? ' selected' : '') + '>学工处</option>' +
          '<option value="unit-hr"' + (unit === 'unit-hr' ? ' selected' : '') + '>人事处</option>' +
          '<option value="unit-lib"' + (unit === 'unit-lib' ? ' selected' : '') + '>图书馆</option>' +
          '<option value="unit-info"' + (unit === 'unit-info' ? ' selected' : '') + '>信息化办</option>' +
        '</select>' +
        '<select class="form-control" id="dl-status" style="width:140px" onchange="_dlSetFilter(\'status\',this.value)">' +
          '<option value="all"' + (status === 'all' ? ' selected' : '') + '>全部状态</option>' +
          '<option value="draft"' + (status === 'draft' ? ' selected' : '') + '>草稿</option>' +
          '<option value="submitted"' + (status === 'submitted' ? ' selected' : '') + '>已提交</option>' +
          '<option value="unit-pending"' + (status === 'unit-pending' ? ' selected' : '') + '>待审批</option>' +
          '<option value="unit-approved"' + (status === 'unit-approved' ? ' selected' : '') + '>待遴选</option>' +
          '<option value="unit-rejected"' + (status === 'unit-rejected' ? ' selected' : '') + '>已退回</option>' +
          '<option value="in-selection"' + (status === 'in-selection' ? ' selected' : '') + '>遴选中</option>' +
          '<option value="selection-pending-review"' + (status === 'selection-pending-review' ? ' selected' : '') + '>筛选结果待审核</option>' +
          '<option value="supported"' + (status === 'supported' ? ' selected' : '') + '>已支持</option>' +
          '<option value="not-supported"' + (status === 'not-supported' ? ' selected' : '') + '>不支持</option>' +
        '</select>' +
        '<button class="btn btn-sm" onclick="window._dlKw=\'\';window._dlUnit=\'all\';window._dlStatus=\'all\';renderView(\'demand-list\')">重置</button>' +
      '</div>' +
    '</div>' +
    '<div class="table-wrap">' +
      '<table class="data-table"><thead><tr>' +
        '<th>项目名称</th><th>所在单位</th><th>负责人</th><th>预算</th><th>优先级</th><th>状态</th><th>提交时间</th><th>操作</th>' +
      '</tr></thead>' +
      '<tbody>' + rows + '</tbody>' +
      '</table>' +
      '<div class="table-pagination"><span>共 ' + demands.length + ' 条</span></div>' +
    '</div>'
  );
});

window._demandSendNotice = function() {
  var checked = document.querySelectorAll('.demand-checkbox:checked');
  if (!checked.length) { toast('请先勾选需要发送通知的需求', 'warning'); return; }
  var created = 0;
  checked.forEach(function(cb) {
    var demandId = cb.value;
    var demand = DATA.demands.find(function(d) { return d.id === demandId; });
    if (!demand) return;
    var exists = DATA.proposals.some(function(p) { return p.demandId === demandId; });
    if (exists) return;
    var newId = 'PR' + String(DATA.proposals.length + 1).padStart(3, '0');
    DATA.proposals.push({
      id: newId,
      demandId: demandId,
      projectName: demand.projectName,
      unit: demand.unitId,
      budget: demand.budgetEstimate,
      manager: demand.submittedBy,
      contact: demand.contactPhone || '',
      email: demand.contactEmail || '',
      status: '草稿',
      submittedAt: null,
      deadline: null,
      reviewPath: null,
      reviewRound: 1,
      goal: '',
      techPlan: '',
      buildContent: '',
      securityPlan: '',
      budgetSoftware: 0,
      budgetHardware: 0,
      budgetService: 0,
      budgetOps: 0,
    });
    created++;
  });
  logOperation('需求管理', '发送立项申报通知', 'BATCH', '批量发送', '共 ' + checked.length + ' 条，自动创建 ' + created + ' 个草稿项目', null);
  toast('已发送通知并自动创建 ' + created + ' 个草稿项目，请在「立项管理」中查看', 'success');
};


/* ════════════════════════════════════════════════════════════════
   5. demand-fill — 需求申请表 四步向导 (D-05~D-08)
   ════════════════════════════════════════════════════════════════ */

if (typeof window._demandFormData === 'undefined') window._demandFormData = {};

registerView('demand-fill', function() {
  // 草稿恢复：仅在 _demandFormData 为空时恢复（D-06）
  if (!window._demandFormData || Object.keys(window._demandFormData).length === 0) {
    window._demandFormData = loadDraft('demand-fill') || {};
  }

  var d = window._demandFormData;

  // 从 demandUsers 自动查询项目负责人信息
  var pmUser = (DATA.demandUsers || []).find(function(u) {
    return u.roles && u.roles.indexOf('project-manager') >= 0 && u.empNo === '50240014';
  }) || {};
  var leaderName = pmUser.name ? pmUser.name + ' ' + pmUser.empNo : '王一凡 50240014';
  var unitMap = {'unit-edu':'教务处','unit-enroll':'招生处','unit-research':'科研处','unit-student':'学工处','unit-office':'党政办','unit-lib':'图书馆','unit-info':'信息化办','unit-assets':'资产处'};
  var unitName = unitMap[pmUser.unitId] || '教务处';

  var budgetVal = d.budget || '';
  var applyDate = d.applyDate || new Date().toISOString().slice(0, 10);
  var summaryLen = (d.summary || '').length;

  // ── Section Title Helper（带 Lucide 图标） ──
  var sectionTitle = function(lucideIcon, color, text) {
    return '<div style="display:flex;align-items:center;gap:10px;margin:20px 0 14px">' +
      '<i data-lucide="' + lucideIcon + '" style="width:18px;height:18px;color:' + color.fg + ';flex-shrink:0"></i>' +
      '<div style="font-size:15px;font-weight:600;color:var(--text-primary)">' + text + '</div>' +
    '</div>';
  };

  // ── Section 1: 项目基本信息 ──
  var section1 =
    sectionTitle('clipboard-list', {bg:'#d6eaf8', fg:'#1a5276'}, '一、项目基本信息') +
    '<div class="form-grid">' +
      '<div class="form-item span-2">' +
        '<label class="form-label">项目名称 <span class="req">*</span>' +
          '<span class="tooltip-icon" data-tip="建议格式：[单位简称]+[系统/平台名称]，不超过60字" style="cursor:help;margin-left:4px;color:var(--text-secondary)">?</span>' +
        '</label>' +
        '<input class="form-control" id="df-name" placeholder="请输入项目名称（建议不超过60字）" value="' + (d.name || '') + '" maxlength="60">' +
      '</div>' +
      '<div class="form-item">' +
        '<label class="form-label">预期投入金额（万元）<span class="req">*</span>' +
          '<span class="tooltip-icon" data-tip="100万元以下为小型，100-500万为中型，500万以上为重大项目" style="cursor:help;margin-left:4px;color:var(--text-secondary)">?</span>' +
        '</label>' +
        '<div style="display:flex;gap:8px;align-items:center">' +
          '<input class="form-control" id="df-budget" type="number" placeholder="请输入金额（万元）" value="' + budgetVal + '" oninput="_dfUpdateTypeBadge()" style="flex:1">' +
          '<span id="df-budget-badge">' + (budgetVal ? projectTypeTag(budgetToType(+budgetVal).type) : '') + '</span>' +
        '</div>' +
      '</div>' +
      '<div class="form-item">' +
        '<label class="form-label">申请日期 <span class="req">*</span></label>' +
        '<input class="form-control" id="df-date" type="date" value="' + applyDate + '">' +
      '</div>' +
      '<div class="form-item">' +
        '<label class="form-label">与现有系统的关系</label>' +
        '<select class="form-control" id="df-relation">' +
          ['全新建设','功能扩展','系统替换'].map(function(v) {
            return '<option value="' + v + '"' + (d.relation === v ? ' selected' : '') + '>' + v + '</option>';
          }).join('') +
        '</select>' +
      '</div>' +
    '</div>';

  // ── Section 2: 申请单位信息 ──
  var section2 =
    sectionTitle('building-2', {bg:'#fdebd0', fg:'#b9770e'}, '二、申请单位信息') +
    '<div class="form-grid">' +
      '<div class="form-item span-2">' +
        '<label class="form-label">项目用户单位名称</label>' +
        '<input class="form-control" id="df-unit" value="' + unitName + '" readonly>' +
      '</div>' +
      '<div class="form-item">' +
        '<label class="form-label">单位负责人 <span class="req">*</span></label>' +
        '<input class="form-control" id="df-unit-leader" placeholder="请输入单位负责人姓名" value="' + (d.unitLeader || '') + '">' +
      '</div>' +
      '<div class="form-item">' +
        '<label class="form-label">单位负责人联系方式 <span class="req">*</span></label>' +
        '<input class="form-control" id="df-unit-leader-phone" placeholder="手机号码" value="' + (d.unitLeaderPhone || '') + '">' +
      '</div>' +
      '<div class="form-item">' +
        '<label class="form-label">项目联系人</label>' +
        '<input class="form-control" id="df-leader" value="' + leaderName + '" readonly>' +
      '</div>' +
      '<div class="form-item">' +
        '<label class="form-label">联系人联系方式 <span class="req">*</span></label>' +
        '<input class="form-control" id="df-contact" placeholder="请输入联系电话或邮箱" value="' + (d.contact || '') + '">' +
      '</div>' +
    '</div>';

  // ── Section 3: 项目概述与建设需求 ──
  var tagsByCategory = {};
  (DATA.tagLibrary || []).forEach(function(t) {
    if (!tagsByCategory[t.category]) tagsByCategory[t.category] = [];
    tagsByCategory[t.category].push(t);
  });
  var tagHtml = Object.keys(tagsByCategory).map(function(cat) {
    return '<div style="margin-bottom:10px">' +
      '<h4 style="font-size:12px;font-weight:600;color:var(--text-secondary);margin:0 0 6px 0">' + cat + '</h4>' +
      '<div style="display:flex;flex-wrap:wrap;gap:6px">' +
      tagsByCategory[cat].map(function(t) {
        var checked = d.tags && d.tags.some(function(x) { return x.id === t.id; });
        return '<label style="display:flex;align-items:center;gap:4px;padding:3px 8px;background:#f4f4f5;border-radius:4px;cursor:pointer;font-size:13px">' +
          '<input type="checkbox" class="df-tag" value="' + t.id + '" data-cat="' + t.category + '" data-name="' + t.name + '"' + (checked ? ' checked' : '') + '>' +
          t.name +
        '</label>';
      }).join('') +
      '</div></div>';
  }).join('');

  var section3 =
    sectionTitle('file-text', {bg:'#d5f5e3', fg:'#1e8449'}, '三、项目概述及建设需求') +
    '<div class="form-grid">' +
      '<div class="form-item span-2">' +
        '<label class="form-label">摘要 <span class="req">*</span>' +
          '<span class="tooltip-icon" data-tip="用2~3句话描述需求核心价值和预期效果，不超过200字，将作为遴选摘要展示给信息办" style="cursor:help;margin-left:4px;color:var(--text-secondary)">?</span>' +
        '</label>' +
        '<textarea class="form-control" id="df-summary" rows="3" maxlength="200" placeholder="请简要描述需求核心价值和预期效果（不超过200字）..." oninput="var c=document.getElementById(\'df-summary-count\');if(c)c.textContent=this.value.length+\'/200\'">' + (d.summary || '') + '</textarea>' +
        '<div style="text-align:right;font-size:11px;color:var(--text-secondary);margin-top:2px"><span id="df-summary-count">' + summaryLen + '/200</span></div>' +
      '</div>' +
      '<div class="form-item span-2">' +
        '<label class="form-label">需求描述 <span class="req">*</span></label>' +
        // 填写引导面板
        '<div style="background:linear-gradient(135deg,#f0f7ee 0%,#f6faf4 100%);border:1px solid #d5e8cf;border-radius:6px;padding:14px 16px;margin-bottom:10px">' +
          '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">' +
            '<div style="font-size:13px;font-weight:600;color:#2d6a1e;display:flex;align-items:center;gap:6px"><i data-lucide="lightbulb" style="width:14px;height:14px"></i>填写引导 — 不知道怎么写？按以下几个方面逐条描述即可</div>' +
            '<button type="button" onclick="_dfToggleExample()" id="df-guide-toggle" style="font-size:11px;color:var(--primary);background:none;border:none;cursor:pointer;text-decoration:underline;padding:0">查看填写范例 ↓</button>' +
          '</div>' +
          '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">' +
            [
              {n:1, t:'现状与痛点', h:'目前工作中遇到了什么问题？', eg:'目前 XX 业务仍使用纸质审批，流转慢、易丢失'},
              {n:2, t:'期望目标',   h:'希望通过信息化系统达到什么效果？', eg:'实现线上审批，缩短流程至 2 个工作日内'},
              {n:3, t:'主要使用场景', h:'谁来用？在什么场景下使用？', eg:'各学院教师提交、学院审批、信息办汇总'},
              {n:4, t:'涉及范围与规模', h:'覆盖多少人/单位？有无对接需求？', eg:'覆盖全校 30+ 二级单位，需对接统一身份认证'}
            ].map(function(g) {
              return '<div style="display:flex;align-items:flex-start;gap:8px;background:#fff;border:1px solid #e2eddc;border-radius:6px;padding:10px 12px">' +
                '<div style="width:20px;height:20px;border-radius:50%;background:#e8f5e2;color:#2d6a1e;font-size:11px;font-weight:700;display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:1px">' + g.n + '</div>' +
                '<div style="flex:1">' +
                  '<div style="font-size:12px;font-weight:600;color:var(--text-primary);margin-bottom:2px">' + g.t + '</div>' +
                  '<div style="font-size:11px;color:var(--text-secondary);line-height:1.5">' + g.h + '<br>例如：<em style="font-style:normal;color:#5a9a48">"' + g.eg + '"</em></div>' +
                '</div>' +
              '</div>';
            }).join('') +
          '</div>' +
          '<div id="df-guide-example" style="display:none;margin-top:10px;border-top:1px dashed #cde0c5;padding-top:12px">' +
            '<div style="font-size:11px;font-weight:600;color:#2d6a1e;margin-bottom:6px;display:flex;align-items:center;gap:4px"><i data-lucide="book-open" style="width:12px;height:12px"></i>填写范例（可直接引用修改）</div>' +
            '<div style="font-size:12px;color:var(--text-primary);line-height:1.7;background:#fff;border:1px solid #e2eddc;border-radius:6px;padding:12px 14px">' +
              '<div style="margin-bottom:6px"><b style="color:#2d6a1e">【现状与痛点】</b>目前全校各单位的信息化建设需求通过纸质申请表提交，存在以下问题：表单填写不规范，关键信息缺失率高；纸质流转周期长（平均 7-10 个工作日）；历史需求无法检索和统计分析。</div>' +
              '<div style="margin-bottom:6px"><b style="color:#2d6a1e">【期望目标】</b>建设线上需求征集与管理系统，实现需求在线提交、自动校验、流程审批和数据统计，将需求提交到立项评审的周期缩短至 3 个工作日以内。</div>' +
              '<div style="margin-bottom:6px"><b style="color:#2d6a1e">【主要使用场景】</b>二级单位联系人在线填报需求 → 单位负责人线上审批 → 信息办统一受理、组织专家评审 → 反馈评审结果并跟踪实施。</div>' +
              '<div><b style="color:#2d6a1e">【涉及范围与规模】</b>覆盖全校 35 个二级单位，约 200 名填报和审批用户；系统需对接学校统一身份认证平台和 OA 消息通知接口。</div>' +
            '</div>' +
            '<button type="button" onclick="_dfUseExample()" style="margin-top:8px;padding:5px 14px;border-radius:4px;border:1px solid #b5d4a8;background:#f0f7ee;color:#2d6a1e;font-size:11px;font-weight:500;cursor:pointer;display:inline-flex;align-items:center;gap:4px"><i data-lucide="pen-line" style="width:11px;height:11px"></i>引用此范例到输入框</button>' +
          '</div>' +
        '</div>' +
        '<textarea class="form-control" id="df-desc" rows="6" placeholder="请参考上方引导，分条描述您的需求。如不确定如何表述，可点击「查看填写范例」参考后修改。">' + (d.desc || '') + '</textarea>' +
        '<div style="font-size:12px;color:var(--text-secondary);margin-top:4px">提示：尽量用日常工作语言描述即可，不需要使用专业技术术语，信息办会协助您细化技术方案。</div>' +
      '</div>' +
      '<div class="form-item">' +
        '<label class="form-label">优先级</label>' +
        '<div style="display:flex;gap:16px;align-items:center;padding:8px 0">' +
          ['高','中','低'].map(function(p) {
            return '<label style="display:flex;align-items:center;gap:4px;cursor:pointer">' +
              '<input type="radio" name="df-priority" value="' + p + '"' + (d.priority === p || (!d.priority && p === '中') ? ' checked' : '') + '>' +
              p + '优先级' +
            '</label>';
          }).join('') +
        '</div>' +
      '</div>' +
      '<div class="form-item span-2">' +
        '<label class="form-label">技术方案描述（选填）</label>' +
        '<textarea class="form-control" id="df-tech" rows="3" placeholder="请描述技术实现方案、采用的主要技术框架等...">' + (d.tech || '') + '</textarea>' +
      '</div>' +
      '<div class="form-item span-2">' +
        '<label class="form-label">标签选择' +
          '<span class="tooltip-icon" data-tip="标签来自标签库，将用于需求分类汇总和遴选参考，可多选" style="cursor:help;margin-left:4px;color:var(--text-secondary)">?</span>' +
        '</label>' +
        (tagHtml || '<div style="color:var(--text-secondary);font-size:13px">暂无可用标签，请先在标签库中添加</div>') +
      '</div>' +
      '<div class="form-item span-2">' +
        '<label class="form-label">附件材料（选填）</label>' +
        '<input class="form-control" id="df-files" type="file" multiple>' +
        '<div style="margin-top:6px;padding:8px 12px;background:#fffbe6;border:1px solid #ffe58f;border-radius:4px;font-size:12px;color:#ad6800">' +
          'Demo 说明：仅展示文件上传控件，不做真实文件上传和内容自动识别填充。' +
        '</div>' +
      '</div>' +
      '<div class="form-item span-2">' +
        '<label class="form-label">备注说明（选填）</label>' +
        '<textarea class="form-control" id="df-remark" rows="3" placeholder="其他需要补充说明的内容...">' + (d.remark || '') + '</textarea>' +
      '</div>' +
    '</div>';

  // ── Import Toolbar（模板文件导入） ──
  var toolbar =
    '<div class="card" style="margin-top:16px;padding:12px 20px;display:flex;align-items:center;justify-content:space-between;gap:12px;border-left:3px solid var(--primary)">' +
      '<div style="display:flex;align-items:center;gap:10px;font-size:13px;color:var(--text-secondary)">' +
        '<i data-lucide="file-up" style="width:16px;height:16px;color:var(--primary);flex-shrink:0"></i>' +
        '<span>支持通过模板文件快速导入，自动识别并填充表单字段</span>' +
      '</div>' +
      '<div style="display:flex;align-items:center;gap:8px">' +
        '<button class="btn btn-sm" onclick="_dfDownloadTemplate()" style="display:inline-flex;align-items:center;gap:4px"><i data-lucide="download" style="width:13px;height:13px"></i>下载模板</button>' +
        '<button class="btn btn-sm btn-primary" onclick="_dfOpenImport()" style="display:inline-flex;align-items:center;gap:4px"><i data-lucide="upload" style="width:13px;height:13px"></i>文件导入</button>' +
      '</div>' +
    '</div>';

  // ── 4 步流程进度条 ──
  var stepLabels = ['填写申请', '单位审批', '信息办审核', '立项完成'];
  var progress =
    '<div class="card" style="margin-top:12px;padding:16px 24px">' +
      '<div style="display:flex;align-items:center;gap:4px">' +
        stepLabels.map(function(label, i) {
          var active = i === 0;
          var numStyle = active
            ? 'border:2px solid var(--primary);background:var(--primary);color:#fff'
            : 'border:2px solid var(--border);background:#fff;color:var(--text-secondary)';
          var labelStyle = active
            ? 'color:var(--primary);font-weight:500'
            : 'color:var(--text-secondary)';
          var connector = (i < stepLabels.length - 1)
            ? '<div style="flex:1;height:2px;background:var(--border);margin:0 8px;border-radius:1px"></div>'
            : '';
          return '<div style="display:flex;align-items:center;gap:8px;flex:' + (i < stepLabels.length - 1 ? '1' : '0 0 auto') + '">' +
            '<div style="width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:600;flex-shrink:0;' + numStyle + '">' + (i + 1) + '</div>' +
            '<span style="font-size:13px;white-space:nowrap;' + labelStyle + '">' + label + '</span>' +
          '</div>' + connector;
        }).join('') +
      '</div>' +
    '</div>';

  return (
    breadcrumb('首页', '需求管理', '需求申请表') +
    '<div class="page-header"><div class="page-title">信息化项目建设需求申请</div><div style="font-size:13px;color:var(--text-secondary);margin-top:4px">请填写以下信息提交项目建设需求，信息办将统一审核</div></div>' +
    progress +
    toolbar +
    '<div class="card" style="margin-top:16px">' +
      section1 +
      section2 +
      section3 +
      '<div class="form-footer" style="gap:8px;justify-content:flex-end;padding-top:16px;border-top:1px solid var(--border);margin-top:16px">' +
        '<button class="btn" onclick="_dfSaveDraft()">暂存草稿</button>' +
        '<button class="btn btn-primary" onclick="_dfSubmit()">提交申请</button>' +
      '</div>' +
    '</div>'
  );
});

// ── demand-fill 配套函数 ──────────────────────────────────────────

window._val = function(id) { var el = document.getElementById(id); return el ? el.value : ''; };

window._dfCaptureAll = function() {
  var d = window._demandFormData;
  d.name            = window._val('df-name');
  d.budget          = window._val('df-budget');
  d.applyDate       = window._val('df-date');
  d.relation        = window._val('df-relation');
  d.unitLeader      = window._val('df-unit-leader');
  d.unitLeaderPhone = window._val('df-unit-leader-phone');
  d.contact         = window._val('df-contact');
  d.summary         = window._val('df-summary');
  d.desc            = window._val('df-desc');
  var pr = document.querySelector('input[name="df-priority"]:checked');
  d.priority = pr ? pr.value : '中';
  d.tech = window._val('df-tech');
  var checkedTags = document.querySelectorAll('.df-tag:checked');
  d.tags = Array.prototype.map.call(checkedTags, function(el) {
    return { id: el.value, category: el.dataset.cat, name: el.dataset.name };
  });
  d.remark = window._val('df-remark');
};

window._dfSaveDraft = function() {
  window._dfCaptureAll();
  saveDraft('demand-fill', window._demandFormData);
  toast('草稿已保存', 'success');
};

window._dfToggleExample = function() {
  var box = document.getElementById('df-guide-example');
  var btn = document.getElementById('df-guide-toggle');
  if (!box || !btn) return;
  var isOpen = box.style.display !== 'none';
  box.style.display = isOpen ? 'none' : 'block';
  btn.textContent = isOpen ? '查看填写范例 ↓' : '收起填写范例 ↑';
};

window._dfUseExample = function() {
  var ta = document.getElementById('df-desc');
  if (!ta) return;
  ta.value =
    '【现状与痛点】目前全校各单位的信息化建设需求通过纸质申请表提交，存在以下问题：表单填写不规范，关键信息缺失率高；纸质流转周期长（平均 7-10 个工作日）；历史需求无法检索和统计分析。\n\n' +
    '【期望目标】建设线上需求征集与管理系统，实现需求在线提交、自动校验、流程审批和数据统计，将需求提交到立项评审的周期缩短至 3 个工作日以内。\n\n' +
    '【主要使用场景】二级单位联系人在线填报需求 → 单位负责人线上审批 → 信息办统一受理、组织专家评审 → 反馈评审结果并跟踪实施。\n\n' +
    '【涉及范围与规模】覆盖全校 35 个二级单位，约 200 名填报和审批用户；系统需对接学校统一身份认证平台和 OA 消息通知接口。';
  ta.focus();
  toast('已引用范例，请按实际情况修改', 'success');
};

window._dfSubmit = function() {
  window._dfCaptureAll();
  var d = window._demandFormData;
  if (!d.name)            { toast('请填写「项目名称」', 'error'); return; }
  if (!d.budget)          { toast('请填写「预期投入金额」', 'error'); return; }
  if (Number(d.budget) < 0) { toast('预期投入金额不能为负值', 'error'); return; }
  if (!d.applyDate)       { toast('请选择「申请日期」', 'error'); return; }
  if (!d.unitLeader)      { toast('请填写「单位负责人」', 'error'); return; }
  if (!d.unitLeaderPhone) { toast('请填写「单位负责人联系方式」', 'error'); return; }
  if (!d.contact)         { toast('请填写「联系人联系方式」', 'error'); return; }
  if (!d.summary)         { toast('请填写「摘要」', 'error'); return; }
  if (!d.desc)            { toast('请填写「需求描述」', 'error'); return; }

  var pmUser = (DATA.demandUsers || []).find(function(u) {
    return u.roles && u.roles.indexOf('project-manager') >= 0 && u.empNo === '50240014';
  }) || {};
  var demand = {
    id:          'dm-' + Date.now(),
    name:        d.name,
    projectName: d.name,
    unitId:      pmUser.unitId || 'unit-edu',
    collectionId: (DATA.collectionPlans && DATA.collectionPlans[0] && DATA.collectionPlans[0].id) || 'CP001',
    submitterId:  pmUser.id || 'u-wangyifan',
    submittedBy:  (pmUser.name && pmUser.empNo) ? pmUser.name + ' ' + pmUser.empNo : '王一凡 50240014',
    submitter:    (pmUser.name && pmUser.empNo) ? pmUser.name + ' ' + pmUser.empNo : '王一凡 50240014',
    summary:      d.summary,
    description:  d.desc,
    budgetEstimate: Number(d.budget) || 0,
    budget:       Number(d.budget) || 0,
    priority:     d.priority || '中',
    tech:         d.tech || '',
    tags:         d.tags || [],
    relation:     d.relation || '',
    remark:       d.remark || '',
    unitLeader:      d.unitLeader || '',
    unitLeaderPhone: d.unitLeaderPhone || '',
    applyDate:    d.applyDate || '',
    status:       'submitted',
    sortOrder:    999,
    submitDate:   new Date().toISOString().slice(0, 10),
    createdAt:    new Date().toISOString().slice(0, 10)
  };
  if (!Array.isArray(DATA.demands)) DATA.demands = [];
  DATA.demands.unshift(demand);
  logOperation('demand-fill', '提交', demand.name);  // T-03-04 mitigate
  clearDraft('demand-fill');
  window._demandFormData = {};   // T-03-03 mitigate
  toast('需求已提交，等待单位系统管理员处理', 'success');
  navigate('demand-list');
};

window._dfUpdateTypeBadge = function() {
  var v = Number(window._val('df-budget')) || 0;
  var el = document.getElementById('df-budget-badge');
  if (el) {
    el.innerHTML = v > 0 ? projectTypeTag(budgetToType(v).type) : '';
  }
};

window._dfStartNew = function() {
  window._demandFormData = {};   // T-03-03 mitigate
  clearDraft('demand-fill');
  navigate('demand-fill');
};

/* ── 模板文件导入（import wizard） ─────────────────────────────── */

window._DF_IMP_DEMO = {
  name: '智慧校园一卡通升级改造项目',
  budget: '186.5',
  date: '2026-04-15',
  unit: '信息化建设办公室',
  head: '张明远',
  headtel: '13812345678',
  contact: '李思然',
  contacttel: '13987654321',
  desc: '为满足学校智慧校园建设总体规划要求，拟对现有一卡通系统进行全面升级改造。主要建设内容包括：\n1. 核心平台升级至云架构，支持多校区统一管理；\n2. 新增移动支付（微信/支付宝）和数字人民币支付通道；\n3. 部署人脸识别终端，覆盖食堂、图书馆、门禁等场景；\n4. 建设数据分析平台，实现消费行为分析和异常预警。\n预计覆盖全校 4 万余名师生，项目建设周期 12 个月。'
};

window._dfInjectImportStyle = function() {
  if (document.getElementById('df-imp-style')) return;
  var css =
    '.df-imp-drop{border:2px dashed var(--border);border-radius:8px;padding:36px 24px;text-align:center;cursor:pointer;transition:all .2s;background:var(--bg-layout)}' +
    '.df-imp-drop:hover,.df-imp-drop.dragover{border-color:var(--primary);background:#f0f7ff}' +
    '.df-imp-drop .di{font-size:40px;opacity:.5;margin-bottom:10px}' +
    '.df-imp-drop h4{font-size:14px;font-weight:500;margin:0 0 4px 0}' +
    '.df-imp-drop p{font-size:12px;color:var(--text-secondary);margin:2px 0}' +
    '.df-imp-drop .bl{color:var(--primary);text-decoration:underline}' +
    '.df-imp-fileinfo{display:flex;align-items:center;gap:12px;padding:10px 14px;background:#f8faf8;border:1px solid #d5f5e3;border-radius:6px;margin-bottom:14px}' +
    '.df-imp-fileinfo .ic{font-size:20px}' +
    '.df-imp-fileinfo .nm{font-size:13px;font-weight:500}' +
    '.df-imp-fileinfo .sz{font-size:11px;color:var(--text-secondary)}' +
    '.df-imp-step{display:flex;align-items:flex-start;gap:12px;padding:10px 0;position:relative}' +
    '.df-imp-step:not(:last-child)::after{content:"";position:absolute;left:15px;top:40px;bottom:0;width:2px;background:#eee}' +
    '.df-imp-dot{width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:600;flex-shrink:0;position:relative;z-index:1}' +
    '.df-imp-dot.pending{background:#f0f0f0;color:#bbb}' +
    '.df-imp-dot.running{background:#d6eaf8;color:var(--primary)}' +
    '.df-imp-dot.running::after{content:"";position:absolute;inset:-3px;border-radius:50%;border:2px solid transparent;border-top-color:var(--primary);animation:dfImpSpin .8s linear infinite}' +
    '.df-imp-dot.pass{background:#d5f5e3;color:var(--success)}' +
    '.df-imp-dot.fail{background:#fce4e4;color:var(--danger)}' +
    '@keyframes dfImpSpin{to{transform:rotate(360deg)}}' +
    '.df-imp-info{flex:1;padding-top:5px}' +
    '.df-imp-info .vt{font-size:13px;font-weight:500;margin-bottom:2px}' +
    '.df-imp-info .vd{font-size:12px;color:var(--text-secondary)}' +
    '.df-imp-info .ve{display:none;font-size:12px;color:var(--danger);margin-top:6px;background:#fef5f5;padding:8px 12px;border-radius:4px;border-left:3px solid var(--danger);line-height:1.6}' +
    '.df-imp-info .ve.active{display:block}' +
    '.df-imp-preview{display:none;margin-top:14px;background:#f8faf8;border:1px solid #d5f5e3;border-radius:6px;padding:14px 16px}' +
    '.df-imp-preview.active{display:block}' +
    '.df-imp-preview h4{font-size:13px;font-weight:600;color:var(--success);margin:0 0 10px 0}' +
    '.df-imp-preview .fi{display:flex;gap:8px;padding:4px 0;font-size:12px;border-bottom:1px dashed #e8f5e8}' +
    '.df-imp-preview .fi:last-child{border-bottom:none}' +
    '.df-imp-preview .fl{color:var(--text-secondary);min-width:84px}' +
    '.df-imp-preview .fv{color:var(--text);font-weight:500;word-break:break-all}' +
    '@keyframes dfFieldFlash{0%{background:#c8f7d5;box-shadow:0 0 0 3px rgba(39,174,96,.2)}100%{background:var(--bg-layout);box-shadow:none}}' +
    '.df-field-flash{animation:dfFieldFlash 1.6s ease forwards}';
  var el = document.createElement('style');
  el.id = 'df-imp-style';
  el.textContent = css;
  document.head.appendChild(el);
};

window._dfDownloadTemplate = function() {
  toast('Demo：正在下载《西南大学信息化项目建设需求申请表.docx》', 'info');
};

window._dfOpenImport = function() {
  window._dfInjectImportStyle();
  var body =
    '<div id="df-imp-upload">' +
      '<div class="df-imp-drop" id="df-imp-drop">' +
        '<div class="di">📂</div>' +
        '<h4>选择模板文件</h4>' +
        '<p>拖拽文件到此处，或 <span class="bl">点击浏览</span></p>' +
        '<p style="font-size:11px;color:#bbb;margin-top:6px">仅支持《西南大学信息化项目建设需求申请表》模板（.docx / .doc）</p>' +
      '</div>' +
      '<input type="file" id="df-imp-file" style="display:none" accept=".doc,.docx,.pdf,.xlsx,.txt">' +
    '</div>' +
    '<div id="df-imp-validate" style="display:none">' +
      '<div class="df-imp-fileinfo"><div class="ic">📄</div><div style="flex:1"><div class="nm" id="df-imp-fname">—</div><div class="sz" id="df-imp-fsize">—</div></div></div>' +
      '<div class="df-imp-step"><div class="df-imp-dot pending" id="df-imp-d1">①</div><div class="df-imp-info"><div class="vt">文件格式校验</div><div class="vd">检查文件类型是否为支持的 .docx / .doc 格式</div><div class="ve" id="df-imp-e1"></div></div></div>' +
      '<div class="df-imp-step"><div class="df-imp-dot pending" id="df-imp-d2">②</div><div class="df-imp-info"><div class="vt">模板结构识别</div><div class="vd">校验表格结构是否符合标准《建设需求申请表》模板</div><div class="ve" id="df-imp-e2"></div></div></div>' +
      '<div class="df-imp-step"><div class="df-imp-dot pending" id="df-imp-d3">③</div><div class="df-imp-info"><div class="vt">字段内容提取</div><div class="vd">读取模板中已填写的各项字段数据</div></div></div>' +
      '<div class="df-imp-step"><div class="df-imp-dot pending" id="df-imp-d4">④</div><div class="df-imp-info"><div class="vt">数据映射就绪</div><div class="vd">将提取内容映射到表单对应字段，准备自动填入</div></div></div>' +
      '<div class="df-imp-preview" id="df-imp-preview">' +
        '<h4>✓ 识别完成 — 以下内容将自动填入表单</h4>' +
        '<div class="fi"><span class="fl">项目名称</span><span class="fv" id="df-imp-pv-name">—</span></div>' +
        '<div class="fi"><span class="fl">项目预算</span><span class="fv" id="df-imp-pv-budget">—</span></div>' +
        '<div class="fi"><span class="fl">申请日期</span><span class="fv" id="df-imp-pv-date">—</span></div>' +
        '<div class="fi"><span class="fl">单位负责人</span><span class="fv" id="df-imp-pv-head">—</span></div>' +
        '<div class="fi"><span class="fl">负责人电话</span><span class="fv" id="df-imp-pv-headtel">—</span></div>' +
        '<div class="fi"><span class="fl">联系人电话</span><span class="fv" id="df-imp-pv-contacttel">—</span></div>' +
        '<div class="fi"><span class="fl">需求描述</span><span class="fv" id="df-imp-pv-desc">—</span></div>' +
      '</div>' +
    '</div>';
  var footer =
    '<button class="btn" onclick="closeModal()">取消</button>' +
    '<button class="btn btn-primary" id="df-imp-ok" disabled onclick="_dfConfirmFill()">确认填入</button>';
  showModal('📄 导入申请表文件', body, footer);
  window._dfImpValid = false;

  var drop = document.getElementById('df-imp-drop');
  var inp = document.getElementById('df-imp-file');
  drop.onclick = function() { inp.click(); };
  drop.ondragover = function(e) { e.preventDefault(); drop.classList.add('dragover'); };
  drop.ondragleave = function() { drop.classList.remove('dragover'); };
  drop.ondrop = function(e) {
    e.preventDefault(); drop.classList.remove('dragover');
    if (e.dataTransfer.files[0]) window._dfHandleImportFile(e.dataTransfer.files[0]);
  };
  inp.onchange = function() {
    if (inp.files[0]) window._dfHandleImportFile(inp.files[0]);
  };
};

window._dfHandleImportFile = function(file) {
  var ext = file.name.split('.').pop().toLowerCase();
  var sizeKB = (file.size / 1024).toFixed(1);
  document.getElementById('df-imp-upload').style.display = 'none';
  document.getElementById('df-imp-validate').style.display = 'block';
  document.getElementById('df-imp-fname').textContent = file.name;
  document.getElementById('df-imp-fsize').textContent = sizeKB + ' KB';
  var isDocx = (ext === 'docx' || ext === 'doc');
  var looksLikeTemplate = file.name.indexOf('申请') >= 0 || file.name.indexOf('需求') >= 0;
  window._dfRunImportValidation(isDocx, looksLikeTemplate);
};

window._dfRunImportValidation = function(isDocx, looksLikeTemplate) {
  var pass = function(id) {
    var el = document.getElementById(id);
    if (el) { el.className = 'df-imp-dot pass'; el.textContent = '✓'; }
  };
  var fail = function(id, eid, msg) {
    var el = document.getElementById(id);
    if (el) { el.className = 'df-imp-dot fail'; el.textContent = '✗'; }
    var ev = document.getElementById(eid);
    if (ev) { ev.innerHTML = msg; ev.classList.add('active'); }
    var ft = document.querySelector('.modal-footer');
    if (ft) {
      ft.innerHTML =
        '<button class="btn" onclick="closeModal()">关闭</button>' +
        '<button class="btn btn-warning" onclick="_dfOpenImport()">🔄 重新选择文件</button>';
    }
  };
  setTimeout(function() { var el = document.getElementById('df-imp-d1'); if (el) el.className = 'df-imp-dot running'; }, 250);
  setTimeout(function() {
    if (!isDocx) { fail('df-imp-d1', 'df-imp-e1', '文件格式不正确。系统仅支持 <b>.docx / .doc</b> 格式的模板文件。<br>请下载标准模板填写后重新导入。'); return; }
    pass('df-imp-d1');
    setTimeout(function() { var el = document.getElementById('df-imp-d2'); if (el) el.className = 'df-imp-dot running'; }, 200);
    setTimeout(function() {
      if (!looksLikeTemplate) { fail('df-imp-d2', 'df-imp-e2', '模板结构校验失败。未识别到标准《西南大学信息化项目建设需求申请表》的表格结构。<br>请确保上传的是通过 <b>"下载模板"</b> 获取的标准文件。'); return; }
      pass('df-imp-d2');
      setTimeout(function() { var el = document.getElementById('df-imp-d3'); if (el) el.className = 'df-imp-dot running'; }, 200);
      setTimeout(function() {
        pass('df-imp-d3');
        setTimeout(function() { var el = document.getElementById('df-imp-d4'); if (el) el.className = 'df-imp-dot running'; }, 200);
        setTimeout(function() {
          pass('df-imp-d4');
          window._dfImpValid = true;
          var D = window._DF_IMP_DEMO;
          document.getElementById('df-imp-pv-name').textContent       = D.name;
          document.getElementById('df-imp-pv-budget').textContent     = D.budget + ' 万元';
          document.getElementById('df-imp-pv-date').textContent       = D.date;
          document.getElementById('df-imp-pv-head').textContent       = D.head;
          document.getElementById('df-imp-pv-headtel').textContent    = D.headtel;
          document.getElementById('df-imp-pv-contacttel').textContent = D.contacttel;
          var descShort = D.desc.length > 60 ? D.desc.substring(0, 60) + '…' : D.desc;
          document.getElementById('df-imp-pv-desc').textContent = descShort;
          document.getElementById('df-imp-preview').classList.add('active');
          var okBtn = document.getElementById('df-imp-ok');
          if (okBtn) okBtn.removeAttribute('disabled');
        }, 550);
      }, 650);
    }, 850);
  }, 850);
};

window._dfConfirmFill = function() {
  if (!window._dfImpValid) return;
  closeModal();
  var D = window._DF_IMP_DEMO;
  var fields = [
    { id: 'df-name',              val: D.name,       delay: 100 },
    { id: 'df-budget',            val: D.budget,     delay: 240 },
    { id: 'df-date',              val: D.date,       delay: 380 },
    { id: 'df-unit-leader',       val: D.head,       delay: 520 },
    { id: 'df-unit-leader-phone', val: D.headtel,    delay: 660 },
    { id: 'df-contact',           val: D.contacttel, delay: 800 },
    { id: 'df-desc',              val: D.desc,       delay: 940 }
  ];
  fields.forEach(function(f) {
    setTimeout(function() {
      var el = document.getElementById(f.id);
      if (!el) return;
      el.value = f.val;
      el.classList.remove('df-field-flash');
      void el.offsetWidth;
      el.classList.add('df-field-flash');
    }, f.delay);
  });
  setTimeout(function() {
    if (typeof window._dfUpdateTypeBadge === 'function') window._dfUpdateTypeBadge();
    window._dfCaptureAll();
    toast('已从模板文件自动填入 7 个字段', 'success');
  }, 1100);
};


/* ════════════════════════════════════════════════════════════════
   6. demand-assign — 指派填报人 (unit-sysadmin)  D-10/D-11
   ════════════════════════════════════════════════════════════════ */

if (typeof window._daCandidates === 'undefined') window._daCandidates = [];

registerView('demand-assign', function() {
  var cp = DATA.collectionPlans && DATA.collectionPlans[0];
  var cpTitle    = cp ? cp.title   : '2026年度信息化项目需求征集';
  var cpEnd      = cp ? cp.endDate : '2026-05-15';
  var cpId       = cp ? cp.id      : 'CP001';
  var assigned   = window._daCandidates.length;

  // 备选列表行
  var candidateRows = window._daCandidates.length
    ? window._daCandidates.map(function(u) {
        var unitName = '';
        if (u.unitId) {
          var uMap = {'unit-edu':'教务处','unit-enroll':'招生处','unit-research':'科研处','unit-student':'学工处','unit-office':'党政办','unit-lib':'图书馆','unit-info':'信息化办','unit-assets':'资产处'};
          unitName = uMap[u.unitId] || u.unitId;
        }
        return '<tr>' +
          '<td><b>' + u.name + '</b> <span style="color:var(--text-secondary);font-size:12px">' + u.empNo + '</span></td>' +
          '<td>' + unitName + '</td>' +
          '<td><button class="btn btn-sm btn-danger" onclick="_daRemoveCandidate(\'' + u.id + '\')">移除</button></td>' +
        '</tr>';
      }).join('')
    : '<tr><td colspan="3" style="text-align:center;padding:20px;color:var(--text-secondary)">暂未选择填报人，请先搜索添加</td></tr>';

  return (
    breadcrumb('首页', '需求管理', '指派填报人') +
    '<div class="page-header"><div class="page-title">指派填报人</div></div>' +
    // 征集批次信息卡片
    '<div class="card" style="margin-bottom:12px;padding:12px 16px;background:#f0f5ff;border:1px solid #adc6ff">' +
      '<div style="display:flex;gap:24px;align-items:center;font-size:13px">' +
        '<span><b>征集批次：</b>' + cpTitle + '</span>' +
        '<span><b>截止日期：</b>' + cpEnd + '</span>' +
        '<span><b>已指派：</b><span style="color:var(--primary)">' + assigned + '</span> 人</span>' +
        '<span style="color:var(--text-secondary);font-size:12px">批次ID：' + cpId + '</span>' +
      '</div>' +
    '</div>' +
    // 搜索区 D-11
    '<div class="card" style="margin-bottom:12px">' +
      '<div class="card-title">搜索填报人（D-11）</div>' +
      '<div style="display:flex;gap:8px;align-items:center;margin-bottom:8px">' +
        '<input class="form-control" id="da-search" type="text" placeholder="搜索姓名或工号（如：王一凡 或 50240014）" style="max-width:320px" onkeydown="if(event.key===\'Enter\')_daSearch()">' +
        '<button class="btn" onclick="_daSearch()">搜索</button>' +
      '</div>' +
      '<div id="da-search-result" style="min-height:32px"></div>' +
    '</div>' +
    // 备选列表区
    '<div class="card" style="margin-bottom:12px">' +
      '<div class="card-title">已选填报人（备选列表）</div>' +
      '<table class="data-table"><thead><tr>' +
        '<th>姓名 + 工号（D-10）</th><th>所在单位</th><th>操作</th>' +
      '</tr></thead>' +
      '<tbody>' + candidateRows + '</tbody></table>' +
    '</div>' +
    // 权限有效期
    '<div class="card" style="margin-bottom:12px">' +
      '<div class="form-item" style="max-width:320px">' +
        '<label class="form-label">权限有效期</label>' +
        '<input class="form-control" id="da-expire" type="date" value="' + cpEnd + '">' +
        '<div style="font-size:11px;color:var(--text-secondary);margin-top:2px">默认为征集批次截止日期，可手动调整</div>' +
      '</div>' +
    '</div>' +
    // 底部操作
    '<div style="text-align:right;margin-top:8px">' +
      '<button class="btn btn-primary" onclick="_daSubmit()">保存指派</button>' +
    '</div>'
  );
});

window._daSearch = function() {
  var kw = (document.getElementById('da-search').value || '').trim();
  var result = document.getElementById('da-search-result');
  if (!kw) { result.innerHTML = '<div style="color:var(--text-secondary);font-size:13px">请输入关键词</div>'; return; }
  var matches = (DATA.demandUsers || []).filter(function(u) {
    return u.name.indexOf(kw) >= 0 || (u.empNo && u.empNo.indexOf(kw) >= 0);
  }).filter(function(u) {
    return u.roles && u.roles.indexOf('project-manager') >= 0;
  });
  if (matches.length === 0) {
    result.innerHTML = '<div style="color:var(--text-secondary);font-size:13px">未找到匹配人员</div>'; return;
  }
  result.innerHTML = '<div style="display:flex;flex-wrap:wrap;gap:6px">' +
    matches.map(function(u) {
      return '<div class="user-item" style="display:flex;align-items:center;gap:8px;padding:6px 10px;background:#f4f4f5;border-radius:4px;font-size:13px">' +
        '<span>' + u.name + ' ' + u.empNo + '</span>' +
        '<button class="btn btn-sm" onclick="_daAddCandidate(\'' + u.id + '\')">加入备选</button>' +
      '</div>';
    }).join('') +
  '</div>';
};

window._daAddCandidate = function(uid) {
  var u = (DATA.demandUsers || []).find(function(x) { return x.id === uid; });
  if (!u) return;
  if (window._daCandidates.some(function(c) { return c.id === uid; })) {
    toast('该人员已在备选列表中', 'warning'); return;
  }
  window._daCandidates.push(u);
  toast('已加入备选列表：' + u.name + ' ' + u.empNo, 'success');
  renderView('demand-assign');
};

window._daRemoveCandidate = function(uid) {
  window._daCandidates = window._daCandidates.filter(function(c) { return c.id !== uid; });
  renderView('demand-assign');
};

window._daSubmit = function() {
  if (!window._daCandidates || window._daCandidates.length === 0) {
    toast('请至少指派 1 名填报人', 'error'); return;
  }
  var expire = (document.getElementById('da-expire') && document.getElementById('da-expire').value) || '';
  var body = '<p>即将指派以下 <b>' + window._daCandidates.length + '</b> 名填报人：</p>' +
    '<ul style="margin:8px 0;padding-left:20px">' +
    window._daCandidates.map(function(u) { return '<li>' + u.name + ' ' + u.empNo + '</li>'; }).join('') +
    '</ul>' +
    (expire ? '<p style="margin-top:8px">权限有效期至：<b>' + expire + '</b></p>' : '') +
    '<p style="color:var(--text-secondary);font-size:12px">确认后将发送指派通知，填报人可在截止日期前填写需求申请。</p>';
  showModal('确认指派填报人', body,
    '<button class="btn" onclick="closeModal()">取消</button>' +
    '<button class="btn btn-primary" onclick="_daConfirmSubmit()">确认提交</button>'
  );
};

window._daConfirmSubmit = function() {
  logOperation('demand-assign', '指派填报人', window._daCandidates.length + '人，截止：' + ((document.getElementById('da-expire') && document.getElementById('da-expire').value) || ''));
  toast('已指派 ' + window._daCandidates.length + ' 名填报人，通知已发送', 'success');
  closeModal();
  window._daCandidates = [];
  navigate('demand-list');
};


/* ════════════════════════════════════════════════════════════════
   7. demand-sort — 单位需求排序 (unit-sysadmin 专属，DEM-04 / D-13)
   ════════════════════════════════════════════════════════════════ */

function _dsGetList() {
  var user = (DATA.demandUsers || []).find(function(u) {
    return u.roles && u.roles.indexOf('unit-sysadmin') >= 0;
  });
  var unitId = user ? user.unitId : 'unit-edu';
  return DATA.demands
    .filter(function(d) { return d.unitId === unitId && d.status === 'submitted'; })
    .sort(function(a, b) { return (a.sortOrder || 999) - (b.sortOrder || 999); });
}

function _dsMove(demandId, dir) {
  var list = _dsGetList();
  var idx = list.findIndex(function(d) { return d.id === demandId; });
  if (idx < 0) return;
  var swap = dir === 'up' ? idx - 1 : idx + 1;
  if (swap < 0 || swap >= list.length) return;
  var tmp = list[idx]; list[idx] = list[swap]; list[swap] = tmp;
  list.forEach(function(d, i) { d.sortOrder = i + 1; });
  renderView('demand-sort');
}

function _dsSave() {
  logOperation('demand-sort', 'save', _dsGetList().length + '条');
  toast('排序已保存', 'success');
}

function _dsSubmitForApproval() {
  var list = _dsGetList();
  if (list.length === 0) { toast('本单位暂无可提交的需求', 'error'); return; }
  showModal('确认提交排序',
    '<p>确认提交？提交后需等待单位领导审批，如需修改请联系领导退回。</p>',
    '<button class="btn" onclick="closeModal()">取消</button>' +
    '<button class="btn btn-primary" onclick="_dsConfirmSubmit()">确认提交</button>');
}

function _dsConfirmSubmit() {
  var list = _dsGetList();
  list.forEach(function(d) { d.status = 'unit-pending'; });
  logOperation('demand-sort', 'submit-for-approval', list.length + '条');
  closeModal();
  toast('已提交单位领导审批', 'success');
  renderView('demand-sort');
}

registerView('demand-sort', function() {
  var role = getCurrentRole();
  if (role !== 'unit-sysadmin' && role !== 'unit-admin') {
    return '<div class="empty">请切换到单位系统管理员角色</div>';
  }

  var list = _dsGetList();
  var batch = DATA.collectionPlans[0] || { title: '当前征集批次', endDate: '' };
  var totalBudget = list.reduce(function(sum, d) { return sum + (parseFloat(d.budget || d.budgetEstimate) || 0); }, 0);

  var rows = list.length
    ? list.map(function(d, i) {
        var first = i === 0, last = i === list.length - 1;
        var summary = (d.summary || d.description || '').slice(0, 40);
        return '<tr>' +
          '<td>' + (d.sortOrder || i + 1) + '</td>' +
          '<td>' + (d.name || d.projectName || '') + '</td>' +
          '<td>' + (d.submitter || d.submittedBy || '') + '</td>' +
          '<td>' + (d.budget || d.budgetEstimate || 0) + ' 万元 ' +
            (typeof projectTypeTag === 'function' && typeof budgetToType === 'function'
              ? projectTypeTag(budgetToType(parseFloat(d.budget || d.budgetEstimate) || 0).type) : '') + '</td>' +
          '<td>' + summary + (summary.length >= 40 ? '…' : '') + '</td>' +
          '<td>' +
            '<button class="btn btn-sm" ' + (first ? 'disabled' : '') + ' onclick="_dsMove(\'' + d.id + '\',\'up\')">↑</button> ' +
            '<button class="btn btn-sm" ' + (last ? 'disabled' : '') + ' onclick="_dsMove(\'' + d.id + '\',\'down\')">↓</button>' +
          '</td>' +
        '</tr>';
      }).join('')
    : '<tr><td colspan="6"><div class="empty">本单位暂无需求，无法排序。请先确认项目负责人已提交需求申请表。</div></td></tr>';

  return (
    breadcrumb('需求征集', '需求排序') +
    '<h2>单位需求排序</h2>' +
    '<div class="card" style="margin-bottom:16px">' +
      '<div style="display:flex;gap:24px;font-size:13px">' +
        '<span>待排序需求：<b>' + list.length + '</b> 条</span>' +
        '<span>合计预算：<b>' + totalBudget + '</b> 万元</span>' +
        '<span>征集批次截止：<b>' + (batch.endDate || batch.deadline || '待定') + '</b></span>' +
      '</div>' +
    '</div>' +
    '<table class="data-table">' +
      '<thead><tr>' +
        '<th>序号</th><th>项目名称</th><th>负责人</th><th>预算</th><th>摘要</th><th>操作</th>' +
      '</tr></thead>' +
      '<tbody>' + rows + '</tbody>' +
    '</table>' +
    '<div style="margin-top:16px;display:flex;gap:8px;justify-content:flex-end">' +
      '<button class="btn" onclick="_dsSave()">保存排序</button>' +
      '<button class="btn btn-primary" onclick="_dsSubmitForApproval()">提交单位领导审批</button>' +
    '</div>'
  );
});


/* ════════════════════════════════════════════════════════════════
   8. demand-select — 需求遴选 (info-leader)
   ════════════════════════════════════════════════════════════════ */

/* ════════════════════════════════════════════════════════════════
   BR-04 六类不予支持原因（《西南大学信息化项目管理办法（试行）》第十三条）
   ════════════════════════════════════════════════════════════════ */
var BR04_REASONS = [
  '（一）已经启动建设，或已建成并正常运行的项目，再次报送需求申请重建且无正当理由的',
  '（二）项目需求不明确、不合理，市场调研不充分，预算经费严重背离实际，或无法确定牵头业务责任部门或分管领导的',
  '（三）项目需求与现有系统功能或数字资源有较大重叠，且无正当理由的',
  '（四）项目的建设理念和技术路线已经过时或属于当前落后并被行业或市场淘汰的',
  '（五）已经被否决的项目建设需求，且没有新的理由支持再次研究论证的',
  '（六）不符合学校其他相关规定的'
];

registerView('demand-select', function() {
  // T-05-01 mitigate：角色入口检查
  var role = getCurrentRole();
  if (role !== 'info-admin' && role !== 'info-leader') {
    return '<div class="empty">请切换到信息办管理员或信息办领导角色</div>';
  }
  var batch = DATA.collectionPlans[0] || { title: '当前征集批次' };
  var all = DATA.demands.filter(function(d) {
    return d.status === 'unit-approved' || d.status === 'in-selection' || d.status === 'supported' || d.status === 'not-supported';
  });
  var stats = {
    total: all.length,
    supported: all.filter(function(d) { return d.status === 'supported'; }).length,
    rejected: all.filter(function(d) { return d.status === 'not-supported'; }).length,
    pending: all.filter(function(d) { return d.status === 'unit-approved' || d.status === 'in-selection'; }).length
  };
  var filterUnit = window._dselUnit || 'all';
  var filterStatus = window._dselStatus || 'all';
  var kw = window._dselKw || '';
  var filtered = all.filter(function(d) {
    if (filterUnit !== 'all' && d.unitId !== filterUnit) return false;
    if (filterStatus !== 'all' && d.status !== filterStatus) return false;
    if (kw && (d.name || d.projectName || '').indexOf(kw) < 0) return false;
    return true;
  });
  var rows = filtered.map(function(d) {
    var dName = d.name || d.projectName || '';
    var badge = d.status === 'supported' ? '<span class="tag tag-green">已支持</span>'
              : d.status === 'not-supported' ? '<span class="tag tag-red">不支持</span>'
              : '<span class="tag tag-gray">未处理</span>';
    return '<tr>' +
      '<td>' + (d.sortOrder || '') + '</td>' +
      '<td>' + dName + '</td>' +
      '<td>' + (d.unitId || '') + '</td>' +
      '<td>' + (d.submitter || d.submittedBy || '') + '</td>' +
      '<td>' + (d.budget || d.budgetEstimate || 0) + '万 ' + (typeof projectTypeTag === 'function' && typeof budgetToType === 'function' ? projectTypeTag(budgetToType(d.budget || d.budgetEstimate || 0).type || budgetToType(d.budget || d.budgetEstimate || 0)) : '') + '</td>' +
      '<td>' + badge + '</td>' +
      '<td>' + _reviewBadge(_getDemandReview(d.id)) + '</td>' +
      '<td class="desc">' + ((d.summary || '').slice(0, 60)) + '</td>' +
      '<td>' +
        '<button class="btn btn-sm btn-primary" onclick="_dselSupport(\'' + d.id + '\')">支持</button> ' +
        '<button class="btn btn-sm btn-danger" onclick="_dselReject(\'' + d.id + '\')">不支持</button>' +
      '</td>' +
    '</tr>';
  }).join('');
  if (filtered.length === 0) rows = '<tr><td colspan="9" class="empty">当前批次暂无待遴选需求，请等待各单位完成审批后刷新。</td></tr>';

  return (
    breadcrumb('需求征集', '需求遴选') +
    '<h2>需求遴选 — ' + batch.title + '</h2>' +
    '<div class="page-sub">总 ' + stats.total + ' 条｜已支持 ' + stats.supported + ' 条｜不支持 ' + stats.rejected + ' 条｜未处理 ' + stats.pending + ' 条</div>' +
    '<div class="card">' +
      '<div class="filters">' +
        '<select id="dsel-unit" onchange="_dselSetFilter(\'unit\',this.value)"><option value="all">全部单位</option><option value="unit-edu">教务处</option><option value="unit-sci">科研处</option><option value="unit-stu">学工处</option><option value="unit-hr">人事处</option><option value="unit-lib">图书馆</option></select>' +
        '<select id="dsel-status" onchange="_dselSetFilter(\'status\',this.value)"><option value="all">全部状态</option><option value="unit-approved">未处理</option><option value="supported">已支持</option><option value="not-supported">不支持</option></select>' +
        '<input id="dsel-kw" type="text" placeholder="搜索项目名称" oninput="_dselSetFilter(\'kw\',this.value)">' +
      '</div>' +
      '<table class="data-table"><thead><tr>' +
        '<th>序号</th><th>项目名称</th><th>单位</th><th>负责人</th><th>预算</th><th>状态</th><th>评审结论</th><th>摘要</th><th>操作</th>' +
      '</tr></thead><tbody>' + rows + '</tbody></table>' +
    '</div>' +
    '<div class="actions actions-footer">' +
      '<button class="btn btn-primary" onclick="_dselSubmitSelection()">提交遴选结果</button>' +
    '</div>'
  );
});

function _dselSetFilter(key, val) {
  if (key === 'unit') window._dselUnit = val;
  else if (key === 'status') window._dselStatus = val;
  else if (key === 'kw') window._dselKw = val;
  renderView('demand-select');
}

function _dselSupport(id) {
  var d = DATA.demands.find(function(x) { return x.id === id; });
  if (!d) return;
  d.status = 'supported';
  logOperation('demand-select', 'support', d.name || d.projectName || id);  // T-05-04 mitigate
  toast('已标记为支持', 'success');
  renderView('demand-select');
}

function _dselReject(id) {
  var d = DATA.demands.find(function(x) { return x.id === id; });
  if (!d) return;
  // D-15：立即改状态（T-05-02 mitigate：先改状态后 showDrawer，即使 Drawer 失败状态已持久）
  d.status = 'not-supported';
  logOperation('demand-select', 'reject', d.name || d.projectName || id);  // T-05-04 mitigate
  toast('已标记为不支持', 'success');
  renderView('demand-select');
  // Drawer 仅展示原文，无按钮（Pitfall 3：禁止在 Drawer 内含 _dselConfirm 或「确认不支持」按钮）
  var html = '<div class="br04-drawer">' +
    '<p class="br04-intro" style="margin:0 0 12px 0;font-size:13px;color:var(--text-secondary)">根据《西南大学信息化项目管理办法（试行）》第十三条，下列情形不予支持：</p>' +
    BR04_REASONS.map(function(r) { return '<div class="br04-item" style="padding:8px 0;border-bottom:1px solid #f0f0f0;font-size:13px;line-height:1.6">' + r + '</div>'; }).join('') +
  '</div>';
  showDrawer('不予支持原因说明（BR-04）', html);
}

function _dselSubmitSelection() {
  var pending = DATA.demands.filter(function(d) { return d.status === 'unit-approved'; }).length;
  var body = pending > 0
    ? '<p>仍有 ' + pending + ' 条需求未处理。提交后未处理的需求将保持为未处理状态，后续可继续遴选。</p><p>确认提交遴选结果？</p>'
    : '<p>所有需求已处理。提交后将进入需求库，无法撤回。</p>';
  showModal('确认遴选结果', body,
    '<button class="btn" onclick="closeModal()">取消</button>' +
    '<button class="btn btn-primary" onclick="_dselConfirmSubmit()">确认提交</button>');
}

function _dselConfirmSubmit() {
  var supported = DATA.demands.filter(function(d) { return d.status === 'supported'; }).length;
  var rejected = DATA.demands.filter(function(d) { return d.status === 'not-supported'; }).length;
  logOperation('demand-select', 'submit-selection', 'supported=' + supported + ',rejected=' + rejected);  // T-05-04 mitigate
  closeModal();
  toast('遴选结果已提交，共 ' + supported + ' 条支持 / ' + rejected + ' 条不支持，通知已发送', 'success');
  renderView('demand-select');
}

/* ════════════════════════════════════════════════════════════════
   tag-library — 标签库管理视图（D-09）
   角色：info-admin、unit-sysadmin（通过菜单 nav.js 控制入口可见性）
   ════════════════════════════════════════════════════════════════ */

function _tlRender() { renderView('tag-library'); }

function _tlOpenCreate() {
  var body =
    '<div style="padding:8px 0">' +
    '<div class="form-item mb-16"><label class="form-label required">类目</label>' +
      '<select class="form-control" id="tl-new-cat">' +
        '<option>业务领域</option><option>技术类型</option><option>建设类型</option><option>项目规模</option>' +
      '</select></div>' +
    '<div class="form-item"><label class="form-label required">标签名</label>' +
      '<input class="form-control" id="tl-new-name" type="text" maxlength="20" placeholder="最多 20 字"/>' +
    '</div></div>';
  showModal('新增标签', body,
    '<button class="btn" onclick="closeModal()">取消</button>' +
    '<button class="btn btn-primary" onclick="_tlSubmitCreate()">保存</button>');
}

function _tlSubmitCreate() {
  var cat  = document.getElementById('tl-new-cat').value;
  var name = (document.getElementById('tl-new-name').value || '').trim();
  // T-01-03 基础过滤：避免 XSS 注入
  name = name.replace(/[<>"]/g, '');
  if (!name) { toast('请填写标签名', 'error'); return; }
  if (DATA.tagLibrary.some(function(t) { return t.category === cat && t.name === name; })) {
    toast('该类目下已存在同名标签', 'error'); return;
  }
  DATA.tagLibrary.push({
    id: 'tag-custom-' + Date.now(),
    category: cat, name: name, builtin: false,
    createdAt: new Date().toISOString().slice(0, 10)
  });
  logOperation('tag-library', 'create', name);  // T-01-04 操作日志
  closeModal(); toast('标签已新增', 'success'); _tlRender();
}

function _tlOpenEdit(id) {
  var t = DATA.tagLibrary.find(function(x) { return x.id === id; });
  if (!t) return;
  // T-01-03 基础过滤：转义已存数据中的特殊字符再拼入 value 属性
  var safeVal = t.name.replace(/[<>"]/g, '');
  var body =
    '<div class="form-item"><label class="form-label required">标签名</label>' +
      '<input class="form-control" id="tl-edit-name" type="text" value="' + safeVal + '" maxlength="20"/>' +
    '</div>';
  showModal('编辑标签', body,
    '<button class="btn" onclick="closeModal()">取消</button>' +
    '<button class="btn btn-primary" onclick="_tlSubmitEdit(\'' + id + '\')">保存</button>');
}

function _tlSubmitEdit(id) {
  var t = DATA.tagLibrary.find(function(x) { return x.id === id; });
  if (!t) return;
  var newName = (document.getElementById('tl-edit-name').value || '').trim();
  // T-01-03 基础过滤
  newName = newName.replace(/[<>"]/g, '');
  if (!newName) { toast('请填写标签名', 'error'); return; }
  t.name = newName;
  logOperation('tag-library', 'edit', id, newName);  // T-01-04 操作日志
  closeModal(); toast('标签已更新', 'success'); _tlRender();
}

function _tlDelete(id) {
  var t = DATA.tagLibrary.find(function(x) { return x.id === id; });
  if (!t || t.builtin) { toast('内置标签不可删除', 'warning'); return; }
  // T-01-03 基础过滤
  var safeName = t.name.replace(/[<>"]/g, '');
  showModal('删除标签',
    '<p>确认删除标签「' + safeName + '」？已引用该标签的历史需求不受影响。</p>',
    '<button class="btn" onclick="closeModal()">取消</button>' +
    '<button class="btn btn-danger" onclick="_tlConfirmDelete(\'' + id + '\')">确认删除</button>');
}

function _tlConfirmDelete(id) {
  var idx = DATA.tagLibrary.findIndex(function(x) { return x.id === id; });
  if (idx >= 0) DATA.tagLibrary.splice(idx, 1);
  logOperation('tag-library', 'delete', id);  // T-01-04 操作日志
  closeModal(); toast('标签已删除', 'success'); _tlRender();
}

registerView('tag-library', function() {
  var cat = (window._tlCatFilter !== undefined) ? window._tlCatFilter : '';
  var kw  = (window._tlKw       !== undefined) ? window._tlKw        : '';

  var categories = ['业务领域', '技术类型', '建设类型', '项目规模'];

  var filtered = DATA.tagLibrary.filter(function(t) {
    var matchCat = !cat || t.category === cat;
    var matchKw  = !kw  || t.name.indexOf(kw) >= 0;
    return matchCat && matchKw;
  });

  var catOptions = '<option value="">全部</option>' +
    categories.map(function(c) {
      return '<option value="' + c + '"' + (cat === c ? ' selected' : '') + '>' + c + '</option>';
    }).join('');

  var rows = filtered.length
    ? filtered.map(function(t, i) {
        var typeTag = t.builtin
          ? '<span class="tag tag-blue">内置</span>'
          : '<span class="tag tag-green">自定义</span>';
        var delBtn = t.builtin
          ? '<button class="btn btn-sm" disabled title="内置标签不可删除">删除</button>'
          : '<button class="btn btn-sm btn-danger" onclick="_tlDelete(\'' + t.id + '\')">删除</button>';
        return '<tr>' +
          '<td>' + (i + 1) + '</td>' +
          '<td>' + t.category + '</td>' +
          '<td>' + t.name + '</td>' +
          '<td>' + typeTag + '</td>' +
          '<td>' + t.createdAt + '</td>' +
          '<td>' +
            '<button class="btn btn-sm" onclick="_tlOpenEdit(\'' + t.id + '\')" ' +
              (t.builtin ? '' : '') + '>编辑</button> ' +
            delBtn +
          '</td>' +
        '</tr>';
      }).join('')
    : '<tr><td colspan="6"><div class="empty">暂无标签</div></td></tr>';

  return (
    breadcrumb('系统管理', '标签库') +
    '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px">' +
      '<h2 style="margin:0">标签库管理</h2>' +
    '</div>' +
    '<p style="color:var(--text-secondary);margin-bottom:20px">标签库是需求申请表标签字段的唯一数据源，新增/删除后立即在需求申请表生效。</p>' +
    '<div class="card" style="margin-bottom:16px;padding:16px">' +
      '<div style="display:flex;gap:12px;align-items:center;flex-wrap:wrap">' +
        '<select class="form-control" id="tl-cat-filter" style="width:160px" ' +
          'onchange="window._tlCatFilter=this.value;_tlRender()">' +
          catOptions +
        '</select>' +
        '<input class="form-control" id="tl-kw" type="text" placeholder="搜索标签名..." style="width:200px" ' +
          'value="' + kw.replace(/[<>"]/g, '') + '" ' +
          'oninput="window._tlKw=this.value;_tlRender()"/>' +
        '<button class="btn btn-primary" onclick="_tlOpenCreate()">+ 新增标签</button>' +
        '<span style="color:var(--text-secondary);font-size:13px">共 ' + filtered.length + ' 条</span>' +
      '</div>' +
    '</div>' +
    '<table class="data-table">' +
      '<thead><tr>' +
        '<th style="width:50px">序号</th>' +
        '<th style="width:100px">类目</th>' +
        '<th>标签名</th>' +
        '<th style="width:90px">类型</th>' +
        '<th style="width:110px">创建时间</th>' +
        '<th style="width:140px">操作</th>' +
      '</tr></thead>' +
      '<tbody>' + rows + '</tbody>' +
    '</table>'
  );
});


/* ════════════════════════════════════════════════════════════════
   10. demand-approve — 单位领导审批详情页 T4 (DEM-05 / D-14)
   ════════════════════════════════════════════════════════════════ */

function _renderLifecycleBar(currentStage) {
  var stages = ['需求征集', '立项论证', '采购', '实施', '验收', '运维'];
  var idx = stages.indexOf(currentStage);
  var html = '<div class="lifecycle-bar">';
  stages.forEach(function(s, i) {
    var cls = i < idx ? 'done' : (i === idx ? 'current' : 'pending');
    html += '<div class="lifecycle-stage ' + cls + '"><span class="dot"></span><span class="label">' + s + '</span></div>';
    if (i < stages.length - 1) {
      html += '<div class="lifecycle-line ' + (i < idx ? 'done' : 'pending') + '"></div>';
    }
  });
  html += '</div>';
  return html;
}

function _daSwitchTab(tab) {
  window._daTab = tab;
  renderView('demand-approve');
}

function _daGetList() {
  var unitId = ((DATA.demandUsers || []).find(function(u) {
    return u.roles && u.roles.indexOf('unit-leader') >= 0;
  }) || {}).unitId || 'unit-edu';
  return DATA.demands
    .filter(function(d) { return d.unitId === unitId && d.status === 'unit-pending'; })
    .sort(function(a, b) { return (a.sortOrder || 999) - (b.sortOrder || 999); });
}

function _daMove(id, dir) {
  var list = _daGetList();
  var idx = list.findIndex(function(d) { return d.id === id; });
  if (idx < 0) return;
  var swap = dir === 'up' ? idx - 1 : idx + 1;
  if (swap < 0 || swap >= list.length) return;
  var tmp = list[idx]; list[idx] = list[swap]; list[swap] = tmp;
  list.forEach(function(d, i) { d.sortOrder = i + 1; });
  renderView('demand-approve');
}

function _daToggleNeedNext() {
  window._daNeedNext = document.getElementById('da-need-next').checked;
  renderView('demand-approve');
}

function _daApprove() {
  var comment = (document.getElementById('da-comment') ? document.getElementById('da-comment').value : '').trim();
  if (!comment) { toast('请填写审批意见后再提交', 'error'); return; }
  var list = _daGetList();
  list.forEach(function(d) { d.status = 'unit-approved'; d.unitLeaderComment = comment; });
  logOperation('demand-approve', 'approve', list.length + '条：' + comment);
  toast('审批通过，已进入信息办遴选环节', 'success');
  renderView('demand-approve');
}

function _daReject() {
  showReturnDialog('退回需求排序', function(reason) {
    var list = _daGetList();
    list.forEach(function(d) { d.status = 'unit-rejected'; d.unitLeaderComment = reason; });
    logOperation('demand-approve', 'reject', list.length + '条：' + reason);
    toast('已退回，单位系统管理员可重新排序', 'success');
    renderView('demand-approve');
  });
}

function _daRenderContent(list) {
  var needNext = (typeof window._daNeedNext === 'undefined') ? true : window._daNeedNext;
  var rows = list.map(function(d, i) {
    var first = i === 0, last = i === list.length - 1;
    return '<tr>' +
      '<td>' + (d.sortOrder || (i + 1)) + '</td>' +
      '<td>' + (d.name || d.projectName || '') + '</td>' +
      '<td>' + (d.submitter || d.submittedBy || '') + '</td>' +
      '<td>' + (d.budget || d.budgetEstimate || 0) + ' 万元 ' +
        (typeof projectTypeTag === 'function' && typeof budgetToType === 'function'
          ? projectTypeTag(budgetToType(parseFloat(d.budget || d.budgetEstimate) || 0).type) : '') + '</td>' +
      '<td>' + _reviewBadge(_getDemandReview(d.id)) + '</td>' +
      '<td>' + ((d.summary || d.description || '').slice(0, 40)) + '</td>' +
      '<td>' +
        '<button class="btn btn-sm" ' + (first ? 'disabled' : '') + ' onclick="_daMove(\'' + d.id + '\',\'up\')">↑</button> ' +
        '<button class="btn btn-sm" ' + (last ? 'disabled' : '') + ' onclick="_daMove(\'' + d.id + '\',\'down\')">↓</button>' +
      '</td>' +
    '</tr>';
  }).join('');
  if (list.length === 0) rows = '<tr><td colspan="7" class="empty">本单位暂无待审批需求</td></tr>';

  return '<section class="card">' +
    '<h3>需求排序（可调整）</h3>' +
    '<table class="data-table"><thead><tr>' +
      '<th>序号</th><th>项目名称</th><th>负责人</th><th>预算</th><th>评审结论</th><th>摘要</th><th>操作</th>' +
    '</tr></thead><tbody>' + rows + '</tbody></table>' +
    '</section>' +
    '<section class="card">' +
      '<h3>审批意见</h3>' +
      '<textarea id="da-comment" rows="4" placeholder="请填写审批意见" class="form-control" style="width:100%;margin-bottom:12px"></textarea>' +
      '<div class="form-row" style="margin-bottom:8px">' +
        '<label><input type="checkbox" id="da-need-next" ' + (needNext ? 'checked' : '') + ' onchange="_daToggleNeedNext()"> 是否需要下一级审批</label>' +
      '</div>' +
      (needNext
        ? '<div class="form-row" style="margin-bottom:12px"><label>下一级审批人</label>' +
          '<select id="da-next-approver" class="form-control" style="width:280px;margin-top:4px">' +
          '<option value="info-admin">林已杰 20054379（信息办管理员）</option>' +
          '</select></div>'
        : '') +
      '<div class="actions" style="display:flex;gap:8px;margin-top:8px">' +
        '<button class="btn btn-danger" onclick="_daReject()">退回修改</button>' +
        '<button class="btn btn-primary" onclick="_daApprove()">审批通过</button>' +
      '</div>' +
    '</section>';
}

function _daRenderLogs() {
  var logs = (DATA.operationLogs || []).filter(function(l) {
    return l.module === 'demand-sort' || l.module === 'demand-approve' || l.module === 'demand-fill';
  });
  if (logs.length === 0) return '<div class="card"><div class="empty">暂无操作记录</div></div>';
  return '<div class="card"><table class="data-table"><thead><tr>' +
    '<th>时间</th><th>模块</th><th>动作</th><th>操作人</th>' +
    '</tr></thead><tbody>' +
    logs.map(function(l) {
      return '<tr><td>' + (l.time || '') + '</td><td>' + l.module + '</td><td>' + l.action + '</td><td>' + (l.operator || '') + '</td></tr>';
    }).join('') +
    '</tbody></table></div>';
}

registerView('demand-approve', function() {
  if (getCurrentRole() !== 'unit-leader') {
    return '<div class="empty">请切换到单位分管领导角色</div>';
  }
  var batch = DATA.collectionPlans[0] || { title: '当前征集批次', endDate: '' };
  var unitId = ((DATA.demandUsers || []).find(function(u) {
    return u.roles && u.roles.indexOf('unit-leader') >= 0;
  }) || {}).unitId || 'unit-edu';
  var list = DATA.demands
    .filter(function(d) {
      return d.unitId === unitId &&
        (d.status === 'unit-pending' || d.status === 'unit-approved' || d.status === 'unit-rejected');
    })
    .sort(function(a, b) { return (a.sortOrder || 999) - (b.sortOrder || 999); });
  var activeTab = window._daTab || 'content';

  return (
    '<style>' +
    '.lifecycle-bar{display:flex;align-items:center;margin:16px 0;padding:12px 16px;background:#f9f9f9;border-radius:6px;overflow-x:auto}' +
    '.lifecycle-stage{display:flex;flex-direction:column;align-items:center;min-width:64px}' +
    '.lifecycle-stage .dot{width:14px;height:14px;border-radius:50%;background:#d9d9d9;margin-bottom:4px}' +
    '.lifecycle-stage .label{font-size:11px;color:#888;white-space:nowrap}' +
    '.lifecycle-stage.done .dot{background:var(--success,#52c41a)}' +
    '.lifecycle-stage.done .label{color:var(--success,#52c41a)}' +
    '.lifecycle-stage.current .dot{background:var(--primary,#1677ff);box-shadow:0 0 0 3px rgba(22,119,255,.2)}' +
    '.lifecycle-stage.current .label{color:var(--primary,#1677ff);font-weight:600}' +
    '.lifecycle-line{flex:1;height:2px;min-width:24px;background:#d9d9d9}' +
    '.lifecycle-line.done{background:var(--success,#52c41a)}' +
    '</style>' +
    breadcrumb('需求征集', '单位领导审批') +
    '<h2>' + batch.title + ' — 单位领导审批</h2>' +
    '<div class="page-sub" style="margin-bottom:8px"><span class="tag tag-orange">待单位领导审批</span></div>' +
    _renderLifecycleBar('需求征集') +
    '<div class="tabs" style="display:flex;gap:4px;margin-bottom:16px">' +
      '<button class="tab' + (activeTab === 'content' ? ' active' : '') + '" onclick="_daSwitchTab(\'content\')">审批内容</button>' +
      '<button class="tab' + (activeTab === 'logs' ? ' active' : '') + '" onclick="_daSwitchTab(\'logs\')">操作记录</button>' +
    '</div>' +
    (activeTab === 'content' ? _daRenderContent(list) : _daRenderLogs())
  );
});
