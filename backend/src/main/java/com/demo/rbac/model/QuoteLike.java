package com.demo.rbac.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "quote_likes", uniqueConstraints = {
        @UniqueConstraint(columnNames = { "quote_id", "username" })
})
@Data
@NoArgsConstructor
public class QuoteLike {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "quote_id", nullable = false)
    private Long quoteId;

    @Column(nullable = false, length = 50)
    private String username;

    public QuoteLike(Long quoteId, String username) {
        this.quoteId = quoteId;
        this.username = username;
    }
}
