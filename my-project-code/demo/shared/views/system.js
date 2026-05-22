// shared/views/system.js  —  V2.1

/* ====== 用户与权限管理 ====== */
registerView('user-permissions', function() {

  var allRoleOptions = [
    { value: '',                  label: '全部角色' },
    { value: 'project-manager',   label: '项目负责人' },
    { value: 'project-assistant', label: '项目协助人' },
    { value: 'info-admin',        label: '信息办管理员' },
    { value: 'info-leader',       label: '信息办领导' },
    { value: 'leadership-office',     label: '领导小组办公室' },
    { value: 'leadership-group',    label: '数智化建设领导小组' },
    { value: 'unit-leader',       label: '用户单位分管领导' },
    { value: 'unit-admin',     label: '用户单位系统管理员' },
    { value: 'expert',            label: '专家委员会' },
    { value: 'finance-admin',     label: '财务管理员' },
    { value: 'contract-admin',    label: '合同管理员' },
    { value: 'sys-admin',         label: '系统管理员' },
  ];

  var roleSelectHtml = allRoleOptions.map(function(o) {
    return '<option value="' + o.value + '">' + o.label + '</option>';
  }).join('');

  var users = (DATA.users || []).slice();

  // Add demo entries for extra roles not in DATA.users
  var extraDemoUsers = [
    { id: 'U009', name: '陈副处长', dept: '学生处',   role: 'unit-leader',       roleLabel: '单位分管领导',    status: '正常', lastLogin: '2025-11-01 10:00' },
    { id: 'U010', name: '刘管理员', dept: '教务处',   role: 'unit-admin',     roleLabel: '单位系统管理员',  status: '正常', lastLogin: '2025-11-02 09:30' },
    { id: 'U011', name: '张国强',   dept: '计算机学院', role: 'expert',           roleLabel: '专家委员会',      status: '正常', lastLogin: '2025-10-28 14:00' },
    { id: 'U012', name: '王助理',   dept: '教务处',   role: 'project-assistant', roleLabel: '项目协助人',      status: '正常', lastLogin: '2025-11-07 11:00' },
    { id: 'U013', name: '领导小组', dept: '领导小组', role: 'leadership-group',    roleLabel: '领导小组',        status: '正常', lastLogin: '2025-10-30 09:00' },
  ];
  var allUsers = users.concat(extraDemoUsers);

  var container = document.createElement('div');
  container.innerHTML = '<div class="breadcrumb">首页 / 系统管理 / <span>用户与权限</span></div>'
    + '<div class="page-header">'
    +   '<div class="page-title">用户与权限管理</div>'
    +   '<button id="btn-add-user" class="btn btn-primary">+ 新增用户</button>'
    + '</div>'
    + '<div class="card" style="margin-bottom:0">'
    +   '<div style="display:flex;gap:8px;margin-bottom:16px;flex-wrap:wrap;align-items:center">'
    +     '<input id="um-search" type="text" placeholder="搜索姓名 / 部门"'
    +       ' class="form-control" style="width:200px">'
    +     '<select id="um-role" class="form-control" style="min-width:160px">'
    +       roleSelectHtml
    +     '</select>'
    +     '<button id="btn-um-query" class="btn btn-primary">查询</button>'
    +     '<button id="btn-um-reset" class="btn">重置</button>'
    +   '</div>'
    +   '<div id="um-table-container"></div>'
    + '</div>';

  function roleTag(roleId, roleLabel) {
    var cls = {
      'sys-admin': 'tag-red', 'info-admin': 'tag-blue', 'info-leader': 'tag-blue',
      'leadership-office': 'tag-purple', 'leadership-group': 'tag-purple',
      'project-manager': 'tag-green', 'project-assistant': 'tag-cyan',
      'unit-leader': 'tag-orange', 'unit-admin': 'tag-orange',
      'expert': 'tag-teal', 'finance-admin': 'tag-gray', 'contract-admin': 'tag-gray',
    };
    return '<span class="tag ' + (cls[roleId] || 'tag-gray') + '">' + (roleLabel || roleId) + '</span>';
  }

  function renderUserTable(list) {
    var cols = ['姓名', '部门', '角色', '状态', '最后登录', '操作'];
    var rows = list.map(function(u) {
      var rTag = roleTag(u.role, u.roleLabel);
      var statusTag = u.status === '正常'
        ? '<span class="tag tag-success">正常</span>'
        : '<span class="tag tag-danger">' + (u.status || '停用') + '</span>';
      var ops = '<a href="#" class="link-action um-edit" data-id="' + u.id + '" data-name="' + u.name + '">编辑</a>'
        + ' | <a href="#" class="link-action um-disable" data-id="' + u.id + '" data-name="' + u.name + '" style="color:var(--danger)">停用</a>';
      return [u.name, u.dept, rTag, statusTag, u.lastLogin || '—', ops];
    });
    container.querySelector('#um-table-container').innerHTML = renderTable(cols, rows)
      + '<div class="table-pagination"><span>共 ' + list.length + ' 名用户</span></div>';
  }

  renderUserTable(allUsers);

  container.querySelector('#btn-add-user').addEventListener('click', function() {
    toast('新增用户功能在实际系统中可用，Demo 模式仅展示界面。', 'info');
  });

  function doQuery() {
    var keyword = container.querySelector('#um-search').value.trim().toLowerCase();
    var roleVal = container.querySelector('#um-role').value;
    var result  = allUsers.filter(function(u) {
      var matchKeyword = !keyword
        || u.name.toLowerCase().indexOf(keyword) !== -1
        || u.dept.toLowerCase().indexOf(keyword) !== -1;
      var matchRole = !roleVal || u.role === roleVal;
      return matchKeyword && matchRole;
    });
    renderUserTable(result);
    if (result.length === 0) toast('未找到符合条件的用户', 'warning');
  }

  container.querySelector('#btn-um-query').addEventListener('click', doQuery);
  container.querySelector('#um-search').addEventListener('keydown', function(e) { if (e.key === 'Enter') doQuery(); });

  container.querySelector('#btn-um-reset').addEventListener('click', function() {
    container.querySelector('#um-search').value = '';
    container.querySelector('#um-role').value = '';
    renderUserTable(allUsers);
  });

  container.addEventListener('click', function(e) {
    var editEl    = e.target.closest('.um-edit');
    var disableEl = e.target.closest('.um-disable');
    if (editEl) {
      e.preventDefault();
      toast('编辑用户「' + editEl.dataset.name + '」— Demo 模式不可保存修改。', 'info');
    } else if (disableEl) {
      e.preventDefault();
      if (confirm('确认要停用用户「' + disableEl.dataset.name + '」吗？')) {
        toast('用户「' + disableEl.dataset.name + '」已被停用（Demo 模式，仅演示）。', 'warning');
      }
    }
  });

  return container;
});


