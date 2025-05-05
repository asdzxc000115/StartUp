package com.example.StartUp.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class HomeController {
    @GetMapping("/")
    public String home() {
        return "index";
    }
    @GetMapping("/login")
    public String login() {
        return "login"; // templates/login.html을 렌더링
    }

    @GetMapping("/favorites")
    public String favorites() {
        return "favorites"; // templates/favorites.html을 렌더링
    }

    @GetMapping("/reviews")
    public String reviews() {
        return "reviews"; // templates/reviews.html을 렌더링
    }
}