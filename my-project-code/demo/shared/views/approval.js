// shared/views/approval.js  — V2.1 立项管理全流程

/* ============================================================
   1. proposal-list — 立项管理列表
   ============================================================ */
registerView('proposal-list', function() {
  const role = getCurrentRole();
  const proposals = DATA.proposals || [];

  // Status tag mapping — 11 states (Issue B)
  const statusTagMap = {
    '草稿':       'tag-gray',
    '待单位审核': 'tag-blue',
    '初审中':     'tag-cyan',
    '专家论证中': 'tag-orange',
    '审定中':     'tag-purple',
    '已立项':     'tag-success',
    '单位退回':   'tag-warning',
    '初审退回':   'tag-warning',
    '论证不通过': 'tag-red',
    '审定不通过': 'tag-red',
    '已冻结':     'tag-red',
  };

  // Role-based filter
  let visible = proposals;
  if (role === 'project-manager') {
    const myName = roleDisplayName(role);
    visible = proposals.filter(p => p.manager === myName);
  } else if (role === 'unit-admin') {
    const myUnit = DATA.currentUser ? DATA.currentUser.unit : '';
    visible = proposals.filter(p => p.unit === myUnit);
  }

  // Operation column per role + status
  function opCell(p) {
    var btns = [];
    var s = p.status;
    if (role === 'project-manager' || role === 'project-assistant') {
      if (s === '草稿' || s === '单位退回' || s === '初审退回') {
        btns.push(`<a onclick="navigate('proposal-fill',{id:'${p.id}'})">编辑</a>`);
      } else {
        btns.push(`<a onclick="navigate('proposal-fill',{id:'${p.id}'})">查看</a>`);
      }
    } else if (role === 'info-admin') {
      if (s === '初审中') {
        btns.push(`<a onclick="navigate('preliminary-review',{id:'${p.id}'})">初审</a>`);
      } else {
        btns.push(`<a onclick="navigate('proposal-approve',{id:'${p.id}'})">查看</a>`);
      }
    } else if (role === 'info-leader' || role === 'leadership-office' || role === 'leadership-group') {
      if (s === '审定中') {
        btns.push(`<a onclick="navigate('proposal-approve',{id:'${p.id}'})">审批</a>`);
      } else {
        btns.push(`<a onclick="navigate('proposal-approve',{id:'${p.id}'})">查看</a>`);
      }
    } else {
      btns.push(`<a onclick="navigate('proposal-approve',{id:'${p.id}'})">查看</a>`);
    }
    return btns.join(' ');
  }

  const rows = visible.map(p => {
    const bt = budgetToType(p.budget);
    const typeCls = { micro:'tag-gray', small:'tag-blue', mid:'tag-orange', major:'tag-red' }[bt.type] || 'tag-gray';
    const dc = p.deadline ? (() => {
      const days = (new Date(p.deadline) - new Date()) / 86400000;
      if (days < 0)  return 'style="color:var(--danger);font-weight:600"';
      if (days <= 7) return 'style="color:var(--warning);font-weight:600"';
      return '';
    })() : '';
    return `
    <tr>
      <td><a onclick="navigate('proposal-fill',{id:'${p.id}'})">${p.projectName}</a></td>
      <td>${p.unit}</td>
      <td>${p.budget} <span class="tag ${typeCls}" style="margin-left:4px">${bt.label.split('（')[0]}</span></td>
      <td><span class="tag ${statusTagMap[p.status] || 'tag-gray'}">${p.status}</span></td>
      <td>${formatDate(p.submittedAt)}</td>
      <td ${dc}>${formatDate(p.deadline)}</td>
      <td>${p.manager}</td>
      <td>${opCell(p)}</td>
    </tr>`;
  }).join('');

  const infoAdminBanner = (role === 'info-admin') ? `
    <div class="notice-item info" style="margin-bottom:16px">
      <div class="notice-title">操作提示</div>
      <div>从「需求管理」勾选通过遴选的需求 → 批量发送立项申报通知</div>
    </div>` : '';

  return `
    ${breadcrumb('项目管理', '立项管理')}
    <div class="page-header">
      <div class="page-title">立项管理</div>
      ${(role === 'project-manager' || role === 'project-assistant')
        ? '<button class="btn btn-primary" onclick="navigate(\'proposal-fill\')">+ 填报申报书</button>'
        : ''}
    </div>
    ${infoAdminBanner}
    <div class="table-wrap">
      <div style="padding:12px 16px;border-bottom:1px solid #f0f0f0">
        <div class="filter-bar">
          <input class="form-control" id="pl-keyword" placeholder="搜索项目名称..." style="width:200px">
          <select class="form-control" id="pl-status" style="width:130px">
            <option value="">全部状态</option>
            <option>草稿</option>
            <option>待单位审核</option>
            <option>初审中</option>
            <option>专家论证中</option>
            <option>审定中</option>
            <option>已立项</option>
            <option>单位退回</option>
            <option>初审退回</option>
            <option>论证不通过</option>
            <option>审定不通过</option>
            <option>已冻结</option>
          </select>
          <select class="form-control" id="pl-level" style="width:120px">
            <option value="">全部级别</option>
            <option>微型</option>
            <option>小型</option>
            <option>中型</option>
            <option>重大</option>
          </select>
          <button class="btn btn-primary btn-sm" onclick="filterProposalList()">查询</button>
          <button class="btn btn-sm" onclick="filterProposalList(true)">重置</button>
        </div>
      </div>
      <table class="data-table">
        <thead><tr>
          <th>项目名称</th>
          <th>申报单位</th>
          <th class="sortable">预算（万元）<span class="sort-icon">↑↓</span></th>
          <th>状态</th>
          <th class="sortable">提交日期<span class="sort-icon">↑↓</span></th>
          <th class="sortable">截止日期<span class="sort-icon">↑↓</span></th>
          <th>负责人</th>
          <th>操作</th>
        </tr></thead>
        <tbody id="proposal-list-tbody">${rows}</tbody>
      </table>
      <div class="table-pagination">
        <span>共 ${visible.length} 条记录</span>
        <span>第 1/1 页 &nbsp; &lt; 1 &gt;</span>
      </div>
    </div>`;
});

window.filterProposalList = function(reset) {
  if (reset) {
    document.getElementById('pl-keyword').value = '';
    document.getElementById('pl-status').value = '';
    document.getElementById('pl-level').value = '';
  }
  const kw     = (document.getElementById('pl-keyword')?.value || '').toLowerCase();
  const status = document.getElementById('pl-status')?.value || '';
  const level  = document.getElementById('pl-level')?.value || '';
  const levelTypeMap = { '微型':'micro','小型':'small','中型':'mid','重大':'major' };
  const tbody = document.getElementById('proposal-list-tbody');
  if (!tbody) return;
  const rows = tbody.querySelectorAll('tr');
  rows.forEach(tr => {
    const name  = tr.cells[0]?.textContent.toLowerCase() || '';
    const st    = tr.cells[3]?.textContent.trim() || '';
    const bt    = tr.cells[2]?.textContent.trim() || '';
    const matchKw     = !kw     || name.includes(kw);
    const matchStatus = !status || st === status;
    const matchLevel  = !level  || bt.includes(level);
    tr.style.display  = (matchKw && matchStatus && matchLevel) ? '' : 'none';
  });
};


/* ============================================================
   2. proposal-fill — 填报申报书（6章，对齐申报书原件）
   ============================================================ */
