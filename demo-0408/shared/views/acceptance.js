// shared/views/acceptance.js  —  V2.1

/* ====== 验收管理列表 ====== */
registerView('acceptance-list', function() {
  const role        = getCurrentRole();
  const acceptances = DATA.acceptances || [];

  const rows = acceptances.map(a => {
    // BR-15: trial run ≥ 30 days
    const trialDays = a.trialStartAt
      ? Math.round((new Date() - new Date(a.trialStartAt)) / 86400000)
      : a.trialMonths * 30;
    const trialOk = trialDays >= 30;
    const trialTag = trialOk
      ? '<span style="color:var(--success)">' + (a.trialMonths ? a.trialMonths + '个月' : trialDays + '天') + ' <span class="ci-pass"></span></span>'
      : '<span style="color:var(--danger)">' + (a.trialMonths ? a.trialMonths + '个月' : trialDays + '天') + ' <span class="ci-warn"></span> BR-15</span>';

    const statusTag = a.formalStatus === '已通过'
      ? '<span class="tag tag-success">已通过</span>'
      : a.formalStatus === '待组织'
        ? '<span class="tag tag-warning">待组织</span>'
        : '<span class="tag tag-gray">' + (a.formalStatus || '—') + '</span>';

    const reportCell = a.reportFile
      ? '<a onclick="toast(\'打开文件：' + a.reportFile + '\',\'info\');">' + a.reportFile + '</a>'
      : '—';

    // Use correct view ID: formal-acceptance
    let ops = '<button class="btn btn-sm" onclick="navigate(\'internal-check\',{id:\'' + a.id + '\'})">初验详情</button>';
    if (a.formalStatus === '待组织' && (role === 'info-leader' || role === 'info-admin')) {
      ops += ' <button class="btn btn-sm btn-primary" onclick="navigate(\'formal-acceptance\',{id:\'' + a.id + '\'})">组织正式验收</button>';
    }

    return [
      a.projectName,
      formatDate(a.internalPassedAt),
      formatDate(a.trialStartAt),
      trialTag,
      statusTag,
      reportCell,
      ops
    ];
  });

  return `
    ${breadcrumb('验收与运维', '验收管理列表')}
    <div class="page-header">
      <div class="page-title">验收管理列表</div>
    </div>
    <div class="alert alert-info" style="margin-bottom:12px;font-size:12px">
      BR-15：项目内部初验通过后须经过不少于 30 天的试运行期，方可发起正式验收。
    </div>
    <div class="card">
      ${renderTable(['项目名称','内部初验通过','试运行开始','试运行时长','正式验收状态','报告','操作'], rows)}
      <div style="padding:8px 4px;font-size:12px;color:var(--text-secondary)">共 ${acceptances.length} 条记录</div>
    </div>`;
});


