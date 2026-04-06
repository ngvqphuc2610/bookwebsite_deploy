package com.example.Nhom8.service;

import com.example.Nhom8.models.SystemLog;
import com.example.Nhom8.models.User;
import com.example.Nhom8.repository.SystemLogRepository;
import com.example.Nhom8.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class SystemLogService {

    private final SystemLogRepository systemLogRepository;
    private final UserRepository userRepository;

    public void log(String action, String details) {
        org.springframework.security.core.Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User user = null;
        if (auth != null && auth.isAuthenticated()) {
            user = userRepository.findByUsername(auth.getName()).orElse(null);
        }

        SystemLog log = SystemLog.builder()
                .action(action)
                .details(details)
                .user(user)
                .build();
        systemLogRepository.save(log);
    }
}
