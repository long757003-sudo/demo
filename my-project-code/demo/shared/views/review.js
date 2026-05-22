// shared/views/review.js  —  V2.1

/* ====== 评审列表（专家/管理员统一视图，角色控制数据过滤与操作列） ====== */
registerView('review-list', function() {
  const role       = getCurrentRole();
  const isExpert   = role === 'expert';
  const isAdmin    = role === 'info-admin';
  const isLeader   = role === 'info-leader';
  const isOffice   = role === 'leadership-office';
  const canLaunch  = isAdmin || isLeader;
  const pageTitle  = '评审列表';

  const reviews    = DATA.reviews || [];
  const roleReviews = reviews;

  const currentTab = window._reviewTab || 0;  // 0 = 论证评审, 1 = 验收评审
  const approvalList   = roleReviews.filter(r => r.type === 'approval');
  const acceptanceList = roleReviews.filter(r => r.type === 'acceptance');
  const displayList    = currentTab === 0 ? approvalList : acceptanceList;

  function statusTag(r) {
    if (r.status === 'in-progress')    return '<span class="tag tag-blue">进行中</span>';
    if (r.status === 'passed')         return '<span class="tag tag-green">已通过</span>';
    if (r.status === 'rejected')       return '<span class="tag tag-red">未通过</span>';
    if (r.status === 'rework-pending') return '<span class="tag tag-orange">退回修改中</span>';
    if (r.status === 'invitation-pending') return '<span class="tag tag-orange">邀请中</span>';
    if (r.status === 'not-started')    return '<span class="tag tag-gray">未开始</span>';
    if (r.status === 'timeout-rejected') return '<span class="tag tag-red">不通过（超时未修改）</span>';
    return '<span class="tag tag-gray">' + r.status + '</span>';
  }

  // 操作按钮：按角色与状态分发
  function actionCell(r) {
    if (isExpert) {
      if (r.status === 'invitation-pending') {
        return '<a onclick="navigate(\'expert-respond\')">确认邀请</a>';
      }
      if (r.status === 'not-started') {
        return '<span style="color:var(--text-secondary)">—</span>';
      }
      if (r.status === 'in-progress') {
        return '<a onclick="window.open(\'requirement-review.html?role=expert&id=' + r.id + '\',\'_blank\')">进入评审工作台</a>';
      }
      if (r.status === 'rework-pending') {
        return '<a onclick="navigate(\'review-rework\',{id:\'' + r.id + '\'})">查看修改要求</a>';
      }
      if (r.status === 'passed' || r.status === 'rejected') {
        return '<a onclick="navigate(\'review-launch\',{id:\'' + r.id + '\'})">查看评审结果</a>';
      }
      return '<span style="color:var(--text-secondary)">—</span>';
    }
    // 非专家分支：按角色 × 状态显式分发（管理员/信息办领导/领导小组办公室）
    const dash = '<span style="color:var(--text-secondary)">—</span>';
    if (r.status === 'passed' || r.status === 'rejected' || r.status === 'timeout-rejected') {
      let html = '<a onclick="navigate(\'review-launch\',{id:\'' + r.id + '\'})">查看评审结果</a>';
      if (isAdmin && r.status !== 'passed') {
        html += ' | <a onclick="toast(\'已发起二次评审（演示）\',\'success\')">发起重评</a>';
      }
      return html;
    }
    if (r.status === 'in-progress') {
      if (isAdmin || isLeader) {
        return '<a onclick="window.open(\'requirement-review.html?role=owner&id=' + r.id + '\',\'_blank\')">进入工作台</a>';
      }
      return dash;
    }
    if (r.status === 'rework-pending') {
      if (isAdmin) {
        return '<a onclick="navigate(\'review-rework\',{id:\'' + r.id + '\'})">查看退回</a>'
          + ' | <a onclick="toast(\'已通知项目负责人（演示）\',\'success\')">通知 PM</a>';
      }
      if (isLeader) {
        return '<a onclick="navigate(\'review-rework\',{id:\'' + r.id + '\'})">查看退回</a>';
      }
      return dash;
    }
    if (r.status === 'invitation-pending') {
      if (isAdmin) {
        return '<a onclick="toast(\'催办通知已发送（演示）\',\'success\')">催办</a>';
      }
      return dash;
    }
    if (r.status === 'not-started') {
      if (isAdmin) {
        return '<a onclick="toast(\'已提醒专家准时参加（演示）\',\'success\')">提醒准时</a>';
      }
      return dash;
    }
    return dash;
  }

  const rows = displayList.map(r => `
    <tr>
      <td style="font-weight:500">${r.projectName}</td>
      <td>${r.type === 'approval' ? '<span class="tag tag-purple">论证评审</span>' : '<span class="tag tag-orange">验收评审</span>'}</td>
      <td>${formatDate(r.date)}</td>
      <td>${r.experts ? r.experts.length : 0} 名</td>
      <td>${r.round ? '第' + r.round + '轮' : '—'}</td>
      <td>${statusTag(r)}</td>
      <td style="font-size:12px;color:var(--text-secondary);max-width:180px">${r.weightedScore ? '<b>' + r.weightedScore + '</b>分 · ' : ''}${r.conclusion || '—'}</td>
      <td>${actionCell(r)}</td>
    </tr>`).join('');

  // 专家特有的顶部区域：待回复邀请提示
  let expertHeader = '';
  if (isExpert) {
    const pendingInvites = (DATA.expertInvites || []).reduce((n, inv) =>
      n + inv.invites.filter(e => e.status === '待回复').length, 0);
    const inviteBanner = pendingInvites > 0 ? `
      <div class="notice-item warning" style="margin-bottom:12px;cursor:pointer" onclick="navigate('expert-respond')">
        <strong>您有 ${pendingInvites} 条评审邀请待回复</strong> — 点击前往确认 →
      </div>` : '';

    expertHeader = inviteBanner;
  }

  return `
    <div class="breadcrumb">首页 / 评审管理 / <span>${pageTitle}</span></div>
    <div class="page-header">
      <div class="page-title">${pageTitle}</div>
      ${canLaunch ? '<button class="btn btn-primary" onclick="navigate(\'review-launch\')">+ 发起评审</button>' : ''}
    </div>

    ${expertHeader}

    <div style="display:flex;border-bottom:2px solid #f0f0f0;margin-bottom:16px">
      <div onclick="window._reviewTab=0;renderView('review-list')" style="padding:8px 24px;cursor:pointer;font-size:14px;
        ${currentTab === 0 ? 'border-bottom:2px solid var(--primary);color:var(--primary);font-weight:600;margin-bottom:-2px' : 'color:var(--text-secondary)'}">
        论证评审 <span class="badge">${approvalList.length}</span>
      </div>
      <div onclick="window._reviewTab=1;renderView('review-list')" style="padding:8px 24px;cursor:pointer;font-size:14px;
        ${currentTab === 1 ? 'border-bottom:2px solid var(--primary);color:var(--primary);font-weight:600;margin-bottom:-2px' : 'color:var(--text-secondary)'}">
        验收评审 <span class="badge">${acceptanceList.length}</span>
      </div>
    </div>

    <div class="card">
      <div style="display:flex;gap:8px;margin-bottom:14px;flex-wrap:wrap">
        <select class="form-control" style="width:120px">
          <option>全部状态</option><option>进行中</option><option>已完成</option>
        </select>
        <button class="btn btn-primary btn-sm" onclick="toast('演示模式：筛选功能','info')">查询</button>
      </div>
      <table class="data-table">
        <thead><tr>
          <th>项目名称</th><th>评审类型</th><th>评审日期</th><th>专家人数</th><th>轮次</th>
          <th>状态</th><th>结论</th><th>操作</th>
        </tr></thead>
        <tbody>${rows || '<tr><td colspan="8" style="text-align:center;padding:32px;color:var(--text-secondary)">暂无评审记录</td></tr>'}</tbody>
      </table>
      <div class="table-pagination"><span>共 ${displayList.length} 条记录</span></div>
    </div>`;
});


