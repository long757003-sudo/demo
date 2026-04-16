// shared/views/project.js  — V2.1 项目管理（7 个视图）

/* ─── 数据兼容性适配器 ─── */
function adaptProject(p) {
  if (!p) return null;
  var typeInfo = budgetToType(p.budget || 0);
  return Object.assign({}, p, {
    endDate:           p.deadline || p.endDate || '',
    progressPct:       p.progressPct !== undefined ? p.progressPct : (p.progress || 0),
    contractNo:        p.contractNo || p.contractId || '',
    vendor:            p.vendor || (p.contractId ? '（见合同台账）' : ''),
    contact:           p.contact || '—',
    techReviewPassed:  p.techReviewPassed !== undefined ? p.techReviewPassed : (p.procurementStatus === '已签合同'),
    procurementStatus: p.procurementStatus || (p.contractId ? '已签合同' : '未开始'),
    typeKey:           p.type,
    typeInfo:          typeInfo,
  });
}

/* ════════════════════════════════════════════════════════
   1. project-list — 项目列表
   ════════════════════════════════════════════════════════ */
registerView('project-list', function() {
  var role = getCurrentRole();
  var allProjects = DATA.projects.map(adaptProject);

  // project-manager / project-assistant 只看本单位项目
  var projects = (role === 'project-manager' || role === 'project-assistant')
    ? allProjects.filter(function(p) { return p.unit === DATA.currentUser.unit; })
    : allProjects;

  function buildRows(list) {
    return list.map(function(p) {
      var pct = p.progressPct || 0;
      var progressCell = pct > 0
        ? '<div style="display:flex;align-items:center;gap:6px"><div class="progress-bar-wrap" style="width:80px"><div class="progress-bar" style="width:' + pct + '%"></div></div><span style="font-size:11px;color:#666">' + pct + '%</span></div>'
        : '—';
      var budgetCell = '<strong>' + p.budget + '</strong> ' + projectTypeTag(p.typeKey);
      var deadlineAttr = p.endDate ? deadlineClass(p.endDate) : '';
      var deadlineStr = p.endDate ? '<span ' + deadlineAttr + '>' + formatDate(p.endDate) + '</span>' : '—';
      return [
        '<a class="link" onclick="navigate(\'project-detail\',{id:\'' + p.id + '\'})">' + p.name + '</a>',
        p.unit,
        budgetCell,
        projectStatusTag(p.status),
        progressCell,
        p.manager,
        deadlineStr,
        '<button class="btn" style="padding:2px 10px;font-size:12px" onclick="navigate(\'project-detail\',{id:\'' + p.id + '\'})">查看详情</button>',
      ];
    });
  }

  var initialRows = buildRows(projects);

  return '<div>' +
    breadcrumb('项目管理', '项目列表') +
    '<div class="page-header"><div class="page-title">项目列表</div></div>' +
    '<div class="card">' +
      '<div class="filter-bar" style="display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin-bottom:16px">' +
        '<input id="fl-kw" class="input" placeholder="项目名称 / 申报单位" style="width:180px">' +
        '<select id="fl-phase" class="select" style="width:130px">' +
          '<option value="">全部阶段</option>' +
          '<option value="demand">需求征集</option>' +
          '<option value="reviewing">立项论证</option>' +
          '<option value="procurement">采购中</option>' +
          '<option value="implementing">实施中</option>' +
          '<option value="acceptance">验收中</option>' +
          '<option value="completed">已验收</option>' +
          '<option value="ops">运维中</option>' +
          '<option value="frozen">冻结</option>' +
        '</select>' +
        '<select id="fl-type" class="select" style="width:110px">' +
          '<option value="">全部类型</option>' +
          '<option value="micro">微型</option>' +
          '<option value="small">小型</option>' +
          '<option value="mid">中型</option>' +
          '<option value="major">重大</option>' +
        '</select>' +
        '<input id="fl-bmin" class="input" type="number" placeholder="预算下限（万）" style="width:130px">' +
        '<input id="fl-bmax" class="input" type="number" placeholder="预算上限（万）" style="width:130px">' +
        '<button class="btn btn-primary" onclick="projectListFilter()">查询</button>' +
        '<button class="btn" onclick="projectListReset()">重置</button>' +
      '</div>' +
      '<div id="project-list-table">' +
        renderTable(
          [
            { label: '项目名称', key: 'name' },
            { label: '申报单位', key: 'unit' },
            { label: '预算（万元）/ 类型', sortable: true },
            { label: '阶段' },
            { label: '进度' },
            { label: '负责人', key: 'manager' },
            { label: '截止日期' },
            { label: '操作', width: '80px' },
          ],
          initialRows
        ) +
      '</div>' +
    '</div>' +
    '<script>(function(){' +
      'window._plAllProjects=' + JSON.stringify(projects.map(function(p){ return {id:p.id,name:p.name,unit:p.unit,status:p.status,typeKey:p.typeKey,budget:p.budget,progress:p.progressPct||0,manager:p.manager,endDate:p.endDate||""}; })) + ';' +
      'window.projectListFilter=function(){' +
        'var kw=document.getElementById("fl-kw").value.trim().toLowerCase();' +
        'var ph=document.getElementById("fl-phase").value;' +
        'var tp=document.getElementById("fl-type").value;' +
        'var bmin=parseFloat(document.getElementById("fl-bmin").value)||0;' +
        'var bmax=parseFloat(document.getElementById("fl-bmax").value)||Infinity;' +
        'var list=window._plAllProjects.filter(function(p){' +
          'var mk=!kw||(p.name.toLowerCase().indexOf(kw)>-1||p.unit.toLowerCase().indexOf(kw)>-1);' +
          'var mph=!ph||p.status===ph;' +
          'var mtp=!tp||p.typeKey===tp;' +
          'var mb=p.budget>=bmin&&p.budget<=bmax;' +
          'return mk&&mph&&mtp&&mb;' +
        '});' +
        'var rows=list.map(function(p){' +
          'var pct=p.progress||0;' +
          'var pc=pct>0?"<div style=\'display:flex;align-items:center;gap:6px\'><div class=\'progress-bar-wrap\' style=\'width:80px\'><div class=\'progress-bar\' style=\'width:"+pct+"%\'></div></div><span style=\'font-size:11px;color:#666\'>"+pct+"%</span></div>":"—";' +
          'var bc="<strong>"+p.budget+"</strong> "+projectTypeTag(p.typeKey);' +
          'var dc=p.endDate?"<span "+deadlineClass(p.endDate)+">"+formatDate(p.endDate)+"</span>":"—";' +
          'return ["<a class=\'link\' onclick=\'navigate(\\\"project-detail\\\",{id:\\\""+p.id+"\\\"})\'>" + p.name + "</a>",p.unit,bc,projectStatusTag(p.status),pc,p.manager,dc,"<button class=\'btn\' style=\'padding:2px 10px;font-size:12px\' onclick=\'navigate(\\\"project-detail\\\",{id:\\\""+p.id+"\\\"})\'>查看详情</button>"];' +
        '});' +
        'document.getElementById("project-list-table").innerHTML=renderTable(' +
          '[{label:"项目名称"},{label:"申报单位"},{label:"预算（万元）/ 类型",sortable:true},{label:"阶段"},{label:"进度"},{label:"负责人"},{label:"截止日期"},{label:"操作",width:"80px"}],' +
          'rows);' +
      '};' +
      'window.projectListReset=function(){' +
        '["fl-kw","fl-bmin","fl-bmax"].forEach(function(id){var el=document.getElementById(id);if(el)el.value="";});' +
        '["fl-phase","fl-type"].forEach(function(id){var el=document.getElementById(id);if(el)el.selectedIndex=0;});' +
        'projectListFilter();' +
      '};' +
    '})();<\/script>' +
  '</div>';
});


/* ════════════════════════════════════════════════════════
   2. project-detail — 项目详情
   ════════════════════════════════════════════════════════ */
