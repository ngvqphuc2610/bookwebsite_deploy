package com.example.Nhom8.controllers;

import com.example.Nhom8.config.VNPayConfig;
import com.example.Nhom8.config.MomoConfig;
import com.example.Nhom8.models.PremiumPackage;
import com.example.Nhom8.models.Transaction;
import com.example.Nhom8.models.User;
import com.example.Nhom8.repository.PremiumPackageRepository;
import com.example.Nhom8.repository.TransactionRepository;
import com.example.Nhom8.repository.UserRepository;
import com.example.Nhom8.service.EmailService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.client.RestTemplate;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@RestController
@RequestMapping("/api/payment")
@Slf4j
public class PaymentController {

    @Autowired
    private VNPayConfig vnPayConfig;

    @Autowired
    private MomoConfig momoConfig;

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PremiumPackageRepository premiumPackageRepository;

    @Autowired
    private EmailService emailService;

    @Value("${app.frontend-url}")
    private String frontendUrl;

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

        List<String> fieldNames = new ArrayList<>(vnp_Params.keySet());
        Collections.sort(fieldNames);
        StringBuilder hashData = new StringBuilder();
        StringBuilder query = new StringBuilder();
        Iterator<String> itr = fieldNames.iterator();
        while (itr.hasNext()) {
            String fieldName = itr.next();
            String fieldValue = vnp_Params.get(fieldName);
            if ((fieldValue != null) && (fieldValue.length() > 0)) {
                hashData.append(fieldName);
                hashData.append('=');
                hashData.append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII.toString()));
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
    @Transactional
    public ResponseEntity<?> vnpayCallback(@RequestParam Map<String, String> queryParams) {
        log.info("VNPay callback received: {}", queryParams);
        String vnp_SecureHash = queryParams.get("vnp_SecureHash");
        Map<String, String> verifyParams = new HashMap<>(queryParams);
        verifyParams.remove("vnp_SecureHash");
        verifyParams.remove("vnp_SecureHashType");

        String calculatedHash = vnPayConfig.hashAllFields(verifyParams);
        if (!calculatedHash.equals(vnp_SecureHash)) {
            log.error("VNPay signature verification failed");
            return ResponseEntity.status(403).body("Invalid signature");
        }

        String responseCode = queryParams.get("vnp_ResponseCode");
        String txnRef = queryParams.get("vnp_TxnRef");

        Transaction transaction = transactionRepository.findByTransactionId(txnRef)
                .orElseThrow(() -> new RuntimeException("Transaction not found"));

        if ("00".equals(responseCode)) {
            transaction.setStatus(Transaction.TransactionStatus.SUCCESS);
            User user = transaction.getUser();
            PremiumPackage pkg = transaction.getPremiumPackage();
            LocalDateTime now = LocalDateTime.now();

            if (user.getPremiumExpiry() == null || user.getPremiumExpiry().isBefore(now)) {
                user.setPremiumExpiry(now.plusDays(pkg.getDurationDays()));
            } else {
                user.setPremiumExpiry(user.getPremiumExpiry().plusDays(pkg.getDurationDays()));
            }
            user.setPremium(true);
            userRepository.save(user);

            try {
                String subject = "[AlexStore] Nâng cấp Premium thành công!";
                String body = String.format(
                        "Xin chào %s,\n\nBạn đã nâng cấp thành công gói %s qua VNPAY.\nSố tiền: %,.0f VNĐ\nThời hạn: %s",
                        user.getFullName(), pkg.getName(), transaction.getAmount().doubleValue(),
                        user.getPremiumExpiry().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")));
                emailService.sendEmail(user.getEmail(), subject, body);
            } catch (Exception e) {
                log.error("Failed to send email: {}", e.getMessage());
            }
        } else {
            transaction.setStatus(Transaction.TransactionStatus.FAILED);
        }
        transactionRepository.save(transaction);

        String redirectUrl = frontendUrl + "/?status="
                + (transaction.getStatus() == Transaction.TransactionStatus.SUCCESS ? "success" : "failed");
        return ResponseEntity.status(302).header("Location", redirectUrl).build();
    }

    @PostMapping("/create-momo-url")
    public ResponseEntity<?> createMomoUrl(@RequestParam Long packageId) throws Exception {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username).orElseThrow(() -> new RuntimeException("User not found"));
        PremiumPackage pkg = premiumPackageRepository.findById(packageId)
                .orElseThrow(() -> new RuntimeException("Package not found"));

        String orderId = String.valueOf(System.currentTimeMillis());
        String requestId = orderId;
        String amount = String.valueOf(pkg.getPrice().longValue());
        String orderInfo = "Thanh toan AlexStore gói " + pkg.getName();
        String requestType = "payWithMethod";
        String extraData = "";

        String rawHash = "accessKey=" + momoConfig.accessKey +
                "&amount=" + amount +
                "&extraData=" + extraData +
                "&ipnUrl=" + momoConfig.notifyUrl +
                "&orderId=" + orderId +
                "&orderInfo=" + orderInfo +
                "&partnerCode=" + momoConfig.partnerCode +
                "&redirectUrl=" + momoConfig.returnUrl +
                "&requestId=" + requestId +
                "&requestType=" + requestType;

        String signature = MomoConfig.hmacSha256(rawHash, momoConfig.secretKey);

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("partnerCode", momoConfig.partnerCode);
        requestBody.put("requestId", requestId);
        requestBody.put("amount", Long.parseLong(amount));
        requestBody.put("orderId", orderId);
        requestBody.put("orderInfo", orderInfo);
        requestBody.put("redirectUrl", momoConfig.returnUrl);
        requestBody.put("ipnUrl", momoConfig.notifyUrl);
        requestBody.put("extraData", extraData);
        requestBody.put("requestType", requestType);
        requestBody.put("signature", signature);
        requestBody.put("lang", "vi");

        RestTemplate restTemplate = new RestTemplate();
        ResponseEntity<Map> response = restTemplate.postForEntity(momoConfig.apiUrl, requestBody, Map.class);

        Transaction transaction = Transaction.builder()
                .transactionId(orderId)
                .user(user)
                .premiumPackage(pkg)
                .amount(pkg.getPrice())
                .paymentMethod("MOMO")
                .status(Transaction.TransactionStatus.PENDING)
                .build();
        transactionRepository.save(transaction);

        return ResponseEntity.ok(response.getBody());
    }

