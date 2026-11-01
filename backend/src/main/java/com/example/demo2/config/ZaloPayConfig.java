package com.example.demo2.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;

@Configuration
@ConfigurationProperties(prefix = "zalopay")
@Getter
@Setter
public class ZaloPayConfig {

    private int appId = 2554;
    private String key1 = "sdngKKJmqEMzvh5QQcdD2A9XBSKUNaYn";
    private String key2 = "trMrHtvjo6myautxDUiAcYsVtaeQ8nhf";
    private String createUrl = "https://sb-openapi.zalopay.vn/v2/create";
    private String queryUrl = "https://sb-openapi.zalopay.vn/v2/query";
    private String callbackUrl = "http://localhost:8080/api/v1/payments/zalopay/callback";
    private String redirectUrl = "http://localhost:8080/api/v1/payments/zalopay/return";

    /**
     * Tạo chữ ký điện tử HMAC-SHA256 theo chuẩn tài liệu kỹ thuật của ZaloPay
     */
    public static String hmacSha256(String key, String data) {
        try {
            Mac hmac256 = Mac.getInstance("HmacSHA256");
            SecretKeySpec secretKey = new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
            hmac256.init(secretKey);
            byte[] hashBytes = hmac256.doFinal(data.getBytes(StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder(2 * hashBytes.length);
            for (byte b : hashBytes) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) {
                    hexString.append('0');
                }
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (Exception e) {
            throw new RuntimeException("Lỗi khi tạo chữ ký HMAC-SHA256 cho ZaloPay: " + e.getMessage(), e);
        }
    }
}
