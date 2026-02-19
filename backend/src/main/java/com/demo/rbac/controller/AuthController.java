package com.demo.rbac.controller;

import com.demo.rbac.dto.LoginRequest;
import com.demo.rbac.dto.RegisterRequest;
import com.demo.rbac.dto.UserResponse;
import com.demo.rbac.model.Role;
import com.demo.rbac.model.User;
import com.demo.rbac.repository.RoleRepository;
import com.demo.rbac.repository.UserRepository;
import com.demo.rbac.service.LoginAttemptService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Slf4j
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final LoginAttemptService loginAttemptService;

    // ── Login ────────────────────────────────────────────────────────────────

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request,
            HttpServletRequest httpRequest) {

        String ip = extractClientIp(httpRequest);

        // ── Rate-limit check ──────────────────────────────────────────────────
        if (loginAttemptService.isBlocked(ip)) {
            long retryAfter = loginAttemptService.getBlockRemainingSeconds(ip);
            log.warn("[RateLimit] Blocked login attempt from IP: {} (retry after {}s)", ip, retryAfter);
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                    .header(HttpHeaders.RETRY_AFTER, String.valueOf(retryAfter))
                    .body(Map.of(
                            "error", "Too many failed login attempts",
                            "message", "Your IP has been temporarily blocked. Please try again later.",
                            "retryAfter", retryAfter + " seconds"));
        }

        // ── Authenticate ──────────────────────────────────────────────────────
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword()));

            // Success — reset counter and store session
            loginAttemptService.loginSucceeded(ip);
            SecurityContextHolder.getContext().setAuthentication(authentication);
            HttpSession session = httpRequest.getSession(true);
            session.setAttribute(
                    HttpSessionSecurityContextRepository.SPRING_SECURITY_CONTEXT_KEY,
                    SecurityContextHolder.getContext());

            User user = userRepository.findByUsername(request.getUsername()).orElseThrow();
            log.info("User '{}' logged in from IP: {}", user.getUsername(), ip);
            return ResponseEntity.ok(toUserResponse(user));

        } catch (BadCredentialsException e) {
            // Record the failure
            loginAttemptService.loginFailed(ip);
            int remaining = loginAttemptService.getAttemptsRemaining(ip);

            String message = remaining > 0
                    ? "Invalid credentials. " + remaining + " attempt(s) remaining before lockout."
                    : "Invalid credentials. Your IP is now blocked for 15 minutes.";

            log.warn("Failed login for user '{}' from IP: {} ({} attempts remaining)",
                    request.getUsername(), ip, remaining);

            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Invalid credentials", "message", message));
        }
    }

    // ── Logout ───────────────────────────────────────────────────────────────

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session != null)
            session.invalidate();
        SecurityContextHolder.clearContext();
        return ResponseEntity.ok(Map.of("message", "Logged out successfully"));
    }

    // ── Me ───────────────────────────────────────────────────────────────────

    @GetMapping("/me")
    public ResponseEntity<?> me(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).body(Map.of("error", "Not authenticated"));
        }
        return userRepository.findByUsername(authentication.getName())
                .map(user -> ResponseEntity.ok(toUserResponse(user)))
                .orElse(ResponseEntity.status(404).build());
    }

    // ── Register ─────────────────────────────────────────────────────────────

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request,
            HttpServletRequest httpRequest) {

        String ip = extractClientIp(httpRequest);

        // Reuse same rate-limiter bucket to prevent registration spam
        if (loginAttemptService.isBlocked(ip)) {
            long retryAfter = loginAttemptService.getBlockRemainingSeconds(ip);
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                    .header(HttpHeaders.RETRY_AFTER, String.valueOf(retryAfter))
                    .body(Map.of("error", "Too many requests", "retryAfter", retryAfter + " seconds"));
        }

        if (userRepository.existsByUsername(request.getUsername())) {
            return ResponseEntity.badRequest().body(Map.of("error", "Username already taken"));
        }
        if (request.getEmail() != null && !request.getEmail().isBlank()
                && userRepository.existsByEmail(request.getEmail())) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email already in use"));
        }

        Role userRole = roleRepository.findByName("ROLE_USER")
                .orElseThrow(() -> new RuntimeException("ROLE_USER not found"));

        User user = new User();
        user.setUsername(request.getUsername());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setEmail(request.getEmail());
        user.setRoles(Set.of(userRole));
        userRepository.save(user);

        log.info("New user registered: '{}' from IP: {}", user.getUsername(), ip);
        return ResponseEntity.ok(Map.of(
                "message", "User registered successfully",
                "username", user.getUsername()));
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    /**
     * Resolves the real client IP, honouring the X-Forwarded-For header
     * set by reverse proxies (nginx, AWS ALB, Cloudflare, etc.).
     */
    private String extractClientIp(HttpServletRequest request) {
        String xff = request.getHeader("X-Forwarded-For");
        if (xff != null && !xff.isBlank()) {
            // Header may be a comma-separated list; take the first (originating) IP
            return xff.split(",")[0].strip();
        }
        String xri = request.getHeader("X-Real-IP");
        if (xri != null && !xri.isBlank())
            return xri.strip();
        return request.getRemoteAddr();
    }

    private UserResponse toUserResponse(User user) {
        Set<String> roles = user.getRoles().stream()
                .map(Role::getName)
                .collect(Collectors.toSet());
        return new UserResponse(user.getId(), user.getUsername(), user.getEmail(), roles);
    }
}