registerView('project-detail', function() {
  var params = getViewParams('project-detail');
  var pid = (params && params.id) ? params.id : 'P001';
  var raw = DATA.projects.find(function(pr) { return pr.id === pid; }) || DATA.projects[0];
  var p = adaptProject(raw);
  var role = getCurrentRole();

  /* ── 8-stage lifecycle bar ── */
  var lcPhases = ['需求征集','立项论证','采购','实施','终止','验收','运维','监督评估'];
  var statusToIdx = {
    demand: 0, reviewing: 1, procurement: 2, implementing: 3,
    terminated: 4, acceptance: 5, completed: 5, ops: 6
  };
  var currentIdx = statusToIdx[p.status] !== undefined ? statusToIdx[p.status] : 0;

  var lcHtml = '<div class="lifecycle-bar" style="display:flex;align-items:center;flex-wrap:nowrap;overflow-x:auto;padding:8px 0">';
  lcPhases.forEach(function(label, i) {
    var done   = i < currentIdx;
    var active = i === currentIdx;
    var dot = done
      ? '<div style="width:28px;height:28px;border-radius:50%;background:var(--success);display:flex;align-items:center;justify-content:center;color:#fff;font-size:13px;flex-shrink:0">&#10003;</div>'
      : active
        ? '<div style="width:28px;height:28px;border-radius:50%;background:var(--primary);display:flex;align-items:center;justify-content:center;color:#fff;font-size:12px;font-weight:700;flex-shrink:0">' + (i+1) + '</div>'
        : '<div style="width:28px;height:28px;border-radius:50%;background:#d9d9d9;display:flex;align-items:center;justify-content:center;color:#999;font-size:12px;flex-shrink:0">' + (i+1) + '</div>';
    var labelStyle = done ? 'color:var(--success);font-size:12px;margin-top:4px'
                  : active ? 'color:var(--primary);font-size:12px;font-weight:600;margin-top:4px'
                  : 'color:#bbb;font-size:12px;margin-top:4px';
    lcHtml += '<div style="display:flex;flex-direction:column;align-items:center;min-width:60px">' +
              dot + '<div style="' + labelStyle + '">' + label + '</div></div>';
    if (i < lcPhases.length - 1) {
      var lineColor = i < currentIdx ? 'var(--success)' : '#d9d9d9';
      lcHtml += '<div style="flex:1;height:2px;background:' + lineColor + ';min-width:16px;margin:0 2px;margin-bottom:16px"></div>';
    }
  });
  lcHtml += '</div>';

  /* ── Action buttons ── */
  var actionBtns = '';
  if (role === 'project-manager') {
    actionBtns += '<button class="btn btn-primary" onclick="navigate(\'procurement\',{id:\'' + p.id + '\'})">采购管理</button> ';
    actionBtns += '<button class="btn" onclick="navigate(\'implement\',{id:\'' + p.id + '\'})">进展报告</button> ';
    actionBtns += '<button class="btn" onclick="navigate(\'delay-change\',{id:\'' + p.id + '\'})">延期/变更</button> ';
    actionBtns += '<button class="btn btn-danger-outline" onclick="navigate(\'terminate\',{id:\'' + p.id + '\'})">终止申请</button>';
  }
  if (role === 'info-leader') {
    actionBtns += '<button class="btn btn-primary" onclick="pdApprove(\'' + p.id + '\',\'' + p.name + '\')">审批</button>';
  }
  if (role === 'info-admin') {
    actionBtns += '<button class="btn" onclick="pdConfirm(\'' + p.id + '\',\'' + p.name + '\')">确认</button>';
  }

  /* ── Progress bar ── */
  var pct = p.progressPct || 0;
  var progressHtml = pct > 0
    ? '<div style="display:flex;align-items:center;gap:8px"><div class="progress-bar-wrap" style="width:120px"><div class="progress-bar" style="width:' + pct + '%"></div></div><span style="font-size:12px;color:#666">' + pct + '%</span></div>'
    : '—';

  /* ── Assistants section (project-manager only) ── */
  var assistantSection = '';
  if (role === 'project-manager') {
    assistantSection = '<div class="card">' +
      '<div class="card-title" style="display:flex;align-items:center;justify-content:space-between">' +
        '<span>协助人管理</span>' +
        '<button class="btn btn-primary" style="font-size:12px;padding:3px 12px" onclick="addAssistant()">+ 添加协助人</button>' +
      '</div>' +
      '<div style="font-size:12px;color:var(--text-secondary);margin-bottom:10px">每项目最多2名协助人，仅限本单位人员</div>' +
      '<div id="assistant-list">' +
        '<div style="display:flex;align-items:center;justify-content:space-between;padding:8px 12px;background:#f6f8fa;border-radius:6px;margin-bottom:6px">' +
          '<div>' +
            '<span style="font-weight:600">王小芳</span>' +
            '<span style="font-size:12px;color:#666;margin-left:8px">教务处 · 项目协助人</span>' +
          '</div>' +
          '<button class="btn btn-danger-outline" style="font-size:12px;padding:2px 10px" onclick="removeAssistant(\'王小芳\')">移除</button>' +
        '</div>' +
      '</div>' +
    '</div>';
  }

  /* ── Related links ── */
  var relatedLinks =
    '<button class="btn" style="margin:2px" onclick="navigate(\'procurement\',{id:\'' + p.id + '\'})">采购管理</button>' +
    '<button class="btn" style="margin:2px" onclick="navigate(\'implement\',{id:\'' + p.id + '\'})">实施进展</button>' +
    '<button class="btn" style="margin:2px" onclick="navigate(\'delay-change\',{id:\'' + p.id + '\'})">延期变更</button>' +
    '<button class="btn" style="margin:2px" onclick="navigate(\'terminate\',{id:\'' + p.id + '\'})">终止申请</button>' +
    '<button class="btn" style="margin:2px" onclick="navigate(\'acceptance-list\',{projectId:\'' + p.id + '\'})">验收管理</button>' +
    '<button class="btn" style="margin:2px" onclick="navigate(\'contract-ledger\',{projectId:\'' + p.id + '\'})">合同台账</button>' +
    '<button class="btn" style="margin:2px" onclick="navigate(\'ops-records\',{projectId:\'' + p.id + '\'})">运维记录</button>';

  /* ── Operation logs ── */
  var logs = (DATA.operationLogs || []).filter(function(l) { return l.targetId === p.id || l.targetId === (p.demandId||'') || l.targetId === (p.proposalId||''); }).slice(0,10);
  var logRows = logs.map(function(l) {
    return [l.time, l.operator, l.role, l.module, l.action, l.detail || '—'];
  });

  var html = breadcrumb('项目管理', '项目列表', '项目详情');
  html += '<div class="page-header">';
  html +=   '<div class="page-title" style="display:flex;align-items:center;gap:8px">';
  html +=     p.name;
  html +=     ' ' + projectStatusTag(p.status);
  html +=     ' ' + projectTypeTag(p.typeKey);
  html +=   '</div>';
  html +=   '<div style="display:flex;gap:6px;flex-wrap:wrap">' + actionBtns + '</div>';
  html += '</div>';

  html += '<div class="card"><div class="card-title">项目生命周期</div>' + lcHtml + '</div>';

  html += '<div class="card"><div class="card-title">基本信息</div>';
  html += '<div class="detail-grid">';
  html += '<div class="detail-item"><div class="detail-label">项目编号</div><div>' + p.id + '</div></div>';
  html += '<div class="detail-item"><div class="detail-label">项目名称</div><div>' + p.name + '</div></div>';
  html += '<div class="detail-item"><div class="detail-label">申报单位</div><div>' + p.unit + '</div></div>';
  html += '<div class="detail-item"><div class="detail-label">项目负责人</div><div>' + p.manager + '</div></div>';
  html += '<div class="detail-item"><div class="detail-label">联系电话</div><div>' + p.contact + '</div></div>';
  html += '<div class="detail-item"><div class="detail-label">批准预算</div><div><strong>' + p.budget + ' 万元</strong></div></div>';
  html += '<div class="detail-item"><div class="detail-label">项目类型</div><div>' + projectTypeTag(p.typeKey) + ' ' + (p.typeInfo ? p.typeInfo.label : '') + '</div></div>';
  html += '<div class="detail-item"><div class="detail-label">建设性质</div><div>' + (p.buildNature || '新建') + '</div></div>';
  html += '<div class="detail-item"><div class="detail-label">计划开始</div><div>' + formatDate(p.startDate) + '</div></div>';
  html += '<div class="detail-item"><div class="detail-label">计划完成</div><div>' + (p.endDate ? '<span ' + deadlineClass(p.endDate) + '>' + formatDate(p.endDate) + '</span>' : '—') + '</div></div>';
  html += '<div class="detail-item"><div class="detail-label">当前阶段</div><div>' + projectStatusTag(p.status) + '</div></div>';
  html += '<div class="detail-item"><div class="detail-label">当前进度</div><div>' + progressHtml + '</div></div>';
  html += '</div></div>';

  html += '<div class="card"><div class="card-title">项目背景与目标</div>';
  html += '<p style="font-size:13px;color:#444;line-height:1.8">' + (p.background || '—') + '</p>';
  html += '<p style="font-size:13px;color:#444;line-height:1.8;margin-top:8px"><strong>建设目标：</strong>' + (p.goal || '—') + '</p>';
  html += '</div>';

  html += '<div class="card"><div class="card-title">相关功能链接</div>';
  html += '<div style="display:flex;flex-wrap:wrap;gap:4px">' + relatedLinks + '</div>';
  html += '</div>';

  html += assistantSection;

  html += '<div class="card"><div class="card-title">操作日志</div>';
  if (logRows.length) {
    html += renderTable(['时间','操作人','角色','模块','操作','详情'], logRows);
  } else {
    html += '<p style="color:var(--text-secondary);font-size:13px;text-align:center;padding:16px">暂无操作记录</p>';
  }
  html += '</div>';

  html += '<script>(function(){' +
    'window.pdApprove=function(pid,pname){' +
      'logOperation("项目管理","审批项目",pid,pname,"信息办领导审批通过",null);' +
      'toast("已审批通过","success");' +
    '};' +
    'window.pdConfirm=function(pid,pname){' +
      'logOperation("项目管理","确认项目",pid,pname,"信息办管理员确认",null);' +
      'toast("已确认","success");' +
    '};' +
    'window.addAssistant=function(){' +
      'showModal("添加协助人",' +
        '"<div class=\'form-item\'><label class=\'form-label required\'>姓名</label><input class=\'form-control\' id=\'ast-name\' placeholder=\'请输入本单位人员姓名\'></div>" +' +
        '"<div class=\'form-item\' style=\'margin-top:10px\'><label class=\'form-label\'>职务</label><input class=\'form-control\' id=\'ast-title\' placeholder=\'职务/岗位\'></div>",' +
        '"<button class=\'btn\' onclick=\'closeModal()\'>取消</button>" +' +
        '"<button class=\'btn btn-primary\' onclick=\'confirmAddAssistant()\'>确认添加</button>"' +
      ');' +
    '};' +
    'window.confirmAddAssistant=function(){' +
      'var name=document.getElementById("ast-name")&&document.getElementById("ast-name").value.trim();' +
      'if(!name){toast("请输入协助人姓名","warning");return;}' +
      'closeModal();' +
      'toast("已添加协助人："+name,"success");' +
    '};' +
    'window.removeAssistant=function(name){' +
      'if(confirm("确认移除协助人「"+name+"」？")){' +
        'var list=document.getElementById("assistant-list");' +
        'if(list){var items=list.querySelectorAll("div[style]");items.forEach(function(el){if(el.textContent.indexOf(name)>-1)el.remove();});}' +
        'toast("已移除协助人："+name,"info");' +
      '}' +
    '};' +
  '})();<\/script>';

  return html;
});


