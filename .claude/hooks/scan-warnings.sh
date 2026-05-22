#!/bin/bash
# Hook: Stop
# 作用：会话结束前扫一遍 wiki/，列出所有未解决的 ⚠️ 矛盾标记作为提醒
# 只在 wiki 仓库下触发（通过检查 wiki/ 目录是否存在判断）

if [ ! -d "wiki" ]; then
  exit 0
fi

# 扫描 ⚠️ 标记（限制前 10 条，避免刷屏）
warnings=$(grep -rn '⚠️' wiki/ 2>/dev/null | grep -vE '(_audit-|CLAUDE\.md)' | head -10)

if [ -z "$warnings" ]; then
  exit 0
fi

count=$(grep -rn '⚠️' wiki/ 2>/dev/null | grep -vcE '(_audit-|CLAUDE\.md)')

cat <<EOF
📋 wiki 中存在 $count 处未解决的 ⚠️ 矛盾标记（显示前 10 条）：

$warnings

建议执行 /lint 或 /audit 查看完整清单。
EOF

exit 0
