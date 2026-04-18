package com.newscrawler.service;

import com.newscrawler.dto.AuthResponse;
import com.newscrawler.dto.LoginRequest;
import com.newscrawler.dto.RegisterRequest;
import com.newscrawler.entity.User;
import com.newscrawler.entity.enums.UserRole;
import com.newscrawler.repository.UserRepository;
import com.newscrawler.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final StringRedisTemplate redisTemplate;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email already exists");
        }
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new IllegalArgumentException("Username already exists");
        }

        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role(UserRole.USER)
                .active(true)
                .build();

        userRepository.save(user);
        return generateTokens(user);
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new IllegalArgumentException("Invalid email or password");
        }

        if (!user.getActive()) {
            throw new IllegalArgumentException("Account is disabled");
        }

        user.setLastLoginAt(LocalDateTime.now());
        userRepository.save(user);

        return generateTokens(user);
    }

    public AuthResponse refresh(String refreshToken) {
        String userId = redisTemplate.opsForValue().get("refresh:" + refreshToken);
        if (userId == null) {
            throw new IllegalArgumentException("Invalid or expired refresh token");
        }

        User user = userRepository.findById(Long.parseLong(userId))
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        // Invalidate old refresh token
        redisTemplate.delete("refresh:" + refreshToken);

        return generateTokens(user);
    }

    public void logout(String accessToken, String refreshToken) {
        // Blacklist access token
        if (accessToken != null) {
            redisTemplate.opsForValue().set(
                    "blacklist:access:" + accessToken, "1",
                    Duration.ofMillis(jwtTokenProvider.getAccessTokenExpiry()));
        }
        // Delete refresh token
        if (refreshToken != null) {
            redisTemplate.delete("refresh:" + refreshToken);
        }
    }

    public User getCurrentUser(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
    }

    private AuthResponse generateTokens(User user) {
        String accessToken = jwtTokenProvider.generateAccessToken(
                user.getId(), user.getEmail(), user.getRole().name());

        String refreshToken = UUID.randomUUID().toString();
        redisTemplate.opsForValue().set(
                "refresh:" + refreshToken,
                user.getId().toString(),
                Duration.ofMillis(jwtTokenProvider.getRefreshTokenExpiry()));

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .expiresIn(jwtTokenProvider.getAccessTokenExpiry() / 1000)
                .role(user.getRole().name())
                .username(user.getUsername())
                .build();
    }
}
