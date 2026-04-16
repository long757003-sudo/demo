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
        <td style="font-size:12px;color:var(--text-secondary)" title="${e.field || ''}">${(e.tags && e.tags.length) ? e.tags.map(t => '<span class="tag tag-gray" style="font-size:10px;padding:1px 5px;margin:1px">' + t + '</span>').join(' ') : (e.field || '—')}</td>
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
          <th>姓名</th><th>职称</th><th>所在单位</th><th>类别</th><th>来源</th><th>专家标签</th><th>状态</th><th>操作</th>
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
  const invites = DATA.expertInvites || [];

  /* ── 分类：待回复 / 超时自动拒绝 / 已确认 ── */
  const pending = [];
  const overdue = [];
  const confirmed = [];
  var now = new Date();
  invites.forEach(inv => {
    inv.invites.forEach(e => {
      const item = { ...e, inv: inv };
      if (e.status === '待回复') {
        /* 超时判定：截止时间已过 → 自动视为拒绝 */
        var dl = inv.deadlineAt ? new Date(inv.deadlineAt.replace(' ', 'T')) : null;
        if (dl && dl < now) {
          overdue.push(item);
        } else {
          pending.push(item);
        }
      } else if (e.status === '已确认') {
        confirmed.push(item);
      }
    });
  });

  /* ── 辅助：截止倒计时 ── */
  function _deadlineChip(deadlineStr) {
    if (!deadlineStr) return '';
    var dl = new Date(deadlineStr.replace(' ', 'T'));
    var now = new Date();
    var diff = dl - now;
    var overdue = diff <= 0;
    var absDiff = Math.abs(diff);
    var days = Math.floor(absDiff / 86400000);
    var hours = Math.floor((absDiff % 86400000) / 3600000);
    var text = overdue
      ? '已超时'
      : '剩余 ' + days + ' 天 ' + hours + ' 小时';
    var ddStr = deadlineStr.slice(5, 10).replace('-', '-') + ' ' + deadlineStr.slice(11, 16);
    var chipBg = overdue ? '#FEE2E2' : '#FAEEDA';
    var chipColor = overdue ? '#DC2626' : '#854F0B';
    return '<span style="display:inline-flex;align-items:center;gap:5px;font-size:12px;color:' + chipColor + ';background:' + chipBg + ';padding:4px 10px;border-radius:4px">' +
      '<i data-lucide="clock" style="width:12px;height:12px"></i>' +
      text + ' · 截止 ' + ddStr +
    '</span>';
  }

  /* ── 辅助：专家统计 ── */
  function _expertStats(inv) {
    var total = inv.invites.length;
    var done = inv.invites.filter(function(e) { return e.status === '已确认'; }).length;
    return '共邀请 ' + total + ' 位，已确认 ' + done + ' 位';
  }

  /* ── 辅助：类型 badge 颜色 ── */
  function _typeBadge(type) {
    return '<span style="display:inline-flex;align-items:center;font-size:11px;padding:2px 8px;border-radius:4px;font-weight:500;background:#E6F1FB;color:#185FA5">' + type + '</span>';
  }

  /* ── 待回复卡片 ── */
  var inviteCards = pending.map(function(p) {
    var inv = p.inv;
    return '' +
    '<div class="card" style="margin-bottom:16px;overflow:hidden;border-top:3px solid var(--primary)">' +

      /* ── 卡片头部：标题 + 截止时间 ── */
      '<div style="padding:16px 20px;border-bottom:1px solid #f4f4f5;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px">' +
        '<div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">' +
          '<span style="font-size:15px;font-weight:600;color:var(--text-primary)">' + inv.reviewName + '</span>' +
          _typeBadge(inv.reviewType) +
          '<span style="display:inline-flex;align-items:center;font-size:11px;padding:2px 8px;border-radius:4px;font-weight:500;background:#FAEEDA;color:#854F0B">待回复</span>' +
        '</div>' +
        _deadlineChip(inv.deadlineAt) +
      '</div>' +

      /* ── 卡片主体：左右两栏 ── */
      '<div style="padding:20px;display:grid;grid-template-columns:1fr 1fr;gap:0">' +

        /* 左栏：项目基本信息 */
        '<div style="padding-right:20px">' +
          '<div style="font-size:11px;color:var(--text-secondary);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:10px">项目基本信息</div>' +
          '<div style="display:flex;gap:8px;margin-bottom:8px;align-items:flex-start"><span style="font-size:12px;color:var(--text-secondary);flex-shrink:0;width:68px">申报单位</span><span style="font-size:13px;color:var(--text-primary);line-height:1.5">' + (inv.projectUnit || '—') + '</span></div>' +
          '<div style="display:flex;gap:8px;margin-bottom:8px;align-items:flex-start"><span style="font-size:12px;color:var(--text-secondary);flex-shrink:0;width:68px">项目类型</span><span style="font-size:13px;color:var(--text-primary);line-height:1.5">' + (inv.projectType || '—') + '</span></div>' +
          '<div style="display:flex;gap:8px;margin-bottom:8px;align-items:flex-start"><span style="font-size:12px;color:var(--text-secondary);flex-shrink:0;width:68px">预算金额</span><span style="font-size:13px;color:#185FA5;font-weight:500;line-height:1.5">' + (inv.budget ? inv.budget + ' 万元' : '—') + '</span></div>' +
          '<div style="display:flex;gap:8px;margin-bottom:8px;align-items:flex-start"><span style="font-size:12px;color:var(--text-secondary);flex-shrink:0;width:68px">项目简介</span><span style="font-size:13px;color:var(--text-primary);line-height:1.5">' + (inv.projectDesc || '—') + '</span></div>' +
          '<div style="display:flex;gap:8px;margin-bottom:8px;align-items:flex-start"><span style="font-size:12px;color:var(--text-secondary);flex-shrink:0;width:68px">立项材料</span><span style="font-size:13px;color:var(--primary);cursor:pointer;text-decoration:underline">查看可行性研究报告 →</span></div>' +
        '</div>' +

        /* 右栏：评审安排 */
        '<div style="padding-left:20px;border-left:1px solid #f4f4f5">' +
          '<div style="font-size:11px;color:var(--text-secondary);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:10px">评审安排</div>' +
          '<div style="display:flex;gap:8px;margin-bottom:8px;align-items:flex-start"><span style="font-size:12px;color:var(--text-secondary);flex-shrink:0;width:68px">评审日期</span><span style="font-size:13px;color:#185FA5;font-weight:500;line-height:1.5">' + inv.scheduledAt + '</span></div>' +
          '<div style="display:flex;gap:8px;margin-bottom:8px;align-items:flex-start"><span style="font-size:12px;color:var(--text-secondary);flex-shrink:0;width:68px">评审时间</span><span style="font-size:13px;color:var(--text-primary);line-height:1.5">' + (inv.scheduledTime || '—') + '</span></div>' +
          '<div style="display:flex;gap:8px;margin-bottom:8px;align-items:flex-start"><span style="font-size:12px;color:var(--text-secondary);flex-shrink:0;width:68px">评审地点</span><span style="font-size:13px;color:var(--text-primary);line-height:1.5">' + (inv.location || '—') + '</span></div>' +
          '<div style="display:flex;gap:8px;margin-bottom:8px;align-items:flex-start"><span style="font-size:12px;color:var(--text-secondary);flex-shrink:0;width:68px">评审形式</span><span style="font-size:13px;color:var(--text-primary);line-height:1.5">' + (inv.reviewFormat || '—') + '</span></div>' +
          '<div style="display:flex;gap:8px;margin-bottom:8px;align-items:flex-start"><span style="font-size:12px;color:var(--text-secondary);flex-shrink:0;width:68px">组织方</span><span style="font-size:13px;color:var(--text-primary);line-height:1.5">' + (inv.organizer || '—') + '</span></div>' +
          '<div style="display:flex;gap:8px;margin-bottom:8px;align-items:flex-start"><span style="font-size:12px;color:var(--text-secondary);flex-shrink:0;width:68px">本次专家</span><span style="font-size:13px;color:var(--text-primary);line-height:1.5">' + _expertStats(inv) + '</span></div>' +
        '</div>' +
      '</div>' +

      /* ── 分隔线 ── */
      '<div style="height:1px;background:#f4f4f5;margin:0 20px"></div>' +

      /* ── 利益冲突声明 ── */
      '<div style="margin:16px 20px 0;padding:14px 16px;background:var(--bg-secondary, #f9fafb);border-radius:8px;border:1px solid #f4f4f5">' +
        '<div style="font-size:12px;font-weight:500;color:var(--text-primary);margin-bottom:8px;display:flex;align-items:center;gap:6px">' +
          '<i data-lucide="alert-triangle" style="width:14px;height:14px;color:#854F0B"></i>' +
          '利益冲突声明（必填）— 您与该项目申报单位是否存在利益关联？' +
        '</div>' +
        '<div style="display:flex;gap:16px">' +
          '<label style="display:flex;align-items:center;gap:6px;font-size:13px;color:var(--text-secondary);cursor:pointer"><input type="radio" name="conflict-' + inv.id + '" value="no" style="accent-color:#378ADD"> 无利益冲突，可正常参与评审</label>' +
          '<label style="display:flex;align-items:center;gap:6px;font-size:13px;color:var(--text-secondary);cursor:pointer"><input type="radio" name="conflict-' + inv.id + '" value="yes"> 存在利益冲突，需回避</label>' +
        '</div>' +
      '</div>' +

      /* ── 分隔线 ── */
      '<div style="height:1px;background:#f4f4f5;margin:16px 20px"></div>' +

      /* ── 操作区 ── */
      '<div style="padding:16px 20px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px">' +
        '<div style="font-size:12px;color:var(--text-secondary);display:flex;align-items:flex-start;gap:6px;line-height:1.5">' +
          '<i data-lucide="info" style="width:13px;height:13px;flex-shrink:0;margin-top:1px;color:#854F0B"></i>' +
          '拒绝后需填写原因，系统将通知信息办补选专家；超时 3 天自动提醒，5 天视为拒绝' +
        '</div>' +
        '<div style="display:flex;gap:10px;align-items:center">' +
          '<button class="btn" onclick="' +
            "var reason = prompt('请填写拒绝原因：');" +
            "if(!reason){toast('请填写拒绝原因','warning');return;}" +
            "logOperation('评审管理','拒绝评审邀请','" + inv.id + "','" + inv.reviewName + "','专家 " + p.name + " 拒绝：'+reason,null);" +
            "toast('已拒绝邀请，信息办管理员将补选专家','info');" +
            "setTimeout(function(){renderView('expert-respond')},1000);" +
          '">拒绝邀请</button>' +
          '<button class="btn btn-primary" onclick="' +
            "logOperation('评审管理','接受评审邀请','" + inv.id + "','" + inv.reviewName + "','专家 " + p.name + " 接受邀请',null);" +
            "toast('已确认参加评审','success');" +
            "setTimeout(function(){renderView('expert-respond')},1000);" +
          '"><i data-lucide="check" style="width:14px;height:14px"></i> 接受邀请</button>' +
        '</div>' +
      '</div>' +
    '</div>';
  }).join('');

  /* ── 超时自动拒绝卡片 ── */
  var overdueCards = overdue.map(function(p) {
    var inv = p.inv;
    return '' +
    '<div class="card" style="margin-bottom:16px;overflow:hidden;border-top:3px solid #DC2626;opacity:0.85">' +

      /* ── 卡片头部 ── */
      '<div style="padding:16px 20px;border-bottom:1px solid #f4f4f5;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px">' +
        '<div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">' +
          '<span style="font-size:15px;font-weight:600;color:var(--text-primary)">' + inv.reviewName + '</span>' +
          _typeBadge(inv.reviewType) +
          '<span style="display:inline-flex;align-items:center;font-size:11px;padding:2px 8px;border-radius:4px;font-weight:500;background:#FEE2E2;color:#DC2626">超时未响应（自动拒绝）</span>' +
        '</div>' +
        _deadlineChip(inv.deadlineAt) +
      '</div>' +

      /* ── 卡片主体：左右两栏 ── */
      '<div style="padding:20px;display:grid;grid-template-columns:1fr 1fr;gap:0">' +

        /* 左栏：项目基本信息 */
        '<div style="padding-right:20px">' +
          '<div style="font-size:11px;color:var(--text-secondary);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:10px">项目基本信息</div>' +
          '<div style="display:flex;gap:8px;margin-bottom:8px;align-items:flex-start"><span style="font-size:12px;color:var(--text-secondary);flex-shrink:0;width:68px">申报单位</span><span style="font-size:13px;color:var(--text-primary);line-height:1.5">' + (inv.projectUnit || '—') + '</span></div>' +
          '<div style="display:flex;gap:8px;margin-bottom:8px;align-items:flex-start"><span style="font-size:12px;color:var(--text-secondary);flex-shrink:0;width:68px">项目类型</span><span style="font-size:13px;color:var(--text-primary);line-height:1.5">' + (inv.projectType || '—') + '</span></div>' +
          '<div style="display:flex;gap:8px;margin-bottom:8px;align-items:flex-start"><span style="font-size:12px;color:var(--text-secondary);flex-shrink:0;width:68px">预算金额</span><span style="font-size:13px;color:#185FA5;font-weight:500;line-height:1.5">' + (inv.budget ? inv.budget + ' 万元' : '—') + '</span></div>' +
          '<div style="display:flex;gap:8px;margin-bottom:8px;align-items:flex-start"><span style="font-size:12px;color:var(--text-secondary);flex-shrink:0;width:68px">项目简介</span><span style="font-size:13px;color:var(--text-primary);line-height:1.5">' + (inv.projectDesc || '—') + '</span></div>' +
        '</div>' +

        /* 右栏：评审安排 */
        '<div style="padding-left:20px;border-left:1px solid #f4f4f5">' +
          '<div style="font-size:11px;color:var(--text-secondary);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:10px">评审安排</div>' +
          '<div style="display:flex;gap:8px;margin-bottom:8px;align-items:flex-start"><span style="font-size:12px;color:var(--text-secondary);flex-shrink:0;width:68px">评审日期</span><span style="font-size:13px;color:#185FA5;font-weight:500;line-height:1.5">' + inv.scheduledAt + '</span></div>' +
          '<div style="display:flex;gap:8px;margin-bottom:8px;align-items:flex-start"><span style="font-size:12px;color:var(--text-secondary);flex-shrink:0;width:68px">评审时间</span><span style="font-size:13px;color:var(--text-primary);line-height:1.5">' + (inv.scheduledTime || '—') + '</span></div>' +
          '<div style="display:flex;gap:8px;margin-bottom:8px;align-items:flex-start"><span style="font-size:12px;color:var(--text-secondary);flex-shrink:0;width:68px">评审地点</span><span style="font-size:13px;color:var(--text-primary);line-height:1.5">' + (inv.location || '—') + '</span></div>' +
          '<div style="display:flex;gap:8px;margin-bottom:8px;align-items:flex-start"><span style="font-size:12px;color:var(--text-secondary);flex-shrink:0;width:68px">组织方</span><span style="font-size:13px;color:var(--text-primary);line-height:1.5">' + (inv.organizer || '—') + '</span></div>' +
        '</div>' +
      '</div>' +

      /* ── 底部提示：拒绝原因 ── */
      '<div style="height:1px;background:#f4f4f5;margin:0 20px"></div>' +
      '<div style="padding:14px 20px;display:flex;align-items:center;gap:8px">' +
        '<i data-lucide="x-circle" style="width:14px;height:14px;color:#DC2626;flex-shrink:0"></i>' +
        '<span style="font-size:13px;color:#DC2626;font-weight:500">拒绝原因：超时未响应</span>' +
        '<span style="font-size:12px;color:var(--text-secondary);margin-left:8px">— 系统已自动通知信息办管理员补选专家</span>' +
      '</div>' +
    '</div>';
  }).join('');

  /* ── 已确认列表 ── */
  var confirmedHtml = '';
  if (confirmed.length) {
    var cItems = confirmed.map(function(c) {
      var inv = c.inv;
      return '' +
        '<div style="padding:12px 20px;border-bottom:1px solid #f4f4f5;display:flex;align-items:center;justify-content:space-between">' +
          '<div>' +
            '<div style="font-size:13px;color:var(--text-primary)">' + inv.reviewName + '</div>' +
            '<div style="font-size:12px;color:var(--text-secondary);margin-top:3px">' + (inv.projectUnit || '') + ' · ' + (inv.location || '') + ' · ' + inv.scheduledAt + ' ' + (inv.scheduledTime ? inv.scheduledTime.split('—')[0].trim() : '') + '</div>' +
          '</div>' +
          '<div style="display:flex;align-items:center;gap:12px">' +
            '<span class="tag tag-green">已确认</span>' +
            '<span style="font-size:12px;color:var(--text-secondary)">' + (c.respondAt ? '回复于 ' + c.respondAt.slice(5) : '') + '</span>' +
          '</div>' +
        '</div>';
    }).join('');
    confirmedHtml = '' +
      '<div class="card" style="overflow:hidden">' +
        '<div style="padding:14px 20px;border-bottom:1px solid #f4f4f5;font-size:13px;font-weight:500;color:var(--text-secondary)">已确认的评审（' + confirmed.length + ' 项）</div>' +
        cItems +
      '</div>';
  }

  /* ── 空状态 ── */
  if (!pending.length && !overdue.length && !confirmed.length) {
    return breadcrumb('评审管理', '评审邀请响应') +
      '<div class="page-header"><div class="page-title">评审邀请响应</div></div>' +
      '<div class="card" style="text-align:center;color:var(--text-secondary);padding:40px">暂无评审邀请</div>';
  }

  return '' +
    breadcrumb('评审管理', '评审邀请响应') +
    '<div class="page-header">' +
      '<div>' +
        '<div class="page-title">评审邀请响应</div>' +
        '<div style="font-size:13px;color:var(--text-secondary);margin-top:4px">请在截止时间前确认是否参加评审，系统将自动通知组织方</div>' +
      '</div>' +
    '</div>' +
    '<div class="notice-item info" style="margin-bottom:16px">' +
      '<strong>步骤 2.5a</strong> — 收到评审邀请后，请在规定时间内确认是否参加。拒绝需填写原因，系统将通知信息办管理员补选专家。' +
    '</div>' +
    inviteCards +
    overdueCards +
    confirmedHtml;
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
