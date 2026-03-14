#!/bin/bash
# 功能: LLM智能提取关键记忆，更新MEMORY.md
# 频率: 每6小时
# 输出: ~/.openclaw/workspace/MEMORY.md

WORKSPACE="$HOME/.openclaw/workspace"
MEMORY_FILE="$WORKSPACE/MEMORY.md"
OLLAMA_URL="http://127.0.0.1:11434/api/generate"
MODEL="qwen3:latest"

# 读取今日日志
TODAY=$(date +%Y-%m-%d)
DAILY_LOG="$WORKSPACE/memory/$TODAY.md"

# 如果日志不存在，创建它
if [ ! -f "$DAILY_LOG" ]; then
  echo "# $TODAY" > "$DAILY_LOG"
fi

RECENT_CONTENT=$(tail -150 "$DAILY_LOG" 2>/dev/null | grep -v "^#" | grep -v "^$" | tr -d '\n' | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')

# 内容太少则跳过
if [ -z "$RECENT_CONTENT" ] || [ ${#RECENT_CONTENT} -lt 50 ]; then
  echo "No significant content to process (少于50字符), skipping checkpoint"
  exit 0
fi

# 构建提示词
PROMPT="从以下日志中提取关键信息:
1. 今日成就
2. 学习收获
3. 重要决策
4. 遇到的挑战

日志:
$RECENT_CONTENT"

# 调用LLM (使用 printf 转义 JSON)
RESPONSE=$(printf '%s' "$PROMPT" | curl -s "$OLLAMA_URL" \
  -H "Content-Type: application/json" \
  -d "{\"model\":\"$MODEL\",\"prompt\":$(printf '%s' "$PROMPT" | jq -Rs .),\"stream\":false}" 2>/dev/null || echo '{"response": ""}')

SUMMARY=$(echo "$RESPONSE" | jq -r '.response // ""' 2>/dev/null || echo "")

# 更新MEMORY.md (僅當有內容時)
if [ -n "$SUMMARY" ]; then
  cat >> "$MEMORY_FILE" << EOF

## 检查点 $(date '+%Y-%m-%d %H:%M')

$SUMMARY

---
EOF
  echo "Checkpoint updated at $(date)"
else
  echo "No summary generated - skipped writing to MEMORY.md"
fi