/* ====== 内部初验详情 ====== */
registerView('internal-check', function() {
  const params  = getViewParams('internal-check');
  const aid     = (params && typeof params === 'object' && params.id)
                    ? params.id
                    : (params && typeof params === 'string' && params.includes('id='))
                      ? params.split('id=')[1]
                      : 'AC001';
  const a  = (DATA.acceptances || []).find(x => x.id === aid) || (DATA.acceptances || [])[0];
  const p  = a ? (DATA.projects || []).find(x => x.id === a.projectId) || DATA.projects[0] : DATA.projects[0];
  const role     = getCurrentRole();
  const editable = role === 'project-manager';

  if (!a) return '<div class="empty-state"><p>未找到验收记录</p></div>';

  const checkItems = [
    { key: 'func',      label: '功能验证',   desc: '系统功能是否按需求规格说明书全面实现' },
    { key: 'perf',      label: '性能测试',   desc: '系统响应时间、并发量等性能指标是否达标' },
    { key: 'migration', label: '数据迁移',   desc: '历史数据是否完整迁移且数据无丢失' },
    { key: 'security',  label: '安全检查',   desc: '身份认证、权限控制、数据加密等安全要求是否满足' },
    { key: 'training',  label: '用户培训',   desc: '是否完成用户操作培训并提供培训记录' },
    { key: 'docs',      label: '文档交付',   desc: '系统说明书、操作手册、源代码等文档是否齐全' },
  ];

  const checkRows = checkItems.map(item => `
    <tr>
      <td>${item.label}</td>
      <td style="font-size:12px;color:var(--text-secondary)">${item.desc}</td>
      <td style="text-align:center">
        <label style="cursor:${editable ? 'pointer' : 'default'};display:inline-flex;align-items:center;gap:4px">
          <input type="radio" name="chk-${item.key}" value="pass" ${editable ? '' : 'disabled'} checked> 通过
        </label>
      </td>
      <td style="text-align:center">
        <label style="cursor:${editable ? 'pointer' : 'default'};display:inline-flex;align-items:center;gap:4px">
          <input type="radio" name="chk-${item.key}" value="fail" ${editable ? '' : 'disabled'}> 不通过
        </label>
      </td>
    </tr>`).join('');

  const trialStart = a.trialStartAt || '';

  const submitBtn = editable ? `
    <button class="btn btn-primary" onclick="
      const startVal = document.getElementById('ai-trial-start').value;
      const endVal   = document.getElementById('ai-trial-end').value;
      if (!startVal || !endVal) { toast('请填写试运行起止日期','warning'); return; }
      const days = Math.round((new Date(endVal) - new Date(startVal)) / 86400000);
      if (days < 30) {
        toast('BR-15：试运行时长不足30天（当前' + days + '天），无法提交正式验收','warning');
        return;
      }
      logOperation('验收管理','提交内部初验','${a.id}','${a.projectName}','内部初验检查表已提交',null);
      toast('内部初验结果已保存，试运行 ' + days + ' 天，符合BR-15要求','success');
      setTimeout(()=>navigate('acceptance-list'),1500);
    ">提交初验结果</button>` : '';

  return `
    ${breadcrumb('验收与运维', '验收管理列表', '内部初验')}
    <div class="page-header">
      <div class="page-title">内部初验详情</div>
      <button class="btn" onclick="navigate('acceptance-list')">← 返回列表</button>
    </div>

    <div class="card" style="margin-bottom:12px">
      <div class="card-title">项目基本信息</div>
      <div class="detail-grid">
        <div class="detail-item"><div class="detail-label">项目名称</div><div>${p.name}</div></div>
        <div class="detail-item"><div class="detail-label">项目负责人</div><div>${p.manager}</div></div>
        <div class="detail-item"><div class="detail-label">计划完成时间</div><div ${deadlineClass(p.deadline)}>${formatDate(p.deadline)}</div></div>
        <div class="detail-item"><div class="detail-label">项目类型</div><div>${projectTypeTag(p.type)}</div></div>
        <div class="detail-item"><div class="detail-label">内部初验通过时间</div><div>${formatDate(a.internalPassedAt)}</div></div>
        <div class="detail-item"><div class="detail-label">正式验收状态</div><div>${
          a.formalStatus === '已通过'
            ? '<span class="tag tag-success">已通过</span>'
            : '<span class="tag tag-warning">' + (a.formalStatus || '待组织') + '</span>'
        }</div></div>
      </div>
    </div>

    <div class="card" style="margin-bottom:12px">
      <div class="card-title">初验检查表</div>
      ${!editable ? '<div style="padding:6px 0 10px;font-size:12px;color:var(--text-secondary)">当前角色只读，仅项目负责人可编辑</div>' : ''}
      <table class="data-table">
        <thead>
          <tr><th>检查项</th><th>说明</th><th style="width:80px;text-align:center">通过</th><th style="width:80px;text-align:center">不通过</th></tr>
        </thead>
        <tbody>${checkRows}</tbody>
      </table>
    </div>

    <div class="card" style="margin-bottom:12px">
      <div class="card-title">试运行日期</div>
      <div style="padding:4px 0 10px;font-size:12px;color:var(--warning)"><span class="ci-warn"></span> BR-15：试运行期不得少于30天，满足后方可提交正式验收</div>
      <div class="form-grid">
        <div class="form-item">
          <label class="form-label">试运行开始日期</label>
          <input class="form-control" type="date" id="ai-trial-start" value="${trialStart}" ${editable ? '' : 'disabled'}
            onchange="
              const s = this.value;
              const e = document.getElementById('ai-trial-end').value;
              if(s && e){
                const days = Math.round((new Date(e)-new Date(s))/86400000);
                const hint = document.getElementById('ai-days-hint');
                hint.textContent = '试运行天数：' + days + ' 天' + (days >= 30 ? ' 符合BR-15' : ' 不足30天（BR-15）');
                hint.style.color = days >= 30 ? 'var(--success)' : 'var(--danger)';
              }">
        </div>
        <div class="form-item">
          <label class="form-label">试运行结束日期</label>
          <input class="form-control" type="date" id="ai-trial-end" ${editable ? '' : 'disabled'}
            onchange="
              const s = document.getElementById('ai-trial-start').value;
              const e = this.value;
              if(s && e){
                const days = Math.round((new Date(e)-new Date(s))/86400000);
                const hint = document.getElementById('ai-days-hint');
                hint.textContent = '试运行天数：' + days + ' 天' + (days >= 30 ? ' 符合BR-15' : ' 不足30天（BR-15）');
                hint.style.color = days >= 30 ? 'var(--success)' : 'var(--danger)';
              }">
        </div>
      </div>
      <div id="ai-days-hint" style="font-size:13px;margin-top:4px;color:var(--text-secondary)">请填写起止日期后自动计算</div>
    </div>

    <div class="form-actions">
      <button class="btn" onclick="navigate('acceptance-list')">返回列表</button>
      ${submitBtn}
    </div>`;
});


