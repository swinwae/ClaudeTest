---
title: 配置文件参考
order: 3
---

## .claude/ 目录结构

```
项目根目录/
├── CLAUDE.md                    # 项目说明书（自动加载）
└── .claude/
    ├── settings.json            # 团队设置（提交 git）
    ├── settings.local.json      # 个人覆盖（加入 .gitignore）
    ├── agents/                  # 项目专属 Agent
    │   └── my-reviewer.md
    ├── commands/                # 项目斜杠命令（/project:xxx）
    │   ├── review.md
    │   └── pre-commit.md
    └── rules/                   # 编码规范规则
        ├── git-workflow.md
        └── security.md

~/.claude/
├── CLAUDE.md                    # 全局用户偏好
├── settings.json                # 全局设置
├── agents/                      # 全局 Agent（所有项目可用）
├── commands/                    # 全局命令（/user:xxx）
└── rules/                       # 全局规则
```

## settings.json 常用配置

```json
{
  "model": "claude-sonnet-4-6",
  "theme": "dark",
  "alwaysThinkingEnabled": true,

  "permissions": {
    "allow": [
      "Bash(git *)",
      "Bash(npm *)",
      "Bash(mvn *)"
    ],
    "deny": [
      "Bash(rm -rf *)"
    ]
  },

  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "echo '文件已修改：$CLAUDE_TOOL_INPUT_FILE_PATH'"
          }
        ]
      }
    ]
  }
}
```

## Agent 文件格式

```markdown
---
name: Agent 显示名称
description: 何时使用这个 Agent（Claude 自动选择时参考此字段）
model: claude-sonnet-4-6    # 可选，不写则用默认
tools:                       # 工具白名单
  - Read
  - Grep
  - Glob
  - Bash
---

Agent 的系统提示内容（Markdown 格式）...
```

## Rule 文件格式

```markdown
---
description: 这条规则的简短说明
globs: ["*.java", "*.kt"]   # 可选：只在这些文件类型时触发
alwaysApply: false           # true = 始终加载（不受文件类型限制）
---

规则内容（Markdown 格式）...
```

## .mcp.json 格式

```json
{
  "mcpServers": {
    "服务器名": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "包名"],
      "env": {
        "ENV_VAR": "值"
      }
    }
  }
}
```
