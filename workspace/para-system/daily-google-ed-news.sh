#!/bin/bash
# 功能: 每日自動蒐集 Google Education 新聞並發布到 Google Site
# 頻率: 每日 12:00 和 18:00

SEARCH_KEYWORDS="Google Education Google Classroom"
SITE_URL="https://sites.google.com/view/hsiehpanggi"
OUTPUT_FILE="$HOME/.openclaw/workspace/memory/daily-news-$(date +%Y-%m-%d).md"

echo "=== $(date) ===" > "$OUTPUT_FILE"
echo "# 每日 Google Education 新聞 - $(date +%Y-%m-%d)" >> "$OUTPUT_FILE" 
echo "" >> "$OUTPUT_FILE"

# 搜尋函數
search_news() {
    local keyword="$1"
    echo "## $keyword 新聞" >> "$OUTPUT_FILE"
    echo "" >> "$OUTPUT_FILE"
    
    # 這裡用 OpenClaw 的 browser 工具來搜尋
    # 實際執行時會由 agent 處理
    echo "🔍 搜尋: $keyword"
}

# 搜尋各關鍵字
for kw in $SEARCH_KEYWORDS; do
    search_news "$kw"
done

echo "📝 新聞已收集到: $OUTPUT_FILE"
echo "🤖 準備發布到 Google Site..."

# 輸出標記，讓 OpenClaw 知道要處理的內容
echo "---CONTENT_MARKER---"
cat "$OUTPUT_FILE"
echo "---CONTENT_MARKER---"

