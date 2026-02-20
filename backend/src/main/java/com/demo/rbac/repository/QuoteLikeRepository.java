package com.demo.rbac.repository;

import com.demo.rbac.model.QuoteLike;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.transaction.annotation.Transactional;

public interface QuoteLikeRepository extends JpaRepository<QuoteLike, Long> {

    long countByQuoteId(Long quoteId);

    boolean existsByQuoteIdAndUsername(Long quoteId, String username);

    @Transactional
    void deleteByQuoteIdAndUsername(Long quoteId, String username);
}