registerView('proposal-fill', function() {
  const role   = getCurrentRole();
  const params = getViewParams('proposal-fill');
  const propId = params && params.id;
  const prop   = (DATA.proposals || []).find(p => p.id === propId) || (DATA.proposals || [])[0] || {};
  const isReadOnly = !['project-manager', 'project-assistant'].includes(role);

  if (window._proposalChapter === undefined) window._proposalChapter = 0;
  const ch = window._proposalChapter;

  const chapters = ['项目基本情况','必要性及建设目标','项目建设方案','配置清单及预算','项目实施计划','建设单位意见'];

  // ---- helpers ----
  const ro = isReadOnly ? 'readonly' : '';
  const dis = isReadOnly ? 'disabled' : '';
  function field(label, inputHtml, required, hint) {
    return `<div class="form-item">
      <label class="form-label${required ? ' required' : ''}">${label}</label>
      ${inputHtml}
      ${hint ? `<div class="form-hint">${hint}</div>` : ''}
    </div>`;
  }
  function textInput(name, val, opts) {
    opts = opts || {};
    return `<input class="form-control" name="${name}" value="${val || ''}" ${opts.type ? `type="${opts.type}"` : ''} ${opts.placeholder ? `placeholder="${opts.placeholder}"` : ''} ${opts.onInput ? `oninput="${opts.onInput}"` : ''} ${ro}>`;
  }
  function textArea(name, val, rows) {
    return `<textarea class="form-control" name="${name}" rows="${rows || 4}" ${dis}>${val || ''}</textarea>`;
  }
  function cb(name, label, checked) {
    return `<label style="display:inline-flex;align-items:center;gap:5px;margin-right:14px;cursor:pointer"><input type="checkbox" name="${name}" ${checked ? 'checked' : ''} ${dis}> ${label}</label>`;
  }

  // ---- Chapter 0: 一、项目基本情况 ----
  function renderChapter0() {
    const bt = prop.budget ? budgetToType(prop.budget) : null;
    const btTag = bt ? `<span class="tag ${{ micro:'tag-gray', small:'tag-blue', mid:'tag-orange', major:'tag-red' }[bt.type]}" id="budget-type-tag">${bt.label}</span>` : `<span class="tag tag-gray" id="budget-type-tag" style="display:none"></span>`;
    var selectedAssistants = prop.assistants || [];
    var assistantTags = selectedAssistants.length
      ? selectedAssistants.map(function(n) { return '<span class="tag tag-blue" style="margin:2px">' + n + '</span>'; }).join('')
      : '<span style="color:var(--text-secondary)">未选择</span>';
    var assistantField = '<div id="assistant-display" style="display:flex;flex-wrap:wrap;align-items:center;gap:4px;min-height:32px">'
      + assistantTags
      + (!isReadOnly ? ' <button type="button" class="btn" style="padding:2px 10px;font-size:12px;margin-left:4px" onclick="openAssistantModal()">选择</button>' : '')
      + '</div>';

    const projectTypes = ['基础设施','硬件设备','信息系统','运维服务','数字资源'];
    const selectedTypes = prop.projectTypes || ['信息系统'];
    const typeCheckboxes = projectTypes.map(t => cb('projectType_' + t, t, selectedTypes.includes(t))).join('');

    const deployHtml = `
      <div style="margin-bottom:8px">
        <span style="font-size:12px;color:var(--text-secondary);margin-right:6px">信息系统：</span>
        ${cb('deploy_sys_center','学校数据中心',true)}
        ${cb('deploy_sys_other','其他',false)}
        <input class="form-control" style="display:inline-block;width:130px;margin-left:2px" placeholder="请说明" ${ro}>
      </div>
      <div>
        <span style="font-size:12px;color:var(--text-secondary);margin-right:6px">硬件设备：</span>
        ${cb('deploy_hw_center','学校数据中心',false)}
        ${cb('deploy_hw_other','其他',false)}
        <input class="form-control" style="display:inline-block;width:130px;margin-left:2px" placeholder="请说明" ${ro}>
      </div>`;

    const serviceHtml = `
      <div style="margin-bottom:6px">
        <span style="font-size:12px;color:var(--text-secondary);margin-right:6px">用户范围：</span>
        ${cb('user_staff','教职员工',true)}
        ${cb('user_student','学生',false)}
        ${cb('user_other','其他',false)}
      </div>
      <div>
        <span style="font-size:12px;color:var(--text-secondary);margin-right:6px">访问范围：</span>
        ${cb('access_campus','校园网',true)}
        ${cb('access_internet','互联网',false)}
        ${cb('access_intranet','内网',false)}
      </div>`;

    const fundingHtml = `
      <div style="display:flex;align-items:center;gap:16px;flex-wrap:wrap;padding:4px 0">
        ${cb('fund_sci','科研经费',false)}
        ${cb('fund_unit','单位自筹经费',false)}
        ${cb('fund_school','校统筹经费',true)}
        <span style="font-size:12px;color:var(--text-secondary)">（如：信息化建设办公室、实验设备管理处、本科生院等）</span>
      </div>`;

    return `
      <div class="form-grid cols-3">
        ${field('申请编号', `<input class="form-control" value="${prop.id || '（提交后自动生成）'}" readonly style="color:var(--text-secondary)">`, false)}
        ${field('项目名称', textInput('projectName', prop.projectName), true)}
        ${field('申报日期', `<input class="form-control" type="date" value="${new Date().toISOString().slice(0,10)}" ${ro}>`, true)}
      </div>
      <div class="form-grid cols-2">
        ${field('项目用户单位', `<input class="form-control" name="unit" value="${prop.unit || '教务处'}" ${ro}>`, true)}
        ${field('协作建设单位', textInput('coUnit', prop.coUnit), false, '多单位共建时填写牵头单位，并在此注明参与单位')}
      </div>
      ${field('项目类型', `<div style="padding:4px 0">${typeCheckboxes}<div class="form-hint" style="margin-top:4px">可多选</div></div>`, true)}
      <div class="form-section-title">负责人与联系人</div>
      <div class="form-grid cols-3">
        ${field('单位负责人姓名', textInput('unitLeaderName', prop.unitLeaderName || prop.manager || '李明'), true)}
        ${field('单位负责人联系电话', textInput('unitLeaderPhone', prop.unitLeaderPhone || prop.contact || '13800138001'), true)}
        <div></div>
        ${field('项目联系人姓名', textInput('manager', prop.manager || '李明'), true)}
        ${field('项目联系人电话', textInput('contact', prop.contact || '13800138001'), true)}
        ${field('项目联系人 Email', `<input class="form-control" name="email" type="email" value="${prop.email || 'liming@swu.edu.cn'}" ${ro}>`, true)}
        ${field('项目协助人', assistantField, false, '点击"选择"可多选协助人')}
      </div>
      <div class="form-section-title">部署方式与服务对象</div>
      ${field('安装部署方式', deployHtml, true)}
      ${field('服务对象', serviceHtml, true)}
      <div class="form-section-title">预算与资金来源</div>
      ${field('项目预算（万元）',
        `<div style="display:flex;align-items:center;gap:8px">
          <input class="form-control" name="budget" type="number" value="${prop.budget || ''}" oninput="onBudgetInput(this.value)" style="width:160px" ${ro}>
          ${btTag}
        </div>`,
        true, '填写后自动判断项目级别')}
      ${field('资金来源', fundingHtml, true)}
      <div class="form-section-title">项目简介</div>
      ${field('项目简介', textArea('summary', prop.summary || ''), true, '简要描述项目背景、建设内容和预期成效')}`;
  }

  // ---- Chapter 1: 二、必要性及建设目标 ----
  function renderChapter1() {
    const opCol = !isReadOnly ? '<th style="width:52px">操作</th>' : '';
    const defaultSurveyRows = [0,1,2].map(function() {
      return '<tr>'
        + '<td><input class="form-control form-control-sm" placeholder="品牌/型号" ' + ro + '></td>'
        + '<td><input class="form-control form-control-sm" placeholder="厂商名称" ' + ro + '></td>'
        + '<td><input class="form-control form-control-sm" placeholder="调研内容" ' + ro + '></td>'
        + '<td><input class="form-control form-control-sm" placeholder="调研情况" ' + ro + '></td>'
        + (!isReadOnly ? '<td><button type="button" class="btn btn-sm" style="color:var(--danger);padding:2px 8px" onclick="removeSurveyRow(this)">删</button></td>' : '')
        + '</tr>';
    }).join('');
    const surveyTable = `<table class="data-table" id="survey-table" style="margin-bottom:8px">
      <thead><tr><th>被调研产品品牌及型号</th><th>厂商</th><th>调研内容</th><th>调研情况</th>${opCol}</tr></thead>
      <tbody id="survey-tbody">${defaultSurveyRows}</tbody>
    </table>${!isReadOnly ? '<button type="button" class="btn btn-sm" onclick="addSurveyRow()">+ 添加调研对象</button>' : ''}`;
    return `
      <div class="form-grid cols-1">
        ${field('必要性', textArea('necessity', prop.necessity || '当前教学质量数据分散在多个系统，缺乏统一分析平台，导致教学督导工作效率低下，数据共享困难。建设统一的本科教学质量数据分析平台是提升教学管理水平、落实学校信息化规划的重要举措，有助于实现数据驱动决策。', 6), true, '描述项目建设背景与依据；若非新建项目，须补充前期项目建设情况（完成情况、经费支出、使用成效、验收报告等）')}
        ${field('建设目标', textArea('goal', prop.goal || '构建统一的教学质量数据分析平台，整合教学评价、课程成绩等数据，支持多维度分析决策。', 4), true, '包括总体目标，分阶段或分期建设目标等')}
        ${field('与学校信息化规划的关系', textArea('planRelation', prop.planRelation || '本项目是"数智西大"建设专项规划的重点支撑项目，与学校"十四五"信息化规划中"智慧教学"板块直接对应。', 4), false, '若项目来源为"学校信息化规划"，此项必填')}
        ${field('需求调研', surveyTable, true, '一般不少于3个调研对象，应与本次建设的资金规模、核心产品相近且具代表性，可另附页')}
      </div>`;
  }

  // ---- Chapter 2: 三、项目建设方案 ----
  function renderChapter2() {
    const intSystems = `
      ${cb('int_sso','统一身份认证',true)}
      ${cb('int_portal','网上办事大厅',false)}
      ${cb('int_ding','钉钉',true)}
      ${cb('int_none','无对接需求',false)}
      <div style="margin-top:6px">
        <span style="font-size:12px;color:var(--text-secondary);margin-right:6px">其他系统：</span>
        <input class="form-control" style="display:inline-block;width:240px" placeholder="可写多个" ${ro}>
      </div>`;

    const notifyPlat = `
      ${cb('notify_sms','短信',false)}
      ${cb('notify_ding','钉钉',true)}
      ${cb('notify_portal','一站式数智门户',false)}
      ${cb('notify_none','无',false)}
      ${cb('notify_other','其他消息系统',false)}`;

    const baseData = `
      ${cb('data_hr','人事',false)}
      ${cb('data_ug','本科生',true)}
      ${cb('data_grad','研究生',false)}
      ${cb('data_sci','科研',false)}
      ${cb('data_teach','教学',true)}
      ${cb('data_equip','设备',false)}
      ${cb('data_fin','财务',false)}
      ${cb('data_other','其他信息',false)}
      ${cb('data_none','无',false)}`;

    function yesNo(name, defaultYes) {
      return `<label style="margin-right:16px"><input type="radio" name="${name}" value="是" ${defaultYes?'checked':''} ${dis}> 是</label>`
           + `<label><input type="radio" name="${name}" value="否" ${!defaultYes?'checked':''} ${dis}> 否</label>`;
    }

    return `
      <div class="form-grid cols-1">
        ${field('建设内容', textArea('buildContent', prop.buildContent || '开发教学质量数据采集、清洗、分析及可视化模块，与教务系统、评教系统对接，支持PC与移动端访问。', 5), true, '主要硬件组成、软件功能模块、系统集成任务、服务内容等，可另附页说明')}
      </div>
      <div class="form-section-title">信息化资源规划（信息系统类项目填写）</div>
      <div style="background:var(--bg-secondary,#fafafa);border:1px solid #e8e8e8;border-radius:6px;padding:16px;margin-bottom:16px">
        ${field('需对接的学校信息化基础应用系统', `<div style="padding:6px 0">${intSystems}</div>`, true)}
        ${field('通知消息发送平台', `<div style="padding:4px 0">${notifyPlat}</div>`, true)}
        ${field('系统数据共享', textArea('dataShareDesc', prop.dataShareDesc || '系统默认共享所有数据。不能提供的共享数据及说明（可写多个）：', 3), false, '系统默认共享所有数据，如有不能共享的数据请进行说明')}
        ${field('系统拟申请使用学校基础数据', `<div style="padding:4px 0">${baseData}</div>`, false)}
        <div class="form-section-title" style="font-size:13px;margin-top:4px">硬件运行环境要求</div>
        <div style="font-size:12px;color:var(--text-secondary);font-weight:600;margin:6px 0 4px">硬件规格</div>
        <div class="form-grid cols-4">
          ${field('高度（U）', `<input class="form-control" name="hw_height" type="number" placeholder="U" ${ro}>`)}
          ${field('电源功耗（W）', `<input class="form-control" name="hw_power" type="number" placeholder="W" ${ro}>`)}
          ${field('光口数量（个）', `<input class="form-control" name="hw_fiber_port" type="number" placeholder="个" ${ro}>`)}
          ${field('电口数量（个）', `<input class="form-control" name="hw_copper_port" type="number" placeholder="个" ${ro}>`)}
        </div>
        <div style="font-size:12px;color:var(--text-secondary);font-weight:600;margin:6px 0 4px">服务器性能需求</div>
        <div class="form-grid cols-3" style="font-size:13px">
          ${field('服务器数量', `<input class="form-control" type="number" placeholder="台" ${ro}>`)}
          ${field('CPU（主频/个数/核数）', `<input class="form-control" placeholder="如 2.5GHz×2×16核" ${ro}>`)}
          ${field('内存（GB）', `<input class="form-control" type="number" placeholder="GB" ${ro}>`)}
          ${field('算力（如有，TOPS）', `<input class="form-control" placeholder="TOPS" ${ro}>`)}
          ${field('网络带宽（MB/S）', `<input class="form-control" placeholder="MB/S" ${ro}>`)}
        </div>
        <div style="font-size:12px;color:var(--text-secondary);font-weight:600;margin:6px 0 4px">存储需求</div>
        <div class="form-grid cols-2" style="max-width:420px">
          ${field('应用数据存储需求（GB）', `<input class="form-control" type="number" placeholder="GB" ${ro}>`)}
          ${field('数据库数据存储需求（GB）', `<input class="form-control" type="number" placeholder="GB" ${ro}>`)}
        </div>
      </div>
      <div class="form-section-title">系统提供服务情况</div>
      <div style="background:var(--bg-secondary,#fafafa);border:1px solid #e8e8e8;border-radius:6px;padding:16px;margin-bottom:16px">
        ${field('系统是否提供互联网访问', yesNo('internet_access', false))}
        ${field('系统是否采用独立的用户注册认证（非学校统一身份认证）', yesNo('independent_auth', false))}
        ${field('系统是否存储个人信息（如姓名、电话、出生日期、身份证号、住址等）', yesNo('store_personal', true))}
        ${field('处理的主要数据内容', `<input class="form-control" name="dataContent" placeholder="如：个人信息、XX类业务数据、资金数据、敏感数据等" ${ro}>`)}
        ${field('数据的重要程度', `<select class="form-control" name="dataLevel" style="max-width:200px" ${dis}><option>不可公开</option><option>审批后公开</option><option selected>可公开</option></select>`)}
        ${field('数据涉及的数量级', `<select class="form-control" name="dataScale" style="max-width:160px" ${dis}><option>百</option><option>千</option><option selected>万</option><option>十万</option><option>百万</option><option>千万及以上</option></select>`)}
        ${field('其他说明', `<input class="form-control" name="serviceOther" placeholder="如需说明其他情况，请在此填写" ${ro}>`)}
      </div>
      <div class="form-section-title">信息化建设办公室网络安全检测建议</div>
      <div style="background:var(--bg-secondary,#fafafa);border:1px solid #e8e8e8;border-radius:6px;padding:16px;margin-bottom:16px">
        ${field('安全检测类型', `<div style="padding:4px 0">
          ${cb('sec_pentest','渗透测试',false)}
          ${cb('sec_codescan','代码审计',false)}
          ${cb('sec_vulnscan','漏洞扫描',true)}
          ${cb('sec_compliance','等保合规评估',false)}
          ${cb('sec_datasec','数据安全评估',false)}
        </div>
        <div style="margin-top:8px;display:flex;align-items:center;gap:6px">
          <span style="font-size:12px;color:var(--text-secondary)">其他：</span>
          <input class="form-control" style="flex:1;max-width:360px" name="sec_other" placeholder="请填写其他安全检测类型" ${ro}>
        </div>`, false, '由信息化建设办公室根据系统情况提出建议，申报单位确认填写')}
      </div>`;
  }

  // ---- Chapter 3: 四、配置清单及采购预算 ----
  function renderChapter3() {
    const total = (prop.budgetSoftware || 60) + (prop.budgetOps || 10);
    const initRows = [
      { name:'教学质量分析平台软件', spec:'定制开发，含需求分析、设计、开发、测试', qty:1, unit: prop.budgetSoftware||60, total: prop.budgetSoftware||60, note:'' },
      { name:'系统运维服务（一年质保）', spec:'上线后一年内运维保障',              qty:1, unit: prop.budgetOps||10,       total: prop.budgetOps||10,       note:'' },
    ];
    const rowsHtml = initRows.map(r => `
      <tr>
        <td><input class="form-control form-control-sm" value="${r.name}" ${ro}></td>
        <td><input class="form-control form-control-sm" value="${r.spec}" ${ro}></td>
        <td><input class="form-control form-control-sm" type="number" value="${r.qty}" style="width:56px" ${ro}></td>
        <td><input class="form-control form-control-sm" type="number" value="${r.unit}" class="budget-item" oninput="calcBudgetSum()" style="width:86px" ${ro}></td>
        <td><input class="form-control form-control-sm" type="number" value="${r.total}" style="width:86px" ${ro}></td>
        <td><input class="form-control form-control-sm" value="${r.note}" ${ro}></td>
      </tr>`).join('');
    return `
      <div class="notice-item info" style="margin-bottom:16px">
        通用基础硬件（服务器、存储、网络）由信息办统筹，请在第三章信息化资源规划中填写申请，无需在此列为采购项。
      </div>
      <table class="data-table" id="budget-detail-table" style="margin-bottom:16px">
        <thead><tr><th>名称</th><th>性能指标/功能说明</th><th>数量</th><th>单价（万元）</th><th>总价（万元）</th><th>备注</th></tr></thead>
        <tbody>
          ${rowsHtml}
          <tr>
            <td colspan="6" style="padding:6px 8px">
              ${!isReadOnly ? '<button type="button" class="btn btn-sm" onclick="addBudgetRow()">+ 添加行</button>' : ''}
            </td>
          </tr>
          <tr style="background:#fafafa;font-weight:600">
            <td colspan="3">项目建设总预算（万元）</td>
            <td></td>
            <td id="budget-sum">${total}</td>
            <td></td>
          </tr>
        </tbody>
      </table>`;
  }

  // ---- Chapter 4: 五、项目实施计划 ----
  function renderChapter4() {
    const stages = [
      '需求分析','系统设计','开发','初验','上线试运行','设备到货','安全调试初验','人员培训',
    ];
    const planRows = stages.map(s => `
      <tr>
        <td><input class="form-control form-control-sm" value="${s}" ${ro}></td>
        <td><input class="form-control form-control-sm" value="" ${ro}></td>
        <td><input class="form-control form-control-sm" value="" style="width:100px" ${ro}></td>
      </tr>`).join('');
    return `
      <div class="form-section-title">实施阶段计划</div>
      <table class="data-table" style="margin-bottom:16px">
        <thead><tr><th>实施阶段</th><th>内容</th><th>时间执行安排</th></tr></thead>
        <tbody>${planRows}</tbody>
      </table>
      <div class="form-grid cols-1">
        ${field('经费执行计划', textArea('fundPlan', prop.fundPlan || '第一次付款，计划支出*%：签订合同并支付履约保证金；\n第二次付款，计划支出*%：系统上线试运行，初验通过；\n第三次付款，计划支出*%：试运行结束，终验通过。', 5), true, '说明各阶段付款节点与支出比例')}
      </div>`;
  }

  // ---- Chapter 5: 六、建设单位意见 ----
  function renderChapter5() {
    return `
      <div class="notice-item info" style="margin-bottom:16px">
        <strong>说明：</strong>提交申报书后，系统将通知单位负责人进行在线确认，并由信息化建设办公室安排签章归档。
      </div>
      <div style="background:var(--bg-secondary,#fafafa);border:1px solid #e8e8e8;border-radius:6px;padding:20px;margin-bottom:20px;line-height:1.9;color:var(--text-primary)">
        同意按《西南大学信息化项目管理办法（试行）》相关管理规定，组织保障本项目实施和运维，保障网络与信息安全。
        本单位将建立健全项目管理和网络与信息安全管理责任制，严格按照经专家论证和学校审定的项目建设方案组织实施，
        严格执行信息化项目管理办法、采购管理办法、合同管理等制度，并在项目建成后，加强项目运维和网络与信息安全管理。
      </div>
      <div class="form-grid cols-2" style="max-width:480px">
        ${field('项目用户单位负责人（签字）', `<input class="form-control" placeholder="提交后由单位负责人线上确认" readonly style="color:var(--text-secondary)">`)}
        ${field('日期', `<input class="form-control" type="date" placeholder="确认时间" readonly style="color:var(--text-secondary)">`)}
      </div>
      <div class="notice-item warning" style="margin-top:12px">
        <strong>注意：</strong>请确认以上各章内容填写完整、准确后再提交审核。提交后内容将锁定，如需修改须联系单位管理员退回。
      </div>`;
  }

  const chapterContent = [
    renderChapter0, renderChapter1, renderChapter2,
    renderChapter3, renderChapter4, renderChapter5,
  ][ch]();

  const isLast  = ch === chapters.length - 1;
  const isFirst = ch === 0;
  const submitDisabled = (role === 'project-assistant') ? 'disabled title="仅项目负责人可提交"' : '';
  const readOnlyNote = isReadOnly
    ? '<div class="notice-item info" style="margin-bottom:12px"><strong>只读模式</strong> — 当前角色不可编辑申报书</div>' : '';

  // ---- Milestone bar ----
  var milestoneHtml = '';
  (function() {
    var statusToPhase = { '草稿': 1, '待单位审核': 1, '单位退回': 1, '初审中': 1, '初审退回': 1, '专家论证中': 1, '审定中': 1, '论证不通过': 1, '审定不通过': 1, '已立项': 2 };
    var projPhase = 1; // default to 立项论证 phase
    // Try to find linked project for phase info
    if (prop.demandId) {
      var linkedProj = (DATA.projects || []).find(function(pr) { return pr.demandId === prop.demandId; });
      if (linkedProj) projPhase = linkedProj.phase || 1;
    }
    var phaseIdx = Math.max(0, Math.min(projPhase - 1, 5)); // 0-based
    var tpl = (DATA.workflowTemplates || []).find(function(t) { return t.isDefault; }) || {};
    var steps = tpl.steps || [];
    if (steps.length) {
      milestoneHtml = '<div class="card" style="margin-bottom:12px;padding:16px 20px">'
        + '<div style="font-weight:600;font-size:13px;margin-bottom:12px;color:var(--text-secondary)">项目里程碑节点 <span style="font-weight:400;font-size:12px;margin-left:8px">（' + tpl.name + '）</span></div>'
        + '<div style="display:flex;align-items:flex-start;gap:0;overflow-x:auto">';
      steps.forEach(function(s, i) {
        var state = i < phaseIdx ? 'done' : i === phaseIdx ? 'active' : 'pending';
        var color = state === 'done' ? 'var(--success)' : state === 'active' ? 'var(--primary)' : '#ccc';
        var bg = state === 'done' ? 'var(--success)' : state === 'active' ? 'var(--primary)' : '#e8e8e8';
        var textColor = state === 'pending' ? 'var(--text-secondary)' : '#fff';
        var numContent = state === 'done' ? '&#10003;' : (i + 1);
        milestoneHtml += '<div style="display:flex;flex-direction:column;align-items:center;min-width:100px;flex:1">';
        milestoneHtml += '<div style="width:28px;height:28px;border-radius:50%;background:' + bg + ';color:' + textColor + ';display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:600">' + numContent + '</div>';
        milestoneHtml += '<div style="font-size:12px;font-weight:600;margin-top:6px;color:' + (state === 'pending' ? 'var(--text-secondary)' : 'var(--text-primary)') + '">' + s.name + '</div>';
        if (s.sub && s.sub.length) {
          milestoneHtml += '<div style="font-size:11px;color:var(--text-secondary);margin-top:4px;text-align:center;line-height:1.6">';
          s.sub.forEach(function(sub) {
            milestoneHtml += '<div>' + sub + '</div>';
          });
          milestoneHtml += '</div>';
        }
        milestoneHtml += '</div>';
        if (i < steps.length - 1) {
          var lineColor = i < phaseIdx ? 'var(--success)' : '#ddd';
          milestoneHtml += '<div style="flex:0 0 40px;height:2px;background:' + lineColor + ';margin-top:14px"></div>';
        }
      });
      milestoneHtml += '</div></div>';
    }
  })();

  return `
    ${breadcrumb('项目管理', '立项管理', '填报申报书')}
    <div class="page-header">
      <div class="page-title">信息化项目建设申报书</div>
      <div style="display:flex;gap:8px">
        <button class="btn" onclick="navigate('proposal-list')">← 返回列表</button>
      </div>
    </div>
    ${milestoneHtml}
    ${renderStepWizard(chapters, ch)}
    <div class="card" style="margin-top:16px">
      <div class="card-title">第 ${ch + 1} 章 · ${chapters[ch]}</div>
      ${readOnlyNote}
      <form id="proposal-form" onsubmit="return false">
        ${chapterContent}
        <div class="form-actions">
          ${!isFirst ? '<button class="btn" onclick="proposalNav(-1)">← 上一章</button>' : ''}
          ${!isReadOnly ? '<button class="btn btn-warning" onclick="proposalSaveDraft()">暂存草稿</button>' : ''}
          ${!isLast ? '<button class="btn btn-primary" onclick="proposalNav(1)">下一章 →</button>' : ''}
          ${isLast && !isReadOnly ? `<button class="btn btn-success" ${submitDisabled} onclick="proposalSubmit()">提交审核</button>` : ''}
        </div>
      </form>
    </div>`;
});

