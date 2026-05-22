#!/bin/bash
# Hook: PreToolUse(Bash)
# 作用：拦截裸 mv 命令，强制用 git mv（主目录 Git 规范）
# 退出码 2 会阻断工具调用并把 stderr 反馈给 Claude

# 读取 Claude 传入的 JSON（包含 tool_input）
input=$(cat)

# 提取要执行的 bash 命令
cmd=$(echo "$input" | grep -oE '"command"\s*:\s*"[^"]*"' | head -1 | sed 's/.*"command"\s*:\s*"\(.*\)"/\1/')

# 检查是否是裸 mv（且不是 git mv）
# 匹配：以 mv 开头，或包含 ` mv ` / `; mv ` / `&& mv ` / `| mv `
if echo "$cmd" | grep -qE '(^|[;&|]\s*|\s&&\s|\s\|\s)mv\s'; then
  # 排除 git mv
  if ! echo "$cmd" | grep -qE 'git\s+mv\s'; then
    echo "❌ 检测到裸 mv 命令。项目规范要求文件重命名/移动使用 git mv 以保留历史。" >&2
    echo "   原命令：$cmd" >&2
    echo "   请改用：git mv <src> <dst>" >&2
    exit 2
  fi
fi

exit 0
