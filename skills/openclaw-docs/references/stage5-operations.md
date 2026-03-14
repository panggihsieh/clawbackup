# 第五階段：營運維護

本頁濃縮自 OpenClaw 文件的營運維護相關內容，包含安全設定、故障排除、健康檢查、日誌管理與診斷工具。

---

## 1. Security（安全設定）

### 快速安全檢查
```bash
openclaw security audit
openclaw security audit --deep      # 含主動探測
openclaw security audit --fix       # 自動修復
openclaw security audit --json      # JSON 格式輸出
```

### 強化基準配置（60 秒設定）
```json5
{
  gateway: {
    mode: "local",
    bind: "loopback",
    auth: { mode: "token", token: "replace-with-long-random-token" },
  },
  session: {
    dmScope: "per-channel-peer",
  },
  tools: {
    profile: "messaging",
    deny: ["group:automation", "group:runtime", "group:fs", "sessions_spawn", "sessions_send"],
    fs: { workspaceOnly: true },
    exec: { security: "deny", ask: "always" },
    elevated: { enabled: false },
  },
  channels: {
    whatsapp: { dmPolicy: "pairing", groups: { "*": { requireMention: true } } },
  },
}
```

### 安全檢查清單（優先順序）
1. **「open」+ 工具啟用**：先鎖定 DM/群組（pairing/allowlists），再緊縮工具政策
2. **公開網路暴露**：立即修復（LAN bind、Funnel、缺少 auth）
3. **瀏覽器控制遠端暴露**：視為操作員存取
4. **權限**：確保狀態/配置/憑證不是群組/全局可讀
5. **外掛/擴展**：只載入明確信任的
6. **模型選擇**：偏好現代、指令強化的模型

### 重要檢查 ID 速查
| checkId | 嚴重性 | 修復 key/path |
|---------|--------|---------------|
| `fs.state_dir.perms_world_writable` | critical | 檔案系統權限 |
| `fs.config.perms_writable` | critical | 檔案系統權限 |
| `gateway.bind_no_auth` | critical | `gateway.bind`, `gateway.auth.*` |
| `gateway.tailscale_funnel` | critical | `gateway.tailscale.mode` |
| `gateway.loopback_no_auth` | critical | `gateway.auth.*` |
| `logging.redact_off` | warn | `logging.redactSensitive` |

### 憑證儲存位置
- **WhatsApp**: `~/.openclaw/credentials/whatsapp/<accountId>/creds.json`
- **Telegram bot token**: config/env 或 `channels.telegram.tokenFile`
- **Discord bot token**: config/env
- **Slack tokens**: config/env
- **配對允許清單**: `~/.openclaw/credentials/<channel>-allowFrom.json`
- **模型驗證**: `~/.openclaw/agents/<agentId>/agent/auth-profiles.json`

---

## 2. Troubleshooting（故障排除）

### 命令階梯（依序執行）
```bash
openclaw status
openclaw gateway status
openclaw logs --follow
openclaw doctor
openclaw channels status --probe
```

### 常見情境

#### 無回覆
```bash
openclaw status
openclaw channels status --probe
openclaw pairing list <channel>
openclaw config get channels
openclaw logs --follow
```
徵兆：`drop guild message (mention required)`、`pairing request`、`blocked` / `allowlist`

#### Dashboard/Control UI 連不上
```bash
openclaw gateway status --json
```
徵兆：`device identity required`、`unauthorized`、`gateway connect failed`

#### Gateway 服務未運行
```bash
openclaw gateway status --deep
```
徵兆：`Runtime: stopped`、`Gateway start blocked: set gateway.mode=local`、`EADDRINUSE`

#### 頻道連線但無訊息流動
```bash
openclaw channels status --probe
openclaw pairing list <channel>
```
徵兆：`mention required`、`pairing`、`missing_scope`、`not_in_channel`

#### Cron/Heartbeat 未執行
```bash
openclaw cron status
openclaw cron list
openclaw cron runs --id <jobId> --limit 20
openclaw system heartbeat last
```
徵兆：`scheduler disabled`、`quiet-hours`

#### Node 配對但工具失敗
```bash
openclaw nodes status
openclaw nodes describe --node <idOrNameOrIp>
openclaw approvals get --node <idOrNameOrIp>
```
徵兆：`NODE_BACKGROUND_UNAVAILABLE`、`*_PERMISSION_REQUIRED`、`SYSTEM_RUN_DENIED`

