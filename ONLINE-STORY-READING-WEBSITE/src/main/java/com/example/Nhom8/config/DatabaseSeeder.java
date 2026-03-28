package com.example.Nhom8.config;

import com.example.Nhom8.models.Role;
import com.example.Nhom8.models.User;
import com.example.Nhom8.repository.FaqItemRepository;
import com.example.Nhom8.repository.RoleRepository;
import com.example.Nhom8.repository.UserRepository;
import com.example.Nhom8.service.CustomerCareService;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Set;

@Component
@RequiredArgsConstructor
public class DatabaseSeeder implements CommandLineRunner {

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final FaqItemRepository faqItemRepository;
    private final PasswordEncoder passwordEncoder;

    @org.springframework.beans.factory.annotation.Value("${ADMIN_USERNAME}")
    private String adminUsername;

    @org.springframework.beans.factory.annotation.Value("${ADMIN_PASSWORD}")
    private String adminPassword;

    @org.springframework.beans.factory.annotation.Value("${ADMIN_EMAIL}")
    private String adminEmail;

    @Override
    public void run(String... args) {
        seedRoles();
        seedAdminUser();
        seedFaqs();
    }

    private void seedRoles() {
        if (roleRepository.findByName("USER").isEmpty()) {
            roleRepository.save(Role.builder().name("USER").description("Reader").build());
        }
        if (roleRepository.findByName("STAFF").isEmpty()) {
            roleRepository.save(Role.builder().name("STAFF").description("Editor").build());
        }
        if (roleRepository.findByName("ADMIN").isEmpty()) {
            roleRepository.save(Role.builder().name("ADMIN").description("Administrator").build());
        }
    }

    private void seedAdminUser() {
        if (userRepository.findByUsername(adminUsername).isEmpty()) {
            roleRepository.findByName("ADMIN").ifPresent(adminRole -> {
                User admin = User.builder()
                        .username(adminUsername)
                        .password(passwordEncoder.encode(adminPassword))
                        .email(adminEmail)
                        .fullName("System Administrator")
                        .isActive(true)
                        .enabled(true)
                        .roles(Set.of(adminRole))
                        .provider(User.AuthProvider.LOCAL)
                        .build();
                userRepository.save(admin);
            });
        }
    }

    private void seedFaqs() {
        if (faqItemRepository.count() == 0) {
            faqItemRepository.saveAll(CustomerCareService.buildDefaultFaqs());
        }
    }
}
