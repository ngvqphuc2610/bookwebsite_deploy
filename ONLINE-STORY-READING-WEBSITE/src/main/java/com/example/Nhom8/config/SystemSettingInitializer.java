package com.example.Nhom8.config;

import com.example.Nhom8.models.SystemSetting;
import com.example.Nhom8.repository.SystemSettingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class SystemSettingInitializer implements CommandLineRunner {

    private final SystemSettingRepository systemSettingRepository;

    @Override
    public void run(String... args) {
        if (systemSettingRepository.count() == 0) {
            List<SystemSetting> defaultSettings = List.of(
                SystemSetting.builder()
                    .settingKey("SITE_NAME")
                    .settingValue("ONLINE STORY READING")
                    .description("Tên trang web hiển thị trên tiêu đề và Footer")
                    .build(),
                SystemSetting.builder()
                    .settingKey("SUPPORT_EMAIL")
                    .settingValue("support@storyreading.com")
                    .description("Email nhận thông báo và hỗ trợ khách hàng")
                    .build(),
                SystemSetting.builder()
                    .settingKey("MAINTENANCE_MODE")
                    .settingValue("false")
                    .description("Bật/Tắt chế độ bảo trì toàn hệ thống")
                    .build()
            );
            systemSettingRepository.saveAll(defaultSettings);
        }
    }
}
