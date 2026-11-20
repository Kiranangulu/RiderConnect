
package com.riderconnect.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.riderconnect.entity.User;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    // Find a user using their email
    Optional<User> findByEmail(String email);

    // Check whether an email already exists
    boolean existsByEmail(String email);

    // Find a user using their phone number
    Optional<User> findByPhone(String phone);

}
