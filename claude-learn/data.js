// 由 generate.js 自动生成 — 2026-03-18
window.LEARN_DATA = {
  "meta": {
    "version": "1.0.0",
    "generatedAt": "2026-03-18",
    "stats": {
      "lessons": 20,
      "exercises": 20,
      "practices": 2
    }
  },
  "path": [
    {
      "id": "01-getting-started",
      "title": "入门篇",
      "icon": "🚀",
      "description": "从零开始：安装、配置、基本操作",
      "lessons": [
        {
          "id": "01-getting-started/01-installation",
          "title": "安装与配置",
          "difficulty": "入门",
          "readTime": 5,
          "order": 1,
          "tags": [],
          "content": "## 什么是 Claude Code？\n\nClaude Code 是 Anthropic 推出的 AI 编程助手命令行工具（CLI），可以直接在终端中与 Claude 对话，帮助你读写文件、执行命令、调试代码，完成各种软件工程任务。\n\n与网页版 Claude 相比，Claude Code 的核心优势在于：\n\n- **直接操作本地文件** — 读取、编辑、创建代码文件，无需复制粘贴\n- **执行 Shell 命令** — 运行测试、构建项目、管理 Git\n- **理解项目上下文** — 通过 CLAUDE.md 告知项目背景，让 AI 更精准\n- **工具链集成** — 支持 MCP（Model Context Protocol）扩展能力\n\n## 系统要求\n\n- **Node.js** 18+ （推荐 20+）\n- **操作系统**：macOS、Linux、Windows（WSL2）\n- **网络**：需要访问 Anthropic API\n\n## 安装步骤\n\n### 1. 安装 Claude Code\n\n```bash\nnpm install -g @anthropic-ai/claude-code\n```\n\n如果遇到权限问题：\n\n```bash\n# macOS / Linux\nsudo npm install -g @anthropic-ai/claude-code\n\n# 或者使用 nvm 管理 Node.js（推荐，无需 sudo）\nnvm use 20\nnpm install -g @anthropic-ai/claude-code\n```\n\n### 2. 验证安装\n\n```bash\nclaude --version\n```\n\n输出示例：`@anthropic-ai/claude-code@1.x.x`\n\n### 3. 首次登录\n\n```bash\nclaude\n```\n\n首次运行会引导你完成 API Key 配置。你需要前往 [console.anthropic.com](https://console.anthropic.com) 创建 API Key。\n\n## 配置文件位置\n\nClaude Code 的配置存储在 `~/.claude/` 目录下：\n\n```\n~/.claude/\n├── settings.json        # 全局设置（模型、权限、主题等）\n├── settings.local.json  # 本地覆盖设置（不提交 git）\n└── CLAUDE.md            # 全局用户偏好（适用于所有项目）\n```\n\n项目级配置放在项目根目录的 `CLAUDE.md` 文件中（第 4 课详细介绍）。",
          "exercises": [
            {
              "id": "ex-1",
              "title": "安装 Claude Code 并查看帮助",
              "difficulty": "入门",
              "description": "完成以下任务：\n\n1. 安装 Claude Code CLI\n2. 运行 `claude --version` 确认安装成功\n3. 运行 `claude --help` 查看所有可用选项\n4. 进入 `~/.claude/` 目录，查看有哪些文件",
              "hints": "- 用 `npm install -g @anthropic-ai/claude-code` 安装\n- `ls -la ~/.claude/` 查看配置目录内容\n- 初次运行 `claude` 会提示配置 API Key",
              "solution": "```bash\n# 安装\nnpm install -g @anthropic-ai/claude-code\n\n# 验证版本\nclaude --version\n# 输出：@anthropic-ai/claude-code@1.x.x\n\n# 查看帮助\nclaude --help\n\n# 查看配置目录\nls -la ~/.claude/\n```"
            }
          ]
        },
        {
          "id": "01-getting-started/02-first-conversation",
          "title": "第一次对话",
          "difficulty": "入门",
          "readTime": 8,
          "order": 2,
          "tags": [],
          "content": "## 启动 Claude Code\n\n在终端中输入 `claude` 进入交互模式：\n\n```bash\ncd /your/project\nclaude\n```\n\n> **提示**：始终在项目根目录启动 Claude Code，这样它能读取到项目的 CLAUDE.md 配置。\n\n## 交互模式界面\n\n启动后你会看到类似这样的界面：\n\n```\n╔════════════════════════════════════════╗\n║          Claude Code v1.x.x           ║\n╚════════════════════════════════════════╝\n\n✓ 已加载项目配置：CLAUDE.md\n✓ 当前目录：/your/project\n\n>\n```\n\n## 你的第一个对话\n\n### 让 Claude 读取文件\n\n```\n> 读取 README.md 并总结项目的主要功能\n```\n\nClaude 会自动调用 `Read` 工具读取文件，然后给出总结。\n\n### 让 Claude 修改代码\n\n```\n> 在 src/utils.js 的末尾添加一个 formatDate 函数，将时间戳转换为 YYYY-MM-DD 格式\n```\n\nClaude 会读取文件、生成代码、使用 `Edit` 工具修改，并展示修改内容供你确认。\n\n### 让 Claude 运行命令\n\n```\n> 运行项目的测试，看看有哪些失败\n```\n\nClaude 会通过 `Bash` 工具执行 `npm test` 或对应的测试命令。\n\n## 权限模式\n\nClaude Code 有三种权限模式，控制工具调用时是否需要你确认：\n\n| 模式 | 说明 | 使用场景 |\n|------|------|---------|\n| **默认模式** | 危险操作需确认（删除文件、网络请求等） | 日常开发 |\n| `--dangerously-skip-permissions` | 所有操作自动批准 | 信任的自动化场景 |\n| 手动审批 | 每个工具调用都需要确认 | 学习阶段 |\n\n## 常用快捷键\n\n| 快捷键 | 功能 |\n|--------|------|\n| `Ctrl+C` | 中断当前操作 |\n| `Ctrl+D` 或 `/exit` | 退出 Claude Code |\n| `↑/↓` 方向键 | 浏览历史命令 |\n| `/clear` | 清空对话上下文 |\n| `/help` | 查看所有命令 |\n\n## 单次执行模式\n\n不需要进入交互模式时，可以用 `-p` 参数一次性执行：\n\n```bash\nclaude -p \"查看 src/ 目录下有哪些文件，列出它们的功能\"\n```\n\n这在 CI/CD 或脚本中非常有用。",
          "exercises": [
            {
              "id": "ex-1",
              "title": "与 Claude 进行第一次对话",
              "difficulty": "入门",
              "description": "在你的任意一个项目目录中（或新建一个测试目录），完成以下任务：\n\n1. 启动 Claude Code：`claude`\n2. 让 Claude 列出当前目录的文件结构\n3. 让 Claude 创建一个 `hello.md` 文件，内容包含今天的日期和一句话自我介绍\n4. 退出 Claude Code（使用 `/exit` 或 `Ctrl+D`）\n5. 验证 `hello.md` 文件已被创建",
              "hints": "- 在步骤 2 中，可以说\"列出当前目录的所有文件和子目录\"\n- 在步骤 3 中，可以说\"创建一个 hello.md 文件，写入今天的日期 2026-03-18 和一句话自我介绍\"\n- Claude 创建文件时会展示内容供你确认，按 Enter 确认",
              "solution": "```bash\n# 新建测试目录\nmkdir ~/claude-test && cd ~/claude-test\n\n# 启动 Claude Code\nclaude\n\n# 在对话中输入：\n# > 列出当前目录的所有文件\n# > 创建一个 hello.md 文件，内容包含今天的日期 2026-03-18 和一句话自我介绍\n# > /exit\n\n# 验证文件已创建\ncat hello.md\n```"
            }
          ]
        },
        {
          "id": "01-getting-started/03-basic-tools",
          "title": "核心工具：Read、Edit、Bash",
          "difficulty": "入门",
          "readTime": 10,
          "order": 3,
          "tags": [],
          "content": "## Claude Code 的工具系统\n\nClaude Code 通过调用**工具（Tools）**来与你的文件系统和终端交互。理解核心工具，能让你更精准地表达需求，也能更好地理解 Claude 在做什么。\n\n## Read — 读取文件\n\n`Read` 工具读取指定文件的内容，支持指定行号范围：\n\n```\n> 读取 src/index.js 的第 50-100 行\n```\n\n**何时自动触发**：\n- 你提到具体文件名时\n- Claude 需要了解现有代码才能修改时\n- 你说\"看看 xxx 文件里是怎么写的\"时\n\n**技巧**：如果你想让 Claude 先理解代码再修改，可以明确说：\n\n```\n> 先读取 UserService.java，理解现有逻辑，然后告诉我如何添加邮箱验证功能\n```\n\n## Edit — 修改文件\n\n`Edit` 工具对文件做**精确字符串替换**（不是整体重写），这让改动最小化、易于审查。\n\n**修改前，Claude 必须先读取文件**，这是为了确保替换的字符串确实存在。\n\n**你的提示示例**：\n```\n> 将 calculateTotal 函数中的税率从 0.1 改为 0.13\n```\n\n**Write 工具**（创建新文件）：\n```\n> 创建 src/config.js 文件，导出数据库连接配置对象\n```\n\n## Bash — 执行命令\n\n`Bash` 工具在终端执行 Shell 命令：\n\n```\n> 运行 npm test，看看测试是否通过\n> 查找所有包含 \"TODO\" 注释的文件\n> 运行 git log --oneline -10 查看最近提交\n```\n\n**常用场景**：\n\n```bash\n# 运行测试\n> 运行项目的单元测试，如果有失败，解释原因\n\n# 查找代码\n> 搜索所有调用了 sendEmail 函数的地方\n\n# Git 操作\n> 查看哪些文件被修改了，用 git status\n\n# 安装依赖\n> 安装 lodash 并添加到 package.json\n```\n\n## Glob — 文件搜索\n\n`Glob` 工具通过通配符模式查找文件：\n\n```\n> 找出所有 .test.js 文件\n> 找出 src/components/ 下所有 .tsx 文件\n```\n\n## Grep — 内容搜索\n\n`Grep` 工具在文件内容中搜索正则表达式：\n\n```\n> 搜索代码中所有 console.log 调用\n> 找出哪些文件里引入了 axios\n```\n\n## 工具的权限提示\n\n当 Claude 要调用某些工具时，你会看到确认提示：\n\n```\n⚠️  Claude 想要执行：\n    Bash: rm -rf dist/\n\n[y] 允许  [n] 拒绝  [a] 始终允许此命令\n```\n\n- `y`：本次允许\n- `n`：拒绝，Claude 会寻找替代方案\n- `a`：将此命令加入白名单，后续不再询问",
          "exercises": [
            {
              "id": "ex-1",
              "title": "用三种核心工具完成一个小任务",
              "difficulty": "入门",
              "description": "在一个测试目录中，用 Claude Code 完成以下完整流程：\n\n1. 让 Claude 创建一个 `calc.js` 文件，包含 `add`、`subtract`、`multiply` 三个函数\n2. 让 Claude 读取 `calc.js`，然后在文件末尾添加 `divide` 函数（需要处理除以零的情况）\n3. 让 Claude 执行 `node -e \"const c = require('./calc'); console.log(c.add(3,4))\"` 验证代码可运行",
              "hints": "- 步骤 1：说\"创建 calc.js，包含 add、subtract、multiply 三个导出函数\"\n- 步骤 2：说\"读取 calc.js，然后添加一个 divide 函数，除数为零时返回 null\"\n- 步骤 3：说\"运行命令验证 add 函数的输出是 7\"",
              "solution": "对话示例：\n\n```\n> 创建 calc.js 文件，包含 add、subtract、multiply 三个导出函数，使用 module.exports 导出\n\n> 读取 calc.js，然后在末尾添加 divide 函数：两数相除，如果除数为零则返回 null，同样导出\n\n> 执行命令：node -e \"const c = require('./calc'); console.log('add:', c.add(3,4)); console.log('divide by zero:', c.divide(5,0))\"\n```\n\n预期输出：\n```\nadd: 7\ndivide by zero: null\n```"
            }
          ]
        },
        {
          "id": "01-getting-started/04-claude-md",
          "title": "CLAUDE.md — 给 AI 的项目说明书",
          "difficulty": "入门",
          "readTime": 12,
          "order": 4,
          "tags": [],
          "content": "## 为什么需要 CLAUDE.md？\n\n每次启动 Claude Code，它都需要了解你的项目背景：技术栈是什么？有哪些特殊规范？哪些命令常用？如果每次都口头说明，既重复又容易遗漏。\n\n`CLAUDE.md` 是一个放在项目根目录的 Markdown 文件，Claude Code 启动时**自动加载**，作为持久的项目上下文。\n\n## 什么应该放进 CLAUDE.md？\n\n### ✅ 应该包含\n\n**1. 常用命令**\n```markdown\n## 常用命令\n\\`\\`\\`bash\nnpm run dev    # 启动开发服务器（端口 3000）\nnpm test       # 运行单元测试\nnpm run build  # 生产构建\n\\`\\`\\`\n```\n\n**2. 架构概述**\n```markdown\n## 架构说明\n- 前端：React 18 + TypeScript，状态管理用 Zustand\n- 后端：Express + PostgreSQL，ORM 用 Prisma\n- 认证：JWT，token 存在 httpOnly Cookie 中\n```\n\n**3. 重要约定和规范**\n```markdown\n## 代码规范\n- 所有注释使用中文\n- 禁止使用 var，统一用 const/let\n- 数据库字段命名用 snake_case，JS 变量用 camelCase\n```\n\n**4. 特殊注意事项**\n```markdown\n## 注意事项\n- `src/legacy/` 目录是遗留代码，不要修改\n- 支付相关改动必须同时修改 PaymentService 和 AuditLog\n- 测试时用 TEST 环境，不要连接生产数据库\n```\n\n### ❌ 不需要包含\n\n- 可以从代码中读取的信息（如函数签名、类结构）\n- Git 历史（Claude 可以自己查 `git log`）\n- 过于细节的实现说明（放注释里更好）\n\n## 多层级 CLAUDE.md\n\nClaude Code 支持在子目录放置 CLAUDE.md，形成层级配置：\n\n```\nproject/\n├── CLAUDE.md                    # 项目级：整体架构\n├── frontend/\n│   └── CLAUDE.md                # 前端专用规范\n└── backend/\n    └── CLAUDE.md                # 后端专用规范\n```\n\n进入某目录时，Claude 会合并加载所有上级的 CLAUDE.md。\n\n## 全局 CLAUDE.md\n\n`~/.claude/CLAUDE.md` 适用于所有项目，可以放通用偏好：\n\n```markdown\n# 我的全局偏好\n\n- 代码注释使用中文\n- 回答简洁，不要重复已知内容\n- 提交信息用中文写，遵循 Conventional Commits 格式\n- 修改文件前先读取，不要凭空生成\n```\n\n## 一个完整的 CLAUDE.md 示例\n\n```markdown\n# CLAUDE.md\n\n## 项目简介\n电商后台管理系统，基于 Spring Boot 3.3 + Vue 3。\n\n## 常用命令\n\\`\\`\\`bash\n# 后端\ncd backend && mvn spring-boot:run -Dspring-boot.run.profiles=dev\n# 前端\ncd frontend && npm run dev\n# 全量测试\n./scripts/test-all.sh\n\\`\\`\\`\n\n## 架构\n- 后端：Spring Boot + JPA + MySQL 8\n- 前端：Vue 3 + Pinia + Element Plus\n- 认证：Spring Security + JWT\n- 配置：application-dev.yml（开发）/ application-prod.yml（生产）\n\n## 规范\n- Java：驼峰命名，Service 层不直接操作 Repository\n- Vue：组件名 PascalCase，props 用 TypeScript 类型定义\n- API：RESTful，统一返回 Result<T> 包装类\n\n## 禁区\n- 不要修改 src/main/resources/db/schema.sql（生产数据库脚本）\n- 管理员密码在 DataInitializer.java 中，修改前确认\n```",
          "exercises": [
            {
              "id": "ex-1",
              "title": "为你的项目创建 CLAUDE.md",
              "difficulty": "入门",
              "description": "为你当前（或练习用的）项目创建 CLAUDE.md：\n\n1. 在项目根目录创建 `CLAUDE.md` 文件\n2. 至少包含以下三个部分：常用命令、技术栈说明、一条注意事项\n3. 重新启动 Claude Code，验证它加载了 CLAUDE.md（可以问它\"项目用的什么技术栈\"）",
              "hints": "- 如果没有现成项目，用 `mkdir test-project && cd test-project` 创建一个测试目录\n- 可以让 Claude 帮你生成初始 CLAUDE.md：`claude -p \"帮我为这个 Node.js 项目生成一个 CLAUDE.md 模板\"`\n- 重启后问 Claude：\"根据 CLAUDE.md，这个项目用什么命令启动？\"来验证加载成功",
              "solution": "一个最小可用的 CLAUDE.md：\n\n```markdown\n# CLAUDE.md\n\n## 常用命令\n\\`\\`\\`bash\nnpm start       # 启动项目\nnpm test        # 运行测试\nnpm run build   # 构建\n\\`\\`\\`\n\n## 技术栈\n- 语言：Node.js 20 + TypeScript\n- 框架：Express 4\n- 数据库：PostgreSQL + Prisma ORM\n\n## 注意事项\n- 环境变量放在 .env 文件（不提交 git）\n- 数据库迁移用 `npx prisma migrate dev`\n```\n\n验证加载：\n```bash\nclaude\n> 根据项目配置，我应该用什么命令启动服务？\n# Claude 应该回答 npm start\n```"
            }
          ]
        }
      ]
    },
    {
      "id": "02-core",
      "title": "核心篇",
      "icon": "⚡",
      "description": "掌握核心技能：文件操作、代码生成、Git 工作流",
      "lessons": [
        {
          "id": "02-core/01-glob-grep",
          "title": "文件搜索与导航 — Glob 与 Grep",
          "difficulty": "中级",
          "readTime": 12,
          "order": 1,
          "tags": [],
          "content": "## 为什么需要搜索工具？\n\n在真实项目中，代码库往往有数百甚至数千个文件。当你需要修改一个功能时，光靠\"猜\"文件在哪里远远不够。Claude Code 提供两个专用搜索工具：\n\n- **Glob** — 按**文件名模式**查找文件\n- **Grep** — 按**内容正则表达式**搜索代码\n\n两者相互补充，覆盖所有代码定位场景。\n\n## Glob：按名字找文件\n\nGlob 使用通配符模式匹配文件路径：\n\n```\n> 找出所有 .test.js 文件\n（Glob: **/*.test.js）\n\n> 找出 src/components/ 下所有 .tsx 文件\n（Glob: src/components/**/*.tsx）\n\n> 找出项目中所有配置文件\n（Glob: **/*.{json,yaml,yml,toml}）\n```\n\n**常用通配符**：\n\n| 通配符 | 含义 | 示例 |\n|--------|------|------|\n| `*` | 匹配当前目录下任意文件名 | `*.js` |\n| `**` | 递归匹配所有子目录 | `**/*.ts` |\n| `?` | 匹配单个字符 | `file?.js` |\n| `{a,b}` | 匹配多个选项之一 | `*.{js,ts}` |\n\n**实际提示示例**：\n\n```\n> 找出所有包含 \"Controller\" 的 Java 文件\n> 找出 test/ 目录下所有测试文件\n> 列出 src/ 里所有 index.ts 文件\n```\n\n## Grep：按内容搜代码\n\nGrep 用正则表达式搜索文件内容，有三种输出模式：\n\n### 模式一：files_with_matches（默认）\n\n只返回匹配的文件路径，适合快速定位：\n\n```\n> 找出哪些文件引入了 axios\n（Grep: import.*axios，输出文件列表）\n\n> 哪些文件包含 TODO 注释？\n```\n\n### 模式二：content\n\n返回匹配的具体代码行，适合查看上下文：\n\n```\n> 搜索所有 console.log 调用，显示前后 2 行\n> 找出所有抛出 RuntimeException 的地方，显示上下文\n```\n\n### 模式三：count\n\n统计每个文件的匹配次数，适合分析技术债务：\n\n```\n> 统计各文件中 any 类型使用的次数（TypeScript 项目）\n> 统计每个文件的 TODO 数量\n```\n\n## 组合技：Glob + Grep 工作流\n\n真正高效的用法是先用 Glob 缩小范围，再用 Grep 精确定位：\n\n```\n# 步骤 1：找到所有 Service 文件\n> 用 Glob 找出 src/ 下所有以 Service.ts 结尾的文件\n\n# 步骤 2：在这些文件中搜索\n> 在这些文件中，Grep 搜索 \"sendEmail\" 调用\n```\n\n或者直接用 Grep 的 `glob` 参数限定范围：\n\n```\n> 在所有 .java 文件中搜索 @Transactional 注解\n> 只在 test/ 目录的 TypeScript 文件中搜索 describe(\n```\n\n## 实战：在陌生项目中快速定位功能代码\n\n加入新项目后，用搜索工具快速建立代码地图：\n\n```\n1. > 找出所有路由定义文件（Glob: **/*routes*.*、**/*router*.*）\n\n2. > 搜索用户认证相关代码（Grep: login|authenticate|jwt|token）\n\n3. > 找出数据库模型/实体文件（Glob: **/models/**、**/entity/**）\n\n4. > 搜索环境变量的使用（Grep: process.env\\.\\w+）—— 快速了解所有配置项\n```\n\n这个流程通常只需 5 分钟，就能对一个陌生项目有基本了解。",
          "exercises": [
            {
              "id": "ex-1",
              "title": "在开源项目中追踪一个函数的所有调用",
              "difficulty": "中级",
              "description": "找一个中等规模的项目（或使用本学习站的 myblog 项目），完成以下任务：\n\n1. 用 Glob 找出所有 Controller/控制器文件\n2. 用 Grep 搜索某个特定方法（如 `findById` 或 `save`）的所有调用，显示上下文\n3. 统计 `TODO` 和 `FIXME` 注释各有多少处（使用 count 模式）\n4. 总结：这个项目的技术债主要集中在哪些文件？",
              "hints": "- 可以对 ClaudeTest/myblog 项目说：「找出所有 Repository 接口文件」\n- 统计 TODO 时可以说：「用 Grep count 模式，统计每个 Java 文件中 TODO 注释的数量，按数量排序」\n- 如果项目没有 TODO，可以搜索其他关键词如 `deprecated` 或 `HACK`",
              "solution": "示例对话（以 myblog 为例）：\n\n```\n> 用 Glob 找出 src/ 下所有 Java 文件中包含 \"Repository\" 的文件\n\n> 在 Repository 文件中，Grep 搜索 findBy 开头的方法定义\n\n> 用 Grep count 模式，统计 myblog 所有 Java 文件中 TODO 注释的数量\n\n> 根据搜索结果，告诉我哪个文件有最多的自定义查询方法？\n```"
            }
          ]
        },
        {
          "id": "02-core/02-code-generation",
          "title": "代码生成最佳实践",
          "difficulty": "中级",
          "readTime": 15,
          "order": 2,
          "tags": [],
          "content": "## 代码生成的常见陷阱\n\n直接让 Claude \"写一个登录功能\"，往往得到的代码：\n\n- 风格与项目不一致（缩进、命名、错误处理方式）\n- 重造了项目已有的轮子\n- 忽略了项目特有的架构约定\n\n根本原因：**Claude 没有足够的上下文**。代码生成的质量，90% 取决于你提供的上下文质量。\n\n## \"先读后写\"模式\n\n最重要的代码生成原则：**让 Claude 先读相关代码，再生成新代码**。\n\n```\n❌ 差的方式：\n> 帮我写一个 CategoryService，实现 CRUD 功能\n\n✅ 好的方式：\n> 先读取 PostService.java，理解现有的代码风格、错误处理方式和分层结构，\n  然后按照完全相同的模式，为 Category 实体创建 CategoryService\n```\n\n一次典型的\"先读后写\"流程：\n\n```\n1. > 读取 UserController.java 和 UserService.java，\n     告诉我这个项目的 Controller-Service 分层是怎么组织的\n\n   Claude 分析：控制器只处理 HTTP，Service 包含业务逻辑，\n   统一用 Result<T> 返回，异常用 @ControllerAdvice 处理...\n\n2. > 好，按照完全相同的模式，为 Product 实体创建：\n     ProductController（分页查询、单个获取、创建、更新、删除）\n     ProductService（接口 + 实现）\n```\n\n## 用约束提升生成质量\n\n模糊的需求 = 模糊的结果。用约束把需求变精确：\n\n### 约束模板\n\n```\n功能：[你要实现什么]\n风格：[参考哪些现有代码/风格要求]\n约束：\n  - 错误处理：[如何处理异常]\n  - 命名规范：[变量/函数/类的命名方式]\n  - 不能做：[哪些实现方式要避免]\n输出格式：[需要哪些文件]\n```\n\n### 实际示例\n\n```\n> 为 Order 实体实现状态机\n\n约束：\n- 参考 Payment.java 的状态管理方式（枚举 + switch）\n- 非法状态转换时抛出 IllegalStateException\n- 每次状态变更写入 OrderHistory（参考 UserHistory.java）\n- 不要用外部状态机库，保持零依赖\n- 方法名用动词：confirm()、cancel()、ship()、complete()\n```\n\n## 增量生成 vs 一次性生成\n\n**一次性生成大量代码**的问题：错误很难追踪，风格容易飘移，上下文容易超限。\n\n**推荐：增量生成**，每步完成后验证：\n\n```\n步骤 1：> 先只生成 Category 实体类（含 JPA 注解），不要 Service 和 Controller\n\n         [验证实体类正确]\n\n步骤 2：> 好，现在生成 CategoryRepository，\n           需要包含按 name 查询和统计文章数的方法\n\n         [验证 Repository 接口]\n\n步骤 3：> 生成 CategoryService 接口和实现，\n           参考已有的 PostServiceImpl 风格\n\n         [验证 Service]\n\n步骤 4：> 最后生成 CategoryController，RESTful 风格，\n           返回统一的 Result<T> 包装\n```\n\n增量生成的每一步都更小、更聚焦，出错概率更低，问题定位也更容易。\n\n## 处理生成错误：迭代修正策略\n\n生成的代码第一次不工作很正常。正确的修正方式：\n\n```\n1. 不要删掉代码重新生成 ——\n   把错误信息直接粘给 Claude\n\n> 运行后出现以下错误，请修复：\n  [粘贴错误信息]\n\n2. 如果同一错误重复出现，说明 Claude 缺少上下文 ——\n   主动补充\n\n> 这个错误是因为项目使用了自定义的 BaseEntity，\n  它有 createdAt/updatedAt 字段且用了 @EntityListeners，\n  请根据 BaseEntity.java 的定义修复\n\n3. 避免说\"不对，重写\" —— 说清楚哪里不对\n\n❌ > 这不是我想要的，重新写一遍\n✅ > 错误处理方式不对，这个项目用 Optional 而不是 null 检查，\n     请修改 findById 的实现\n```\n\n## 实战：为现有项目添加新功能模块\n\n以 myblog 为例，添加文章\"点赞\"功能：\n\n```\n> 先读取 Post.java 和 PostRepository.java，\n  了解文章实体和数据访问层的结构\n\n> 再读取 PostService.java，了解 Service 层的模式\n\n> 现在设计并实现文章点赞功能：\n  - 新建 PostLike 实体（用户+文章的联合唯一键）\n  - 扩展 PostRepository：统计点赞数\n  - 在 PostService 添加 like/unlike 方法（幂等，重复点赞不报错）\n  - 在 AdminController 不加（前台功能），\n    提示我怎么在 BlogController 添加点赞 API\n\n  参考项目现有的分层方式，不引入新的外部依赖\n```",
          "exercises": [
            {
              "id": "ex-1",
              "title": "按现有风格生成新模块",
              "difficulty": "中级",
              "description": "在你的项目中（或 myblog），完成以下练习：\n\n1. 让 Claude 先读取 2-3 个现有的类，总结项目的代码风格（命名规范、错误处理、分层方式）\n2. 提出一个新功能需求，要求 Claude 按照完全相同的风格生成\n3. 对比生成的代码与现有代码，找出 3 处风格一致的地方和 1-2 处需要调整的地方",
              "hints": "- 可以让 Claude 先\"做一个风格分析报告\"，列出项目的编码模式，再基于这个报告生成代码\n- 如果使用 myblog，可以让 Claude 生成一个新的 \"Page（静态页面）\" 实体，类比 Post 的完整实现",
              "solution": "示例对话：\n\n```\n> 阅读 Post.java、PostService.java、PostController 中关于 POST 的部分，\n  总结这个项目的代码风格规则（至少 5 条）\n\n> 根据你总结的风格规则，为 \"Announcement（公告）\" 实体生成完整的 CRUD：\n  实体类、Repository、Service 接口+实现、Controller\n\n> 检查你生成的代码，哪些地方可能与现有风格不一致？主动指出并修正。\n```"
            }
          ]
        },
        {
          "id": "02-core/03-git-workflow",
          "title": "Git 工作流集成",
          "difficulty": "中级",
          "readTime": 12,
          "order": 3,
          "tags": [],
          "content": "## Claude Code 中的 Git 操作\n\nClaude Code 可以通过 Bash 工具直接执行任何 git 命令。这意味着从创建分支到提交 PR，整个 Git 工作流都可以在对话中完成。\n\n常见的 Git 操作示例：\n\n```\n> 查看哪些文件被修改了\n> 创建一个 feat/user-auth 分支\n> 暂存所有修改并提交，生成一个符合 Conventional Commits 的 commit message\n> 查看最近 10 条 commit 历史\n> 将这个分支推送到远程\n```\n\n## 智能 Commit Message 生成\n\n这是 Claude Code 最实用的 Git 功能之一——根据实际的代码变更自动生成 commit message。\n\n**标准流程**：\n\n```\n1. 完成代码修改后\n\n2. > 查看 git diff，然后生成一个符合 Conventional Commits 格式的 commit message\n\n   Claude 会：\n   - 读取 git diff 内容\n   - 分析变更的类型（feat/fix/refactor/docs...）\n   - 用中文写出简洁准确的描述\n\n3. > 确认这个 message 合适，然后创建 commit\n```\n\n**Conventional Commits 格式**：\n\n```\n<type>: <description>\n\n[optional body]\n```\n\n| type | 用途 |\n|------|------|\n| `feat` | 新功能 |\n| `fix` | 修复 bug |\n| `refactor` | 重构（不改变功能） |\n| `docs` | 文档变更 |\n| `test` | 测试相关 |\n| `chore` | 构建、依赖等杂项 |\n| `perf` | 性能优化 |\n\n## 分支管理策略\n\n在 CLAUDE.md 或 Rules 中定义分支命名规范，Claude 会自动遵守：\n\n```markdown\n## Git 规范\n- 功能分支：feat/<功能名>\n- 修复分支：fix/<问题描述>\n- 分支名用英文小写+连字符\n- 不直接向 main 提交\n```\n\n之后只需说：\n\n```\n> 我要开始开发文章置顶功能，帮我创建合适的分支\n（Claude 会自动创建 feat/article-sticky 分支）\n```\n\n## Pull Request 创建与描述生成\n\n让 Claude 基于完整的 diff 生成 PR 描述：\n\n```\n> 查看这个分支相对 main 的所有变更（git diff main...HEAD），\n  生成一份 PR 描述，包括：\n  - 一句话标题（< 70 字）\n  - 变更摘要（3-5 条要点）\n  - 测试计划（以 checklist 形式）\n```\n\n**关键：用 `git diff main...HEAD`**，而不是只看最后一次 commit——PR 通常包含多次提交。\n\n如果使用 GitHub CLI：\n\n```\n> 使用 gh pr create 创建 PR，标题和 body 用刚才生成的内容\n```\n\n## 冲突解决辅助\n\n合并冲突时，让 Claude 帮你理解并解决：\n\n```\n> git merge 后出现了冲突，读取冲突文件，\n  解释两个版本的区别，然后建议合理的合并方式\n\n> 解释这个冲突：\n  <<<<<<< HEAD\n  [你的版本]\n  =======\n  [对方的版本]\n  >>>>>>> feature/xxx\n\n  应该保留哪个版本，还是合并？\n```\n\n## 实战：完整的功能开发 Git 流程\n\n```bash\n# 开始新功能\n> 创建 feat/article-tags 分支并切换到它\n\n# ... 开发过程 ...\n\n# 分阶段提交\n> 查看 git diff，为 Tag 实体和 Repository 的修改生成 commit\n\n> 查看剩余的未提交修改，为 Service 和 Controller 的变更生成另一个 commit\n\n# 推送并创建 PR\n> 推送分支到远程，然后生成 PR 描述\n> 使用 gh pr create 创建 PR\n```",
          "exercises": [
            {
              "id": "ex-1",
              "title": "从功能开发到 PR 的完整 Git 流程",
              "difficulty": "中级",
              "description": "在任意一个 git 项目中，完成一次完整的功能开发 Git 流程：\n\n1. 让 Claude 创建一个命名规范的功能分支\n2. 进行一个小的代码修改（添加或修改任意功能）\n3. 让 Claude 基于 `git diff` 生成 Conventional Commits 格式的 commit message，确认后提交\n4. 让 Claude 生成一份完整的 PR 描述（标题 + 摘要 + 测试计划）",
              "hints": "- 如果没有合适的项目，可以在 claude-learn 目录里添加一篇课程内容，然后走一遍 Git 流程\n- 生成 commit message 时，可以说「先读 git diff，然后用中文 Conventional Commits 格式生成 commit message，不要直接提交，先让我确认」\n- PR 描述生成：「用 git diff main...HEAD 查看所有变更，生成一份 Markdown 格式的 PR 描述」",
              "solution": "```bash\n# 在 Claude Code 中的对话：\n\n> 基于当前分支，创建一个 feat/add-lesson-core 功能分支\n\n> [做一些修改，比如添加一个课程文件]\n\n> 查看 git status 和 git diff，然后生成符合 Conventional Commits 规范的中文 commit message\n\n> commit message 合适，帮我执行 git add 和 git commit\n\n> 用 git diff main...HEAD 查看这个分支的所有变更，生成一份 PR 描述：\n  包括变更标题（< 70 字）、3 条变更摘要、5 条测试 checklist\n```"
            }
          ]
        },
        {
          "id": "02-core/04-tdd",
          "title": "测试驱动开发（TDD）",
          "difficulty": "中级",
          "readTime": 15,
          "order": 4,
          "tags": [],
          "content": "## 为什么 TDD 与 AI 编程是天作之合\n\n传统上，TDD 很难坚持——写测试比写功能枯燥，而且需要对需求有清晰的理解才能写出好测试。\n\nClaude Code 改变了这个局面：\n\n- **AI 帮你写测试** — 从需求描述直接生成全面的测试用例，包括边界情况\n- **测试约束代码行为** — 先有测试，Claude 生成的代码有明确目标\n- **即时反馈** — 让 Claude 运行测试，看到红/绿状态立即修正\n\n结果：**更少的 back-and-forth，更高的代码质量**。\n\n## Red-Green-Refactor 循环\n\nTDD 的核心是三步循环：\n\n```\n🔴 RED：先写一个失败的测试\n         ↓\n🟢 GREEN：写最少的代码使测试通过\n         ↓\n🔵 REFACTOR：优化代码，保持测试通过\n         ↓\n（回到 RED，继续下一个功能点）\n```\n\n每个循环应该**很小**——通常只测试一个行为点。\n\n## 让 Claude 先写测试\n\n对 Claude Code 来说，\"先写测试\"意味着：\n\n```\n1. 描述功能需求（而不是直接要求实现）\n\n> 我需要实现一个 slugify 函数：\n  - 将字符串转为 URL 友好格式\n  - 大写转小写\n  - 空格和特殊字符替换为连字符\n  - 移除首尾连字符\n  - 连续连字符合并为一个\n\n  先为这个函数写完整的测试用例（Jest/Vitest），\n  包括：正常情况、边界值（空字符串、全特殊字符）、中文输入、\n  长字符串、已经是 slug 格式的字符串\n\n  测试写好后，不要写实现，先让我看测试\n```\n\n这样得到的测试会覆盖你可能没想到的边界情况。\n\n## 从测试失败到实现通过\n\n测试确认后，再要求实现：\n\n```\n2. 测试确认后\n\n> 好，这些测试覆盖得很全。现在运行测试，\n  确认它们全部失败（因为函数还不存在）\n\n3. 运行测试，看到全红\n\n> 现在实现 slugify 函数，目标是让所有测试通过。\n  用最简单的实现，不需要额外的功能\n\n4. 运行测试，看到全绿\n\n> 所有测试通过了。现在看看实现是否有可以重构的地方？\n  （但要保持测试全部通过）\n```\n\n## 边界条件与异常路径测试\n\nAI 的一大优势是能系统性地枚举边界条件，不遗漏：\n\n```\n> 为 divide(a, b) 函数生成测试，\n  要求覆盖所有边界情况：\n  - 正常除法\n  - 除数为零\n  - 负数\n  - 浮点数精度\n  - 极大值/极小值（Infinity、Number.MAX_SAFE_INTEGER）\n  - 非数字输入（null、undefined、字符串）\n```\n\n## 为遗留代码补写测试\n\n已有代码没有测试是很常见的情况。让 Claude 反向生成测试：\n\n```\n> 读取 UserService.java（约 150 行），\n  分析所有执行路径（正常流程、条件分支、异常处理），\n  生成覆盖率目标 90% 的单元测试套件（JUnit 5 + Mockito）\n\n  重点覆盖：\n  - 每个 public 方法的正常情况\n  - if/else 的每个分支\n  - 可能抛出异常的地方\n  - 边界输入（null、空集合、超长字符串）\n```\n\n## 实战：TDD 开发一个工具函数库\n\n```\n步骤 1：\n> 我要开发一个日期工具库（dateUtils.js），\n  包含以下函数：\n  - formatDate(date, format) — 格式化日期\n  - isWeekend(date) — 判断是否周末\n  - addDays(date, n) — 加减天数\n  - diffDays(date1, date2) — 计算相差天数\n\n  先为这四个函数生成完整测试（Vitest），\n  不写任何实现代码\n\n步骤 2：\n> 运行测试，确认全部失败\n\n步骤 3：\n> 逐个实现函数，每实现一个就运行测试，\n  看到绿色后再继续下一个\n\n步骤 4：\n> 全部测试通过后，检查实现代码是否有重构空间\n```",
          "exercises": [
            {
              "id": "ex-1",
              "title": "TDD 实现字符串工具库",
              "difficulty": "中级",
              "description": "用 TDD 方式开发一个字符串工具库，包含三个函数：\n\n1. `slugify(str)` — 转 URL 友好格式（含中文支持）\n2. `truncate(str, maxLen)` — 截断字符串，超长加 `...`\n3. `escapeHtml(str)` — 转义 HTML 特殊字符（`<>&\"'`）\n\n**严格遵守顺序**：先写所有测试 → 确认全红 → 再实现 → 确认全绿",
              "hints": "- 让 Claude 一次为三个函数写所有测试，然后你审查确认\n- 确认测试合理后，说「现在运行测试，应该全部失败」\n- 再说「现在逐个实现这三个函数，每完成一个就运行测试」\n- 中文 slugify 可以选择直接移除中文，或者用拼音转换（简单起见移除即可）",
              "solution": "示例对话流程：\n\n```\n> 用 TDD 方式开发 stringUtils.js，\n  先为 slugify、truncate、escapeHtml 三个函数写完整的 Vitest 测试。\n  测试要覆盖正常情况、边界值（空字符串、null）、特殊字符。\n  暂时不写实现。\n\n[Claude 生成测试文件]\n\n> 先运行这些测试，确认都失败（因为函数还没实现）\n\n> 好，现在按顺序实现：先实现 slugify，运行测试看是否通过，\n  通过后再实现 truncate，最后实现 escapeHtml\n\n> 全部通过后，检查代码质量，有没有可以改进的地方？\n```"
            }
          ]
        },
        {
          "id": "02-core/05-prompt-engineering",
          "title": "Prompt 工程技巧",
          "difficulty": "中级",
          "readTime": 14,
          "order": 5,
          "tags": [],
          "content": "## Prompt 的三要素模型\n\n一个高质量的 Prompt 包含三个要素：\n\n```\n┌─────────────────────────────────────────┐\n│  上下文（Context）：你在做什么？         │\n│  - 项目背景、当前状态、已有尝试          │\n│                                          │\n│  意图（Intent）：你想要什么？            │\n│  - 明确的目标、期望的输出格式            │\n│                                          │\n│  约束（Constraints）：有什么限制？       │\n│  - 技术栈、风格要求、不能做什么          │\n└─────────────────────────────────────────┘\n```\n\n缺少任何一个要素都会导致输出质量下降。\n\n## 结构化 Prompt 模板\n\n### 模板一：功能实现\n\n```\n我正在 [项目类型]，使用 [技术栈]。\n\n我需要实现 [功能描述]。\n\n要求：\n- [具体要求 1]\n- [具体要求 2]\n\n参考现有代码：[文件名] 中的 [类/函数名]\n\n不要：\n- [不希望的实现方式]\n- [要避免引入的依赖]\n```\n\n### 模板二：代码修复\n\n```\n以下代码有问题：[描述问题]\n\n错误信息：\n[粘贴错误信息]\n\n相关代码上下文：[文件名:行号]\n\n期望行为：[应该发生什么]\n实际行为：[实际发生了什么]\n```\n\n### 模板三：代码审查\n\n```\n请审查 [文件名]，重点关注：\n- [具体关注点 1，如\"安全性\"]\n- [具体关注点 2，如\"性能瓶颈\"]\n\n背景：这个文件处理 [功能描述]，\n每天处理约 [使用量]，用户包括 [用户类型]。\n```\n\n## 上下文注入技巧：@file 与文件引用\n\n### 精准指定文件\n\n与其说\"读取相关文件\"，不如直接指定：\n\n```\n❌ 模糊\n> 看看相关的认证代码，帮我添加 OAuth 登录\n\n✅ 精准\n> 读取这三个文件后给我建议：\n  SecurityConfig.java（安全配置）\n  AuthController.java（认证控制器）\n  UserService.java（用户服务）\n  然后设计 OAuth 登录的集成方案\n```\n\n### 分批注入，避免上下文爆炸\n\n```\n❌ 一次性\n> 读取所有 30 个 Service 文件，然后...\n\n✅ 分批\n> 先读取 UserService 和 OrderService，\n  分析两者的公共模式\n\n> 好，基于这个模式，我们再看 PaymentService...\n```\n\n## 迭代式对话策略\n\n复杂任务用渐进式拆解，而不是一次性长 Prompt：\n\n### 框架优先，细节后补\n\n```\n轮次 1：> 帮我设计一个带权限控制的 API 限流系统的架构方案\n         （只需要方案，不写代码）\n\n轮次 2：> 方案不错。现在实现第一层：IP 级别的限流\n         （Redis + Lua 脚本方案）\n\n轮次 3：> 单元测试？Mock Redis 还是用 Embedded Redis？\n```\n\n### 确认再行动\n\n对于不可逆操作，明确要求 Claude 先确认：\n\n```\n> 我需要重构 UserService，把所有数据库操作提取到 Repository 层。\n  先告诉我影响范围（会修改哪些文件），不要直接开始修改，\n  等我确认后再执行\n```\n\n## 常见反模式与修正\n\n| 反模式 | 问题 | 修正 |\n|--------|------|------|\n| `帮我写代码` | 完全没有上下文 | 说明功能、技术栈、约束 |\n| `这不对，重写` | Claude 不知道哪里不对 | 说清楚具体哪里有问题 |\n| `你之前说的代码有 bug` | 上下文丢失时 Claude 不记得 | 重新提供代码内容 |\n| 一次性要求实现整个系统 | 结果难以控制 | 分解为小步骤 |\n| `用最好的方式实现` | \"最好\"是主观的 | 说明你的评判标准（性能/可读性/可维护性） |\n\n## 实战：同一需求的两种 Prompt 对比\n\n**需求**：实现用户登录功能\n\n**差的 Prompt**：\n```\n帮我写一个登录功能\n```\n\n**好的 Prompt**：\n```\n我在开发一个 Spring Boot 3.3 + MySQL 的后台管理系统。\n\n需要实现管理员登录功能：\n- 用户名 + 密码登录（密码用 BCrypt 加密存储）\n- 登录成功返回 JWT token（有效期 24 小时）\n- 连续 5 次失败锁定账号 15 分钟\n- 记录登录日志（IP、时间、是否成功）\n\n参考：\n- 已有 AdminUser 实体（读取 AdminUser.java 了解字段）\n- 已有 SecurityConfig.java 配置了 Spring Security\n- 项目用 Result<T> 统一响应（读取 Result.java 了解格式）\n\n请不要引入新的外部库（已有 jjwt 可用），\n先给我一个实现方案再写代码。\n```",
          "exercises": [
            {
              "id": "ex-1",
              "title": "Prompt 改写挑战",
              "difficulty": "中级",
              "description": "练习将\"糟糕的 Prompt\"改写为高质量的结构化 Prompt，并对比输出结果：\n\n**原始 Prompt（糟糕版）**：\n1. `帮我优化这个查询`\n2. `这个功能有 bug，帮我修`\n3. `写一个缓存`\n4. `重构这段代码`\n\n**任务**：选其中 2 个，改写为包含上下文、意图、约束的结构化 Prompt，在 Claude Code 中分别执行糟糕版和改写版，对比输出质量。",
              "hints": "- 改写时，为每个问题虚构一个具体的项目背景（或使用你自己的项目）\n- 对比的维度：输出是否可直接使用？是否符合项目风格？需要几轮补充？\n- 「帮我优化这个查询」改写示例：「这是一个用户行为分析的 MySQL 查询（读取以下 SQL），目前查询 100 万行数据需要 3 秒，瓶颈在 full table scan。要求：不改变查询结果，给出添加索引的方案和优化后的查询，预期执行时间 < 100ms」",
              "solution": "改写示例（`帮我修 bug`）：\n\n```\n❌ 糟糕版：这个功能有 bug，帮我修\n\n✅ 改写版：\n读取 PostService.java 的 getPostsByCategory 方法，\n这个方法有以下问题：\n\n错误信息：\nLazyInitializationException: could not initialize proxy - no Session\n\n复现步骤：\n1. 调用 GET /api/posts?category=tech\n2. 分类下有 50+ 篇文章时稳定复现\n3. 分类下文章数少时偶发\n\n项目配置：spring.jpa.open-in-view=false\n\n我怀疑是懒加载问题，但不确定具体哪里触发，\n请分析原因并提供修复方案（不要改变查询结果集）\n```"
            }
          ]
        },
        {
          "id": "02-core/06-multi-file-refactor",
          "title": "多文件重构",
          "difficulty": "中级",
          "readTime": 14,
          "order": 6,
          "tags": [],
          "content": "## 什么时候需要多文件重构\n\n以下信号说明需要多文件重构：\n\n- **重复代码**：同一逻辑在 3+ 个文件中出现\n- **God Class**：一个类承担了过多职责（500+ 行）\n- **命名不一致**：同一概念在不同文件中叫法不同\n- **层次违规**：Controller 直接操作数据库，或 Service 混入了 HTTP 逻辑\n- **循环依赖**：A 依赖 B，B 依赖 A\n\n## 重构前的准备：依赖分析\n\n**绝对不要在没有全面了解的情况下开始改代码**。先做依赖分析：\n\n```\n> 我要重构 UserService.java（上帝类，600 行）。\n  在开始修改前，先帮我分析：\n\n  1. 这个类被哪些文件引用？（Grep 搜索 import 和实例化）\n  2. 它依赖哪些其他类？\n  3. 哪些方法被哪些调用者使用？（方法级别的调用分析）\n  4. 有没有相关的测试文件？\n\n  给我一份依赖图，再讨论重构方案\n```\n\n## 分析-计划-执行-验证四步法\n\n### 步骤 1：分析\n\n```\n> 读取 UserService.java，识别它承担的所有职责，\n  按业务领域分组（用户管理、权限控制、通知、统计...）\n```\n\n### 步骤 2：计划\n\n```\n> 基于分析，提出拆分方案：\n  - 新类的名字和职责\n  - 哪些方法移到哪个类\n  - 接口还是实现类？\n  - 不影响现有调用者的最小改动路径\n\n  先给我方案，不要开始修改\n```\n\n### 步骤 3：执行（增量，每步验证）\n\n```\n> 开始执行。第一步：只提取 sendNotification 相关的 3 个方法到 NotificationService。\n  修改 UserService 中对这些方法的调用，确保编译通过。\n\n  [验证编译 + 测试]\n\n> 第一步通过。第二步：提取权限检查相关方法...\n```\n\n### 步骤 4：验证\n\n```\n> 所有提取完成后，运行全量测试确认没有破坏现有功能。\n  如果有测试失败，逐一分析原因\n```\n\n## 原子修改与增量验证\n\n**黄金法则**：每次改动后，代码必须可编译、测试必须通过。\n\n```\n✅ 增量方式（推荐）：\n- 添加新类 NotificationService（空实现）→ 编译通过\n- 复制方法到 NotificationService → 编译通过\n- 在 UserService 中改为调用 NotificationService → 编译通过\n- 删除 UserService 中的原方法 → 编译通过，测试通过\n- 继续下一个方法...\n\n❌ 大爆炸方式（危险）：\n- 一次性把 UserService 拆成 4 个类\n- 修改所有调用者\n- 祈祷能通过编译...\n```\n\n## 常见重构场景\n\n### 重命名（影响范围大）\n\n```\n> 我要将 getUserInfo() 重命名为 fetchUserProfile()。\n  先用 Grep 找出所有调用点（包括：Java 类、Thymeleaf 模板、测试文件、文档），\n  列出完整的影响范围，然后逐个文件修改，每个文件修改后告诉我\n```\n\n### 提取公共模块\n\n```\n> 读取 UserController.java、OrderController.java、ProductController.java，\n  找出三个文件中重复的分页逻辑，\n  提取为 PaginationHelper 工具类，\n  然后修改三个 Controller 使用这个工具类\n```\n\n### 移动到正确层次\n\n```\n> 读取 BlogController.java，找出所有直接操作 Repository 的地方\n  （Controller 层不应该直接用 Repository），\n  将这些逻辑移到 PostService，\n  Controller 改为调用 Service 方法\n```\n\n## 实战：将 God Class 拆分为单一职责的类\n\n```\n> 读取 PostServiceImpl.java。\n  这个类目前 400 行，我觉得它做了太多事情。\n  分析它的职责，告诉我是否需要拆分，\n  如果需要，给出拆分方案（拆成哪些类，各自职责）。\n\n  不要直接开始修改，先让我评估方案的合理性\n```",
          "exercises": [
            {
              "id": "ex-1",
              "title": "提取公共模块消除重复代码",
              "difficulty": "中级",
              "description": "在一个项目中找到（或制造）重复代码，然后完成以下重构：\n\n1. 让 Claude 用 Grep 搜索项目中的重复模式（如相似的错误处理、日志记录、分页逻辑）\n2. 让 Claude 分析重复的程度和影响文件数量\n3. 制定提取方案（新类的名称和位置）\n4. 增量执行：先创建新类 → 一个文件一个文件地修改 → 每步编译验证",
              "hints": "- 可以在 myblog 中搜索重复的 Thymeleaf 模板片段，或重复的 Service 方法模式\n- 制造重复也是有效的练习：在 UserController 中复制一段 PostController 的分页逻辑，然后让 Claude 发现并消除它\n- 每个文件改完都要说「现在检查修改是否正确，有没有编译错误？」",
              "solution": "示例（以 myblog 为例）：\n\n```\n> 用 Grep 在所有 Controller 文件中搜索分页相关代码（pageable、page、size 等关键词），\n  分析有哪些重复模式\n\n> 基于分析，提出一个 PaginationUtil 工具类的设计方案\n\n> 先创建空的 PaginationUtil 类，确认编译通过\n\n> 将 PostController 中的分页逻辑迁移到 PaginationUtil，\n  修改 PostController 使用新工具类，确认编译和测试通过\n\n> 完成后，检查还有哪些 Controller 也有类似的重复代码\n```"
            }
          ]
        }
      ]
    },
    {
      "id": "03-advanced",
      "title": "进阶篇",
      "icon": "🔧",
      "description": "Agent 系统、自定义命令、Hooks 与自动化",
      "lessons": [
        {
          "id": "03-advanced/01-agents",
          "title": "Agent 系统详解",
          "difficulty": "高级",
          "readTime": 16,
          "order": 1,
          "tags": [],
          "content": "## Agent 的概念与用途\n\nAgent 是**可复用的 AI 专家角色**，把特定领域的知识和行为规范固化为一个可随时调用的\"专家\"。\n\n与普通对话的区别：\n\n| | 普通对话 | Agent |\n|--|---------|-------|\n| 知识 | 依赖你的描述 | 预置在 Agent 定义中 |\n| 工具 | 所有工具 | 可限定专用工具 |\n| 复用 | 每次重新说明 | 一次定义，随时调用 |\n| 并行 | 串行对话 | 可并行启动多个 |\n\n**典型用途**：代码审查员、安全检查员、文档生成员、TDD 专家、架构师…\n\n## Agent 文件结构\n\nAgent 定义文件放在 `~/.claude/agents/`（全局）或 `.claude/agents/`（项目级），格式：\n\n```markdown\n---\nname: 代码审查员\ndescription: 代码质量、安全性和可维护性审查。写完或修改代码后使用。\nmodel: claude-sonnet-4-6\ntools:\n  - Read\n  - Grep\n  - Glob\n  - Bash\n---\n\n你是一个经验丰富的代码审查专家。\n\n审查时关注以下优先级：\n1. **CRITICAL**：安全漏洞（SQL 注入、XSS、身份验证绕过）\n2. **HIGH**：逻辑错误、数据丢失风险、性能严重问题\n3. **MEDIUM**：代码可读性、命名规范、重复代码\n4. **LOW**：格式、注释、小的改进建议\n\n输出格式：\n- 每个问题：[优先级] 文件名:行号 — 问题描述 + 建议修复方式\n- 结尾：总结 CRITICAL 和 HIGH 问题数量\n- CRITICAL 问题必须修复才能合并\n\n审查要基于代码实际内容，不要泛泛而谈。\n```\n\n关键字段说明：\n- `name`：Agent 的显示名称\n- `description`：何时使用这个 Agent（Claude 会根据这个自动选择）\n- `model`：可选，不指定则用当前默认模型\n- `tools`：工具白名单，限制 Agent 的操作范围\n\n## 内置 Agent vs 自定义 Agent\n\n**ECC 内置 Agent**（通过 Everything Claude Code 插件提供）：\n\n| Agent | 用途 |\n|-------|------|\n| `planner` | 复杂功能实施方案规划 |\n| `code-reviewer` | 代码质量审查 |\n| `tdd-guide` | 测试驱动开发 |\n| `security-reviewer` | 安全漏洞检测 |\n| `architect` | 系统架构设计 |\n\n调用方式：`/agent planner` 或在对话中说\"用 planner agent 帮我规划这个功能\"。\n\n**自定义 Agent** 的优势：针对你的项目定制，了解项目特有约定和工具链。\n\n## Task 工具：启动子代理\n\nTask 工具让 Claude 在后台启动独立的子代理任务，实现**并行执行**：\n\n```\n> 同时启动三个任务：\n  1. 分析 src/auth/ 目录的安全问题\n  2. 检查 src/api/ 目录的性能瓶颈\n  3. 统计整个项目的测试覆盖率概况\n\n  三个任务并行执行，完成后汇总结果\n```\n\n**何时用并行 Agent**：\n- 三个任务相互独立\n- 每个任务需要 > 30 秒\n- 总时间可以从\"3 × T\"降到\"1 × T + 汇总时间\"\n\n## Agent 调用时机判断\n\n根据任务复杂度选择调用方式：\n\n```\n简单任务（< 5 分钟）→ 直接对话\n中等任务（5-20 分钟）→ 调用专业 Agent\n复杂任务（多步骤）→ 串行 Agent 流水线\n独立任务（互不依赖）→ 并行 Agent\n```\n\n## 实战：创建项目专属的 Code Review Agent\n\n创建一个了解 myblog 项目特定规范的审查 Agent：\n\n```markdown\n---\nname: myblog-reviewer\ndescription: myblog Spring Boot 项目代码审查，了解项目特定规范\nmodel: claude-sonnet-4-6\ntools: [Read, Grep, Glob, Bash]\n---\n\n你是 myblog 项目的代码审查专家，熟悉以下项目约定：\n\n**架构规范**：\n- Controller 只处理 HTTP，不直接操作 Repository\n- Service 层通过接口调用，实现类命名为 XxxServiceImpl\n- 所有懒加载集合（Tag.posts, Category.posts）必须用 Repository COUNT 查询，不得调用 .size()\n- Thymeleaf 模板中不得触发懒加载\n\n**安全规范**：\n- /admin/** 路由必须有 @PreAuthorize 或依赖 SecurityConfig\n- 密码必须 BCrypt 加密，禁止明文存储\n\n**代码风格**：\n- Java 文件注释用中文\n- 分页结果用 PageResult<T> 包装\n- 渐变色通过 GradientHelper Bean，不硬编码\n\n审查时优先检查架构违规和安全问题。\n```",
          "exercises": [
            {
              "id": "ex-1",
              "title": "创建并使用安全审计 Agent",
              "difficulty": "高级",
              "description": "完成以下任务：\n\n1. 在 `.claude/agents/` 创建一个 `security-auditor.md` Agent\n2. Agent 需要检查：SQL 注入、XSS、硬编码密钥、不安全的重定向\n3. 用这个 Agent 对你的一个项目执行安全审计\n4. 输出格式化的安全报告（分级：CRITICAL/HIGH/MEDIUM/LOW）",
              "hints": "- Agent 文件存放位置：项目根目录的 `.claude/agents/security-auditor.md`\n- 工具权限建议：只给 Read、Grep、Glob（安全审计不需要修改文件）\n- 调用方式：`/agent security-auditor` 或说「使用 security-auditor agent 审查 src/ 目录」",
              "solution": "Agent 文件内容：\n\n```markdown\n---\nname: security-auditor\ndescription: 安全漏洞检测。处理用户输入、认证、API 端点后使用。\ntools: [Read, Grep, Glob]\n---\n\n你是一个安全审计专家。扫描代码中的以下安全问题：\n\n**CRITICAL**：\n- SQL 注入：字符串拼接构建 SQL 查询\n- 硬编码密钥：代码中直接写 password、secret、api_key\n\n**HIGH**：\n- XSS：未转义的用户输入直接渲染到 HTML\n- 不安全的重定向：直接使用用户提供的 URL 跳转\n\n**MEDIUM**：\n- 敏感信息暴露：错误信息泄露栈跟踪\n- 缺少输入验证：未检查用户输入长度/格式\n\n为每个发现的问题输出：\n[级别] 文件:行号 — 漏洞描述 — 修复建议\n```\n\n调用：\n```\n> 使用 security-auditor agent 扫描 src/ 目录下所有 Java 文件\n```"
            }
          ]
        },
        {
          "id": "03-advanced/02-custom-commands",
          "title": "自定义斜杠命令",
          "difficulty": "高级",
          "readTime": 10,
          "order": 2,
          "tags": [],
          "content": "## 什么是斜杠命令？\n\n斜杠命令（Slash Commands）是**预设的 Prompt 模板**，通过 `/命令名` 快速触发。\n\n```\n/review-pr           → 触发代码审查流程\n/pre-commit          → 提交前检查\n/release-note 1.2.0  → 生成 1.2.0 版本的发布说明\n```\n\n比每次重新输入长 Prompt 高效 10 倍。\n\n## 命令文件格式与存放位置\n\n**项目级命令**（随代码库提交，团队共享）：\n```\n.claude/commands/\n├── review.md        → /project:review\n├── pre-commit.md    → /project:pre-commit\n└── release-note.md  → /project:release-note\n```\n\n**用户级命令**（个人使用，适用于所有项目）：\n```\n~/.claude/commands/\n├── daily-standup.md  → /user:daily-standup\n└── explain.md        → /user:explain\n```\n\n文件名即命令名，扩展名 `.md`。\n\n## 命令文件格式\n\n```markdown\n---\ndescription: 简短说明命令的用途（显示在命令列表中）\n---\n\n命令的完整 Prompt 内容。\n\n可以使用 $ARGUMENTS 接收用户输入。\n```\n\n### 示例：代码快速审查命令\n\n文件：`.claude/commands/review.md`\n\n```markdown\n---\ndescription: 快速审查指定文件的代码质量和安全性\n---\n\n读取文件：$ARGUMENTS\n\n按以下维度审查：\n\n**代码质量**：\n- 命名是否清晰\n- 函数是否职责单一\n- 是否有明显的代码重复\n\n**潜在问题**：\n- 空指针/null 风险\n- 异常处理是否完整\n- 边界条件是否考虑\n\n**安全性**：\n- 是否有 SQL 注入风险\n- 用户输入是否经过验证\n\n输出格式：按优先级排列问题，每条给出具体的改进建议。\n```\n\n使用方式：\n```\n/project:review src/service/UserService.java\n```\n\n## 项目级 vs 用户级命令\n\n| | 项目级（.claude/commands/） | 用户级（~/.claude/commands/） |\n|--|--------------------------|------------------------------|\n| 调用前缀 | `/project:` | `/user:` |\n| 提交 Git | ✅ 随项目提交 | ❌ 本地私有 |\n| 团队共享 | ✅ 所有成员 | ❌ 个人专用 |\n| 适合内容 | 项目规范、工作流 | 个人习惯、通用技巧 |\n\n## $ARGUMENTS 参数传递\n\n`$ARGUMENTS` 占位符接收命令后面的所有文字：\n\n```\n/project:release-note 1.2.0 --from v1.1.0\n```\n\n对应命令文件中的 `$ARGUMENTS` 会被替换为 `1.2.0 --from v1.1.0`。\n\n**多参数技巧**：用分隔符约定多个参数：\n\n```markdown\n---\ndescription: 对比两个文件的实现差异\n---\n\n读取并对比以下两个文件的实现方式，找出差异和各自的优缺点：\n\n文件 1 和 文件 2：$ARGUMENTS\n\n请用表格展示主要差异。\n```\n\n使用：`/project:compare UserServiceV1.java UserServiceV2.java`\n\n## 实战：构建一套项目工作流命令集\n\n推荐为每个项目创建这三个基础命令：\n\n### 1. pre-commit 提交前检查\n\n```markdown\n---\ndescription: 提交前自动检查：运行测试、检查代码风格、扫描安全问题\n---\n\n在提交代码前，执行以下检查：\n\n1. **运行测试**：执行项目的测试命令，报告通过/失败数量\n2. **代码风格**：检查最近修改的文件是否有明显风格问题\n3. **安全扫描**：快速扫描有没有硬编码的密钥或密码\n4. **TODO 检查**：列出本次修改的文件中有哪些 TODO\n\n如果发现 CRITICAL 问题，建议不要提交并给出修复建议。\n```\n\n### 2. review-pr PR 描述生成\n\n```markdown\n---\ndescription: 根据 git diff 生成规范的 PR 描述\n---\n\n执行 git diff main...HEAD，分析所有变更，生成 PR 描述：\n\n**标题**：一行，< 70 字，使用 Conventional Commits 格式\n\n**变更摘要**：\n- 3-5 条要点，说明\"做了什么\"和\"为什么\"\n\n**影响范围**：\n- 哪些模块受到影响\n- 是否有 breaking change\n\n**测试计划**：\n- [ ] 核心功能测试项\n- [ ] 边界情况测试项\n- [ ] 回归测试建议\n\n输出 Markdown 格式，可直接粘贴到 GitHub PR。\n```\n\n### 3. explain 代码解释\n\n```markdown\n---\ndescription: 详细解释指定代码的工作原理\n---\n\n读取并解释以下代码：$ARGUMENTS\n\n解释要包含：\n1. **功能概述**：这段代码做什么\n2. **核心逻辑**：关键的算法或设计决策\n3. **依赖关系**：依赖哪些外部类/函数/服务\n4. **注意事项**：使用时需要注意什么（边界条件、副作用）\n\n用清晰的中文，适合对代码不熟悉的开发者理解。\n```",
          "exercises": [
            {
              "id": "ex-1",
              "title": "创建你的项目命令套件",
              "difficulty": "高级",
              "description": "为你的项目创建至少 2 个自定义斜杠命令：\n\n1. 一个带 `$ARGUMENTS` 的命令（如代码解释、文件审查）\n2. 一个不带参数的工作流命令（如提交前检查、生成 PR 描述）\n\n测试两个命令，确认它们正常工作。",
              "hints": "- 命令文件放在 `.claude/commands/` 目录\n- 调用时用 `/project:命令名`，需要在 Claude Code 中输入 `/` 看到命令列表\n- 写命令时把它想象成给 Claude 写一个非常详细的工作指令",
              "solution": "创建步骤：\n\n```bash\nmkdir -p .claude/commands\n\n# 创建代码审查命令\ncat > .claude/commands/review.md << 'EOF'\n---\ndescription: 审查指定文件的代码质量\n---\n读取文件：$ARGUMENTS\n\n检查：代码风格、空指针风险、异常处理、重复代码。\n按优先级输出问题，每条给出修复建议。\nEOF\n\n# 创建提交前检查命令\ncat > .claude/commands/pre-commit.md << 'EOF'\n---\ndescription: 提交前检查：测试、风格、安全\n---\n执行以下提交前检查：\n1. 运行项目测试，报告结果\n2. 检查 git diff 中有无硬编码密钥\n3. 列出本次修改的文件中的 TODO\n给出是否可以安全提交的结论。\nEOF\n```\n\n使用：\n```\n/project:review src/UserService.java\n/project:pre-commit\n```"
            }
          ]
        },
        {
          "id": "03-advanced/03-hooks",
          "title": "Hooks 机制",
          "difficulty": "高级",
          "readTime": 12,
          "order": 3,
          "tags": [],
          "content": "## Hooks 的概念与触发时机\n\nHooks 让你在 Claude Code 执行特定操作时**自动运行 shell 命令**，无需手动触发。\n\n想象它是事件监听器：\n\n```\nClaude 执行某个操作\n    ↓\nHook 自动触发\n    ↓\n运行你指定的 shell 命令\n    ↓\n继续（或阻止）原操作\n```\n\n典型场景：\n- Claude 编辑了 `.py` 文件 → 自动运行 `black` 格式化\n- Claude 要执行危险命令 → 拦截并告警\n- 对话结束 → 自动保存会话摘要\n\n## 四个钩子点详解\n\n| 钩子 | 触发时机 | 常见用途 |\n|------|---------|---------|\n| `PreToolUse` | 工具调用**前** | 安全检查、权限验证、拦截危险操作 |\n| `PostToolUse` | 工具调用**后** | 自动格式化、日志记录、通知 |\n| `Notification` | Claude 发出通知时 | 桌面通知、Slack 消息 |\n| `Stop` | 对话结束时 | 保存摘要、统计成本、清理临时文件 |\n\n## 配置格式\n\nHooks 在 `.claude/settings.json`（项目级）或 `~/.claude/settings.json`（用户级）中配置：\n\n```json\n{\n  \"hooks\": {\n    \"PostToolUse\": [\n      {\n        \"matcher\": \"Edit|Write\",\n        \"hooks\": [\n          {\n            \"type\": \"command\",\n            \"command\": \"echo '文件已修改：' $CLAUDE_TOOL_INPUT_FILE_PATH\"\n          }\n        ]\n      }\n    ],\n    \"PreToolUse\": [\n      {\n        \"matcher\": \"Bash\",\n        \"hooks\": [\n          {\n            \"type\": \"command\",\n            \"command\": \"/path/to/check-dangerous.sh\"\n          }\n        ]\n      }\n    ]\n  }\n}\n```\n\n**`matcher`** 匹配工具名，支持 `|` 组合多个工具。\n\n## 可用的环境变量\n\nHook 脚本中可使用以下变量：\n\n| 变量 | 说明 |\n|------|------|\n| `$CLAUDE_TOOL_NAME` | 触发的工具名（Read、Edit、Bash...） |\n| `$CLAUDE_TOOL_INPUT_FILE_PATH` | 操作的文件路径（Edit/Write 时） |\n| `$CLAUDE_TOOL_INPUT_COMMAND` | 执行的命令（Bash 时） |\n| `$CLAUDE_SESSION_ID` | 当前会话 ID |\n\n## 实战：打造自动化质量保障流水线\n\n### Hook 1：文件编辑后自动格式化\n\n```json\n{\n  \"hooks\": {\n    \"PostToolUse\": [\n      {\n        \"matcher\": \"Edit|Write\",\n        \"hooks\": [\n          {\n            \"type\": \"command\",\n            \"command\": \"bash -c 'case \\\"$CLAUDE_TOOL_INPUT_FILE_PATH\\\" in *.py) black \\\"$CLAUDE_TOOL_INPUT_FILE_PATH\\\" 2>/dev/null ;; *.js|*.ts) npx prettier --write \\\"$CLAUDE_TOOL_INPUT_FILE_PATH\\\" 2>/dev/null ;; *.java) echo \\\"Java 文件已修改：$CLAUDE_TOOL_INPUT_FILE_PATH\\\" ;; esac'\"\n          }\n        ]\n      }\n    ]\n  }\n}\n```\n\n### Hook 2：对话结束时生成摘要\n\n```json\n{\n  \"hooks\": {\n    \"Stop\": [\n      {\n        \"matcher\": \".*\",\n        \"hooks\": [\n          {\n            \"type\": \"command\",\n            \"command\": \"echo \\\"[$(date '+%Y-%m-%d %H:%M')] 会话结束\\\" >> ~/.claude/session-log.txt\"\n          }\n        ]\n      }\n    ]\n  }\n}\n```\n\n### Hook 3：危险命令拦截\n\n创建脚本 `~/.claude/hooks/check-dangerous.sh`：\n\n```bash\n#!/bin/bash\n# 检查危险命令\n\nCMD=\"$CLAUDE_TOOL_INPUT_COMMAND\"\n\n# 检查危险模式\nif echo \"$CMD\" | grep -qE \"rm -rf /|DROP TABLE|curl.*\\| *sh|wget.*\\| *bash\"; then\n    echo \"⚠️  HOOK 警告：检测到潜在危险命令，已记录日志\" >&2\n    echo \"[$(date)] DANGEROUS CMD: $CMD\" >> ~/.claude/dangerous-cmds.log\n    # 返回非零退出码可以阻止命令执行（取决于 Claude Code 的配置）\nfi\n```\n\n配置：\n```json\n{\n  \"hooks\": {\n    \"PreToolUse\": [\n      {\n        \"matcher\": \"Bash\",\n        \"hooks\": [\n          {\n            \"type\": \"command\",\n            \"command\": \"~/.claude/hooks/check-dangerous.sh\"\n          }\n        ]\n      }\n    ]\n  }\n}\n```\n\n## 安全注意事项\n\n- Hook 命令以你的用户权限运行，**不要**在 Hook 中执行不信任的代码\n- 项目级的 `.claude/settings.json` 会被 Git 追踪，**不要**在其中写入敏感信息（如 API Key）\n- 敏感配置放在 `settings.local.json`（已在 `.gitignore` 中）",
          "exercises": [
            {
              "id": "ex-1",
              "title": "配置一个自动格式化 Hook",
              "difficulty": "高级",
              "description": "配置一个 PostToolUse Hook，在 Claude 编辑特定类型的文件后自动执行格式化：\n\n1. 编辑 `.js` 或 `.ts` 文件后运行 `prettier`（或项目的格式化工具）\n2. 验证 Hook 在实际编辑中正确触发\n3. （可选）添加一个 Stop Hook，在对话结束时打印一条总结信息",
              "hints": "- 配置文件位于 `.claude/settings.json`（项目级）\n- 先测试 Hook 命令本身是否能手动运行：`which prettier` 确认已安装\n- 可以用 `echo \"Hook 触发了\"` 先验证触发时机，再换成真正的格式化命令\n- `settings.local.json` 用于不想提交到 git 的本地配置",
              "solution": "`.claude/settings.json`：\n\n```json\n{\n  \"hooks\": {\n    \"PostToolUse\": [\n      {\n        \"matcher\": \"Edit|Write\",\n        \"hooks\": [\n          {\n            \"type\": \"command\",\n            \"command\": \"bash -c 'EXT=\\\"${CLAUDE_TOOL_INPUT_FILE_PATH##*.}\\\"; if [[ \\\"$EXT\\\" == \\\"js\\\" || \\\"$EXT\\\" == \\\"ts\\\" || \\\"$EXT\\\" == \\\"jsx\\\" || \\\"$EXT\\\" == \\\"tsx\\\" ]]; then echo \\\"[Hook] 格式化: $CLAUDE_TOOL_INPUT_FILE_PATH\\\"; npx prettier --write \\\"$CLAUDE_TOOL_INPUT_FILE_PATH\\\" 2>&1 || true; fi'\"\n          }\n        ]\n      }\n    ],\n    \"Stop\": [\n      {\n        \"matcher\": \".*\",\n        \"hooks\": [\n          {\n            \"type\": \"command\",\n            \"command\": \"echo '[Hook] 对话结束，所有修改已自动格式化'\"\n          }\n        ]\n      }\n    ]\n  }\n}\n```"
            }
          ]
        },
        {
          "id": "03-advanced/04-rules",
          "title": "Rules 配置体系",
          "difficulty": "高级",
          "readTime": 10,
          "order": 4,
          "tags": [],
          "content": "## Rules vs CLAUDE.md：何时用哪个\n\n两者都是给 Claude 的指令，但定位不同：\n\n| | CLAUDE.md | Rules |\n|--|-----------|-------|\n| 定位 | 项目说明书（What） | 行为规范（How） |\n| 内容 | 项目结构、常用命令、架构概述 | 编码规范、安全要求、工作流程 |\n| 组织 | 单个文件 | 按主题拆分，多个文件 |\n| 条件触发 | 始终加载 | 可按文件类型条件触发 |\n| 更新频率 | 项目结构变化时更新 | 规范迭代时更新 |\n\n**最佳实践**：CLAUDE.md 写\"这个项目是什么\"，Rules 写\"怎么做事\"。\n\n## Rules 文件结构与存放位置\n\n```\n.claude/rules/\n├── git-workflow.md          # Git 提交和分支规范\n├── coding-style.md          # 代码风格\n├── security.md              # 安全要求\n├── java-patterns.md         # Java 特定规范（条件触发：*.java）\n└── test-conventions.md      # 测试规范（条件触发：*.test.*）\n```\n\n每个 Rules 文件的格式：\n\n```markdown\n---\ndescription: 这个 Rule 的简短说明\nglobs: [\"*.java\", \"*.kt\"]    # 可选：只在这些文件类型时触发\nalwaysApply: false            # 可选：true 则始终加载\n---\n\n规则内容（Markdown 格式）...\n```\n\n## 三级优先级体系\n\n```\n1. 用户级（~/.claude/rules/）      ← 最低优先级\n2. 项目级（.claude/rules/）        ← 覆盖用户级\n3. CLAUDE.md 中的直接指令          ← 最高优先级\n```\n\n实际使用中：用户级放个人偏好，项目级放团队规范，CLAUDE.md 放临时强调。\n\n## 条件触发规则（按文件类型）\n\nRules 文件中的 `globs` 字段让规则只在特定文件类型时生效：\n\n```markdown\n---\ndescription: React 组件开发规范\nglobs: [\"*.tsx\", \"*.jsx\"]\n---\n\n## React 组件规范\n\n- 使用函数式组件 + Hooks，不使用 class 组件\n- Props 类型用 TypeScript interface 定义，不用 type alias\n- 组件文件名与组件名相同（PascalCase）\n- 避免在 JSX 中直接写复杂逻辑，提取为独立变量或函数\n- 副作用只在 useEffect 中，依赖数组必须完整\n```\n\n这样这个规则只在 Claude 编辑 React 文件时加载，不会影响其他文件类型的编辑。\n\n## 团队 Rules 设计策略\n\n### 常见 Rules 文件集\n\n**git-workflow.md**（通用）：\n```markdown\n---\ndescription: Git 提交和分支管理规范\nalwaysApply: true\n---\n\n## Git 规范\n\n- Commit message 使用 Conventional Commits 格式，中文描述\n- 功能分支命名：feat/功能名，修复分支：fix/问题描述\n- 不直接向 main/master 提交\n- PR 描述必须包含：变更摘要、影响范围、测试计划\n\n提交前检查：\n1. 运行测试确认通过\n2. 无硬编码的密钥或密码\n```\n\n**security.md**（通用）：\n```markdown\n---\ndescription: 安全编码规范\nalwaysApply: true\n---\n\n## 安全要求\n\n**禁止**：\n- 明文存储密码（必须使用 BCrypt 或 Argon2）\n- 在代码中硬编码 API Key、数据库密码\n- 直接将用户输入拼接到 SQL 查询\n- 在错误响应中返回栈跟踪信息\n\n**必须**：\n- 用户输入必须在进入业务逻辑前验证\n- 所有外部 API 调用必须有超时设置\n- 敏感操作必须记录审计日志\n```\n\n**java-patterns.md**（Java 项目）：\n```markdown\n---\ndescription: Java/Spring Boot 编码规范\nglobs: [\"*.java\"]\n---\n\n## Java 规范\n\n- Service 层必须定义接口，实现类加 Impl 后缀\n- Controller 不直接操作 Repository，必须通过 Service\n- 所有 public 方法加 Javadoc 注释（中文）\n- 异常处理：业务异常用自定义 Exception，通过 @ControllerAdvice 统一处理\n- JPA 懒加载：反向集合（oneToMany）保持 LAZY，需要时用 JPQL COUNT\n```\n\n## 实战：为项目搭建完整的 Rules 体系\n\n```\n> 分析 .claude/rules/ 目录中现有的规则文件，\n  检查它们是否覆盖了以下维度：\n  - Git 工作流\n  - 代码风格\n  - 安全要求\n  - 测试规范\n\n  告诉我哪些维度缺失，帮我创建缺失的 Rules 文件\n```",
          "exercises": [
            {
              "id": "ex-1",
              "title": "构建多语言项目的 Rules 体系",
              "difficulty": "高级",
              "description": "为一个包含 Java 后端和 JavaScript 前端的全栈项目，创建分文件的 Rules 体系：\n\n1. `git-workflow.md` — Git 提交规范（始终生效）\n2. `java-style.md` — Java 代码规范（只在 .java 文件时触发）\n3. `js-style.md` — JavaScript/TypeScript 规范（.js/.ts 时触发）\n4. `security.md` — 安全要求（始终生效）\n\n测试：让 Claude 修改一个 `.java` 文件，确认 `java-style.md` 规则被应用；修改 `.ts` 文件，确认 `js-style.md` 规则被应用。",
              "hints": "- 创建目录：`mkdir -p .claude/rules`\n- 用 `globs: [\"*.java\"]` 设置条件触发\n- 验证方法：让 Claude 修改文件时，观察它是否提到了 Rules 中的规范",
              "solution": "文件创建示例：\n\n`.claude/rules/java-style.md`：\n```markdown\n---\ndescription: Java 编码规范（Spring Boot 项目）\nglobs: [\"*.java\"]\n---\n\n- 类和方法的 Javadoc 用中文\n- Service 必须有接口，实现类加 Impl 后缀\n- 禁止在 Controller 中直接使用 Repository\n- 方法参数超过 3 个时考虑封装为 DTO\n- 统一用 Optional 而不是 null 检查\n```\n\n`.claude/rules/js-style.md`：\n```markdown\n---\ndescription: JavaScript/TypeScript 编码规范\nglobs: [\"*.js\", \"*.ts\", \"*.jsx\", \"*.tsx\"]\n---\n\n- 使用 const/let，禁止 var\n- 异步操作统一用 async/await，不用 .then() 链\n- 所有函数参数和返回值加 TypeScript 类型注解\n- 组件文件用 PascalCase，工具函数用 camelCase\n```"
            }
          ]
        },
        {
          "id": "03-advanced/05-context-management",
          "title": "Context 管理与 /compact",
          "difficulty": "高级",
          "readTime": 12,
          "order": 5,
          "tags": [],
          "content": "## 理解上下文窗口\n\nClaude 的\"上下文窗口\"就像工作记忆——它能记住的内容是有限的。Claude Code 使用的模型大约有 200K tokens 的上下文容量。\n\n当上下文接近满时：\n- 早期的对话内容可能被截断\n- 输出质量开始下降\n- 长时间开发会话中，Claude 可能\"忘记\"之前的决定\n\n一个粗略的估算：\n- 1 行代码 ≈ 5-10 tokens\n- 1 个中等文件（100 行）≈ 500-1000 tokens\n- 读取 10 个文件 ≈ 10K tokens\n- 2 小时对话 ≈ 30K-80K tokens\n\n## 上下文膨胀的信号\n\n以下迹象说明上下文已经接近瓶颈：\n\n- Claude 开始对早期讨论过的设计决策感到困惑\n- 重复生成已经讨论并否决过的方案\n- 回答变得更加保守和简短\n- 对已读过的文件\"忘记\"了关键内容\n\n**预防胜于治疗**：在上下文达到 70-80% 前主动处理。\n\n## /compact 命令详解\n\n`/compact` 压缩当前对话历史，保留核心信息，丢弃冗余细节：\n\n```\n/compact\n```\n\n带自定义摘要指令（推荐）：\n\n```\n/compact 保留：当前正在重构的目标（将 UserService 拆分为三个类）、\n已完成的步骤（NotificationService 已提取）、\n下一步计划（提取 PermissionService）\n```\n\n### 什么会被保留\n\n- 关键的技术决策和约定\n- 当前任务的进度和下一步\n- 重要的错误信息和解决方案\n\n### 什么会被丢弃\n\n- 中间过程的讨论\n- 已被否决的方案\n- 冗余的代码展示（代码在文件里，不需要在上下文中保留）\n\n## 上下文预算管理策略\n\n### 策略一：任务分段 + 定期 compact\n\n```\n长任务 = 多个小阶段\n\n阶段 1：分析和规划（15 分钟）\n  → /compact，保留：规划结论、文件影响范围\n\n阶段 2：实现第一个模块（20 分钟）\n  → /compact，保留：完成的模块列表、未完成的工作\n\n阶段 3：继续实现...\n```\n\n### 策略二：关键信息持久化\n\n不要依赖上下文记忆重要信息，而是写到文件里：\n\n```\n> 把我们刚才讨论的重构方案写到 REFACTOR_PLAN.md，\n  后续对话可以直接读这个文件而不是重复讨论\n\n> 把当前任务的进度更新到 TODO.md：\n  - [x] 提取 NotificationService\n  - [ ] 提取 PermissionService\n  - [ ] 更新所有调用方\n```\n\n### 策略三：精准注入，按需读取\n\n避免在对话开始时一次性读取所有文件：\n\n```\n❌ 低效\n> 读取整个 src/ 目录下所有文件（50 个文件）\n\n✅ 高效\n> 当你需要了解某个类时，告诉我，我们再读那个文件\n\n或\n\n> 现在只读取 UserService.java 和 OrderService.java，\n  其他文件我们按需加载\n```\n\n## @file 与精准上下文注入\n\n在对话中精准引用文件：\n\n```\n> 参考 @src/config/SecurityConfig.java 的配置方式，\n  帮我为 /api/payments/** 路由添加额外的权限检查\n```\n\n`@file` 语法（在支持的界面中）让 Claude 只加载你指定的文件，而不是让它自己决定读哪些文件。\n\n## 实战：长时间开发会话的上下文管理\n\n以 2 小时的重构任务为例：\n\n```\n开始：\n> 读取 ProjectStructure.md（项目架构），\n  然后读取需要重构的 GodService.java，\n  制定重构计划并写到 REFACTOR_PLAN.md\n\n45 分钟后，上下文约 40%：\n> 读取 REFACTOR_PLAN.md，确认当前进度，\n  继续下一个模块的提取\n\n90 分钟后，上下文约 70%：\n/compact 保留：REFACTOR_PLAN.md 中的未完成项目，当前处理的文件名\n\n继续工作直到完成...\n```",
          "exercises": [
            {
              "id": "ex-1",
              "title": "上下文预算实验",
              "difficulty": "高级",
              "description": "通过实验体验上下文膨胀和 /compact 的效果：\n\n1. 在一个对话中，连续让 Claude 读取 5-8 个文件（每个至少 100 行）\n2. 问一个关于**最早读取的**文件的具体问题，观察 Claude 的记忆准确度\n3. 使用 `/compact` 压缩，然后让 Claude 重新回答同样的问题\n4. 总结：compact 前后，Claude 的回答质量有何差异？",
              "hints": "- 可以在 myblog 项目中依次读取：Post.java、PostService.java、AdminController.java、PostRepository.java、SecurityConfig.java\n- 最后问关于最早读的 Post.java 的具体细节问题（如「Post 实体有哪些字段？readTime 是如何计算的？」）\n- compact 后重新问同样的问题，对比回答的准确性",
              "solution": "实验步骤：\n\n```\n> 读取 myblog/src/main/java/com/myblog/entity/Post.java\n\n> 读取 PostService.java，并读取 PostServiceImpl.java\n\n> 读取 AdminController.java\n\n> 读取 SecurityConfig.java\n\n> 读取 DataInitializer.java\n\n> [测试记忆] Post 实体的 readTime 字段是如何计算的？\n  recalculateReadTime() 方法的逻辑是什么？\n\n[观察回答准确性]\n\n/compact 保留：我们读过哪些文件，当前任务是测试上下文记忆\n\n> [再次测试] Post 实体的 readTime 字段是如何计算的？\n  recalculateReadTime() 方法的逻辑是什么？\n\n[对比两次回答]\n```"
            }
          ]
        },
        {
          "id": "03-advanced/06-mcp",
          "title": "MCP 扩展",
          "difficulty": "高级",
          "readTime": 14,
          "order": 6,
          "tags": [],
          "content": "## MCP 协议概述\n\nMCP（Model Context Protocol）是 Anthropic 推出的开放协议，让 Claude 能连接**外部工具和数据源**，突破内置工具的限制。\n\n没有 MCP，Claude 只能：Read、Edit、Bash、Grep、Glob...\n\n有了 MCP，Claude 还能：\n- 查询你的数据库（无需写 SQL 文件）\n- 搜索最新的 API 文档\n- 控制浏览器自动化\n- 调用你的内部 API\n- 读取 Slack 消息、GitHub Issues...\n\n## .mcp.json 配置格式\n\n在项目根目录或 `~/.claude/` 创建 `.mcp.json`：\n\n```json\n{\n  \"mcpServers\": {\n    \"context7\": {\n      \"type\": \"stdio\",\n      \"command\": \"npx\",\n      \"args\": [\"-y\", \"@upstash/context7-mcp@latest\"]\n    },\n    \"filesystem\": {\n      \"type\": \"stdio\",\n      \"command\": \"npx\",\n      \"args\": [\n        \"-y\",\n        \"@modelcontextprotocol/server-filesystem\",\n        \"/Users/yourname/projects\"\n      ]\n    },\n    \"postgres\": {\n      \"type\": \"stdio\",\n      \"command\": \"npx\",\n      \"args\": [\"-y\", \"@modelcontextprotocol/server-postgres\"],\n      \"env\": {\n        \"DATABASE_URL\": \"postgresql://localhost/mydb\"\n      }\n    }\n  }\n}\n```\n\n每个 MCP 服务器是一个独立进程，通过 stdio 与 Claude Code 通信。\n\n## 常用 MCP 服务器\n\n| 服务器 | 功能 | 安装 |\n|--------|------|------|\n| `@modelcontextprotocol/server-filesystem` | 扩展文件系统访问范围 | `npx -y @modelcontextprotocol/server-filesystem` |\n| `@modelcontextprotocol/server-postgres` | PostgreSQL 数据库查询 | `npx -y @modelcontextprotocol/server-postgres` |\n| `@modelcontextprotocol/server-github` | GitHub 仓库操作 | `npx -y @modelcontextprotocol/server-github` |\n| `@upstash/context7-mcp` | 获取最新库文档 | `npx -y @upstash/context7-mcp` |\n| `@modelcontextprotocol/server-brave-search` | Brave 网页搜索 | `npx -y @modelcontextprotocol/server-brave-search` |\n\n## 安装与配置 MCP 服务器\n\n### 示例：配置 Context7（实时文档检索）\n\nContext7 让 Claude 能获取 npm 包的最新文档，告别\"用过时 API\"的问题。\n\n1. 在 `.mcp.json` 中添加：\n\n```json\n{\n  \"mcpServers\": {\n    \"context7\": {\n      \"type\": \"stdio\",\n      \"command\": \"npx\",\n      \"args\": [\"-y\", \"@upstash/context7-mcp@latest\"]\n    }\n  }\n}\n```\n\n2. 重启 Claude Code，然后在对话中：\n\n```\n> 用 context7 查一下 React 18 的 useTransition hook 的最新用法\n```\n\n### 示例：配置 PostgreSQL MCP\n\n```json\n{\n  \"mcpServers\": {\n    \"postgres\": {\n      \"type\": \"stdio\",\n      \"command\": \"npx\",\n      \"args\": [\"-y\", \"@modelcontextprotocol/server-postgres\"],\n      \"env\": {\n        \"DATABASE_URL\": \"postgresql://localhost:5432/myapp\"\n      }\n    }\n  }\n}\n```\n\n配置后：\n\n```\n> 查询 users 表中最近 7 天注册的用户数量\n> 分析 orders 表的索引情况，哪些查询可能需要优化？\n```\n\n## 自定义 MCP 服务器开发入门\n\nMCP 服务器本质上是一个遵循协议的进程。用 Node.js 最简单：\n\n```javascript\n// my-mcp-server.js\nconst { Server } = require('@modelcontextprotocol/sdk/server/index.js');\nconst { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');\n\nconst server = new Server(\n  { name: 'my-tools', version: '1.0.0' },\n  { capabilities: { tools: {} } }\n);\n\n// 定义工具\nserver.setRequestHandler('tools/list', async () => ({\n  tools: [\n    {\n      name: 'get_project_stats',\n      description: '获取项目统计信息',\n      inputSchema: { type: 'object', properties: {}, required: [] }\n    }\n  ]\n}));\n\n// 处理工具调用\nserver.setRequestHandler('tools/call', async (request) => {\n  if (request.params.name === 'get_project_stats') {\n    return {\n      content: [{\n        type: 'text',\n        text: JSON.stringify({ files: 42, lines: 3821, tests: 156 })\n      }]\n    };\n  }\n});\n\nconst transport = new StdioServerTransport();\nserver.connect(transport);\n```\n\n配置到 `.mcp.json`：\n\n```json\n{\n  \"mcpServers\": {\n    \"my-tools\": {\n      \"type\": \"stdio\",\n      \"command\": \"node\",\n      \"args\": [\"./my-mcp-server.js\"]\n    }\n  }\n}\n```",
          "exercises": [
            {
              "id": "ex-1",
              "title": "配置并使用一个 MCP 服务器",
              "difficulty": "高级",
              "description": "选择以下任意一个任务完成：\n\n**选项 A**：配置 Context7 MCP，用它查询你正在使用的某个库的最新 API 文档，验证 Claude 能获取到比训练数据更新的信息。\n\n**选项 B**：配置 Filesystem MCP，限定可访问的目录为你的项目，然后尝试用 Claude 通过 MCP 工具（而非内置工具）访问文件，对比两种方式的差异。\n\n**选项 C（挑战）**：用 Node.js 开发一个最简单的 MCP 服务器，提供一个 `search_notes` 工具，在指定目录的 `.md` 文件中全文搜索关键词。",
              "hints": "- Context7 安装最简单，不需要额外配置，推荐从选项 A 开始\n- `.mcp.json` 放在项目根目录或 `~/.claude/.mcp.json`（全局）\n- 验证 MCP 连接：Claude Code 启动时会显示已连接的 MCP 服务器\n- 自定义 MCP 需要安装 SDK：`npm install @modelcontextprotocol/sdk`",
              "solution": "选项 A（Context7）：\n\n`.mcp.json`：\n```json\n{\n  \"mcpServers\": {\n    \"context7\": {\n      \"type\": \"stdio\",\n      \"command\": \"npx\",\n      \"args\": [\"-y\", \"@upstash/context7-mcp@latest\"]\n    }\n  }\n}\n```\n\n验证对话：\n```\n> 用 context7 查询 Spring Boot 3.3 中 @RestControllerAdvice 的最新用法，\n  特别是处理 validation 错误的推荐方式\n```\n\n如果 Claude 能返回来自 Context7 的文档内容，说明 MCP 配置成功。"
            }
          ]
        }
      ]
    },
    {
      "id": "04-mastery",
      "title": "精通篇",
      "icon": "🏆",
      "description": "多 Agent 编排、性能优化、团队协作",
      "lessons": [
        {
          "id": "04-mastery/01-multi-agent",
          "title": "多 Agent 编排",
          "difficulty": "高级",
          "readTime": 16,
          "order": 1,
          "tags": [],
          "content": "## 单 Agent 的局限性\n\n一个对话中的单个 Claude 实例：\n- 只能串行处理，一次做一件事\n- 上下文有限，无法同时深入多个模块\n- 单一视角，容易有盲点\n- 长任务会让上下文窗口超限\n\n多 Agent 编排打破这些限制。\n\n## 多 Agent 编排模式\n\n### 模式一：扇出-汇总（Fan-out / Fan-in）\n\n```\n                 ┌─ Agent 1：安全分析 ─┐\n主 Agent ──────── ├─ Agent 2：性能分析 ─┤──── 主 Agent 汇总\n                 └─ Agent 3：质量审查 ─┘\n```\n\n适合：同一个对象需要从多个维度独立分析。\n\n```\n> 对 src/auth/ 目录同时启动三个分析任务：\n  1. 安全漏洞扫描（重点：认证绕过、注入攻击）\n  2. 性能瓶颈分析（重点：数据库查询、缓存使用）\n  3. 代码可维护性审查（重点：耦合度、测试覆盖）\n\n  三个任务并行执行，完成后我来汇总关键发现\n```\n\n### 模式二：流水线（Pipeline）\n\n```\n需求分析 → 架构设计 → 测试编写 → 代码实现 → 代码审查\n```\n\n每步的输出是下一步的输入。适合有明确依赖关系的复杂流程。\n\n```\n步骤 1：> 分析需求：[需求描述]，输出用户故事和验收条件\n\n步骤 2：> 基于以上需求，设计实现方案（不写代码），\n         输出：接口设计、数据模型、关键决策\n\n步骤 3：> 基于方案，先写测试（TDD 流程）\n\n步骤 4：> 实现代码使所有测试通过\n\n步骤 5：> 审查实现代码，重点检查安全性和性能\n```\n\n### 模式三：分裂角色（Split Role）\n\n对同一个问题，让 Claude 扮演不同的专家角色：\n\n```\n> 对以下架构方案，请分别从三个角度提供意见：\n  1. 作为安全专家：这个设计有哪些安全风险？\n  2. 作为 DBA：数据库层面有哪些问题？\n  3. 作为团队 Lead：可维护性如何？新成员上手难度？\n\n  三个角色的分析要分开，最后综合评估\n```\n\n## 模型混用策略\n\n不同的任务不需要用同一个模型：\n\n| 任务 | 推荐模型 | 原因 |\n|------|---------|------|\n| 架构决策、复杂分析 | Opus 4.6 | 最强推理能力 |\n| 主要开发工作 | Sonnet 4.6 | 最佳代码质量 |\n| 批量轻量任务（日志分析、格式化） | Haiku 4.5 | 成本低 3 倍 |\n\n在对话中切换模型：\n\n```\n/model claude-opus-4-6\n> 帮我设计这个分布式缓存系统的架构方案\n\n/model claude-sonnet-4-6\n> 基于以上架构，实现 CacheManager 类\n\n/model claude-haiku-4-5-20251001\n> 为以下 50 个函数生成简短注释（批量任务）\n```\n\n## 实战：多 Agent 协作完成功能开发全流程\n\n一个从需求到上线的 5 步 Agent 协作流程：\n\n```\n# 阶段 1：规划（使用 planner agent）\n> 用 planner agent 分析以下需求，制定实施方案：\n  需求：为博客添加文章收藏功能（登录用户可收藏/取消收藏，查看收藏列表）\n\n# 阶段 2：TDD（使用 tdd-guide agent）\n> 规划方案已确认，用 tdd-guide agent 先写测试：\n  - 收藏/取消收藏的 Service 层测试\n  - 收藏列表查询的 Repository 测试\n\n# 阶段 3：实现\n> 测试已写好，实现代码使所有测试通过\n\n# 阶段 4：并行审查（同时启动两个任务）\n> 启动两个并行审查任务：\n  任务 A：code-reviewer agent 审查代码质量\n  任务 B：security-reviewer agent 检查安全问题\n  两个任务完成后汇总结果\n\n# 阶段 5：修复审查发现的问题，提交 PR\n```",
          "exercises": [
            {
              "id": "ex-1",
              "title": "三视角并行代码审查",
              "difficulty": "高级",
              "description": "选择一个你项目中的核心模块（至少 100 行），用多 Agent 从三个视角同时审查：\n\n1. **安全视角**：有哪些安全漏洞或风险？\n2. **性能视角**：有哪些性能瓶颈或低效操作？\n3. **可维护性视角**：代码耦合度如何？新人上手难度？\n\n将三份报告汇总，按优先级制定改进计划（CRITICAL/HIGH/MEDIUM/LOW）。",
              "hints": "- 可以直接让 Claude 模拟\"分别扮演三个专家视角\"，这不需要真正启动独立进程\n- 如果使用 ECC 的 Agent 工具，可以用 `/agent code-reviewer`、`/agent security-reviewer` 等\n- 汇总时说：「综合三个视角的报告，按优先级列出需要改进的点」",
              "solution": "示例对话：\n\n```\n> 读取 myblog/src/main/java/com/myblog/service/PostServiceImpl.java\n\n> 现在从三个独立视角分析这个文件：\n\n  视角 1（安全专家）：识别所有潜在的安全问题\n  视角 2（性能专家）：识别所有性能瓶颈和低效操作\n  视角 3（架构专家）：评估代码的职责划分、耦合度和可测试性\n\n  每个视角独立分析，不要相互影响，最后汇总到一个优先级矩阵\n\n> 根据上面的分析，生成一个 IMPROVEMENT_PLAN.md，\n  按 CRITICAL/HIGH/MEDIUM/LOW 排列所有改进项，\n  每项包含：问题描述、受影响文件、建议修复方式\n```"
            }
          ]
        },
        {
          "id": "04-mastery/02-performance-cost",
          "title": "性能优化与成本控制",
          "difficulty": "高级",
          "readTime": 12,
          "order": 2,
          "tags": [],
          "content": "## Token 消耗模型\n\nClaude Code 的成本由两部分构成：\n\n```\n总成本 = 输入 tokens × 输入价格 + 输出 tokens × 输出价格\n```\n\n**输入 tokens** 包括：\n- 对话历史（随对话增长）\n- 你发送的文本\n- 工具调用的结果（读取的文件内容、命令输出）\n\n**输出 tokens** 包括：\n- Claude 的回复文字\n- 生成的代码\n\n一般来说，**输入 tokens >> 输出 tokens**，因此控制读取文件的范围是最有效的成本优化手段。\n\n## 模型选择决策树\n\n```\n任务是否需要深度推理或复杂架构决策？\n  YES → Opus 4.6\n  NO  ↓\n\n任务是否需要高质量代码生成？\n  YES → Sonnet 4.6\n  NO  ↓\n\n任务是否简单重复（批量格式化/注释/分类）？\n  YES → Haiku 4.5（成本降低 3-5 倍）\n  NO  → Sonnet 4.6（默认选择）\n```\n\n**各模型适用场景**：\n\n| 模型 | 适用场景 |\n|------|---------|\n| Opus 4.6 | 系统架构设计、复杂算法、高风险决策 |\n| Sonnet 4.6 | 日常编码、代码审查、重构、测试 |\n| Haiku 4.5 | 代码格式化、注释生成、简单问答、日志分析 |\n\n## Extended Thinking 调优\n\nExtended Thinking 让 Claude 在回答前进行内部推理（最多 32K tokens）。\n\n**开启时机**（默认开启）：\n- 复杂的系统设计\n- 多步骤的算法问题\n- 需要权衡多个方案的决策\n\n**可关闭时机**（节省 token）：\n- 简单的代码修改\n- 文档更新\n- 格式化和重命名\n\n切换方式：\n- `Option+T`（macOS）/ `Alt+T`（Windows/Linux）\n- 或在 `~/.claude/settings.json` 中设置 `alwaysThinkingEnabled: false`\n\n## 上下文窗口使用率监控\n\n用 `/cost` 查看当前会话的 token 消耗：\n\n```\n/cost\n```\n\n输出示例：\n```\n当前会话：\n  输入：45,231 tokens（22.6%）\n  输出：8,192 tokens\n  预计剩余容量：~155K tokens\n  本次会话费用：约 $0.12\n```\n\n当使用率超过 60-70% 时，考虑 `/compact` 压缩。\n\n## 批量操作优化策略\n\n**不要逐个操作**，批量处理可以节省大量 token：\n\n```\n❌ 逐个操作（50 次对话）：\n> 为 calculateTotal 函数添加注释\n> 为 formatDate 函数添加注释\n> 为 validateEmail 函数添加注释\n... （重复 50 次）\n\n✅ 批量操作（1 次对话）：\n> 用 Grep 找出 src/utils/ 目录下所有没有 JSDoc 注释的函数，\n  为这些函数批量添加简洁的中文 JSDoc 注释\n```\n\n**批量重命名**：\n\n```\n✅ 高效\n> 用 Grep 找出所有使用 getUserInfo 的地方，\n  统一替换为 fetchUserProfile\n  （一次性找到所有位置，逐文件替换）\n```\n\n## 实战：成本优化对比\n\n同一个任务，两种执行方式的成本对比：\n\n**任务**：为 20 个 API 端点生成接口文档\n\n**方式 A（低效）**：\n```\n> 读取所有 Controller 文件（10 个文件），然后读取所有 DTO 文件（20 个文件）...\n（上下文消耗：~15K tokens 仅用于文件读取）\n```\n\n**方式 B（高效）**：\n```\n> 用 Grep 在 Controller 文件中找出所有 @GetMapping/@PostMapping 注解，\n  只读取带有这些注解的方法，生成端点文档\n（上下文消耗：~3K tokens，节省 80%）\n```",
          "exercises": [
            {
              "id": "ex-1",
              "title": "模型选择实验",
              "difficulty": "高级",
              "description": "针对以下 3 种不同复杂度的任务，分别选择合适的模型（Haiku/Sonnet/Opus）并执行，记录结果：\n\n**任务 1（简单）**：为 `validateEmail(email)` 函数生成一个简短的注释\n**任务 2（中等）**：实现一个带有错误处理和重试机制的 HTTP 请求封装函数\n**任务 3（复杂）**：设计一个支持水平扩展的用户会话管理系统架构\n\n对每个任务：\n1. 预测应该用哪个模型\n2. 执行并记录输出质量（主观评分 1-10）\n3. 与用不同模型的结果对比（至少选一个任务对比两种模型）",
              "hints": "- 切换模型：`/model claude-haiku-4-5-20251001`（Haiku）、`/model claude-sonnet-4-6`（Sonnet）\n- 用 `/cost` 在每个任务后查看 token 消耗\n- 评估维度：准确性、完整性、代码质量、是否需要补充",
              "solution": "模型选择参考：\n\n- 任务 1：Haiku（简单注释，用昂贵模型是浪费）\n- 任务 2：Sonnet（标准编码任务）\n- 任务 3：Opus（架构设计，需要深度推理）\n\n切换命令：\n```\n/model claude-haiku-4-5-20251001\n> 为 validateEmail(email) 函数写一行 JSDoc 注释\n\n/model claude-sonnet-4-6\n> 实现带重试机制的 HTTP 请求封装\n\n/model claude-opus-4-6\n> 设计可水平扩展的用户会话管理系统架构\n```\n\n对比实验：用 Haiku 做任务 3，观察架构方案的深度和完整性差异。"
            }
          ]
        },
        {
          "id": "04-mastery/03-team-collaboration",
          "title": "团队协作规范",
          "difficulty": "高级",
          "readTime": 12,
          "order": 3,
          "tags": [],
          "content": "## 团队 AI 协作的挑战\n\n当整个团队都使用 Claude Code 时，会出现新的协调问题：\n\n- 每个人的 Claude 行为不一致（A 用的是 Java 8 风格，B 用的是 Java 17）\n- 新成员不知道有哪些项目约定\n- 一个人改了 Agent 配置，其他人不知道\n- AI 生成的代码审查风格差异很大\n\n解决方案：**将 Claude Code 配置视为基础设施，纳入版本管理**。\n\n## 配置文件的版本管理策略\n\n提交到 Git 的配置（团队共享）：\n\n```\n.claude/\n├── settings.json          # 团队统一设置（权限策略、Hooks 配置）\n├── agents/                # 项目专属 Agent 定义\n│   ├── code-reviewer.md\n│   └── security-auditor.md\n├── commands/              # 团队共享的斜杠命令\n│   ├── review.md\n│   ├── pre-commit.md\n│   └── release-note.md\n└── rules/                 # 编码规范和工作流规则\n    ├── git-workflow.md\n    ├── coding-style.md\n    └── security.md\nCLAUDE.md                  # 项目说明书\n```\n\n**不提交到 Git**（写入 `.gitignore`）：\n\n```\n.claude/settings.local.json    # 个人设置覆盖（如个人 API Key 代理）\n```\n\n## CLAUDE.md 的团队编写规范\n\n团队 CLAUDE.md 应当由负责人维护，遵循以下原则：\n\n### 1. 写作受众是 Claude，不是人类\n\n```markdown\n# ❌ 写给人看的风格\n本项目是一个博客系统，大家要注意 Tag 实体的懒加载问题。\n\n# ✅ 写给 Claude 看的风格\n## 已知陷阱（必读）\n\n### Tag 懒加载\n`Tag.posts` 是 LAZY 集合，JPA Session 在 Controller 返回后关闭。\n**模板中禁止**调用 `tag.posts.size()`。\n**正确做法**：使用 `TagRepository.findTagPostCounts()` 的 JPQL COUNT 查询，\n结果以 `Map<Long, Long>` 传入模板，通过 `${tagPostCounts[tag.id]}` 访问。\n```\n\n### 2. 保持精简，避免臃肿\n\nCLAUDE.md 过长会被截断或降低 Claude 的注意力。超过 200 行时考虑拆分到 Rules 文件。\n\n### 3. 定期审查\n\n每个 Sprint 结束时，检查 CLAUDE.md 是否需要更新：\n- 有没有新的\"已知陷阱\"需要记录？\n- 有没有过时的信息需要删除？\n- 架构变更是否已经反映在文档中？\n\n## 共享命令与 Agent 设计\n\n团队共享的命令和 Agent 需要**足够通用**，适合不同成员的使用方式：\n\n```markdown\n# ✅ 好的共享命令（参数化，灵活）\n---\ndescription: 审查指定文件，支持指定重点关注的维度\n---\n审查文件 $ARGUMENTS\n\n关注维度（按优先级）：\n1. 安全漏洞\n2. 架构合规性（是否违反项目分层规范）\n3. 代码质量\n\n# ❌ 过于个人化（不适合团队）\n---\ndescription: 按我喜欢的风格审查代码\n---\n用我偏好的 Google 风格...\n```\n\n## 新成员 Onboarding 流程\n\n一份标准的\"AI 辅助 Onboarding\"流程：\n\n```markdown\n## 新成员使用 Claude Code 上手步骤\n\n1. 克隆仓库后，在项目根目录启动 Claude Code\n   cd your-project && claude\n\n2. 运行以下命令了解项目\n   > 读取 CLAUDE.md，告诉我这个项目的核心架构和常用命令\n\n3. 完成第一个任务前，运行环境检查\n   /project:env-check\n\n4. 开发完成后，使用提交前检查\n   /project:pre-commit\n\n5. 创建 PR 时\n   /project:review-pr\n```\n\n## 实战：为开源项目设计 Claude Code 配置\n\n一个可供参考的完整 `.claude/` 目录结构：\n\n```\n.claude/\n├── settings.json\n│   └── hooks: PostToolUse(Edit) → 自动格式化\n├── agents/\n│   └── project-reviewer.md → 了解项目特定规范的审查员\n├── commands/\n│   ├── review.md      → /project:review <file>\n│   ├── pre-commit.md  → /project:pre-commit\n│   └── onboard.md     → /project:onboard（新成员引导）\n└── rules/\n    ├── git.md         → Git 规范（alwaysApply: true）\n    ├── security.md    → 安全要求（alwaysApply: true）\n    └── style.md       → 代码风格（按文件类型条件触发）\n```",
          "exercises": [
            {
              "id": "ex-1",
              "title": "项目配置模板设计",
              "difficulty": "高级",
              "description": "为你的项目（或一个假设的全栈项目）设计完整的 `.claude/` 配置，并完成以下检验：\n\n1. 写完配置后，**扮演新成员**：仅凭 CLAUDE.md 和 `.claude/` 配置，让 Claude 帮你理解项目架构\n2. 用 `/project:pre-commit` 或你创建的等效命令执行一次提交前检查\n3. 记录：哪些配置对新成员最有帮助？哪些 CLAUDE.md 内容缺失会造成混乱？",
              "hints": "- 最小可用的配置：一个 CLAUDE.md + 一个命令（pre-commit）+ 一个 Rule（git-workflow）\n- \"扮演新成员\"验证很重要：说「假设我是刚加入这个项目的开发者，只有你面前的 CLAUDE.md 文件，帮我了解这个项目」\n- 记录发现，更新 CLAUDE.md 填补空白",
              "solution": "最小可用 `.claude/` 配置：\n\n```bash\nmkdir -p .claude/commands .claude/rules\n\n# 命令：提交前检查\ncat > .claude/commands/pre-commit.md << 'EOF'\n---\ndescription: 提交前检查\n---\n执行：\n1. git diff --name-only（查看修改的文件）\n2. 检查这些文件中有无明显的安全问题（硬编码密钥、SQL 拼接）\n3. 运行项目测试命令\n4. 给出是否可以安全提交的结论\nEOF\n\n# Rule：Git 规范\ncat > .claude/rules/git.md << 'EOF'\n---\ndescription: Git 提交规范\nalwaysApply: true\n---\n- Commit message 格式：<type>: <中文描述>\n- type 可选：feat/fix/refactor/docs/test/chore\n- 不直接提交到 main，使用 feat/ 或 fix/ 分支\nEOF\n```\n\n验证：\n```\n> 假设我是新来的开发者，读取 CLAUDE.md 帮我了解这个项目，\n  然后说明我应该如何创建第一个功能分支\n```"
            }
          ]
        },
        {
          "id": "04-mastery/04-cicd",
          "title": "CI/CD 集成",
          "difficulty": "高级",
          "readTime": 14,
          "order": 4,
          "tags": [],
          "content": "## Claude Code 的非交互模式\n\nClaude Code 支持在没有终端交互的环境（如 CI 服务器）中运行，通过 `-p` 参数一次性执行任务：\n\n```bash\n# 基本用法\nclaude -p \"读取 src/ 目录，检查是否有明显的代码质量问题，输出报告\"\n\n# 指定工具权限（CI 中通常只允许只读工具）\nclaude -p \"审查 PR 变更\" \\\n  --allowedTools \"Read,Grep,Glob,Bash(git diff)\"\n\n# JSON 格式输出（便于脚本解析）\nclaude --output-format json -p \"分析代码质量\" | jq '.result'\n\n# 禁止交互式确认（CI 环境必须）\nclaude --dangerously-skip-permissions -p \"任务描述\"\n```\n\n## GitHub Actions 集成方案\n\n在 GitHub Actions 中调用 Claude Code 需要：\n1. 设置 `ANTHROPIC_API_KEY` 密钥\n2. 安装 Node.js 和 Claude Code\n3. 使用 `-p` 模式执行任务\n\n**基础 workflow 结构**：\n\n```yaml\nname: Claude Code 分析\n\non:\n  pull_request:\n    types: [opened, synchronize]\n\njobs:\n  claude-review:\n    runs-on: ubuntu-latest\n    permissions:\n      pull-requests: write\n      contents: read\n\n    steps:\n      - uses: actions/checkout@v4\n        with:\n          fetch-depth: 0  # 获取完整历史，供 git diff 使用\n\n      - uses: actions/setup-node@v4\n        with:\n          node-version: '20'\n\n      - name: 安装 Claude Code\n        run: npm install -g @anthropic-ai/claude-code\n\n      - name: 运行 Claude 分析\n        env:\n          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}\n        run: |\n          claude --dangerously-skip-permissions \\\n            --allowedTools \"Read,Grep,Glob,Bash(git diff,git log)\" \\\n            -p \"分析任务...\" > analysis.txt\n\n      - name: 发布结果到 PR\n        uses: actions/github-script@v7\n        with:\n          script: |\n            const fs = require('fs');\n            const analysis = fs.readFileSync('analysis.txt', 'utf8');\n            github.rest.issues.createComment({\n              issue_number: context.issue.number,\n              owner: context.repo.owner,\n              repo: context.repo.repo,\n              body: `## 🤖 Claude Code 分析\\n\\n${analysis}`\n            });\n```\n\n## 自动 PR Review 流水线\n\n一个完整的 PR 自动审查 workflow：\n\n```yaml\nname: 自动代码审查\n\non:\n  pull_request:\n    types: [opened, synchronize]\n\njobs:\n  review:\n    runs-on: ubuntu-latest\n    permissions:\n      pull-requests: write\n      contents: read\n\n    steps:\n      - uses: actions/checkout@v4\n        with:\n          fetch-depth: 0\n\n      - uses: actions/setup-node@v4\n        with:\n          node-version: '20'\n\n      - run: npm install -g @anthropic-ai/claude-code\n\n      - name: Claude 代码审查\n        env:\n          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}\n        run: |\n          # 获取变更文件列表\n          CHANGED_FILES=$(git diff origin/${{ github.base_ref }}...HEAD --name-only \\\n            | grep -E '\\.(java|ts|js|py)$' \\\n            | head -20)\n\n          if [ -z \"$CHANGED_FILES\" ]; then\n            echo \"没有需要审查的代码文件\" > review.md\n            exit 0\n          fi\n\n          # 构建审查提示\n          FILES_LIST=$(echo \"$CHANGED_FILES\" | tr '\\n' ' ')\n\n          claude --dangerously-skip-permissions \\\n            --allowedTools \"Read,Grep,Glob\" \\\n            -p \"\n          请审查以下变更文件的代码质量：\n          $FILES_LIST\n\n          重点检查：\n          1. 安全问题（SQL 注入、XSS、硬编码密钥）\n          2. 潜在的空指针/null 风险\n          3. 明显的逻辑错误\n          4. 与项目现有代码风格的一致性\n\n          输出格式：\n          - 如无问题：「✅ 代码审查通过」\n          - 有问题：按 CRITICAL/HIGH/MEDIUM/LOW 分级列出\n          \" > review.md\n\n      - name: 发布审查结果\n        if: always()\n        uses: actions/github-script@v7\n        with:\n          script: |\n            const fs = require('fs');\n            const review = fs.readFileSync('review.md', 'utf8');\n            await github.rest.issues.createComment({\n              issue_number: context.issue.number,\n              owner: context.repo.owner,\n              repo: context.repo.repo,\n              body: `## 🤖 Claude Code 自动审查\\n\\n${review}\\n\\n*由 Claude Code 自动生成*`\n            });\n```\n\n## 变更影响分析自动化\n\n在 CI 中分析 PR 对系统的潜在影响：\n\n```yaml\n- name: 变更影响分析\n  env:\n    ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}\n  run: |\n    DIFF=$(git diff origin/${{ github.base_ref }}...HEAD)\n\n    claude --dangerously-skip-permissions \\\n      --allowedTools \"Read,Grep,Glob\" \\\n      -p \"\n    以下是 PR 的代码变更：\n    $DIFF\n\n    请分析：\n    1. 这个变更影响了哪些功能模块？\n    2. 有哪些其他模块可能间接受到影响？\n    3. 有哪些边缘情况需要在测试中覆盖？\n    4. 这个变更是否需要数据库迁移或配置变更？\n\n    输出一份简洁的影响评估报告。\n    \" > impact.md\n```\n\n## 安全与权限控制\n\n在 CI 中使用 Claude Code 需要特别注意权限控制：\n\n```bash\n# ✅ 最小权限原则：只允许只读工具\nclaude --allowedTools \"Read,Grep,Glob,Bash(git diff,git log,git show)\"\n\n# ✅ 限制工作目录\nclaude --cwd \"$GITHUB_WORKSPACE\"\n\n# ❌ 避免在 CI 中使用（太危险）\nclaude --dangerously-skip-permissions  # 允许所有操作，包括文件删除\n```\n\n**保护密钥**：\n\n```yaml\nenv:\n  ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}  # 从 GitHub Secrets 读取\n  # 绝对不要这样做：\n  # ANTHROPIC_API_KEY: \"sk-ant-...\"  # ❌ 硬编码在 workflow 文件中\n```",
          "exercises": [
            {
              "id": "ex-1",
              "title": "构建 GitHub Actions PR 自动审查",
              "difficulty": "高级",
              "description": "在你的 GitHub 仓库中，创建一个 GitHub Actions workflow，实现自动 PR 代码审查：\n\n1. 当 PR 创建或更新时触发\n2. 让 Claude 审查变更文件的代码质量\n3. 将审查结果作为 PR comment 自动发布\n\n验证：创建一个测试 PR，确认 workflow 正常运行，审查结果出现在 PR 页面。",
              "hints": "- 需要在仓库的 Settings → Secrets → Actions 中添加 `ANTHROPIC_API_KEY`\n- workflow 文件放在 `.github/workflows/claude-review.yml`\n- 先用简单版本测试（不发布 comment，只 echo 结果），确认 Claude Code 可运行后再加 comment 功能\n- `--allowedTools \"Read,Grep,Glob\"` 限制 CI 中只读操作，更安全",
              "solution": "完整 workflow（`.github/workflows/claude-review.yml`）：\n\n```yaml\nname: Claude Code PR Review\n\non:\n  pull_request:\n    types: [opened, synchronize]\n\njobs:\n  review:\n    runs-on: ubuntu-latest\n    permissions:\n      pull-requests: write\n      contents: read\n\n    steps:\n      - uses: actions/checkout@v4\n        with:\n          fetch-depth: 0\n\n      - uses: actions/setup-node@v4\n        with:\n          node-version: '20'\n\n      - run: npm install -g @anthropic-ai/claude-code\n\n      - name: Run Claude Review\n        env:\n          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}\n        run: |\n          CHANGED=$(git diff origin/${{ github.base_ref }}...HEAD \\\n            --name-only | grep -E '\\.(js|ts|java|py)$' | head -10)\n\n          if [ -z \"$CHANGED\" ]; then\n            echo \"✅ 没有需要审查的代码文件\" > review.txt\n          else\n            claude --dangerously-skip-permissions \\\n              --allowedTools \"Read,Grep,Glob\" \\\n              -p \"审查这些变更文件的代码质量和安全性：$CHANGED\n              输出简洁的报告，有问题分 CRITICAL/HIGH/MEDIUM 列出。\" \\\n              > review.txt\n          fi\n\n      - name: Comment PR\n        uses: actions/github-script@v7\n        with:\n          script: |\n            const fs = require('fs');\n            const body = fs.readFileSync('review.txt', 'utf8');\n            github.rest.issues.createComment({\n              issue_number: context.issue.number,\n              owner: context.repo.owner,\n              repo: context.repo.repo,\n              body: `## 🤖 Claude Code 审查\\n\\n${body}`\n            });\n```"
            }
          ]
        }
      ]
    }
  ],
  "practices": [
    {
      "id": "claude-md-guide",
      "title": "CLAUDE.md 最佳实践指南",
      "tags": [],
      "description": "如何写出高质量的 CLAUDE.md，让 AI 助手更高效地协助你的团队",
      "content": "## 为什么 CLAUDE.md 很重要？\n\n一个好的 CLAUDE.md 可以将 Claude Code 的效率提升 3-5 倍。它相当于把项目的\"老鸟\"知识固化下来，让 AI 每次对话都在正确的上下文中工作。\n\n## 核心原则\n\n### 原则一：写\"不显然\"的信息\n\nCLAUDE.md 应该包含那些**不能从代码本身推断出来**的信息。\n\n```markdown\n# ❌ 没用（可以从代码读到）\n- 用 Spring Boot 框架\n- 有 UserController 类\n\n# ✅ 有价值（上下文知识）\n- 用 SPRING_PROFILES_ACTIVE=dev 启动开发环境（SQL 日志会开启）\n- 修改 Post 实体后必须同步更新 PostForm DTO，否则表单提交会丢数据\n- Tag 支持中文，slug 生成需要正则加 \\u4e00-\\u9fa5 范围\n```\n\n### 原则二：常用命令要精确\n\n```markdown\n# ❌ 太模糊\n运行项目\n\n# ✅ 精确可执行\n\\`\\`\\`bash\n# 开发模式（自动重建表、显示 SQL、端口 8080）\ncd myblog && SPRING_PROFILES_ACTIVE=dev mvn spring-boot:run\n\n# 生产模式（需先手动建表）\ncd myblog && mvn spring-boot:run\n\\`\\`\\`\n```\n\n### 原则三：标注\"禁区\"\n\n```markdown\n## 禁止修改的文件\n- `src/legacy/payment/` — 遗留支付代码，动它会导致线上故障\n- `db/schema.sql` — 生产数据库参考脚本，不是开发用的\n\n## 特殊注意\n- `Tag` 和 `Category` 的 `posts` 集合是 LAZY 加载，\n  模板中不要用 `tag.posts.size()`，要用 Repository 的 COUNT 查询\n```\n\n### 原则四：分层组织\n\n对于大型项目，按模块拆分：\n\n```\nproject/\n├── CLAUDE.md              # 项目概览、快速开始\n├── backend/CLAUDE.md      # 后端特定规范\n├── frontend/CLAUDE.md     # 前端特定规范\n└── infra/CLAUDE.md        # 基础设施说明\n```\n\n## 完整模板\n\n```markdown\n# CLAUDE.md\n\n本文件为 Claude Code 在此仓库工作时提供指引。\n\n## 快速开始\n\n\\`\\`\\`bash\n# 安装依赖\nnpm install\n\n# 开发模式\nnpm run dev    # http://localhost:3000\n\n# 运行测试\nnpm test\n\n# 生产构建\nnpm run build\n\\`\\`\\`\n\n## 技术栈\n\n| 层 | 技术 |\n|----|------|\n| 前端 | React 18 + TypeScript + Tailwind |\n| 状态 | Zustand |\n| 后端 | Node.js + Express |\n| 数据库 | PostgreSQL + Prisma ORM |\n| 测试 | Vitest + Testing Library |\n\n## 项目结构\n\n\\`\\`\\`\nsrc/\n├── components/   # React 组件（按功能分目录）\n├── pages/        # Next.js 页面路由\n├── services/     # API 调用封装\n├── store/        # Zustand 状态\n└── utils/        # 工具函数\n\\`\\`\\`\n\n## 编码规范\n\n- 所有注释和 commit message 使用中文\n- 组件用 PascalCase，文件名与组件同名\n- API 路径统一加 /api/v1 前缀\n- 禁止在组件中直接 fetch，必须通过 services/ 层\n\n## 已知陷阱\n\n- **Prisma 迁移**：改 schema 后必须运行 `npx prisma migrate dev`，不要用 `db push`\n- **环境变量**：`.env.local` 优先级高于 `.env`，本地开发用 `.env.local`\n- **图片资源**：放 `public/` 不放 `src/assets/`（构建时不会被处理）\n\n## 不要动的文件\n\n- `src/lib/analytics.ts` — 第三方数据分析集成，改动需要产品确认\n- `prisma/migrations/` — 已提交的迁移文件不要手动修改\n```\n\n## 让 Claude 帮你生成 CLAUDE.md\n\n如果项目已有代码，可以让 Claude 自动生成初始版本：\n\n```\n> 分析当前项目的代码结构、package.json 和现有配置文件，\n  帮我生成一个高质量的 CLAUDE.md，\n  重点包含：常用命令、技术栈、架构概述和已知陷阱\n```\n\n然后根据你的实际情况补充修改。"
    },
    {
      "id": "prompt-engineering",
      "title": "Prompt 工程速成指南",
      "tags": [],
      "description": "10 个立竿见影的 Prompt 技巧，让 Claude 输出更精准",
      "content": "## 技巧 1：三要素结构\n\n每个 Prompt 应包含：**上下文 + 意图 + 约束**。\n\n```\n❌ 写一个缓存类\n✅ 这是一个 Node.js 服务（Express + Redis），我需要一个内存缓存类，\n   用于缓存数据库查询结果（TTL 5分钟），要求线程安全，\n   不要引入新的 npm 包\n```\n\n## 技巧 2：先分析，再执行\n\n对于不可逆或影响范围大的操作，先让 Claude 分析影响范围：\n\n```\n> 在修改 User 实体之前，先告诉我有哪些文件会受到影响，\n  不要开始修改\n```\n\n## 技巧 3：引用具体文件\n\n比模糊描述强 10 倍：\n\n```\n❌ 参考现有的认证代码\n✅ 参考 SecurityConfig.java 第 45-80 行的过滤器链配置方式\n```\n\n## 技巧 4：迭代而非重写\n\n出错时，告诉 Claude 哪里错了，而不是要求重写：\n\n```\n❌ 这不对，重新写\n✅ 错误在于：你用了 null 检查，但这个项目统一用 Optional，\n   请修改 findUser 方法的返回值处理\n```\n\n## 技巧 5：分步骤大任务\n\n一次性生成 300 行代码很难控制质量：\n\n```\n步骤 1：先设计接口（不写实现）\n步骤 2：实现核心逻辑\n步骤 3：添加错误处理\n步骤 4：写测试\n```\n\n## 技巧 6：指定输出格式\n\n```\n> 生成一份 Markdown 表格，列出所有 API 端点：\n  | 方法 | 路径 | 说明 | 需要认证 |\n```\n\n## 技巧 7：用负面约束\n\n明确说\"不要做什么\"：\n\n```\n> 实现分页功能，不要引入 PageHelper 插件，\n  不要修改 Service 接口，只在 Controller 层处理分页参数\n```\n\n## 技巧 8：要求自我检查\n\n```\n> 生成代码后，检查一遍：有没有 null 指针风险？\n  异常是否都被处理了？\n```\n\n## 技巧 9：粘贴错误信息而不是描述错误\n\n```\n❌ 有个空指针异常\n✅ 出现以下错误，请分析原因：\n   NullPointerException at PostService.java:142\n   at com.myblog.service.PostServiceImpl.getPost(PostServiceImpl.java:142)\n```\n\n## 技巧 10：CLAUDE.md 固化常用约束\n\n把你反复强调的约束写进 CLAUDE.md，避免每次重复说：\n\n```markdown\n## 编码约束\n- 所有方法注释用中文\n- 禁止直接 System.out.println，用 log.info\n- Service 方法必须加 @Transactional 注解（只读方法加 readOnly=true）\n```"
    }
  ],
  "cheatsheet": {
    "commands": {
      "title": "常用命令速查",
      "order": 2,
      "content": "## 工具调用说明\n\nClaude Code 内部使用以下工具，了解它们让你写出更精准的 Prompt：\n\n| 工具 | 用途 | Prompt 示例 |\n|------|------|-------------|\n| `Read` | 读取文件内容 | \"读取 UserService.java\" |\n| `Edit` | 精确字符串替换 | \"将函数名 X 改为 Y\" |\n| `Write` | 创建/覆写文件 | \"创建 config.js 文件\" |\n| `Bash` | 执行 shell 命令 | \"运行测试\", \"执行 git diff\" |\n| `Glob` | 文件名模式匹配 | \"找出所有 *.test.ts 文件\" |\n| `Grep` | 内容正则搜索 | \"搜索 console.log 调用\" |\n| `Agent` | 启动子代理 | \"用 code-reviewer 审查\" |\n\n## Grep 输出模式\n\n```bash\n# files_with_matches（默认）：只返回文件路径\n> 哪些文件包含 TODO 注释？\n\n# content：返回匹配的代码行（含上下文）\n> 搜索所有 @Transactional 注解，显示前后 2 行\n\n# count：统计每文件的匹配数\n> 统计每个 Java 文件的 TODO 数量，按数量排序\n```\n\n## Git 常用对话模板\n\n```\n# 生成 commit message\n> 查看 git diff，生成 Conventional Commits 格式的中文 commit message\n\n# 生成 PR 描述\n> 用 git diff main...HEAD 查看所有变更，生成包含摘要和测试计划的 PR 描述\n\n# 分析提交历史\n> 查看最近 20 条 commit，总结这段时间的主要变更方向\n\n# 解决冲突\n> 读取冲突文件，解释两个版本的差异，建议合理的合并方式\n```\n\n## 启动参数速查\n\n```bash\nclaude                                    # 交互模式\nclaude -p \"任务\"                          # 单次执行\nclaude --model claude-opus-4-6            # 指定模型\nclaude --allowedTools \"Read,Grep,Glob\"   # 限制工具权限\nclaude --output-format json               # JSON 输出\nclaude --dangerously-skip-permissions     # 跳过所有权限确认（CI 用）\nclaude --cwd /path/to/project             # 指定工作目录\n```"
    },
    "config": {
      "title": "配置文件参考",
      "order": 3,
      "content": "## .claude/ 目录结构\n\n```\n项目根目录/\n├── CLAUDE.md                    # 项目说明书（自动加载）\n└── .claude/\n    ├── settings.json            # 团队设置（提交 git）\n    ├── settings.local.json      # 个人覆盖（加入 .gitignore）\n    ├── agents/                  # 项目专属 Agent\n    │   └── my-reviewer.md\n    ├── commands/                # 项目斜杠命令（/project:xxx）\n    │   ├── review.md\n    │   └── pre-commit.md\n    └── rules/                   # 编码规范规则\n        ├── git-workflow.md\n        └── security.md\n\n~/.claude/\n├── CLAUDE.md                    # 全局用户偏好\n├── settings.json                # 全局设置\n├── agents/                      # 全局 Agent（所有项目可用）\n├── commands/                    # 全局命令（/user:xxx）\n└── rules/                       # 全局规则\n```\n\n## settings.json 常用配置\n\n```json\n{\n  \"model\": \"claude-sonnet-4-6\",\n  \"theme\": \"dark\",\n  \"alwaysThinkingEnabled\": true,\n\n  \"permissions\": {\n    \"allow\": [\n      \"Bash(git *)\",\n      \"Bash(npm *)\",\n      \"Bash(mvn *)\"\n    ],\n    \"deny\": [\n      \"Bash(rm -rf *)\"\n    ]\n  },\n\n  \"hooks\": {\n    \"PostToolUse\": [\n      {\n        \"matcher\": \"Edit|Write\",\n        \"hooks\": [\n          {\n            \"type\": \"command\",\n            \"command\": \"echo '文件已修改：$CLAUDE_TOOL_INPUT_FILE_PATH'\"\n          }\n        ]\n      }\n    ]\n  }\n}\n```\n\n## Agent 文件格式\n\n```markdown\n---\nname: Agent 显示名称\ndescription: 何时使用这个 Agent（Claude 自动选择时参考此字段）\nmodel: claude-sonnet-4-6    # 可选，不写则用默认\ntools:                       # 工具白名单\n  - Read\n  - Grep\n  - Glob\n  - Bash\n---\n\nAgent 的系统提示内容（Markdown 格式）...\n```\n\n## Rule 文件格式\n\n```markdown\n---\ndescription: 这条规则的简短说明\nglobs: [\"*.java\", \"*.kt\"]   # 可选：只在这些文件类型时触发\nalwaysApply: false           # true = 始终加载（不受文件类型限制）\n---\n\n规则内容（Markdown 格式）...\n```\n\n## .mcp.json 格式\n\n```json\n{\n  \"mcpServers\": {\n    \"服务器名\": {\n      \"type\": \"stdio\",\n      \"command\": \"npx\",\n      \"args\": [\"-y\", \"包名\"],\n      \"env\": {\n        \"ENV_VAR\": \"值\"\n      }\n    }\n  }\n}\n```"
    },
    "shortcuts": {
      "title": "快捷键速查",
      "order": 1,
      "content": "## 交互模式快捷键\n\n| 快捷键 | 功能 |\n|--------|------|\n| `Ctrl+C` | 中断当前操作 |\n| `Ctrl+D` | 退出（等同于 /exit） |\n| `↑ / ↓` | 浏览历史输入 |\n| `Tab` | 自动补全 |\n| `Ctrl+L` | 清屏（不清上下文） |\n| `Option+T` | 切换扩展思考模式（macOS） |\n| `Alt+T` | 切换扩展思考模式（Windows/Linux） |\n| `Ctrl+O` | 查看扩展思考输出 |\n\n## 内置斜杠命令\n\n| 命令 | 功能 |\n|------|------|\n| `/help` | 查看所有可用命令 |\n| `/clear` | 清空当前对话上下文 |\n| `/exit` | 退出 Claude Code |\n| `/status` | 查看当前会话状态 |\n| `/cost` | 查看本次会话的 token 用量 |\n| `/model` | 切换使用的模型 |\n| `/permissions` | 查看当前权限配置 |\n| `/compact` | 压缩上下文节省 token |\n\n## 启动参数\n\n```bash\nclaude                          # 交互模式\nclaude -p \"任务描述\"            # 单次执行模式\nclaude --model claude-opus-4-6  # 指定模型\nclaude --dangerously-skip-permissions  # 跳过所有权限确认\nclaude --no-markdown            # 纯文本输出（适合管道）\nclaude --output-format json     # JSON 格式输出\n```"
    }
  }
};
