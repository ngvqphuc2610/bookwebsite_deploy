package com.example.Nhom8.security;

import com.example.Nhom8.models.Role;
import com.example.Nhom8.models.User;
import com.example.Nhom8.repository.RoleRepository;
import com.example.Nhom8.repository.UserRepository;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.Collections;
import java.util.Optional;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class OAuth2LoginSuccessHandler implements AuthenticationSuccessHandler {

    private final JwtTokenProvider tokenProvider;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
            Authentication authentication) throws IOException, ServletException {
        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
        String email = oAuth2User.getAttribute("email");

        if (email == null) {
            response.sendRedirect("http://localhost:5173/login?error=email_not_found");
            return;
        }

        String name = oAuth2User.getAttribute("name");
        String picture = oAuth2User.getAttribute("picture");

        Optional<User> optionalUser = userRepository.findByEmail(email);
        User user;

        if (optionalUser.isPresent()) {
            user = optionalUser.get();
        } else {
            // Register a new user
            user = new User();
            user.setEmail(email);
            // Default username from email or random
            user.setUsername(email.split("@")[0] + "_" + UUID.randomUUID().toString().substring(0, 5));
            user.setFullName(name);
            user.setAvatar(picture);
            user.setProvider(User.AuthProvider.GOOGLE);
            user.setActive(true);
            user.setEnabled(true);
            user.setPremium(false);
            user.setPassword("OAUTH2_USER_" + UUID.randomUUID().toString());

            Role userRole = roleRepository.findByName("USER").orElseGet(() -> {
                Role newRole = new Role();
                newRole.setName("USER");
                return roleRepository.save(newRole);
            });
            user.setRoles(Collections.singleton(userRole));

            userRepository.save(user);
        }

        // Generate JWT Token
        String token = tokenProvider.generateTokenFromUsername(user.getUsername());

        // Redirect to Frontend with Token
        String frontendUrl = "http://localhost:5173/oauth2/redirect?token=" + token;
        response.sendRedirect(frontendUrl);
    }
}
