package com.myblog.service;

import com.myblog.dto.PostForm;
import com.myblog.entity.Category;
import com.myblog.entity.Post;
import com.myblog.entity.Post.PostStatus;
import com.myblog.entity.Tag;
import com.myblog.repository.CategoryRepository;
import com.myblog.repository.PostRepository;
import com.myblog.repository.TagRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@Transactional
public class PostServiceImpl implements PostService {

    private final PostRepository postRepository;
    private final TagRepository tagRepository;
    private final CategoryRepository categoryRepository;

    public PostServiceImpl(PostRepository postRepository,
                           TagRepository tagRepository,
                           CategoryRepository categoryRepository) {
        this.postRepository = postRepository;
        this.tagRepository = tagRepository;
        this.categoryRepository = categoryRepository;
    }

    // ---------- 公开博客端 ----------

    @Override
    @Transactional(readOnly = true)
    public Page<Post> findPublished(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("publishedAt").descending());
        return postRepository.findByStatusOrderByPublishedAtDesc(PostStatus.PUBLISHED, pageable);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<Post> findPublishedByTag(String tagName, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return postRepository.findPublishedByTagName(tagName, pageable);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<Post> searchPublished(String query, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return postRepository.searchPublished(query, pageable);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<Post> findPublishedById(Long id) {
        return postRepository.findByIdAndStatus(id, PostStatus.PUBLISHED);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Post> findRelated(Long postId, int limit) {
        Optional<Post> postOpt = postRepository.findById(postId);
        if (postOpt.isEmpty()) return List.of();
        Post post = postOpt.get();
        List<Long> tagIds = post.getTags().stream()
                .map(Tag::getId)
                .collect(Collectors.toList());
        if (tagIds.isEmpty()) return List.of();
        Pageable pageable = PageRequest.of(0, limit);
        return postRepository.findRelated(postId, tagIds, pageable);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Post> findRecentPublished(int limit) {
        return postRepository.findTop5ByStatusOrderByPublishedAtDesc(PostStatus.PUBLISHED);
    }

    // ---------- 管理后台 ----------

    @Override
    @Transactional(readOnly = true)
    public Page<Post> findAll(String status, String search, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        boolean hasSearch = search != null && !search.isBlank();
        if (status != null && !status.isBlank() && !"ALL".equalsIgnoreCase(status)) {
            PostStatus ps = PostStatus.valueOf(status.toUpperCase());
            if (hasSearch) {
                return postRepository.findByStatusAndTitleContainingIgnoreCaseOrderByCreatedAtDesc(ps, search, pageable);
            }
            return postRepository.findByStatusOrderByCreatedAtDesc(ps, pageable);
        }
        if (hasSearch) {
            return postRepository.findByTitleContainingIgnoreCaseOrderByCreatedAtDesc(search, pageable);
        }
        // 无筛选条件时按创建时间倒序
        Pageable sortedPageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return postRepository.findAll(sortedPageable);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<Post> findById(Long id) {
        return postRepository.findById(id);
    }

    @Override
    public Post save(PostForm form) {
        Post post = form.getId() != null
                ? postRepository.findById(form.getId()).orElse(new Post())
                : new Post();
        applyForm(post, form);
        return postRepository.save(post);
    }

    @Override
    public void toggleStatus(Long id) {
        postRepository.findById(id).ifPresent(post -> {
            if (post.getStatus() == PostStatus.DRAFT) {
                post.setStatus(PostStatus.PUBLISHED);
                if (post.getPublishedAt() == null) {
                    post.setPublishedAt(LocalDateTime.now());
                }
            } else {
                post.setStatus(PostStatus.DRAFT);
            }
            postRepository.save(post);
        });
    }

    @Override
    public void delete(Long id) {
        postRepository.deleteById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public long countAll() {
        return postRepository.count();
    }

    @Override
    @Transactional(readOnly = true)
    public long countPublished() {
        return postRepository.countByStatus(PostStatus.PUBLISHED);
    }

    @Override
    @Transactional(readOnly = true)
    public long countDraft() {
        return postRepository.countByStatus(PostStatus.DRAFT);
    }

    // ---------- 私有辅助方法 ----------

    /** 将 PostForm 数据应用到 Post 实体 */
    private void applyForm(Post post, PostForm form) {
        post.setTitle(form.getTitle());
        post.setExcerpt(form.getExcerpt());
        post.setContent(form.getContent());
        post.setEmoji(form.getEmoji() != null ? form.getEmoji() : "📝");

        // 处理发布状态
        PostStatus newStatus = "PUBLISHED".equalsIgnoreCase(form.getStatus())
                ? PostStatus.PUBLISHED : PostStatus.DRAFT;
        if (newStatus == PostStatus.PUBLISHED && post.getPublishedAt() == null) {
            post.setPublishedAt(LocalDateTime.now());
        }
        post.setStatus(newStatus);

        // 处理分类
        if (form.getCategoryId() != null) {
            categoryRepository.findById(form.getCategoryId()).ifPresent(post::setCategory);
        } else {
            post.setCategory(null);
        }

        // 处理标签（按名称查找已有标签，否则新建）
        Set<Tag> tags = new HashSet<>();
        if (form.getTagNames() != null && !form.getTagNames().isBlank()) {
            String[] names = form.getTagNames().split(",");
            for (String raw : names) {
                String name = raw.trim();
                if (!name.isEmpty()) {
                    Tag tag = tagRepository.findByName(name)
                            .orElseGet(() -> tagRepository.save(new Tag(name)));
                    tags.add(tag);
                }
            }
        }
        post.setTags(tags);

        // 自动计算阅读时长
        post.recalculateReadTime();
    }
}
