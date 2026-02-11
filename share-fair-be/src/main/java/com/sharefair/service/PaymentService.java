package com.sharefair.service;

import com.sharefair.dto.PaymentIntentResponse;

public interface PaymentService {
    PaymentIntentResponse createPaymentIntent(String transactionId, String principalId);
    void handleWebhookEvent(String payload, String sigHeader);
}
