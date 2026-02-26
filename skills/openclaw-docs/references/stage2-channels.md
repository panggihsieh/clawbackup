# 第二階段：通道設定

> 來源：OpenClaw 文件 (https://docs.openclaw.ai/)

---

## 1. Discord

### Bot 設定

```bash
# 設定 Bot Token
openclaw config set channels.discord.token '"YOUR_BOT_TOKEN"' --json
openclaw config set channels.discord.enabled true --json

# 或透過環境變數
DISCORD_BOT_TOKEN=...
```

### 權限設定 (Developer Portal)

需要啟用的 **Privileged Gateway Intents**：
- `Message Content Intent` (必要)
- `Server Members Intent` (推薦; 用於角色 allowlists)
- `Presence Intent` (可選)

OAuth2 需要權限：
- `bot` + `applications.commands`
- Bot Permissions: View Channels, Send Messages, Read Message History, Embed Links, Attach Files

### DM 政策

```json5
{
  channels: {
    discord: {
      dmPolicy: "pairing",  // pairing | allowlist | open | disabled
      allowFrom: ["userId1", "userId2"],
    }
  }
}
```

### Guild/群組權限

```json5
{
  channels: {
    discord: {
      groupPolicy: "allowlist",  // open | allowlist | disabled
      guilds: {
        "SERVER_ID": {
          requireMention: true,     // 是否需要 @mention 才回覆
          users: ["USER_ID"],        //允許的使用者 ID
          roles: ["ROLE_ID"],        //允許的角色 ID
          channels: {
            "general": { allow: true },
            "help": { allow: true, requireMention: true }
          }
        }
      }
    }
  }
}
```

### 指令

- `commands.native` 預設為 `"auto"`，自動啟用 Discord 原生斜線指令
- 透過 `channels.discord.customCommands` 新增自訂指令

### 角色路由

```json5
{
  bindings: [
    {
      agentId: "opus",
      match: {
        channel: "discord",
        guildId: "123456789012345678",
        roles: ["111111111111111111"]  // 角色 ID
      }
    }
  ]
}
```

---

## 2. WhatsApp

### Web 連線

使用 WhatsApp Web (Baileys)，Gateway 擁有連線階段。

```bash
# QR 登入
openclaw channels login --channel whatsapp
```

### 部署模式

**專用號碼 (推薦)**
```json5
{
  channels: {
    whatsapp: {
      dmPolicy: "allowlist",
      allowFrom: ["+15551234567"]
    }
  }
}
```

**個人號碼**
```json5
{
  channels: {
    whatsapp: {
      dmPolicy: "allowlist",
      allowFrom: ["+15551234567"],
      selfChatMode: true
    }
  }
}
```

### 群組設定

```json5
{
  channels: {
    whatsapp: {
      groupPolicy: "allowlist",      // open | allowlist | disabled
      groupAllowFrom: ["+15551234567"],
      groups: {
        "123@g.us": { requireMention: true },
        "456@g.us": { requireMention: false }
      }
    }
  }
}
```

### 歷史記錄

```json5
{
  channels: {
    whatsapp: {
      historyLimit: 50,  // 緩衝的未處理訊息數量
      sendReadReceipts: true
    }
  }
}
```

---

## 3. Telegram

### Bot Token 設定

1. 與 @BotFather 對話，建立新機器人
2. 取得 token

```json5
{
  channels: {
    telegram: {
      enabled: true,
      botToken: "123:abc",
      dmPolicy: "pairing"
    }
  }
}
```

### 隱私權模式

預設為 **Privacy Mode**，機器人只會收到被 @提及的訊息。

若需要看到所有群組訊息：
- 停用隱私權：`/setprivacy` → Disable
- 或將機器人設為群組管理員

### 群組設定

```json5
{
  channels: {
    telegram: {
      groupPolicy: "allowlist",  // open | allowlist | disabled
      groupAllowFrom: ["123456789"],
      groups: {
        "*": { requireMention: true },
        "-1001234567890": {
          groupPolicy: "open",
          requireMention: false
        }
      }
    }
  }
}
```

### 自訂指令

```json5
{
  channels: {
    telegram: {
      customCommands: [
        { command: "backup", description: "Git backup" },
        { command: "generate", description: "Create an image" }
      ]
    }
  }
}
```

### 直播預覽

```json5
{
  channels: {
    telegram: {
      streamMode: "partial",  // off | partial | block
      draftChunk: {
        minChars: 200,
        maxChars: 800,
        breakPreference: "paragraph"
      }
    }
  }
}
```

---

## 4. Groups (通用)

### 群組政策

| Policy | 行為 |
|--------|------|
| `"open"` | 允許所有群組，仍套用 mention 閘門 |
| `"disabled"` | 封鎖所有群組訊息 |
| `"allowlist"` | 只允許設定的群組 |

```json5
{
  channels: {
    whatsapp: { groupPolicy: "disabled" },
    telegram: { groupPolicy: "allowlist", groupAllowFrom: ["123456789"] },
    discord: { groupPolicy: "allowlist", guilds: { "GUILD_ID": { ... } } },
    slack: { groupPolicy: "allowlist", channels: { "#general": { allow: true } } }
  }
}
```

### Mention 閘門

```json5
{
  channels: {
    whatsapp: {
      groups: {
        "*": { requireMention: true },
        "123@g.us": { requireMention: false }
      }
    },
    telegram: {
      groups: {
        "*": { requireMention: true }
      }
    }
  },
  agents: {
    list: [{
      id: "main",
      groupChat: {
        mentionPatterns: ["@openclaw", "openclaw", "\\+15555550123"],
        historyLimit: 50
      }
    }]
  }
}
```

### 啟動命令

群組所有者可切換：
- `/activation mention` - 只回覆被提及的訊息
- `/activation always` - 總是回覆

### 群組工具限制

```json5
{
  channels: {
    telegram: {
      groups: {
        "*": { tools: { deny: ["exec"] } },
        "-1001234567890": {
          tools: { deny: ["exec", "read", "write"] },
          toolsBySender: {
            "123456789": { alsoAllow: ["exec"] }
          }
        }
      }
    }
  }
}
```

---

## 5. Channel Routing

### Session Key 格式

- **DM**: `agent:<agentId>:main` (預設 main session)
- **群組**: `agent:<agentId>:<channel>:group:<id>`
- **頻道/房間**: `agent:<agentId>:<channel>:channel:<id>`
- **執行緒**: `agent:<agentId>:<channel>:channel:<id>:thread:<threadId>`
- **Telegram Forum**: `agent:<agentId>:telegram:group:<id>:topic:<threadId>`

### 路由順序

1. **精確 peer 匹配** (`bindings` 含 `peer.kind` + `peer.id`)
2. **父 peer 匹配** (執行緒繼承)
3. **Guild + 角色匹配** (Discord)
4. **Guild 匹配** (Discord)
5. **Team 匹配** (Slack)
6. **Account 匹配** (`accountId`)
7. **Channel 匹配** (`accountId: "*"`)
8. **預設 agent** (`agents.default` 或第一個列表項目)

### 綁定範例

```json5
{
  agents: {
    list: [
      { id: "support", name: "Support", workspace: "~/.openclaw/workspace-support" }
    ]
  },
  bindings: [
    { match: { channel: "slack", teamId: "T123" }, agentId: "support" },
    { match: { channel: "telegram", peer: { kind: "group", id: "-100123" } }, agentId: "support" },
    { match: { channel: "discord", guildId: "123", roles: ["111"] }, agentId: "opus" }
  ]
}
```

### 廣播群組

在指定群組或 DM 中執行多個 agent：

```json5
{
  broadcast: {
    strategy: "parallel",
    "120363403215116621@g.us": ["alfred", "baerbel"],
    "+15555550123": ["support", "logger"]
  }
}
```

---

## 快速配置總覽

```json5
{
  channels: {
    discord: {
      enabled: true,
      token: "YOUR_BOT_TOKEN",
      dmPolicy: "pairing",
      groupPolicy: "allowlist",
      guilds: {
        "SERVER_ID": {
          requireMention: false,
          users: ["YOUR_USER_ID"]
        }
      }
    },
    whatsapp: {
      dmPolicy: "pairing",
      groupPolicy: "allowlist",
      groupAllowFrom: ["+15551234567"]
    },
    telegram: {
      enabled: true,
      botToken: "123:abc",
      dmPolicy: "pairing",
      groupPolicy: "allowlist",
      groups: {
        "*": { requireMention: true }
      }
    }
  },
  bindings: [
    { match: { channel: "discord" }, agentId: "main" },
    { match: { channel: "whatsapp" }, agentId: "main" },
    { match: { channel: "telegram" }, agentId: "main" }
  ]
}
```
