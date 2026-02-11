package com.sharefair.controller;

import com.sharefair.dto.ApiResponse;
import com.sharefair.dto.CreateTransactionRequest;
import com.sharefair.dto.TransactionDto;
import com.sharefair.dto.UpdateTransactionStatusRequest;
import com.sharefair.security.UserPrincipal;
import com.sharefair.service.TransactionService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/transactions")
@CrossOrigin(origins = "*")
public class TransactionController {

    private final TransactionService transactionService;

    public TransactionController(TransactionService transactionService) {
        this.transactionService = transactionService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<TransactionDto>> createTransaction(
            @RequestBody CreateTransactionRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        TransactionDto tx = transactionService.createTransaction(request, principal.getId());
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(tx));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<TransactionDto>> getTransaction(
            @PathVariable String id,
            @AuthenticationPrincipal UserPrincipal principal) {
        TransactionDto tx = transactionService.getTransaction(id, principal.getId());
        return ResponseEntity.ok(ApiResponse.success(tx));
    }

    @GetMapping("/my")
    public ResponseEntity<ApiResponse<List<TransactionDto>>> getMyTransactions(
            @AuthenticationPrincipal UserPrincipal principal) {
        List<TransactionDto> transactions = transactionService.getUserTransactions(principal.getId());
        return ResponseEntity.ok(ApiResponse.success(transactions));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<ApiResponse<TransactionDto>> updateTransactionStatus(
            @PathVariable String id,
            @RequestBody UpdateTransactionStatusRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        TransactionDto tx = transactionService.updateStatus(id, request.getStatus(), principal.getId());
        return ResponseEntity.ok(ApiResponse.success(tx));
    }
}
