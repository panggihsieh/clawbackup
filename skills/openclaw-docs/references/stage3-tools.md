# Stage 3: 工具掌握 (Tool Mastery)

本文件濃縮 OpenClaw 工具文件第三階段的重點內容。

---

## 1. Tools Surface (工具表面)

### 工具群組 (Tool Groups)

在 `tools.allow` / `tools.deny` 中使用 `group:*` 簡寫：

| 群組 | 包含工具 |
|------|----------|
| `group:runtime` | `exec`, `bash`, `process` |
| `group:fs` | `read`, `write`, `edit`, `apply_patch` |
| `group:sessions` | `sessions_list`, `sessions_history`, `sessions_send`, `sessions_spawn`, `session_status` |
| `group:memory` | `memory_search`, `memory_get` |
| `group:web` | `web_search`, `web_fetch` |
| `group:ui` | `browser`, `canvas` |
| `group:automation` | `cron`, `gateway` |
| `group:messaging` | `message` |
| `group:nodes` | `nodes` |
| `group:openclaw` | 所有內建 OpenClaw 工具 |

### 工具 profiles (base allowlist)

```json5
{
  tools: { profile: "minimal" | "coding" | "messaging" | "full" }
}
```

- **minimal**: 僅 `session_status`
- **coding**: `group:fs`, `group:runtime`, `group:sessions`, `group:memory`, `image`
- **messaging**: `group:messaging`, `sessions_list`, `sessions_history`, `sessions_send`, `session_status`
- **full**: 無限制

### 全域停用工具

```json5
{
  tools: { deny: ["browser"] }  // deny wins
}
```

---

## 2. Exec Tool (指令執行)

### 核心參數

| 參數 | 說明 |
|------|------|
| `command` | (必填) 要執行的 shell 命令 |
| `yieldMs` | 自動背景化延遲 (預設 10000ms) |
| `background` | 立即背景執行 |
| `timeout` | 秒數，逾時殺死程序 (預設 1800) |
| `pty` | 使用 pseudo-terminal (TTY 專用 CLI) |
| `host` | `sandbox` \| `gateway` \| `node` |
| `security` | `deny` \| `allowlist` \| `full` |
| `ask` | `off` \| `on-miss` \| `always` |
| `elevated` | 要求 elevated 模式 (gateway host) |

### 使用範例

**前景執行:**
```json
{ "tool": "exec", "command": "ls -la" }
```

**背景 + 輪詢:**
```json
{"tool": "exec", "command": "npm run build", "yieldMs": 1000}
{"tool": "process", "action": "poll", "sessionId": "<id>"}
```

**發送按鍵 (tmux style):**
```json
{"tool": "process", "action": "send-keys", "sessionId": "<id>", "keys": ["C-c"]}
```

**貼上文字:**
```json
{ "tool": "process", "action": "paste", "sessionId": "<id>", "text": "line1\nline2\n" }
```

### 安全性設定

```json5
{
  tools: {
    exec: {
      pathPrepend: ["~/bin", "/opt/oss/bin"],
      approvalRunningNoticeMs: 10000,
    }
  }
}
```

- `host=sandbox`: 在容器內執行 `sh -lc`
- `host=gateway`: 在 gateway 主機執行
- `host=node`: 在配對的 node 執行
- `elevated`: 需要 `tools.elevated` 啟用 + 閘道允許

---

## 3. Browser Control (瀏覽器控制)

### Profiles: openclaw vs chrome

- **openclaw**: 受管隔離瀏覽器 (無需擴充)
- **chrome**: 擴充 relay 到您現有的 Chrome 分頁

### 核心動作

| 動作 | 說明 |
|------|------|
| `status` | 檢查瀏覽器狀態 |
| `start` / `stop` | 啟動/停止瀏覽器 |
| `tabs` | 列出分頁 |
| `open` | 開啟 URL |
| `snapshot` | 擷取 UI 樹 (ai/aria 格式) |
| `screenshot` | 擷取螢幕截圖 |
| `act` | 執行操作: click/type/press/hover/drag/select/fill/resize/wait/evaluate |
| `navigate` | 導航到 URL |
| `console` | 讀取 console |
| `pdf` | 產生 PDF |

### Profile 管理

```bash
openclaw browser create-profile --name work --cdp-port 18801
openclaw browser delete-profile --name work
openclaw browser reset-profile --name work
```

### 使用範例

```bash
# 基本操作
openclaw browser status
openclaw browser start
openclaw browser open https://example.com
openclaw browser snapshot

# 互動模式 snapshot (産生 role refs 如 e12)
openclaw browser snapshot --interactive

# 點擊/輸入 (使用 snapshot 的 ref)
openclaw browser click e12
openclaw browser type e23 "hello" --submit

# 截圖
openclaw browser screenshot
openclaw browser screenshot --full-page
openclaw browser screenshot --ref e12

# 等待條件
openclaw browser wait "#main" --url "**/dash" --load networkidle

# 調試
openclaw browser highlight e12
openclaw browser trace start
openclaw browser trace stop
```

