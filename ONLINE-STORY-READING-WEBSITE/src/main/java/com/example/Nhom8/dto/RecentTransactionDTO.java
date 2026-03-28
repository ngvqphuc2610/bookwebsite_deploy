package com.example.Nhom8.dto;

import com.example.Nhom8.models.Transaction;
import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class RecentTransactionDTO {
    private Long id;
    private String transactionId;
    private String username;
    private String packageName;
    private BigDecimal amount;
    private String paymentMethod;
    private Transaction.TransactionStatus status;
    private LocalDateTime createdAt;
}