window.onBudgetInput = function(val) {
  const n = parseFloat(val);
  const tag = document.getElementById('budget-type-tag');
  if (!tag) return;
  if (isNaN(n) || n <= 0) { tag.style.display = 'none'; return; }
  const bt = budgetToType(n);
  const clsMap = { micro:'tag-gray', small:'tag-blue', mid:'tag-orange', major:'tag-red' };
  tag.className = 'tag ' + (clsMap[bt.type] || 'tag-gray');
  tag.textContent = bt.label;
  tag.style.display = 'inline-block';
};

window.calcBudgetSum = function() {
  const inputs = document.querySelectorAll('.budget-item');
  let total = 0;
  inputs.forEach(i => { const v = parseFloat(i.value); if (!isNaN(v)) total += v; });
  const sumEl = document.getElementById('budget-sum');
  if (sumEl) sumEl.textContent = total.toFixed(2).replace(/\.?0+$/, '');
};

window.openAssistantModal = function() {
  var params = getViewParams('proposal-fill');
  var propId = params && params.id;
  var prop = (DATA.proposals || []).find(function(p) { return p.id === propId; }) || (DATA.proposals || [])[0] || {};
  var selected = (prop.assistants || []).slice();
  var rows = (DATA.users || []).map(function(u) {
    var checked = selected.includes(u.name) ? ' checked' : '';
    return '<tr><td><label style="display:flex;align-items:center;gap:8px;cursor:pointer"><input type="checkbox" class="asst-cb" value="' + u.name + '"' + checked + '> ' + u.name + '</label></td><td>' + (u.role || '—') + '</td><td>' + (u.dept || '—') + '</td></tr>';
  }).join('');
  var body = '<table class="data-table"><thead><tr><th>姓名</th><th>角色</th><th>部门</th></tr></thead><tbody>' + rows + '</tbody></table>';
  var buttons = '<button class="btn" onclick="closeModal()">取消</button><button class="btn btn-primary" onclick="confirmAssistants()">确认选择</button>';
  showModal('选择项目协助人', body, buttons);
};
window.confirmAssistants = function() {
  var cbs = document.querySelectorAll('.asst-cb:checked');
  var names = [];
  cbs.forEach(function(cb) { names.push(cb.value); });
  var params = getViewParams('proposal-fill');
  var propId = params && params.id;
  var prop = (DATA.proposals || []).find(function(p) { return p.id === propId; }) || (DATA.proposals || [])[0] || {};
  prop.assistants = names;
  closeModal();
  renderView('proposal-fill');
  toast('已选择 ' + names.length + ' 名协助人', 'success');
};

