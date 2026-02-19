package com.demo.rbac.controller;

import com.demo.rbac.model.User;
import com.demo.rbac.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
public class DemoController {

    private final UserRepository userRepository;

    // ─── Public ────────────────────────────────────────────────────────────────

    @GetMapping("/api/public")
    public ResponseEntity<?> publicEndpoint() {
        return ResponseEntity.ok(Map.of(
                "message", "This is a PUBLIC endpoint — no authentication required.",
                "endpoint", "/api/public"));
    }

    // ─── User ──────────────────────────────────────────────────────────────────

    @GetMapping("/api/user/dashboard")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'USER')")
    public ResponseEntity<?> userDashboard(Authentication auth) {
        return ResponseEntity.ok(Map.of(
                "message", "Welcome to the User Dashboard, " + auth.getName() + "!",
                "endpoint", "/api/user/dashboard",
                "roles", auth.getAuthorities().toString()));
    }

    // ─── Manager ───────────────────────────────────────────────────────────────

    @GetMapping("/api/manager/dashboard")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<?> managerDashboard(Authentication auth) {
        return ResponseEntity.ok(Map.of(
                "message", "Welcome to the Manager Dashboard, " + auth.getName() + "!",
                "endpoint", "/api/manager/dashboard",
                "tip", "You can view team reports here."));
    }

    // ─── Admin ─────────────────────────────────────────────────────────────────

    @GetMapping("/api/admin/dashboard")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> adminDashboard(Authentication auth) {
        return ResponseEntity.ok(Map.of(
                "message", "Welcome to the Admin Dashboard, " + auth.getName() + "!",
                "endpoint", "/api/admin/dashboard"));
    }

    @GetMapping("/api/admin/users")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> listUsers() {
        List<Map<String, Object>> users = userRepository.findAll().stream()
                .map(u -> Map.<String, Object>of(
                        "id", u.getId(),
                        "username", u.getUsername(),
                        "email", u.getEmail() != null ? u.getEmail() : "",
                        "roles", u.getRoles().stream().map(r -> r.getName()).toList()))
                .toList();
        return ResponseEntity.ok(users);
    }
}
