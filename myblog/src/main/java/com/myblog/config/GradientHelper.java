package com.myblog.config;

import org.springframework.stereotype.Component;

import java.util.List;

/**
 * 渐变色辅助 Bean，与前端 JS 的 getGradient(id) 函数逻辑完全一致。
 * 在 Thymeleaf 模板中通过 ${@gradientHelper.get(post.id)} 调用。
 */
@Component("gradientHelper")
public class GradientHelper {

    private static final List<String> GRADIENTS = List.of(
        "#6366f1, #8b5cf6",
        "#06b6d4, #3b82f6",
        "#10b981, #6366f1",
        "#f59e0b, #ef4444",
        "#ec4899, #8b5cf6",
        "#14b8a6, #06b6d4",
        "#f97316, #eab308",
        "#6366f1, #06b6d4"
    );

    /**
     * 根据文章 ID 返回 CSS 渐变色字符串。
     *
     * @param id 文章 ID（Long）
     * @return 如 "#6366f1, #8b5cf6"
     */
    public String get(Long id) {
        if (id == null) return GRADIENTS.get(0);
        return GRADIENTS.get((int) ((id - 1) % GRADIENTS.size()));
    }
}
