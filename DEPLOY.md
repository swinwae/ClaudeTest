# ClaudeTest 部署记录

> 部署时间：2026-03-27
> 目标服务器：`8.141.113.131`（阿里云 ECS）
> 操作系统：Alibaba Cloud Linux 3.2104 LTS（OpenAnolis Edition，基于 RHEL 8）

---

## 一、安装软件依赖

使用 `dnf` 安装以下软件：

| 软件 | 版本 | 安装方式 |
|------|------|---------|
| OpenJDK | 17.0.18 | `dnf install java-17-openjdk` |
| Maven | 3.9.6 | 华为云镜像手动下载解压 |
| MySQL | 8.0.44 | `dnf install mysql-server` |
| Nginx | 1.20.1 | `dnf install nginx` |
| Git | 2.43.7 | `dnf install git` |

**Maven 手动安装原因**：阿里云 Linux 3 官方仓库不含 Maven，从华为云镜像 (`mirrors.huaweicloud.com`) 下载 tar.gz 后解压至 `/opt/apache-maven-3.9.6`，并软链至 `/usr/local/bin/mvn`。

**Maven 阿里云加速**：写入 `/root/.m2/settings.xml`，将中央仓库镜像配置为 `https://maven.aliyun.com/repository/public`，避免从国外源下载依赖超时。

---

## 二、MySQL 数据库初始化

```sql
-- 设置 root 密码（全新安装 root 无密码）
ALTER USER 'root'@'localhost' IDENTIFIED BY '<root密码>';

-- 建库
CREATE DATABASE myblog CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 建专用账号
CREATE USER 'myblog_user'@'localhost' IDENTIFIED BY '<myblog_user密码>';
GRANT ALL PRIVILEGES ON myblog.* TO 'myblog_user'@'localhost';
```

执行项目自带建表脚本：

```bash
mysql -u myblog_user -p myblog < /opt/ClaudeTest/myblog/src/main/resources/db/schema.sql
```

建表结果（5 张表）：`admin_user`、`category`、`post`、`post_tag`、`tag`

---

## 三、克隆代码

```bash
cd /opt
git clone https://github.com/swinwae/ClaudeTest.git
```

代码位置：`/opt/ClaudeTest/`

---

## 四、myblog 配置说明

`application.yml` 保持与仓库一致，不修改文件内容。数据库账密通过**环境变量**注入，Spring Boot 会自动用环境变量覆盖 yml 默认值。

环境变量在 systemd 服务文件中设置（见第六步），无需改动 yml，`git pull` 后配置不会被覆盖。

---

## 五、打包 myblog

```bash
cd /opt/ClaudeTest/myblog
mvn clean package -DskipTests
```

产物：`target/myblog-1.0.0.jar`（耗时约 30 秒，依赖全部命中阿里云镜像缓存）

---

## 六、配置 systemd 服务

文件：`/etc/systemd/system/myblog.service`

```ini
[Unit]
Description=MyBlog Spring Boot Application
After=network.target mysqld.service

[Service]
User=root
WorkingDirectory=/opt/ClaudeTest/myblog
# 通过环境变量注入数据库账密，覆盖 application.yml 中的默认值
# 密码不出现在代码仓库，git pull 后无需重新修改配置文件
Environment=SPRING_DATASOURCE_USERNAME=myblog_user
Environment=SPRING_DATASOURCE_PASSWORD=<myblog_user密码>
ExecStart=/usr/bin/java -jar /opt/ClaudeTest/myblog/target/myblog-1.0.0.jar
Restart=on-failure
RestartSec=10
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
```

```bash
systemctl daemon-reload
systemctl enable myblog   # 开机自启
systemctl start myblog
```

---

## 七、配置 Nginx 反向代理

文件：`/etc/nginx/conf.d/claudetest.conf`

```nginx
server {
    listen 80;
    server_name _;

    # myblog Spring Boot 反向代理
    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # 三个静态前端项目
    location /claude-learn/ {
        alias /opt/ClaudeTest/claude-learn/;
        index index.html;
    }
    location /ecc-explorer/ {
        alias /opt/ClaudeTest/ecc-explorer/;
        index index.html;
    }
    location /superpowers-explorer/ {
        alias /opt/ClaudeTest/superpowers-explorer/;
        index index.html;
    }
}
```

**排查过程**：nginx.conf 内置默认 server 块同样监听 80 端口且 `server_name _`，与 claudetest.conf 冲突，导致静态项目 404（请求落到默认块的 `/usr/share/nginx/html`）。通过将默认 server 块的监听端口改为 8081 解决。

---

## 八、访问地址

| 项目 | URL | 说明 |
|------|-----|------|
| myblog 博客首页 | http://8.141.113.131/ | Spring Boot，Nginx 反向代理 8080 |
| myblog 管理后台 | http://8.141.113.131/admin | 默认账号 `admin / changeme123`，**请立即修改** |
| claude-learn | http://8.141.113.131/claude-learn/ | 纯静态，Nginx 直接伺服 |
| ecc-explorer | http://8.141.113.131/ecc-explorer/ | 纯静态，Nginx 直接伺服 |
| superpowers-explorer | http://8.141.113.131/superpowers-explorer/ | 纯静态，Nginx 直接伺服 |

---

## 常用运维命令

```bash
# 查看 myblog 实时日志
journalctl -u myblog -f

# 重启 myblog（代码更新后）
cd /opt/ClaudeTest && git pull
cd myblog && mvn clean package -DskipTests
systemctl restart myblog

# 查看服务状态
systemctl status myblog
systemctl status nginx
systemctl status mysqld
```
