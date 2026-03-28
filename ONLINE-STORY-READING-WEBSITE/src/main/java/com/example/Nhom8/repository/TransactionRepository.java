package com.example.Nhom8.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.Nhom8.models.Transaction;

import org.springframework.data.jpa.repository.Query;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    List<Transaction> findByUserId(Long userId);

    Optional<Transaction> findByTransactionId(String transactionId);

    @Query("SELECT SUM(t.amount) FROM Transaction t WHERE t.status = 'SUCCESS'")
    BigDecimal getTotalRevenue();

    @Query("SELECT t.paymentMethod, SUM(t.amount) FROM Transaction t WHERE t.status = 'SUCCESS' GROUP BY t.paymentMethod")
    List<Object[]> getRevenueByPaymentMethod();

    @Query("SELECT t.paymentMethod, SUM(t.amount) FROM Transaction t WHERE t.status = 'SUCCESS' AND t.createdAt >= :after GROUP BY t.paymentMethod")
    List<Object[]> getRevenueByPaymentMethodAfter(java.time.LocalDateTime after);

    @Query("SELECT t.paymentMethod, SUM(t.amount) FROM Transaction t WHERE t.status = 'SUCCESS' AND t.createdAt BETWEEN :start AND :end GROUP BY t.paymentMethod")
    List<Object[]> getRevenueByPaymentMethodBetween(java.time.LocalDateTime start, java.time.LocalDateTime end);

    @Query("SELECT SUM(t.amount) FROM Transaction t WHERE t.status = 'SUCCESS' AND t.createdAt >= :after")
    BigDecimal getTotalRevenueAfter(java.time.LocalDateTime after);

    @Query("SELECT SUM(t.amount) FROM Transaction t WHERE t.status = 'SUCCESS' AND t.createdAt BETWEEN :start AND :end")
    BigDecimal getTotalRevenueBetween(java.time.LocalDateTime start, java.time.LocalDateTime end);

    long countByStatus(com.example.Nhom8.models.Transaction.TransactionStatus status);

    List<Transaction> findTop10ByOrderByCreatedAtDesc();
    List<Transaction> findAllByOrderByCreatedAtDesc();

    // For Statistics
    // @Query("SELECT SUM(t.amount) FROM Transaction t WHERE t.status = 'SUCCESS'")
    // BigDecimal calculateTotalRevenue();
}
