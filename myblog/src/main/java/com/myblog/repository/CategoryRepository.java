package com.myblog.repository;

import com.myblog.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface CategoryRepository extends JpaRepository<Category, Long> {

    Optional<Category> findBySlug(String slug);

    Optional<Category> findByName(String name);

    /** 查询每个分类的文章数，返回 [categoryId, count] 二元组列表，避免懒加载 */
    @Query("SELECT c.id, COUNT(p) FROM Category c LEFT JOIN Post p ON p.category = c GROUP BY c.id")
    List<Object[]> findCategoryPostCounts();
}
