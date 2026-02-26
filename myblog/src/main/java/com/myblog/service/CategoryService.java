package com.myblog.service;

import com.myblog.entity.Category;
import com.myblog.repository.CategoryRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

/** 分类业务服务 */
@Service
@Transactional
public class CategoryService {

    private final CategoryRepository categoryRepository;

    public CategoryService(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    @Transactional(readOnly = true)
    public List<Category> findAll() {
        return categoryRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Optional<Category> findById(Long id) {
        return categoryRepository.findById(id);
    }

    public Category save(Category category) {
        // 自动生成 slug
        if (category.getSlug() == null || category.getSlug().isBlank()) {
            category.setSlug(category.getName().toLowerCase()
                    .replaceAll("\\s+", "-")
                    .replaceAll("[^\\w\\u4e00-\\u9fa5-]", ""));
        }
        return categoryRepository.save(category);
    }

    public void delete(Long id) {
        categoryRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public long count() {
        return categoryRepository.count();
    }

    /** 返回每个分类对应的文章数 Map（categoryId → count），供模板展示使用 */
    @Transactional(readOnly = true)
    public Map<Long, Long> getCategoryPostCounts() {
        return categoryRepository.findCategoryPostCounts().stream()
                .collect(Collectors.toMap(
                        row -> (Long) row[0],
                        row -> (Long) row[1]
                ));
    }
}
