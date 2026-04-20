#!/bin/bash
# Hook: Stop
# 作用：Claude 结束回复前，检查"本轮"是否修改过 .html/.vue/.js 等代码文件
#       如果本轮改过，最后的回复必须包含【改动】【自检结果】【需人工验证】三段
# 范围：只检查"当前轮"（自上一条 user 消息之后），不是整个会话历史
#       避免"改过代码 → 之后每次 Stop 都要三段"的死循环

input=$(cat)

# 读取 transcript 路径（Stop 事件会提供）
transcript=$(echo "$input" | grep -oE '"transcript_path"\s*:\s*"[^"]*"' | head -1 | sed 's/.*"transcript_path"\s*:\s*"\(.*\)"/\1/')

if [ -z "$transcript" ] || [ ! -f "$transcript" ]; then
  exit 0
fi

# 找到最后一条"真实 user 消息"的行号
# Claude Code transcript 里 tool_result 也是 "type":"user"（含 tool_use_id），
# 真实用户输入是 "type":"user" 且不含 tool_use_id
last_user_line=$(grep -n '"type":"user"' "$transcript" | grep -v 'tool_use_id' | tail -1 | cut -d: -f1)

if [ -z "$last_user_line" ]; then
  # 还没有 user 消息（不太可能），跳过
  exit 0
fi

# 取"最后一条 user 消息之后"的事件
events_since=$(tail -n +"$((last_user_line + 1))" "$transcript")

# 判定"本轮"是否用 Write/Edit/MultiEdit 改过代码文件
code_modified=$(echo "$events_since" | grep -E '"(Write|Edit|MultiEdit)"' | grep -cE '\.(html|vue|js|ts|jsx|tsx|css)"')

if [ "$code_modified" -eq 0 ]; then
  # 本轮没改代码文件（可能是纯文档、纯对话、或纯 Bash），不检查
  exit 0
fi

# 用户显式说"不用验证/先改/跳过自检" → 豁免（对齐 code/CLAUDE.md 例外场景）
last_user_msg=$(sed -n "${last_user_line}p" "$transcript")
if echo "$last_user_msg" | grep -qE '(不用验证|先改|跳过自检|skip selfcheck|no selfcheck)'; then
  exit 0
fi

# 获取最后一条 assistant 消息（同样过滤：type:assistant 且不是 tool_use 纯调用）
last_msg=$(grep '"type":"assistant"' "$transcript" | tail -1)

# 检查是否包含三段结构
has_change=$(echo "$last_msg" | grep -c '【改动】')
has_check=$(echo "$last_msg" | grep -c '【自检结果】')
has_manual=$(echo "$last_msg" | grep -c '【需人工验证】')

if [ "$has_change" -eq 0 ] || [ "$has_check" -eq 0 ] || [ "$has_manual" -eq 0 ]; then
  # 提示输出到 stderr（Claude Code stop hook 的 blocking 反馈读 stderr）
  cat >&2 <<EOF
⚠️ 交付规范检查：本轮修改了代码文件，但最终回复缺少必需的交付结构。
   根据 code/CLAUDE.md TDD Step 4 要求，交付消息必须包含：

   【改动】<一句话说清楚改了什么>
   【自检结果】
     ✅ <断言> — 实测：<现象>
     ⚠️ <未通过项 / 风险>
   【需人工验证】
     - <路径>

   若本轮不是完整交付、只是中间步骤，可继续工作；否则请补三段。
   显式豁免关键词："不用验证" / "先改" / "跳过自检"（写在用户消息里）。
EOF
  # 退出码 2 阻止 Stop，让 Claude 继续补全
  exit 2
fi

exit 0