window.proposalNav = function(dir) {
  const ch = (window._proposalChapter || 0) + dir;
  if (ch < 0 || ch > 5) return;
  window._proposalChapter = ch;
  renderView('proposal-fill');
};

window.addBudgetRow = function() {
  const tbody = document.querySelector('#budget-detail-table tbody');
  if (!tbody) return;
  const tr = document.createElement('tr');
  tr.innerHTML = '<td><input class="form-control form-control-sm" placeholder="名称"></td>'
    + '<td><input class="form-control form-control-sm" placeholder="性能指标/功能说明"></td>'
    + '<td><input class="form-control form-control-sm" type="number" value="1" style="width:56px"></td>'
    + '<td><input class="form-control form-control-sm" type="number" value="0" class="budget-item" oninput="calcBudgetSum()" style="width:86px"></td>'
    + '<td><input class="form-control form-control-sm" type="number" value="0" style="width:86px"></td>'
    + '<td><input class="form-control form-control-sm" placeholder="备注"></td>';
  const rows = tbody.querySelectorAll('tr');
  tbody.insertBefore(tr, rows[rows.length - 2]);
};

window.addSurveyRow = function() {
  const tbody = document.getElementById('survey-tbody');
  if (!tbody) return;
  const tr = document.createElement('tr');
  tr.innerHTML = '<td><input class="form-control form-control-sm" placeholder="品牌/型号"></td>'
    + '<td><input class="form-control form-control-sm" placeholder="厂商名称"></td>'
    + '<td><input class="form-control form-control-sm" placeholder="调研内容"></td>'
    + '<td><input class="form-control form-control-sm" placeholder="调研情况"></td>'
    + '<td><button type="button" class="btn btn-sm" style="color:var(--danger);padding:2px 8px" onclick="removeSurveyRow(this)">删</button></td>';
  tbody.appendChild(tr);
};

window.removeSurveyRow = function(btn) {
  const tr = btn.closest('tr');
  const tbody = tr.parentNode;
  if (tbody.children.length <= 1) { alert('至少保留一条调研记录'); return; }
  tr.remove();
};

window.proposalSaveDraft = function() {
  saveDraft('proposal-form', { chapter: window._proposalChapter, ts: Date.now() });
  toast('草稿已暂存', 'success');
};

window.proposalSubmit = function() {
  logOperation('立项管理', '提交申报书', 'PR001', '本科教学质量分析平台', '提交申报书，待单位分管领导审核', null);
  toast('申报书已提交，等待单位分管领导审核', 'success');
  window._proposalChapter = 0;
  setTimeout(() => navigate('proposal-list'), 1200);
};


/* ============================================================
   3. proposal-approve — 申报书详情/审批
   ============================================================ */
