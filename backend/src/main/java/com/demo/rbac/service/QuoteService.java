package com.demo.rbac.service;

import com.demo.rbac.dto.QuoteRequest;
import com.demo.rbac.dto.QuoteResponse;
import com.demo.rbac.model.Quote;
import com.demo.rbac.model.QuoteLike;
import com.demo.rbac.repository.QuoteLikeRepository;
import com.demo.rbac.repository.QuoteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
public class QuoteService {

    private final QuoteRepository quoteRepository;
    private final QuoteLikeRepository quoteLikeRepository;

    // ─── Read ────────────────────────────────────────────────────────────────

    public List<QuoteResponse> findAll(String username) {
        return quoteRepository.findAll().stream()
                .map(q -> toResponse(q, username))
                .toList();
    }

    public QuoteResponse findById(Long id, String username) {
        return toResponse(getOrThrow(id), username);
    }

    // ─── Write ───────────────────────────────────────────────────────────────

    public QuoteResponse create(QuoteRequest req, String username) {
        Quote q = new Quote();
        q.setContent(req.getContent());
        q.setAuthor(req.getAuthor() != null ? req.getAuthor() : "Unknown");
        q.setCreatedBy(username);
        return toResponse(quoteRepository.save(q), username);
    }

    public QuoteResponse update(Long id, QuoteRequest req, String username) {
        Quote q = getOrThrow(id);
        q.setContent(req.getContent());
        if (req.getAuthor() != null)
            q.setAuthor(req.getAuthor());
        return toResponse(quoteRepository.save(q), username);
    }

    public void delete(Long id) {
        if (!quoteRepository.existsById(id))
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Quote not found");
        quoteLikeRepository.findAll().stream() // clean up orphaned likes
                .filter(l -> l.getQuoteId().equals(id))
                .map(QuoteLike::getId)
                .forEach(quoteLikeRepository::deleteById);
        quoteRepository.deleteById(id);
    }

    // ─── Likes ───────────────────────────────────────────────────────────────

    public QuoteResponse toggleLike(Long quoteId, String username) {
        Quote q = getOrThrow(quoteId);
        if (quoteLikeRepository.existsByQuoteIdAndUsername(quoteId, username)) {
            quoteLikeRepository.deleteByQuoteIdAndUsername(quoteId, username);
        } else {
            quoteLikeRepository.save(new QuoteLike(quoteId, username));
        }
        return toResponse(q, username);
    }

    // ─── Helpers ─────────────────────────────────────────────────────────────

    private QuoteResponse toResponse(Quote q, String username) {
        long count = quoteLikeRepository.countByQuoteId(q.getId());
        boolean liked = username != null &&
                quoteLikeRepository.existsByQuoteIdAndUsername(q.getId(), username);
        return QuoteResponse.from(q, count, liked);
    }

    private Quote getOrThrow(Long id) {
        return quoteRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Quote not found"));
    }
}
