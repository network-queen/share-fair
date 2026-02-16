package com.sharefair.service;

import com.sharefair.config.StripeConfig;
import com.sharefair.dto.PaymentIntentResponse;
import com.sharefair.entity.Transaction;
import com.sharefair.repository.TransactionRepository;
import com.stripe.exception.SignatureVerificationException;
import com.stripe.exception.StripeException;
import com.stripe.model.Event;
import com.stripe.model.PaymentIntent;
import com.stripe.net.Webhook;
import com.stripe.param.PaymentIntentCreateParams;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class StripePaymentService implements PaymentService {

    private static final Logger log = LoggerFactory.getLogger(StripePaymentService.class);

    private final StripeConfig stripeConfig;
    private final TransactionRepository transactionRepository;

    public StripePaymentService(StripeConfig stripeConfig, TransactionRepository transactionRepository) {
        this.stripeConfig = stripeConfig;
        this.transactionRepository = transactionRepository;
    }

    @Override
    public PaymentIntentResponse createPaymentIntent(String transactionId, String principalId) {
        Transaction tx = transactionRepository.findById(transactionId)
                .orElseThrow(() -> new RuntimeException("Transaction not found"));

        if (!tx.getBorrowerId().equals(principalId)) {
            throw new RuntimeException("Only the borrower can pay for this transaction");
        }

        if (!"PENDING".equals(tx.getStatus())) {
            throw new RuntimeException("Transaction is not in PENDING status");
        }

        if (tx.getTotalAmount().compareTo(java.math.BigDecimal.ZERO) == 0) {
            throw new RuntimeException("Payment is not required for free transactions");
        }

        long amountInCents = tx.getTotalAmount().movePointRight(2).longValue();

        try {
            PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
                    .setAmount(amountInCents)
                    .setCurrency("usd")
                    .putMetadata("transactionId", transactionId)
                    .setAutomaticPaymentMethods(
                            PaymentIntentCreateParams.AutomaticPaymentMethods.builder()
                                    .setEnabled(true)
                                    .build()
                    )
                    .build();

            PaymentIntent intent = PaymentIntent.create(params);

            transactionRepository.updatePaymentStatus(transactionId, "PROCESSING", intent.getId());

            return PaymentIntentResponse.builder()
                    .clientSecret(intent.getClientSecret())
                    .publishableKey(stripeConfig.getPublishableKey())
                    .amount(tx.getTotalAmount())
                    .currency("usd")
                    .build();

        } catch (StripeException e) {
            log.error("Stripe error creating payment intent for transaction {}: {}", transactionId, e.getMessage());
            throw new RuntimeException("Payment processing error: " + e.getMessage());
        }
    }

    @Override
    public void handleWebhookEvent(String payload, String sigHeader) {
        Event event;
        try {
            event = Webhook.constructEvent(payload, sigHeader, stripeConfig.getWebhookSecret());
        } catch (SignatureVerificationException e) {
            log.warn("Invalid Stripe webhook signature");
            throw new RuntimeException("Invalid webhook signature");
        }

        switch (event.getType()) {
            case "payment_intent.succeeded" -> handlePaymentSucceeded(event);
            case "payment_intent.payment_failed" -> handlePaymentFailed(event);
            default -> log.debug("Unhandled Stripe event type: {}", event.getType());
        }
    }

    private void handlePaymentSucceeded(Event event) {
        PaymentIntent intent = (PaymentIntent) event.getDataObjectDeserializer()
                .getObject().orElse(null);
        if (intent == null) return;

        String transactionId = intent.getMetadata().get("transactionId");
        if (transactionId == null) return;

        log.info("Payment succeeded for transaction {}", transactionId);
        transactionRepository.updatePaymentStatus(transactionId, "PAID", intent.getId());
        transactionRepository.updateStatus(transactionId, "ACTIVE");
    }

    private void handlePaymentFailed(Event event) {
        PaymentIntent intent = (PaymentIntent) event.getDataObjectDeserializer()
                .getObject().orElse(null);
        if (intent == null) return;

        String transactionId = intent.getMetadata().get("transactionId");
        if (transactionId == null) return;

        log.warn("Payment failed for transaction {}", transactionId);
        transactionRepository.updatePaymentStatus(transactionId, "FAILED", intent.getId());
    }
}