registerView('proposal-approve', function() {
  const role   = getCurrentRole();
  const params = getViewParams('proposal-approve');
  const propId = params && params.id;
  const prop   = (DATA.proposals || []).find(p => p.id === propId) || (DATA.proposals || [])[0] || {};
  const bt     = budgetToType(prop.budget || 0);
  const typeCls = { micro:'tag-gray', small:'tag-blue', mid:'tag-orange', major:'tag-red' }[bt.type] || 'tag-gray';

  // Lifecycle stages
  const lcStages = ['需求征集','立项论证','采购','实施','终止','验收','运维','监督评估'];
  const lcActive = 1; // 立项论证
  const lcHtml = `
    <div class="lifecycle-bar" style="display:flex;align-items:center;padding:8px 0;overflow-x:auto">
      ${lcStages.map((s, i) => {
        const state = i < lcActive ? 'lc-done' : i === lcActive ? 'lc-active' : 'lc-pending';
        const lineState = i < lcActive ? 'lc-done-line' : '';
        return (i > 0 ? `<div class="lc-line ${lineState}" style="flex:1;height:2px;min-width:20px;background:${i <= lcActive ? 'var(--primary)' : '#e8e8e8'}"></div>` : '') +
          `<div class="lc-step ${state}" style="display:flex;flex-direction:column;align-items:center;min-width:56px">
            <div class="lc-dot">${i < lcActive ? '&#10003;' : i + 1}</div>
            <div class="lc-label" style="font-size:11px;margin-top:4px;white-space:nowrap">${s}</div>
          </div>`;
      }).join('')}
    </div>`;

  // Approval flow timeline — 8 steps, 11 statuses (Issue B)
  const statusFlowMap = {
    '草稿':       0,
    '待单位审核': 1,
    '初审中':     2,
    '专家论证中': 4,
    '审定中':     6,
    '已立项':     7,
    '单位退回':   1,
    '初审退回':   1,
    '论证不通过': 4,
    '审定不通过': 6,
    '已冻结':     4,
  };
  const flowStep = statusFlowMap[prop.status] || 1;

  const flowNodes = [
    { id:0, label:'项目负责人提交',       step:'步骤 1',   meta:'申报书填报完成并提交' },
    { id:1, label:'单位领导审核',          step:'步骤 2',   meta:'用户单位分管领导确认' },
    { id:2, label:'信息办初审',            step:'步骤 2.4', meta:'初审材料完整性与合规性' },
    { id:3, label:'系统自动级别判断',      step:'步骤 2.4a',meta:'依据预算自动判断评审路径' },
    { id:4, label:'专家评审 / 自行论证',  step:'步骤 2.5', meta:'≥20万组织评审；微型可自行论证' },
    { id:5, label:'材料归档',              step:'步骤 2.6', meta:'信息办技术指导确认' },
    { id:6, label:'领导审定',              step:'步骤 2.7', meta:'领导小组办公室/信息办领导审定' },
    { id:7, label:'下达立项通知',          step:'步骤 2.8', meta:'系统发送正式立项通知书' },
  ];

  const timelineHtml = flowNodes.map(n => {
    const state = n.id < flowStep ? 'done' : n.id === flowStep ? 'active' : '';
    const dotStyle = n.id < flowStep
      ? 'background:var(--primary);color:#fff'
      : n.id === flowStep
        ? 'background:var(--primary);color:#fff'
        : 'background:#e8e8e8;color:#999';
    const isActive = n.id === flowStep;
    return `
      <div class="timeline-item">
        <div class="timeline-dot ${state}"></div>
        <div class="timeline-content">
          <div class="timeline-header">
            <strong>${n.label}</strong>
            <span class="tag tag-gray" style="font-size:10px">${n.step}</span>
            ${isActive ? '<span class="tag tag-blue">当前节点</span>' : ''}
          </div>
          <div class="timeline-meta">${n.meta}</div>
        </div>
      </div>`;
  }).join('');

  // Approval logs
  const logs = (DATA.operationLogs || []).filter(l => l.targetId === propId || l.targetId === 'PR001');
  const logRows = logs.map(l => `
    <tr>
      <td>${l.time}</td>
      <td>${l.operator}（${l.role}）</td>
      <td>${l.action}</td>
      <td>${l.detail}</td>
    </tr>`).join('') || '<tr><td colspan="4" style="text-align:center;color:var(--text-secondary);padding:20px">暂无操作记录</td></tr>';

  // ── Issue D: Tab 角色可见性矩阵 ──
  // Tab: 0=申报书内容, 1=审批时间轴, 2=评审信息, 3=退回记录, 4=操作日志
  const tabDef = [
    { key: 'content',  label: '申报书内容',  roles: [] },  // 所有角色可见
    { key: 'timeline', label: '审批时间轴',  roles: [] },
    { key: 'review',   label: '评审信息',    roles: ['info-admin','info-leader','leadership-office','leadership-group','expert'] },
    { key: 'returns',  label: '退回记录',    roles: ['info-admin','info-leader','project-manager','project-assistant','unit-leader'] },
    { key: 'logs',     label: '操作日志',    roles: ['info-admin','info-leader','leadership-office','sys-admin'] },
  ];
  const visibleTabs = tabDef.filter(t => t.roles.length === 0 || t.roles.includes(role));
  const activeTab = window._approveTab || 'timeline';

  // ── Issue D: 操作按钮动态显示规则 ──
  function actionPanel() {
    const s = prop.status;
    // 单位领导：仅在 待单位审核 时可操作
    if (role === 'unit-leader') {
      if (s === '待单位审核') {
        return `
          <div class="card-title">单位审核操作（步骤 2.3）</div>
          <p style="font-size:12px;color:var(--text-secondary);margin-bottom:10px">审核本单位项目申报书，确认后转交信息办初审。</p>
          <div style="display:flex;gap:10px;flex-wrap:wrap">
            <button class="btn btn-primary" onclick="approveUnitLeader(true,'${prop.id}','${prop.projectName}')">&#10003; 审核通过</button>
            <button class="btn btn-warning" onclick="showReturnDialog('退回修改', function(cat,reason){ logOperation('立项管理','单位退回申报书','${prop.id}','${prop.projectName}','单位退回：'+reason,null); toast('已退回申报书','warning'); navigate('dashboard'); })">退回修改</button>
          </div>`;
      }
      return '<div class="notice-item info">当前状态无需操作。</div>';
    }
    // 信息办管理员：初审中 时可操作
    if (role === 'info-admin') {
      if (s === '初审中') {
        return `
          <div class="card-title">初审操作（步骤 2.4）</div>
          <p style="font-size:12px;color:var(--text-secondary);margin-bottom:10px">审核申报材料完整性与合规性。</p>
          <div style="display:flex;gap:10px;flex-wrap:wrap">
            <button class="btn btn-primary" onclick="approveInitialReview()">&#10003; 初审通过</button>
            <button class="btn btn-warning" onclick="showReturnDialog('初审退回', function(cat,reason){ logOperation('立项管理','初审退回申报书','${prop.id}','${prop.projectName}','初审退回：'+reason,null); toast('已退回申报书','warning'); navigate('proposal-list'); })">退回修改</button>
          </div>`;
      }
      return '<div class="notice-item info">当前状态无需初审操作。可查看项目详情。</div>';
    }
    // 信息办领导：审批操作
    if (role === 'info-leader') {
      return `
        <div class="card-title">审批操作</div>
        <div style="display:flex;gap:10px;flex-wrap:wrap">
          <button class="btn btn-primary" onclick="approveInfoLeader()">&#10003; 审批通过</button>
          <button class="btn btn-warning" onclick="showReturnDialog('退回修改', function(cat,reason){ logOperation('立项管理','退回申报书','${prop.id}','${prop.projectName}','退回：'+reason,null); toast('已退回申报书','warning'); navigate('proposal-list'); })">退回修改</button>
        </div>`;
    }
    // 领导小组办公室：审定操作（步骤 2.7）— 中/小/微型项目
    if (role === 'leadership-office') {
      if (s === '审定中') {
        return `
          <div class="card-title">审定操作（步骤 2.7）</div>
          <p style="font-size:12px;color:var(--text-secondary);margin-bottom:10px">审定中/小/微型项目立项。</p>
          <div style="display:flex;gap:10px;flex-wrap:wrap">
            <button class="btn btn-primary" onclick="approveOfficeFinal(true)">&#10003; 审定通过</button>
            <button class="btn btn-danger"  onclick="approveOfficeFinal(false)">审定不通过</button>
          </div>`;
      }
      return '<div class="notice-item info">当前状态无需审定操作。</div>';
    }
    // 领导小组：仅重大项目审定
    if (role === 'leadership-group') {
      if (bt.type !== 'major') {
        return '<div class="notice-item info">重大项目（≥200万）需领导小组审定，本项目级别不符合条件。</div>';
      }
      if (s === '审定中') {
        return `
          <div class="card-title">审定操作（步骤 2.7 — 重大项目）</div>
          <div style="display:flex;gap:10px;flex-wrap:wrap">
            <button class="btn btn-primary" onclick="approveOfficeFinal(true)">&#10003; 审定通过</button>
            <button class="btn btn-danger"  onclick="approveOfficeFinal(false)">审定不通过</button>
          </div>`;
      }
      return '<div class="notice-item info">当前状态无需审定操作。</div>';
    }
    // 项目负责人：退回/不通过状态时可修改申报书
    if (role === 'project-manager') {
      if (['单位退回','初审退回','论证不通过','审定不通过'].includes(s)) {
        return `
          <div class="card-title">修改申报书</div>
          <div class="notice-item warning" style="margin-bottom:10px">
            申报书已被退回，请根据退回意见修改后重新提交。
            ${s === '初审退回' ? '<br><span style="font-size:11px;color:var(--text-secondary)">注：重新提交后需经单位领导重新审核。</span>' : ''}
            ${s === '论证不通过' ? '<br><span style="font-size:11px;color:var(--text-secondary)">注：可修改后重新论证（上限 2 轮，BR-13）。当前第 ' + (prop.reviewRound || 1) + ' 轮。</span>' : ''}
          </div>
          <button class="btn btn-primary" onclick="navigate('proposal-fill',{id:'${prop.id}'})">修改申报书 →</button>`;
      }
      return '<div class="notice-item info">查看模式 — 申报书流转中，暂不可编辑。</div>';
    }
    return '<div class="notice-item info">当前角色为只读模式。</div>';
  }

  // ── Issue D: 评审信息 Tab 内容 ──
  const reviewInfo = (function() {
    const rv = prop.reviewTaskId ? (DATA.reviews || []).find(r => r.id === prop.reviewTaskId) : null;
    if (!rv && prop.reviewPath !== 'self-organized') return '<div style="text-align:center;padding:24px;color:var(--text-secondary)">暂无评审信息（尚未进入评审阶段）</div>';
    if (prop.reviewPath === 'self-organized') {
      const mp = (DATA.microProjects || []).find(m => m.projectId === prop.id);
      if (!mp) return '<div style="text-align:center;padding:24px;color:var(--text-secondary)">自行论证信息尚未提交</div>';
      return `
        <div class="card-title" style="font-size:13px">自行论证信息</div>
        <table class="data-table"><tbody>
          <tr><td style="width:140px;color:var(--text-secondary)">论证方式</td><td>${mp.selfReview?.method || '—'}</td></tr>
          <tr><td style="color:var(--text-secondary)">论证日期</td><td>${mp.selfReview?.date || '—'}</td></tr>
          <tr><td style="color:var(--text-secondary)">论证结论</td><td>${mp.selfReview?.conclusion === 'approved' ? '<span class="tag tag-success">通过</span>' : mp.selfReview?.conclusion || '—'}</td></tr>
          <tr><td style="color:var(--text-secondary)">信息办确认</td><td>${mp.infoConfirmStatus === 'confirmed' ? '<span class="tag tag-success">已确认</span> ' + (mp.infoConfirmBy || '') : '<span class="tag tag-orange">待确认</span>'}</td></tr>
        </tbody></table>`;
    }
    return `
      <div class="card-title" style="font-size:13px">评审任务信息</div>
      <table class="data-table"><tbody>
        <tr><td style="width:140px;color:var(--text-secondary)">评审任务 ID</td><td>${rv.id}</td></tr>
        <tr><td style="color:var(--text-secondary)">评审类型</td><td>${rv.type === 'approval' ? '立项论证' : '验收评审'}</td></tr>
        <tr><td style="color:var(--text-secondary)">评审日期</td><td>${formatDate(rv.date)}</td></tr>
        <tr><td style="color:var(--text-secondary)">参与专家</td><td>${(rv.experts || []).length} 名</td></tr>
        <tr><td style="color:var(--text-secondary)">评审状态</td><td>${rv.status === 'in-progress' ? '<span class="tag tag-blue">进行中</span>' : rv.status === 'passed' ? '<span class="tag tag-success">已通过</span>' : '<span class="tag tag-red">未通过</span>'}</td></tr>
        <tr><td style="color:var(--text-secondary)">评审结论</td><td>${rv.conclusion || '待评审'}</td></tr>
      </tbody></table>`;
  })();

  // ── Issue D: 退回记录 Tab 内容 ──
  const returnInfo = (function() {
    if (!prop.lastRejection) return '<div style="text-align:center;padding:24px;color:var(--text-secondary)">暂无退回记录</div>';
    const r = prop.lastRejection;
    return `
      <div class="card-title" style="font-size:13px">最近一次退回</div>
      <table class="data-table"><tbody>
        <tr><td style="width:140px;color:var(--text-secondary)">退回步骤</td><td>步骤 ${r.step}</td></tr>
        <tr><td style="color:var(--text-secondary)">退回分类</td><td>${r.category || '—'}</td></tr>
        <tr><td style="color:var(--text-secondary)">退回原因</td><td>${r.reason}</td></tr>
        <tr><td style="color:var(--text-secondary)">退回人</td><td>${r.rejectedBy}</td></tr>
        <tr><td style="color:var(--text-secondary)">退回时间</td><td>${r.rejectedAt}</td></tr>
      </tbody></table>
      <p style="font-size:11px;color:var(--text-secondary);margin-top:8px">完整退回历史请查看操作日志。</p>`;
  })();

  // ── Issue D: 申报书内容 Tab ──
  const proposalContent = `
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
      <div><div style="font-size:12px;color:var(--text-secondary)">建设目标</div><div style="margin-top:4px;font-size:13px">${prop.goal || '—'}</div></div>
      <div><div style="font-size:12px;color:var(--text-secondary)">技术方案</div><div style="margin-top:4px;font-size:13px">${prop.techPlan || '—'}</div></div>
      <div><div style="font-size:12px;color:var(--text-secondary)">建设内容</div><div style="margin-top:4px;font-size:13px">${prop.buildContent || '—'}</div></div>
      <div><div style="font-size:12px;color:var(--text-secondary)">安全方案</div><div style="margin-top:4px;font-size:13px">${prop.securityPlan || '—'}</div></div>
    </div>
    <div style="margin-top:12px"><div style="font-size:12px;color:var(--text-secondary)">预算明细</div>
      <div style="margin-top:4px;font-size:13px">软件 ${prop.budgetSoftware||0} 万 · 硬件 ${prop.budgetHardware||0} 万 · 服务 ${prop.budgetService||0} 万 · 运维 ${prop.budgetOps||0} 万</div>
    </div>
    ${prop.reviewPath ? '<div style="margin-top:12px"><div style="font-size:12px;color:var(--text-secondary)">评审路径</div><div style="margin-top:4px"><span class="tag tag-blue">' + ({
      'standard-review':'信息办组织评审','self-organized':'自行论证','exempt':'免评审'
    }[prop.reviewPath] || prop.reviewPath) + '</span> &nbsp; 论证轮次：第 ' + (prop.reviewRound||1) + ' 轮</div></div>' : ''}
    <div style="margin-top:12px;text-align:right">
      <a onclick="navigate('proposal-fill',{id:'${prop.id}'})" style="font-size:12px">查看完整申报书 →</a>
    </div>`;

  // ── Issue G: 状态流转图 ──
  const flowChartHtml = `
    <div class="card-title" style="font-size:13px">申报书状态流转规则（11 状态 / 15 条规则）</div>
    <div style="background:#f8f9fa;border-radius:6px;padding:12px 16px;font-size:11px;line-height:1.8;font-family:monospace;overflow-x:auto;margin-bottom:12px">
      <pre style="margin:0;white-space:pre">
  草稿 ──提交──→ 待单位审核 ──通过──→ 初审中 ──通过──→ [系统判断路径]
    │                │                  │                    │
    │             单位退回           初审退回          ┌──────┼──────┐
    │                │                  │          标准评审  自行论证  免评审
    │                ↓                  ↓              ↓       ↓       │
    │           项目负责人修改    项目负责人修改   专家论证中  (2.5m)   │
    │           → 待单位审核      → 待单位审核       │         │      │
    │                                            ┌───┴───┐     │      │
    │                                         通过    不通过   ↓      │
    │                                            │       ↓   审定中 ←─┘
    │                                            ↓  论证不通过
    │                                          审定中  (可修改,≤2轮)
    │                                            │     不通过2次→已冻结
    │                                       ┌────┴────┐
    │                                     通过     不通过
    │                                       ↓         ↓
    │                                    已立项    审定不通过
      </pre>
    </div>
    <table class="data-table" style="font-size:11px">
      <thead><tr><th>#</th><th>当前状态</th><th>触发动作</th><th>目标状态</th><th>操作人</th><th>备注</th></tr></thead>
      <tbody>
        <tr><td>1</td><td>草稿</td><td>提交申报书</td><td>待单位审核</td><td>项目负责人</td><td>—</td></tr>
        <tr><td>2</td><td>待单位审核</td><td>审核通过</td><td>初审中</td><td>单位分管领导</td><td>—</td></tr>
        <tr><td>3</td><td>待单位审核</td><td>退回</td><td>单位退回</td><td>单位分管领导</td><td>—</td></tr>
        <tr><td>4</td><td>单位退回</td><td>修改重新提交</td><td>待单位审核</td><td>项目负责人</td><td>—</td></tr>
        <tr><td>5</td><td>初审中</td><td>初审通过</td><td>专家论证中/审定中</td><td>信息办管理员</td><td>系统自动路由：≥20万→评审；微型→可选；免评审→直接审定</td></tr>
        <tr><td>6</td><td>初审中</td><td>退回</td><td>初审退回</td><td>信息办管理员</td><td>—</td></tr>
        <tr><td>7</td><td>初审退回</td><td>修改重新提交</td><td>待单位审核</td><td>项目负责人</td><td>需单位领导重新审核</td></tr>
        <tr><td>8</td><td>专家论证中</td><td>评审通过</td><td>审定中</td><td>信息办管理员归档</td><td>—</td></tr>
        <tr><td>9</td><td>专家论证中</td><td>评审不通过</td><td>论证不通过</td><td>信息办管理员归档</td><td>—</td></tr>
        <tr><td>10</td><td>论证不通过</td><td>修改重新论证</td><td>专家论证中</td><td>项目负责人</td><td>上限 2 轮（BR-13）</td></tr>
        <tr><td>11</td><td>论证不通过</td><td>二次论证仍不通过</td><td>已冻结</td><td>系统自动</td><td>冻结一年（BR-13）</td></tr>
        <tr><td>12</td><td>审定中</td><td>审定通过</td><td>已立项</td><td>领导小组办公室/领导小组</td><td>—</td></tr>
        <tr><td>13</td><td>审定中</td><td>审定不通过</td><td>审定不通过</td><td>领导小组办公室/领导小组</td><td>—</td></tr>
        <tr><td>14</td><td>审定不通过</td><td>需新建 ProjectProposal</td><td>—</td><td>项目负责人</td><td>不可在原申报书上修改</td></tr>
        <tr><td>15</td><td>已立项</td><td>下达立项通知</td><td>—</td><td>信息办管理员</td><td>步骤 2.8</td></tr>
      </tbody>
    </table>`;

  // ── Tab content rendering ──
  function renderTabContent(tabKey) {
    if (tabKey === 'content')  return proposalContent;
    if (tabKey === 'timeline') return '<div class="timeline">' + timelineHtml + '</div>';
    if (tabKey === 'review')   return reviewInfo;
    if (tabKey === 'returns')  return returnInfo;
    if (tabKey === 'logs')     return `
      <table class="data-table">
        <thead><tr><th>时间</th><th>操作人</th><th>操作</th><th>备注</th></tr></thead>
        <tbody>${logRows}</tbody>
      </table>`;
    return '';
  }

  const tabBar = visibleTabs.map(t => `
    <div onclick="window._approveTab='${t.key}';renderView('proposal-approve')"
      style="padding:8px 18px;cursor:pointer;font-size:13px;white-space:nowrap;
      ${activeTab === t.key ? 'border-bottom:2px solid var(--primary);color:var(--primary);font-weight:600;margin-bottom:-2px' : 'color:var(--text-secondary)'}">
      ${t.label}
    </div>`).join('');

  return `
    ${breadcrumb('项目管理', '立项管理', '审批详情')}
    <div class="page-header">
      <div class="page-title">申报书审批详情</div>
      <button class="btn" onclick="navigate('proposal-list')">← 返回列表</button>
    </div>

    <!-- 项目信息卡 -->
    <div class="card">
      <div class="card-title">项目基本信息</div>
      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px">
        <div><div style="font-size:12px;color:var(--text-secondary)">项目名称</div><div style="font-weight:600;margin-top:4px">${prop.projectName || '—'}</div></div>
        <div><div style="font-size:12px;color:var(--text-secondary)">申报单位</div><div style="margin-top:4px">${prop.unit || '—'}</div></div>
        <div><div style="font-size:12px;color:var(--text-secondary)">预算金额</div><div style="margin-top:4px">${prop.budget || '—'} 万元 &nbsp;<span class="tag ${typeCls}">${bt.label}</span></div></div>
        <div><div style="font-size:12px;color:var(--text-secondary)">项目负责人</div><div style="margin-top:4px">${prop.manager || '—'}</div></div>
        <div><div style="font-size:12px;color:var(--text-secondary)">当前状态</div><div style="margin-top:4px"><span class="tag ${statusTagMap[prop.status] || 'tag-gray'}">${prop.status}</span></div></div>
        <div><div style="font-size:12px;color:var(--text-secondary)">论证轮次</div><div style="margin-top:4px">第 ${prop.reviewRound || 1} 轮</div></div>
        <div><div style="font-size:12px;color:var(--text-secondary)">评审路径</div><div style="margin-top:4px">${prop.reviewPath ? ({'standard-review':'信息办组织评审','self-organized':'自行论证','exempt':'免评审'}[prop.reviewPath] || '—') : '待确定'}</div></div>
        <div><div style="font-size:12px;color:var(--text-secondary)">提交日期</div><div style="margin-top:4px">${formatDate(prop.submittedAt)}</div></div>
      </div>
    </div>

    <!-- 生命周期进度 -->
    <div class="card">
      <div class="card-title">项目生命周期</div>
      ${lcHtml}
    </div>

    <!-- Issue D: Tab 导航 + 操作面板 -->
    <div style="display:grid;grid-template-columns:1fr 320px;gap:16px">
      <div class="card" style="padding-top:0">
        <div style="display:flex;border-bottom:2px solid #f0f0f0;margin-bottom:14px;padding-top:4px">${tabBar}</div>
        ${renderTabContent(activeTab)}
      </div>
      <div class="card">
        ${actionPanel()}
      </div>
    </div>

    <!-- Issue G: 状态流转图 -->
    <div class="card">
      ${flowChartHtml}
    </div>`;
});

