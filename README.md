# MyBlog

一个现代、简洁、可直接运行的静态博客网站。

## 功能特性

- **首页** - 文章列表，支持标签筛选和搜索
- **文章详情页** - 自动生成目录、相关文章推荐
- **关于页** - 个人简介、技能展示、联系表单
- **深色/浅色主题** - 一键切换，持久化保存
- **响应式设计** - 适配桌面和移动端
- **8 篇示例文章** - 涵盖 JavaScript、CSS、Python、Node.js、Git、Docker 等主题

## 快速开始

### 方法一：直接用浏览器打开（最简单）

直接双击 `index.html` 在浏览器中打开。

### 方法二：使用 Node.js 服务器（推荐）

```bash
node server.js
```

然后打开浏览器访问 http://localhost:3000

## 项目结构

```
myblog/
├── index.html        # 首页（文章列表）
├── post.html         # 文章详情页
├── about.html        # 关于页
├── server.js         # Node.js 静态文件服务器
├── package.json
├── css/
│   └── style.css     # 全部样式（CSS 变量、响应式、深色主题）
└── js/
    ├── posts.js      # 博客文章数据（8 篇示例）
    ├── main.js       # 首页逻辑（渲染、筛选、搜索）
    └── post.js       # 文章详情页逻辑（Markdown 渲染、目录生成）
```

## 如何添加新文章

在 `js/posts.js` 中的 `POSTS` 数组添加新对象：

```javascript
{
  id: 9,                              // 唯一 ID
  title: "文章标题",
  excerpt: "文章摘要，显示在列表页...",
  tags: ["标签1", "标签2"],
  date: "2026-02-18",
  readTime: "5 分钟",
  emoji: "✨",                        // 封面 emoji
  content: `
## 正文标题

正文内容，支持 Markdown 语法...
  `
}
```

支持的 Markdown 语法：
- 标题（`#` `##` `###`）
- **粗体**、*斜体*
- `` `行内代码` `` 和代码块（```）
- 列表（`-` 和 `1.`）
- 引用（`>`）
- 表格
- 链接

## 自定义

- **修改博客名称**：搜索 `MyBlog` 替换为你的博客名
- **修改颜色主题**：编辑 `css/style.css` 中的 `--accent-primary` 变量
- **修改作者信息**：编辑 `about.html`
