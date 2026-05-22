#!/bin/bash
# Hook: PostToolUse(Write|Edit|MultiEdit)
# 作用：写入文件后，对照 wiki/glossary.md 中登记的"别名"字段
# 如果文件中出现了别名但未使用规范名，提示 Claude 统一
# 这是"软提示"，帮助 Claude 注意术语漂移

input=$(cat)
file_path=$(echo "$input" | grep -oE '"file_path"\s*:\s*"[^"]*"' | head -1 | sed 's/.*"file_path"\s*:\s*"\(.*\)"/\1/')

if [ -z "$file_path" ] || [ ! -f "$file_path" ]; then
  exit 0
fi

# 定位 glossary.md（code 仓和 wiki 仓的相对路径不同）
glossary=""
for candidate in "wiki/glossary.md" "../my-project-wiki/wiki/glossary.md" "./glossary.md"; do
  if [ -f "$candidate" ]; then
    glossary="$candidate"
    break
  fi
done

if [ -z "$glossary" ]; then
  # 没有 glossary 就跳过（glossary 建立是 Phase 2 的事）
  exit 0
fi

# 跳过 glossary 自身和非文本文件
if [ "$(realpath "$file_path" 2>/dev/null)" = "$(realpath "$glossary" 2>/dev/null)" ]; then
  exit 0
fi
if ! echo "$file_path" | grep -qE '\.(md|html|vue|js|ts|jsx|tsx)$'; then
  exit 0
fi

# 从 glossary 提取"别名"条目（格式：`- 别名：xxx`）
# 简化实现：只处理反引号包裹的英文别名和中文引号别名
aliases=$(grep -E '^\s*-\s*别名：' "$glossary" 2>/dev/null | \
          grep -oE '`[^`]+`|"[^"]+"' | \
          tr -d '`"' | sort -u)

if [ -z "$aliases" ]; then
  exit 0
fi

# 检查写入的文件中是否出现这些别名
hits=""
while IFS= read -r alias; do
  [ -z "$alias" ] && continue
  if grep -qF "$alias" "$file_path" 2>/dev/null; then
    # 查找这个别名对应的规范名
    canonical=$(awk -v a="$alias" '
      /^##\s/ { current=$2 }
      /^\s*-\s*别名：/ { if (index($0, a) > 0) print current; exit }
    ' "$glossary")
    hits="$hits\n   - '$alias' → 规范名应为 '$canonical'"
  fi
done <<< "$aliases"

if [ -n "$hits" ]; then
  echo -e "⚠️ 术语漂移检查：$file_path 中出现了 glossary 登记的别名，建议统一为规范名：$hits"
  echo ""
  echo "   可执行 /glossary check $file_path 获取完整报告。"
fi

exit 0
