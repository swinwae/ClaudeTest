package com.myblog.service;

import com.myblog.dto.PostForm;
import com.myblog.entity.Post;
import org.springframework.data.domain.Page;

import java.util.List;
import java.util.Optional;

/** 文章业务接口 */
public interface PostService {

    // ---------- 公开博客端 ----------

    /** 分页查询已发布文章 */
    Page<Post> findPublished(int page, int size);

    /** 按标签筛选已发布文章 */
    Page<Post> findPublishedByTag(String tagName, int page, int size);

    /** 全文搜索已发布文章 */
    Page<Post> searchPublished(String query, int page, int size);

    /** 查询单篇已发布文章 */
    Optional<Post> findPublishedById(Long id);

    /** 查询相关文章 */
    List<Post> findRelated(Long postId, int limit);

    /** 最近发布的 N 篇文章（侧边栏用） */
    List<Post> findRecentPublished(int limit);

    // ---------- 管理后台 ----------

    /** 分页查询所有文章（可按状态 + 关键词过滤） */
    Page<Post> findAll(String status, String search, int page, int size);

    /** 按 ID 查询（不限状态） */
    Optional<Post> findById(Long id);

    /** 新建或更新文章 */
    Post save(PostForm form);

    /** 切换文章发布/草稿状态 */
    void toggleStatus(Long id);

    /** 删除文章 */
    void delete(Long id);

    /** 统计全部文章数 */
    long countAll();

    /** 统计已发布文章数 */
    long countPublished();

    /** 统计草稿文章数 */
    long countDraft();
}
