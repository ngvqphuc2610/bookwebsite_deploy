package com.example.Nhom8.controllers;

import com.example.Nhom8.models.Role;
import com.example.Nhom8.models.User;
import com.example.Nhom8.models.SystemLog;
import com.example.Nhom8.models.SystemSetting;
import com.example.Nhom8.repository.RoleRepository;
import com.example.Nhom8.repository.UserRepository;
import com.example.Nhom8.repository.SystemLogRepository;
import com.example.Nhom8.repository.SystemSettingRepository;
import com.example.Nhom8.service.SystemLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import com.example.Nhom8.models.Transaction;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasAuthority('ADMIN')")
public class AdminController {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final com.example.Nhom8.repository.TransactionRepository transactionRepository;
    private final SystemLogRepository systemLogRepository;
    private final SystemSettingRepository systemSettingRepository;
    private final SystemLogService systemLogService;

    @GetMapping("/analytics")
    public ResponseEntity<com.example.Nhom8.dto.AdminAnalyticsDTO> getAnalytics(
            @RequestParam(required = false, defaultValue = "all") String period) {
        long totalUsers = userRepository.count();
        long premiumUsers = userRepository.countByIsPremium(true);

        java.time.LocalDateTime now = java.time.LocalDateTime.now();
        java.time.LocalDateTime startDate = null;
        java.time.LocalDateTime endDate = now;

        if ("month".equals(period)) {
            startDate = now.withDayOfMonth(1).with(java.time.LocalTime.MIN);
        } else if ("quarter".equals(period)) {
            int currentMonth = now.getMonthValue();
            int currentQuarter = (currentMonth - 1) / 3 + 1;
            int prevQuarter = currentQuarter - 1;
            int year = now.getYear();
            if (prevQuarter == 0) {
                prevQuarter = 4;
                year--;
            }
            int startMonth = (prevQuarter - 1) * 3 + 1;
            startDate = java.time.LocalDateTime.of(year, startMonth, 1, 0, 0);
            endDate = startDate.plusMonths(3).minusNanos(1);
        }

        java.math.BigDecimal totalRevenue;
        java.util.Map<String, java.math.BigDecimal> revenueByMethod = new java.util.HashMap<>();

        if (startDate != null) {
            totalRevenue = transactionRepository.getTotalRevenueBetween(startDate, endDate);
            transactionRepository.getRevenueByPaymentMethodBetween(startDate, endDate).forEach(objs -> {
                revenueByMethod.put((String) objs[0], (java.math.BigDecimal) objs[1]);
            });
        } else {
            totalRevenue = transactionRepository.getTotalRevenue();
            transactionRepository.getRevenueByPaymentMethod().forEach(objs -> {
                revenueByMethod.put((String) objs[0], (java.math.BigDecimal) objs[1]);
            });
        }

        if (totalRevenue == null)
            totalRevenue = java.math.BigDecimal.ZERO;

        long success = transactionRepository
                .countByStatus(com.example.Nhom8.models.Transaction.TransactionStatus.SUCCESS);
        long failed = transactionRepository
                .countByStatus(com.example.Nhom8.models.Transaction.TransactionStatus.FAILED);
        long pending = transactionRepository
                .countByStatus(com.example.Nhom8.models.Transaction.TransactionStatus.PENDING);

        List<com.example.Nhom8.dto.RecentTransactionDTO> recentDTOs = transactionRepository
                .findTop10ByOrderByCreatedAtDesc().stream()
                .map(t -> com.example.Nhom8.dto.RecentTransactionDTO.builder()
                        .id(t.getId())
                        .transactionId(t.getTransactionId())
                        .username(t.getUser().getUsername())
                        .packageName(t.getPremiumPackage() != null ? t.getPremiumPackage().getName() : "N/A")
                        .amount(t.getAmount())
                        .paymentMethod(t.getPaymentMethod())
                        .status(t.getStatus())
                        .createdAt(t.getCreatedAt())
                        .build())
                .collect(Collectors.toList());

        com.example.Nhom8.dto.AdminAnalyticsDTO analytics = com.example.Nhom8.dto.AdminAnalyticsDTO.builder()
                .totalUsers(totalUsers)
                .totalPremiumUsers(premiumUsers)
                .totalRevenue(totalRevenue)
                .totalTransactions(success + failed + pending)
                .successTransactions(success)
                .failedTransactions(failed)
                .pendingTransactions(pending)
                .recentTransactions(recentDTOs)
                .revenueByMethod(revenueByMethod)
                .build();

        return ResponseEntity.ok(analytics);
    }

    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers(@RequestParam(required = false) String username) {
        if (username != null && !username.isEmpty()) {
            return ResponseEntity.ok(userRepository.findByUsernameContainingIgnoreCase(username));
        }
        return ResponseEntity.ok(userRepository.findAll());
    }