/* ====== 发起论证评审（4步向导） ====== */
(function() {
  if (window._reviewLaunchStep === undefined) window._reviewLaunchStep = 0;

  function stepBar(current) {
    var steps = ['基础信息', '评审规则', '评审专家', '信息确认'];
    return '<div style="display:flex;align-items:center;gap:0;margin-bottom:24px;padding:16px 0">'
      + steps.map(function(s, i) {
        var active = i === current;
        var done = i < current;
        var circleStyle = active
          ? 'background:var(--primary);color:#fff;font-weight:600'
          : done ? 'background:var(--success);color:#fff' : 'background:#e4e4e7;color:var(--text-secondary)';
        var labelStyle = active ? 'color:var(--primary);font-weight:600' : done ? 'color:var(--success)' : 'color:var(--text-secondary)';
        var arrow = i < steps.length - 1 ? '<div style="flex:1;height:2px;background:' + (done ? 'var(--success)' : '#e4e4e7') + ';margin:0 8px"></div>' : '';
        return '<div style="display:flex;align-items:center;' + (i < steps.length - 1 ? 'flex:1' : '') + '">'
          + '<div style="display:flex;flex-direction:column;align-items:center;gap:4px">'
          + '<div style="width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:13px;' + circleStyle + '">' + (done ? '&#10003;' : (i + 1)) + '</div>'
          + '<div style="font-size:12px;white-space:nowrap;' + labelStyle + '">' + s + '</div>'
          + '</div>'
          + arrow
          + '</div>';
      }).join('')
      + '</div>';
  }

  function renderStep0(existing, proposals) {
    return '<div class="card">'
      + '<div class="card-title">评审基本信息</div>'
      + '<div class="form-grid">'
      + '<div class="form-item"><label class="form-label required">关联项目</label>'
      + '<select class="form-control" id="rl-project">'
      + proposals.map(function(p) { return '<option value="' + p.id + '"' + (existing && existing.projectId === p.id ? ' selected' : '') + '>' + p.projectName + '</option>'; }).join('')
      + '</select></div>'
      + '<div class="form-item"><label class="form-label required">评审类型</label>'
      + '<select class="form-control" id="rl-type">'
      + '<option' + (existing && existing.type === 'approval' ? ' selected' : '') + '>立项论证</option>'
      + '<option' + (existing && existing.type === 'acceptance' ? ' selected' : '') + '>验收评审</option>'
      + '<option>变更论证</option>'
      + '</select></div>'
      + '<div class="form-item"><label class="form-label required">评审方式</label>'
      + '<select class="form-control" id="rl-mode" onchange="_onReviewModeChange(this.value)">'
      + '<option value="online">线上评审</option>'
      + '<option value="offline">线下评审</option>'
      + '</select></div>'
      + '<div class="form-item"><label class="form-label required">计划评审日期</label>'
      + '<input class="form-control" type="date" id="rl-date" value="' + (existing ? existing.date : '2025-03-28') + '"></div>'
      + '<div class="form-item" id="rl-location-wrap" style="display:none"><label class="form-label required">评审地点</label>'
      + '<input class="form-control" id="rl-location" placeholder="请输入评审地点（线下评审必填）"></div>'
      + '<div class="form-item"><label class="form-label">评审说明</label>'
      + '<input class="form-control" id="rl-note" placeholder="评审注意事项（选填）"></div>'
      + '</div>'
      + '<div class="form-footer">'
      + '<button class="btn" onclick="navigate(\'review-list\')">取消</button>'
      + '<button class="btn btn-primary" onclick="_reviewLaunchNext(0)">下一步 →</button>'
      + '</div>'
      + '</div>';
  }

  function renderStep1() {
    var templates = DATA.workflowTemplates || [];
    var tplOptions = templates.map(function(t) {
      return '<option value="' + t.id + '"' + (t.isDefault ? ' selected' : '') + '>' + t.name + ' — ' + t.description + '</option>';
    }).join('');
    var cache = window._rlCache || {};
    var reviewType = (cache.reviewType === 'acceptance') ? 'acceptance' : 'approval';
    var dimensions = (DATA.reviewDimensions && DATA.reviewDimensions[reviewType]) || DATA.reviewDimensions.approval;
    var dimRows = dimensions.map(function(d) {
      return '<tr>'
        + '<td style="font-weight:500">' + d.label + '</td>'
        + '<td style="font-size:12px;color:var(--text-secondary)">' + d.desc + '</td>'
        + '<td style="width:80px"><input class="form-control form-control-sm" type="number" value="' + d.weight + '" min="0" max="100" style="width:60px;text-align:center"></td>'
        + '<td style="width:100px"><select class="form-control form-control-sm"><option>1-10分</option><option>1-5分</option><option>通过/不通过</option></select></td>'
        + '</tr>';
    }).join('');

    return '<div class="card">'
      + '<div class="card-title">评审规则配置</div>'
      + '<div style="display:flex;align-items:center;gap:12px;margin-bottom:16px">'
      + '<label class="form-label" style="margin-bottom:0;white-space:nowrap">规则模板</label>'
      + '<select class="form-control" id="rr-template" style="width:300px" onchange="toast(\'已加载模板规则配置\',\'info\')">' + tplOptions + '</select>'
      + '</div>'
      + '<div class="card-title" style="font-size:13px;margin-top:8px">评审维度与权重</div>'
      + '<table class="data-table">'
      + '<thead><tr><th>评审维度</th><th>说明</th><th>权重(%)</th><th>评分方式</th></tr></thead>'
      + '<tbody>' + dimRows + '</tbody>'
      + '</table>'
      + '<div style="font-size:12px;color:var(--text-secondary);margin-top:8px">提示：可调整各维度权重和评分方式，权重总和应为 100%</div>'
      + '<div class="card-title" style="font-size:13px;margin-top:16px">评审流程节点</div>'
      + '<div class="flow-diagram" style="padding:12px 0">'
      + ['专家邀请','意见填写','意见汇总','结果公示'].map(function(n, i) {
          return (i > 0 ? '<span class="flow-arrow" style="font-size:12px">→</span>' : '')
            + '<span class="flow-node main" style="min-width:70px;padding:6px 10px;font-size:12px">' + n + '</span>';
        }).join('')
      + '</div>'
      + '<div class="form-footer">'
      + '<button class="btn" onclick="_reviewLaunchPrev(1)">← 上一步</button>'
      + '<button class="btn btn-primary" onclick="_reviewLaunchNext(1)">下一步 →</button>'
      + '</div>'
      + '</div>';
  }

  function renderStep2(availableExperts, blacklisted) {
    var cache = window._rlCache || {};
    var projectType = cache.projectType || 'small';
    var rules = (DATA.expertRules || {})[projectType] || DATA.expertRules.small;
    var minExperts = rules.minExperts;

    var preSelected = ['E001', 'E003', 'E006', 'E004', 'E009'];
    var selExps = availableExperts.filter(function(e) { return preSelected.includes(e.id); });
    var externalCount = selExps.filter(function(e) { return e.scope === 'external'; }).length;
    var totalCount = selExps.length;
    var isOdd = totalCount % 2 !== 0;
    var ratioOk = totalCount >= minExperts && externalCount / totalCount >= 1/3;
    var br05Ok = ratioOk && isOdd;

    // 基于标签计算匹配度
    var projectTags = ['软件工程','计算机科学与技术','教学','数据科学']; // 项目关联标签
    var matchScores = {};
    availableExperts.forEach(function(e) {
      var eTags = e.tags || [];
      var overlap = eTags.filter(function(t) { return projectTags.indexOf(t) !== -1; }).length;
      var score = Math.min(95, 50 + overlap * 20 + (e.scope === 'external' ? 5 : 0));
      var labels = [];
      if (overlap > 0) labels.push('标签匹配(' + overlap + ')');
      if (e.scope === 'external') labels.push('校外专家');
      if (!overlap) labels.push('无标签匹配');
      labels.push('回避关系-无');
      matchScores[e.id] = { score: score, tags: labels };
    });

    var expertRows = availableExperts.map(function(e) {
      var match = matchScores[e.id] || { score: 50, tags: ['待评估'] };
      var scoreColor = match.score >= 80 ? 'var(--success)' : match.score >= 60 ? 'var(--warning)' : 'var(--text-secondary)';
      var tagHtml = match.tags.map(function(t) { return '<span class="tag tag-gray" style="font-size:10px;padding:1px 5px">' + t + '</span>'; }).join(' ');
      return '<tr>'
        + '<td style="padding:6px"><input type="checkbox" class="expert-select-cb" value="' + e.id + '"' + (preSelected.includes(e.id) ? ' checked' : '') + ' onchange="_updateBr05Status()"></td>'
        + '<td style="padding:6px">' + e.name + '</td>'
        + '<td style="padding:6px">' + e.title + '</td>'
        + '<td style="padding:6px">' + e.org + '</td>'
        + '<td style="padding:6px">' + (e.scope === 'external' ? '<span class="tag tag-orange">校外</span>' : '<span class="tag tag-gray">校内</span>') + '</td>'
        + '<td style="padding:6px">' + ({tech:'<span class="tag tag-blue">技术</span>',business:'<span class="tag tag-green">业务</span>',user:'<span class="tag tag-purple">用户</span>'}[e.type] || e.type) + '</td>'
        + '<td style="padding:6px;font-weight:600;color:' + scoreColor + '">' + match.score + '%</td>'
        + '<td style="padding:6px">' + tagHtml + '</td>'
        + '</tr>';
    }).join('');

    return '<div class="card">'
      + '<div class="card-title">选择评审专家</div>'
      + '<div class="notice-item info" style="margin-bottom:12px">'
      + '<div style="display:flex;justify-content:space-between;align-items:center">'
      + '<div><strong>智能匹配推荐</strong><span style="font-size:12px;color:var(--text-secondary);margin-left:8px">系统根据项目领域、专家专长、历史评审经验和回避关系自动计算匹配度</span></div>'
      + '<button class="btn btn-primary btn-sm" onclick="_autoSelectExperts()">一键选择推荐专家</button>'
      + '</div>'
      + '</div>'
      + '<div style="background:#f8f9fa;border-radius:4px;padding:8px 12px;font-size:12px;margin-bottom:10px;color:#555">'
      + 'BR-05 规则（' + (rules.label || projectType) + '）：专家人数 ≥' + minExperts + ' 名，校外专家须不少于 1/3，且总人数须为奇数（防止票数相同）'
      + (rules.needLabAttend ? '<br>重大项目（≥100万设备）：须有实验室建设与设备管理处人员列席' : '')
      + (rules.needFinanceAttend ? '<br>重大项目：须有财务部人员列席' : '')
      + '</div>'
      + '<div id="rl-br05" style="padding:8px 12px;border-radius:4px;font-size:12px;margin-bottom:10px;'
      + 'background:' + (br05Ok ? 'var(--success-bg,#f4f4f5)' : 'var(--danger-bg,#f4f4f5)') + ';'
      + 'border:1px solid ' + (br05Ok ? 'var(--success-border,#18181b)' : 'var(--danger-border,#18181b)') + ';'
      + 'color:' + (br05Ok ? 'var(--success)' : 'var(--danger)') + '">'
      + (br05Ok
        ? '<span class="ci-pass"></span> BR-05 通过：已选 ' + totalCount + ' 名（奇数，≥' + minExperts + '），校外 ' + externalCount + ' 名（' + Math.round(externalCount/totalCount*100) + '% ≥ 33%）'
        : '<span class="ci-warn"></span> BR-05 不满足：' + (totalCount < minExperts ? '专家人数不足（当前 ' + totalCount + '，需 ≥' + minExperts + '）' : !isOdd ? '专家人数须为奇数（当前 ' + totalCount + ' 人）' : '校外专家比例不足1/3（' + externalCount + '/' + totalCount + '）'))
      + '</div>'
      + '<table class="data-table">'
      + '<thead><tr>'
      + '<th style="width:32px">选择</th>'
      + '<th>姓名</th><th>职称</th><th>单位</th><th>来源</th><th>类别</th><th style="width:70px">匹配度</th><th>匹配标签</th>'
      + '</tr></thead>'
      + '<tbody>' + expertRows + '</tbody>'
      + '</table>'
      + (blacklisted.length
        ? '<p style="font-size:11px;color:var(--text-secondary);margin-top:6px">已自动排除黑名单专家：' + blacklisted.map(function(e) { return e.name; }).join('、') + '</p>'
        : '')
      + '<div class="form-footer" style="margin-top:20px">'
      + '<button class="btn" onclick="_reviewLaunchPrev(2)">← 上一步</button>'
      + '<button class="btn btn-primary" onclick="_reviewLaunchNext(2)">下一步 →</button>'
      + '</div>'
      + '</div>';
  }

  function renderStep3(proposals) {
    var cache = window._rlCache || {};
    var projectName = cache.projectName || (proposals[0] || {}).projectName || '—';
    var mode = cache.mode || '线上评审';
    var date = cache.date || '2025-03-28';
    var location = cache.location || '';
    var note = cache.note || '';
    var expertCount = cache.expertCount || 5;

    return '<div class="card">'
      + '<div class="card-title">信息确认</div>'
      + '<p style="font-size:13px;color:var(--text-secondary);margin-bottom:16px">请确认以下评审信息无误后提交</p>'
      + '<div class="card" style="border:1px solid #e0e0e0;margin-bottom:12px">'
      + '<div class="card-title" style="font-size:13px">基础信息</div>'
      + '<div class="detail-grid">'
      + '<div class="detail-item"><span class="detail-label">关联项目</span><span class="detail-value">' + projectName + '</span></div>'
      + '<div class="detail-item"><span class="detail-label">评审方式</span><span class="detail-value">' + mode + '</span></div>'
      + '<div class="detail-item"><span class="detail-label">评审日期</span><span class="detail-value">' + date + '</span></div>'
      + (location ? '<div class="detail-item"><span class="detail-label">评审地点</span><span class="detail-value">' + location + '</span></div>' : '')
      + (note ? '<div class="detail-item"><span class="detail-label">评审说明</span><span class="detail-value">' + note + '</span></div>' : '')
      + '</div></div>'
      + '<div class="card" style="border:1px solid #e0e0e0;margin-bottom:12px">'
      + '<div class="card-title" style="font-size:13px">评审规则</div>'
      + '<div class="detail-grid">'
      + '<div class="detail-item"><span class="detail-label">规则模板</span><span class="detail-value">标准项目流程</span></div>'
      + '<div class="detail-item"><span class="detail-label">评审维度</span><span class="detail-value">' + (function(){ var rType = (cache.reviewType === 'acceptance') ? 'acceptance' : 'approval'; var dims = (DATA.reviewDimensions || {})[rType] || []; return dims.map(function(d){ return d.label + '(' + d.weight + '%)'; }).join(' · '); })() + '</span></div>'
      + '</div></div>'
      + '<div class="card" style="border:1px solid #e0e0e0;margin-bottom:12px">'
      + '<div class="card-title" style="font-size:13px">评审专家</div>'
      + '<div class="detail-grid">'
      + '<div class="detail-item"><span class="detail-label">已选专家</span><span class="detail-value">' + expertCount + ' 名</span></div>'
      + '<div class="detail-item"><span class="detail-label">BR-05 状态</span><span class="detail-value"><span class="tag tag-success">合规</span></span></div>'
      + '</div></div>'
      + '<div class="form-footer">'
      + '<button class="btn" onclick="_reviewLaunchPrev(3)">← 上一步</button>'
      + '<button class="btn btn-primary" onclick="_submitReviewLaunch()">&#10003; 提交领导确认</button>'
      + '</div>'
      + '</div>';
  }

  function renderReviewResult(r) {
    var experts = r.experts || [];
    var expertNames = experts.map(function(eid) {
      var e = (DATA.experts || []).find(function(x) { return x.id === eid; });
      return e ? e.name : eid;
    }).join('、');

    var typeLabel = r.type === 'approval' ? '立项论证' : '项目验收';
    var verdictHtml;
    if (r.status === 'passed') {
      verdictHtml = '<span class="tag tag-green" style="font-size:14px;padding:4px 12px">✓ 通过</span>';
    } else if (r.status === 'rejected') {
      verdictHtml = '<span class="tag tag-red" style="font-size:14px;padding:4px 12px">✕ 不通过</span>';
    } else {
      verdictHtml = '<span class="tag tag-red" style="font-size:14px;padding:4px 12px">✕ 不通过（超时未修改）</span>';
    }

    var breakdown = r.scoreBreakdown || [];
    var breakdownRows = breakdown.length
      ? breakdown.map(function(s) {
          return '<tr>'
            + '<td style="font-weight:500">' + s.name + '</td>'
            + '<td style="color:var(--text-secondary);font-size:12px">' + s.desc + '</td>'
            + '<td style="text-align:center">' + s.weight + '%</td>'
            + '<td style="text-align:center;font-family:var(--font-mono,monospace);font-weight:600">' + s.value + '</td>'
            + '</tr>';
        }).join('')
      : '<tr><td colspan="4" style="text-align:center;color:var(--text-secondary);padding:12px">— 评分明细数据缺失 —</td></tr>';

    var conclusion = r.conclusion || '— 未填写 —';
    var totalScore = (r.weightedScore != null) ? r.weightedScore : '—';

    return '<div class="breadcrumb">首页 / 评审管理 / <span>评审结果 — ' + r.projectName + '</span></div>'
      + '<div class="page-header">'
      + '<div class="page-title">评审结果 — ' + r.projectName + '</div>'
      + '<button class="btn" onclick="navigate(\'review-list\')">← 返回列表</button>'
      + '</div>'
      + '<div class="card">'
      + '<div class="card-title">基本信息</div>'
      + '<div class="detail-grid">'
      + '<div class="detail-item"><span class="detail-label">项目名称</span><span class="detail-value">' + r.projectName + '</span></div>'
      + '<div class="detail-item"><span class="detail-label">评审类型</span><span class="detail-value">' + typeLabel + '</span></div>'
      + '<div class="detail-item"><span class="detail-label">评审日期</span><span class="detail-value">' + formatDate(r.date) + '</span></div>'
      + '<div class="detail-item"><span class="detail-label">评审轮次</span><span class="detail-value">第 ' + (r.round || 1) + ' 轮</span></div>'
      + '<div class="detail-item"><span class="detail-label">参评专家</span><span class="detail-value">' + experts.length + ' 名（' + expertNames + '）</span></div>'
      + '</div>'
      + '</div>'
      + '<div class="card">'
      + '<div class="card-title">综合评分</div>'
      + '<div style="font-size:32px;font-weight:700;color:var(--text-primary);font-family:var(--font-mono,monospace)">'
      + totalScore + '<small style="font-size:14px;color:var(--text-secondary);font-weight:400"> / 100</small>'
      + '</div>'
      + '</div>'
      + '<div class="card">'
      + '<div class="card-title">评分明细</div>'
      + '<table class="data-table">'
      + '<thead><tr><th>维度</th><th>说明</th><th style="width:80px;text-align:center">权重</th><th style="width:80px;text-align:center">分数</th></tr></thead>'
      + '<tbody>' + breakdownRows + '</tbody>'
      + '</table>'
      + '</div>'
      + '<div class="card">'
      + '<div class="card-title">评审结论</div>'
      + '<div style="padding:8px 0">' + verdictHtml + '</div>'
      + '</div>'
      + '<div class="card">'
      + '<div class="card-title">综合意见</div>'
      + '<div style="padding:8px 0;line-height:1.8;color:var(--text-primary);white-space:pre-wrap">' + conclusion + '</div>'
      + '</div>';
  }

  registerView('review-launch', function() {
    var params = getViewParams('review-launch');
    var rid = params && params.id;
    var existing = rid ? (DATA.reviews || []).find(function(r) { return r.id === rid; }) : null;

    // 只读结果分支：已完成评审
    if (existing && ['passed','rejected','timeout-rejected'].indexOf(existing.status) >= 0) {
      return renderReviewResult(existing);
    }

    var availableExperts = (DATA.experts || []).filter(function(e) { return e.status !== 'blacklisted'; });
    var blacklisted = (DATA.experts || []).filter(function(e) { return e.status === 'blacklisted'; });
    var proposals = DATA.proposals || [];
    var step = window._reviewLaunchStep || 0;

    var isEdit = !!existing;
    var pageTitle = isEdit ? ('评审详情 — ' + (existing.projectName || '')) : '发起论证评审';

    var body = '';
    if (step === 0) body = renderStep0(existing, proposals);
    else if (step === 1) body = renderStep1();
    else if (step === 2) body = renderStep2(availableExperts, blacklisted);
    else if (step === 3) body = renderStep3(proposals);

    return '<div class="breadcrumb">首页 / 评审管理 / <span>' + pageTitle + '</span></div>'
      + '<div class="page-header">'
      + '<div class="page-title">' + pageTitle + '</div>'
      + '<button class="btn" onclick="window._reviewLaunchStep=0;navigate(\'review-list\')">← 返回列表</button>'
      + '</div>'
      + stepBar(step)
      + body;
  });

  window._reviewLaunchNext = function(current) {
    if (current === 0) {
      var mode = document.getElementById('rl-mode').value;
      if (mode === 'offline') {
        var loc = (document.getElementById('rl-location').value || '').trim();
        if (!loc) { toast('线下评审请填写评审地点', 'warning'); return; }
      }
      var projectSelect = document.getElementById('rl-project');
      var typeSelect = document.getElementById('rl-type');
      var typeVal = typeSelect.value;
      window._rlCache = window._rlCache || {};
      window._rlCache.projectName = projectSelect.options[projectSelect.selectedIndex].text;
      window._rlCache.reviewType = (typeVal === '验收评审') ? 'acceptance' : 'approval';
      // 根据项目预算推断项目级别
      var selProject = (DATA.proposals || []).find(function(p) { return p.id === projectSelect.value; });
      var pBudget = selProject ? selProject.budget : 0;
      window._rlCache.projectType = pBudget >= 200 ? 'major' : pBudget >= 100 ? 'mid' : pBudget >= 20 ? 'small' : 'micro';
      window._rlCache.projectBudget = pBudget;
      window._rlCache.mode = mode === 'offline' ? '线下评审' : '线上评审';
      window._rlCache.date = document.getElementById('rl-date').value;
      window._rlCache.location = (document.getElementById('rl-location').value || '').trim();
      window._rlCache.note = (document.getElementById('rl-note').value || '').trim();
    }
    if (current === 2) {
      var cbs = document.querySelectorAll('.expert-select-cb:checked');
      var total = cbs.length;
      var ext = 0;
      cbs.forEach(function(cb) {
        var exp = (DATA.experts || []).find(function(e) { return e.id === cb.value; });
        if (exp && exp.scope === 'external') ext++;
      });
      var cacheRules = window._rlCache || {};
      var pType = cacheRules.projectType || 'small';
      var dynRules = (DATA.expertRules || {})[pType] || { minExperts: 3 };
      var dynMin = dynRules.minExperts;
      if (total < dynMin || total % 2 === 0 || (total > 0 && ext / total < 1/3)) {
        toast('BR-05 不满足：请确保专家总数为奇数且 ≥' + dynMin + '，校外专家 ≥1/3', 'warning');
        return;
      }
      window._rlCache = window._rlCache || {};
      window._rlCache.expertCount = total;
    }
    window._reviewLaunchStep = current + 1;
    renderView('review-launch');
  };

  window._reviewLaunchPrev = function(current) {
    window._reviewLaunchStep = Math.max(0, current - 1);
    renderView('review-launch');
  };

  window._onReviewModeChange = function(value) {
    var wrap = document.getElementById('rl-location-wrap');
    if (wrap) wrap.style.display = value === 'offline' ? '' : 'none';
  };

  window._updateBr05Status = function() {
    var cbs = document.querySelectorAll('.expert-select-cb:checked');
    var total = cbs.length;
    var ext = 0;
    cbs.forEach(function(cb) {
      var exp = (DATA.experts || []).find(function(e) { return e.id === cb.value; });
      if (exp && exp.scope === 'external') ext++;
    });
    var cacheRules = window._rlCache || {};
    var pType = cacheRules.projectType || 'small';
    var dynRules = (DATA.expertRules || {})[pType] || { minExperts: 3 };
    var dynMin = dynRules.minExperts;
    var isOdd = total % 2 !== 0;
    var ratioOk = total >= dynMin && (total === 0 || ext / total >= 1/3);
    var ok = ratioOk && isOdd;
    var el = document.getElementById('rl-br05');
    if (!el) return;
    el.style.background = ok ? 'var(--success-bg,#f4f4f5)' : 'var(--danger-bg,#f4f4f5)';
    el.style.border = '1px solid ' + (ok ? 'var(--success-border,#18181b)' : 'var(--danger-border,#18181b)');
    el.style.color = ok ? 'var(--success)' : 'var(--danger)';
    el.innerHTML = ok
      ? '<span class="ci-pass"></span> BR-05 通过：已选 ' + total + ' 名（奇数，≥' + dynMin + '），校外 ' + ext + ' 名（' + Math.round(ext/total*100) + '% ≥ 33%）'
      : '<span class="ci-warn"></span> BR-05 不满足：' + (total < dynMin ? '专家人数不足（当前 ' + total + '，需 ≥' + dynMin + '）' : !isOdd ? '专家人数须为奇数（当前 ' + total + ' 人）' : '校外专家比例不足1/3（' + ext + '/' + total + '）');
  };

  window._autoSelectExperts = function() {
    var recommended = ['E001', 'E003', 'E006', 'E004', 'E009'];
    document.querySelectorAll('.expert-select-cb').forEach(function(cb) {
      cb.checked = recommended.includes(cb.value);
    });
    _updateBr05Status();
    toast('已自动选择系统推荐的 5 名专家', 'success');
  };

  window._submitReviewLaunch = function() {
    var cache = window._rlCache || {};
    logOperation('评审管理', '提交专家名单待领导确认', 'RV-NEW', cache.projectName || '', '已提交专家名单，待信息办领导确认', null);
    toast('专家名单已提交，待信息办领导确认后发送邀请', 'success');
    window._reviewLaunchStep = 0;
    window._rlCache = null;
    setTimeout(function() { navigate('review-list'); }, 1500);
  };
})();