/* ====== 正式验收 ====== */
registerView('formal-acceptance', function() {
  const params = getViewParams('formal-acceptance');
  const aid    = (params && typeof params === 'object' && params.id)
                   ? params.id
                   : (params && typeof params === 'string' && params.includes('id='))
                     ? params.split('id=')[1]
                     : 'AC001';
  const a    = (DATA.acceptances || []).find(x => x.id === aid) || (DATA.acceptances || [])[0];
  const role = getCurrentRole();

  if (!a) return '<div class="empty-state"><p>未找到验收记录</p></div>';

  // Expert group for acceptance: E001, E003, E004
  const expertIds    = ['E001', 'E003', 'E004'];
  const groupExperts = (DATA.experts || []).filter(e => expertIds.includes(e.id) && e.status !== 'blacklisted');
  const externalCount = groupExperts.filter(e => e.scope === 'external').length;
  const totalCount   = groupExperts.length;
  const isOdd        = totalCount % 2 !== 0;
  const ratioOk      = totalCount >= 3 && externalCount / totalCount >= 1/3;
  const br05Ok       = ratioOk && isOdd;

  const expertRows = groupExperts.map(e => `
    <tr>
      <td>${e.name}</td>
      <td>${e.title}</td>
      <td>${e.org}</td>
      <td>${e.scope === 'external' ? '<span class="tag tag-orange">校外</span>' : '<span class="tag tag-gray">校内</span>'}</td>
      <td>${
        { tech: '<span class="tag tag-blue">技术</span>', business: '<span class="tag tag-green">业务</span>', user: '<span class="tag tag-purple">用户</span>' }[e.type] || e.type
      }</td>
    </tr>`).join('');

  const dimensions = [
    { key: 'func',         label: '功能完整性' },
    { key: 'perf',         label: '性能达标' },
    { key: 'security',     label: '安全合规' },
    { key: 'docs',         label: '文档完整性' },
    { key: 'maintainable', label: '可维护性' },
  ];
  const scoreOptions = [60, 70, 80, 90, 100];
  const scoreRows = dimensions.map(d => `
    <tr>
      <td style="font-weight:500">${d.label}</td>
      <td>
        <div style="display:flex;gap:12px;flex-wrap:wrap">
          ${scoreOptions.map(v => `
            <label style="display:inline-flex;align-items:center;gap:3px;cursor:pointer;font-size:12px">
              <input type="radio" name="score-${d.key}" value="${v}" ${v === 90 ? 'checked' : ''}> ${v}
            </label>`).join('')}
        </div>
      </td>
    </tr>`).join('');

  const canSubmit = role === 'info-leader';
  const submitBtn = canSubmit ? `
    <button class="btn btn-primary" onclick="
      const conclusion = document.querySelector('input[name=af-conclusion]:checked');
      if(!conclusion){ toast('请选择验收结论','warning'); return; }
      const comment = document.getElementById('af-comment').value;
      logOperation('验收管理','提交正式验收','${a.id}','${a.projectName}','结论：'+conclusion.value,null);
      toast('正式验收结果已提交','success');
      setTimeout(()=>navigate('acceptance-list'),1500);
    ">提交正式验收结果</button>`
    : '<span style="font-size:12px;color:var(--text-secondary)">仅信息办领导可提交正式验收</span>';

  return `
    ${breadcrumb('验收与运维', '验收管理列表', '正式验收')}
    <div class="page-header">
      <div class="page-title">正式验收 — ${a.projectName}</div>
      <button class="btn" onclick="navigate('acceptance-list')">← 返回列表</button>
    </div>

    <div class="card" style="margin-bottom:12px">
      <div class="card-title">验收专家组（BR-05/BR-29：校外专家不少于 1/3，人数须为奇数）</div>
      <div style="padding:8px 12px;border-radius:4px;font-size:12px;margin-bottom:10px;
        background:${br05Ok ? 'var(--success-bg,#f4f4f5)' : 'var(--danger-bg,#f4f4f5)'};
        border:1px solid ${br05Ok ? 'var(--success-border,#18181b)' : 'var(--danger-border,#18181b)'};
        color:${br05Ok ? 'var(--success)' : 'var(--danger)'}">
        ${br05Ok
          ? '<span class="ci-pass"></span> BR-05/BR-29 通过：共 ' + totalCount + ' 名专家（奇数），校外 ' + externalCount + ' 名（' + Math.round(externalCount/totalCount*100) + '% ≥ 33%）'
          : '<span class="ci-warn"></span> BR-05/BR-29 不满足：请调整专家组成（当前 ' + externalCount + '/' + totalCount + '，' + (!isOdd ? '非奇数' : '校外比例不足') + '）'}
      </div>
      <table class="data-table">
        <thead><tr><th>姓名</th><th>职称</th><th>单位</th><th>来源</th><th>类别</th></tr></thead>
        <tbody>${expertRows}</tbody>
      </table>
    </div>

    <div class="card" style="margin-bottom:12px">
      <div class="card-title">验收评分表（5个维度）</div>
      <table class="data-table">
        <thead><tr><th style="width:130px">评分维度</th><th>分值（60/70/80/90/100）</th></tr></thead>
        <tbody>${scoreRows}</tbody>
      </table>
    </div>

    <div class="card" style="margin-bottom:12px">
      <div class="card-title">验收结论</div>
      <div style="display:flex;gap:24px;flex-wrap:wrap;margin-bottom:14px">
        <label style="display:flex;align-items:center;gap:6px;cursor:pointer">
          <input type="radio" name="af-conclusion" value="验收通过" checked>
          <b style="color:var(--success)">验收通过</b>
        </label>
        <label style="display:flex;align-items:center;gap:6px;cursor:pointer">
          <input type="radio" name="af-conclusion" value="整改后通过">
          <b style="color:var(--warning)">整改后通过</b>
        </label>
        <label style="display:flex;align-items:center;gap:6px;cursor:pointer">
          <input type="radio" name="af-conclusion" value="验收未通过">
          <b style="color:var(--danger)">验收未通过</b>
        </label>
      </div>
      <div class="form-item">
        <label class="form-label">验收意见</label>
        <textarea class="form-control" id="af-comment" rows="3"
          placeholder="请填写综合验收意见...">系统功能完整，性能指标达标，文档齐全，建议通过验收。</textarea>
      </div>
    </div>

    <div class="form-actions">
      <button class="btn" onclick="navigate('acceptance-list')">返回列表</button>
      ${submitBtn}
    </div>`;
});


