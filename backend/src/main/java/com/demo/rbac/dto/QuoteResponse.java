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
    private long likeCount;
    private boolean likedByMe;

    public static QuoteResponse from(Quote q, long likeCount, boolean likedByMe) {
        QuoteResponse r = new QuoteResponse();
        r.id = q.getId();
        r.content = q.getContent();
        r.author = q.getAuthor();
        r.createdBy = q.getCreatedBy();
        r.createdAt = q.getCreatedAt();
        r.likeCount = likeCount;
        r.likedByMe = likedByMe;
        return r;
    }

    /** Convenience overload for unauthenticated callers (likedByMe = false). */
    public static QuoteResponse from(Quote q, long likeCount) {
        return from(q, likeCount, false);
    }

    /** Legacy overload — no likes info (backwards compat during transition). */
    public static QuoteResponse from(Quote q) {
        return from(q, 0, false);
    }
}