/* -- 审批操作函数 -- */
window.approveInitialReview = function(overridePropId) {
  const params = getViewParams('proposal-approve') || getViewParams('preliminary-review');
  const propId = overridePropId || (params && params.id) || 'PR001';
  const prop   = (DATA.proposals || []).find(p => p.id === propId) || (DATA.proposals || [])[0] || {};
  const bt     = budgetToType(prop.budget || 0);

  logOperation('立项管理', '初审通过', propId, prop.projectName, '信息办初审通过，进入自动判断', null);

  if (bt.type === 'micro') {
    showModal('系统判断结果（步骤 2.4a）— 微型项目',
      `<p style="margin-bottom:12px">预算 <strong>${prop.budget} 万元</strong>，属于 <span class="tag tag-gray">微型项目</span>，可选择评审路径：</p>
       <div style="display:flex;flex-direction:column;gap:10px">
         <button class="btn btn-primary" onclick="closeModal();navigate('review-launch')">选项 A：申请信息办组织评审（步骤 2.5）</button>
         <button class="btn" onclick="closeModal();navigate('self-review')">选项 B：申请单位自行组织论证（步骤 2.5m）</button>
       </div>`,
      '<button class="btn" onclick="closeModal()">关闭</button>');
  } else if (prop.budget >= 20) {
    showModal('系统判断结果（步骤 2.4a）— 须组织专家评审',
      `<p>预算 <strong>${prop.budget} 万元</strong>（${bt.label}），依据管理规定须组织专家评审。</p>`,
      `<button class="btn" onclick="closeModal()">取消</button>
       <button class="btn btn-primary" onclick="closeModal();navigate('review-launch')">前往发起评审 →</button>`);
  } else {
    showModal('系统判断结果（步骤 2.4a）— 可免评审',
      `<p>预算 <strong>${prop.budget} 万元</strong>，符合免评审条件，可直接进入审定阶段（步骤 2.7）。</p>`,
      `<button class="btn" onclick="closeModal()">取消</button>
       <button class="btn btn-primary" onclick="closeModal();toast('已跳转至审定环节','success');navigate('proposal-approve')">直接进入审定 →</button>`);
  }
};

// Issue D: 单位领导审核操作
window.approveUnitLeader = function(passed, propId, propName) {
  if (passed) {
    logOperation('立项管理', '单位审核通过', propId, propName, '单位分管领导审核通过，转交信息办初审', null);
    toast('审核通过，已转交信息办初审', 'success');
    setTimeout(() => navigate('dashboard'), 1000);
  }
};

window.approveInfoLeader = function() {
  const params = getViewParams('proposal-approve');
  const propId = params && params.id || 'PR001';
  const prop   = (DATA.proposals || []).find(p => p.id === propId) || (DATA.proposals || [])[0] || {};
  logOperation('立项管理', '审批通过', propId, prop.projectName, '信息办领导审批通过', null);
  toast('已通过审批', 'success');
  setTimeout(() => navigate('proposal-list'), 1000);
};

