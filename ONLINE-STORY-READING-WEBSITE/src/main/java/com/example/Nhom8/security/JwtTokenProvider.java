package com.example.Nhom8.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;
import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Component
public class JwtTokenProvider {

    @Value("${APP_JWT_SECRET:9a67475d868a287f3980753f7c4e5e7834241e8c7c94541e2d451a668478465d}")
    private String jwtSecret;

    @Value("${APP_JWT_EXPIRATION_MS:86400000}")
    private String jwtExpirationInMsStr;

    private SecretKey getSigningKey() {
        String secret = jwtSecret != null ? jwtSecret.trim().replace("\"", "").replace("'", "") : "9a67475d868a287f3980753f7c4e5e7834241e8c7c94541e2d451a668478465d";
        byte[] keyBytes = secret.getBytes(StandardCharsets.UTF_8);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    private int getJwtExpirationInMs() {
        try {
            return Integer.parseInt(jwtExpirationInMsStr.trim().replace("\"", "").replace("'", ""));
        } catch (Exception e) {
            return 86400000; // Default 1 day
        }
    }

    public String generateToken(Authentication authentication) {
        UserDetails userPrincipal = (UserDetails) authentication.getPrincipal();
        return generateTokenFromUsername(userPrincipal.getUsername());
    }

    public String generateTokenFromUsername(String username) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + getJwtExpirationInMs());

        return Jwts.builder()
                .subject(username)
                .issuedAt(new Date())
                .expiration(expiryDate)
                .signWith(getSigningKey())
                .compact();
    }

    public String getUsernameFromJWT(String token) {
        Claims claims = Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();

        return claims.getSubject();
    }

    public boolean validateToken(String authToken) {
        try {
            Jwts.parser().verifyWith(getSigningKey()).build().parseSignedClaims(authToken);
            return true;
        } catch (JwtException | IllegalArgumentException ex) {
            // Log error
        }
        return false;
    }
}
