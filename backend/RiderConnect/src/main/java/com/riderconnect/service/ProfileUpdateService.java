
package com.riderconnect.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.riderconnect.dto.ProfileUpdateRequest;
import com.riderconnect.entity.User;
import com.riderconnect.repository.UserRepository;

@Service
public class ProfileUpdateService {

    private final UserRepository userRepository;

    public ProfileUpdateService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Transactional
    public User updateProfile(Long userId, ProfileUpdateRequest request) {

        // Find the existing logged-in user
        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                    new IllegalArgumentException("User not found")
                );

        // Update full name
        user.setFullName(request.getFullName().trim());

        // Normalize phone number
        String phone = request.getPhone();

        if (phone != null) {
            phone = phone.trim();

            if (phone.isEmpty()) {
                phone = null;
            }
        }

        // Check whether another user already uses this phone number
        if (phone != null) {
            User existingUser = userRepository.findByPhone(phone)
                    .orElse(null);

            if (existingUser != null &&
                    !existingUser.getId().equals(userId)) {
                throw new IllegalArgumentException(
                    "This phone number is already registered"
                );
            }
        }

        user.setPhone(phone);

        // Update delivery platform
        if (request.getPlatform() != null) {
            user.setPlatform(request.getPlatform());
        }

        // Update city
        if (request.getCity() != null) {
            user.setCity(request.getCity());
        }

        // Update vehicle
        if (request.getVehicle() != null) {
            user.setVehicle(request.getVehicle());
        }

        // Save updated profile
        return userRepository.save(user);
    }
}
