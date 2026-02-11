package com.sharefair.controller;

import com.sharefair.dto.ApiResponse;
import com.sharefair.dto.CreatePaymentIntentRequest;
import com.sharefair.dto.PaymentIntentResponse;
import com.sharefair.security.UserPrincipal;
import com.sharefair.service.PaymentService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/payments")
@CrossOrigin(origins = "*")
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @PostMapping("/intent")
    public ResponseEntity<ApiResponse<PaymentIntentResponse>> createPaymentIntent(
            @RequestBody CreatePaymentIntentRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        PaymentIntentResponse response = paymentService.createPaymentIntent(
                request.getTransactionId(), principal.getId());
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/webhook")
    public ResponseEntity<String> handleWebhook(
            @RequestBody String payload,
            @RequestHeader("Stripe-Signature") String sigHeader) {
        paymentService.handleWebhookEvent(payload, sigHeader);
        return ResponseEntity.ok("OK");
    }
}
