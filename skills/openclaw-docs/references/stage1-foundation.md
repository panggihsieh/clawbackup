# OpenClaw 基礎概念筆記 (Stage 1)

> 來源：官方文件濃縮 | 2026-02-19

---

## 1. Architecture (架構)

### 核心元件

| 元件 | 職責 |
|------|------|
| **Gateway** (daemon) | 維護所有訊息渠道連線、曝露 WS API、驗證請求、發送事件 |
| **Clients** (CLI/macOS app/web) | 透過 WebSocket 連線，發送請求 (send/agent/status) 訂閱事件 |
| **Nodes** (macOS/iOS/Android/headless) | 以 `role: node` 連線，提供 canvas/camera/screen/location 等命令 |
| **Canvas Host** | 由 Gateway HTTP 伺服器提供 `/__openclaw__/canvas/` 與 `/__openclaw__/a2ui/` |

### 連線重點

- **預設端點**: `127.0.0.1:18789` (WebSocket)
- **認證**: 可選 `OPENCLAW_GATEWAY_TOKEN` 或 `--token`
- **裝置配對**: 新裝置需核准，local 連線可自動核准
- **遠端存取**: Tailscale 或 SSH tunnel (`ssh -N -L 18789:127.0.0.1:18789`)

### Wire Protocol 摘要

```
第一帧必須是 connect
後續:
  - req: {type:"req", id, method, params} → res: {type:"res", id, ok, payload|error}
  - event: {type:"event", event, payload}
```

- 有副作用的方法 (`send`, `agent`) 需附 idempotency key

### 運行指令

```bash
openclaw gateway              # foreground 運行
openclaw gateway status       # 檢查狀態
```

---

## 2. Features (功能列表)

### 訊息渠道
- **WhatsApp** (Baileys)
- **Telegram** (grammY)
- **Discord**
- **iMessage** (macOS local imsg CLI)
- **Signal**, **Slack**, **Google Chat**, **MS Teams** (部分)
- **Mattermost** (plugin)

### 核心能力
- **多Agent路由**: 隔離 workspace/session
- **媒體支援**: 圖片、音頻、文檔進出
- **Streaming**: 長回應串流輸出
- **對話管理**: DM 折疊為 `main`，群組隔離
- **群組mention閘道**: 可設定 mention 才啟動

### 用戶端
- **Web Control UI**: `http://127.0.0.1:18789/`
- **macOS menu bar app**
- **iOS Node**: 配對 + Canvas
- **Android Node**: 配對 + Canvas + chat + camera

> Legacy: Claude, Codex, Gemini, Opencode 已移除，Pi 是唯一 coding agent

---

## 3. Getting Started (安裝與首次設定)

### 前置需求
- **Node 22+** (`node --version` 檢查)

### 快速安裝

```bash
# macOS/Linux
curl -fsSL https://openclaw.ai/install.sh | bash

# Windows (PowerShell)
iwr -useb https://openclaw.ai/install.ps1 | iex
```

### 初始化精靈

```bash
# 執行 onboarding (含 daemon 安裝)
openclaw onboard --install-daemon
```

精靈會設定：
- Auth 認證
- Gateway 設定
- 選填渠道 (WhatsApp/Telegram/Discord)

### 驗證與操作

```bash
# 檢查 Gateway 狀態
openclaw gateway status

# 開啟 Control UI (瀏覽器)
openclaw dashboard

# 或直接開啟 http://127.0.0.1:18789/

# 前台運行 (測試/除錯)
openclaw gateway --port 18789

# 發送測試訊息 (需已設定渠道)
openclaw message send --target +15555550123 --message "Hello"
```

### 環境變數 (可選)

| 變數 | 用途 |
|------|------|
| `OPENCLAW_HOME` | OpenClaw 主目錄 |
| `OPENCLAW_STATE_DIR` | 狀態目錄 |
| `OPENCLAW_CONFIG_PATH` | 設定檔路徑 |

---

## 4. Configuration (設定檔)

### 檔案位置
- **主設定**: `~/.openclaw/openclaw.json` (JSON5 格式，支援註解)
- 檔案不存在時使用安全預設值

