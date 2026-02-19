package com.demo.rbac.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.ProviderManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.www.BasicAuthenticationFilter;
import org.springframework.security.config.annotation.web.configurers.HeadersConfigurer;
import org.springframework.security.web.csrf.*;
import org.springframework.util.StringUtils;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.function.Supplier;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final UserDetailsService userDetailsService;

    // ── Password encoder ──────────────────────────────────────────────────────

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // ── Authentication manager ────────────────────────────────────────────────

    @Bean
    public AuthenticationManager authenticationManager() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder());
        return new ProviderManager(provider);
    }

    // ── Security filter chain ─────────────────────────────────────────────────

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

        http
                // ── CORS ──────────────────────────────────────────────────────────
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))

                // ── CSRF — CookieCsrfTokenRepository (SPA double-submit pattern) ─
                // The XSRF-TOKEN cookie is readable by JS (not HttpOnly).
                // The frontend reads it and echoes it back as X-XSRF-TOKEN header.
                // Spring Security validates header == cookie, blocking cross-origin forgers
                // (they can't read the cookie due to same-origin policy).
                .csrf(csrf -> csrf
                        .csrfTokenRepository(CookieCsrfTokenRepository.withHttpOnlyFalse())
                        .csrfTokenRequestHandler(new SpaCsrfTokenRequestHandler())
                        .ignoringRequestMatchers("/h2-console/**") // dev-only, not in production
                )

                // Ensure the CSRF token is materialised (loaded from store) on every request
                // so that the XSRF-TOKEN cookie is always up to date in the browser.
                .addFilterAfter(new CsrfCookieFilter(), BasicAuthenticationFilter.class)

                // ── H2 console (dev only) ──────────────────────────────────────────
                .headers(headers -> headers
                        .frameOptions(HeadersConfigurer.FrameOptionsConfig::sameOrigin))

                // ── Session management ─────────────────────────────────────────────
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED))

                // ── Endpoint authorisation ─────────────────────────────────────────
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers("/api/public").permitAll()
                        .requestMatchers("/h2-console/**").permitAll()
                        .requestMatchers("/api/admin/**").hasRole("ADMIN")
                        .requestMatchers("/api/manager/**").hasAnyRole("ADMIN", "MANAGER")
                        .requestMatchers("/api/user/**").hasAnyRole("ADMIN", "MANAGER", "USER")
                        .requestMatchers("/api/quotes/**").authenticated()
                        .anyRequest().authenticated())

                // ── Custom 401 / 403 JSON responses ───────────────────────────────
                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint((req, res, e) -> {
                            res.setStatus(HttpStatus.UNAUTHORIZED.value());
                            res.setContentType(MediaType.APPLICATION_JSON_VALUE);
                            res.getWriter().write(new ObjectMapper().writeValueAsString(
                                    Map.of("error", "Unauthorized", "message", "Please log in first")));
                        })
                        .accessDeniedHandler((req, res, e) -> {
                            res.setStatus(HttpStatus.FORBIDDEN.value());
                            res.setContentType(MediaType.APPLICATION_JSON_VALUE);
                            res.getWriter().write(new ObjectMapper().writeValueAsString(
                                    Map.of("error", "Forbidden", "message", "Insufficient privileges")));
                        }));

        return http.build();
    }

    // ── CORS ──────────────────────────────────────────────────────────────────

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of("http://localhost:5173", "http://localhost:3000"));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setExposedHeaders(List.of("X-XSRF-TOKEN"));
        config.setAllowCredentials(true);
        config.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    // ── SPA CSRF token request handler ────────────────────────────────────────
    //
    // Spring Security 6 uses XorCsrfTokenRequestAttributeHandler by default,
    // which XOR-encodes the token to prevent BREACH attacks when tokens appear
    // in response bodies. For the header-based double-submit pattern used by SPAs
    // the raw cookie value is what the browser sends back, so we delegate
    // resolution
    // to the plain CsrfTokenRequestAttributeHandler when an X-XSRF-TOKEN header is
    // present, and to the XOR handler when a form field is used.

    static final class SpaCsrfTokenRequestHandler extends CsrfTokenRequestAttributeHandler {

        private final CsrfTokenRequestHandler delegate = new XorCsrfTokenRequestAttributeHandler();

        @Override
        public void handle(HttpServletRequest request, HttpServletResponse response,
                Supplier<CsrfToken> deferredCsrfToken) {
            // Always apply the XOR delegate so that the cookie is encoded for BREACH
            // protection
            this.delegate.handle(request, response, deferredCsrfToken);
        }

        @Override
        public String resolveCsrfTokenValue(HttpServletRequest request, CsrfToken csrfToken) {
            // If the request carries the token as a header (SPA pattern), use the plain
            // parent resolver so the raw cookie value is compared correctly.
            if (StringUtils.hasText(request.getHeader(csrfToken.getHeaderName()))) {
                return super.resolveCsrfTokenValue(request, csrfToken);
            }
            // For form-based submissions fall back to the XOR-aware delegate.
            return this.delegate.resolveCsrfTokenValue(request, csrfToken);
        }
    }

    // ── CSRF cookie refresh filter ────────────────────────────────────────────
    //
    // Spring Security 6 defers token loading until actually needed.
    // Calling csrfToken.getToken() here forces the deferred supplier to run
    // so that the XSRF-TOKEN cookie is written into every response,
    // keeping the browser cookie current.

    static final class CsrfCookieFilter extends OncePerRequestFilter {
        @Override
        protected void doFilterInternal(HttpServletRequest request,
                HttpServletResponse response,
                FilterChain filterChain)
                throws ServletException, IOException {
            CsrfToken csrfToken = (CsrfToken) request.getAttribute(CsrfToken.class.getName());
            if (csrfToken != null) {
                csrfToken.getToken(); // force deferred token to materialise → sets cookie
            }
            filterChain.doFilter(request, response);
        }
    }
}
