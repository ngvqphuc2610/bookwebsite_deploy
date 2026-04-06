package com.example.Nhom8.controllers;

import com.example.Nhom8.dto.JwtAuthenticationResponse;
import com.example.Nhom8.dto.LoginRequest;
import com.example.Nhom8.dto.ForgotPasswordRequest;
import com.example.Nhom8.dto.ResetPasswordRequest;
import com.example.Nhom8.models.User;
import com.example.Nhom8.security.JwtTokenProvider;
import com.example.Nhom8.service.EmailService;
import lombok.RequiredArgsConstructor;
import java.time.LocalDateTime;
import java.util.Random;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import com.example.Nhom8.repository.UserRepository;
import com.example.Nhom8.repository.RoleRepository;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@RequestBody LoginRequest loginRequest) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            loginRequest.getUsername(),
                            loginRequest.getPassword()));

            SecurityContextHolder.getContext().setAuthentication(authentication);
            String jwt = tokenProvider.generateToken(authentication);

            // Fetch user by username OR email (Supports Google users who set a password)
            com.example.Nhom8.models.User user = userRepository.findByUsername(loginRequest.getUsername())
                    .or(() -> userRepository.findByEmail(loginRequest.getUsername()))
                    .orElseThrow(() -> new RuntimeException("User not found"));

            java.util.List<String> roles = user.getRoles().stream()
                    .map(com.example.Nhom8.models.Role::getName)
                    .collect(java.util.stream.Collectors.toList());

            return ResponseEntity
                    .ok(new JwtAuthenticationResponse(jwt, user.getId(), user.getUsername(), user.getAvatar(), roles));

        } catch (org.springframework.security.authentication.DisabledException e) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.FORBIDDEN)
                    .body("Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên.");
        } catch (org.springframework.security.core.AuthenticationException e) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.UNAUTHORIZED)
                    .body("Tên đăng nhập hoặc mật khẩu không chính xác.");
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestParam("username") String username,
            @RequestParam("email") String email,
            @RequestParam("password") String password,
            @RequestParam("fullName") String fullName,
            @RequestParam(value = "avatar", required = false) org.springframework.web.multipart.MultipartFile avatarFile) {

        if (userRepository.existsByUsername(username)) {
            return ResponseEntity.badRequest().body("Username is already taken!");
        }

        if (userRepository.existsByEmail(email)) {
            return ResponseEntity.badRequest().body("Email Address is already in use!");
        }

        com.example.Nhom8.models.User user = new com.example.Nhom8.models.User();
        user.setUsername(username);
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(password));
        user.setFullName(fullName);
        user.setProvider(com.example.Nhom8.models.User.AuthProvider.LOCAL);

        String avatarPath = "https://via.placeholder.com/150";
        if (avatarFile != null && !avatarFile.isEmpty()) {
            try {
                String fileName = org.springframework.util.StringUtils
                        .cleanPath(java.util.UUID.randomUUID().toString() + "_" + avatarFile.getOriginalFilename());
                java.nio.file.Path uploadPath = java.nio.file.Paths.get("uploads");
                if (!java.nio.file.Files.exists(uploadPath)) {
                    java.nio.file.Files.createDirectories(uploadPath);
                }
                java.nio.file.Path filePath = uploadPath.resolve(fileName);
                java.nio.file.Files.copy(avatarFile.getInputStream(), filePath,
                        java.nio.file.StandardCopyOption.REPLACE_EXISTING);
                avatarPath = "/uploads/" + fileName;
            } catch (java.io.IOException e) {
                return ResponseEntity.status(org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR)
                        .body("Could not upload avatar image");
            }
        }
        user.setAvatar(avatarPath);

        com.example.Nhom8.models.Role userRole = roleRepository.findByName("USER")
                .orElseThrow(() -> new RuntimeException("Error: Role is not found."));

        user.setRoles(java.util.Collections.singleton(userRole));

        userRepository.save(user);

        return ResponseEntity.ok("User registered successfully!");
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody ForgotPasswordRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Email không tồn tại trong hệ thống."));

        if (user.getOtpLockoutUntil() != null && user.getOtpLockoutUntil().isAfter(LocalDateTime.now())) {
            java.time.Duration remains = java.time.Duration.between(LocalDateTime.now(), user.getOtpLockoutUntil());
            return ResponseEntity.status(429).body("Tài khoản đang bị khóa yêu cầu OTP. Vui lòng quay lại sau " + (remains.toMinutes() + 1) + " phút.");
        }

        String otp = String.format("%06d", new Random().nextInt(1000000));
        user.setResetPasswordToken(otp);
        user.setTokenExpiration(LocalDateTime.now().plusMinutes(5));
        user.setFailedOtpAttempts(0); 
        
        userRepository.save(user);

        emailService.sendEmail(user.getEmail(), "Mã xác nhận quên mật khẩu", "Mã OTP của bạn là: " + otp + ". Mã có hiệu lực trong 5 phút.");

        return ResponseEntity.ok("Mã xác nhận đã được gửi đến email của bạn.");
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody ResetPasswordRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Người dùng không tồn tại."));

        if (user.getOtpLockoutUntil() != null && user.getOtpLockoutUntil().isAfter(LocalDateTime.now())) {
            java.time.Duration duration = java.time.Duration.between(LocalDateTime.now(), user.getOtpLockoutUntil());
            long minutes = duration.toMinutes() + 1;
            return ResponseEntity.status(429).body("Bạn đã nhập sai quá nhiều lần. Vui lòng quay lại sau " + minutes + " phút.");
        }

        if (user.getResetPasswordToken() == null) {
            return ResponseEntity.badRequest().body("Yêu cầu không hợp lệ. Vui lòng yêu cầu mã OTP mới.");
        }

        if (user.getTokenExpiration().isBefore(LocalDateTime.now())) {
            return ResponseEntity.badRequest().body("Mã xác nhận đã hết hạn. Vui lòng yêu cầu mã mới.");
        }

        if (!user.getResetPasswordToken().equals(request.getOtp())) {
            int attempts = user.getFailedOtpAttempts() + 1;
            user.setFailedOtpAttempts(attempts);
            
            if (attempts >= 3) {
                user.setOtpLockoutUntil(LocalDateTime.now().plusMinutes(30));
                userRepository.save(user);
                return ResponseEntity.status(429).body("Bạn đã nhập sai mã 3 lần. Tài khoản bị khóa đổi mật khẩu trong 30 phút.");
            }
            
            userRepository.save(user);
            int remains = 3 - attempts;
            return ResponseEntity.badRequest().body("Mã xác nhận không chính xác. Bạn còn " + remains + " lần thử.");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setResetPasswordToken(null);
        user.setTokenExpiration(null);
        user.setFailedOtpAttempts(0);
        user.setOtpLockoutUntil(null);
        userRepository.save(user);

        return ResponseEntity.ok("Mật khẩu đã được thay đổi thành công.");
    }
}
