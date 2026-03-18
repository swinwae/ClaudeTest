---
title: 快捷键速查
order: 1
---

## 交互模式快捷键

| 快捷键 | 功能 |
|--------|------|
| `Ctrl+C` | 中断当前操作 |
| `Ctrl+D` | 退出（等同于 /exit） |
| `↑ / ↓` | 浏览历史输入 |
| `Tab` | 自动补全 |
| `Ctrl+L` | 清屏（不清上下文） |
| `Option+T` | 切换扩展思考模式（macOS） |
| `Alt+T` | 切换扩展思考模式（Windows/Linux） |
| `Ctrl+O` | 查看扩展思考输出 |

## 内置斜杠命令

| 命令 | 功能 |
|------|------|
| `/help` | 查看所有可用命令 |
| `/clear` | 清空当前对话上下文 |
| `/exit` | 退出 Claude Code |
| `/status` | 查看当前会话状态 |
| `/cost` | 查看本次会话的 token 用量 |
| `/model` | 切换使用的模型 |
| `/permissions` | 查看当前权限配置 |
| `/compact` | 压缩上下文节省 token |

## 启动参数

```bash
claude                          # 交互模式
claude -p "任务描述"            # 单次执行模式
claude --model claude-opus-4-6  # 指定模型
claude --dangerously-skip-permissions  # 跳过所有权限确认
claude --no-markdown            # 纯文本输出（适合管道）
claude --output-format json     # JSON 格式输出
```
