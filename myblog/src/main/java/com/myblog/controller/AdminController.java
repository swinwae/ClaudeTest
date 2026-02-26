package com.myblog.controller;

import com.myblog.dto.PostForm;
import com.myblog.entity.Category;
import com.myblog.entity.Post;
import com.myblog.entity.Tag;
import com.myblog.service.CategoryService;
import com.myblog.service.PostService;
import com.myblog.service.TagService;
import jakarta.validation.Valid;
import org.springframework.beans.propertyeditors.CustomNumberEditor;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.WebDataBinder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import java.util.List;
import java.util.Optional;

/** 管理后台控制器，处理文章/标签/分类的 CRUD 操作 */
@Controller
@RequestMapping("/admin")
public class AdminController {

    private static final int ADMIN_PAGE_SIZE = 10;

    private final PostService postService;
    private final TagService tagService;
    private final CategoryService categoryService;

    public AdminController(PostService postService, TagService tagService, CategoryService categoryService) {
        this.postService = postService;
        this.tagService = tagService;
        this.categoryService = categoryService;
    }

    /** 允许 Long 类型字段接受空字符串（转为 null），如"无分类"选项 */
    @InitBinder
    public void initBinder(WebDataBinder binder) {
        binder.registerCustomEditor(Long.class, new CustomNumberEditor(Long.class, true));
    }

    // ============================================================
    // 仪表盘
    // ============================================================

    @GetMapping("/dashboard")
    public String dashboard(Model model) {
        model.addAttribute("totalPosts", postService.countAll());
        model.addAttribute("publishedPosts", postService.countPublished());
        model.addAttribute("draftPosts", postService.countDraft());
        model.addAttribute("totalTags", tagService.count());
        model.addAttribute("totalCategories", categoryService.count());
        model.addAttribute("recentPosts", postService.findRecentPublished(5));
        model.addAttribute("adminSection", "dashboard");
        return "admin/dashboard";
    }

    // ============================================================
    // 文章管理
    // ============================================================

    @GetMapping("/posts")
    public String postList(
            @RequestParam(defaultValue = "") String status,
            @RequestParam(defaultValue = "") String search,
            @RequestParam(defaultValue = "0") int page,
            Model model) {
        Page<Post> posts = postService.findAll(status, search, page, ADMIN_PAGE_SIZE);
        model.addAttribute("posts", posts);
        model.addAttribute("currentStatus", status);
        model.addAttribute("search", search);
        model.addAttribute("adminSection", "posts");
        return "admin/posts/list";
    }

    @GetMapping("/posts/new")
    public String newPostForm(Model model) {
        model.addAttribute("form", new PostForm());
        model.addAttribute("categories", categoryService.findAll());
        model.addAttribute("adminSection", "posts");
        return "admin/posts/form";
    }

    @PostMapping("/posts")
    public String createPost(@Valid @ModelAttribute("form") PostForm form,
                             BindingResult result,
                             Model model,
                             RedirectAttributes ra) {
        if (result.hasErrors()) {
            model.addAttribute("categories", categoryService.findAll());
            model.addAttribute("adminSection", "posts");
            return "admin/posts/form";
        }
        Post saved = postService.save(form);
        ra.addFlashAttribute("successMsg", "文章已保存：" + saved.getTitle());
        return "redirect:/admin/posts";
    }

    @GetMapping("/posts/{id}/edit")
    public String editPostForm(@PathVariable Long id, Model model) {
        Optional<Post> postOpt = postService.findById(id);
        if (postOpt.isEmpty()) {
            return "redirect:/admin/posts";
        }
        model.addAttribute("form", PostForm.fromPost(postOpt.get()));
        model.addAttribute("categories", categoryService.findAll());
        model.addAttribute("adminSection", "posts");
        return "admin/posts/form";
    }

    @PostMapping("/posts/{id}")
    public String updatePost(@PathVariable Long id,
                             @Valid @ModelAttribute("form") PostForm form,
                             BindingResult result,
                             Model model,
                             RedirectAttributes ra) {
        form.setId(id);
        if (result.hasErrors()) {
            model.addAttribute("categories", categoryService.findAll());
            model.addAttribute("adminSection", "posts");
            return "admin/posts/form";
        }
        Post saved = postService.save(form);
        ra.addFlashAttribute("successMsg", "文章已更新：" + saved.getTitle());
        return "redirect:/admin/posts";
    }

    @PostMapping("/posts/{id}/toggle")
    public String toggleStatus(@PathVariable Long id, RedirectAttributes ra) {
        postService.toggleStatus(id);
        ra.addFlashAttribute("successMsg", "文章状态已切换");
        return "redirect:/admin/posts";
    }

    @PostMapping("/posts/{id}/delete")
    public String deletePost(@PathVariable Long id, RedirectAttributes ra) {
        postService.delete(id);
        ra.addFlashAttribute("successMsg", "文章已删除");
        return "redirect:/admin/posts";
    }

    // ============================================================
    // 标签管理
    // ============================================================

    @GetMapping("/tags")
    public String tagList(Model model) {
        List<Tag> tags = tagService.findAll();
        model.addAttribute("tags", tags);
        model.addAttribute("tagPostCounts", tagService.getTagPostCounts());
        model.addAttribute("newTag", new Tag());
        model.addAttribute("adminSection", "tags");
        return "admin/tags/list";
    }

    @PostMapping("/tags")
    public String createTag(@RequestParam String name, RedirectAttributes ra) {
        if (name != null && !name.isBlank()) {
            tagService.save(new Tag(name.trim()));
            ra.addFlashAttribute("successMsg", "标签已添加：" + name.trim());
        }
        return "redirect:/admin/tags";
    }

    @PostMapping("/tags/{id}/delete")
    public String deleteTag(@PathVariable Long id, RedirectAttributes ra) {
        tagService.delete(id);
        ra.addFlashAttribute("successMsg", "标签已删除");
        return "redirect:/admin/tags";
    }

    // ============================================================
    // 分类管理
    // ============================================================

    @GetMapping("/categories")
    public String categoryList(Model model) {
        List<Category> categories = categoryService.findAll();
        model.addAttribute("categories", categories);
        model.addAttribute("categoryPostCounts", categoryService.getCategoryPostCounts());
        model.addAttribute("adminSection", "categories");
        return "admin/categories/list";
    }

    @PostMapping("/categories")
    public String createCategory(@RequestParam String name,
                                 @RequestParam(required = false) String description,
                                 RedirectAttributes ra) {
        if (name != null && !name.isBlank()) {
            Category cat = new Category(name.trim(), "");
            cat.setDescription(description);
            categoryService.save(cat);
            ra.addFlashAttribute("successMsg", "分类已添加：" + name.trim());
        }
        return "redirect:/admin/categories";
    }

    @PostMapping("/categories/{id}/delete")
    public String deleteCategory(@PathVariable Long id, RedirectAttributes ra) {
        categoryService.delete(id);
        ra.addFlashAttribute("successMsg", "分类已删除");
        return "redirect:/admin/categories";
    }
}
