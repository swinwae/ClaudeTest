package com.myblog.repository;

import com.myblog.entity.Post;
import com.myblog.entity.Post.PostStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface PostRepository extends JpaRepository<Post, Long> {

    /** 查询已发布文章，按发布时间倒序分页 */
    Page<Post> findByStatusOrderByPublishedAtDesc(PostStatus status, Pageable pageable);

    /** 按标签名查询已发布文章 */
    @Query("SELECT DISTINCT p FROM Post p JOIN p.tags t " +
           "WHERE p.status = 'PUBLISHED' AND t.name = :tagName " +
           "ORDER BY p.publishedAt DESC")
    Page<Post> findPublishedByTagName(@Param("tagName") String tagName, Pageable pageable);

    /** 搜索已发布文章（标题 / 摘要 / 标签名） */
    @Query("SELECT DISTINCT p FROM Post p LEFT JOIN p.tags t " +
           "WHERE p.status = 'PUBLISHED' AND (" +
           "  LOWER(p.title)   LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "  LOWER(p.excerpt) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "  LOWER(t.name)    LIKE LOWER(CONCAT('%', :query, '%'))" +
           ") ORDER BY p.publishedAt DESC")
    Page<Post> searchPublished(@Param("query") String query, Pageable pageable);

    /** 查询相关文章（共享标签的其他已发布文章） */
    @Query("SELECT DISTINCT p FROM Post p JOIN p.tags t " +
           "WHERE p.status = 'PUBLISHED' AND p.id <> :postId AND t.id IN :tagIds " +
           "ORDER BY p.publishedAt DESC")
    List<Post> findRelated(@Param("postId") Long postId,
                           @Param("tagIds") List<Long> tagIds,
                           Pageable pageable);

    /** 最近发布的 N 篇文章 */
    List<Post> findTop5ByStatusOrderByPublishedAtDesc(PostStatus status);

    /** 按状态统计文章数 */
    long countByStatus(PostStatus status);

    /** 管理后台：按标题搜索（不限状态） */
    Page<Post> findByTitleContainingIgnoreCaseOrderByCreatedAtDesc(String title, Pageable pageable);

    /** 管理后台：按状态筛选 */
    Page<Post> findByStatusOrderByCreatedAtDesc(PostStatus status, Pageable pageable);

    /** 管理后台：按状态 + 标题搜索 */
    Page<Post> findByStatusAndTitleContainingIgnoreCaseOrderByCreatedAtDesc(
            PostStatus status, String title, Pageable pageable);

    /** 根据 ID 查询已发布文章 */
    Optional<Post> findByIdAndStatus(Long id, PostStatus status);
}