    @PostMapping("/users")
    public ResponseEntity<?> createUser(@RequestBody User user) {
        if (userRepository.existsByUsername(user.getUsername())) {
            return ResponseEntity.badRequest().body("Username already exists");
        }
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        User saved = userRepository.save(user);
        systemLogService.log("CREATE_USER", "Đã tạo người dùng mới: " + saved.getUsername());
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/users/{id}")
    public ResponseEntity<?> updateUser(@PathVariable Long id, @RequestBody User userDetails) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setFullName(userDetails.getFullName());
        user.setEmail(userDetails.getEmail());
        if (userDetails.getPassword() != null && !userDetails.getPassword().isEmpty()) {
            user.setPassword(passwordEncoder.encode(userDetails.getPassword()));
        }

        User saved = userRepository.save(user);
        systemLogService.log("UPDATE_USER", "Đã cập nhật thông tin người dùng: " + saved.getUsername());
        return ResponseEntity.ok(saved);
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        User user = userRepository.findById(id).orElse(null);
        String username = (user != null) ? user.getUsername() : id.toString();
        userRepository.deleteById(id);
        systemLogService.log("DELETE_USER", "Đã xóa người dùng: " + username);
        return ResponseEntity.ok("User deleted successfully");
    }

    @PutMapping("/users/{id}/toggle-status")
    public ResponseEntity<?> toggleUserStatus(@PathVariable Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setEnabled(!user.isEnabled());
        user.setActive(user.isEnabled()); // Sync both fields if necessary, but isEnabled is used for security
        userRepository.save(user);
        systemLogService.log("TOGGLE_USER_STATUS", "Đã " + (user.isEnabled() ? "Kích hoạt" : "Vô hiệu hóa") + " người dùng: " + user.getUsername());
        return ResponseEntity.ok(user);
    }

    @GetMapping("/roles")
    public ResponseEntity<List<Role>> getAllRoles() {
        return ResponseEntity.ok(roleRepository.findAll());
    }

    @PostMapping("/users/{userId}/roles")
    public ResponseEntity<?> updateUserRoles(@PathVariable Long userId, @RequestBody Set<Long> roleIds) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Set<Role> roles = roleRepository.findAllById(roleIds).stream().collect(Collectors.toSet());
        user.setRoles(roles);
        userRepository.save(user);
        
        String roleNames = roles.stream().map(Role::getName).collect(Collectors.joining(", "));
        systemLogService.log("UPDATE_USER_ROLES", "Đã cập nhật quyền cho " + user.getUsername() + " thành: " + roleNames);

