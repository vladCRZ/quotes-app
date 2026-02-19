package com.demo.rbac.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Tracks failed login attempts per IP address.
 * Blocks an IP after MAX_ATTEMPTS failures within BLOCK_DURATION_SECONDS.
 */
@Service
@Slf4j
public class LoginAttemptService {

    private static final int MAX_ATTEMPTS = 5;
    private static final long BLOCK_DURATION_SECONDS = 15 * 60; // 15 minutes
    private static final long CLEANUP_INTERVAL_SECONDS = 60; // prune stale entries every minute

    private final ConcurrentHashMap<String, AttemptRecord> attempts = new ConcurrentHashMap<>();
    private volatile long lastCleanup = Instant.now().getEpochSecond();

    // ── Public API ────────────────────────────────────────────────────────────

    /** Call this on every successful login for an IP. */
    public void loginSucceeded(String ip) {
        attempts.remove(ip);
        log.debug("[RateLimit] Login succeeded — reset counter for {}", ip);
    }

    /** Call this on every failed login attempt for an IP. */
    public void loginFailed(String ip) {
        AttemptRecord record = attempts.compute(ip, (key, existing) -> {
            if (existing == null || hasExpired(existing)) {
                return new AttemptRecord(1, Instant.now().getEpochSecond());
            }
            existing.count++;
            existing.lastAttemptTime = Instant.now().getEpochSecond();
            return existing;
        });

        log.warn("[RateLimit] Failed attempt #{} for IP: {}", record.count, ip);
        maybeCleanup();
    }

    /**
     * Returns true if the IP is currently blocked.
     * Also returns the number of remaining seconds if blocked.
     */
    public boolean isBlocked(String ip) {
        AttemptRecord record = attempts.get(ip);
        if (record == null)
            return false;
        if (hasExpired(record)) {
            attempts.remove(ip);
            return false;
        }
        return record.count >= MAX_ATTEMPTS;
    }

    /** Returns seconds remaining in the lockout, or 0 if not blocked. */
    public long getBlockRemainingSeconds(String ip) {
        AttemptRecord record = attempts.get(ip);
        if (record == null || record.count < MAX_ATTEMPTS)
            return 0;
        long elapsed = Instant.now().getEpochSecond() - record.lastAttemptTime;
        long remaining = BLOCK_DURATION_SECONDS - elapsed;
        return Math.max(0, remaining);
    }

    /** Returns how many attempts remain before lockout, or 0 if already blocked. */
    public int getAttemptsRemaining(String ip) {
        AttemptRecord record = attempts.get(ip);
        if (record == null || hasExpired(record))
            return MAX_ATTEMPTS;
        return Math.max(0, MAX_ATTEMPTS - record.count);
    }

    // ── Internals ─────────────────────────────────────────────────────────────

    private boolean hasExpired(AttemptRecord record) {
        long elapsed = Instant.now().getEpochSecond() - record.lastAttemptTime;
        return elapsed >= BLOCK_DURATION_SECONDS;
    }

    /** Periodically evict stale (expired) entries to avoid memory growth. */
    private void maybeCleanup() {
        long now = Instant.now().getEpochSecond();
        if (now - lastCleanup < CLEANUP_INTERVAL_SECONDS)
            return;
        lastCleanup = now;
        int removed = 0;
        for (var entry : attempts.entrySet()) {
            if (hasExpired(entry.getValue())) {
                attempts.remove(entry.getKey());
                removed++;
            }
        }
        if (removed > 0)
            log.debug("[RateLimit] Cleaned up {} stale IP record(s)", removed);
    }

    // ── Inner record ──────────────────────────────────────────────────────────

    private static class AttemptRecord {
        volatile int count;
        volatile long lastAttemptTime;

        AttemptRecord(int count, long lastAttemptTime) {
            this.count = count;
            this.lastAttemptTime = lastAttemptTime;
        }
    }
}
