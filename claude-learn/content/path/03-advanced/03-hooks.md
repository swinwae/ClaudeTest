---
title: Hooks 机制
difficulty: 高级
readTime: 12
order: 3
tags: [Hooks, 生命周期, 自动化, 事件驱动]
---

## Hooks 的概念与触发时机

Hooks 让你在 Claude Code 执行特定操作时**自动运行 shell 命令**，无需手动触发。

想象它是事件监听器：

```
Claude 执行某个操作
    ↓
Hook 自动触发
    ↓
运行你指定的 shell 命令
    ↓
继续（或阻止）原操作
```

典型场景：
- Claude 编辑了 `.py` 文件 → 自动运行 `black` 格式化
- Claude 要执行危险命令 → 拦截并告警
- 对话结束 → 自动保存会话摘要

## 四个钩子点详解

| 钩子 | 触发时机 | 常见用途 |
|------|---------|---------|
| `PreToolUse` | 工具调用**前** | 安全检查、权限验证、拦截危险操作 |
| `PostToolUse` | 工具调用**后** | 自动格式化、日志记录、通知 |
| `Notification` | Claude 发出通知时 | 桌面通知、Slack 消息 |
| `Stop` | 对话结束时 | 保存摘要、统计成本、清理临时文件 |

## 配置格式

Hooks 在 `.claude/settings.json`（项目级）或 `~/.claude/settings.json`（用户级）中配置：

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "echo '文件已修改：' $CLAUDE_TOOL_INPUT_FILE_PATH"
          }
        ]
      }
    ],
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "/path/to/check-dangerous.sh"
          }
        ]
      }
    ]
  }
}
```

**`matcher`** 匹配工具名，支持 `|` 组合多个工具。

## 可用的环境变量

Hook 脚本中可使用以下变量：

| 变量 | 说明 |
|------|------|
| `$CLAUDE_TOOL_NAME` | 触发的工具名（Read、Edit、Bash...） |
| `$CLAUDE_TOOL_INPUT_FILE_PATH` | 操作的文件路径（Edit/Write 时） |
| `$CLAUDE_TOOL_INPUT_COMMAND` | 执行的命令（Bash 时） |
| `$CLAUDE_SESSION_ID` | 当前会话 ID |

## 实战：打造自动化质量保障流水线

### Hook 1：文件编辑后自动格式化

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "bash -c 'case \"$CLAUDE_TOOL_INPUT_FILE_PATH\" in *.py) black \"$CLAUDE_TOOL_INPUT_FILE_PATH\" 2>/dev/null ;; *.js|*.ts) npx prettier --write \"$CLAUDE_TOOL_INPUT_FILE_PATH\" 2>/dev/null ;; *.java) echo \"Java 文件已修改：$CLAUDE_TOOL_INPUT_FILE_PATH\" ;; esac'"
          }
        ]
      }
    ]
  }
}
```

### Hook 2：对话结束时生成摘要

```json
{
  "hooks": {
    "Stop": [
      {
        "matcher": ".*",
        "hooks": [
          {
            "type": "command",
            "command": "echo \"[$(date '+%Y-%m-%d %H:%M')] 会话结束\" >> ~/.claude/session-log.txt"
          }
        ]
      }
    ]
  }
}
```

### Hook 3：危险命令拦截

创建脚本 `~/.claude/hooks/check-dangerous.sh`：

```bash
#!/bin/bash
# 检查危险命令

CMD="$CLAUDE_TOOL_INPUT_COMMAND"

# 检查危险模式
if echo "$CMD" | grep -qE "rm -rf /|DROP TABLE|curl.*\| *sh|wget.*\| *bash"; then
    echo "⚠️  HOOK 警告：检测到潜在危险命令，已记录日志" >&2
    echo "[$(date)] DANGEROUS CMD: $CMD" >> ~/.claude/dangerous-cmds.log
    # 返回非零退出码可以阻止命令执行（取决于 Claude Code 的配置）
fi
```

配置：
```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "~/.claude/hooks/check-dangerous.sh"
          }
        ]
      }
    ]
  }
}
```

## 安全注意事项

- Hook 命令以你的用户权限运行，**不要**在 Hook 中执行不信任的代码
- 项目级的 `.claude/settings.json` 会被 Git 追踪，**不要**在其中写入敏感信息（如 API Key）
- 敏感配置放在 `settings.local.json`（已在 `.gitignore` 中）

---exercise---
title: 配置一个自动格式化 Hook
difficulty: 高级
---
配置一个 PostToolUse Hook，在 Claude 编辑特定类型的文件后自动执行格式化：

1. 编辑 `.js` 或 `.ts` 文件后运行 `prettier`（或项目的格式化工具）
2. 验证 Hook 在实际编辑中正确触发
3. （可选）添加一个 Stop Hook，在对话结束时打印一条总结信息

---hints---
- 配置文件位于 `.claude/settings.json`（项目级）
- 先测试 Hook 命令本身是否能手动运行：`which prettier` 确认已安装
- 可以用 `echo "Hook 触发了"` 先验证触发时机，再换成真正的格式化命令
- `settings.local.json` 用于不想提交到 git 的本地配置

---solution---
`.claude/settings.json`：

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "bash -c 'EXT=\"${CLAUDE_TOOL_INPUT_FILE_PATH##*.}\"; if [[ \"$EXT\" == \"js\" || \"$EXT\" == \"ts\" || \"$EXT\" == \"jsx\" || \"$EXT\" == \"tsx\" ]]; then echo \"[Hook] 格式化: $CLAUDE_TOOL_INPUT_FILE_PATH\"; npx prettier --write \"$CLAUDE_TOOL_INPUT_FILE_PATH\" 2>&1 || true; fi'"
          }
        ]
      }
    ],
    "Stop": [
      {
        "matcher": ".*",
        "hooks": [
          {
            "type": "command",
            "command": "echo '[Hook] 对话结束，所有修改已自动格式化'"
          }
        ]
      }
    ]
  }
}
```
