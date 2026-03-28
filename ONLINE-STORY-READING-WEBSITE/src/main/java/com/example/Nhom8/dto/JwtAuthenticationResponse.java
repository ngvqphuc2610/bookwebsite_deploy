package com.example.Nhom8.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class JwtAuthenticationResponse {
    private String accessToken;
    private String tokenType = "Bearer";
    private Long id;
    private String username;
    private String avatar;
    private java.util.List<String> roles;

    public JwtAuthenticationResponse(String accessToken, Long id, String username, String avatar,
            java.util.List<String> roles) {
        this.accessToken = accessToken;
        this.id = id;
        this.username = username;
        this.avatar = avatar;
        this.roles = roles;
    }
}