/* ====== 运维记录 ====== */
registerView('ops-records', function() {
  const role    = getCurrentRole();
  const records = DATA.opsRecords || [];

  const typeMap = {
    inspection: ['巡检',   'tag-blue'],
    backup:     ['数据备份','tag-green'],
    training:   ['用户培训','tag-purple'],
    update:     ['系统更新','tag-orange'],
  };

  const rows = records.map(r => {
    const [typeLabel, typeCls] = typeMap[r.type] || [r.type, 'tag-gray'];
    const shortContent = r.content.length > 40 ? r.content.slice(0, 40) + '...' : r.content;
    const ops = `<button class="btn btn-sm" onclick="toast('${r.content.replace(/'/g,"&#39;")}','info',4000)">查看</button>`;
    return [
      r.projectName,
      '<span class="tag ' + typeCls + '">' + typeLabel + '</span>',
      shortContent,
      r.operator,
      formatDate(r.date),
      r.status === 'normal'
        ? '<span class="tag tag-success">正常</span>'
        : '<span class="tag tag-danger">异常</span>',
      ops
    ];
  });

  const addBtn = role === 'project-manager' || role === 'unit-admin'
    ? '<button class="btn btn-primary" onclick="toast(\'演示模式：新增运维记录\',\'info\')">+ 新增记录</button>'
    : '';

  return `
    ${breadcrumb('验收与运维', '运维记录')}
    <div class="page-header">
      <div class="page-title">运维记录</div>
      ${addBtn}
    </div>
    <div class="card">
      ${renderTable(['项目名称','记录类型','内容摘要','记录人','记录时间','状态','操作'], rows)}
      <div style="padding:8px 4px;font-size:12px;color:var(--text-secondary)">共 ${records.length} 条记录</div>
    </div>`;
});


