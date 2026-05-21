#!/bin/bash
# Hook: PostToolUse(Write)
# 作用：新建 wiki/ 下的 .md 文件时，检查是否有合规的 YAML frontmatter
# glossary.md / index.md / overview.md / log.md / _audit-*.md 例外

input=$(cat)
file_path=$(echo "$input" | grep -oE '"file_path"\s*:\s*"[^"]*"' | head -1 | sed 's/.*"file_path"\s*:\s*"\(.*\)"/\1/')

if [ -z "$file_path" ]; then
  exit 0
fi

# 只检查 wiki/ 下的 .md，排除 raw/ 和特例文件
if ! echo "$file_path" | grep -qE '(^|/)wiki/.*\.md$'; then
  exit 0
fi

# 例外文件
basename=$(basename "$file_path")
case "$basename" in
  glossary.md|index.md|overview.md|log.md)
    exit 0 ;;
esac
if echo "$basename" | grep -qE '^_audit-'; then
  exit 0
fi

if [ ! -f "$file_path" ]; then
  exit 0
fi

# 检查是否以 --- 开头且有 type 字段
first_line=$(head -1 "$file_path")
has_type=$(head -20 "$file_path" | grep -cE '^type:\s*(entity|concept|source|decision|synthesis)\s*$')
has_title=$(head -20 "$file_path" | grep -cE '^title:\s*.+')

if [ "$first_line" != "---" ] || [ "$has_type" -eq 0 ] || [ "$has_title" -eq 0 ]; then
  cat <<EOF >&2
❌ wiki 页面缺少合规的 frontmatter。
   文件：$file_path
   
   必需的 frontmatter 格式：
   ---
   title: 页面标题
   type: entity | concept | source | decision | synthesis
   created: YYYY-MM-DD
   updated: YYYY-MM-DD
   sources: [raw/docs/xxx.md]
   openspec_change: ""
   tags: []
   ---
   
   type 判定规则见 wiki/CLAUDE.md "页面类型判定规则"。
EOF
  exit 2
fi

exit 0
