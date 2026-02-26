# MyBlog

基于 Spring Boot 3 的博客系统，支持数据库持久化、Markdown 编写、管理后台和 Spring Security 认证。

## 功能特性

- **首页** — 文章列表，支持标签筛选、全文搜索和分页
- **文章详情** — 自动生成目录、相关文章推荐、Markdown 前端渲染
- **关于页** — 个人简介、技能展示、联系表单
- **管理后台** — 文章/标签/分类 CRUD，Markdown 实时预览，草稿/发布切换
- **深色/浅色主题** — 一键切换，localStorage 持久化
- **响应式设计** — 适配桌面和移动端

## 技术栈

| 层 | 技术 |
|----|------|
| 框架 | Spring Boot 3.3.5，Java 21 |
| 模板引擎 | Thymeleaf 3.1 |
| 持久化 | Spring Data JPA + MySQL 8 |
| 安全 | Spring Security + BCrypt |
| 前端 | 原生 CSS / Vanilla JS（无构建工具） |

## 快速开始

**前提条件**：Java 21+、Maven 3.9+、MySQL 8+

### 1. 创建数据库

```sql
CREATE DATABASE myblog CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 2. 配置数据库连接

编辑 `myblog/src/main/resources/application.yml`，修改数据库用户名和密码。

### 3. 启动应用

```bash
cd myblog
SPRING_PROFILES_ACTIVE=dev mvn spring-boot:run
```

开发模式会自动建表并导入 8 篇示例文章。

### 4. 访问

| 页面 | 地址 |
|------|------|
| 博客首页 | http://localhost:8080/ |
| 管理后台 | http://localhost:8080/admin/login |

默认管理员账号：`admin / changeme123`，**首次登录后请立即修改密码**。

## 项目结构

```
myblog/
├── pom.xml
└── src/main/
    ├── java/com/myblog/
    │   ├── config/          # Security、渐变色 Bean、数据初始化
    │   ├── entity/          # Post、Tag、Category、AdminUser
    │   ├── repository/      # Spring Data JPA 接口
    │   ├── service/         # 业务逻辑层
    │   ├── controller/      # BlogController、AdminController 等
    │   └── dto/             # PostForm、PageResult
    └── resources/
        ├── application.yml
        ├── application-dev.yml
        ├── db/schema.sql    # 建表参考脚本
        ├── static/css/      # style.css + admin.css
        ├── static/js/       # post-render.js + theme.js
        └── templates/       # Thymeleaf 模板（公开端 + 管理端）
```

## 如何新增文章

登录管理后台 → **文章管理** → **新建文章**，填写标题、标签、内容（Markdown）后保存或直接发布。

支持的 Markdown 语法：标题（`#`–`####`）、**粗体**、*斜体*、`` `行内代码` ``、代码块、无序/有序列表、引用块、表格、链接。

## 自定义

- **博客名称**：全局搜索 `MyBlog` 替换
- **主题色**：修改 `static/css/style.css` 中的 `--accent-primary` 变量
- **作者信息**：编辑 `templates/about.html`
