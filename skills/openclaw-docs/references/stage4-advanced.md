# Stage 4: 進階功能 (Advanced Features)

> 濃縮自 OpenClaw 文件 - 第四階段學習筆記

---

## 1. Memory (記憶系統)

### 核心概念
- **Plain Markdown 記憶**: OpenClaw 記憶是 workspace 中的 Markdown 檔案，檔案是 source of truth，模型只「記住」寫入磁碟的內容
- 預設使用兩層記憶:
  - `memory/YYYY-MM-DD.md` - 每日日誌 (append-only)
  - `MEMORY.md` - 長期記憶 (僅在 main session 載入)

### 記憶寫入時機
- 決策、偏好、長期事實 → `MEMORY.md`
- 日常筆記、運行上下文 → `memory/YYYY-MM-DD.md`
- 如果有人說「記住這個」，寫下來 (不要留在 RAM)

### 向量搜尋
- 預設啟用，可對 `MEMORY.md` 和 `memory/*.md` 建立向量索引
- 支援 semantic queries，即使措辭不同也能找到相關筆記
- 嵌入 providers: OpenAI, Gemini, Voyage, Local (node-llama-cpp)

### QMD 後端 (實驗性)
```json5
memory: {
  backend: "qmd",  // 預設 SQLite
  qmd: {
    command: "qmd",
    searchMode: "search",  // 或 vsearch, query
    includeDefaultMemory: true,
    update: { interval: "5m", debounceMs: 15000 },
    limits: { maxResults: 6, timeoutMs: 4000 },
  }
}
```
- QMD = 本地優先搜尋 sidecar，結合 BM25 + vectors + reranking
- 安裝: `bun install -g https://github.com/tobi/qmd`
- 需要 Bun + SQLite (支援 extension)

### 混合搜尋 (Hybrid Search)
- 結合向量相似度 + BM25 關鍵字相關性
- 適用場景: 自然語言查詢 + 精確匹配 (如 ID、env vars)

### MMR 與時間衰減
- **MMR**: 減少重複結果，增加多樣性 (λ=0.7 平衡)
- **Temporal Decay**: 近期筆記權重更高 (預設 half-life 30 天)

### 自動記憶 flush (pre-compaction)
```json5
agents: {
  defaults: {
    compaction: {
      reserveTokensFloor: 20000,
      memoryFlush: {
        enabled: true,
        softThresholdTokens: 4000,
        prompt: "Write any lasting notes...",
      },
    },
  },
}
```
- 會話接近 auto-compaction 時觸發安靜的 agentic turn
- 提醒模型寫入持久記憶到磁碟
- 預設 `NO_REPLY` 回應

---

## 2. Multi-Agent (多代理系統)

### 核心概念
一個 **agent** = 完整隔離的大腦，包含:
- **Workspace**: 檔案、AGENTS.md/SOUL.md/USER.md、 persona rules
- **State directory** (`agentDir`): auth profiles、model registry、per-agent config
- **Session store**: 對話歷史 + 路由狀態

### 重要路徑
- Config: `~/.openclaw/openclaw.json`
- State: `~/.openclaw`
- Workspace: `~/.openclaw/workspace` (或 `~/.openclaw/workspace-<agentId>`)
- Agent dir: `~/.openclaw/agents/<agentId>/agent`
- Sessions: `~/.openclaw/agents/<agentId>/sessions`

### 路由規則 (Binding)
**Most-specific wins**:
1. `peer` match (exact DM/group/channel id)
2. `parentPeer` match
3. `guildId + roles` (Discord role routing)
4. `guildId`
5. `teamId` (Slack)
6. `accountId` match
7. channel-level match
8. fallback to default agent

### 範例: WhatsApp 多人隔離
```json5
{
  agents: {
    list: [
      { id: "alex", workspace: "~/.openclaw/workspace-alex" },
      { id: "mia", workspace: "~/.openclaw/workspace-mia" },
    ],
  },
  bindings: [
    { agentId: "alex", match: { channel: "whatsapp", peer: { id: "+15551230001" } } },
    { agentId: "mia", match: { channel: "whatsapp", peer: { id: "+15551230002" } } },
  ],
}
```

### Per-Agent Sandbox & Tools
```json5
{
  agents: {
    list: [
      {
        id: "family",
        sandbox: { mode: "all", scope: "agent" },
        tools: {
          allow: ["read", "exec"],
          deny: ["write", "browser", "nodes"],
        },
      },
    ],
  },
}
```

