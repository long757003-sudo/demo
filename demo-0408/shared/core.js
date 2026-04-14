// shared/core.js
function getCurrentRole() {
  return localStorage.getItem('currentRole') || 'project-manager';
}
function switchRole(roleId) {
  localStorage.setItem('currentRole', roleId);
  renderNav();
  const view = getCurrentView() || 'dashboard';
  renderView(view);
}
function getCurrentRoleObj() {
  return DATA.roles.find(r => r.id === getCurrentRole()) || DATA.roles[6];
}
const VIEWS = {};
function registerView(id, fn) { VIEWS[id] = fn; }
function getCurrentView() { return location.hash.replace('#', '') || 'dashboard'; }
function navigate(viewId, params) {
  if (params) localStorage.setItem('viewParams_' + viewId, JSON.stringify(params));
  location.hash = viewId;
}
function getViewParams(viewId) {
  const raw = localStorage.getItem('viewParams_' + viewId);
  return raw ? JSON.parse(raw) : null;
}
function renderView(viewId) {
  const content = document.getElementById('main-content');
  if (!content) return;
  const fn = VIEWS[viewId];
  if (fn) {
    content.innerHTML = fn();
  } else {
    content.innerHTML = '<div class="empty-state"><div class="icon">&mdash;</div><p>视图 "' + viewId + '" 尚未实现</p></div>';
  }
  highlightNav(viewId);
}
window.addEventListener('hashchange', () => renderView(getCurrentView()));
function saveDraft(formId, data) { localStorage.setItem('draft_' + formId, JSON.stringify(data)); }
function loadDraft(formId) { const raw = localStorage.getItem('draft_' + formId); return raw ? JSON.parse(raw) : null; }
function clearDraft(formId) { localStorage.removeItem('draft_' + formId); }
function toast(msg, type = 'info', duration = 2500) {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  const iconChar = { success: '&#10003;', error: '&#10007;', info: 'i', warning: '!' };
  const el = document.createElement('div');
  el.className = 'toast ' + type;
  el.innerHTML = '<span class="toast-icon toast-icon--' + type + '">' + (iconChar[type] || 'i') + '</span><span>' + msg + '</span>';
  container.appendChild(el);
  setTimeout(() => { el.style.opacity = '0'; el.style.transition = 'opacity .3s'; setTimeout(() => el.remove(), 300); }, duration);
}
function projectTypeTag(type) {
  const map = { micro: ['微型', 'tag-gray'], small: ['小型', 'tag-blue'], mid: ['中型', 'tag-orange'], major: ['重大', 'tag-red'] };
  const [label, cls] = map[type] || ['未知', 'tag-gray'];
  return '<span class="tag ' + cls + '">' + label + '</span>';
}
function projectStatusTag(status) {
  const map = { demand: ['需求征集', 'tag-gray'], reviewing: ['立项论证', 'tag-orange'], procurement: ['采购中', 'tag-cyan'], implementing: ['实施中', 'tag-blue'], acceptance: ['验收中', 'tag-purple'], completed: ['已验收', 'tag-green'], ops: ['运维中', 'tag-green'], frozen: ['冻结', 'tag-red'], terminated: ['已终止', 'tag-gray'] };
  const [label, cls] = map[status] || ['未知', 'tag-gray'];
  return '<span class="tag ' + cls + '">' + label + '</span>';
}
function budgetToType(budget) {
  if (budget < 20) return { type: 'micro', label: '微型项目（<20万）' };
  if (budget < 100) return { type: 'small', label: '小型项目（20-100万）' };
  if (budget < 200) return { type: 'mid', label: '中型项目（100-200万）' };
  return { type: 'major', label: '重大项目（≥200万）' };
}
function formatDate(d) { return d || '—'; }
function deadlineClass(dateStr) {
  if (!dateStr) return '';
  const days = (new Date(dateStr) - new Date()) / 86400000;
  if (days < 0) return 'style="color:var(--danger);font-weight:600"';
  if (days <= 7) return 'style="color:var(--warning);font-weight:600"';
  return '';
}
function logOperation(module, action, targetId, targetName, detail, changes) {
  const role = getCurrentRoleObj();
  DATA.operationLogs.unshift({ id: 'L' + Date.now(), time: new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-'), operator: roleDisplayName(getCurrentRole()), role: role.name, module, action, targetId, targetName, detail, changes: changes || null });
}
function roleDisplayName(roleId) {
  // D-10: 演示账号映射（260409 会议确认：唐明-20053964、林已杰-20054379、王一凡-50240014）
  const names = { 'project-manager': '王一凡', 'info-admin': '林已杰', 'info-leader': '唐明', 'unit-leader': '唐明', 'unit-admin': '林已杰', 'unit-sysadmin': '林已杰', 'expert': '张国强', 'leadership-office': '赵主任', 'contract-admin': '周合同', 'finance-admin': '吴财务', 'sys-admin': '系统管理员', 'leadership-group': '领导小组' };
  return names[roleId] || roleId;
}
function renderTable(columns, rows) {
  const isSimple = columns.length > 0 && typeof columns[0] === 'string';
  const thead = columns.map((c, ci) => {
    if (isSimple) return '<th>' + c + '</th>';
    return '<th class="' + (c.sortable ? 'sortable' : '') + '"' + (c.width ? ' style="width:' + c.width + '"' : '') + '>' + c.label + (c.sortable ? '<span class="sort-icon">↑↓</span>' : '') + '</th>';
  }).join('');
  const tbody = rows.length
    ? rows.map(row => '<tr>' + columns.map((c, ci) => {
        const cell = isSimple
          ? (Array.isArray(row) ? row[ci] : undefined)
          : (c.render ? c.render(row) : row[c.key]);
        return '<td>' + (cell != null ? cell : '—') + '</td>';
      }).join('') + '</tr>').join('')
    : '<tr><td colspan="' + columns.length + '" style="text-align:center;padding:32px;color:var(--text-secondary)">暂无数据</td></tr>';
  return '<table class="data-table"><thead><tr>' + thead + '</tr></thead><tbody>' + tbody + '</tbody></table>';
}
function breadcrumb(...items) {
  return '<div class="breadcrumb">' + items.map((item, i) => i === items.length - 1 ? '<span>' + item + '</span>' : '<a onclick="navigate(\'' + item.toLowerCase() + '\')">' + item + '</a> / ').join('') + '</div>';
}

// V2.1 helpers

function showModal(title, bodyHtml, buttons) {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = '<div class="modal-dialog"><div class="modal-header"><span class="modal-title">' + title + '</span><span class="modal-close" onclick="closeModal()">&times;</span></div><div class="modal-body">' + bodyHtml + '</div><div class="modal-footer">' + (buttons || '<button class="btn" onclick="closeModal()">关闭</button>') + '</div></div>';
  document.body.appendChild(overlay);
  overlay.addEventListener('click', function(e) { if (e.target === overlay) closeModal(); });
}
function closeModal() {
  const overlay = document.querySelector('.modal-overlay');
  if (overlay) overlay.remove();
}

function showReturnDialog(title, onConfirm) {
  const categories = ['材料不完整','内容不符','预算不合理','技术方案问题','其他'];
  let body = '<div class="form-item mb-16"><label class="form-label required">退回原因分类</label><select class="form-control" id="return-category">' + categories.map(c => '<option value="' + c + '">' + c + '</option>').join('') + '</select></div>';
  body += '<div class="form-item mb-16"><label class="form-label required">退回说明</label><textarea class="form-control" id="return-reason" rows="4" placeholder="请详细说明退回原因..."></textarea></div>';
  body += '<div class="form-item"><label class="form-label">退回至</label><input class="form-control" id="return-to" readonly value="上一提交人（系统自动确定）"></div>';
  const buttons = '<button class="btn" onclick="closeModal()">取消</button><button class="btn btn-warning" onclick="confirmReturn()">确认退回</button>';
  showModal(title || '退回审批', body, buttons);
  window._returnCallback = onConfirm;
}
function confirmReturn() {
  const category = document.getElementById('return-category')?.value;
  const reason = document.getElementById('return-reason')?.value;
  if (!reason || !reason.trim()) { toast('请填写退回说明', 'warning'); return; }
  closeModal();
  if (window._returnCallback) window._returnCallback(category, reason);
  delete window._returnCallback;
}

function renderStepWizard(steps, currentStep) {
  let html = '<div class="step-wizard">';
  steps.forEach((step, i) => {
    const state = i < currentStep ? 'done' : i === currentStep ? 'active' : 'pending';
    html += '<div class="sw-step ' + state + '">';
    html += '<div class="sw-number">' + (i < currentStep ? '&#10003;' : (i + 1)) + '</div>';
    html += '<div class="sw-label">' + step + '</div>';
    html += '</div>';
    if (i < steps.length - 1) html += '<div class="sw-line ' + (i < currentStep ? 'done' : '') + '"></div>';
  });
  html += '</div>';
  return html;
}

function notifLevelTag(level) {
  const map = { urgent: ['紧急','tag-red'], warning: ['提醒','tag-orange'], info: ['通知','tag-blue'] };
  const [label, cls] = map[level] || ['通知','tag-blue'];
  return '<span class="tag ' + cls + '">' + label + '</span>';
}
function notifLevelClass(level) {
  return level === 'urgent' ? 'danger' : level === 'warning' ? 'warning' : 'info';
}

function showDrawer(title, bodyHtml) {
  const overlay = document.createElement('div');
  overlay.className = 'drawer-overlay';
  overlay.innerHTML = '<div class="drawer-panel"><div class="drawer-header"><span class="drawer-title">' + title + '</span><span class="drawer-close" onclick="closeDrawer()">&times;</span></div><div class="drawer-body">' + bodyHtml + '</div></div>';
  document.body.appendChild(overlay);
  setTimeout(() => overlay.classList.add('open'), 10);
  overlay.addEventListener('click', function(e) { if (e.target === overlay) closeDrawer(); });
}
function closeDrawer() {
  const overlay = document.querySelector('.drawer-overlay');
  if (overlay) { overlay.classList.remove('open'); setTimeout(() => overlay.remove(), 300); }
}

function detectChangeLevel(originalBudget, newBudget, changeTypes) {
  const ratio = Math.abs(newBudget - originalBudget) / originalBudget * 100;
  const origType = budgetToType(originalBudget).type;
  const newType = budgetToType(newBudget).type;
  if (ratio >= 20 || origType !== newType || (changeTypes && (changeTypes.includes('技术路线根本调整') || changeTypes.includes('建设范围大幅变化')))) return { level: 'major', label: '重大变更', cls: 'danger', ratio: ratio.toFixed(1) };
  if (changeTypes && changeTypes.includes('联系方式')) return { level: 'info', label: '信息变更', cls: 'blue', ratio: ratio.toFixed(1) };
  return { level: 'general', label: '一般变更', cls: 'warning', ratio: ratio.toFixed(1) };
}
