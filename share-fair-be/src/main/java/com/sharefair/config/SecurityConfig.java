package com.sharefair.config;

import com.sharefair.security.JwtAuthenticationEntryPoint;
import com.sharefair.security.JwtAuthenticationFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfigurationSource;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthFilter;
    private final JwtAuthenticationEntryPoint authEntryPoint;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthFilter,
                          JwtAuthenticationEntryPoint authEntryPoint) {
        this.jwtAuthFilter = jwtAuthFilter;
        this.authEntryPoint = authEntryPoint;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http, CorsConfigurationSource corsConfigurationSource) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource))
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .exceptionHandling(exception -> exception.authenticationEntryPoint(authEntryPoint))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/v1/auth/oauth/**").permitAll()
                        .requestMatchers("/api/v1/auth/refresh").permitAll()
                        .requestMatchers("/api/v1/search/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/listings", "/api/v1/listings/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/users/**").permitAll()
                        .requestMatchers("/api/v1/auth/me").authenticated()
                        .requestMatchers(HttpMethod.POST, "/api/v1/listings").authenticated()
                        .requestMatchers(HttpMethod.POST, "/api/v1/listings/*/images").authenticated()
                        .requestMatchers(HttpMethod.PUT, "/api/v1/listings/**").authenticated()
                        .requestMatchers(HttpMethod.DELETE, "/api/v1/listings/**").authenticated()
                        .requestMatchers(HttpMethod.PUT, "/api/v1/users/**").authenticated()
                        .requestMatchers("/api/v1/transactions/**").authenticated()
                        .requestMatchers(HttpMethod.POST, "/api/v1/payments/webhook").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/v1/payments/intent").authenticated()
                        .requestMatchers(HttpMethod.POST, "/api/v1/reviews").authenticated()
                        .requestMatchers(HttpMethod.GET, "/api/v1/reviews/transaction/*/check").authenticated()
                        .requestMatchers(HttpMethod.GET, "/api/v1/reviews/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/trust-scores/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/carbon/**").permitAll()
                        .requestMatchers("/api/v1/notifications/**").authenticated()
                        .requestMatchers("/api/v1/notification-preferences/**").authenticated()
                        .requestMatchers(HttpMethod.PATCH, "/api/v1/listings/**").authenticated()
                        .anyRequest().permitAll()
                )
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
