package com.myblog.dto;

import com.myblog.entity.Post;
import com.myblog.entity.Tag;
import jakarta.validation.constraints.NotBlank;

import java.util.stream.Collectors;

/** 文章新建/编辑表单 DTO */
public class PostForm {

    private Long id;

    @NotBlank(message = "标题不能为空")
    private String title;

    private String excerpt;

    @NotBlank(message = "内容不能为空")
    private String content;

    private String emoji = "📝";

    /** "DRAFT" 或 "PUBLISHED" */
    private String status = "DRAFT";

    private Long categoryId;

    /** 标签名称，逗号分隔，如 "Java,Spring,后端" */
    private String tagNames;

    // ---------- 静态工厂：从 Post 实体回填表单 ----------

    public static PostForm fromPost(Post post) {
        PostForm form = new PostForm();
        form.id = post.getId();
        form.title = post.getTitle();
        form.excerpt = post.getExcerpt();
        form.content = post.getContent();
        form.emoji = post.getEmoji();
        form.status = post.getStatus().name();
        form.categoryId = post.getCategory() != null ? post.getCategory().getId() : null;
        form.tagNames = post.getTags().stream()
                .map(Tag::getName)
                .sorted()
                .collect(Collectors.joining(","));
        return form;
    }

    // ---------- Getter / Setter ----------

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getExcerpt() { return excerpt; }
    public void setExcerpt(String excerpt) { this.excerpt = excerpt; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public String getEmoji() { return emoji; }
    public void setEmoji(String emoji) { this.emoji = emoji; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Long getCategoryId() { return categoryId; }
    public void setCategoryId(Long categoryId) { this.categoryId = categoryId; }

    public String getTagNames() { return tagNames; }
    public void setTagNames(String tagNames) { this.tagNames = tagNames; }
}
