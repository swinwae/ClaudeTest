package com.myblog.repository;

import com.myblog.entity.Tag;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface TagRepository extends JpaRepository<Tag, Long> {

    Optional<Tag> findByName(String name);

    Optional<Tag> findBySlug(String slug);

    /** 查询在已发布文章中出现过的标签（含文章数），按文章数降序 */
    @Query("SELECT t FROM Tag t JOIN t.posts p " +
           "WHERE p.status = 'PUBLISHED' " +
           "GROUP BY t " +
           "ORDER BY COUNT(p) DESC")
    List<Tag> findTagsForPublishedPosts();

    /** 查询所有标签（含文章总数），管理后台使用 */
    @Query("SELECT t FROM Tag t LEFT JOIN t.posts p GROUP BY t ORDER BY COUNT(p) DESC")
    List<Tag> findAllOrderByPostCount();

    /** 查询每个标签的文章数，返回 [tagId, count] 二元组列表，避免懒加载 */
    @Query("SELECT t.id, COUNT(p) FROM Tag t LEFT JOIN t.posts p GROUP BY t.id")
    List<Object[]> findTagPostCounts();
}