window.approveOfficeFinal = function(passed) {
  const params = getViewParams('proposal-approve');
  const propId = params && params.id || 'PR001';
  const prop   = (DATA.proposals || []).find(p => p.id === propId) || (DATA.proposals || [])[0] || {};
  if (passed) {
    logOperation('立项管理', '审定通过', propId, prop.projectName, '审定通过，准备下达立项通知', null);
    toast('审定通过，请下达立项通知', 'success');
    setTimeout(() => navigate('approval-notice', { id: propId }), 1000);
  } else {
    logOperation('立项管理', '审定不通过', propId, prop.projectName, '审定不通过', null);
    toast('已标记为审定不通过', 'warning');
    setTimeout(() => navigate('proposal-list'), 1000);
  }
};


/* ============================================================
   4. approval-notice — 下达立项通知
   ============================================================ */
registerView('approval-notice', function() {
  const params = getViewParams('approval-notice');
  const propId = params && params.id;
  const prop   = (DATA.proposals || []).find(p => p.id === propId) || (DATA.proposals || [])[0] || {};
  const projNo = 'XDA-' + new Date().getFullYear() + '-' + (Math.floor(Math.random() * 900) + 100);
  const today  = new Date().toISOString().slice(0, 10);

  const template = `尊敬的 ${prop.unit || '申报单位'}：

经学校信息化建设项目立项审定，贵单位申报的「${prop.projectName || ''}」项目正式获批立项。

项目编号：${projNo}
批复金额：${prop.budget || ''}万元
建设周期：${prop.planStart || ''} 至 ${prop.planEnd || ''}

请严格按照审定的建设方案和预算执行，遵守学校相关管理规定，尽快启动采购程序，并保持与信息化办公室的沟通协调。

特此通知。

西南大学信息化办公室
${today}`;

  return `
    ${breadcrumb('项目管理', '立项管理', '下达立项通知')}
    <div class="page-header">
      <div class="page-title">下达立项通知书</div>
      <button class="btn" onclick="navigate('proposal-list')">← 返回列表</button>
    </div>
    <div class="card" style="max-width:700px">
      <div class="card-title">立项通知书信息</div>
      <div class="form-grid cols-2">
        <div class="form-item">
          <label class="form-label">项目名称</label>
          <input class="form-control" value="${prop.projectName || ''}" readonly>
        </div>
        <div class="form-item">
          <label class="form-label">申报单位</label>
          <input class="form-control" value="${prop.unit || ''}" readonly>
        </div>
        <div class="form-item">
          <label class="form-label">批复预算金额（万元）</label>
          <input class="form-control" value="${prop.budget || ''}" readonly>
        </div>
        <div class="form-item">
          <label class="form-label">项目编号（自动生成）</label>
          <input class="form-control" value="${projNo}" readonly>
        </div>
        <div class="form-item">
          <label class="form-label required">批复日期</label>
          <input class="form-control" type="date" value="${today}" id="notice-date">
        </div>
        <div class="form-item">
          <label class="form-label">抄送单位</label>
          <input class="form-control" placeholder="如：财务处、审计处" id="notice-cc">
        </div>
      </div>
      <div class="form-item" style="margin-top:8px">
        <label class="form-label required">通知正文</label>
        <textarea class="form-control" id="notice-body" rows="12">${template}</textarea>
      </div>
      <div class="form-actions">
        <button class="btn" onclick="navigate('proposal-approve',{id:'${propId}'})">← 返回审批</button>
        <button class="btn btn-primary" onclick="sendApprovalNotice('${propId}','${prop.projectName || ''}','${projNo}')">生成并发送立项通知书</button>
      </div>
    </div>`;
});

window.sendApprovalNotice = function(propId, propName, projNo) {
  logOperation('立项管理', '下达立项通知', propId, propName, '立项通知书已生成并发送，项目编号：' + projNo, null);
  toast('立项通知书已发送！', 'success');
  setTimeout(() => navigate('proposal-list'), 1500);
};


/* ============================================================
   5. self-review — 微型项目自行论证（步骤 2.5m）
   ============================================================ */
registerView('self-review', function() {
  const role = getCurrentRole();
  const draft = loadDraft('self-review') || {};

  const memberRows = [0, 1, 2].map(i => `
    <tr>
      <td><input class="form-control form-control-sm" name="sr-name-${i}" value="${draft['sr-name-'+i] || ''}" placeholder="姓名"></td>
      <td><input class="form-control form-control-sm" name="sr-title-${i}" value="${draft['sr-title-'+i] || ''}" placeholder="职称/职务"></td>
      <td><input class="form-control form-control-sm" name="sr-unit-${i}" value="${draft['sr-unit-'+i] || ''}" placeholder="所在单位"></td>
    </tr>`).join('');

  return `
    ${breadcrumb('项目管理', '立项管理', '微型项目自行论证')}
    <div class="page-header">
      <div class="page-title">微型项目自行论证填报</div>
      <button class="btn" onclick="navigate('proposal-list')">← 返回</button>
    </div>
    <div class="notice-item info" style="margin-bottom:16px">
      <strong>步骤 2.5m</strong> — 适用于预算 &lt;20万元（微型）且选择自行论证路径的项目。提交后需经信息办技术指导确认。
    </div>
    <div class="card" style="max-width:720px">
      <div class="card-title">自行论证报告</div>
      <form id="sr-form" onsubmit="return false">
        <div class="form-grid cols-2">
          <div class="form-item">
            <label class="form-label required">论证方式</label>
            <div style="display:flex;gap:16px;margin-top:4px">
              <label><input type="radio" name="sr-method" value="会议" ${draft['sr-method']==='会议'?'checked':'checked'}> 会议论证</label>
              <label><input type="radio" name="sr-method" value="书面" ${draft['sr-method']==='书面'?'checked':''}> 书面论证</label>
              <label><input type="radio" name="sr-method" value="专家咨询" ${draft['sr-method']==='专家咨询'?'checked':''}> 专家咨询</label>
            </div>
          </div>
          <div class="form-item">
            <label class="form-label required">论证日期</label>
            <input class="form-control" type="date" id="sr-date" value="${draft['sr-date'] || ''}">
          </div>
        </div>

        <div class="form-section-title">参与论证人员（至少3人）</div>
        <table class="data-table" style="margin-bottom:16px">
          <thead><tr><th>姓名</th><th>职称/职务</th><th>所在单位</th></tr></thead>
          <tbody>${memberRows}</tbody>
        </table>
        <div class="form-grid cols-1">
          <div class="form-item">
            <label class="form-label required">论证结论</label>
            <div style="display:flex;gap:16px;margin-top:4px">
              <label><input type="radio" name="sr-conclusion" value="通过" ${draft['sr-conclusion']==='通过'?'checked':'checked'}> 通过</label>
              <label><input type="radio" name="sr-conclusion" value="修改后通过" ${draft['sr-conclusion']==='修改后通过'?'checked':''}> 修改后通过</label>
              <label><input type="radio" name="sr-conclusion" value="不通过" ${draft['sr-conclusion']==='不通过'?'checked':''}> 不通过</label>
            </div>
          </div>
          <div class="form-item">
            <label class="form-label required">论证意见摘要</label>
            <textarea class="form-control" id="sr-opinion" rows="5" placeholder="请填写论证意见摘要...">${draft['sr-opinion'] || ''}</textarea>
          </div>
          <div class="form-item">
            <label class="form-label required">论证材料附件</label>
            <div style="border:1px dashed var(--border);border-radius:4px;padding:20px;text-align:center;color:var(--text-secondary)">
              <input type="file" id="sr-file" style="display:none" multiple>
              <div>
                <button type="button" class="btn btn-sm" onclick="document.getElementById('sr-file').click()">选择文件</button>
                <span style="margin-left:8px;font-size:12px">支持 PDF、Word、图片等格式（必须上传）</span>
              </div>
              <div id="sr-file-list" style="margin-top:8px;font-size:12px"></div>
            </div>
          </div>
        </div>
        <div class="form-actions">
          <button class="btn btn-warning" onclick="selfReviewSaveDraft()">暂存草稿</button>
          <button class="btn btn-primary" onclick="selfReviewSubmit()">提交</button>
        </div>
      </form>
    </div>`;
});

window.selfReviewSaveDraft = function() {
  const data = {
    'sr-method':     document.querySelector('[name="sr-method"]:checked')?.value || '',
    'sr-date':       document.getElementById('sr-date')?.value || '',
    'sr-conclusion': document.querySelector('[name="sr-conclusion"]:checked')?.value || '',
    'sr-opinion':    document.getElementById('sr-opinion')?.value || '',
  };
  [0,1,2].forEach(i => {
    data['sr-name-'+i]  = document.querySelector('[name="sr-name-'+i+'"]')?.value || '';
    data['sr-title-'+i] = document.querySelector('[name="sr-title-'+i+'"]')?.value || '';
    data['sr-unit-'+i]  = document.querySelector('[name="sr-unit-'+i+'"]')?.value || '';
  });
  saveDraft('self-review', data);
  toast('草稿已暂存', 'success');
};

window.selfReviewSubmit = function() {
  const date    = document.getElementById('sr-date')?.value;
  const opinion = document.getElementById('sr-opinion')?.value;
  if (!date)    { toast('请填写论证日期', 'warning'); return; }
  if (!opinion?.trim()) { toast('请填写论证意见摘要', 'warning'); return; }
  logOperation('立项管理', '提交自行论证报告', 'PR_MICRO', '微型项目自行论证', '自行论证报告已提交，等待信息办确认', null);
  clearDraft('self-review');
  toast('自行论证报告已提交，等待信息办技术指导确认', 'success');
  setTimeout(() => navigate('info-confirm'), 1200);
};


/* ============================================================
   6. info-confirm — 信息办技术指导确认（步骤 2.6m）
   ============================================================ */
