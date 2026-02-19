package com.demo.rbac.service;

import com.demo.rbac.dto.QuoteRequest;
import com.demo.rbac.dto.QuoteResponse;
import com.demo.rbac.model.Quote;
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

    public List<QuoteResponse> findAll() {
        return quoteRepository.findAll().stream()
                .map(QuoteResponse::from)
                .toList();
    }

    public QuoteResponse findById(Long id) {
        return QuoteResponse.from(getOrThrow(id));
    }

    public QuoteResponse create(QuoteRequest req, String username) {
        Quote q = new Quote();
        q.setContent(req.getContent());
        q.setAuthor(req.getAuthor() != null ? req.getAuthor() : "Unknown");
        q.setCreatedBy(username);
        return QuoteResponse.from(quoteRepository.save(q));
    }

    public QuoteResponse update(Long id, QuoteRequest req) {
        Quote q = getOrThrow(id);
        q.setContent(req.getContent());
        if (req.getAuthor() != null)
            q.setAuthor(req.getAuthor());
        return QuoteResponse.from(quoteRepository.save(q));
    }

    public void delete(Long id) {
        if (!quoteRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Quote not found");
        }
        quoteRepository.deleteById(id);
    }

    private Quote getOrThrow(Long id) {
        return quoteRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Quote not found"));
    }
}