/* ════════════════════════════════════════════════════════
   3. procurement — 采购管理（3步：市场调研→技术审核→合同备案）
   ════════════════════════════════════════════════════════ */
registerView('procurement', function() {
  var params = getViewParams('procurement');
  var pid = (params && params.id) ? params.id : 'P001';
  var raw = DATA.projects.find(function(pr) { return pr.id === pid; }) || DATA.projects[0];
  var p = adaptProject(raw);
  var role = getCurrentRole();

  // Determine step state
  var step1Done = p.procurementStatus !== '未开始';
  var step2Done = !!p.techReviewPassed;
  var step3Done = !!(p.contractNo || p.contractId);
  var currentStep = step3Done ? 2 : (step2Done ? 2 : (step1Done ? 1 : 0));

  var stepBar = renderStepWizard(['市场调研', '技术审核', '合同备案'], currentStep);

  /* ── Step 1: Market survey ── */
  var pm = role === 'project-manager';
  var s1Disabled = !pm ? 'disabled' : '';

  // Pre-fill vendor rows from data
  var vendorRows = [
    { supplier: '某教育科技有限公司',         product: '教学质量分析平台软件',   price: '82', note: '具备高校信息化相关资质' },
    { supplier: '成都华信软件有限公司',         product: '数据分析与可视化平台',   price: '79', note: '有同类高校项目经验' },
    { supplier: '北京泛微网络科技股份有限公司', product: '教育数据中台解决方案',   price: '88', note: '品牌知名度高，服务完善' },
  ];

  var vendorTableHtml = '<table class="data-table" id="vendor-table" style="margin-bottom:8px">' +
    '<thead><tr><th style="width:200px">供应商名称</th><th style="width:200px">产品/服务</th><th style="width:100px">报价（万元）</th><th>备注</th><th style="width:60px">操作</th></tr></thead>' +
    '<tbody id="vendor-tbody">';
  vendorRows.forEach(function(r, i) {
    vendorTableHtml += '<tr id="vr-' + i + '">' +
      '<td><input class="input" name="v-supplier" style="width:100%" value="' + r.supplier + '" ' + s1Disabled + '></td>' +
      '<td><input class="input" name="v-product"  style="width:100%" value="' + r.product   + '" ' + s1Disabled + '></td>' +
      '<td><input class="input" name="v-price"    style="width:100%" type="number" value="' + r.price + '" ' + s1Disabled + '></td>' +
      '<td><input class="input" name="v-note"     style="width:100%" value="' + r.note + '" ' + s1Disabled + '></td>' +
      '<td>' + (pm ? '<button class="btn btn-danger-outline" style="padding:2px 8px;font-size:12px" onclick="removeVendorRow(' + i + ')">删除</button>' : '—') + '</td>' +
      '</tr>';
  });
  vendorTableHtml += '</tbody></table>';

  var step1Html = '<div class="card">' +
    '<div class="card-title">第一步：市场调研</div>' +
    '<div style="background:#f4f4f5;border:1px solid #d4d4d8;border-radius:4px;padding:8px 12px;font-size:12px;color:#d46b08;margin-bottom:12px">' +
      'BR-17：采购前须完成市场调研，填报调研结果（至少 3 家供应商比价）' +
    '</div>' +
    '<div class="form-grid">' +
      '<div class="form-item"><div class="form-label required">采购方式</div>' +
        '<select id="proc-method" class="select" ' + s1Disabled + '>' +
          '<option>公开招标</option>' +
          '<option>竞争性谈判</option>' +
          '<option>单一来源采购</option>' +
          '<option>询价采购</option>' +
        '</select></div>' +
      '<div class="form-item"><div class="form-label required">预计金额（万元）</div>' +
        '<input id="proc-amount" class="input" type="number" value="' + p.budget + '" ' + s1Disabled + '></div>' +
    '</div>' +
    '<div class="form-item" style="margin-top:12px"><div class="form-label required">供应商比价记录（≥3家）</div>' +
      vendorTableHtml +
      (pm ? '<button class="btn" style="font-size:12px;padding:3px 10px" onclick="addVendorRow()">+ 添加行</button>' : '') +
    '</div>' +
    (pm ? '<div class="form-actions"><button class="btn btn-primary" onclick="submitProcurement(\'' + p.id + '\',\'' + p.name + '\')">提交市场调研</button></div>' : '<p style="color:var(--text-secondary);font-size:13px">当前角色无权填报</p>') +
    '</div>';

  /* ── Step 2: Tech review ── */
  var step2Html = '<div class="card"><div class="card-title">第二步：技术审核</div>';
  if (step2Done) {
    step2Html += '<div class="alert alert-success" style="padding:10px 14px;background:#f4f4f5;border:1px solid #d4d4d8;border-radius:6px;font-size:13px;color:#389e0d"><span class="ci-pass"></span> 技术方案审核已通过，可进行合同备案</div>';
  } else if (role === 'info-admin' || role === 'info-leader') {
    step2Html += '<div class="form-item"><div class="form-label">技术方案内容</div>' +
      '<div style="background:#f6f8fa;padding:10px;border-radius:4px;font-size:13px;color:#555;line-height:1.7">' +
        (raw.techPlan || (DATA.proposals && DATA.proposals.find(function(pr){return pr.id===raw.proposalId;}) ? (DATA.proposals.find(function(pr){return pr.id===raw.proposalId;})).techPlan || '（技术方案详见申报书）' : '（技术方案详见申报书）')) +
      '</div></div>' +
      '<div class="form-item" style="margin-top:12px"><div class="form-label required">审核意见</div>' +
        '<textarea id="tech-opinion" class="textarea" rows="3" placeholder="请填写技术方案审核意见..."></textarea>' +
      '</div>' +
      '<div class="form-actions">' +
        '<button class="btn btn-primary" onclick="techReviewPass(\'' + p.id + '\',\'' + p.name + '\')">审核通过</button>' +
        '<button class="btn btn-danger-outline" onclick="techReviewReturn(\'' + p.id + '\',\'' + p.name + '\')">退回修改</button>' +
      '</div>';
  } else {
    step2Html += '<p style="color:var(--text-secondary);font-size:13px">技术方案待信息办管理员/领导审核</p>';
  }
  step2Html += '</div>';

  /* ── Step 3: Contract filing ── */
  var step3Html = '<div class="card"><div class="card-title">第三步：合同备案</div>';
  if (step3Done) {
    var contract = DATA.contracts && DATA.contracts.find(function(c) { return c.id === (p.contractNo || p.contractId); });
    step3Html += '<div class="detail-grid">' +
      '<div class="detail-item"><div class="detail-label">合同编号</div><div>' + (p.contractNo || p.contractId) + '</div></div>' +
      '<div class="detail-item"><div class="detail-label">承建单位</div><div>' + (contract ? contract.vendor : p.vendor || '—') + '</div></div>' +
      '<div class="detail-item"><div class="detail-label">合同金额</div><div>' + (contract ? contract.amount + ' 万元' : '—') + '</div></div>' +
      '<div class="detail-item"><div class="detail-label">签订日期</div><div>' + formatDate(contract ? contract.signDate : '') + '</div></div>' +
      '<div class="detail-item"><div class="detail-label">合同截止</div><div>' + formatDate(contract ? contract.endDate : '') + '</div></div>' +
      '<div class="detail-item"><div class="detail-label">质保期</div><div>' + (contract ? contract.warrantyYears + ' 年' : '—') + '</div></div>' +
      '</div>' +
      '<div style="margin-top:10px"><button class="btn" onclick="navigate(\'contract-ledger\',{id:\'' + (p.contractNo||p.contractId) + '\'})">查看合同台账 →</button></div>';
  } else if (role === 'contract-admin') {
    step3Html += '<div class="form-grid">' +
      '<div class="form-item"><div class="form-label required">合同编号</div><input id="contract-no" class="input" placeholder="如 C003"></div>' +
      '<div class="form-item"><div class="form-label required">承建单位</div><input id="contract-vendor" class="input" placeholder="承建单位全称"></div>' +
      '<div class="form-item"><div class="form-label required">合同金额（万元）</div><input id="contract-amount" class="input" type="number" placeholder="' + p.budget + '"></div>' +
      '<div class="form-item"><div class="form-label required">签订日期</div><input id="contract-signdate" class="input" type="date"></div>' +
      '<div class="form-item"><div class="form-label required">合同截止日期</div><input id="contract-enddate" class="input" type="date"></div>' +
      '<div class="form-item"><div class="form-label required">质保年限</div>' +
        '<select id="contract-warranty" class="select"><option value="1">1年</option><option value="2">2年</option><option value="3" selected>3年</option><option value="5">5年</option></select>' +
      '</div>' +
      '</div>' +
      '<div class="form-actions"><button class="btn btn-primary" onclick="uploadContract(\'' + p.id + '\',\'' + p.name + '\')">提交备案</button></div>';
  } else {
    step3Html += '<p style="color:var(--text-secondary);font-size:13px">合同待合同管理员备案</p>';
  }
  step3Html += '</div>';

  var html = breadcrumb('项目管理', '项目列表', '采购管理');
  html += '<div class="page-header"><div class="page-title">采购管理 — ' + p.name + '</div></div>';
  html += '<div class="card"><div class="card-title">采购流程进度</div>' + stepBar + '</div>';
  html += step1Html + step2Html + step3Html;

  html += '<script>(function(){' +
    'window._vendorIdx=3;' +
    'window.addVendorRow=function(){' +
      'var tbody=document.getElementById("vendor-tbody");if(!tbody)return;' +
      'var i=window._vendorIdx++;' +
      'var tr=document.createElement("tr");tr.id="vr-"+i;' +
      'tr.innerHTML="<td><input class=\'input\' name=\'v-supplier\' style=\'width:100%\' placeholder=\'供应商名称\'></td>" +' +
               '"<td><input class=\'input\' name=\'v-product\'  style=\'width:100%\' placeholder=\'产品/服务\'></td>" +' +
               '"<td><input class=\'input\' name=\'v-price\'    style=\'width:100%\' type=\'number\' placeholder=\'0\'></td>" +' +
               '"<td><input class=\'input\' name=\'v-note\'     style=\'width:100%\' placeholder=\'备注\'></td>" +' +
               '"<td><button class=\'btn btn-danger-outline\' style=\'padding:2px 8px;font-size:12px\' onclick=\'removeVendorRow("+i+")\'>删除</button></td>";' +
      'tbody.appendChild(tr);' +
    '};' +
    'window.removeVendorRow=function(i){' +
      'var el=document.getElementById("vendor-tbody");if(!el)return;' +
      'var rows=el.querySelectorAll("tr");' +
      'if(rows.length<=3){toast("至少保留3行（BR-17要求）","warning");return;}' +
      'var tr=document.getElementById("vr-"+i);if(tr)tr.remove();' +
    '};' +
    'window.submitProcurement=function(pid,pname){' +
      'var method=document.getElementById("proc-method")?document.getElementById("proc-method").value:"";' +
      'var amount=document.getElementById("proc-amount")?document.getElementById("proc-amount").value:"";' +
      'if(!amount){toast("请填写预计金额","error");return;}' +
      'var tbody=document.getElementById("vendor-tbody");' +
      'var rows=tbody?tbody.querySelectorAll("tr"):[];' +
      'if(rows.length<3){toast("BR-17：须填报至少3家供应商比价","error");return;}' +
      'var valid=true;' +
      'rows.forEach(function(r){' +
        'var s=r.querySelector("[name=v-supplier]"),p=r.querySelector("[name=v-price]");' +
        'if(!s||!s.value.trim()||!p||!p.value){valid=false;}' +
      '});' +
      'if(!valid){toast("请完整填写所有供应商信息","error");return;}' +
      'logOperation("采购管理","提交市场调研",pid,pname,"采购方式："+method+"，预计金额："+amount+"万元",null);' +
      'toast("市场调研已提交，等待技术审核","success");' +
    '};' +
    'window.techReviewPass=function(pid,pname){' +
      'var opinion=document.getElementById("tech-opinion")?document.getElementById("tech-opinion").value:"";' +
      'logOperation("采购管理","技术方案审核通过",pid,pname,opinion||"审核通过",null);' +
      'toast("技术方案审核通过","success");' +
    '};' +
    'window.techReviewReturn=function(pid,pname){' +
      'showReturnDialog("技术方案退回",function(cat,reason){' +
        'logOperation("采购管理","技术方案退回",pid,pname,"分类："+cat+"；原因："+reason,null);' +
        'toast("已退回，请项目负责人修改后重新提交","warning");' +
      '});' +
    '};' +
    'window.uploadContract=function(pid,pname){' +
      'var no=document.getElementById("contract-no")?document.getElementById("contract-no").value.trim():"";' +
      'var vendor=document.getElementById("contract-vendor")?document.getElementById("contract-vendor").value.trim():"";' +
      'var amount=document.getElementById("contract-amount")?document.getElementById("contract-amount").value:"";' +
      'var sd=document.getElementById("contract-signdate")?document.getElementById("contract-signdate").value:"";' +
      'var ed=document.getElementById("contract-enddate")?document.getElementById("contract-enddate").value:"";' +
      'if(!no||!vendor||!amount||!sd||!ed){toast("请完整填写合同信息","error");return;}' +
      'logOperation("采购管理","合同备案",pid,pname,"合同编号："+no+"，承建单位："+vendor+"，金额："+amount+"万元",null);' +
      'toast("合同已备案","success");' +
    '};' +
  '})();<\/script>';

  return html;
});


