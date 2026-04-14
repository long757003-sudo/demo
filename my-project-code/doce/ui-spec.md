# UI 规范 — shadcn/ui 风格

> 本文件由 `/opsx:apply` 执行时读取，定义所有 HTML 页面的视觉和代码规范。

---

## CDN 引入模板

每个 HTML 文件头部必须完整包含以下内容：

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>页面标题 — 项目名</title>

  <!-- Tailwind CSS -->
  <script src="https://cdn.tailwindcss.com"></script>
  <!-- Lucide Icons -->
  <script src="https://unpkg.com/lucide@latest/dist/umd/lucide.min.js"></script>

  <script>
    tailwind.config = {
      theme: {
        extend: {
          colors: {
            border: "hsl(214.3 31.8% 91.4%)",
            input: "hsl(214.3 31.8% 91.4%)",
            ring: "hsl(222.2 84% 4.9%)",
            background: "hsl(0 0% 100%)",
            foreground: "hsl(222.2 84% 4.9%)",
            primary: {
              DEFAULT: "hsl(222.2 47.4% 11.2%)",
              foreground: "hsl(210 40% 98%)",
            },
            secondary: {
              DEFAULT: "hsl(210 40% 96.1%)",
              foreground: "hsl(222.2 47.4% 11.2%)",
            },
            muted: {
              DEFAULT: "hsl(210 40% 96.1%)",
              foreground: "hsl(215.4 16.3% 46.9%)",
            },
            accent: {
              DEFAULT: "hsl(210 40% 96.1%)",
              foreground: "hsl(222.2 47.4% 11.2%)",
            },
          },
          borderRadius: {
            lg: "0.5rem",
            md: "calc(0.5rem - 2px)",
            sm: "calc(0.5rem - 4px)",
          },
        },
      },
    }
  </script>

  <style>
    * { border-color: hsl(214.3 31.8% 91.4%); }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
  </style>
</head>
```

---

## 页面整体布局

所有页面统一使用左侧菜单 + 右侧内容区布局：

```html
<body class="bg-background text-foreground">
  <div class="flex h-screen overflow-hidden">

    <!-- 左侧菜单 -->
    <aside class="w-60 border-r bg-white flex flex-col shrink-0">
      <!-- 项目名 -->
      <div class="h-14 flex items-center px-4 border-b font-semibold text-sm">
        项目名称
      </div>
      <!-- 菜单项 -->
      <nav class="flex-1 p-2 space-y-0.5 overflow-y-auto">
        <a href="index.html"
          class="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-colors">
          <i data-lucide="layout-dashboard" class="w-4 h-4"></i>
          首页
        </a>
        <!-- 当前页菜单项加 active 样式 -->
        <a href="pages/xxx.html"
          class="flex items-center gap-2 px-3 py-2 rounded-md text-sm bg-accent text-foreground font-medium">
          <i data-lucide="file-text" class="w-4 h-4"></i>
          当前页名称
        </a>
      </nav>
    </aside>

    <!-- 右侧主区域 -->
    <div class="flex-1 flex flex-col overflow-hidden">
      <!-- 顶部栏 -->
      <header class="h-14 border-b flex items-center justify-between px-6 bg-white shrink-0">
        <h1 class="text-sm font-semibold">页面标题</h1>
        <div class="flex items-center gap-2 text-sm text-muted-foreground">
          <i data-lucide="user" class="w-4 h-4"></i>
          张三
        </div>
      </header>
      <!-- 内容区 -->
      <main class="flex-1 overflow-y-auto p-6 bg-muted/30">
        <!-- 页面内容放这里 -->
      </main>
    </div>

  </div>
  <script>lucide.createIcons();</script>
</body>
```

---

## 常用组件

### 按钮
```html
<!-- Primary 主按钮 -->
<button class="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
  <i data-lucide="plus" class="w-4 h-4"></i>
  新建
</button>

<!-- Secondary 次按钮 -->
<button class="inline-flex items-center gap-1.5 rounded-md border bg-background px-3 py-2 text-sm font-medium hover:bg-accent transition-colors">
  导出
