-- =========================================
-- MyBlog 数据库建表脚本
-- 字符集：utf8mb4，适配 Emoji 存储
-- 开发环境由 Hibernate ddl-auto=update 自动建表，
-- 生产环境手动执行此脚本。
-- =========================================

CREATE DATABASE IF NOT EXISTS myblog
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE myblog;

-- 分类表
CREATE TABLE IF NOT EXISTS category (
    id          BIGINT       NOT NULL AUTO_INCREMENT,
    name        VARCHAR(64)  NOT NULL,
    slug        VARCHAR(64)  NOT NULL,
    description VARCHAR(255) DEFAULT NULL,
    created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_category_slug (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 标签表
CREATE TABLE IF NOT EXISTS tag (
    id         BIGINT      NOT NULL AUTO_INCREMENT,
    name       VARCHAR(64) NOT NULL,
    slug       VARCHAR(64) NOT NULL,
    created_at DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_tag_name (name),
    UNIQUE KEY uk_tag_slug (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 文章表（content 字段存储 Markdown 原文）
CREATE TABLE IF NOT EXISTS post (
    id           BIGINT                     NOT NULL AUTO_INCREMENT,
    title        VARCHAR(255)               NOT NULL,
    excerpt      TEXT                       DEFAULT NULL,
    content      LONGTEXT                   NOT NULL,
    emoji        VARCHAR(16)                DEFAULT '📝',
    status       ENUM('DRAFT','PUBLISHED')  NOT NULL DEFAULT 'DRAFT',
    category_id  BIGINT                     DEFAULT NULL,
    read_time    INT                        NOT NULL DEFAULT 0,
    published_at DATETIME                   DEFAULT NULL,
    created_at   DATETIME                   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at   DATETIME                   NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_post_category FOREIGN KEY (category_id) REFERENCES category(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 文章-标签中间表
CREATE TABLE IF NOT EXISTS post_tag (
    post_id BIGINT NOT NULL,
    tag_id  BIGINT NOT NULL,
    PRIMARY KEY (post_id, tag_id),
    CONSTRAINT fk_pt_post FOREIGN KEY (post_id) REFERENCES post(id) ON DELETE CASCADE,
    CONSTRAINT fk_pt_tag  FOREIGN KEY (tag_id)  REFERENCES tag(id)  ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 管理员表
CREATE TABLE IF NOT EXISTS admin_user (
    id           BIGINT       NOT NULL AUTO_INCREMENT,
    username     VARCHAR(64)  NOT NULL,
    password     VARCHAR(255) NOT NULL,
    display_name VARCHAR(64)  DEFAULT NULL,
    created_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_admin_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
