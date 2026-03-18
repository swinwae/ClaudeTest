---
title: CI/CD 集成
difficulty: 高级
readTime: 14
order: 4
tags: [CI/CD, 自动化, GitHub Actions, 无头模式]
---

## Claude Code 的非交互模式

Claude Code 支持在没有终端交互的环境（如 CI 服务器）中运行，通过 `-p` 参数一次性执行任务：

```bash
# 基本用法
claude -p "读取 src/ 目录，检查是否有明显的代码质量问题，输出报告"

# 指定工具权限（CI 中通常只允许只读工具）
claude -p "审查 PR 变更" \
  --allowedTools "Read,Grep,Glob,Bash(git diff)"

# JSON 格式输出（便于脚本解析）
claude --output-format json -p "分析代码质量" | jq '.result'

# 禁止交互式确认（CI 环境必须）
claude --dangerously-skip-permissions -p "任务描述"
```

## GitHub Actions 集成方案

在 GitHub Actions 中调用 Claude Code 需要：
1. 设置 `ANTHROPIC_API_KEY` 密钥
2. 安装 Node.js 和 Claude Code
3. 使用 `-p` 模式执行任务

**基础 workflow 结构**：

```yaml
name: Claude Code 分析

on:
  pull_request:
    types: [opened, synchronize]

jobs:
  claude-review:
    runs-on: ubuntu-latest
    permissions:
      pull-requests: write
      contents: read

    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0  # 获取完整历史，供 git diff 使用

      - uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: 安装 Claude Code
        run: npm install -g @anthropic-ai/claude-code

      - name: 运行 Claude 分析
        env:
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
        run: |
          claude --dangerously-skip-permissions \
            --allowedTools "Read,Grep,Glob,Bash(git diff,git log)" \
            -p "分析任务..." > analysis.txt

      - name: 发布结果到 PR
        uses: actions/github-script@v7
        with:
          script: |
            const fs = require('fs');
            const analysis = fs.readFileSync('analysis.txt', 'utf8');
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: `## 🤖 Claude Code 分析\n\n${analysis}`
            });
```

## 自动 PR Review 流水线

一个完整的 PR 自动审查 workflow：

```yaml
name: 自动代码审查

on:
  pull_request:
    types: [opened, synchronize]

jobs:
  review:
    runs-on: ubuntu-latest
    permissions:
      pull-requests: write
      contents: read

    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - uses: actions/setup-node@v4
        with:
          node-version: '20'

      - run: npm install -g @anthropic-ai/claude-code

      - name: Claude 代码审查
        env:
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
        run: |
          # 获取变更文件列表
          CHANGED_FILES=$(git diff origin/${{ github.base_ref }}...HEAD --name-only \
            | grep -E '\.(java|ts|js|py)$' \
            | head -20)

          if [ -z "$CHANGED_FILES" ]; then
            echo "没有需要审查的代码文件" > review.md
            exit 0
          fi

          # 构建审查提示
          FILES_LIST=$(echo "$CHANGED_FILES" | tr '\n' ' ')

          claude --dangerously-skip-permissions \
            --allowedTools "Read,Grep,Glob" \
            -p "
          请审查以下变更文件的代码质量：
          $FILES_LIST

          重点检查：
          1. 安全问题（SQL 注入、XSS、硬编码密钥）
          2. 潜在的空指针/null 风险
          3. 明显的逻辑错误
          4. 与项目现有代码风格的一致性

          输出格式：
          - 如无问题：「✅ 代码审查通过」
          - 有问题：按 CRITICAL/HIGH/MEDIUM/LOW 分级列出
          " > review.md

      - name: 发布审查结果
        if: always()
        uses: actions/github-script@v7
        with:
          script: |
            const fs = require('fs');
            const review = fs.readFileSync('review.md', 'utf8');
            await github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: `## 🤖 Claude Code 自动审查\n\n${review}\n\n*由 Claude Code 自动生成*`
            });
```

## 变更影响分析自动化

在 CI 中分析 PR 对系统的潜在影响：

```yaml
- name: 变更影响分析
  env:
    ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
  run: |
    DIFF=$(git diff origin/${{ github.base_ref }}...HEAD)

    claude --dangerously-skip-permissions \
      --allowedTools "Read,Grep,Glob" \
      -p "
    以下是 PR 的代码变更：
    $DIFF

    请分析：
    1. 这个变更影响了哪些功能模块？
    2. 有哪些其他模块可能间接受到影响？
    3. 有哪些边缘情况需要在测试中覆盖？
    4. 这个变更是否需要数据库迁移或配置变更？

    输出一份简洁的影响评估报告。
    " > impact.md
```

## 安全与权限控制

在 CI 中使用 Claude Code 需要特别注意权限控制：

```bash
# ✅ 最小权限原则：只允许只读工具
claude --allowedTools "Read,Grep,Glob,Bash(git diff,git log,git show)"

# ✅ 限制工作目录
claude --cwd "$GITHUB_WORKSPACE"

# ❌ 避免在 CI 中使用（太危险）
claude --dangerously-skip-permissions  # 允许所有操作，包括文件删除
```

**保护密钥**：

```yaml
env:
  ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}  # 从 GitHub Secrets 读取
  # 绝对不要这样做：
  # ANTHROPIC_API_KEY: "sk-ant-..."  # ❌ 硬编码在 workflow 文件中
```

---exercise---
title: 构建 GitHub Actions PR 自动审查
difficulty: 高级
---
在你的 GitHub 仓库中，创建一个 GitHub Actions workflow，实现自动 PR 代码审查：

1. 当 PR 创建或更新时触发
2. 让 Claude 审查变更文件的代码质量
3. 将审查结果作为 PR comment 自动发布

验证：创建一个测试 PR，确认 workflow 正常运行，审查结果出现在 PR 页面。

---hints---
- 需要在仓库的 Settings → Secrets → Actions 中添加 `ANTHROPIC_API_KEY`
- workflow 文件放在 `.github/workflows/claude-review.yml`
- 先用简单版本测试（不发布 comment，只 echo 结果），确认 Claude Code 可运行后再加 comment 功能
- `--allowedTools "Read,Grep,Glob"` 限制 CI 中只读操作，更安全

---solution---
完整 workflow（`.github/workflows/claude-review.yml`）：

```yaml
name: Claude Code PR Review

on:
  pull_request:
    types: [opened, synchronize]

jobs:
  review:
    runs-on: ubuntu-latest
    permissions:
      pull-requests: write
      contents: read

    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - uses: actions/setup-node@v4
        with:
          node-version: '20'

      - run: npm install -g @anthropic-ai/claude-code

      - name: Run Claude Review
        env:
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
        run: |
          CHANGED=$(git diff origin/${{ github.base_ref }}...HEAD \
            --name-only | grep -E '\.(js|ts|java|py)$' | head -10)

          if [ -z "$CHANGED" ]; then
            echo "✅ 没有需要审查的代码文件" > review.txt
          else
            claude --dangerously-skip-permissions \
              --allowedTools "Read,Grep,Glob" \
              -p "审查这些变更文件的代码质量和安全性：$CHANGED
              输出简洁的报告，有问题分 CRITICAL/HIGH/MEDIUM 列出。" \
              > review.txt
          fi

      - name: Comment PR
        uses: actions/github-script@v7
        with:
          script: |
            const fs = require('fs');
            const body = fs.readFileSync('review.txt', 'utf8');
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: `## 🤖 Claude Code 审查\n\n${body}`
            });
```