/* ====== Issue H: 信息办领导确认专家名单（页面 #24 专家确认视图） ====== */
registerView('expert-confirm', function() {
  const role = getCurrentRole();
  const isLeader = role === 'info-leader';

  // 演示数据：待确认的评审专家名单
  const pendingReview = {
    projectName: '本科教学质量分析平台',
    projectBudget: 85,
    projectType: '小型',
    projectUnit: '教务处',
  };

  const availableExperts = (DATA.experts || []).filter(e => e.status !== 'blacklisted');
  const preSelected = ['E001', 'E003', 'E006', 'E004', 'E009'];
  const selExps = availableExperts.filter(e => preSelected.includes(e.id));
  const externalCount = selExps.filter(e => e.scope === 'external').length;
  const totalCount = selExps.length;
  const isOdd = totalCount % 2 !== 0;
  const ratioOk = totalCount >= 3 && externalCount / totalCount >= 1/3;
  const br05Ok = ratioOk && isOdd;

  const expertRows = selExps.map(e => `
    <tr>
      <td>${e.name}</td>
      <td>${e.title}</td>
      <td>${e.org}</td>
      <td>${e.scope === 'external' ? '<span class="tag tag-orange">校外</span>' : '<span class="tag tag-gray">校内</span>'}</td>
      <td>${{tech:'<span class="tag tag-blue">技术</span>',business:'<span class="tag tag-green">业务</span>',user:'<span class="tag tag-purple">用户</span>'}[e.type] || e.type}</td>
      <td>${e.field || '—'}</td>
    </tr>`).join('');

  // 根据项目级别获取专家规则
  const pType = pendingReview.projectBudget >= 200 ? 'major' : pendingReview.projectBudget >= 100 ? 'mid' : pendingReview.projectBudget >= 20 ? 'small' : 'micro';
  const confirmRules = (DATA.expertRules || {})[pType] || DATA.expertRules.small;
  const isMajor = pType === 'major';
  const isMidOrMajor = pType === 'major' || pType === 'mid';
  const majorReminder = isMajor ? `
    <div class="notice-item warning" style="margin-bottom:12px">
      <strong>重大项目提醒：</strong>本项目预算 ≥200 万元，属于重大项目。须有实验室建设与设备管理处人员列席，须有财务部人员列席，须报领导小组审定。
    </div>` : isMidOrMajor ? `
    <div class="notice-item info" style="margin-bottom:12px">
      <strong>${confirmRules.label || '中型项目'}：</strong>专家人数须 ≥${confirmRules.minExperts} 名，须含校外专家。
    </div>` : '';

  const actionPanel = isLeader ? `
    <div class="card" style="min-width:300px">
      <div class="card-title">确认操作</div>
      <p style="font-size:12px;color:var(--text-secondary);margin-bottom:12px">请审核推荐专家名单，确认后系统将自动发送评审邀请。</p>
      <div style="display:flex;flex-direction:column;gap:10px">
        <button class="btn btn-primary" onclick="
          logOperation('评审管理','确认专家名单','RV-NEW','${pendingReview.projectName}','信息办领导确认专家名单，系统发送评审邀请',null);
          toast('专家名单已确认，系统正在发送评审邀请','success');
          setTimeout(()=>navigate('review-list'),1500);
        ">&#10003; 确认 — 发送评审邀请</button>
        <button class="btn btn-warning" onclick="
          showReturnDialog('退回调整', function(cat,reason){
            logOperation('评审管理','退回专家名单','RV-NEW','${pendingReview.projectName}','退回调整：'+reason,null);
            toast('已退回管理员调整专家名单','warning');
            setTimeout(()=>navigate('dashboard'),1000);
          });
        ">退回调整</button>
      </div>
    </div>` : `
    <div class="card" style="min-width:300px">
      <div class="notice-item info">仅信息办领导可确认专家名单。</div>
    </div>`;

  return `
    <div class="breadcrumb">首页 / 评审管理 / <span>专家名单确认</span></div>
    <div class="page-header">
      <div class="page-title">专家名单确认（步骤 2.5）</div>
      <button class="btn" onclick="navigate('review-list')">← 返回</button>
    </div>
    ${majorReminder}
    <div style="display:grid;grid-template-columns:1fr auto;gap:16px;align-items:start">
      <div>
        <!-- 项目摘要 -->
        <div class="card" style="margin-bottom:16px">
          <div class="card-title">项目摘要</div>
          <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;font-size:13px">
            <div><div style="font-size:12px;color:var(--text-secondary)">项目名称</div><div style="font-weight:600;margin-top:4px">${pendingReview.projectName}</div></div>
            <div><div style="font-size:12px;color:var(--text-secondary)">申报单位</div><div style="margin-top:4px">${pendingReview.projectUnit}</div></div>
            <div><div style="font-size:12px;color:var(--text-secondary)">预算金额</div><div style="margin-top:4px">${pendingReview.projectBudget} 万元</div></div>
            <div><div style="font-size:12px;color:var(--text-secondary)">项目级别</div><div style="margin-top:4px"><span class="tag tag-blue">${pendingReview.projectType}</span></div></div>
          </div>
        </div>

        <!-- 推荐专家列表 -->
        <div class="card">
          <div class="card-title">推荐专家列表（${totalCount} 名）</div>
          <div style="background:#f8f9fa;border-radius:4px;padding:8px 12px;font-size:12px;margin-bottom:10px;
            color:${br05Ok ? 'var(--success)' : 'var(--danger)'};
            border:1px solid ${br05Ok ? '#bbf7d0' : '#fecaca'}">
            ${br05Ok
              ? '<span class="ci-pass"></span> BR-05 通过：已选 ' + totalCount + ' 名（奇数），校外 ' + externalCount + ' 名（' + Math.round(externalCount/totalCount*100) + '% ≥ 33%）'
              : '<span class="ci-warn"></span> BR-05 不满足：请退回管理员调整'}
          </div>
          <table class="data-table">
            <thead><tr><th>姓名</th><th>职称</th><th>所在单位</th><th>来源</th><th>类别</th><th>研究领域</th></tr></thead>
            <tbody>${expertRows}</tbody>
          </table>
        </div>
      </div>
      ${actionPanel}
    </div>`;
});


