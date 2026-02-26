package com.myblog.controller;

import com.myblog.entity.Post;
import com.myblog.entity.Tag;
import com.myblog.service.CategoryService;
import com.myblog.service.PostService;
import com.myblog.service.TagService;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;
import java.util.Optional;

/** 公开博客端控制器，处理首页、文章详情、关于页 */
@Controller
public class BlogController {

    private static final int PAGE_SIZE = 6;

    private final PostService postService;
    private final TagService tagService;
    private final CategoryService categoryService;

    public BlogController(PostService postService, TagService tagService, CategoryService categoryService) {
        this.postService = postService;
        this.tagService = tagService;
        this.categoryService = categoryService;
    }

    /** GET / — 首页：文章列表 + 标签筛选 + 搜索 + 分页 */
    @GetMapping("/")
    public String index(
            @RequestParam(defaultValue = "") String tag,
            @RequestParam(defaultValue = "") String search,
            @RequestParam(defaultValue = "0") int page,
            Model model) {

        Page<Post> posts;
        if (!search.isBlank()) {
            posts = postService.searchPublished(search, page, PAGE_SIZE);
        } else if (!tag.isBlank()) {
            posts = postService.findPublishedByTag(tag, page, PAGE_SIZE);
        } else {
            posts = postService.findPublished(page, PAGE_SIZE);
        }

        List<Tag> tags = tagService.findTagsForPublishedPosts();
        List<Post> recentPosts = postService.findRecentPublished(5);

        model.addAttribute("posts", posts);
        model.addAttribute("tags", tags);
        model.addAttribute("currentTag", tag);
        model.addAttribute("search", search);
        model.addAttribute("recentPosts", recentPosts);
        model.addAttribute("totalPosts", postService.countPublished());
        model.addAttribute("totalTags", tagService.count());
        model.addAttribute("activePage", "home");

        return "index";
    }

    /** GET /post/{id} — 文章详情页 */
    @GetMapping("/post/{id}")
    public String post(@PathVariable Long id, Model model) {
        Optional<Post> postOpt = postService.findPublishedById(id);
        if (postOpt.isEmpty()) {
            return "error/404";
        }

        Post post = postOpt.get();
        List<Post> related = postService.findRelated(id, 4);

        model.addAttribute("post", post);
        model.addAttribute("relatedPosts", related);
        model.addAttribute("activePage", "home");

        return "post";
    }

    /** GET /about — 关于页 */
    @GetMapping("/about")
    public String about(Model model) {
        model.addAttribute("activePage", "about");
        return "about";
    }
}
