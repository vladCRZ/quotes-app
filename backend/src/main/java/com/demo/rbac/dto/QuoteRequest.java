package com.demo.rbac.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class QuoteRequest {

    @NotBlank(message = "Content must not be blank")
    private String content;

    private String author;
}