/* ====== 故障工单 ====== */
registerView('fault-tickets', function() {
  const role    = getCurrentRole();
  const tickets = DATA.faultTickets || [];

  const levelMap  = { major: ['重大', 'tag-danger'], normal: ['一般', 'tag-warning'] };
  const statusMap = { resolved: ['已修复', 'tag-success'], processing: ['处理中', 'tag-blue'] };

  const hasUnresolvedMajor = tickets.some(t => t.level === 'major' && t.status !== 'resolved');

  const rows = tickets.map(t => {
    const [levelLabel, levelCls]   = levelMap[t.level]  || [t.level, 'tag-gray'];
    const [statusLabel, statusCls] = statusMap[t.status] || ['待处理', 'tag-gray'];

    // BR-38: major fault auto-notification mention
    const majorNote = t.level === 'major'
      ? '<br><span style="font-size:11px;color:var(--danger)">BR-38：重大故障已自动通知信息办领导</span>'
      : '';

    const detail = `<button class="btn btn-sm" onclick="toast('【故障描述】${(t.description||'').replace(/'/g,'&#39;')}  【处置方案】${(t.resolution||'处理中').replace(/'/g,'&#39;')}','info',5000)">详情</button>`;
    return [
      t.projectName,
      t.title + majorNote,
      '<span class="tag ' + levelCls + '">' + levelLabel + '</span>',
      t.reporter,
      t.reportTime,
      t.resolveTime || '—',
      '<span class="tag ' + statusCls + '">' + statusLabel + '</span>',
      detail
    ];
  });

  // BR-38 alert banner for unresolved major faults
  const alertBanner = hasUnresolvedMajor ? `
    <div style="background:var(--danger-bg,#f4f4f5);border:1px solid var(--danger-border,#18181b);border-radius:6px;padding:12px 16px;margin-bottom:14px;color:var(--danger);font-size:13px">
      <span class="ci-warn"></span> 存在未处理的<b>重大故障</b>！BR-38：系统已自动向信息办领导和领导小组发送告警通知，请尽快跟进处理！
    </div>` : '';

  const canReport = role === 'project-manager' || role === 'info-admin' || role === 'unit-admin';
  const reportBtn = canReport
    ? `<button class="btn btn-primary" onclick="
        const t = prompt('请输入故障标题（演示）：');
        if(!t) return;
        const isMajor = confirm('是否为重大故障？\\n（重大故障将自动通知信息办领导，BR-38）');
        if(isMajor){
          toast('重大故障已上报，系统已自动通知信息办领导（BR-38）','warning',4000);
          logOperation('故障管理','上报重大故障','FNEW',t,'已触发BR-38自动通知',null);
        } else {
          toast('一般故障工单已提交','success');
          logOperation('故障管理','上报故障工单','FNEW',t,'',null);
        }
      ">+ 上报故障</button>`
    : '';

  return `
    ${breadcrumb('验收与运维', '故障工单')}
    <div class="page-header">
      <div class="page-title">故障工单</div>
      ${reportBtn}
    </div>
    ${alertBanner}
    <div class="card">
      ${renderTable(['项目名称','故障标题','级别','上报人','上报时间','处理时间','状态','操作'], rows)}
      <div style="padding:8px 4px;font-size:12px;color:var(--text-secondary)">共 ${tickets.length} 条记录</div>
    </div>`;
});


