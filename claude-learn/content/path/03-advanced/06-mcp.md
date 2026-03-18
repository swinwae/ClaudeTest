---
title: MCP 扩展
difficulty: 高级
readTime: 14
order: 6
tags: [MCP, 扩展, 外部工具, 集成]
---

## MCP 协议概述

MCP（Model Context Protocol）是 Anthropic 推出的开放协议，让 Claude 能连接**外部工具和数据源**，突破内置工具的限制。

没有 MCP，Claude 只能：Read、Edit、Bash、Grep、Glob...

有了 MCP，Claude 还能：
- 查询你的数据库（无需写 SQL 文件）
- 搜索最新的 API 文档
- 控制浏览器自动化
- 调用你的内部 API
- 读取 Slack 消息、GitHub Issues...

## .mcp.json 配置格式

在项目根目录或 `~/.claude/` 创建 `.mcp.json`：

```json
{
  "mcpServers": {
    "context7": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@upstash/context7-mcp@latest"]
    },
    "filesystem": {
      "type": "stdio",
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-filesystem",
        "/Users/yourname/projects"
      ]
    },
    "postgres": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-postgres"],
      "env": {
        "DATABASE_URL": "postgresql://localhost/mydb"
      }
    }
  }
}
```

每个 MCP 服务器是一个独立进程，通过 stdio 与 Claude Code 通信。

## 常用 MCP 服务器

| 服务器 | 功能 | 安装 |
|--------|------|------|
| `@modelcontextprotocol/server-filesystem` | 扩展文件系统访问范围 | `npx -y @modelcontextprotocol/server-filesystem` |
| `@modelcontextprotocol/server-postgres` | PostgreSQL 数据库查询 | `npx -y @modelcontextprotocol/server-postgres` |
| `@modelcontextprotocol/server-github` | GitHub 仓库操作 | `npx -y @modelcontextprotocol/server-github` |
| `@upstash/context7-mcp` | 获取最新库文档 | `npx -y @upstash/context7-mcp` |
| `@modelcontextprotocol/server-brave-search` | Brave 网页搜索 | `npx -y @modelcontextprotocol/server-brave-search` |

## 安装与配置 MCP 服务器

### 示例：配置 Context7（实时文档检索）

Context7 让 Claude 能获取 npm 包的最新文档，告别"用过时 API"的问题。

1. 在 `.mcp.json` 中添加：

```json
{
  "mcpServers": {
    "context7": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@upstash/context7-mcp@latest"]
    }
  }
}
```

2. 重启 Claude Code，然后在对话中：

```
> 用 context7 查一下 React 18 的 useTransition hook 的最新用法
```

### 示例：配置 PostgreSQL MCP

```json
{
  "mcpServers": {
    "postgres": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-postgres"],
      "env": {
        "DATABASE_URL": "postgresql://localhost:5432/myapp"
      }
    }
  }
}
```

配置后：

```
> 查询 users 表中最近 7 天注册的用户数量
> 分析 orders 表的索引情况，哪些查询可能需要优化？
```

## 自定义 MCP 服务器开发入门

MCP 服务器本质上是一个遵循协议的进程。用 Node.js 最简单：

```javascript
// my-mcp-server.js
const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');

const server = new Server(
  { name: 'my-tools', version: '1.0.0' },
  { capabilities: { tools: {} } }
);

// 定义工具
server.setRequestHandler('tools/list', async () => ({
  tools: [
    {
      name: 'get_project_stats',
      description: '获取项目统计信息',
      inputSchema: { type: 'object', properties: {}, required: [] }
    }
  ]
}));

// 处理工具调用
server.setRequestHandler('tools/call', async (request) => {
  if (request.params.name === 'get_project_stats') {
    return {
      content: [{
        type: 'text',
        text: JSON.stringify({ files: 42, lines: 3821, tests: 156 })
      }]
    };
  }
});

const transport = new StdioServerTransport();
server.connect(transport);
```

配置到 `.mcp.json`：

```json
{
  "mcpServers": {
    "my-tools": {
      "type": "stdio",
      "command": "node",
      "args": ["./my-mcp-server.js"]
    }
  }
}
```

---exercise---
title: 配置并使用一个 MCP 服务器
difficulty: 高级
---
选择以下任意一个任务完成：

**选项 A**：配置 Context7 MCP，用它查询你正在使用的某个库的最新 API 文档，验证 Claude 能获取到比训练数据更新的信息。

**选项 B**：配置 Filesystem MCP，限定可访问的目录为你的项目，然后尝试用 Claude 通过 MCP 工具（而非内置工具）访问文件，对比两种方式的差异。

**选项 C（挑战）**：用 Node.js 开发一个最简单的 MCP 服务器，提供一个 `search_notes` 工具，在指定目录的 `.md` 文件中全文搜索关键词。

---hints---
- Context7 安装最简单，不需要额外配置，推荐从选项 A 开始
- `.mcp.json` 放在项目根目录或 `~/.claude/.mcp.json`（全局）
- 验证 MCP 连接：Claude Code 启动时会显示已连接的 MCP 服务器
- 自定义 MCP 需要安装 SDK：`npm install @modelcontextprotocol/sdk`

---solution---
选项 A（Context7）：

`.mcp.json`：
```json
{
  "mcpServers": {
    "context7": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@upstash/context7-mcp@latest"]
    }
  }
}
```

验证对话：
```
> 用 context7 查询 Spring Boot 3.3 中 @RestControllerAdvice 的最新用法，
  特别是处理 validation 错误的推荐方式
```

如果 Claude 能返回来自 Context7 的文档内容，说明 MCP 配置成功。
