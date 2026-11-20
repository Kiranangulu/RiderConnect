package com.riderconnect.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.riderconnect.dto.RegistrationRequest;
import com.riderconnect.entity.User;
import com.riderconnect.service.RegistrationService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/auth")
public class RegistrationController {

    private final RegistrationService registrationService;

    public RegistrationController(
            RegistrationService registrationService) {
        this.registrationService = registrationService;
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(
            @Valid @RequestBody RegistrationRequest request) {

        try {
            User user = registrationService.registerUser(request);

            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body("Registration successful for: " + user.getEmail());

        } catch (IllegalArgumentException exception) {

            return ResponseEntity
                    .status(HttpStatus.CONFLICT)
                    .body(exception.getMessage());
        }
    }
}