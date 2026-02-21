package com.sharefair.service;

import com.sharefair.config.StripeConfig;
import com.sharefair.dto.PaymentIntentResponse;
import com.sharefair.entity.Transaction;
import com.sharefair.exception.ResourceNotFoundException;
import com.sharefair.repository.ListingRepository;
import com.sharefair.repository.TransactionRepository;
import org.springframework.security.access.AccessDeniedException;
import com.stripe.exception.SignatureVerificationException;
import com.stripe.exception.StripeException;
import com.stripe.model.Event;
import com.stripe.model.PaymentIntent;
import com.stripe.net.RequestOptions;
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
    private final ListingRepository listingRepository;
    private final NotificationService notificationService;

    public StripePaymentService(StripeConfig stripeConfig,
                                TransactionRepository transactionRepository,
                                ListingRepository listingRepository,
                                NotificationService notificationService) {
        this.stripeConfig = stripeConfig;
        this.transactionRepository = transactionRepository;
        this.listingRepository = listingRepository;
        this.notificationService = notificationService;
    }

    @Override
    public PaymentIntentResponse createPaymentIntent(String transactionId, String principalId) {
        Transaction tx = transactionRepository.findById(transactionId)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found"));

        if (!tx.getBorrowerId().equals(principalId)) {
            throw new AccessDeniedException("Only the borrower can pay for this transaction");
        }

        if (!"PENDING".equals(tx.getStatus())) {
            throw new IllegalArgumentException("Transaction is not in PENDING status");
        }

        if (tx.getTotalAmount().compareTo(java.math.BigDecimal.ZERO) == 0) {
            throw new IllegalArgumentException("Payment is not required for free transactions");
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

            // Idempotency key: scoped to this transaction so retries never create duplicate PaymentIntents
            RequestOptions requestOptions = RequestOptions.builder()
                    .setIdempotencyKey("pi-create-" + transactionId)
                    .build();

            PaymentIntent intent = PaymentIntent.create(params, requestOptions);

            transactionRepository.updatePaymentStatus(transactionId, "PROCESSING", intent.getId());

            return PaymentIntentResponse.builder()
                    .clientSecret(intent.getClientSecret())
                    .publishableKey(stripeConfig.getPublishableKey())
                    .amount(tx.getTotalAmount())
                    .currency("usd")
                    .build();

        } catch (StripeException e) {
            log.error("Stripe error creating payment intent for transaction {}: {}", transactionId, e.getMessage());
            throw new IllegalStateException("Payment processing error: " + e.getMessage(), e);
        }
    }

    @Override
    public void handleWebhookEvent(String payload, String sigHeader) {
        Event event;
        try {
            event = Webhook.constructEvent(payload, sigHeader, stripeConfig.getWebhookSecret());
        } catch (SignatureVerificationException e) {
            log.warn("Invalid Stripe webhook signature");
            throw new SecurityException("Invalid webhook signature");
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

        // Notify both borrower and owner that the transaction is now active
        transactionRepository.findById(transactionId).ifPresent(tx -> {
            String listingTitle = resolveListingTitle(tx.getListingId());
            notificationService.notifyTransactionStatusChange(tx.getBorrowerId(), "ACTIVE", listingTitle, transactionId);
            notificationService.notifyTransactionStatusChange(tx.getOwnerId(), "ACTIVE", listingTitle, transactionId);
        });
    }

    private void handlePaymentFailed(Event event) {
        PaymentIntent intent = (PaymentIntent) event.getDataObjectDeserializer()
                .getObject().orElse(null);
        if (intent == null) return;

        String transactionId = intent.getMetadata().get("transactionId");
        if (transactionId == null) return;

        log.warn("Payment failed for transaction {}", transactionId);
        transactionRepository.updatePaymentStatus(transactionId, "FAILED", intent.getId());

        // Notify borrower so they can retry or contact support
        transactionRepository.findById(transactionId).ifPresent(tx -> {
            String listingTitle = resolveListingTitle(tx.getListingId());
            notificationService.notifyTransactionStatusChange(tx.getBorrowerId(), "PAYMENT_FAILED", listingTitle, transactionId);
        });
    }

    private String resolveListingTitle(String listingId) {
        return listingRepository.findById(listingId)
                .map(l -> l.getTitle())
                .orElse("the item");
    }
}
