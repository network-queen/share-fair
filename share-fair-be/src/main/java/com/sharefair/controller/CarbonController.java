package com.sharefair.controller;

import com.sharefair.dto.ApiResponse;
import com.sharefair.dto.CarbonSavedDto;
import com.sharefair.service.CarbonService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/carbon")
public class CarbonController {

    private final CarbonService carbonService;

    public CarbonController(CarbonService carbonService) {
        this.carbonService = carbonService;
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<ApiResponse<List<CarbonSavedDto>>> getUserHistory(@PathVariable String userId) {
        List<CarbonSavedDto> history = carbonService.getUserHistory(userId);
        return ResponseEntity.ok(ApiResponse.success(history));
    }

    @GetMapping("/user/{userId}/total")
    public ResponseEntity<ApiResponse<BigDecimal>> getUserTotal(@PathVariable String userId) {
        BigDecimal total = carbonService.getUserTotal(userId);
        return ResponseEntity.ok(ApiResponse.success(total));
    }

    @GetMapping("/leaderboard")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getLeaderboard(
            @RequestParam(defaultValue = "10") int limit) {
        limit = Math.max(1, Math.min(limit, 50));
        List<Map<String, Object>> leaderboard = carbonService.getLeaderboard(limit);
        return ResponseEntity.ok(ApiResponse.success(leaderboard));
    }
}
