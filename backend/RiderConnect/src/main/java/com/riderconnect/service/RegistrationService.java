
package com.riderconnect.service;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.riderconnect.dto.RegistrationRequest;
import com.riderconnect.entity.User;
import com.riderconnect.repository.UserRepository;

@Service
public class RegistrationService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public RegistrationService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public User registerUser(RegistrationRequest request) {

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException(
                "Email is already registered"
            );
        }

        User user = new User();

        user.setFullName(request.getFullName());
        user.setEmail(request.getEmail());
        user.setPhone(request.getPhone());

        // Encrypt password before saving
        user.setPassword(
            passwordEncoder.encode(request.getPassword())
        );

        user.setRole("RIDER");

        return userRepository.save(user);
    }
}
