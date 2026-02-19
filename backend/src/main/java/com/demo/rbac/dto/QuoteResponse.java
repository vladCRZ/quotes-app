package com.demo.rbac.dto;

import com.demo.rbac.model.Quote;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class QuoteResponse {

    private Long id;
    private String content;
    private String author;
    private String createdBy;
    private LocalDateTime createdAt;

    public static QuoteResponse from(Quote q) {
        QuoteResponse r = new QuoteResponse();
        r.id = q.getId();
        r.content = q.getContent();
        r.author = q.getAuthor();
        r.createdBy = q.getCreatedBy();
        r.createdAt = q.getCreatedAt();
        return r;
    }
}
