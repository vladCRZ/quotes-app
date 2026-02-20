package com.demo.rbac.controller;

import com.demo.rbac.dto.ChangePasswordRequest;
import com.demo.rbac.dto.UpdateProfileRequest;
import com.demo.rbac.model.User;
import com.demo.rbac.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(@Valid @RequestBody UpdateProfileRequest request,
            Authentication authentication) {
        try {
            User updatedUser = userService.updateProfile(authentication.getName(), request);
            return ResponseEntity
                    .ok(Map.of("message", "Profile updated successfully", "email", updatedUser.getEmail()));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/password")
    public ResponseEntity<?> changePassword(@Valid @RequestBody ChangePasswordRequest request,
            Authentication authentication) {
        try {
            userService.changePassword(authentication.getName(), request);
            return ResponseEntity.ok(Map.of("message", "Password changed successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
