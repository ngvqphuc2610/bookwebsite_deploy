package com.example.Nhom8.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.Formatter;

@Configuration
public class MomoConfig {
    @Value("${momo.partner-code}")
    public String partnerCode;

    @Value("${momo.access-key}")
    public String accessKey;

    @Value("${momo.secret-key}")
    public String secretKey;

    @Value("${momo.api-url}")
    public String apiUrl;

    @Value("${momo.return-url}")
    public String returnUrl;

    @Value("${momo.notify-url}")
    public String notifyUrl;

    public static String hmacSha256(String data, String key) {
        try {
            byte[] keyBytes = key.getBytes(StandardCharsets.UTF_8);
            byte[] dataBytes = data.getBytes(StandardCharsets.UTF_8);
            Mac hmacSha256 = Mac.getInstance("HmacSHA256");
            SecretKeySpec secretKey = new SecretKeySpec(keyBytes, "HmacSHA256");
            hmacSha256.init(secretKey);
            byte[] hashBytes = hmacSha256.doFinal(dataBytes);
            return toHexString(hashBytes);
        } catch (Exception e) {
            return "";
        }
    }

    private static String toHexString(byte[] bytes) {
        Formatter formatter = new Formatter();
        for (byte b : bytes) {
            formatter.format("%02x", b);
        }
        return formatter.toString();
    }
}
