package com.myblog.controller;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

/** 认证控制器，处理管理后台登录页 */
@Controller
@RequestMapping("/admin")
public class AuthController {

    /** GET /admin/login — 登录页面 */
    @GetMapping("/login")
    public String loginPage(@RequestParam(value = "error", required = false) String error,
                            Model model) {
        if (error != null) {
            model.addAttribute("errorMsg", "用户名或密码错误，请重试。");
        }
        return "admin/login";
    }
}
