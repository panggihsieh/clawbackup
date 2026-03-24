---
name: openclaw-docs
description: |
  OpenClaw self-hosted gateway documentation and configuration reference. Use when:
  (1) Configuring OpenClaw channels (Discord, WhatsApp, Telegram, Slack, etc.)
  (2) Setting up memory search (especially QMD backend)
  (3) Using tools (browser, exec, message, cron, etc.)
  (4) Gateway configuration and troubleshooting
  (5) Agent workspace and memory management
---

# OpenClaw Documentation Skill

## Quick Reference

### Core Concepts

- **Gateway**: Single process running on your machine, bridges chat apps to AI agents
- **Channels**: WhatsApp, Telegram, Discord, Slack, iMessage, Signal, Google Chat, etc.
- **Agents**: AI agent instances with isolated sessions
- **Memory**: Markdown files in workspace (`MEMORY.md` + `memory/YYYY-MM-DD.md`)

### Important URLs

- Docs: https://docs.openclaw.ai/
- Full index: https://docs.openclaw.ai/llms.txt
- Config reference: https://docs.openclaw.ai/gateway/configuration-reference.md

## Configuration

### Memory with QMD (Recommended)

```json
{
  "memory": {
    "backend": "qmd",
    "qmd": {
      "includeDefaultMemory": true,
      "update": {
        "interval": "10s",
        "debounceMs": 1000
      },
      "scope": {
        "default": "deny",
        "rules": [
          { "action": "allow", "match": { "chatType": "direct" } },
          { "action": "allow", "match": { "keyPrefix": "discord:channel:" } }
        ]
      }
    }
  }
}
```

QMD Install: `npm install -g @tobilu/qmd`

### Discord

```json
{
  "channels": {
    "discord": {
      "enabled": true,
      "token": "YOUR-BOT-TOKEN",
      "guilds": {
        "*": {
          "requireMention": false
        }
      }
    }
  }
}
```

### Tool Profiles

```json
{
  "tools": {
    "profile": "full",
    "deny": ["camera.snap", "camera.clip", "screen.record"]
  }
}
```

Profiles: `minimal`, `coding`, `messaging`, `full`

## Key Tools

| Tool | Description |
|------|-------------|
| `exec` | Run shell commands |
| `browser` | Control Chrome browser |
| `message` | Send messages via channels |
| `memory_search` | Search memory (uses QMD) |
| `cron` | Schedule jobs |
| `nodes` | Control mobile nodes |

## CLI Commands

```bash
openclaw status          # Gateway status
openclaw doctor         # Diagnostics
openclaw memory status  # Memory index status
openclaw gateway start  # Start gateway
```

## Memory Files

- `MEMORY.md` - Long-term memory (DM only)
- `memory/YYYY-MM-DD.md` - Daily notes

Write to memory when user says "remember this".
