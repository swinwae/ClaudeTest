package com.myblog.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

/** 文章标签实体 */
@Entity
@Table(name = "tag")
public class Tag {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 64, unique = true)
    private String name;

    @Column(nullable = false, length = 64, unique = true)
    private String slug;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    /** 反向关联，用于统计每个标签下的文章数 */
    @ManyToMany(mappedBy = "tags")
    private Set<Post> posts = new HashSet<>();

    // ---------- 构造器 ----------

    public Tag() {}

    public Tag(String name) {
        this.name = name;
        // \w 仅匹配 ASCII，需额外保留中文（\u4e00-\u9fa5）
        String s = name.toLowerCase()
                .replaceAll("\\s+", "-")
                .replaceAll("[^\\w\\u4e00-\\u9fa5-]", "");
        // 若 slug 为空（如纯符号标签），直接用原名兜底
        this.slug = s.isEmpty() ? name : s;
    }

    // ---------- Getter / Setter ----------

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getSlug() { return slug; }
    public void setSlug(String slug) { this.slug = slug; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public Set<Post> getPosts() { return posts; }
    public void setPosts(Set<Post> posts) { this.posts = posts; }
}