---

## 3. Sessions (對話管理)

### DM Scope 選項
控制直接訊息如何分組:
- `main` (預設): 所有 DMs 共享 main session
- `per-peer`: 按 sender id 隔離
- `per-channel-peer`: 按 channel + sender 隔離
- `per-account-channel-peer`: 按 account + channel + sender 隔離

### Secure DM 模式 (重要!)
多人使用時建議啟用，避免隱私洩漏:
```json5
session: {
  dmScope: "per-channel-peer",
}
```

### 會話重置策略
- **Daily**: 預設每天 4:00 AM 重置
- **Idle**: 閒置 N 分鐘後重置
- **Per-type override**: direct/group/thread 可不同策略

### Session Key 格式
- DM: `agent:<agentId>:<mainKey>` (main) 或 `agent:<agentId>:<channel>:dm:<peerId>`
- Group: `agent:<agentId>:<channel>:group:<id>`
- Cron: `cron:<job.id>`
- Webhook: `hook:<uuid>`

### Send Policy
```json5
session: {
  sendPolicy: {
    default: "allow",
    rules: [
      { action: "deny", match: { channel: "discord", chatType: "group" } },
    ],
  },
}
```

---

## 4. Compaction (上下文緊縮)

### 什麼是 Compaction
- 將舊對話**摘要**成簡潔的總結條目
- 保留最近訊息完整
- 摘要**持久化**在 JSONL 歷史中

### Auto-compaction (預設開啟)
- 會話接近 context window 時觸發
- 可見: `🧹 Auto-compaction complete` (verbose mode)
- `/status` 顯示 `🧹 Compactions: <count>`

### Manual compaction
```
/compact Focus on decisions and open questions
```

### Compaction vs Pruning
- **Compaction**: 摘要並持久化到 JSONL
- **Pruning**: 僅修剪舊的 tool results，記憶體中處理

---

## 5. Model Providers (模型供應商)

### 內建 Provider (pi-ai catalog)
無需 `models.providers` 設定，直接設定 auth 即可:

| Provider | Auth 變數 | 範例模型 |
|----------|-----------|----------|
| `openai` | `OPENAI_API_KEY` | `openai/gpt-5.1-codex` |
| `anthropic` | `ANTHROPIC_API_KEY` | `anthropic/claude-opus-4-6` |
| `openai-codex` | OAuth | `openai-codex/gpt-5.3-codex` |
| `google` | `GEMINI_API_KEY` | `google/gemini-3-pro-preview` |
| `zai` | `ZAI_API_KEY` | `zai/glm-4.7` |
| `vercel-ai-gateway` | `AI_GATEWAY_API_KEY` | `vercel-ai-gateway/anthropic/claude-opus-4.6` |

### API Key 輪換
支援多 key 輪換:
- `OPENCLAW_LIVE_<PROVIDER>_KEY` (最高優先)
- `<PROVIDER>_API_KEYS` (逗號分隔)
- `<PROVIDER>_API_KEY_1`, `<PROVIDER>_API_KEY_2` (編號)
- 僅在 rate-limit (429) 時切換 key

### 自定義 Provider (models.providers)
```json5
models: {
  mode: "merge",
  providers: {
    moonshot: {
      baseUrl: "https://api.moonshot.ai/v1",
      apiKey: "${MOONSHOT_API_KEY}",
      api: "openai-completions",
      models: [{ id: "kimi-k2.5", name: "Kimi K2.5" }],
    },
  },
}
```

### 本地模型
- **Ollama**: `ollama/llama3.3` (自動偵測 `http://127.0.0.1:11434/v1`)
- **vLLM**: `vllm/your-model-id` (預設 `http://127.0.0.1:8000/v1`)
- **LM Studio**: 參考自定義 provider 設定

### CLI 範例
```bash
openclaw onboard --auth-choice openai-api-key
openclaw models set openai/gpt-5.1-codex
openclaw models list
```

---

## 重點筆記 (Key Takeaways)

1. **Memory**: Markdown 檔案是 source of truth，QMD 後端提供更強大的混合搜尋
2. **Multi-agent**: 每個 agent 完全隔離，透過 binding 路由訊息
3. **Sessions**: Secure DM 模式對多人使用至關重要
4. **Compaction**: 自動觸發，可配合 memory flush 保存重要記憶
5. **Model Providers**: 內建多種 provider，也支援自定義 OpenAI-compatible 端點
