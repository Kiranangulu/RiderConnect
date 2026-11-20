
package com.riderconnect.controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import com.riderconnect.dto.ProfileUpdateRequest;
import com.riderconnect.entity.User;
import com.riderconnect.service.ProfileUpdateService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/user")
public class ProfileController {

    private final ProfileUpdateService profileUpdateService;

    public ProfileController(
            ProfileUpdateService profileUpdateService) {
        this.profileUpdateService = profileUpdateService;
    }

    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(
            @Valid @RequestBody ProfileUpdateRequest request,
            Authentication authentication) {

        try {
            User loggedInUser = (User) authentication.getPrincipal();

            User updatedUser = profileUpdateService.updateProfile(
                loggedInUser.getId(),
                request
            );

            Map<String, Object> response = new HashMap<>();

            response.put("message", "Profile updated successfully");
            response.put("userId", updatedUser.getId());
            response.put("fullName", updatedUser.getFullName());
            response.put("email", updatedUser.getEmail());
            response.put("phone", updatedUser.getPhone());
            response.put("role", updatedUser.getRole());
            response.put("platform", updatedUser.getPlatform());
            response.put("city", updatedUser.getCity());
            response.put("vehicle", updatedUser.getVehicle());

            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException exception) {
            return ResponseEntity.badRequest()
                    .body(exception.getMessage());
        }
    }
}
