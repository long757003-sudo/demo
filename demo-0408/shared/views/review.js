// shared/views/review.js  —  V2.1

/* ====== 评审列表 ====== */
registerView('review-list', function() {
  const reviews    = DATA.reviews || [];
  const currentTab = window._reviewTab || 0;  // 0 = 论证评审, 1 = 验收评审

  const approvalList   = reviews.filter(r => r.type === 'approval');
  const acceptanceList = reviews.filter(r => r.type === 'acceptance');
  const displayList    = currentTab === 0 ? approvalList : acceptanceList;

  function statusTag(r) {
    if (r.status === 'in-progress') return '<span class="tag tag-blue">进行中</span>';
    if (r.status === 'passed')      return '<span class="tag tag-green">已通过</span>';
    if (r.status === 'rejected')    return '<span class="tag tag-red">未通过</span>';
    return '<span class="tag tag-gray">' + r.status + '</span>';
  }

  const rows = displayList.map(r => `
    <tr>
      <td style="font-weight:500">${r.projectName}</td>
      <td>${r.type === 'approval' ? '<span class="tag tag-purple">论证评审</span>' : '<span class="tag tag-orange">验收评审</span>'}</td>
      <td>${formatDate(r.date)}</td>
      <td>${r.experts ? r.experts.length : 0} 名</td>
      <td>${statusTag(r)}</td>
      <td style="font-size:12px;color:var(--text-secondary);max-width:200px">${r.conclusion || '—'}</td>
      <td>
        <a onclick="navigate('review-launch',{id:'${r.id}'})">详情</a>
        ${r.status === 'in-progress' ? ' | <a onclick="navigate(\'review-opinion\',{id:\'' + r.id + '\'})">填写意见</a>' : ''}
      </td>
    </tr>`).join('');

  const role = getCurrentRole();
  const canLaunch = role === 'info-admin' || role === 'info-leader';

  return `
    <div class="breadcrumb">首页 / 评审管理 / <span>评审列表</span></div>
    <div class="page-header">
      <div class="page-title">评审列表</div>
      ${canLaunch ? '<button class="btn btn-primary" onclick="navigate(\'review-launch\')">+ 发起评审</button>' : ''}
    </div>

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
          <th>项目名称</th><th>评审类型</th><th>评审日期</th><th>专家人数</th>
          <th>状态</th><th>结论</th><th>操作</th>
        </tr></thead>
        <tbody>${rows || '<tr><td colspan="7" style="text-align:center;padding:32px;color:var(--text-secondary)">暂无评审记录</td></tr>'}</tbody>
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
    var dimensions = [
      { key: 'techPlan', label: '技术方案', weight: 30, desc: '技术方案的可行性、成熟度与先进性' },
      { key: 'necessity', label: '建设必要性', weight: 30, desc: '项目建设的必要性、紧迫性及与规划的关系' },
      { key: 'budget', label: '预算合理性', weight: 20, desc: '建设预算的合理性、性价比与资金来源' },
      { key: 'security', label: '安全合规', weight: 20, desc: '信息安全方案完整性、等保合规与数据保护' },
    ];
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
    var preSelected = ['E001', 'E003', 'E006', 'E004', 'E009'];
    var selExps = availableExperts.filter(function(e) { return preSelected.includes(e.id); });
    var externalCount = selExps.filter(function(e) { return e.scope === 'external'; }).length;
    var totalCount = selExps.length;
    var isOdd = totalCount % 2 !== 0;
    var ratioOk = totalCount >= 3 && externalCount / totalCount >= 1/3;
    var br05Ok = ratioOk && isOdd;

    var matchScores = {
      'E001': { score: 95, tags: ['领域匹配', '经验丰富'] },
      'E003': { score: 88, tags: ['领域匹配', '回避关系-无'] },
      'E004': { score: 82, tags: ['技术专长', '回避关系-无'] },
      'E006': { score: 78, tags: ['领域相关', '校外专家'] },
      'E009': { score: 75, tags: ['校外专家', '回避关系-无'] },
      'E002': { score: 70, tags: ['领域相关'] },
      'E005': { score: 65, tags: ['技术专长'] },
      'E007': { score: 60, tags: ['业务经验'] },
      'E010': { score: 55, tags: ['领域相关'] },
    };

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
      + 'BR-05 规则：校外专家须不少于 1/3，且专家总人数须为奇数（防止票数相同）'
      + '</div>'
      + '<div id="rl-br05" style="padding:8px 12px;border-radius:4px;font-size:12px;margin-bottom:10px;'
      + 'background:' + (br05Ok ? 'var(--success-bg,#f4f4f5)' : 'var(--danger-bg,#f4f4f5)') + ';'
      + 'border:1px solid ' + (br05Ok ? 'var(--success-border,#18181b)' : 'var(--danger-border,#18181b)') + ';'
      + 'color:' + (br05Ok ? 'var(--success)' : 'var(--danger)') + '">'
      + (br05Ok
        ? '<span class="ci-pass"></span> BR-05 通过：已选 ' + totalCount + ' 名（奇数），校外 ' + externalCount + ' 名（' + Math.round(externalCount/totalCount*100) + '% ≥ 33%）'
        : '<span class="ci-warn"></span> BR-05 不满足：' + (!isOdd ? '专家人数须为奇数（当前 ' + totalCount + ' 人）' : '校外专家比例不足1/3（' + externalCount + '/' + totalCount + '）'))
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
      + '<div class="detail-item"><span class="detail-label">评审维度</span><span class="detail-value">技术方案(30%) · 建设必要性(30%) · 预算合理性(20%) · 安全合规(20%)</span></div>'
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

  registerView('review-launch', function() {
    var params = getViewParams('review-launch');
    var rid = params && params.id;
    var existing = rid ? (DATA.reviews || []).find(function(r) { return r.id === rid; }) : null;
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
      window._rlCache = window._rlCache || {};
      window._rlCache.projectName = projectSelect.options[projectSelect.selectedIndex].text;
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
      if (total < 3 || total % 2 === 0 || ext / total < 1/3) {
        toast('BR-05 不满足：请确保专家总数为奇数且 ≥3，校外专家 ≥1/3', 'warning');
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
    var isOdd = total % 2 !== 0;
    var ratioOk = total >= 3 && ext / total >= 1/3;
    var ok = ratioOk && isOdd;
    var el = document.getElementById('rl-br05');
    if (!el) return;
    el.style.background = ok ? 'var(--success-bg,#f4f4f5)' : 'var(--danger-bg,#f4f4f5)';
    el.style.border = '1px solid ' + (ok ? 'var(--success-border,#18181b)' : 'var(--danger-border,#18181b)');
    el.style.color = ok ? 'var(--success)' : 'var(--danger)';
    el.innerHTML = ok
      ? '<span class="ci-pass"></span> BR-05 通过：已选 ' + total + ' 名（奇数），校外 ' + ext + ' 名（' + Math.round(ext/total*100) + '% ≥ 33%）'
      : '<span class="ci-warn"></span> BR-05 不满足：' + (!isOdd ? '专家人数须为奇数（当前 ' + total + ' 人）' : '校外专家比例不足1/3（' + ext + '/' + total + '）');
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

  // 重大项目/百万设备列席提醒
  const isMajor = pendingReview.projectBudget >= 200;
  const majorReminder = isMajor ? `
    <div class="notice-item warning" style="margin-bottom:12px">
      <strong>重大项目提醒：</strong>本项目预算 ≥200 万元，属于重大项目，须报领导小组审定。建议邀请分管校领导列席评审会。
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


/* ====== 我的评审任务 ====== */
registerView('my-reviews', function() {
  const myTasks = (DATA.reviews || []).filter(r => r.status === 'in-progress');

  const taskCards = myTasks.map(r => `
    <div class="card" style="margin-bottom:12px">
      <div style="display:flex;justify-content:space-between;align-items:center">
        <div>
          <span style="font-weight:600;font-size:15px">${r.projectName}</span>
          <span class="tag tag-purple" style="margin-left:8px">${r.type === 'approval' ? '立项论证' : '验收评审'}</span>
          <span class="tag tag-orange" style="margin-left:4px">待填写意见</span>
        </div>
        <button class="btn btn-primary" onclick="navigate('review-opinion',{id:'${r.id}'})">填写评审意见 →</button>
      </div>
      <div style="margin-top:8px;font-size:12px;color:var(--text-secondary)">
        评审日期：${formatDate(r.date)}
        &nbsp;|&nbsp; 参与专家：${Object.keys(r.inviteStatus || {}).slice(0, 3).join('、') || '待确认'}
        &nbsp;|&nbsp; 请于评审日前完成意见填写
      </div>
    </div>`).join('');

  // 待回复的评审邀请数
  const pendingInvites = (DATA.expertInvites || []).reduce((n, inv) =>
    n + inv.invites.filter(e => e.status === '待回复').length, 0);
  const inviteBanner = pendingInvites > 0 ? `
    <div class="notice-item warning" style="margin-bottom:12px;cursor:pointer" onclick="navigate('expert-respond')">
      <strong>您有 ${pendingInvites} 条评审邀请待回复</strong> — 点击前往确认 →
    </div>` : '';

  return `
    <div class="breadcrumb">首页 / 评审管理 / <span>我的评审任务</span></div>
    <div class="page-header"><div class="page-title">我的评审任务</div></div>
    ${inviteBanner}
    ${myTasks.length === 0
      ? '<div class="card" style="text-align:center;color:var(--text-secondary);padding:40px">暂无待处理评审任务</div>'
      : taskCards}`;
});


/* ====== 填写论证意见 ====== */
registerView('review-opinion', function() {
  const params = getViewParams('review-opinion');
  const rid    = params && params.id;
  const review = (DATA.reviews || []).find(r => r.id === rid) || (DATA.reviews || [])[0];
  if (!review) return '<div class="empty-state"><p>暂无评审记录</p></div>';

  // Issue E (2.5b): 4 维度 1-10 评分 + 综合意见 + 论证结论
  const dimensions = [
    { key: 'techPlan',    label: '技术方案',     desc: '技术方案的可行性、成熟度与先进性', defaultScore: 8 },
    { key: 'necessity',   label: '建设必要性',   desc: '项目建设的必要性、紧迫性及与规划的关系', defaultScore: 8 },
    { key: 'budget',      label: '预算合理性',   desc: '建设预算的合理性、性价比与资金来源', defaultScore: 7 },
    { key: 'security',    label: '安全合规',     desc: '信息安全方案完整性、等保合规与数据保护', defaultScore: 7 },
  ];

  const scoreRows = dimensions.map(d => `
    <div style="display:flex;align-items:center;gap:10px;padding:9px 0;border-bottom:1px solid #f5f5f5">
      <div style="width:100px;font-weight:600;font-size:13px">${d.label}</div>
      <div style="flex:1;color:var(--text-secondary);font-size:12px">${d.desc}</div>
      <div style="display:flex;align-items:center;gap:6px">
        <input type="range" name="score-${d.key}" min="1" max="10" value="${d.defaultScore}"
          style="width:120px" oninput="document.getElementById('score-val-${d.key}').textContent=this.value">
        <span id="score-val-${d.key}" style="font-weight:600;font-size:14px;width:28px;text-align:center">${d.defaultScore}</span>
        <span style="font-size:11px;color:var(--text-secondary)">/10</span>
      </div>
    </div>`).join('');

  return `
    <div class="breadcrumb">首页 / 评审管理 / <a onclick="navigate('my-reviews')">我的评审任务</a> / <span>填写论证意见</span></div>
    <div class="page-header"><div class="page-title">填写论证意见</div></div>
    <div class="card">
      <div class="card-title">立项论证评审意见表</div>
      <div style="background:#f8f9fa;border-radius:4px;padding:10px 14px;margin-bottom:16px;font-size:13px">
        <div style="display:flex;gap:24px;flex-wrap:wrap">
          <span><b>项目名称：</b>${review.projectName}</span>
          <span><b>评审类型：</b>${review.type === 'approval' ? '立项论证' : '验收评审'}</span>
          <span><b>评审日期：</b>${formatDate(review.date)}</span>
        </div>
      </div>

      <div class="card-title" style="font-size:13px">一、综合评分（每项 1–10 分，满分 40 分）</div>
      ${scoreRows}

      <div class="card-title" style="font-size:13px;margin-top:16px">二、综合意见</div>
      <textarea class="form-control" id="ro-main" rows="4"
        placeholder="请填写对本项目建设必要性、技术方案、预算合理性等方面的具体意见">本项目建设目标明确，技术方案基本可行，预算测算较为合理。建议在实施阶段加强与现有系统的接口管理，确保数据安全。</textarea>

      <div class="card-title" style="font-size:13px;margin-top:12px">三、修改建议</div>
      <textarea class="form-control" id="ro-suggest" rows="3"
        placeholder="如有修改建议，请详细说明">建议补充用户培训计划，明确系统试运行期间的数据迁移方案。</textarea>

      <div class="card-title" style="font-size:13px;margin-top:12px">四、论证结论</div>
      <div style="display:flex;gap:20px;margin-bottom:14px;flex-wrap:wrap">
        <label style="display:flex;align-items:center;gap:6px;cursor:pointer">
          <input type="radio" name="ro-conclusion" value="通过" checked>
          <b style="color:var(--success)">通过</b>（建议立项）
        </label>
        <label style="display:flex;align-items:center;gap:6px;cursor:pointer">
          <input type="radio" name="ro-conclusion" value="修改后通过">
          <b style="color:var(--warning)">修改后通过</b>（需按意见修改）
        </label>
        <label style="display:flex;align-items:center;gap:6px;cursor:pointer">
          <input type="radio" name="ro-conclusion" value="不通过">
          <b style="color:var(--danger)">不通过</b>（不建议立项）
        </label>
      </div>

      <div class="form-footer">
        <button class="btn" onclick="navigate('my-reviews')">返回</button>
        <button class="btn btn-primary" onclick="
          const main = document.getElementById('ro-main').value;
          if(!main || !main.trim()){ toast('请填写主要意见','warning'); return; }
          const conclusion = document.querySelector('input[name=ro-conclusion]:checked').value;
          logOperation('评审管理','提交论证意见','${review.id}','${review.projectName}','结论：'+conclusion,null);
          toast('论证意见已提交，感谢您的专业评审','success');
          setTimeout(()=>navigate('my-reviews'),1500);
        ">提交论证意见</button>
      </div>
    </div>`;
});
