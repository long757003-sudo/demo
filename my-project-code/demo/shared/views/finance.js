// shared/views/finance.js  —  V2.1

/* ====== 合同台账 ====== */
registerView('contract-ledger', function() {
  const role      = getCurrentRole();
  const contracts = DATA.contracts || [];

  // Reference date: use actual date for demo
  const refDate = new Date();

  function computeWarrantyEnd(endDate, warrantyYears) {
    const d = new Date(endDate);
    d.setFullYear(d.getFullYear() + warrantyYears);
    return d;
  }

  function warrantyDays(warrantyEnd) {
    return Math.floor((warrantyEnd - refDate) / 86400000);
  }

  function warrantyEndStr(endDate, warrantyYears) {
    const d   = computeWarrantyEnd(endDate, warrantyYears);
    const y   = d.getFullYear();
    const m   = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return y + '-' + m + '-' + day;
  }

  function warrantyEndCell(endDate, warrantyYears) {
    const wEnd  = computeWarrantyEnd(endDate, warrantyYears);
    const days  = warrantyDays(wEnd);
    const dateStr = warrantyEndStr(endDate, warrantyYears);
    if (days > 365) {
      return '<span style="color:var(--success)">' + dateStr + '</span>';
    } else if (days > 0) {
      return '<span style="color:var(--warning)">即将到期 ' + dateStr + '</span>';
    } else {
      return '<span style="color:var(--danger)">已到期 ' + dateStr + '</span>';
    }
  }

  function warrantyRemainingCell(endDate, warrantyYears) {
    const wEnd = computeWarrantyEnd(endDate, warrantyYears);
    const days = warrantyDays(wEnd);
    if (days > 0) {
      return days + '天';
    } else {
      return '<span style="color:var(--danger)">已到期 ' + Math.abs(days) + '天前</span>';
    }
  }

  function contractStatusTag(status) {
    if (status === 'active')    return '<span class="tag tag-blue">履行中</span>';
    if (status === 'completed') return '<span class="tag tag-success">已完结</span>';
    return '<span class="tag tag-gray">' + status + '</span>';
  }

  function paymentToastMsg(contract) {
    const lines = contract.payments.map(function(p) {
      const statusLabel = p.status === 'paid' ? '已支付' : '待支付';
      return p.node + '（' + p.ratio + '%，' + p.amount + '万）— ' + statusLabel + (p.date ? '，' + p.date : '');
    });
    return contract.projectName + ' 付款进度：' + lines.join('；');
  }

  const rows = contracts.map(function(c) {
    const wEndCell = warrantyEndCell(c.endDate, c.warrantyYears);
    const wRemCell = warrantyRemainingCell(c.endDate, c.warrantyYears);
    const payMsg   = paymentToastMsg(c).replace(/'/g, "\\'");
    return '<tr>'
      + '<td>' + c.id + '</td>'
      + '<td><b>' + c.projectName + '</b></td>'
      + '<td>' + c.vendor + '</td>'
      + '<td style="font-weight:600">' + c.amount + ' 万</td>'
      + '<td>' + formatDate(c.signDate) + '</td>'
      + '<td>' + formatDate(c.endDate) + '</td>'
      + '<td>' + wEndCell + '</td>'
      + '<td>' + wRemCell + '</td>'
      + '<td>' + contractStatusTag(c.status) + '</td>'
      + '<td><a onclick="toast(\'' + payMsg + '\', \'info\', 5000)">付款进度</a></td>'
      + '</tr>';
  }).join('');

  const canUpload = role === 'contract-admin';

  return breadcrumb('经费与合同', '合同台账')
    + '<div class="page-header">'
    +   '<div class="page-title">合同台账</div>'
    +   (canUpload ? '<button class="btn btn-primary" onclick="navigate(\'project-procurement\')">上传备案合同 →</button>' : '')
    + '</div>'
    + '<div class="card">'
    +   '<div style="display:flex;gap:8px;margin-bottom:14px;flex-wrap:wrap">'
    +     '<input class="form-control" placeholder="搜索项目名称/供应商..." style="width:220px">'
    +     '<select class="form-control" style="width:120px"><option>全部状态</option><option>履行中</option><option>已完结</option></select>'
    +     '<button class="btn btn-primary btn-sm" onclick="toast(\'演示模式：查询功能\',\'info\')">查询</button>'
    +   '</div>'
    +   '<table class="data-table">'
    +   '<thead><tr>'
    +     '<th>合同ID</th><th>项目名称</th><th>承建单位</th><th>合同金额</th>'
    +     '<th>签订日期</th><th>合同截止</th><th>质保截止</th><th>质保剩余</th>'
    +     '<th>状态</th><th>操作</th>'
    +   '</tr></thead>'
    +   '<tbody>'
    +     (rows || '<tr><td colspan="10" style="text-align:center;padding:32px;color:var(--text-secondary)">暂无数据</td></tr>')
    +   '</tbody>'
    +   '</table>'
    +   '<div class="table-pagination">'
    +     '<span>共 ' + contracts.length + ' 份合同</span>'
    +     '<span>第 1/1 页 &nbsp; &lt; 1 &gt;</span>'
    +   '</div>'
    + '</div>';
});


/* ====== 经费管理 ====== */
registerView('finance-overview', function() {
  const role   = getCurrentRole();
  const budget = DATA.annualBudget || {};

  // ── 4 KPI stat cards ────────────────────────────────────────────────────────
  const statCards = '<div class="stat-row">'
    + '<div class="stat-card">'
    +   '<div class="stat-label">年度预算</div>'
    +   '<div class="stat-value">' + (budget.total || 0) + '</div>'
    +   '<div class="stat-label">万元（全口径）</div>'
    + '</div>'
    + '<div class="stat-card success">'
    +   '<div class="stat-label">已批准</div>'
    +   '<div class="stat-value">' + (budget.approved || 0) + '</div>'
    +   '<div class="stat-label">万元</div>'
    + '</div>'
    + '<div class="stat-card warning">'
    +   '<div class="stat-label">已支出</div>'
    +   '<div class="stat-value">' + (budget.used || 0) + '</div>'
    +   '<div class="stat-label">万元</div>'
    + '</div>'
    + '<div class="stat-card purple">'
    +   '<div class="stat-label">可用余额</div>'
    +   '<div class="stat-value">' + (budget.available || 0) + '</div>'
    +   '<div class="stat-label">万元</div>'
    + '</div>'
    + '</div>';

  // ── Annual budget progress bar ───────────────────────────────────────────────
  const approved = budget.approved || 1;
  const usedPct   = (budget.used    / approved * 100).toFixed(1);
  const resPct    = (budget.reserved / approved * 100).toFixed(1);
  const availPct  = (budget.available / approved * 100).toFixed(1);

  const progressBar = '<div class="card">'
    + '<div class="card-title">年度批准经费使用情况（' + (budget.year || '—') + '年，已批准 ' + approved + ' 万）</div>'
    + '<div style="display:flex;height:22px;border-radius:4px;overflow:hidden;background:#f0f0f0;margin-bottom:10px">'
    +   '<div style="width:' + usedPct + '%;background:var(--primary);transition:width .3s" title="已支出"></div>'
    +   '<div style="width:' + resPct + '%;background:var(--warning);transition:width .3s" title="质保预留"></div>'
    +   '<div style="width:' + availPct + '%;background:#d9d9d9;transition:width .3s" title="可用余额"></div>'
    + '</div>'
    + '<div style="display:flex;gap:20px;font-size:12px;color:var(--text-secondary);flex-wrap:wrap">'
    +   '<span><span style="display:inline-block;width:10px;height:10px;background:var(--primary);border-radius:2px;margin-right:4px"></span>已支出 ' + (budget.used || 0) + ' 万（' + usedPct + '%）</span>'
    +   '<span><span style="display:inline-block;width:10px;height:10px;background:var(--warning);border-radius:2px;margin-right:4px"></span>质保预留 ' + (budget.reserved || 0) + ' 万（' + resPct + '%）</span>'
    +   '<span><span style="display:inline-block;width:10px;height:10px;background:#d9d9d9;border-radius:2px;margin-right:4px"></span>可用余额 ' + (budget.available || 0) + ' 万（' + availPct + '%）</span>'
    + '</div>'
    + '<div style="margin-top:10px;font-size:12px;color:var(--text-secondary);background:#fffbe6;border-left:3px solid var(--warning);padding:6px 10px;border-radius:0 4px 4px 0">'
    +   '质保预留说明：按合同约定，项目验收后预留合同总价 10% 作为质保金，待质保期满无重大缺陷后予以支付。'
    + '</div>'
    + '</div>';

  // ── Per-project table ───────────────────────────────────────────────────────
  function projectBudgetStatusTag(st) {
    if (st === 'completed')    return '<span class="tag tag-success">已完结</span>';
    if (st === 'implementing') return '<span class="tag tag-blue">实施中</span>';
    if (st === 'demand')       return '<span class="tag tag-gray">需求阶段</span>';
    return '<span class="tag tag-gray">' + st + '</span>';
  }

  const projectRows = (budget.projects || []).map(function(p) {
    const pct     = p.approved > 0 ? Math.round((p.used + p.reserved) / p.approved * 100) : 0;
    const resDisp = p.reserved > 0
      ? '<span style="color:var(--warning)">' + p.reserved + '</span>'
      : p.reserved;
    const progressCell = '<div style="display:flex;align-items:center;gap:8px">'
      + '<div style="flex:1;height:8px;background:#f0f0f0;border-radius:4px;overflow:hidden">'
      +   '<div style="width:' + pct + '%;height:100%;background:var(--primary);border-radius:4px"></div>'
      + '</div>'
      + '<span style="font-size:12px;color:var(--text-secondary);white-space:nowrap">' + pct + '%</span>'
      + '</div>';
    return '<tr>'
      + '<td>' + p.name + '</td>'
      + '<td>' + p.approved + '</td>'
      + '<td>' + p.used + '</td>'
      + '<td>' + resDisp + '</td>'
      + '<td style="min-width:140px">' + progressCell + '</td>'
      + '<td>' + projectBudgetStatusTag(p.status) + '</td>'
      + '</tr>';
  }).join('');

  const projectTable = '<div class="card">'
    + '<div class="card-title">各项目经费明细（万元）</div>'
    + '<table class="data-table">'
    +   '<thead><tr>'
    +     '<th>项目名称</th><th>批准经费(万)</th><th>已支出(万)</th><th>质保预留(万)</th><th>使用进度</th><th>状态</th>'
    +   '</tr></thead>'
    +   '<tbody>' + (projectRows || '<tr><td colspan="6" style="text-align:center;padding:24px;color:var(--text-secondary)">暂无数据</td></tr>') + '</tbody>'
    + '</table>'
    + '</div>';

  // ── Pending payment approvals ────────────────────────────────────────────────
  const canApprovePay = role === 'finance-admin' || role === 'info-leader' || role === 'leadership-office';

  const pendingSection = '<div class="card">'
    + '<div class="card-title">待审批付款申请</div>'
    + '<table class="data-table">'
    +   '<thead><tr>'
    +     '<th>项目名称</th><th>付款节点</th><th>金额(万)</th><th>申请人</th><th>申请日期</th><th>操作</th>'
    +   '</tr></thead>'
    +   '<tbody>'
    +   '<tr>'
    +     '<td>本科教学质量分析平台</td>'
    +     '<td>中期款 40%</td>'
    +     '<td style="font-weight:600">34</td>'
    +     '<td>李明</td>'
    +     '<td>2025-09-30</td>'
    +     '<td>'
    +       (canApprovePay
          ? '<button class="btn btn-success btn-sm" style="margin-right:6px" onclick="'
            + 'logOperation(\'经费与合同\',\'审批付款\',\'P001\',\'本科教学质量分析平台\',\'中期款40%（34万）审批通过\',null);'
            + 'toast(\'付款申请已审批通过，共 34 万元\', \'success\')">审批通过</button>'
            + '<button class="btn btn-warning btn-sm" onclick="toast(\'付款申请已退回，请申请人补充材料后重新提交\', \'warning\')">退回</button>'
          : '<span style="font-size:12px;color:var(--text-secondary)">无操作权限</span>')
    +     '</td>'
    +   '</tr>'
    +   '</tbody>'
    + '</table>'
    + '</div>';

  return breadcrumb('经费与合同', '经费管理')
    + '<div class="page-header">'
    +   '<div class="page-title">经费管理</div>'
    +   '<div style="font-size:13px;color:var(--text-secondary)">' + (budget.year || '—') + ' 年度</div>'
    + '</div>'
    + statCards
    + progressBar
    + projectTable
    + pendingSection;
});