/* ====== 兼容旧链接：my-reviews 已融合到 review-list ====== */
registerView('my-reviews', function() {
  setTimeout(function() { navigate('review-list'); }, 0);
  return '';
});



/* ====== 填写评审意见 ====== */
registerView('review-opinion', function() {
  const params = getViewParams('review-opinion');
  const rid    = params && params.id;
  const review = (DATA.reviews || []).find(r => r.id === rid) || (DATA.reviews || [])[0];
  if (!review) return '<div class="empty-state"><p>暂无评审记录</p></div>';

  const isApproval = review.type === 'approval';
  const typeLabel = isApproval ? '立项论证' : '验收评审';

  /* ── 评审须知确认门控 ── */
  if (!window._guidelinesConfirmed) window._guidelinesConfirmed = {};
  if (!window._guidelinesConfirmed[review.id]) {
    var guideText = (DATA.reviewGuidelines || '').replace(/\n/g, '<br>');
    return `
      <div class="breadcrumb">首页 / 评审管理 / <a onclick="navigate('review-list')">评审列表</a> / <span>评审须知确认</span></div>
      <div class="page-header"><div class="page-title">评审须知确认</div></div>
      <div class="card">
        <div class="card-title">专家评审须知</div>
        <div class="notice-item warning" style="margin-bottom:16px">
          根据评审管理规范（260323会议要求），评审专家须在评审前阅读并确认以下须知。系统将记录确认时间。
        </div>
        <div style="background:#f8f9fa;border-radius:8px;padding:16px 20px;margin-bottom:16px;font-size:13px;line-height:1.8;color:var(--text-primary)">
          ${guideText}
        </div>
        <div style="margin-bottom:16px">
          <label style="display:flex;align-items:center;gap:8px;cursor:pointer;font-size:13px">
            <input type="checkbox" id="guide-confirm-cb">
            <span>我已认真阅读并理解以上评审须知，承诺遵守评审纪律</span>
          </label>
        </div>
        <div class="form-footer">
          <button class="btn" onclick="navigate('review-list')">返回</button>
          <button class="btn btn-primary" onclick="
            if(!document.getElementById('guide-confirm-cb').checked){ toast('请先勾选确认已阅读评审须知','warning'); return; }
            window._guidelinesConfirmed = window._guidelinesConfirmed || {};
            window._guidelinesConfirmed['${review.id}'] = new Date().toISOString();
            logOperation('评审管理','确认评审须知','${review.id}','${review.projectName}','专家已确认阅读评审须知',null);
            toast('已确认评审须知，进入意见填写','success');
            renderView('review-opinion');
          ">确认并进入评审</button>
        </div>
      </div>`;
  }

  /* ── 根据评审类型选择维度（论证4维度 / 验收9维度）── */
  const dimKey = isApproval ? 'approval' : 'acceptance';
  const dimensions = ((DATA.reviewDimensions || {})[dimKey] || []).map(function(d) {
    return { key: d.key, label: d.label, desc: d.desc, weight: d.weight, defaultScore: 7 };
  });
  const maxScore = dimensions.length * 10;

  const scoreRows = dimensions.map(d => `
    <div style="display:flex;align-items:center;gap:10px;padding:9px 0;border-bottom:1px solid #f5f5f5">
      <div style="width:120px;font-weight:600;font-size:13px">${d.label}<span style="font-size:11px;color:var(--text-secondary);font-weight:400;margin-left:4px">(${d.weight}%)</span></div>
      <div style="flex:1;color:var(--text-secondary);font-size:12px">${d.desc}</div>
      <div style="display:flex;align-items:center;gap:6px">
        <input type="range" name="score-${d.key}" min="1" max="10" value="${d.defaultScore}"
          style="width:120px" oninput="document.getElementById('score-val-${d.key}').textContent=this.value">
        <span id="score-val-${d.key}" style="font-weight:600;font-size:14px;width:28px;text-align:center">${d.defaultScore}</span>
        <span style="font-size:11px;color:var(--text-secondary)">/10</span>
      </div>
    </div>`).join('');

  /* ── 结论选项：通过 / 不通过 / 退回修改（BR-E03） ── */
  const passLabel = isApproval ? '建议立项' : '验收通过';
  const failLabel = isApproval ? '不建议立项' : '验收不通过';

  return `
    <div class="breadcrumb">首页 / 评审管理 / <a onclick="navigate('review-list')">评审列表</a> / <span>填写${typeLabel}意见</span></div>
    <div class="page-header"><div class="page-title">填写${typeLabel}意见</div></div>
    <div class="card">
      <div class="card-title">${typeLabel}评审意见表</div>
      <div style="background:#f8f9fa;border-radius:4px;padding:10px 14px;margin-bottom:16px;font-size:13px">
        <div style="display:flex;gap:24px;flex-wrap:wrap">
          <span><b>项目名称：</b>${review.projectName}</span>
          <span><b>评审类型：</b>${typeLabel}</span>
          <span><b>评审日期：</b>${formatDate(review.date)}</span>
          ${review.round ? '<span><b>评审轮次：</b>第' + review.round + '轮</span>' : ''}
        </div>
      </div>

      <div class="card-title" style="font-size:13px">一、综合评分（每项 1–10 分，满分 ${maxScore} 分，共 ${dimensions.length} 个维度）</div>
      ${scoreRows}

      <div class="card-title" style="font-size:13px;margin-top:16px">二、综合意见</div>
      <textarea class="form-control" id="ro-main" rows="4"
        placeholder="请填写对本项目的具体评审意见">本项目建设目标明确，技术方案基本可行，预算测算较为合理。建议在实施阶段加强与现有系统的接口管理，确保数据安全。</textarea>

      <div class="card-title" style="font-size:13px;margin-top:12px">三、修改建议</div>
      <textarea class="form-control" id="ro-suggest" rows="3"
        placeholder="如有修改建议，请详细说明">建议补充用户培训计划，明确系统试运行期间的数据迁移方案。</textarea>

      <div class="card-title" style="font-size:13px;margin-top:12px">四、评审结论（BR-E03）</div>
      <div style="display:flex;gap:20px;margin-bottom:14px;flex-wrap:wrap">
        <label style="display:flex;align-items:center;gap:6px;cursor:pointer">
          <input type="radio" name="ro-conclusion" value="通过" checked onchange="document.getElementById('rework-extra').style.display='none'">
          <b style="color:var(--success)">通过</b>（${passLabel}）
        </label>
        <label style="display:flex;align-items:center;gap:6px;cursor:pointer">
          <input type="radio" name="ro-conclusion" value="退回修改" onchange="document.getElementById('rework-extra').style.display=''">
          <b style="color:var(--warning)">退回修改</b>（需按意见修改后重新提交）
        </label>
        <label style="display:flex;align-items:center;gap:6px;cursor:pointer">
          <input type="radio" name="ro-conclusion" value="不通过" onchange="document.getElementById('rework-extra').style.display='none'">
          <b style="color:var(--danger)">不通过</b>（${failLabel}）
        </label>
      </div>

      <!-- 退回修改额外字段（BR-E04） -->
      <div id="rework-extra" style="display:none;background:#fffbeb;border:1px solid #fde68a;border-radius:8px;padding:14px 16px;margin-bottom:14px">
        <div style="font-size:12px;font-weight:500;color:#854F0B;margin-bottom:8px">退回修改要求（必填）</div>
        <textarea class="form-control" id="ro-rework-req" rows="3" placeholder="请详细说明修改要求和修改要点，项目负责人将据此修改后重新提交"></textarea>
        <div style="display:flex;gap:12px;margin-top:8px;align-items:center">
          <label class="form-label" style="margin-bottom:0;font-size:12px;white-space:nowrap">修改截止日期</label>
          <input class="form-control" type="date" id="ro-rework-deadline" style="width:160px">
        </div>
        <div style="font-size:11px;color:var(--text-secondary);margin-top:6px">超时未修改将自动标记为"不通过（超时未修改）"，与专家评审不通过分别记录原因（BR-E05）</div>
      </div>

      <div class="form-footer">
        <button class="btn" onclick="navigate('review-list')">返回</button>
        <button class="btn btn-primary" onclick="
          const main = document.getElementById('ro-main').value;
          if(!main || !main.trim()){ toast('请填写主要意见','warning'); return; }
          const conclusion = document.querySelector('input[name=ro-conclusion]:checked').value;
          if(conclusion === '退回修改') {
            var req = document.getElementById('ro-rework-req').value;
            if(!req || !req.trim()){ toast('退回修改须填写修改要求','warning'); return; }
            var dl = document.getElementById('ro-rework-deadline').value;
            if(!dl){ toast('请设置修改截止日期','warning'); return; }
            logOperation('评审管理','提交评审意见（退回修改）','${review.id}','${review.projectName}','结论：退回修改，截止：'+dl,null);
          } else {
            logOperation('评审管理','提交${typeLabel}意见','${review.id}','${review.projectName}','结论：'+conclusion,null);
          }
          toast('评审意见已提交，感谢您的专业评审','success');
          setTimeout(()=>navigate('review-list'),1500);
        ">提交${typeLabel}意见</button>
      </div>
    </div>`;
});


