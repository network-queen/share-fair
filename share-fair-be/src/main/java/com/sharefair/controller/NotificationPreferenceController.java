package com.sharefair.controller;

import com.sharefair.dto.ApiResponse;
import com.sharefair.dto.NotificationPreferenceDto;
import com.sharefair.entity.NotificationPreference;
import com.sharefair.repository.NotificationPreferenceRepository;
import com.sharefair.security.UserPrincipal;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/notification-preferences")
public class NotificationPreferenceController {

    private final NotificationPreferenceRepository preferenceRepository;

    public NotificationPreferenceController(NotificationPreferenceRepository preferenceRepository) {
        this.preferenceRepository = preferenceRepository;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<NotificationPreferenceDto>> getPreferences(
            @AuthenticationPrincipal UserPrincipal principal) {
        NotificationPreference pref = preferenceRepository.findByUserId(principal.getId())
                .orElse(NotificationPreference.builder().userId(principal.getId()).build());

        return ResponseEntity.ok(ApiResponse.success(toDto(pref)));
    }

    @PutMapping
    public ResponseEntity<ApiResponse<NotificationPreferenceDto>> updatePreferences(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestBody NotificationPreferenceDto dto) {

        NotificationPreference existing = preferenceRepository.findByUserId(principal.getId()).orElse(null);

        if (existing == null) {
            NotificationPreference pref = NotificationPreference.builder()
                    .userId(principal.getId())
                    .emailTransactions(dto.getEmailTransactions() != null ? dto.getEmailTransactions() : true)
                    .emailReviews(dto.getEmailReviews() != null ? dto.getEmailReviews() : true)
                    .emailMarketing(dto.getEmailMarketing() != null ? dto.getEmailMarketing() : false)
                    .inAppTransactions(dto.getInAppTransactions() != null ? dto.getInAppTransactions() : true)
                    .inAppReviews(dto.getInAppReviews() != null ? dto.getInAppReviews() : true)
                    .build();
            NotificationPreference saved = preferenceRepository.save(pref);
            return ResponseEntity.ok(ApiResponse.success(toDto(saved)));
        }

        if (dto.getEmailTransactions() != null) existing.setEmailTransactions(dto.getEmailTransactions());
        if (dto.getEmailReviews() != null) existing.setEmailReviews(dto.getEmailReviews());
        if (dto.getEmailMarketing() != null) existing.setEmailMarketing(dto.getEmailMarketing());
        if (dto.getInAppTransactions() != null) existing.setInAppTransactions(dto.getInAppTransactions());
        if (dto.getInAppReviews() != null) existing.setInAppReviews(dto.getInAppReviews());

        NotificationPreference updated = preferenceRepository.update(existing);
        return ResponseEntity.ok(ApiResponse.success(toDto(updated)));
    }

    private NotificationPreferenceDto toDto(NotificationPreference pref) {
        return NotificationPreferenceDto.builder()
                .emailTransactions(pref.getEmailTransactions())
                .emailReviews(pref.getEmailReviews())
                .emailMarketing(pref.getEmailMarketing())
                .inAppTransactions(pref.getInAppTransactions())
                .inAppReviews(pref.getInAppReviews())
                .build();
    }
}
