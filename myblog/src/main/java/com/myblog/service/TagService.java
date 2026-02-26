package com.myblog.service;

import com.myblog.entity.Tag;
import com.myblog.repository.TagRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

/** 标签业务服务 */
@Service
@Transactional
public class TagService {

    private final TagRepository tagRepository;

    public TagService(TagRepository tagRepository) {
        this.tagRepository = tagRepository;
    }

    @Transactional(readOnly = true)
    public List<Tag> findAll() {
        return tagRepository.findAllOrderByPostCount();
    }

    @Transactional(readOnly = true)
    public List<Tag> findTagsForPublishedPosts() {
        return tagRepository.findTagsForPublishedPosts();
    }

    @Transactional(readOnly = true)
    public Optional<Tag> findById(Long id) {
        return tagRepository.findById(id);
    }

    public Tag save(Tag tag) {
        // 自动生成 slug
        if (tag.getSlug() == null || tag.getSlug().isBlank()) {
            String s = tag.getName().toLowerCase()
                    .replaceAll("\\s+", "-")
                    .replaceAll("[^\\w\\u4e00-\\u9fa5-]", "");
            tag.setSlug(s.isEmpty() ? tag.getName() : s);
        }
        return tagRepository.save(tag);
    }

    public void delete(Long id) {
        tagRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public long count() {
        return tagRepository.count();
    }

    /** 返回每个标签对应的文章数 Map（tagId → count），供模板展示使用 */
    @Transactional(readOnly = true)
    public Map<Long, Long> getTagPostCounts() {
        return tagRepository.findTagPostCounts().stream()
                .collect(Collectors.toMap(
                        row -> (Long) row[0],
                        row -> (Long) row[1]
                ));
    }
}
