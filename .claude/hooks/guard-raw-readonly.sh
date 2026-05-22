#!/bin/bash
# Hook: PreToolUse(Write|Edit|MultiEdit)
# 作用：阻止对 raw/ 下文件的写入（wiki 规范：raw/ 永远只增不删，只有人工或 git mv 可动）

input=$(cat)

# 提取 file_path
file_path=$(echo "$input" | grep -oE '"file_path"\s*:\s*"[^"]*"' | head -1 | sed 's/.*"file_path"\s*:\s*"\(.*\)"/\1/')

if [ -z "$file_path" ]; then
  exit 0
fi

# 检查是否在 raw/ 目录下（绝对路径或相对路径）
if echo "$file_path" | grep -qE '(^|/)raw/'; then
  echo "❌ 禁止修改 raw/ 目录下的文件。" >&2
  echo "   文件：$file_path" >&2
  echo "   原则：raw/ 是原始资料存档，永远只增不删。" >&2
  echo "   如需调整：" >&2
  echo "     - 过时文件 → 用 git mv 加 -archived 后缀" >&2
  echo "     - 内容变更 → 在 wiki/ 下对应 source 页更新，并在旧 source 页加变更说明" >&2
  exit 2
fi

exit 0