/* ════════════════════════════════════════════════════════
   4. implement — 实施进展
   ════════════════════════════════════════════════════════ */
registerView('implement', function() {
  var params = getViewParams('implement');
  var pid = (params && params.id) ? params.id : 'P002';
  var raw = DATA.projects.find(function(pr) { return pr.id === pid; }) || DATA.projects[1] || DATA.projects[0];
  var p = adaptProject(raw);
  var role = getCurrentRole();

  // BR-20 reporting frequency hint
  var typeKey = p.typeKey;
  var freqHint = '';
  if (typeKey === 'major' || typeKey === 'mid') {
    freqHint = '<div style="background:#f4f4f5;border:1px solid #d4d4d8;border-radius:4px;padding:8px 12px;font-size:12px;color:#d46b08">BR-20：重大/中型项目须每周提交进展报告</div>';
  } else if (typeKey === 'small') {
    freqHint = '<div style="background:#f4f4f5;border:1px solid #d4d4d8;border-radius:4px;padding:8px 12px;font-size:12px;color:#389e0d">BR-20：小型项目须每半月提交进展报告</div>';
  } else {
    freqHint = '<div style="background:#f6f8fa;border:1px solid #d9d9d9;border-radius:4px;padding:8px 12px;font-size:12px;color:#888">BR-20：微型项目无强制进展汇报要求</div>';
  }

  // Historical records
  var history = (DATA.progressHistory || []).filter(function(h) { return h.projectId === pid; });
  if (history.length === 0) {
    history = [
      { projectId: pid, period: '2025-06', pct: 30, submittedBy: p.manager, submittedAt: '2025-06-30' },
      { projectId: pid, period: '2025-05', pct: 15, submittedBy: p.manager, submittedAt: '2025-05-31' },
    ];
  }
  var histRows = history.map(function(h) {
    return [
      h.period,
      '<div style="display:flex;align-items:center;gap:6px"><div class="progress-bar-wrap" style="width:80px"><div class="progress-bar" style="width:' + h.pct + '%"></div></div><span style="font-size:11px">' + h.pct + '%</span></div>',
      h.submittedBy,
      h.submittedAt,
      '<button class="btn" style="padding:2px 8px;font-size:12px" disabled>查看</button>',
    ];
  });

  var canEdit = (role === 'project-manager' || role === 'project-assistant');
  var formHtml = '';
  if (canEdit) {
    var draft = (typeof loadDraft === 'function') ? loadDraft('impl-' + pid) : null;
    formHtml = '<div class="card"><div class="card-title">填报本期进展报告</div>' +
      freqHint +
      '<div class="form-grid" style="margin-top:12px">' +
        '<div class="form-item"><div class="form-label required">汇报期间（年-月）</div>' +
          '<input id="prog-period" class="input" type="month" value="' + (draft && draft.period || new Date().toISOString().slice(0,7)) + '"></div>' +
        '<div class="form-item"><div class="form-label required">完成进度（%）</div>' +
          '<input id="prog-pct" class="input" type="number" min="0" max="100" placeholder="0~100" value="' + (draft && draft.pct !== undefined ? draft.pct : (p.progressPct || '')) + '"></div>' +
      '</div>' +
      '<div class="form-item" style="margin-top:10px"><div class="form-label required">本期已完成工作</div>' +
        '<textarea id="prog-done" class="textarea" rows="3" placeholder="描述本期已完成的主要工作...">' + (draft && draft.done || '') + '</textarea></div>' +
      '<div class="form-item" style="margin-top:8px"><div class="form-label">存在问题</div>' +
        '<textarea id="prog-issues" class="textarea" rows="2" placeholder="描述当前存在的问题和风险...">' + (draft && draft.issues || '') + '</textarea></div>' +
      '<div class="form-item" style="margin-top:8px"><div class="form-label">下期工作计划</div>' +
        '<textarea id="prog-plan" class="textarea" rows="2" placeholder="描述下期计划完成的工作...">' + (draft && draft.plan || '') + '</textarea></div>' +
      '<div class="form-actions">' +
        '<button class="btn" onclick="saveImplDraft(\'' + pid + '\')">暂存草稿</button>' +
        '<button class="btn btn-primary" onclick="submitProgress(\'' + p.id + '\',\'' + p.name + '\')">提交报告</button>' +
      '</div>' +
    '</div>';
  }

  var html = breadcrumb('项目管理', '项目列表', '实施进展');
  html += '<div class="page-header"><div class="page-title">实施进展 — ' + p.name + '</div></div>';

  html += '<div class="card">';
  html += '<div style="display:flex;gap:24px;flex-wrap:wrap">';
  html += '<div><span class="detail-label">当前阶段</span> ' + projectStatusTag(p.status) + '</div>';
  html += '<div><span class="detail-label">当前进度</span> ' + (p.progressPct || 0) + '%</div>';
  html += '<div><span class="detail-label">计划完成</span> ' + (p.endDate ? formatDate(p.endDate) : '—') + '</div>';
  html += '<div><span class="detail-label">项目类型</span> ' + projectTypeTag(p.typeKey) + '</div>';
  html += '</div>';
  html += '</div>';

  html += formHtml;

  html += '<div class="card"><div class="card-title">历史进展记录</div>';
  html += renderTable(['汇报期间','完成进度','提交人','提交时间','操作'], histRows);
  html += '</div>';

  html += '<script>(function(){' +
    'window.saveImplDraft=function(pid){' +
      'var d={' +
        'period:document.getElementById("prog-period")?document.getElementById("prog-period").value:"",' +
        'pct:document.getElementById("prog-pct")?document.getElementById("prog-pct").value:"",' +
        'done:document.getElementById("prog-done")?document.getElementById("prog-done").value:"",' +
        'issues:document.getElementById("prog-issues")?document.getElementById("prog-issues").value:"",' +
        'plan:document.getElementById("prog-plan")?document.getElementById("prog-plan").value:""' +
      '};' +
      'saveDraft("impl-"+pid,d);' +
      'toast("草稿已暂存","info");' +
    '};' +
    'window.submitProgress=function(pid,pname){' +
      'var period=document.getElementById("prog-period")?document.getElementById("prog-period").value:"";' +
      'var pct=document.getElementById("prog-pct")?document.getElementById("prog-pct").value:"";' +
      'var done=document.getElementById("prog-done")?document.getElementById("prog-done").value.trim():"";' +
      'if(!period||!pct||!done){toast("请完整填写必填项","error");return;}' +
      'var pctN=parseInt(pct);' +
      'if(pctN<0||pctN>100){toast("完成进度须在 0~100 之间","error");return;}' +
      'logOperation("项目管理","提交进展报告",pid,pname,"汇报期间："+period+"，完成进度："+pct+"%",null);' +
      'localStorage.removeItem("draft_impl-"+pid);' +
      'toast("进展报告已提交","success");' +
      'setTimeout(function(){navigate("project-detail",{id:pid});},1200);' +
    '};' +
  '})();<\/script>';

  return html;
});


