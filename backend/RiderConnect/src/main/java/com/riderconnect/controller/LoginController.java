
package com.riderconnect.controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.riderconnect.dto.LoginRequest;
import com.riderconnect.entity.User;
import com.riderconnect.security.JwtService;
import com.riderconnect.service.LoginService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/auth")
public class LoginController {

    private final LoginService loginService;
    private final JwtService jwtService;

    public LoginController(
            LoginService loginService,
            JwtService jwtService) {
        this.loginService = loginService;
        this.jwtService = jwtService;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(
            @Valid @RequestBody LoginRequest request) {

        try {
            User user = loginService.login(request);

            String token = jwtService.generateToken(user);

            Map<String, Object> response = new HashMap<>();

            response.put("message", "Login successful");
            response.put("token", token);
            response.put("userId", user.getId());
            response.put("fullName", user.getFullName());
            response.put("email", user.getEmail());
            response.put("role", user.getRole());

            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException exception) {

            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(exception.getMessage());
        }
    }
}
