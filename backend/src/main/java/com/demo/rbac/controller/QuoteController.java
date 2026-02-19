package com.demo.rbac.controller;

import com.demo.rbac.dto.QuoteRequest;
import com.demo.rbac.dto.QuoteResponse;
import com.demo.rbac.service.QuoteService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/quotes")
@RequiredArgsConstructor
public class QuoteController {

    private final QuoteService quoteService;

    // ─── Read ───────────────────────────────────────────────────────────────────

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<QuoteResponse>> getAll() {
        return ResponseEntity.ok(quoteService.findAll());
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<QuoteResponse> getOne(@PathVariable Long id) {
        return ResponseEntity.ok(quoteService.findById(id));
    }

    // ─── Create ─────────────────────────────────────────────────────────────────

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<QuoteResponse> create(
            @Valid @RequestBody QuoteRequest req,
            Authentication auth) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(quoteService.create(req, auth.getName()));
    }

    // ─── Update ─────────────────────────────────────────────────────────────────

    @PutMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<QuoteResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody QuoteRequest req) {
        return ResponseEntity.ok(quoteService.update(id, req));
    }

    // ─── Delete ─────────────────────────────────────────────────────────────────

    @DeleteMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        quoteService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