/* ════════════════════════════════════════════════════════
   5. delay-change — 延期/变更申请（含3-tab + 3-level change management）
   ════════════════════════════════════════════════════════ */
registerView('delay-change', function() {
  var params = getViewParams('delay-change');
  var pid = (params && params.id) ? params.id : 'P002';
  var raw = DATA.projects.find(function(pr) { return pr.id === pid; }) || DATA.projects[1] || DATA.projects[0];
  var p = adaptProject(raw);
  var role = getCurrentRole();
  var editable = (role === 'project-manager' || role === 'project-assistant');
  var activeTab = (window._dcTab !== undefined) ? window._dcTab : 0;
  window._dcTab = undefined; // consume

  /* ── Change records ── */
  var changeRecords = (DATA.changeRecords || []).filter(function(c) { return c.projectId === pid; });
  var crRows = changeRecords.map(function(c) {
    var levelCls = c.level === 'major' ? 'tag-red' : c.level === 'general' ? 'tag-orange' : 'tag-blue';
    var levelLabel = c.level === 'major' ? '重大变更' : c.level === 'general' ? '一般变更' : '信息变更';
    var statusCls = c.status === 'approved' || c.status === 'completed' ? 'tag-green' : c.status === 'pending' ? 'tag-orange' : 'tag-gray';
    var statusLabel = c.status === 'approved' ? '已审批' : c.status === 'completed' ? '已完成' : c.status === 'pending' ? '待审批' : c.status;
    return [
      (c.changeTypes || []).join('、'),
      '<span class="tag ' + levelCls + '">' + levelLabel + '</span>',
      c.changeRatio ? c.changeRatio + '%' : '—',
      '<span class="tag ' + statusCls + '">' + statusLabel + '</span>',
      c.appliedBy || '—',
      c.appliedAt || '—',
      c.approvedBy || '—',
      c.approvedAt || '—',
    ];
  });

  /* ── Tab 0: Delay form ── */
  var tab0Html = '<div class="card">' +
    '<div style="background:#f4f4f5;border:1px solid #d4d4d8;border-radius:4px;padding:8px 12px;font-size:12px;color:#d46b08;margin-bottom:14px">' +
      'BR-14：单次延期不得超过 180 天，需信息办领导审批' +
    '</div>' +
    '<div class="form-grid">' +
      '<div class="form-item"><div class="form-label required">延期天数</div>' +
        '<input id="delay-days" class="input" type="number" min="1" max="180" placeholder="最多 180 天"' +
        (editable ? ' oninput="delayDaysHint(\'' + (p.endDate||'') + '\')"' : ' disabled') + '>' +
        '<div id="delay-days-hint" style="font-size:12px;margin-top:4px"></div>' +
      '</div>' +
      '<div class="form-item"><div class="form-label required">延期原因类别</div>' +
        '<select id="delay-reason-type" class="select"' + (!editable ? ' disabled' : '') + '>' +
          '<option>需求变更</option>' +
          '<option>技术障碍</option>' +
          '<option>采购延误</option>' +
          '<option>不可抗力</option>' +
          '<option>其他原因</option>' +
        '</select>' +
      '</div>' +
    '</div>' +
    '<div class="form-item" style="margin-top:12px"><div class="form-label required">详细说明</div>' +
      '<textarea id="delay-detail" class="textarea" rows="4" placeholder="请详细说明延期原因及影响分析..."' + (!editable ? ' disabled' : '') + '></textarea>' +
    '</div>' +
    (editable
      ? '<div class="form-actions"><button class="btn btn-primary" onclick="submitDelay(\'' + p.id + '\',\'' + p.name + '\',\'' + (p.endDate||'') + '\')">提交延期申请</button></div>'
      : '<p style="color:var(--text-secondary);font-size:13px">当前角色无权提交延期申请</p>') +
    '</div>';

  /* ── Tab 1: Change form (V2.1 3-level) ── */
  var changeTypeOptions = ['预算调整','进度调整','人员变更','技术路线根本调整','建设范围大幅变化','联系方式','其他'];
  var checkboxes = changeTypeOptions.map(function(t) {
    return '<label style="display:flex;align-items:center;gap:4px;cursor:pointer;margin-right:4px">' +
      '<input type="checkbox" name="change-type-cb" value="' + t + '" onchange="detectChangeLevelUI(' + p.budget + ')"' + (!editable ? ' disabled' : '') + '>' +
      '<span style="font-size:13px">' + t + '</span>' +
    '</label>';
  }).join('');

  var tab1Html = '<div class="card">' +
    '<div style="background:#fef2f2;border:1px solid #fecaca;border-radius:4px;padding:8px 12px;font-size:12px;color:#cf1322;margin-bottom:14px">' +
      'V2.1 三级变更管理：信息变更 / 一般变更（≤20%）/ 重大变更（≥20%或技术/范围调整）' +
    '</div>' +

    '<div class="form-item"><div class="form-label required">变更类型（可多选）</div>' +
      '<div style="display:flex;flex-wrap:wrap;gap:8px;padding:8px;border:1px solid #d9d9d9;border-radius:4px">' + checkboxes + '</div>' +
    '</div>' +

    '<div id="change-level-indicator" class="change-level" style="display:none;margin:12px 0;padding:10px 14px;border-radius:6px;font-size:13px"></div>' +

    '<div id="budget-change-section" style="display:none">' +
      '<div class="form-grid" style="margin-top:10px">' +
        '<div class="form-item"><div class="form-label">原批准预算（万元）</div>' +
          '<input class="input" value="' + p.budget + '" readonly></div>' +
        '<div class="form-item"><div class="form-label required">变更后预算（万元）</div>' +
          '<input id="change-new-budget" class="input" type="number" value="' + p.budget + '"' + (!editable ? ' disabled' : ' oninput="detectChangeLevelUI(' + p.budget + ')"') + '>' +
          '<div id="change-budget-ratio" style="font-size:12px;margin-top:4px"></div>' +
        '</div>' +
      '</div>' +
    '</div>' +

    '<div class="form-item" style="margin-top:10px"><div class="form-label required">变更原因</div>' +
      '<textarea id="change-reason" class="textarea" rows="3" placeholder="请说明变更的必要性和理由..."' + (!editable ? ' disabled' : '') + '></textarea>' +
    '</div>' +
    '<div class="form-grid" style="margin-top:10px">' +
      '<div class="form-item"><div class="form-label">变更前内容</div>' +
        '<textarea id="change-before" class="textarea" rows="3" readonly>' + p.name + '（预算 ' + p.budget + ' 万元，当前进度 ' + (p.progressPct||0) + '%）</textarea>' +
      '</div>' +
      '<div class="form-item"><div class="form-label required">变更后内容</div>' +
        '<textarea id="change-after" class="textarea" rows="3" placeholder="请描述变更后的具体内容..."' + (!editable ? ' disabled' : '') + '></textarea>' +
      '</div>' +
    '</div>' +
    '<div class="form-item" style="margin-top:10px"><div class="form-label required">变更影响分析</div>' +
      '<textarea id="change-impact" class="textarea" rows="3" placeholder="分析变更对进度、预算、质量的影响..."' + (!editable ? ' disabled' : '') + '></textarea>' +
    '</div>' +
    '<div class="form-item" style="margin-top:8px"><div class="form-label">附件</div>' +
      '<input type="file" class="input" style="padding:4px"' + (!editable ? ' disabled' : '') + '>' +
    '</div>' +
    (editable
      ? '<div class="form-actions"><button class="btn btn-primary" onclick="submitChange(\'' + p.id + '\',\'' + p.name + '\',' + p.budget + ')">提交变更申请</button></div>'
      : '<p style="color:var(--text-secondary);font-size:13px">当前角色无权提交变更申请</p>') +
    '</div>';

  /* ── Tab 2: Change records ── */
  var tab2Html = '<div class="card"><div class="card-title">变更记录</div>' +
    renderTable(
      ['变更类型','变更级别','变更比例','状态','申请人','申请时间','审批人','审批时间'],
      crRows
    ) +
    '</div>';

  /* ── Tab nav ── */
  var tabs = ['延期申请','变更申请','变更记录'];
  var tabNavHtml = '<div style="display:flex;border-bottom:2px solid #e8e8e8;margin-bottom:0" id="dc-tabs">';
  tabs.forEach(function(t, i) {
    var active = i === activeTab;
    tabNavHtml += '<div class="tab-item' + (active ? ' active' : '') + '" ' +
      'style="padding:10px 24px;cursor:pointer;font-size:14px;' +
      (active ? 'border-bottom:2px solid var(--primary);color:var(--primary);font-weight:600;margin-bottom:-2px' : 'color:#666') + '" ' +
      'onclick="dcSwitchTab(' + i + ')">' + t + '</div>';
  });
  tabNavHtml += '</div>';

  var tabContents = [tab0Html, tab1Html, tab2Html];
  var tabBodies = tabContents.map(function(content, i) {
    return '<div id="dc-tab-' + i + '" style="' + (i === activeTab ? '' : 'display:none') + '">' + content + '</div>';
  }).join('');

  var html = breadcrumb('项目管理', '项目列表', '延期/变更');
  html += '<div class="page-header">';
  html += '<div class="page-title">延期 / 变更申请 — ' + p.name + '</div>';
  html += '</div>';
  html += '<div class="card" style="padding:0">' + tabNavHtml + '</div>';
  html += tabBodies;

  html += '<script>(function(){' +
    'window.dcSwitchTab=function(i){' +
      '[0,1,2].forEach(function(j){' +
        'var el=document.getElementById("dc-tab-"+j);if(el)el.style.display=j===i?"":"none";' +
      '});' +
      'var tabs=document.querySelectorAll("#dc-tabs .tab-item");' +
      'tabs.forEach(function(t,j){' +
        't.style.color=j===i?"var(--primary)":"#666";' +
        't.style.fontWeight=j===i?"600":"400";' +
        't.style.borderBottom=j===i?"2px solid var(--primary)":"none";' +
      '});' +
    '};' +

    'window.delayDaysHint=function(origEnd){' +
      'var v=parseInt(document.getElementById("delay-days").value);' +
      'var hint=document.getElementById("delay-days-hint");' +
      'if(!hint)return;' +
      'if(!v||v<=0){hint.innerHTML="";return;}' +
      'if(v>180){hint.innerHTML="<span style=\'color:var(--danger)\'><span class=\'ci-fail\'></span> BR-14：延期不得超过 180 天</span>";return;}' +
      'if(origEnd){' +
        'var d=new Date(origEnd);d.setDate(d.getDate()+v);' +
        'hint.innerHTML="<span style=\'color:var(--success)\'><span class=\'ci-pass\'></span> 新截止日期："+d.toISOString().slice(0,10)+"</span>";' +
      '}else{hint.innerHTML="<span style=\'color:var(--success)\'><span class=\'ci-pass\'></span> 延期 "+v+" 天</span>";}' +
    '};' +

    'window.submitDelay=function(pid,pname,origEnd){' +
      'var days=parseInt(document.getElementById("delay-days").value);' +
      'var type=document.getElementById("delay-reason-type")?document.getElementById("delay-reason-type").value:"";' +
      'var detail=document.getElementById("delay-detail")?document.getElementById("delay-detail").value.trim():"";' +
      'if(!days||days<=0){toast("请填写延期天数","error");return;}' +
      'if(days>180){toast("BR-14：单次延期不得超过 180 天","error");return;}' +
      'if(!detail){toast("请填写详细说明","error");return;}' +
      'var newEnd="";' +
      'if(origEnd){var d=new Date(origEnd);d.setDate(d.getDate()+days);newEnd=d.toISOString().slice(0,10);}' +
      'logOperation("项目管理","提交延期申请",pid,pname,"延期"+days+"天，原因："+type+"，新截止："+newEnd,null);' +
      'toast("延期申请已提交，待审批","success");' +
      'setTimeout(function(){navigate("project-detail",{id:pid});},1200);' +
    '};' +

    'window.detectChangeLevelUI=function(origBudget){' +
      'var cbs=document.querySelectorAll("[name=change-type-cb]:checked");' +
      'var types=Array.prototype.slice.call(cbs).map(function(c){return c.value;});' +
      'var indicator=document.getElementById("change-level-indicator");' +
      'var budgetSection=document.getElementById("budget-change-section");' +
      'var hasBudget=types.indexOf("预算调整")>-1;' +
      'if(budgetSection)budgetSection.style.display=hasBudget?"":"none";' +
      'if(!types.length){if(indicator)indicator.style.display="none";return;}' +
      'var newBudget=hasBudget&&document.getElementById("change-new-budget")?parseFloat(document.getElementById("change-new-budget").value)||origBudget:origBudget;' +
      'var ratioEl=document.getElementById("change-budget-ratio");' +
      'if(hasBudget&&ratioEl){' +
        'var r=((newBudget-origBudget)/origBudget*100).toFixed(1);' +
        'var rColor=Math.abs(r)>=20?"var(--danger)":"var(--warning)";' +
        'ratioEl.innerHTML="<span style=\'color:"+rColor+"\'>变更比例："+(r>=0?"+":"")+r+"%</span>";' +
      '}' +
      'var result=detectChangeLevel(origBudget,newBudget,types);' +
      'if(indicator){' +
        'indicator.style.display="block";' +
        'if(result.level==="info"){' +
          'indicator.style.background="#f4f4f5";indicator.style.border="1px solid #d4d4d8";indicator.style.color="#18181b";' +
          'indicator.innerHTML="<strong>信息变更</strong> — 项目负责人直接修改，系统记录日志";' +
        '}else if(result.level==="general"){' +
          'indicator.style.background="#f4f4f5";indicator.style.border="1px solid #d4d4d8";indicator.style.color="#d46b08";' +
          'indicator.innerHTML="<strong>一般变更</strong> — 信息办管理员审核 → 信息办领导审批";' +
        '}else{' +
          'indicator.style.background="#fef2f2";indicator.style.border="1px solid #fecaca";indicator.style.color="#cf1322";' +
          'indicator.innerHTML="<span class=\'ci-fail\'></span> <strong>重大变更</strong> — 须重新专家论证 → 原审定机构重新审定";' +
        '}' +
      '}' +
    '};' +

    'window.submitChange=function(pid,pname,origBudget){' +
      'var cbs=document.querySelectorAll("[name=change-type-cb]:checked");' +
      'var types=Array.prototype.slice.call(cbs).map(function(c){return c.value;});' +
      'if(!types.length){toast("请选择变更类型","error");return;}' +
      'var reason=document.getElementById("change-reason")?document.getElementById("change-reason").value.trim():"";' +
      'var impact=document.getElementById("change-impact")?document.getElementById("change-impact").value.trim():"";' +
      'var after=document.getElementById("change-after")?document.getElementById("change-after").value.trim():"";' +
      'if(!reason){toast("请填写变更原因","error");return;}' +
      'if(!after){toast("请填写变更后内容","error");return;}' +
      'if(!impact){toast("请填写变更影响分析","error");return;}' +
      'var hasBudget=types.indexOf("预算调整")>-1;' +
      'var newBudget=hasBudget&&document.getElementById("change-new-budget")?parseFloat(document.getElementById("change-new-budget").value)||origBudget:origBudget;' +
      'var result=detectChangeLevel(origBudget,newBudget,types);' +
      'var changes=[{field:"变更类型",before:"—",after:types.join("、")},{field:"预算",before:origBudget+"万",after:newBudget+"万"},{field:"变更级别",before:"—",after:result.label}];' +
      'logOperation("项目管理","提交变更申请",pid,pname,"变更类型："+types.join("、")+"；级别："+result.label,changes);' +
      'toast("变更申请已提交（"+result.label+"），待处理","success");' +
      'setTimeout(function(){navigate("project-detail",{id:pid});},1200);' +
    '};' +
  '})();<\/script>';

  return html;
});