### 最小範例

```json5
{
  agents: { defaults: { workspace: "~/.openclaw/workspace" } },
  channels: { whatsapp: { allowFrom: ["+15555550123"] } },
}
```

### 編輯方式

```bash
# 互動精靈
openclaw onboard        # 完整設定精靈
openclaw configure      # 設定精靈

# CLI 單行操作
openclaw config get agents.defaults.workspace
openclaw config set agents.defaults.heartbeat.every "2h"
openclaw config unset tools.web.search.apiKey

# Control UI
# 開啟 http://127.0.0.1:18789/ → Config 標籤

# 直接編輯
vim ~/.openclaw/openclaw.json  # Gateway 會監看並熱重載
```

### 驗證與熱重載

- **嚴格驗證**: 未知欄位、類型錯誤會導致 Gateway **無法啟動**
- **熱重載模式** (預設 `hybrid`):

| 模式 | 行為 |
|------|------|
| `hybrid` | 安全變更即時套用，critical 自動重啟 |
| `hot` | 只熱套用安全變更，需手動重啟 |
| `restart` | 任何變更都重啟 |
| `off` | 關閉監看，下次手動重啟 |

```json5
{
  gateway: { reload: { mode: "hybrid", debounceMs: 300 } },
}
```

### 常見設定範例

#### 渠道 DM 政策

```json5
{
  channels: {
    telegram: {
      enabled: true,
      botToken: "123:abc",
      dmPolicy: "pairing",   // pairing | allowlist | open | disabled
      allowFrom: ["tg:123"],
    },
  },
}
```

#### 模型選擇

```json5
{
  agents: {
    defaults: {
      model: {
        primary: "anthropic/claude-sonnet-4-5",
        fallbacks: ["openai/gpt-5.2"],
      },
    },
  },
}
```

#### Session 管理

```json5
{
  session: {
    dmScope: "per-channel-peer",
    reset: { mode: "daily", atHour: 4, idleMinutes: 120 },
  },
}
```

#### 多Agent路由

```json5
{
  agents: {
    list: [
      { id: "home", default: true, workspace: "~/.openclaw/workspace-home" },
      { id: "work", workspace: "~/.openclaw/workspace-work" },
    ],
  },
  bindings: [
    { agentId: "home", match: { channel: "whatsapp", accountId: "personal" } },
    { agentId: "work", match: { channel: "whatsapp", accountId: "biz" } },
  ],
}
```

#### Cron 排程

```json5
{
  cron: { enabled: true, maxConcurrentRuns: 2, sessionRetention: "24h" },
}
```

#### Webhooks

```json5
{
  hooks: {
    enabled: true,
    token: "shared-secret",
    path: "/hooks",
    mappings: [
      { match: { path: "gmail" }, action: "agent", agentId: "main", deliver: true },
    ],
  },
}
```

### Config RPC (程式化更新)

```bash
# 完整替換
openclaw gateway call config.apply --params '{"raw":"{...}", "baseHash":"<hash>"}'

# 局部更新
openclaw gateway call config.patch --params '{"raw":"{...}", "baseHash":"<hash>"}'
```

### 環境變數整合

```json5
{
  env: {
    vars: { GROQ_API_KEY: "gsk-..." },
  },
  gateway: { auth: { token: "${OPENCLAW_GATEWAY_TOKEN}" } },
}
```

---

## 重點命令速查

| 動作 | 命令 |
|------|------|
| 安裝 | `curl -fsSL https://openclaw.ai/install.sh \| bash` |
| 初始化 | `openclaw onboard --install-daemon` |
| 狀態 | `openclaw gateway status` |
| 前台運行 | `openclaw gateway` |
| 開UI | `openclaw dashboard` |
| 發訊息 | `openclaw message send --target XXX --message "..."` |
| 查設定 | `openclaw config get <key>` |
| 改設定 | `openclaw config set <key> <value>` |

---

## 下一步

- [ ] 設定第一個渠道 (WhatsApp/Telegram/Discord)
- [ ] 了解 Pairing 與 DM 安全
- [ ] 探索 Multi-agent 路由
- [ ] 學習 Sandboxing 隔離
