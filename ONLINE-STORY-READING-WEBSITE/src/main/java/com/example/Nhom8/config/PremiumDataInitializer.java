package com.example.Nhom8.config;

import com.example.Nhom8.models.PremiumPackage;
import com.example.Nhom8.repository.PremiumPackageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.math.BigDecimal;
import java.util.List;

@Configuration
@RequiredArgsConstructor
public class PremiumDataInitializer {

    @Bean
    CommandLineRunner initPremiumPackages(PremiumPackageRepository repository) {
        return args -> {
            if (repository.count() == 0) {
                PremiumPackage basic = PremiumPackage.builder()
                        .name("Gói Linh Thạch")
                        .description("Đọc các chương Premium cơ bản, không quảng cáo trong 7 ngày.")
                        .price(new BigDecimal("19000"))
                        .durationDays(7)
                        .build();

                PremiumPackage pro = PremiumPackage.builder()
                        .name("Gói Trúc Cơ (PRO)")
                        .description("Mở khóa toàn bộ kho truyện VIP, ưu tiên cập nhật chương mới nhất trong 30 ngày.")
                        .price(new BigDecimal("59000"))
                        .durationDays(30)
                        .build();

                PremiumPackage king = PremiumPackage.builder()
                        .name("Gói Tiên Tôn (KING)")
                        .description(
                                "Đặc quyền tối thượng: Đọc mọi thể loại, huy hiệu King độc quyền, hỗ trợ đọc offline trong 90 ngày.")
                        .price(new BigDecimal("149000"))
                        .durationDays(90)
                        .build();

                repository.saveAll(List.of(basic, pro, king));
                System.out.println("--- Đã khởi tạo dữ liệu mẫu cho các gói Premium ---");
            }
        };
    }
}