/* ════════════════════════════════════════════════════════
   6. project-change — redirect to delay-change tab 1
   ════════════════════════════════════════════════════════ */
registerView('project-change', function() {
  window._dcTab = 1;
  return VIEWS['delay-change']();
});


/* ════════════════════════════════════════════════════════
   7. terminate — 项目终止申请（BR-24）
   ════════════════════════════════════════════════════════ */
registerView('terminate', function() {
  var params = getViewParams('terminate');
  var pid = (params && params.id) ? params.id : 'P002';
  var raw = DATA.projects.find(function(pr) { return pr.id === pid; }) || DATA.projects[1] || DATA.projects[0];
  var p = adaptProject(raw);
  var role = getCurrentRole();
  var editable = (role === 'project-manager');

  // BR-24 five valid termination grounds
  var br24Grounds = [
    '因政策调整导致项目失去建设依据',
    '因技术路线变化导致项目无法继续',
    '经评估项目已无建设必要',
    '项目超期严重且无法按计划完成',
    '其他经领导小组认定的情形',
  ];

  var groundsHtml = br24Grounds.map(function(g, i) {
    return '<label style="display:flex;align-items:flex-start;gap:8px;padding:8px 10px;cursor:pointer;border-radius:4px;transition:background .15s" onmouseover="this.style.background=\'#f6f8fa\'" onmouseout="this.style.background=\'\'">' +
      '<input type="radio" name="term-ground" value="' + g + '" style="margin-top:2px"' + (!editable ? ' disabled' : '') + (i === 0 ? ' checked' : '') + '>' +
      '<span style="font-size:13px;line-height:1.6">' + (i+1) + '. ' + g + '</span>' +
    '</label>';
  }).join('');

  var html = breadcrumb('项目管理', '项目列表', '项目终止');
  html += '<div class="page-header"><div class="page-title">项目终止申请 — ' + p.name + '</div></div>';

  html += '<div style="padding:14px 16px;background:#fff3cd;border:1px solid #ffc107;border-radius:8px;margin-bottom:16px">';
  html += '<div style="font-weight:600;margin-bottom:8px;color:#856404">BR-24：项目终止须符合以下情形之一，并经审批机构审核确认</div>';
  html += '</div>';

  html += '<div class="card">';
  html += '<div style="display:flex;gap:24px;flex-wrap:wrap;margin-bottom:12px">';
  html += '<div><span class="detail-label">项目阶段</span> ' + projectStatusTag(p.status) + '</div>';
  html += '<div><span class="detail-label">当前进度</span> ' + (p.progressPct||0) + '%</div>';
  html += '<div><span class="detail-label">批准预算</span> ' + p.budget + ' 万元</div>';
  html += '</div>';
  html += '</div>';

  html += '<div class="card"><div class="card-title">终止申请表</div>';

  html += '<div class="form-item"><div class="form-label required">选择终止情形（BR-24）</div>';
  html += '<div style="border:1px solid #d9d9d9;border-radius:4px;padding:8px 4px">' + groundsHtml + '</div>';
  html += '</div>';

  html += '<div class="form-item" style="margin-top:12px"><div class="form-label required">已完成工作描述</div>';
  html += '<textarea id="term-done" class="textarea" rows="3" placeholder="请描述项目终止前已完成的建设工作..."' + (!editable ? ' disabled' : '') + '></textarea>';
  html += '</div>';

  html += '<div class="form-item" style="margin-top:8px"><div class="form-label required">财务结算方案</div>';
  html += '<textarea id="term-finance" class="textarea" rows="3" placeholder="请说明已支出经费、待退回经费及清算方案..."' + (!editable ? ' disabled' : '') + '></textarea>';
  html += '</div>';

  html += '<div class="form-item" style="margin-top:8px"><div class="form-label required">详细终止原因</div>';
  html += '<textarea id="term-detail" class="textarea" rows="4" placeholder="请详细说明项目终止的具体原因及影响..."' + (!editable ? ' disabled' : '') + '></textarea>';
  html += '</div>';

  if (editable) {
    html += '<div class="form-actions">';
    html += '<button class="btn btn-danger-outline" onclick="submitTerminate(\'' + p.id + '\',\'' + p.name + '\')">提交终止申请</button>';
    html += '<button class="btn" onclick="navigate(\'project-detail\',{id:\'' + p.id + '\'})">取消</button>';
    html += '</div>';
  } else {
    html += '<p style="color:var(--text-secondary);font-size:13px">当前角色无权提交终止申请</p>';
  }

  html += '</div>';

  html += '<script>(function(){' +
    'window.submitTerminate=function(pid,pname){' +
      'var groundEl=document.querySelector("[name=term-ground]:checked");' +
      'var ground=groundEl?groundEl.value:"";' +
      'var done=document.getElementById("term-done")?document.getElementById("term-done").value.trim():"";' +
      'var finance=document.getElementById("term-finance")?document.getElementById("term-finance").value.trim():"";' +
      'var detail=document.getElementById("term-detail")?document.getElementById("term-detail").value.trim():"";' +
      'if(!ground){toast("请选择终止情形","error");return;}' +
      'if(!done){toast("请填写已完成工作描述","error");return;}' +
      'if(!finance){toast("请填写财务结算方案","error");return;}' +
      'if(!detail){toast("请填写详细终止原因","error");return;}' +
      'showModal(' +
        '"确认提交终止申请",' +
        '"<div style=\'font-size:14px;line-height:1.8\'>' +
          '<p>项目：<strong>"+pname+"</strong></p>' +
          '<p>终止情形："+ground+"</p>' +
          '<p style=\'color:var(--danger);margin-top:8px\'>提交后将进入审批流程，请确认以上信息无误。</p>' +
        '</div>",' +
        '"<button class=\'btn\' onclick=\'closeModal()\'>取消</button>" +' +
        '"<button class=\'btn btn-danger-outline\' onclick=\'confirmTerminate(\\\""+pid+"\\\",\\\""+pname+"\\\",\\\""+ground+"\\\")\'>确认提交</button>"' +
      ');' +
    '};' +
    'window.confirmTerminate=function(pid,pname,ground){' +
      'closeModal();' +
      'logOperation("项目管理","提交终止申请",pid,pname,"终止情形："+ground,null);' +
      'toast("终止申请已提交，待审批","warning",4000);' +
      'setTimeout(function(){navigate("project-list");},1500);' +
    '};' +
  '})();<\/script>';

  return html;
});


// ── Placeholder for legacy route compatibility ──
registerView('terminate-apply', function() {
  return '<div class="empty-state" style="text-align:center;padding:64px"><p style="color:var(--text-secondary);margin-top:16px">正在跳转…</p></div>';
});