    @GetMapping("/momo-callback")
    @Transactional
    public ResponseEntity<?> momoCallback(@RequestParam Map<String, String> params) {
        log.info("MoMo callback received: {}", params);
        String resultCode = params.get("resultCode");
        String orderId = params.get("orderId");

        Transaction transaction = transactionRepository.findByTransactionId(orderId)
                .orElseThrow(() -> new RuntimeException("Transaction not found"));

        if ("0".equals(resultCode)) {
            transaction.setStatus(Transaction.TransactionStatus.SUCCESS);
            User user = transaction.getUser();
            PremiumPackage pkg = transaction.getPremiumPackage();
            LocalDateTime now = LocalDateTime.now();

            if (user.getPremiumExpiry() == null || user.getPremiumExpiry().isBefore(now)) {
                user.setPremiumExpiry(now.plusDays(pkg.getDurationDays()));
            } else {
                user.setPremiumExpiry(user.getPremiumExpiry().plusDays(pkg.getDurationDays()));
            }
            user.setPremium(true);
            userRepository.save(user);

            try {
                String subject = "[AlexStore] Nâng cấp Premium thành công!";
                String body = String.format(
                        "Xin chào %s,\n\nBạn đã nâng cấp thành công gói %s qua MoMo.\nSố tiền: %,.0f VNĐ\nThời hạn: %s",
                        user.getFullName(), pkg.getName(), transaction.getAmount().doubleValue(),
                        user.getPremiumExpiry().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")));
                emailService.sendEmail(user.getEmail(), subject, body);
            } catch (Exception e) {
                log.error("Email error: {}", e.getMessage());
            }
        } else {
            transaction.setStatus(Transaction.TransactionStatus.FAILED);
        }
        transactionRepository.save(transaction);

        String redirectUrl = frontendUrl + "/?status=" + ("0".equals(resultCode) ? "success" : "failed");
        return ResponseEntity.status(302).header("Location", redirectUrl).build();
    }
}
