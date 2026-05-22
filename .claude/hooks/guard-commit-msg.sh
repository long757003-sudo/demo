#!/bin/bash
# Hook: PreToolUse(Bash)
# 作用：检查 git commit -m 的 message 是否符合 "类型: 描述" 格式
# 允许类型：feat / fix / docs / refactor / chore

input=$(cat)
cmd=$(echo "$input" | grep -oE '"command"\s*:\s*"[^"]*"' | head -1 | sed 's/.*"command"\s*:\s*"\(.*\)"/\1/')

# 只处理 git commit -m 命令
if ! echo "$cmd" | grep -qE 'git\s+commit.*-m\s'; then
  exit 0
fi

# 提取 -m 后面的 message（简单匹配，不覆盖所有 shell 转义场景）
msg=$(echo "$cmd" | sed -nE 's/.*-m\s+[\"'"'"']([^\"'"'"']*)[\"'"'"'].*/\1/p')

if [ -z "$msg" ]; then
  exit 0
fi

# 校验格式：^(feat|fix|docs|refactor|chore):\s+.+
if ! echo "$msg" | grep -qE '^(feat|fix|docs|refactor|chore):\s+.+'; then
  echo "❌ commit message 不符合规范。" >&2
  echo "   当前：$msg" >&2
  echo "   格式：类型: 简短描述" >&2
  echo "   类型：feat / fix / docs / refactor / chore" >&2
  echo "   示例：feat: 新增专家评审页面" >&2
  exit 2
fi

exit 0