### 設定

```json5
{
  browser: {
    enabled: true,
    defaultProfile: "chrome",
    headless: false,
    profiles: {
      openclaw: { cdpPort: 18800, color: "#FF4500" },
      work: { cdpPort: 18801, color: "#0066CC" },
      remote: { cdpUrl: "http://10.0.0.42:9222" }
    }
  }
}
```

---

## 4. Cron Jobs (排程任務)

### JSON Schema

**新增任務 (cron.add):**

```json
{
  "name": "Morning brief",
  "schedule": {
    "kind": "cron",
    "expr": "0 7 * * *",
    "tz": "America/Los_Angeles"
  },
  "sessionTarget": "isolated",
  "wakeMode": "next-heartbeat",
  "payload": {
    "kind": "agentTurn",
    "message": "Summarize overnight updates."
  },
  "delivery": {
    "mode": "announce",
    "channel": "slack",
    "to": "channel:C1234567890",
    "bestEffort": true
  }
}
```

**一次性提醒:**
```json
{
  "name": "Reminder",
  "schedule": { "kind": "at", "at": "2026-02-01T16:00:00Z" },
  "sessionTarget": "main",
  "payload": { "kind": "systemEvent", "text": "Reminder text" },
  "deleteAfterRun": true
}
```

### Schedule 類型

| kind | 參數 | 說明 |
|------|------|------|
| `at` | `at` (ISO 8601) | 一次性時間 |
| `every` | `everyMs` (毫秒) | 固定間隔 |
| `cron` | `expr` (5/6 位cron表達式), `tz` | cron 排程 |

### 執行模式

- **Main session**: `sessionTarget: "main"` + `payload.kind: "systemEvent"`
  - 通過 heartbeat 執行，使用主要會話上下文
- **Isolated**: `sessionTarget: "isolated"` + `payload.kind: "agentTurn"`
  - 在獨立會話 `cron:<jobId>` 中執行
  - 可選擇 delivery mode: `announce` | `webhook` | `none`

### CLI 範例

```bash
# 一次性提醒
openclaw cron add --name "Reminder" --at "2026-02-01T16:00:00Z" \
  --session main --system-event "Reminder text" --wake now --delete-after-run

# 每日早上簡報
openclaw cron add --name "Morning brief" --cron "0 7 * * *" \
  --tz "America/Los_Angeles" --session isolated --message "Summarize updates." \
  --announce --channel slack --to "channel:C1234567890"

# 手動執行
openclaw cron run <job-id>
openclaw cron runs --id <job-id>

# 編輯任務
openclaw cron edit <job-id> --message "Updated prompt" --model "opus"
```

---

## 5. Sub-agents (子代理)

### 工作階段管理

**Session key 格式:**
- Main: `agent:<id>:main`
- Sub-agent: `agent:<id>:subagent:<uuid>`
- Nested: `agent:<id>:subagent:<uuid>:subagent:<uuid>`

### Tool: sessions_spawn

```json
{
  "task": "Research topic X",
  "label": "research-1",
  "agentId": "support",
  "model": "opus",
  "thinking": "low",
  "runTimeoutSeconds": 300,
  "cleanup": "keep"  // "delete" = 立即歸檔
}
```

### 配置

```json5
{
  agents: {
    defaults: {
      subagents: {
        maxSpawnDepth: 2,        // 允許巢狀 (預設 1)
        maxChildrenPerAgent: 5,  // 每個代理最多子代理數
        maxConcurrent: 8,        // 全域並發上限
        archiveAfterMinutes: 60  // 自動歸檔時間
      }
    }
  }
}
```

### 工具權限

- 預設: 子代理獲得所有工具**除了** session tools
- Depth 1 (orchestrator, when `maxSpawnDepth >= 2`): 額外獲得 `sessions_spawn`, `subagents`, `sessions_list`, `sessions_history`
- Depth 2 (leaf): 無 session tools

### 控制命令

```bash
/subagents list
/subagents kill <id|#|all>
/subagents log <id#> [limit]
/subagents info <id#>
/subagents spawn <agentId> <task> --model opus --thinking high
```

### Announce 格式

```
Status: completed successfully
Result: (summary content)
Notes: (error details)
---
runtime 5m12s | tokens 1.2K/3.4K | sessionKey: agent:xxx:subagent:yyy
```

---

## 常用工具清單

| 工具 | 功能 |
|------|------|
| `exec` / `process` | Shell 指令執行 |
| `browser` | 瀏覽器自動化 |
| `canvas` | Node Canvas 渲染 |
| `nodes` | 配對節點控制 |
| `cron` | 排程任務 |
| `message` | 跨平台訊息 |
| `web_search` / `web_fetch` | 網頁搜尋/擷取 |
| `read` / `write` / `edit` | 檔案操作 |
| `session_status` / `sessions_*` | 會話管理 |
| `gateway` | Gateway 控制 |
