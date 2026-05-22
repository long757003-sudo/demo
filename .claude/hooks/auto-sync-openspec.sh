#!/bin/bash
# Hook: PostToolUse(Bash)
# 作用：检测到 /opsx:archive 相关操作后，自动 cp 归档文件到 wiki/raw/openspec/
# 这是主目录规范中明确要求的跨仓库同步动作

input=$(cat)
cmd=$(echo "$input" | grep -oE '"command"\s*:\s*"[^"]*"' | head -1 | sed 's/.*"command"\s*:\s*"\(.*\)"/\1/')

# 只处理把文件移入 openspec/changes/archive/ 的命令
# OpenSpec 归档的典型操作是把 changes/[变更名] 移到 changes/archive/[变更名]
if ! echo "$cmd" | grep -qE 'openspec/changes/archive/'; then
  exit 0
fi

# 提取变更名（归档目录下最新的一个）
wiki_dir="../my-project-wiki/raw/openspec"
code_archive="openspec/changes/archive"

if [ ! -d "$code_archive" ]; then
  exit 0
fi

if [ ! -d "$wiki_dir" ]; then
  echo "⚠️ wiki 目录不存在：$wiki_dir，跳过自动同步。" >&2
  exit 0
fi

# 找出归档目录下最新修改的变更
latest_change=$(ls -t "$code_archive" 2>/dev/null | head -1)

if [ -z "$latest_change" ]; then
  exit 0
fi

# 如果 wiki 侧已存在同名，跳过（避免覆盖）
if [ -d "$wiki_dir/$latest_change" ]; then
  echo "ℹ️ wiki 已存在 $latest_change，跳过同步。" 
  exit 0
fi

# 执行同步
cp -r "$code_archive/$latest_change" "$wiki_dir/"

cat <<EOF
✅ 已自动同步 OpenSpec 归档到 wiki：
   源：$code_archive/$latest_change
   目标：$wiki_dir/$latest_change
   
   下一步建议（进入 wiki 仓后执行）：
   /ingest raw/openspec/$latest_change/proposal.md
   /ingest raw/openspec/$latest_change/design.md
   /propagate wiki/sources/[新建的source页]
EOF

exit 0
