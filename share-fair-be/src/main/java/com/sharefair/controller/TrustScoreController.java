package com.sharefair.controller;

import com.sharefair.dto.ApiResponse;
import com.sharefair.dto.TrustScoreDto;
import com.sharefair.service.TrustScoreService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/trust-scores")
@CrossOrigin(origins = "*")
public class TrustScoreController {

    private final TrustScoreService trustScoreService;

    public TrustScoreController(TrustScoreService trustScoreService) {
        this.trustScoreService = trustScoreService;
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<ApiResponse<TrustScoreDto>> getTrustScore(@PathVariable String userId) {
        return trustScoreService.getTrustScore(userId)
                .map(ts -> ResponseEntity.ok(ApiResponse.success(ts)))
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body((ApiResponse<TrustScoreDto>) ApiResponse.error("Trust score not found")));
    }
}