</button>

<!-- Destructive 危险按钮 -->
<button class="inline-flex items-center gap-1.5 rounded-md bg-red-500 px-3 py-2 text-sm font-medium text-white hover:bg-red-600 transition-colors">
  删除
</button>
```

### 卡片
```html
<div class="rounded-lg border bg-white p-6 shadow-sm">
  <div class="flex items-center justify-between mb-1">
    <span class="text-sm text-muted-foreground">标题</span>
    <i data-lucide="trending-up" class="w-4 h-4 text-muted-foreground"></i>
  </div>
  <div class="text-2xl font-bold">128</div>
  <p class="text-xs text-muted-foreground mt-1">较上月 +12%</p>
</div>
```

### 表格
```html
<div class="rounded-lg border bg-white overflow-hidden">
  <table class="w-full text-sm">
    <thead class="bg-muted/50 border-b">
      <tr>
        <th class="px-4 py-3 text-left font-medium text-muted-foreground">列名</th>
        <th class="px-4 py-3 text-left font-medium text-muted-foreground">状态</th>
        <th class="px-4 py-3 text-left font-medium text-muted-foreground">操作</th>
      </tr>
    </thead>
    <tbody class="divide-y">
      <tr class="hover:bg-muted/30 transition-colors">
        <td class="px-4 py-3">内容</td>
        <td class="px-4 py-3"><!-- Badge 放这里 --></td>
        <td class="px-4 py-3">
          <button class="text-sm text-primary hover:underline">查看</button>
        </td>
      </tr>
    </tbody>
  </table>
</div>
```

### 输入框与搜索
```html
<!-- 普通输入框 -->
<input type="text" placeholder="请输入..."
  class="flex h-9 w-full rounded-md border bg-background px-3 py-1 text-sm shadow-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring transition-colors">

<!-- 带图标的搜索框 -->
<div class="relative">
  <i data-lucide="search" class="absolute left-2.5 top-2.5 w-4 h-4 text-muted-foreground"></i>
  <input type="text" placeholder="搜索..."
    class="flex h-9 w-64 rounded-md border bg-background pl-8 pr-3 text-sm shadow-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring">
</div>
```

### 下拉选择
```html
<select class="flex h-9 rounded-md border bg-background px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring">
  <option value="">全部状态</option>
  <option value="pending">待审批</option>
  <option value="approved">已通过</option>
</select>
```

### 状态 Badge
```html
<!-- 根据 config.yaml 中 status_colors 的约定 -->
<span class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-gray-100 text-gray-600">草稿</span>
<span class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-yellow-100 text-yellow-700">待审批</span>
<span class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-green-100 text-green-700">已通过</span>
<span class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-red-100 text-red-700">已拒绝</span>
<span class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-slate-100 text-slate-600">已关闭</span>
```

### 模态弹窗（操作反馈）
```html
<!-- 操作成功提示，用 JS 控制显示/隐藏 -->
<div id="toast"
  class="fixed bottom-4 right-4 hidden items-center gap-2 rounded-lg border bg-white px-4 py-3 shadow-lg text-sm">
  <i data-lucide="check-circle" class="w-4 h-4 text-green-500"></i>
  <span id="toast-msg">操作成功</span>
</div>

<script>
function showToast(msg) {
  const el = document.getElementById('toast');
  document.getElementById('toast-msg').textContent = msg;
  el.classList.remove('hidden');
  el.classList.add('flex');
  setTimeout(() => {
    el.classList.add('hidden');
    el.classList.remove('flex');
  }, 2000);
}
</script>
```

---

## 编码禁止事项
- 禁止使用内联 `style=""` 属性，所有样式通过 Tailwind 类实现
- 禁止使用 `npm`、`import`、`require`，所有依赖通过 CDN 引入
- 禁止调用任何真实接口，所有数据在 HTML 内用 JS 定义
- 禁止使用 `<form>` 表单提交，用 `button + onclick` 模拟操作并调用 `showToast()`
