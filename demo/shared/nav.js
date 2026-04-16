// shared/nav.js — V2.1 menu structure
// Issue F 立项论证访问说明：
// - leadership-office (领导小组办公室): RW 权限，可在列表页查看待审定项目并批量审定
// - unit-leader (单位分管领导): 不在导航菜单中显示，通过工作台待办跳转至 #13 审批视图
// - leadership-group (领导小组): 不在导航菜单中显示，通过工作台待办跳转至 #13 审定视图（重大项目）
const NAV_GROUPS = [
  { label: '首页', items: [
    { id: 'dashboard', label: '工作台首页', icon: 'layout-dashboard', roles: [] }
  ]},
  { label: '通知管理', items: [
    { id: 'notification-list', label: '通知列表', icon: 'bell', roles: [] },
    { id: 'notification-create', label: '新建/编辑通知', icon: 'bell-plus', roles: ['info-admin','info-leader'] },
    { id: 'notification-template', label: '通知模板', icon: 'file-text', roles: ['info-admin','info-leader'] },
  ]},
  { label: '需求管理', items: [
    { id: 'demand-collect', label: '需求征集', icon: 'inbox', roles: ['info-admin','info-leader','unit-admin'] },
    { id: 'demand-list', label: '需求管理', icon: 'list-checks', roles: ['info-admin','info-leader','unit-leader','unit-admin','project-manager','project-assistant'] },
    { id: 'demand-sort', label: '需求排序', icon: 'arrow-up-down', roles: ['unit-admin'] },
    { id: 'demand-approve', label: '需求审批', icon: 'check-circle', roles: ['unit-leader'] },
    { id: 'demand-select', label: '需求遴选', icon: 'filter', roles: ['info-admin','info-leader'] },
  ]},
  { label: '项目管理', items: [
    { id: 'proposal-list', label: '立项管理', icon: 'file-check', roles: ['info-admin','info-leader','leadership-office','project-manager','project-assistant','unit-admin'] },
    { id: 'project-list', label: '项目列表', icon: 'folder-open', roles: [] },
    { id: 'procurement', label: '采购管理', icon: 'shopping-cart', roles: ['project-manager','project-assistant','info-leader','info-admin','contract-admin'] },
    { id: 'implement', label: '实施进展', icon: 'activity', roles: ['project-manager','project-assistant','info-leader','info-admin'] },
    { id: 'delay-change', label: '延期/变更', icon: 'clock', roles: ['project-manager','info-leader','info-admin'] },
    { id: 'terminate', label: '项目终止', icon: 'x-circle', roles: ['project-manager','info-leader','leadership-office'] },
  ]},
  { label: '专家管理', items: [
    { id: 'expert-pool', label: '专家库', icon: 'users', roles: ['info-admin','info-leader'] },
    { id: 'expert-blacklist', label: '专家黑名单', icon: 'user-x', roles: ['info-admin','info-leader'] },
    { id: 'expert-invitations', label: '专家邀请记录', icon: 'mail', roles: ['info-admin','info-leader'] },
  ]},
  { label: '评审管理', items: [
    { id: 'review-list', label: '评审列表', icon: 'clipboard-list', roles: ['info-admin','info-leader','leadership-office'] },
    { id: 'review-launch', label: '创建评审任务', icon: 'plus-circle', roles: ['info-admin'] },
    // expert-confirm: 仅通过工作台待办跳转，不在菜单展示
    { id: 'my-reviews', label: '我的评审任务', icon: 'clipboard-check', roles: ['expert'] },
    { id: 'expert-respond', label: '评审邀请响应', icon: 'message-square', roles: ['expert'] },
  ]},
  { label: '运维管理', items: [
    { id: 'acceptance-list', label: '验收管理', icon: 'badge-check', roles: [] },
    { id: 'ops-records', label: '运维记录', icon: 'wrench', roles: ['project-manager','project-assistant','info-leader'] },
    { id: 'fault-tickets', label: '故障工单', icon: 'alert-triangle', roles: ['project-manager','project-assistant','info-leader','info-admin'] },
    { id: 'system-usage', label: '系统使用情况', icon: 'bar-chart-2', roles: ['info-leader','leadership-office','leadership-group'] },
    { id: 'contract-ledger', label: '合同台账', icon: 'book-open', roles: ['contract-admin','info-leader','info-admin'] },
    { id: 'finance-overview', label: '经费管理', icon: 'wallet', roles: ['finance-admin','info-leader'] },
  ]},
  { label: '系统管理', items: [
    { id: 'user-permissions', label: '用户与权限', icon: 'shield', roles: ['sys-admin'] },
    { id: 'flow-config', label: '流程配置', icon: 'git-branch', roles: ['sys-admin'] },
    { id: 'audit-log', label: '操作日志', icon: 'scroll-text', roles: ['sys-admin','info-leader'] },
    { id: 'tag-library', label: '标签库', icon: 'tags', roles: ['info-admin','unit-admin'] },
  ]},
];

function renderNav() {
  const role = getCurrentRole();
  const sidebar = document.getElementById('sidebar');
  if (!sidebar) return;
  let html = '';
  for (const group of NAV_GROUPS) {
    const visibleItems = group.items.filter(item => item.roles.length === 0 || item.roles.includes(role));
    if (!visibleItems.length) continue;
    html += '<div class="nav-group-label">' + group.label + '</div>';
    for (const item of visibleItems) {
      html += '<a class="nav-item" id="nav-' + item.id + '" onclick="navigate(\'' + item.id + '\')">' +
      '<i data-lucide="' + item.icon + '"></i>' + item.label + '</a>';
    }
  }
  sidebar.innerHTML = html;
  if (window.lucide) lucide.createIcons();
  highlightNav(getCurrentView());
}

function highlightNav(viewId) {
  document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
  const active = document.getElementById('nav-' + viewId);
  if (active) active.classList.add('active');
  // Also highlight parent for sub-views
  const parentMap = {
    'demand-fill': 'demand-list', 'demand-assign': 'demand-list',
    'demand-detail': 'demand-collect', 'collection-detail': 'demand-collect',
    'proposal-fill': 'proposal-list', 'proposal-approve': 'proposal-list', 'approval-notice': 'proposal-list',
    'preliminary-review': 'proposal-list',
    'self-review': 'proposal-list', 'info-confirm': 'proposal-list',
    'project-detail': 'project-list', 'project-change': 'delay-change',
    'notification-detail': (function() {
      try { var p = JSON.parse(localStorage.getItem('viewParams_notification-detail') || '{}'); return p.source === 'demand-collect' ? 'demand-collect' : 'notification-list'; } catch(e) { return 'notification-list'; }
    })(),
    'notification-template': 'notification-template',
    'notification-template-create': 'notification-template',
    'notification-template-edit':   'notification-template',
    'review-opinion': 'my-reviews',
    'expert-respond': 'my-reviews',
    'expert-confirm': 'review-list',
    'internal-check': 'acceptance-list', 'formal-acceptance': 'acceptance-list',
    'log-detail': 'audit-log',
  };
  if (!active && parentMap[viewId]) {
    const parent = document.getElementById('nav-' + parentMap[viewId]);
    if (parent) parent.classList.add('active');
  }
}
