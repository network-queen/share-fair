package com.sharefair.controller;

import com.sharefair.dto.ApiResponse;
import com.sharefair.dto.CreateDisputeRequest;
import com.sharefair.dto.DisputeDto;
import com.sharefair.dto.ResolveDisputeRequest;
import com.sharefair.security.UserPrincipal;
import com.sharefair.service.DisputeService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/disputes")
public class DisputeController {

    private final DisputeService disputeService;

    public DisputeController(DisputeService disputeService) {
        this.disputeService = disputeService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<DisputeDto>> createDispute(
            @RequestBody CreateDisputeRequest req,
            @AuthenticationPrincipal UserPrincipal principal) {
        DisputeDto dispute = disputeService.createDispute(req, principal.getId());
        return ResponseEntity.ok(ApiResponse.success(dispute));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<DisputeDto>> getDispute(
            @PathVariable String id,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.success(disputeService.getDispute(id, principal.getId())));
    }

    @GetMapping("/transaction/{transactionId}")
    public ResponseEntity<ApiResponse<DisputeDto>> getDisputeByTransaction(
            @PathVariable String transactionId,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.success(disputeService.getDisputeByTransaction(transactionId, principal.getId())));
    }

    @GetMapping("/my")
    public ResponseEntity<ApiResponse<List<DisputeDto>>> getMyDisputes(
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.success(disputeService.getMyDisputes(principal.getId())));
    }

    @PutMapping("/{id}/resolve")
    public ResponseEntity<ApiResponse<DisputeDto>> resolveDispute(
            @PathVariable String id,
            @RequestBody ResolveDisputeRequest req,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.success(disputeService.resolveDispute(id, req, principal.getId())));
    }
}
