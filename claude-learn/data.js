// 由 generate.js 自动生成 — 2026-03-18
window.LEARN_DATA = {
  "meta": {
    "version": "1.0.0",
    "generatedAt": "2026-03-18",
    "stats": {
      "lessons": 4,
      "exercises": 4,
      "practices": 1
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
      "lessons": []
    },
    {
      "id": "03-advanced",
      "title": "进阶篇",
      "icon": "🔧",
      "description": "Agent 系统、自定义命令、Hooks 与自动化",
      "lessons": []
    },
    {
      "id": "04-mastery",
      "title": "精通篇",
      "icon": "🏆",
      "description": "多 Agent 编排、性能优化、团队协作",
      "lessons": []
    }
  ],
  "practices": [
    {
      "id": "claude-md-guide",
      "title": "CLAUDE.md 最佳实践指南",
      "tags": [],
      "description": "如何写出高质量的 CLAUDE.md，让 AI 助手更高效地协助你的团队",
      "content": "## 为什么 CLAUDE.md 很重要？\n\n一个好的 CLAUDE.md 可以将 Claude Code 的效率提升 3-5 倍。它相当于把项目的\"老鸟\"知识固化下来，让 AI 每次对话都在正确的上下文中工作。\n\n## 核心原则\n\n### 原则一：写\"不显然\"的信息\n\nCLAUDE.md 应该包含那些**不能从代码本身推断出来**的信息。\n\n```markdown\n# ❌ 没用（可以从代码读到）\n- 用 Spring Boot 框架\n- 有 UserController 类\n\n# ✅ 有价值（上下文知识）\n- 用 SPRING_PROFILES_ACTIVE=dev 启动开发环境（SQL 日志会开启）\n- 修改 Post 实体后必须同步更新 PostForm DTO，否则表单提交会丢数据\n- Tag 支持中文，slug 生成需要正则加 \\u4e00-\\u9fa5 范围\n```\n\n### 原则二：常用命令要精确\n\n```markdown\n# ❌ 太模糊\n运行项目\n\n# ✅ 精确可执行\n\\`\\`\\`bash\n# 开发模式（自动重建表、显示 SQL、端口 8080）\ncd myblog && SPRING_PROFILES_ACTIVE=dev mvn spring-boot:run\n\n# 生产模式（需先手动建表）\ncd myblog && mvn spring-boot:run\n\\`\\`\\`\n```\n\n### 原则三：标注\"禁区\"\n\n```markdown\n## 禁止修改的文件\n- `src/legacy/payment/` — 遗留支付代码，动它会导致线上故障\n- `db/schema.sql` — 生产数据库参考脚本，不是开发用的\n\n## 特殊注意\n- `Tag` 和 `Category` 的 `posts` 集合是 LAZY 加载，\n  模板中不要用 `tag.posts.size()`，要用 Repository 的 COUNT 查询\n```\n\n### 原则四：分层组织\n\n对于大型项目，按模块拆分：\n\n```\nproject/\n├── CLAUDE.md              # 项目概览、快速开始\n├── backend/CLAUDE.md      # 后端特定规范\n├── frontend/CLAUDE.md     # 前端特定规范\n└── infra/CLAUDE.md        # 基础设施说明\n```\n\n## 完整模板\n\n```markdown\n# CLAUDE.md\n\n本文件为 Claude Code 在此仓库工作时提供指引。\n\n## 快速开始\n\n\\`\\`\\`bash\n# 安装依赖\nnpm install\n\n# 开发模式\nnpm run dev    # http://localhost:3000\n\n# 运行测试\nnpm test\n\n# 生产构建\nnpm run build\n\\`\\`\\`\n\n## 技术栈\n\n| 层 | 技术 |\n|----|------|\n| 前端 | React 18 + TypeScript + Tailwind |\n| 状态 | Zustand |\n| 后端 | Node.js + Express |\n| 数据库 | PostgreSQL + Prisma ORM |\n| 测试 | Vitest + Testing Library |\n\n## 项目结构\n\n\\`\\`\\`\nsrc/\n├── components/   # React 组件（按功能分目录）\n├── pages/        # Next.js 页面路由\n├── services/     # API 调用封装\n├── store/        # Zustand 状态\n└── utils/        # 工具函数\n\\`\\`\\`\n\n## 编码规范\n\n- 所有注释和 commit message 使用中文\n- 组件用 PascalCase，文件名与组件同名\n- API 路径统一加 /api/v1 前缀\n- 禁止在组件中直接 fetch，必须通过 services/ 层\n\n## 已知陷阱\n\n- **Prisma 迁移**：改 schema 后必须运行 `npx prisma migrate dev`，不要用 `db push`\n- **环境变量**：`.env.local` 优先级高于 `.env`，本地开发用 `.env.local`\n- **图片资源**：放 `public/` 不放 `src/assets/`（构建时不会被处理）\n\n## 不要动的文件\n\n- `src/lib/analytics.ts` — 第三方数据分析集成，改动需要产品确认\n- `prisma/migrations/` — 已提交的迁移文件不要手动修改\n```\n\n## 让 Claude 帮你生成 CLAUDE.md\n\n如果项目已有代码，可以让 Claude 自动生成初始版本：\n\n```\n> 分析当前项目的代码结构、package.json 和现有配置文件，\n  帮我生成一个高质量的 CLAUDE.md，\n  重点包含：常用命令、技术栈、架构概述和已知陷阱\n```\n\n然后根据你的实际情况补充修改。"
    }
  ],
  "cheatsheet": {
    "shortcuts": {
      "title": "快捷键速查",
      "order": 1,
      "content": "## 交互模式快捷键\n\n| 快捷键 | 功能 |\n|--------|------|\n| `Ctrl+C` | 中断当前操作 |\n| `Ctrl+D` | 退出（等同于 /exit） |\n| `↑ / ↓` | 浏览历史输入 |\n| `Tab` | 自动补全 |\n| `Ctrl+L` | 清屏（不清上下文） |\n| `Option+T` | 切换扩展思考模式（macOS） |\n| `Alt+T` | 切换扩展思考模式（Windows/Linux） |\n| `Ctrl+O` | 查看扩展思考输出 |\n\n## 内置斜杠命令\n\n| 命令 | 功能 |\n|------|------|\n| `/help` | 查看所有可用命令 |\n| `/clear` | 清空当前对话上下文 |\n| `/exit` | 退出 Claude Code |\n| `/status` | 查看当前会话状态 |\n| `/cost` | 查看本次会话的 token 用量 |\n| `/model` | 切换使用的模型 |\n| `/permissions` | 查看当前权限配置 |\n| `/compact` | 压缩上下文节省 token |\n\n## 启动参数\n\n```bash\nclaude                          # 交互模式\nclaude -p \"任务描述\"            # 单次执行模式\nclaude --model claude-opus-4-6  # 指定模型\nclaude --dangerously-skip-permissions  # 跳过所有权限确认\nclaude --no-markdown            # 纯文本输出（适合管道）\nclaude --output-format json     # JSON 格式输出\n```"
    }
  }
};
