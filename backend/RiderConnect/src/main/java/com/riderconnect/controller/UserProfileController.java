
package com.riderconnect.controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.riderconnect.entity.User;

@RestController
@RequestMapping("/api/user")
public class UserProfileController {

    @GetMapping("/profile")
    public ResponseEntity<?> getProfile(Authentication authentication) {

        User user = (User) authentication.getPrincipal();

        Map<String, Object> response = new HashMap<>();

        response.put("message", "Profile fetched successfully");
        response.put("userId", user.getId());
        response.put("fullName", user.getFullName());
        response.put("email", user.getEmail());
        response.put("phone", user.getPhone());
        response.put("role", user.getRole());

        return ResponseEntity.ok(response);
    }
}
