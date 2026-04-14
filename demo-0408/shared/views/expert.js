// shared/views/expert.js  —  V2.1

/* ====== 专家库 ====== */
registerView('expert-pool', function() {
  const role    = getCurrentRole();
  const canEdit = role === 'info-admin';

  const catLabel    = { tech: '技术', business: '业务', user: '用户' };
  const catTagClass = { tech: 'tag-blue', business: 'tag-green', user: 'tag-purple' };

  const allExperts    = DATA.experts || [];
  const activeExperts = allExperts.filter(e => e.status === 'active');
  const internalCount = activeExperts.filter(e => e.scope === 'internal').length;
  const externalCount = activeExperts.filter(e => e.scope === 'external').length;

  function renderExpertRows(list) {
    if (!list.length) {
      return '<tr><td colspan="8" style="text-align:center;padding:32px;color:var(--text-secondary)">暂无专家数据</td></tr>';
    }
    return list.map(e => {
      const catTag  = '<span class="tag ' + (catTagClass[e.type] || 'tag-gray') + '">' + (catLabel[e.type] || e.type) + '</span>';
      const srcTag  = e.scope === 'external'
        ? '<span class="tag tag-orange">校外</span>'
        : '<span class="tag tag-gray">校内</span>';
      const statusTag = e.status === 'blacklisted'
        ? '<span class="tag tag-red">黑名单</span>'
        : '<span class="tag tag-green">正常</span>';

      let ops = '';
      if (canEdit) {
        ops += `<a onclick="toast('演示：编辑专家 ${e.name}','info')">编辑</a>`;
        if (e.status !== 'blacklisted') {
          ops += ` | <a style="color:var(--danger)" onclick="
            if(confirm('确认将 ${e.name} 加入黑名单？')){
              logOperation('专家管理','加入黑名单','${e.id}','${e.name}','加入黑名单',null);
              toast('${e.name} 已加入黑名单','warning');
            }">加入黑名单</a>`;
        } else {
          ops += ` | <a onclick="
            logOperation('专家管理','移出黑名单','${e.id}','${e.name}','移出黑名单',null);
            toast('${e.name} 已移出黑名单','success');">移出黑名单</a>`;
        }
      } else {
        ops = '—';
      }

      return `<tr>
        <td>${e.name}</td>
        <td>${e.title}</td>
        <td>${e.org}</td>
        <td>${catTag}</td>
        <td>${srcTag}</td>
        <td style="font-size:12px;color:var(--text-secondary)">${e.field || '—'}</td>
        <td>${statusTag}</td>
        <td>${ops}</td>
      </tr>`;
    }).join('');
  }

  return `
    <div class="breadcrumb">首页 / 专家管理 / <span>专家库</span></div>
    <div class="page-header">
      <div class="page-title">专家库</div>
      <div style="display:flex;gap:8px">
        <button class="btn" onclick="navigate('expert-blacklist')">黑名单管理</button>
        <button class="btn" onclick="navigate('expert-invitations')">邀请记录</button>
        ${canEdit ? '<button class="btn btn-primary" onclick="toast(\'演示：新增专家表单\',\'info\')">+ 新增专家</button>' : ''}
      </div>
    </div>

    <div class="notice-item warning" style="margin-bottom:12px">
      专家库共 <b>${activeExperts.length}</b> 名有效专家，校内 <b>${internalCount}</b> 名，校外 <b>${externalCount}</b> 名
      &nbsp;|&nbsp; BR-05：评审专家组中校外专家须不少于 1/3
    </div>

    <div class="card">
      <div style="display:flex;gap:8px;margin-bottom:14px;flex-wrap:wrap;align-items:center">
        <input id="ep-search" class="form-control" placeholder="搜索专家姓名/单位..." style="width:200px">
        <select id="ep-cat" class="form-control" style="width:110px">
          <option value="">全部类别</option>
          <option value="tech">技术</option>
          <option value="business">业务</option>
          <option value="user">用户</option>
        </select>
        <select id="ep-scope" class="form-control" style="width:110px">
          <option value="">校内/校外</option>
          <option value="internal">校内</option>
          <option value="external">校外</option>
        </select>
        <button class="btn btn-primary btn-sm" onclick="
          const kw    = document.getElementById('ep-search').value.trim().toLowerCase();
          const cat   = document.getElementById('ep-cat').value;
          const scope = document.getElementById('ep-scope').value;
          const filtered = (DATA.experts || []).filter(function(e){
            const matchKw    = !kw    || e.name.toLowerCase().indexOf(kw) !== -1 || e.org.toLowerCase().indexOf(kw) !== -1;
            const matchCat   = !cat   || e.type === cat;
            const matchScope = !scope || e.scope === scope;
            return matchKw && matchCat && matchScope;
          });
          const tbody = document.getElementById('ep-tbody');
          if(tbody){
            const tmp = filtered.map(function(e){
              const catLabel2 = {tech:'技术',business:'业务',user:'用户'};
              const catCls    = {tech:'tag-blue',business:'tag-green',user:'tag-purple'};
              const srcTag    = e.scope==='external' ? '<span class=\\'tag tag-orange\\'>校外</span>' : '<span class=\\'tag tag-gray\\'>校内</span>';
              const statusTag = e.status==='blacklisted' ? '<span class=\\'tag tag-red\\'>黑名单</span>' : '<span class=\\'tag tag-green\\'>正常</span>';
              return '<tr><td>'+e.name+'</td><td>'+e.title+'</td><td>'+e.org+'</td>'
                +'<td><span class=\\'tag '+(catCls[e.type]||'tag-gray')+'\\'>'+catLabel2[e.type]+'</span></td>'
                +'<td>'+srcTag+'</td><td style=\\'font-size:12px;color:var(--text-secondary)\\'>'+e.field+'</td>'
                +'<td>'+statusTag+'</td><td>—</td></tr>';
            }).join('');
            tbody.innerHTML = tmp || '<tr><td colspan=\\'8\\' style=\\'text-align:center;padding:20px;color:var(--text-secondary)\\'>暂无符合条件的专家</td></tr>';
          }
        ">查询</button>
        <button class="btn btn-sm" onclick="
          document.getElementById('ep-search').value='';
          document.getElementById('ep-cat').value='';
          document.getElementById('ep-scope').value='';
        ">重置</button>
      </div>

      <table class="data-table">
        <thead><tr>
          <th>姓名</th><th>职称</th><th>所在单位</th><th>类别</th><th>来源</th><th>研究领域</th><th>状态</th><th>操作</th>
        </tr></thead>
        <tbody id="ep-tbody">${renderExpertRows(allExperts)}</tbody>
      </table>
      <div class="table-pagination"><span>共 ${allExperts.length} 名专家（含黑名单 ${allExperts.length - activeExperts.length} 名）</span></div>
    </div>`;
});