        return ResponseEntity.ok("Roles updated successfully");
    }

    @GetMapping("/transactions")
    public ResponseEntity<List<com.example.Nhom8.dto.RecentTransactionDTO>> getAllTransactions() {
        List<com.example.Nhom8.dto.RecentTransactionDTO> dtos = transactionRepository
                .findAllByOrderByCreatedAtDesc().stream()
                .map(t -> com.example.Nhom8.dto.RecentTransactionDTO.builder()
                        .id(t.getId())
                        .transactionId(t.getTransactionId())
                        .username(t.getUser().getUsername())
                        .packageName(t.getPremiumPackage() != null ? t.getPremiumPackage().getName() : "N/A")
                        .amount(t.getAmount())
                        .paymentMethod(t.getPaymentMethod())
                        .status(t.getStatus())
                        .createdAt(t.getCreatedAt())
                        .build())
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @DeleteMapping("/transactions/{id}")
    public ResponseEntity<?> deleteTransaction(@PathVariable Long id) {
        transactionRepository.deleteById(id);
        systemLogService.log("DELETE_TRANSACTION", "Đã xóa giao dịch ID: " + id);
        return ResponseEntity.ok("Transaction deleted successfully");
    }

    @GetMapping("/export-revenue")
    public void exportRevenue(HttpServletResponse response) throws IOException {
        response.setContentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        String headerKey = "Content-Disposition";
        String headerValue = "attachment; filename=doanh_thu_truyen_online.xlsx";
        response.setHeader(headerKey, headerValue);

        List<Transaction> transactions = transactionRepository.findAllByOrderByCreatedAtDesc();

        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("Báo cáo doanh thu");

            // Style for header
            CellStyle headerStyle = workbook.createCellStyle();
            headerStyle.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            Font font = workbook.createFont();
            font.setBold(true);
            headerStyle.setFont(font);

            Row headerRow = sheet.createRow(0);
            String[] columns = { "Mã Giao dịch", "Người dùng", "Gói cước", "Số tiền (VNĐ)", "Phương thức", "Trạng thái",
                    "Ngày tạo" };
            for (int i = 0; i < columns.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(columns[i]);
                cell.setCellStyle(headerStyle);
            }

            int rowNum = 1;
            for (Transaction t : transactions) {
                Row row = sheet.createRow(rowNum++);
                row.createCell(0).setCellValue(t.getTransactionId() != null ? t.getTransactionId() : "N/A");
                row.createCell(1).setCellValue(t.getUser().getUsername());
                row.createCell(2).setCellValue(t.getPremiumPackage() != null ? t.getPremiumPackage().getName() : "N/A");
                row.createCell(3).setCellValue(t.getAmount().doubleValue());
                row.createCell(4).setCellValue(t.getPaymentMethod());
                row.createCell(5).setCellValue(t.getStatus().toString());
                row.createCell(6).setCellValue(t.getCreatedAt().toString());
            }

            // Auto-size columns
            for (int i = 0; i < columns.length; i++) {
                sheet.autoSizeColumn(i);
            }

            workbook.write(response.getOutputStream());
        }
    }

    // System Logs
    @GetMapping("/logs")
    public ResponseEntity<List<SystemLog>> getAllLogs() {
        return ResponseEntity.ok(systemLogRepository.findAllByOrderByCreatedAtDesc());
    }

    @DeleteMapping("/logs/clear")
    public ResponseEntity<?> clearLogs() {
        systemLogRepository.deleteAll();
        systemLogService.log("CLEAR_LOGS", "Đã xóa sạch nhật ký hệ thống.");
        return ResponseEntity.ok("All logs cleared");
    }

    // System Settings
    @GetMapping("/settings")
    public ResponseEntity<List<SystemSetting>> getSettings() {
        return ResponseEntity.ok(systemSettingRepository.findAll());
    }

    @PutMapping("/settings")
    public ResponseEntity<?> updateSettings(@RequestBody List<SystemSetting> settings) {
        settings.forEach(s -> {
            SystemSetting existing = systemSettingRepository.findBySettingKey(s.getSettingKey())
                    .orElse(new SystemSetting());
            existing.setSettingKey(s.getSettingKey());
            existing.setSettingValue(s.getSettingValue());
            existing.setDescription(s.getDescription());
            systemSettingRepository.save(existing);
        });
        systemLogService.log("UPDATE_SETTINGS", "Đã cập nhật cấu hình hệ thống.");
        return ResponseEntity.ok("Settings updated successfully");
    }
}