/* ====== 流程配置 ====== */
registerView('flow-config', function() {

  var templates = DATA.workflowTemplates || [];

  // ── Template cards ──────────────────────────────────────────────────────────
  var templateCardsHtml = templates.map(function(tpl) {
    var defaultBadge = tpl.isDefault
      ? '<span class="tag tag-green" style="margin-left:8px">默认</span>'
      : '';
    return '<div style="background:#fff;border:1px solid #e8e8e8;border-radius:6px;padding:16px 20px;margin-bottom:10px;display:flex;align-items:center;justify-content:space-between">'
      +   '<div>'
      +     '<span style="font-size:14px;font-weight:600">' + tpl.name + '</span>'
      +     defaultBadge
      +     '<div style="font-size:12px;color:var(--text-secondary);margin-top:4px">' + tpl.description + '</div>'
      +   '</div>'
      +   '<div style="display:flex;gap:8px">'
      +     '<button class="btn btn-sm" onclick="toast(\'演示模式：编辑流程模板「' + tpl.name + '」\',\'info\')">编辑</button>'
      +     (!tpl.isDefault
             ? '<button class="btn btn-sm btn-danger-outline" onclick="toast(\'演示模式：删除模板「' + tpl.name + '」\',\'warning\')">删除</button>'
             : '<button class="btn btn-sm" disabled style="color:#d9d9d9;cursor:not-allowed">删除</button>')
      +   '</div>'
      + '</div>';
  }).join('');

  // ── Flow diagram for the default template ─────────────────────────────────
  function flowNode(name, action, roleStr, color) {
    color = color || '#18181b';
    return '<div style="display:flex;flex-direction:column;align-items:center;min-width:110px;text-align:center">'
      +   '<div style="background:' + color + ';color:#fff;border-radius:4px;padding:7px 10px;font-size:12px;width:108px;line-height:1.4">' + name + '</div>'
      +   '<div style="font-size:11px;color:#666;margin-top:3px">' + action + '</div>'
      +   '<div style="font-size:10px;color:#aaa;margin-top:1px">' + roleStr + '</div>'
      + '</div>';
  }

  function arrow() {
    return '<div style="font-size:18px;color:#d9d9d9;padding:0 6px;margin-top:10px;align-self:flex-start;padding-top:12px">→</div>';
  }

  function flowRow(nodes) {
    return nodes.map(function(n, i) {
      return (i > 0 ? arrow() : '') + flowNode(n[0], n[1], n[2], n[3]);
    }).join('');
  }

  var phaseColors = { '需求管理': '#3f3f46', '立项管理': '#18181b', '采购管理': '#52525b', '验收管理': '#71717a' };

  var phases = [
    {
      title: '需求管理',
      nodes: [
        ['项目负责人填报', '填写需求申请', '项目负责人', '#3f3f46'],
        ['单位排序审核',   '排序审核确认', '单位系统管理员', '#3f3f46'],
        ['信息办遴选',     '需求遴选决策', '信息办领导', '#3f3f46'],
      ],
    },
    {
      title: '立项管理',
      nodes: [
        ['填报申报书',   '填写立项申报', '项目负责人', '#18181b'],
        ['信息办初审',   '初步审核',     '信息办管理员', '#18181b'],
        ['专家论证',     '专家评审论证', '评审专家', '#52525b'],
        ['领导审定',     '审定批准',     '领导小组/办公室', '#52525b'],
        ['下达立项通知', '发出立项通知', '信息办管理员', '#18181b'],
      ],
    },
    {
      title: '采购管理',
      nodes: [
        ['采购调研填报', '填写调研报告', '项目负责人',   '#52525b'],
        ['技术方案审核', '审核技术方案', '信息办管理员', '#52525b'],
        ['合同备案',     '合同登记备案', '合同管理员',   '#52525b'],
      ],
    },
    {
      title: '验收管理',
      nodes: [
        ['内部初验',     '内部预验收',   '项目负责人',   '#71717a'],
        ['正式验收组织', '正式验收审核', '信息办领导',   '#71717a'],
        ['专家综合评分', '填写验收意见', '评审专家',     '#52525b'],
      ],
    },
  ];

  var diagramHtml = phases.map(function(phase) {
    return '<div style="background:#fff;border:1px solid #e8e8e8;border-radius:6px;padding:20px;margin-bottom:14px">'
      +   '<div style="font-size:14px;font-weight:600;color:' + (phaseColors[phase.title] || '#333') + ';margin-bottom:14px;display:flex;align-items:center;gap:6px">'
      +     '<span style="display:inline-block;width:4px;height:14px;background:' + (phaseColors[phase.title] || '#333') + ';border-radius:2px"></span>'
      +     phase.title
      +   '</div>'
      +   '<div style="display:flex;align-items:flex-start;flex-wrap:wrap;gap:4px">'
      +     flowRow(phase.nodes)
      +   '</div>'
      + '</div>';
  }).join('');

  var html = '<div class="breadcrumb">首页 / 系统管理 / <span>流程配置</span></div>'
    + '<div class="page-header">'
    +   '<div class="page-title">流程模板配置</div>'
    +   '<button class="btn btn-primary" onclick="toast(\'演示模式：新建流程模板功能待接入表单\',\'info\')">+ 新建模板</button>'
    + '</div>'

    + '<div class="card" style="margin-bottom:16px">'
    +   '<div class="card-title">流程模板列表'
    +     '<span style="font-size:12px;color:var(--text-secondary);font-weight:400;margin-left:8px">征集方案「管理模板」步骤可跳转至此页面</span>'
    +   '</div>'
    +   templateCardsHtml
    + '</div>'

    + '<div class="card">'
    +   '<div class="card-title">默认模板流程图 — 标准项目流程</div>'
    +   '<div class="alert alert-info" style="margin-bottom:16px;font-size:12px">'
    +     '以下为当前默认模板的流程节点可视化，实际系统中支持拖拽调整节点顺序与审批人配置。'
    +   '</div>'
    +   diagramHtml
    + '</div>'

    + '<div style="margin-top:8px;padding:12px 16px;background:#fffbe6;border:1px solid #ffe58f;border-radius:4px;font-size:13px;color:#ad6800">'
    +   '<span class="inline-notice lock">已锁定</span> Demo 模式仅展示流程配置，实际系统中流程节点、审批人、超时规则均可在此页面配置。'
    + '</div>';

  var container = document.createElement('div');
  container.innerHTML = html;
  return container;
});