/* ====== 退回修改待办（阶段四，BR-E04/BR-E05） ====== */
registerView('review-rework', function() {
  const params = getViewParams('review-rework');
  const rid = params && params.id;
  const review = (DATA.reviews || []).find(r => r.id === rid);
  if (!review || review.status !== 'rework-pending') {
    return '<div class="empty-state"><p>暂无退回修改待办</p></div>';
  }
  const role = getCurrentRole();
  const isPM = role === 'project-manager';

  // 截止倒计时
  var deadlineHtml = '';
  if (review.reworkDeadline) {
    var dl = new Date(review.reworkDeadline);
    var now = new Date();
    var diff = dl - now;
    var overdue = diff <= 0;
    var absDiff = Math.abs(diff);
    var days = Math.floor(absDiff / 86400000);
    var hours = Math.floor((absDiff % 86400000) / 3600000);
    var timeText = overdue ? '已超时 ' + days + ' 天' : '剩余 ' + days + ' 天 ' + hours + ' 小时';
    var chipBg = overdue ? '#FEE2E2' : '#FAEEDA';
    var chipColor = overdue ? '#DC2626' : '#854F0B';
    deadlineHtml = '<span style="display:inline-flex;align-items:center;gap:5px;font-size:12px;color:' + chipColor + ';background:' + chipBg + ';padding:4px 10px;border-radius:4px">' + timeText + ' · 截止 ' + review.reworkDeadline + '</span>';
  }

  var reqHtml = (review.reworkRequirement || '').replace(/\n/g, '<br>');

  return `
    <div class="breadcrumb">首页 / 评审管理 / <a onclick="navigate('review-list')">评审列表</a> / <span>退回修改</span></div>
    <div class="page-header">
      <div>
        <div class="page-title">退回修改 — ${review.projectName}</div>
        <div style="font-size:13px;color:var(--text-secondary);margin-top:4px">评审结论：退回修改（BR-E04），请在截止日期前完成修改并重新提交</div>
      </div>
      <button class="btn" onclick="navigate('review-list')">← 返回列表</button>
    </div>

    <div class="notice-item warning" style="margin-bottom:16px">
      <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px">
        <div><strong>修改截止时间</strong> — 超时未修改将自动标记为"不通过（超时未修改）"（BR-E05：超时不通过与专家评审不通过分别记录原因）</div>
        ${deadlineHtml}
      </div>
    </div>

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
      <div class="card">
        <div class="card-title">评审信息</div>
        <div class="detail-grid">
          <div class="detail-item"><span class="detail-label">项目名称</span><span class="detail-value">${review.projectName}</span></div>
          <div class="detail-item"><span class="detail-label">评审类型</span><span class="detail-value">${review.type === 'approval' ? '立项论证' : '验收评审'}</span></div>
          <div class="detail-item"><span class="detail-label">评审日期</span><span class="detail-value">${formatDate(review.date)}</span></div>
          <div class="detail-item"><span class="detail-label">评审轮次</span><span class="detail-value">第 ${review.round || 1} 轮</span></div>
          <div class="detail-item"><span class="detail-label">综合评分</span><span class="detail-value">${review.weightedScore || '—'} 分</span></div>
          <div class="detail-item"><span class="detail-label">评审结论</span><span class="detail-value"><span class="tag tag-orange">退回修改</span></span></div>
        </div>
      </div>

      <div class="card">
        <div class="card-title">修改要求</div>
        <div style="font-size:13px;line-height:1.8;color:var(--text-primary)">${reqHtml || '暂无具体修改要求'}</div>
        <div style="margin-top:12px;font-size:12px;color:var(--text-secondary)">
          专家综合意见：${review.conclusion || '—'}
        </div>
      </div>
    </div>

    ${isPM ? `
    <div class="card" style="margin-top:16px">
      <div class="card-title">提交修改材料</div>
      <div class="form-grid">
        <div class="form-item"><label class="form-label required">修改摘要</label>
          <textarea class="form-control" id="rw-summary" rows="3" placeholder="请说明本次修改了哪些内容，对应专家哪条修改要求"></textarea>
        </div>
        <div class="form-item"><label class="form-label">附件上传</label>
          <div style="border:2px dashed #e4e4e7;border-radius:8px;padding:20px;text-align:center;color:var(--text-secondary);font-size:13px;cursor:pointer" onclick="toast('演示：文件上传','info')">点击或拖拽上传修改后的材料</div>
        </div>
      </div>
      <div class="form-footer">
        <button class="btn" onclick="navigate('review-list')">返回</button>
        <button class="btn btn-primary" onclick="
          var summary = document.getElementById('rw-summary').value;
          if(!summary || !summary.trim()){ toast('请填写修改摘要','warning'); return; }
          logOperation('评审管理','提交退回修改材料','${review.id}','${review.projectName}','项目负责人已提交修改材料，待专家重新评审',null);
          toast('修改材料已提交，将同步给专家重新评审','success');
          setTimeout(function(){navigate('review-list')},1500);
        ">提交修改材料</button>
      </div>
    </div>` : `
    <div class="card" style="margin-top:16px">
      <div class="notice-item info">等待项目负责人提交修改材料，提交后将同步给专家重新评审。</div>
    </div>`}`;
});
