package com.example.Nhom8.controllers;

import com.example.Nhom8.config.VNPayConfig;
import com.example.Nhom8.models.PremiumPackage;
import com.example.Nhom8.models.Transaction;
import com.example.Nhom8.models.User;
import com.example.Nhom8.repository.PremiumPackageRepository;
import com.example.Nhom8.repository.TransactionRepository;
import com.example.Nhom8.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/payment")
public class PaymentController {

    @Autowired
    private VNPayConfig vnPayConfig;

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PremiumPackageRepository premiumPackageRepository;

    @PostMapping("/create-vnpay-url")
    public ResponseEntity<?> createVNPayUrl(@RequestParam Long packageId, HttpServletRequest request) throws Exception {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username).orElseThrow(() -> new RuntimeException("User not found"));
        PremiumPackage pkg = premiumPackageRepository.findById(packageId)
                .orElseThrow(() -> new RuntimeException("Package not found"));

        String vnp_Version = vnPayConfig.version;
        String vnp_Command = vnPayConfig.command;
        String vnp_OrderInfo = "Thanh toan goi " + pkg.getName();
        String orderType = "billpayment";
        String vnp_TxnRef = VNPayConfig.getRandomNumber(8);
        String vnp_IpAddr = VNPayConfig.getIpAddress(request);
        String vnp_TmnCode = vnPayConfig.tmnCode;

        long amount = pkg.getPrice().longValue() * 100;
        Map<String, String> vnp_Params = new HashMap<>();
        vnp_Params.put("vnp_Version", vnp_Version);
        vnp_Params.put("vnp_Command", vnp_Command);
        vnp_Params.put("vnp_TmnCode", vnp_TmnCode);
        vnp_Params.put("vnp_Amount", String.valueOf(amount));
        vnp_Params.put("vnp_CurrCode", "VND");
        vnp_Params.put("vnp_TxnRef", vnp_TxnRef);
        vnp_Params.put("vnp_OrderInfo", vnp_OrderInfo);
        vnp_Params.put("vnp_OrderType", orderType);
        vnp_Params.put("vnp_Locale", "vn");
        vnp_Params.put("vnp_ReturnUrl", vnPayConfig.returnUrl);
        vnp_Params.put("vnp_IpAddr", vnp_IpAddr);

        Calendar cld = Calendar.getInstance(TimeZone.getTimeZone("Etc/GMT+7"));
        SimpleDateFormat formatter = new SimpleDateFormat("yyyyMMddHHmmss");
        String vnp_CreateDate = formatter.format(cld.getTime());
        vnp_Params.put("vnp_CreateDate", vnp_CreateDate);

        cld.add(Calendar.MINUTE, 15);
        String vnp_ExpireDate = formatter.format(cld.getTime());
        vnp_Params.put("vnp_ExpireDate", vnp_ExpireDate);

        List fieldNames = new ArrayList(vnp_Params.keySet());
        Collections.sort(fieldNames);
        StringBuilder hashData = new StringBuilder();
        StringBuilder query = new StringBuilder();
        Iterator itr = fieldNames.iterator();
        while (itr.hasNext()) {
            String fieldName = (String) itr.next();
            String fieldValue = (String) vnp_Params.get(fieldName);
            if ((fieldValue != null) && (fieldValue.length() > 0)) {
                // Build hash data
                hashData.append(fieldName);
                hashData.append('=');
                hashData.append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII.toString()));
                // Build query
                query.append(URLEncoder.encode(fieldName, StandardCharsets.US_ASCII.toString()));
                query.append('=');
                query.append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII.toString()));
                if (itr.hasNext()) {
                    query.append('&');
                    hashData.append('&');
                }
            }
        }
        String queryUrl = query.toString();
        String vnp_SecureHash = VNPayConfig.hmacSHA512(vnPayConfig.hashSecret, hashData.toString());
        queryUrl += "&vnp_SecureHash=" + vnp_SecureHash;
        String paymentUrl = vnPayConfig.vnpPayUrl + "?" + queryUrl;

        // Save pending transaction
        Transaction transaction = Transaction.builder()
                .transactionId(vnp_TxnRef)
                .user(user)
                .premiumPackage(pkg)
                .amount(pkg.getPrice())
                .paymentMethod("VNPAY")
                .status(Transaction.TransactionStatus.PENDING)
                .build();
        transactionRepository.save(transaction);

        Map<String, String> response = new HashMap<>();
        response.put("paymentUrl", paymentUrl);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/vnpay-callback")
    public ResponseEntity<?> vnpayCallback(@RequestParam Map<String, String> queryParams) {
        // Verification logic would go here in a production app
        if (queryParams.containsKey("vnp_SecureHashType")) {
            queryParams.remove("vnp_SecureHashType");
        }
        if (queryParams.containsKey("vnp_SecureHash")) {
            queryParams.remove("vnp_SecureHash");
        }

        String responseCode = queryParams.get("vnp_ResponseCode");
        String txnRef = queryParams.get("vnp_TxnRef");

        Transaction transaction = transactionRepository.findByTransactionId(txnRef)
                .orElseThrow(() -> new RuntimeException("Transaction not found"));

        if ("00".equals(responseCode)) {
            transaction.setStatus(Transaction.TransactionStatus.SUCCESS);

            // Update user premium status
            User user = transaction.getUser();
            PremiumPackage pkg = transaction.getPremiumPackage();

            LocalDateTime currentExpiry = user.getPremiumExpiry();
            LocalDateTime now = LocalDateTime.now();

            if (currentExpiry == null || currentExpiry.isBefore(now)) {
                user.setPremiumExpiry(now.plusDays(pkg.getDurationDays()));
            } else {
                user.setPremiumExpiry(currentExpiry.plusDays(pkg.getDurationDays()));
            }
            user.setPremium(true);
            userRepository.save(user);
        } else {
            transaction.setStatus(Transaction.TransactionStatus.FAILED);
        }

        transactionRepository.save(transaction);

        // Return HTML to redirect user back to frontend
        String redirectUrl = "http://localhost:5173/profile?status="
                + (transaction.getStatus() == Transaction.TransactionStatus.SUCCESS ? "success" : "failed");
        return ResponseEntity.status(302).header("Location", redirectUrl).build();
    }
}
