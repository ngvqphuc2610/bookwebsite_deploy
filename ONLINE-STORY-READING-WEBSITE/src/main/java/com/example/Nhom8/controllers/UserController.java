package com.example.Nhom8.controllers;

import com.example.Nhom8.dto.UserDTO;
import com.example.Nhom8.models.User;
import com.example.Nhom8.repository.UserRepository;
import com.example.Nhom8.service.EmailService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.util.StringUtils;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    @GetMapping("/me")
    public ResponseEntity<UserDTO> getCurrentUser(Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.status(401).build();
        }
        String username = authentication.getName();
        return userRepository.findByUsername(username)
                .map(user -> ResponseEntity.ok(UserDTO.fromEntity(user)))
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/request-otp")
    public ResponseEntity<?> requestOtp(Authentication authentication) {
        if (authentication == null) return ResponseEntity.status(401).build();
        User user = userRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        String otp = String.format("%06d", new java.util.Random().nextInt(1000000));
        user.setResetPasswordToken(otp);
        user.setTokenExpiration(java.time.LocalDateTime.now().plusMinutes(5));
        userRepository.save(user);

        emailService.sendEmail(user.getEmail(), "Mã OTP thay đổi mật khẩu", "Mã xác nhận của bạn là: " + otp);
        return ResponseEntity.ok("Mã xác nhận đã được gửi vào email.");
    }

    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(
            Authentication authentication,
            @RequestParam("fullName") String fullName,
            @RequestParam("email") String email,
            @RequestParam(value = "avatar", required = false) MultipartFile avatarFile,
            @RequestParam(value = "newPassword", required = false) String newPassword,
            @RequestParam(value = "otp", required = false) String otp) {

        if (authentication == null) {
            return ResponseEntity.status(401).build();
        }

        String username = authentication.getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Nếu thay đổi mật khẩu, bắt buộc phải có OTP hợp lệ
        if (newPassword != null && !newPassword.trim().isEmpty()) {
            if (otp == null || !otp.equals(user.getResetPasswordToken())) {
                return ResponseEntity.badRequest().body("Mã xác nhận không chính xác.");
            }
            if (user.getTokenExpiration() == null || user.getTokenExpiration().isBefore(java.time.LocalDateTime.now())) {
                return ResponseEntity.badRequest().body("Mã xác nhận đã hết hạn.");
            }
            user.setPassword(passwordEncoder.encode(newPassword));
            user.setResetPasswordToken(null);
            user.setTokenExpiration(null);
        }

        user.setFullName(fullName);
        user.setEmail(email);

        if (avatarFile != null && !avatarFile.isEmpty()) {
            try {
                String fileName = StringUtils
                        .cleanPath(UUID.randomUUID().toString() + "_" + avatarFile.getOriginalFilename());
                Path uploadPath = Paths.get("uploads");
                if (!Files.exists(uploadPath)) {
                    Files.createDirectories(uploadPath);
                }
                Path filePath = uploadPath.resolve(fileName);
                Files.copy(avatarFile.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
                user.setAvatar("/uploads/" + fileName);
            } catch (IOException e) {
                return ResponseEntity.status(500).build();
            }
        }

        userRepository.save(user);
        return ResponseEntity.ok(UserDTO.fromEntity(user));
    }
}