/* ====== 专家黑名单 ====== */
registerView('expert-blacklist', function() {
  const role      = getCurrentRole();
  const canEdit   = role === 'info-admin';
  const blacklisted = (DATA.experts || []).filter(e => e.status === 'blacklisted');

  const rows = blacklisted.length ? blacklisted.map(e => `
    <tr>
      <td>${e.name}</td>
      <td>${e.title}</td>
      <td>${e.org}</td>
      <td>${e.blackReason || '—'}</td>
      <td>${e.blackDate || '—'}</td>
      <td>
        ${canEdit
          ? `<a onclick="
              logOperation('专家管理','移出黑名单','${e.id}','${e.name}','移出黑名单',null);
              toast('${e.name} 已移出黑名单','success');">移出黑名单</a>`
          : '—'}
      </td>
    </tr>`).join('')
    : '<tr><td colspan="6" style="text-align:center;padding:32px;color:var(--text-secondary)">当前无黑名单专家</td></tr>';

  return `
    <div class="breadcrumb">首页 / 专家管理 / <a onclick="navigate('expert-pool')">专家库</a> / <span>黑名单管理</span></div>
    <div class="page-header">
      <div class="page-title">专家黑名单</div>
      <button class="btn" onclick="navigate('expert-pool')">← 返回专家库</button>
    </div>
    <div class="alert alert-danger" style="margin-bottom:12px">
      <span class="ci-warn"></span> 黑名单内专家将在发起评审时自动排除，系统不允许邀请黑名单专家参与论证或验收（BR-05）。
    </div>
    <div class="card">
      <table class="data-table">
        <thead><tr>
          <th>专家姓名</th><th>职称</th><th>所在单位</th><th>加入原因</th><th>加入时间</th><th>操作</th>
        </tr></thead>
        <tbody>${rows}</tbody>
      </table>
      <div class="table-pagination"><span>共 ${blacklisted.length} 名黑名单专家</span></div>
    </div>`;
});


/* ====== Issue E (2.5a): 专家响应邀请 ====== */
registerView('expert-respond', function() {
  const role = getCurrentRole();
  const invites = DATA.expertInvites || [];
  // 找到当前专家待回复的邀请
  const pending = [];
  invites.forEach(inv => {
    inv.invites.forEach(e => {
      if (e.status === '待回复') {
        pending.push({ ...e, reviewName: inv.reviewName, reviewType: inv.reviewType, scheduledAt: inv.scheduledAt, invRecord: inv });
      }
    });
  });

  if (!pending.length) {
    return `
      <div class="breadcrumb">首页 / 评审管理 / <span>评审邀请响应</span></div>
      <div class="page-header"><div class="page-title">评审邀请响应</div></div>
      <div class="card" style="text-align:center;color:var(--text-secondary);padding:40px">暂无待回复的评审邀请</div>`;
  }

  const inviteCards = pending.map((p, idx) => `
    <div class="card" style="margin-bottom:14px">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">
        <div>
          <span style="font-weight:600;font-size:15px">${p.reviewName}</span>
          <span class="tag tag-purple" style="margin-left:8px">${p.reviewType}</span>
          <span class="tag tag-orange" style="margin-left:4px">待回复</span>
        </div>
        <span style="color:var(--text-secondary);font-size:12px">评审日期：${p.scheduledAt}</span>
      </div>
      <div style="font-size:13px;color:var(--text-secondary);margin-bottom:12px">
        诚邀您参加本项目立项论证评审。请在 <b>3 天</b>内确认参加或拒绝（超时 5 天未回复视为拒绝）。
      </div>
      <div style="display:flex;gap:10px;align-items:center">
        <button class="btn btn-primary" onclick="
          logOperation('评审管理','接受评审邀请','${p.invRecord.id}','${p.reviewName}','专家 ${p.name} 接受邀请',null);
          toast('已确认参加评审','success');
          setTimeout(()=>renderView('expert-respond'),1000);
        ">&#10003; 接受邀请</button>
        <button class="btn btn-warning" onclick="
          const reason = prompt('请填写拒绝原因：');
          if(!reason){toast('请填写拒绝原因','warning');return;}
          logOperation('评审管理','拒绝评审邀请','${p.invRecord.id}','${p.reviewName}','专家 ${p.name} 拒绝：'+reason,null);
          toast('已拒绝邀请，信息办管理员将补选专家','info');
          setTimeout(()=>renderView('expert-respond'),1000);
        ">拒绝邀请</button>
      </div>
      <div style="margin-top:8px;font-size:11px;color:var(--text-secondary)">
        <span style="color:var(--warning)">●</span> 提醒：拒绝后信息办管理员将补选专家；超时 3 天系统自动发送提醒，5 天视为拒绝。
      </div>
    </div>`).join('');

  // 已确认的邀请
  const confirmed = [];
  invites.forEach(inv => {
    inv.invites.forEach(e => {
      if (e.status === '已确认') {
        confirmed.push({ ...e, reviewName: inv.reviewName, scheduledAt: inv.scheduledAt });
      }
    });
  });
  const confirmedHtml = confirmed.length ? `
    <div class="card" style="margin-top:16px">
      <div class="card-title">已确认的评审</div>
      ${confirmed.map(c => `
        <div style="padding:8px 0;border-bottom:1px solid #f4f4f5;display:flex;justify-content:space-between;align-items:center">
          <span style="font-size:13px">${c.reviewName} <span class="tag tag-green">已确认</span></span>
          <span style="font-size:12px;color:var(--text-secondary)">评审日期：${c.scheduledAt}</span>
        </div>`).join('')}
    </div>` : '';

  return `
    <div class="breadcrumb">首页 / 评审管理 / <span>评审邀请响应</span></div>
    <div class="page-header"><div class="page-title">评审邀请响应</div></div>
    <div class="notice-item info" style="margin-bottom:16px">
      <strong>步骤 2.5a</strong> — 收到评审邀请后，请在规定时间内确认是否参加。拒绝需填写原因，系统将通知信息办管理员补选专家。
    </div>
    ${inviteCards}
    ${confirmedHtml}`;
});


/* ====== 专家邀请记录 ====== */
registerView('expert-invitations', function() {
  var invites = DATA.expertInvites || [];

  if (!invites.length) {
    return '<div class="breadcrumb">首页 / 专家管理 / <span>专家邀请记录</span></div>'
      + '<div class="page-header"><div class="page-title">专家邀请记录</div></div>'
      + '<div class="empty-state"><p>暂无邀请记录</p></div>';
  }

  var rows = invites.map(function(inv, idx) {
    var confirmed   = inv.invites.filter(function(e) { return e.status === '已确认'; });
    var externalCfm = confirmed.filter(function(e) { return e.isExternal; });
    var total       = confirmed.length;
    var isOdd       = total % 2 !== 0;
    var ratioOk     = total >= 3 && externalCfm.length / total >= 1/3;
    var oddOk       = total === 0 || isOdd;
    var ratio       = total ? (externalCfm.length / total * 100).toFixed(0) : 0;

    var br05Html = (ratioOk && oddOk)
      ? '<span class="tag tag-green">通过</span>'
      : '<span class="tag tag-red">不满足</span>';

    return '<tr>'
      + '<td>' + inv.reviewName + '</td>'
      + '<td><span class="tag tag-blue">' + inv.reviewType + '</span></td>'
      + '<td>' + inv.launchedAt + '</td>'
      + '<td>' + inv.scheduledAt + '</td>'
      + '<td>' + inv.invites.length + '</td>'
      + '<td>' + total + '</td>'
      + '<td>' + externalCfm.length + '（' + ratio + '%）</td>'
      + '<td>' + br05Html + '</td>'
      + '<td><a onclick="showInviteDetail(' + idx + ')">邀请详情</a></td>'
      + '</tr>';
  }).join('');

  return '<div class="breadcrumb">首页 / 专家管理 / <span>专家邀请记录</span></div>'
    + '<div class="page-header">'
    + '  <div class="page-title">专家邀请记录</div>'
    + '  <button class="btn" onclick="navigate(\'expert-pool\')">← 专家库</button>'
    + '</div>'
    + '<div class="card">'
    + '  <div class="filter-bar" style="display:flex;gap:8px;margin-bottom:12px;flex-wrap:wrap">'
    + '    <input class="form-control" id="ei-kw" placeholder="搜索项目名称..." style="width:180px">'
    + '    <select class="form-control" id="ei-br05" style="width:130px">'
    + '      <option value="">全部BR-05状态</option>'
    + '      <option value="通过">通过</option>'
    + '      <option value="不满足">不满足</option>'
    + '    </select>'
    + '    <button class="btn btn-primary" onclick="filterInvitations()">查询</button>'
    + '    <button class="btn" onclick="resetInvitationFilter()">重置</button>'
    + '  </div>'
    + '  <table class="data-table" id="ei-table">'
    + '    <thead><tr>'
    + '      <th>项目名称</th><th>评审类型</th><th>发起时间</th><th>评审日期</th>'
    + '      <th>已邀请</th><th>已确认</th><th>校外已确认</th><th>BR-05</th><th>操作</th>'
    + '    </tr></thead>'
    + '    <tbody>' + rows + '</tbody>'
    + '  </table>'
    + '</div>';
});

window.filterInvitations = function() {
  var kw = (document.getElementById('ei-kw').value || '').toLowerCase();
  var br05 = document.getElementById('ei-br05').value;
  var tbody = document.querySelector('#ei-table tbody');
  if (!tbody) return;
  var trs = tbody.querySelectorAll('tr');
  trs.forEach(function(tr) {
    var name = (tr.cells[0] && tr.cells[0].textContent || '').toLowerCase();
    var status = (tr.cells[7] && tr.cells[7].textContent.trim()) || '';
    var matchKw = !kw || name.includes(kw);
    var matchBr = !br05 || status === br05;
    tr.style.display = (matchKw && matchBr) ? '' : 'none';
  });
};
window.resetInvitationFilter = function() {
  var kwEl = document.getElementById('ei-kw');
  var brEl = document.getElementById('ei-br05');
  if (kwEl) kwEl.value = '';
  if (brEl) brEl.value = '';
  window.filterInvitations();
};

window.showInviteDetail = function(idx) {
  var invites = DATA.expertInvites || [];
  var inv = invites[idx];
  if (!inv) return;

  var confirmed   = inv.invites.filter(function(e) { return e.status === '已确认'; });
  var externalCfm = confirmed.filter(function(e) { return e.isExternal; });
  var total       = confirmed.length;
  var isOdd       = total % 2 !== 0;
  var ratioOk     = total >= 3 && externalCfm.length / total >= 1/3;
  var oddOk       = total === 0 || isOdd;
  var ratio       = total ? (externalCfm.length / total * 100).toFixed(0) : 0;

  var br05Status = (ratioOk && oddOk)
    ? '<span style="color:var(--success)">&#10003; BR-05 通过：' + total + '人（奇数），校外 ' + externalCfm.length + ' 名（' + ratio + '%）</span>'
    : '<span style="color:var(--danger)">&#10007; BR-05 不满足：' + (!oddOk ? '专家人数须为奇数' : '校外比例不足1/3') + '（当前 ' + externalCfm.length + '/' + total + '）</span>';

  var expertRows = inv.invites.map(function(e) {
    var srcTag = e.isExternal
      ? '<span class="tag tag-orange">校外</span>'
      : '<span class="tag tag-gray">校内</span>';
    var statusTag = e.status === '已确认'
      ? '<span class="tag tag-green">已确认</span>'
      : e.status === '待回复'
        ? '<span class="tag tag-orange">待回复</span>'
        : '<span class="tag tag-red">已拒绝</span>';
    var ops = e.status === '已拒绝'
      ? '<a onclick="toast(\'演示：可重新选择替补专家\',\'info\')">重新邀请</a>'
      : '—';
    return '<tr><td>' + e.name + '</td><td>' + srcTag + '</td><td>' + statusTag + '</td><td>' + ops + '</td></tr>';
  }).join('');

  var body = '<div style="margin-bottom:12px;font-size:13px">'
    + '<span style="margin-right:16px">已邀请 <b>' + inv.invites.length + '</b> 人</span>'
    + '<span style="margin-right:16px">已确认 <b>' + total + '</b> 人</span>'
    + '<span style="margin-right:16px">校外已确认 <b>' + externalCfm.length + '</b> 人（' + ratio + '%）</span>'
    + br05Status
    + '</div>'
    + '<table class="data-table">'
    + '<thead><tr><th>姓名</th><th>来源</th><th>邀请状态</th><th>操作</th></tr></thead>'
    + '<tbody>' + expertRows + '</tbody>'
    + '</table>';

  showModal(inv.reviewName + ' — 邀请详情', body);
};
