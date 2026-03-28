package com.example.Nhom8.dto;

import com.example.Nhom8.models.User;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.Set;
import java.util.stream.Collectors;

@Data
public class UserDTO {
    private Long id;
    private String username;
    private String email;
    private String fullName;
    private String avatar;
    private LocalDateTime premiumExpiry;
    private Set<String> roles;
    private LocalDateTime createdAt;

    public static UserDTO fromEntity(User user) {
        UserDTO dto = new UserDTO();
        dto.setId(user.getId());
        dto.setUsername(user.getUsername());
        dto.setEmail(user.getEmail());
        dto.setFullName(user.getFullName());
        dto.setAvatar(user.getAvatar());
        dto.setPremiumExpiry(user.getPremiumExpiry());
        dto.setRoles(user.getRoles().stream().map(role -> role.getName()).collect(Collectors.toSet()));
        dto.setCreatedAt(user.getCreatedAt());
        return dto;
    }
}