#### 瀏覽器工具失敗
```bash
openclaw browser status
openclaw browser start --browser-profile openclaw
openclaw browser profiles
```
徵兆：`Failed to start Chrome CDP on port`、`no tab is connected`

---

## 3. Health Checks（健康檢查）

### 快速檢查命令
```bash
openclaw status                     # 本地摘要
openclaw status --all               # 完整診斷
openclaw status --deep              # 含 Gateway 探測
openclaw health --json              # 健康快照（WS only）
openclaw health --json --timeout <ms>  # 逾時設定（預設 10s）
```

### WhatsApp 診斷
```bash
# 憑證狀態
ls -l ~/.openclaw/credentials/whatsapp/<accountId>/creds.json

# 對話儲存
ls -l ~/.openclaw/agents/<agentId>/sessions/sessions.json

# 重新連結
openclaw channels logout
openclaw channels login --verbose
```

### 狀態代碼
- `logged out` 或 409-515 → 執行重新連結
- Gateway 不可達 → 啟動：`openclaw gateway --port 18789 --force`
- 無入站訊息 → 檢查允許清單與群組提及規則

---

## 4. Logging（日誌設定）

### 日誌檔位置
- 預設路徑：`/tmp/openclaw/openclaw-YYYY-MM-DD.log`
- 配置項目：`logging.file`、`logging.level`

### 日誌級別
```bash
# 追蹤即時日誌
openclaw logs --follow

# 設定級別（config 中）
"logging.level": "debug"   # 或 "trace", "info", "warn", "error"
```

### 級別說明
- **File logs**：由 `logging.level` 控制
- **Console logs**：由 `logging.consoleLevel` 控制（預設 `info`）
- `--verbose` 只影響 console，不影響 file log

### 敏感資料遮罩
```json
{
  "logging.redactSensitive": "tools",  // off | tools
  "logging.redactPatterns": [
    "/pattern/gi"  // 自訂 Regex
  ]
}
```

### WebSocket 日誌模式
```bash
openclaw gateway                              # 最佳化（只顯示錯誤/慢速）
openclaw gateway --verbose --ws-log compact   # 配對顯示
openclaw gateway --verbose --ws-log full      # 完整框架輸出
```

### 子系統日誌前綴
- `[gateway]`、`[canvas]`、`[tailscale]`、`[whatsapp/outbound]`
- WhatsApp 訊息內文預設在 `debug` 層級（需 `--verbose` 查看）

---

## 5. Doctor（診斷工具）

### 基本用法
```bash
openclaw doctor                  # 互動模式
openclaw doctor --yes            # 接受所有預設
openclaw doctor --repair         # 自動修復
openclaw doctor --repair --force # 積極修復（覆寫自訂 supervisor 配置）
openclaw doctor --non-interactive # 只做安全遷移
openclaw doctor --deep           # 掃描系統服務
```

### Doctor 功能清單
1. 可選的 git 更新提示
2. UI 協定檢查
3. 健康檢查 + 重啟提示
4. Skills 狀態摘要
5. 舊配置正規化
6. 舊磁碟狀態遷移（sessions/agents/WhatsApp auth）
7. 狀態完整性與權限檢查
8. 模型驗證健康檢查
9. Sandbox 映像修復
10. 服務遷移與偵測
11. Gateway 執行期檢查
12. 頻道狀態警告
13. 安全警告（開放 DM 政策）
14. systemd linger 檢查（Linux）
15. 來源安裝檢查

### 常見遷移項目
- `routing.allowFrom` → `channels.whatsapp.allowFrom`
- `routing.groupChat.requireMention` → 頻道特定配置
- `routing.agents` → `agents.list`
- `agent.*` → `agents.defaults` + `tools.*`

---

## 常用命令速查表

| 用途 | 命令 |
|------|------|
| 狀態檢查 | `openclaw status` |
| Gateway 狀態 | `openclaw gateway status` |
| 頻道探測 | `openclaw channels status --probe` |
| 診斷修復 | `openclaw doctor` |
| 安全審計 | `openclaw security audit` |
| 健康快照 | `openclaw health --json` |
| 即時日誌 | `openclaw logs --follow` |
| 配對清單 | `openclaw pairing list <channel>` |
| Cron 狀態 | `openclaw cron status` |
| Node 狀態 | `openclaw nodes status` |
| 瀏覽器狀態 | `openclaw browser status` |

---

*本文基於 OpenClaw 文件編譯，最後更新時間：2026-02-19*