registerView('info-confirm', function() {
  const role  = getCurrentRole();
  const draft = loadDraft('self-review') || {};
  const isAdmin = role === 'info-admin';

  const conclusionTag = (() => {
    const c = draft['sr-conclusion'] || '通过';
    if (c === '通过') return '<span class="tag tag-success">通过</span>';
    if (c === '修改后通过') return '<span class="tag tag-orange">修改后通过</span>';
    return '<span class="tag tag-red">不通过</span>';
  })();

  const members = [0,1,2].map(i => draft['sr-name-'+i] || '').filter(Boolean);
  const membersText = members.length ? members.join('、') : '（无记录）';

  const adminDashboard = isAdmin ? `
    <div class="notice-item warning" style="margin-bottom:16px">
      <strong>微型项目抽查</strong> — 信息办可对已确认的微型项目自行论证材料开展抽查，发现问题可转为信息办组织评审。
    </div>` : '';

  const actionPanel = isAdmin ? `
    <div class="card" style="max-width:400px">
      <div class="card-title">技术指导确认操作</div>
      <div style="display:flex;flex-direction:column;gap:10px">
        <button class="btn btn-primary" onclick="infoConfirmPass()">&#10003; 确认通过 → 进入审定（步骤 2.7）</button>
        <button class="btn btn-warning" onclick="infoConfirmReturn()">退回补充</button>
        <button class="btn" onclick="infoConfirmEscalate()">转为信息办组织评审</button>
      </div>
    </div>` : `<div class="notice-item info">等待信息办管理员确认中…</div>`;

  return `
    ${breadcrumb('项目管理', '立项管理', '技术指导确认')}
    <div class="page-header">
      <div class="page-title">信息办技术指导确认</div>
      <button class="btn" onclick="navigate('proposal-list')">← 返回</button>
    </div>
    ${adminDashboard}
    <div style="display:grid;grid-template-columns:1fr auto;gap:16px;align-items:start">
      <div class="card">
        <div class="card-title">自行论证报告摘要（只读）</div>
        <table class="data-table">
          <tbody>
            <tr><td style="width:140px;color:var(--text-secondary)">论证方式</td><td>${draft['sr-method'] || '会议论证'}</td></tr>
            <tr><td style="color:var(--text-secondary)">论证日期</td><td>${draft['sr-date'] || '—'}</td></tr>
            <tr><td style="color:var(--text-secondary)">参与人员</td><td>${membersText}</td></tr>
            <tr><td style="color:var(--text-secondary)">论证结论</td><td>${conclusionTag}</td></tr>
            <tr>
              <td style="color:var(--text-secondary);vertical-align:top">论证意见摘要</td>
              <td style="white-space:pre-wrap">${draft['sr-opinion'] || '（暂无）'}</td>
            </tr>
            <tr>
              <td style="color:var(--text-secondary)">附件</td>
              <td><span class="tag tag-gray">已上传（演示）</span></td>
            </tr>
          </tbody>
        </table>
      </div>
      ${actionPanel}
    </div>`;
});

window.infoConfirmPass = function() {
  logOperation('立项管理', '技术指导确认通过', 'PR_MICRO', '微型项目', '信息办确认通过，进入审定环节', null);
  toast('确认通过，进入审定环节', 'success');
  setTimeout(() => navigate('proposal-approve'), 1000);
};

window.infoConfirmReturn = function() {
  showReturnDialog('退回补充', function(cat, reason) {
    logOperation('立项管理', '退回补充', 'PR_MICRO', '微型项目', '退回原因：' + reason, null);
    toast('已退回，请申报单位补充材料', 'warning');
    setTimeout(() => navigate('self-review'), 1000);
  });
};

window.infoConfirmEscalate = function() {
  showModal('转为信息办组织评审',
    '<p>确认将本微型项目转为信息办组织专家评审？转换后申报单位无需再提交自行论证材料。</p>',
    `<button class="btn" onclick="closeModal()">取消</button>
     <button class="btn btn-primary" onclick="closeModal();logOperation('立项管理','转为信息办评审','PR_MICRO','微型项目','转为信息办组织评审',null);toast('已转为信息办组织评审','info');navigate('review-launch')">确认转换</button>`
  );
};


/* ============================================================
   6. preliminary-review — 信息办管理员初审独立页面
   ============================================================ */
registerView('preliminary-review', function() {
  var role = getCurrentRole();
  var params = getViewParams('preliminary-review');
  var propId = params && params.id;
  var prop = (DATA.proposals || []).find(function(p) { return p.id === propId; }) || (DATA.proposals || [])[0] || {};
  var bt = budgetToType(prop.budget || 0);
  var statusTagMap = {
    '草稿':'tag-gray','待单位审核':'tag-blue','初审中':'tag-cyan','专家论证中':'tag-orange',
    '审定中':'tag-purple','已立项':'tag-success','单位退回':'tag-warning','初审退回':'tag-warning',
    '论证不通过':'tag-red','审定不通过':'tag-red','已冻结':'tag-red'
  };
  var typeCls = { micro:'tag-gray', small:'tag-blue', mid:'tag-orange', major:'tag-red' }[bt.type] || 'tag-gray';

  var checkItems = [
    { id: 'chk-name', label: '项目名称填写完整' },
    { id: 'chk-unit', label: '牵头建设单位信息准确' },
    { id: 'chk-manager', label: '项目负责人信息完整（姓名/电话/邮箱）' },
    { id: 'chk-budget', label: '预算总额与明细一致' },
    { id: 'chk-goal', label: '建设目标描述清晰' },
    { id: 'chk-tech', label: '技术方案可行性论证充分' },
    { id: 'chk-security', label: '安全合规方案完整' },
    { id: 'chk-plan', label: '实施计划时间节点明确' },
  ];
  var checkHtml = checkItems.map(function(item) {
    return '<label style="display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:1px solid #f5f5f5;cursor:pointer">'
      + '<input type="checkbox" class="review-check-item" id="' + item.id + '">'
      + '<span style="font-size:13px">' + item.label + '</span>'
      + '</label>';
  }).join('');

  var contentPreview = '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">'
    + '<div><div style="font-size:12px;color:var(--text-secondary)">建设目标</div><div style="margin-top:4px;font-size:13px">' + (prop.goal || '—') + '</div></div>'
    + '<div><div style="font-size:12px;color:var(--text-secondary)">技术方案</div><div style="margin-top:4px;font-size:13px">' + (prop.techPlan || '—') + '</div></div>'
    + '<div><div style="font-size:12px;color:var(--text-secondary)">建设内容</div><div style="margin-top:4px;font-size:13px">' + (prop.buildContent || '—') + '</div></div>'
    + '<div><div style="font-size:12px;color:var(--text-secondary)">安全方案</div><div style="margin-top:4px;font-size:13px">' + (prop.securityPlan || '—') + '</div></div>'
    + '</div>'
    + '<div style="margin-top:12px"><div style="font-size:12px;color:var(--text-secondary)">预算明细</div>'
    + '<div style="margin-top:4px;font-size:13px">软件 ' + (prop.budgetSoftware||0) + ' 万 · 硬件 ' + (prop.budgetHardware||0) + ' 万 · 服务 ' + (prop.budgetService||0) + ' 万 · 运维 ' + (prop.budgetOps||0) + ' 万</div>'
    + '</div>'
    + '<div style="margin-top:12px;text-align:right"><a onclick="navigate(\'proposal-fill\',{id:\'' + prop.id + '\'})" style="font-size:12px">查看完整申报书 →</a></div>';

  var canOperate = (role === 'info-admin' && prop.status === '初审中');

  return breadcrumb('项目管理', '立项管理', '初审')
    + '<div class="page-header">'
    + '<div class="page-title">申报书初审（步骤 2.4）</div>'
    + '<button class="btn" onclick="navigate(\'proposal-list\')">← 返回列表</button>'
    + '</div>'
    + '<div class="card">'
    + '<div class="card-title">项目基本信息</div>'
    + '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px">'
    + '<div><div style="font-size:12px;color:var(--text-secondary)">项目名称</div><div style="font-weight:600;margin-top:4px">' + (prop.projectName || '—') + '</div></div>'
    + '<div><div style="font-size:12px;color:var(--text-secondary)">申报单位</div><div style="margin-top:4px">' + (prop.unit || '—') + '</div></div>'
    + '<div><div style="font-size:12px;color:var(--text-secondary)">预算金额</div><div style="margin-top:4px">' + (prop.budget || '—') + ' 万元 &nbsp;<span class="tag ' + typeCls + '">' + bt.label + '</span></div></div>'
    + '<div><div style="font-size:12px;color:var(--text-secondary)">项目负责人</div><div style="margin-top:4px">' + (prop.manager || '—') + '</div></div>'
    + '<div><div style="font-size:12px;color:var(--text-secondary)">当前状态</div><div style="margin-top:4px"><span class="tag ' + (statusTagMap[prop.status] || 'tag-gray') + '">' + prop.status + '</span></div></div>'
    + '<div><div style="font-size:12px;color:var(--text-secondary)">提交日期</div><div style="margin-top:4px">' + formatDate(prop.submittedAt) + '</div></div>'
    + '</div>'
    + '</div>'
    + '<div style="display:grid;grid-template-columns:1fr 380px;gap:16px;align-items:start">'
    + '<div class="card">'
    + '<div class="card-title">申报材料预览</div>'
    + contentPreview
    + '</div>'
    + '<div>'
    + '<div class="card" style="margin-bottom:16px">'
    + '<div class="card-title">材料合规性检查</div>'
    + '<p style="font-size:12px;color:var(--text-secondary);margin-bottom:8px">请逐项核查申报材料的完整性与合规性</p>'
    + checkHtml
    + '<div style="margin-top:8px;font-size:12px;color:var(--text-secondary)" id="check-progress">已检查 0 / ' + checkItems.length + ' 项</div>'
    + '</div>'
    + '<div class="card">'
    + '<div class="card-title">初审意见</div>'
    + '<textarea class="form-control" id="pr-opinion" rows="4" placeholder="请填写初审意见（通过时选填，退回时必填）"' + (canOperate ? '' : ' disabled') + '></textarea>'
    + (canOperate
      ? '<div style="display:flex;gap:10px;margin-top:12px">'
        + '<button class="btn btn-primary" style="flex:1" onclick="preliminaryReviewPass()">&#10003; 初审通过</button>'
        + '<button class="btn btn-warning" style="flex:1" onclick="preliminaryReviewReturn()">退回修改</button>'
        + '</div>'
      : '<div class="notice-item info" style="margin-top:12px">' + (role !== 'info-admin' ? '仅信息办管理员可执行初审操作。' : '当前状态（' + prop.status + '）无需初审操作。') + '</div>')
    + '</div>'
    + '</div>'
    + '</div>';
});

document.addEventListener('change', function(e) {
  if (e.target.classList.contains('review-check-item')) {
    var total = document.querySelectorAll('.review-check-item').length;
    var checked = document.querySelectorAll('.review-check-item:checked').length;
    var el = document.getElementById('check-progress');
    if (el) el.textContent = '已检查 ' + checked + ' / ' + total + ' 项';
  }
});

window.preliminaryReviewPass = function() {
  var unchecked = document.querySelectorAll('.review-check-item:not(:checked)').length;
  if (unchecked > 0) {
    if (!confirm('尚有 ' + unchecked + ' 项合规检查未完成，确认通过初审？')) return;
  }
  var params = getViewParams('preliminary-review');
  var propId = params && params.id || 'PR001';
  var prop = (DATA.proposals || []).find(function(p) { return p.id === propId; }) || {};
  var opinion = (document.getElementById('pr-opinion') || {}).value || '';
  logOperation('立项管理', '初审通过', propId, prop.projectName, '初审通过' + (opinion ? '；意见：' + opinion : ''), null);
  approveInitialReview(propId);
};

window.preliminaryReviewReturn = function() {
  var opinion = (document.getElementById('pr-opinion') || {}).value || '';
  if (!opinion.trim()) { toast('退回时请填写初审意见', 'warning'); return; }
  var params = getViewParams('preliminary-review');
  var propId = params && params.id || 'PR001';
  var prop = (DATA.proposals || []).find(function(p) { return p.id === propId; }) || {};
  showReturnDialog('初审退回', function(cat, reason) {
    logOperation('立项管理', '初审退回申报书', propId, prop.projectName, '初审退回：' + reason + '；意见：' + opinion, null);
    toast('已退回申报书', 'warning');
    navigate('proposal-list');
  });
};