/* ====== 系统使用情况 ====== */
registerView('system-usage', function() {
  const su = DATA.systemUsage || {};
  const maxVisits = Math.max(...((su.moduleUsage || []).map(m => m.visits)), 1);

  // 4 KPI cards
  const kpiCards = `
    <div class="stat-row">
      <div class="stat-card">
        <div class="stat-value">${su.totalProjects || 0}</div>
        <div class="stat-label">项目总数</div>
      </div>
      <div class="stat-card success">
        <div class="stat-value">${su.activeProjects || 0}</div>
        <div class="stat-label">进行中项目</div>
      </div>
      <div class="stat-card warning">
        <div class="stat-value">${su.completedProjects || 0}</div>
        <div class="stat-label">已完成项目</div>
      </div>
      <div class="stat-card purple">
        <div class="stat-value">${su.monthlyActiveUsers || 0}<span style="font-size:14px;font-weight:400"> / ${su.totalUsers || 0}</span></div>
        <div class="stat-label">月活跃用户 / 总用户</div>
      </div>
    </div>`;

  // Module usage bar chart
  const moduleChart = (su.moduleUsage || []).map(m => {
    const pct = Math.round(m.visits / maxVisits * 100);
    return `
      <div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid #f5f5f5">
        <div style="width:96px;font-size:13px;flex-shrink:0;color:var(--text-primary)">${m.module}</div>
        <div style="flex:1;height:10px;background:#f0f0f0;border-radius:5px;overflow:hidden">
          <div style="width:${pct}%;height:100%;background:var(--primary);border-radius:5px;transition:width .3s"></div>
        </div>
        <div style="width:54px;text-align:right;font-size:13px;color:var(--text-secondary)">${m.visits} 次</div>
        <div style="width:64px;text-align:right;font-size:12px;color:var(--success)">+${m.lastWeek}/周</div>
      </div>`;
  }).join('');

  // Recent logins
  const loginList = (su.recentLogins || []).map(l => `
    <div style="display:flex;align-items:center;justify-content:space-between;padding:10px 14px;background:#fafafa;border-radius:6px;margin-bottom:8px">
      <div>
        <span style="font-weight:500">${l.user}</span>
        <span class="tag tag-blue" style="margin-left:8px">${l.role}</span>
      </div>
      <div style="font-size:12px;color:var(--text-secondary)">${l.loginAt}</div>
    </div>`).join('');

  return `
    ${breadcrumb('验收与运维', '系统使用情况')}
    <div class="page-header">
      <div class="page-title">系统使用情况</div>
      <span style="font-size:12px;color:var(--text-secondary)">统计数据（演示数据）</span>
    </div>
    ${kpiCards}
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px">
      <div class="card">
        <div class="card-title">模块访问量统计</div>
        ${moduleChart || '<div style="color:var(--text-secondary);text-align:center;padding:20px">暂无数据</div>'}
      </div>
      <div class="card">
        <div class="card-title">最近登录记录</div>
        ${loginList || '<div style="color:var(--text-secondary);text-align:center;padding:20px">暂无记录</div>'}
      </div>
    </div>`;
});
