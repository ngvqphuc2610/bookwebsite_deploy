package com.example.Nhom8.dto;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Data
@Builder
public class AdminAnalyticsDTO {
    private long totalUsers;
    private long totalPremiumUsers;
    private BigDecimal totalRevenue;
    private long totalTransactions;
    private long successTransactions;
    private long failedTransactions;
    private long pendingTransactions;

    private List<RecentTransactionDTO> recentTransactions;
    private Map<String, BigDecimal> revenueByMethod;
}
