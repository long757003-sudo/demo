#!/bin/bash
# Hook: PostToolUse(Write|Edit|MultiEdit)
# 作用：修改 .html 文件后提醒 Claude 必须在浏览器中自检（code 侧 TDD 规范）
# 退出码 0 + stdout 提示信息会被注入给 Claude 看到

input=$(cat)
file_path=$(echo "$input" | grep -oE '"file_path"\s*:\s*"[^"]*"' | head -1 | sed 's/.*"file_path"\s*:\s*"\(.*\)"/\1/')

if [ -z "$file_path" ]; then
  exit 0
fi

# 只处理 .html 文件
if ! echo "$file_path" | grep -qE '\.html$'; then
  exit 0
fi

# 转换为绝对路径
abs_path=$(cd "$(dirname "$file_path")" 2>/dev/null && pwd)/$(basename "$file_path")

cat <<EOF
📌 TDD 自检提醒：已修改 HTML 文件。
   路径：$file_path
   根据 code/CLAUDE.md 要求，交付前必须完成浏览器自检：
   
   open -a "Google Chrome" "file://$abs_path"
   
   检查项：
   1. 业务路径自检（点过涉及的所有按钮/入口）
   2. :disabled / v-if / v-show 守护条件
   3. 事件是否真的绑定到修改后的函数
   4. 角色切换、弹窗开合、表单提交
   
   禁止只读代码就交付。交付消息必须包含【改动】【自检结果】【需人工验证】三段。
EOF

exit 0
