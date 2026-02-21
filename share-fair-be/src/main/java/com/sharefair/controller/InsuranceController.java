package com.sharefair.controller;

import com.sharefair.dto.ApiResponse;
import com.sharefair.dto.CreateInsurancePolicyRequest;
import com.sharefair.dto.FileInsuranceClaimRequest;
import com.sharefair.dto.InsuranceClaimDto;
import com.sharefair.dto.InsurancePolicyDto;
import com.sharefair.security.UserPrincipal;
import com.sharefair.service.InsuranceService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/insurance")
public class InsuranceController {

    private final InsuranceService insuranceService;

    public InsuranceController(InsuranceService insuranceService) {
        this.insuranceService = insuranceService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<InsurancePolicyDto>> addInsurance(
            @RequestBody CreateInsurancePolicyRequest req,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.success(insuranceService.addInsurance(req, principal.getId())));
    }

    @GetMapping("/transaction/{transactionId}")
    public ResponseEntity<ApiResponse<InsurancePolicyDto>> getPolicyForTransaction(
            @PathVariable String transactionId,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.success(
                insuranceService.getPolicyForTransaction(transactionId, principal.getId())));
    }

    @GetMapping("/{policyId}")
    public ResponseEntity<ApiResponse<InsurancePolicyDto>> getPolicy(
            @PathVariable String policyId,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.success(
                insuranceService.getPolicyById(policyId, principal.getId())));
    }

    @PostMapping("/{policyId}/claims")
    public ResponseEntity<ApiResponse<InsuranceClaimDto>> fileClaim(
            @PathVariable String policyId,
            @RequestBody FileInsuranceClaimRequest req,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.success(
                insuranceService.fileClaim(policyId, req, principal.getId())));
    }

    @GetMapping("/{policyId}/claims")
    public ResponseEntity<ApiResponse<List<InsuranceClaimDto>>> getClaims(
            @PathVariable String policyId,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.success(
                insuranceService.getClaims(policyId, principal.getId())));
    }
}
