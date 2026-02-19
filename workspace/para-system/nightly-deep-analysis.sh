#!/bin/bash
# 功能: 深度分析+模式提取+主动优化
# 频率: 每周日 3:00
# 输出: 综合分析报告

WORKSPACE="$HOME/.openclaw/workspace"
REPORT_FILE="$WORKSPACE/para-system/nightly-analysis-report-$(date +%Y%m%d).md"

echo "Starting nightly deep analysis..."

# 生成报告
cat > "$REPORT_FILE" << EOF
# 夜间深度分析报告
生成时间: $(date '+%Y-%m-%d %H:%M')

## 1. 本周活动摘要

EOF

# 统计本周日志
WEEKLY_LOGS=$(find "$WORKSPACE/memory" -name "*.md" -mtime -7 2>/dev/null | wc -l)
echo "- 本周日志文件: $WEEKLY_LOGS 个" >> "$REPORT_FILE"

# QMD 状态
echo "" >> "$REPORT_FILE"
echo "## 2. QMD 索引状态" >> "$REPORT_FILE"
qmd status >> "$REPORT_FILE" 2>&1 || echo "QMD not available" >> "$REPORT_FILE"

echo "" >> "$REPORT_FILE"
echo "## 3. 记忆健康检查" >> "$REPORT_FILE"

# 检查 MEMORY.md 大小
MEMORY_SIZE=$(wc -c < "$WORKSPACE/MEMORY.md" 2>/dev/null || echo 0)
echo "- MEMORY.md 大小: $MEMORY_SIZE 字节" >> "$REPORT_FILE"

if [ "$MEMORY_SIZE" -gt 10000 ]; then
  echo "- 警告: MEMORY.md 较大，考虑归档旧内容" >> "$REPORT_FILE"
fi

# 清理旧的临时文件
find "$WORKSPACE/para-system" -name "nightly-analysis-report-*.md" -mtime +30 -delete 2>/dev/null

echo "" >> "$REPORT_FILE"
echo "## 4. 完成项目" >> "$REPORT_FILE"
echo "- 深度分析完成" >> "$REPORT_FILE"

echo "Nightly analysis completed: $REPORT_FILE"
