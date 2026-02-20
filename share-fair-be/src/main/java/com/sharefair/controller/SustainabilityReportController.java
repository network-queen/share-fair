package com.sharefair.controller;

import com.sharefair.dto.ApiResponse;
import com.sharefair.dto.SustainabilityReportDto;
import com.sharefair.service.SustainabilityReportService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/sustainability")
public class SustainabilityReportController {

    private final SustainabilityReportService reportService;

    public SustainabilityReportController(SustainabilityReportService reportService) {
        this.reportService = reportService;
    }

    @GetMapping("/report/community")
    public ResponseEntity<ApiResponse<SustainabilityReportDto>> getCommunityReport() {
        return ResponseEntity.ok(ApiResponse.success(reportService.getCommunityReport()));
    }

    @GetMapping("/report/user/{userId}")
    public ResponseEntity<ApiResponse<SustainabilityReportDto>> getUserReport(@PathVariable String userId) {
        return ResponseEntity.ok(ApiResponse.success(reportService.getUserReport(userId)));
    }
}
