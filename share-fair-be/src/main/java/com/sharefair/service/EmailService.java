package com.sharefair.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import jakarta.mail.internet.MimeMessage;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender mailSender;
    private final TemplateEngine templateEngine;

    @Value("${spring.mail.username:}")
    private String fromEmail;

    @Value("${sharefair.email.enabled:false}")
    private boolean emailEnabled;

    @Value("${frontend.url:http://localhost:5173}")
    private String frontendUrl;

    public EmailService(JavaMailSender mailSender, TemplateEngine templateEngine) {
        this.mailSender = mailSender;
        this.templateEngine = templateEngine;
    }

    @Async
    public void sendWelcomeEmail(String toEmail, String userName) {
        if (!emailEnabled) {
            log.debug("Email disabled, skipping welcome email to {}", toEmail);
            return;
        }

        Context context = new Context();
        context.setVariable("userName", userName);
        context.setVariable("frontendUrl", frontendUrl);

        String html = templateEngine.process("welcome", context);
        sendHtml(toEmail, "Welcome to ShareFair!", html);
    }

    @Async
    public void sendTransactionEmail(String toEmail, String userName, String type,
                                      String listingTitle, String otherUserName,
                                      String status, String transactionId) {
        if (!emailEnabled) {
            log.debug("Email disabled, skipping transaction email to {}", toEmail);
            return;
        }

        Context context = new Context();
        context.setVariable("userName", userName);
        context.setVariable("type", type);
        context.setVariable("listingTitle", listingTitle);
        context.setVariable("otherUserName", otherUserName);
        context.setVariable("status", status);
        context.setVariable("transactionUrl", frontendUrl + "/transactions/" + transactionId);
        context.setVariable("frontendUrl", frontendUrl);

        String subject;
        switch (type) {
            case "NEW_TRANSACTION":
                subject = "New rental request for \"" + listingTitle + "\"";
                break;
            case "TRANSACTION_ACCEPTED":
                subject = "Your rental request was accepted!";
                break;
            case "TRANSACTION_COMPLETED":
                subject = "Transaction completed for \"" + listingTitle + "\"";
                break;
            case "TRANSACTION_CANCELLED":
                subject = "Transaction cancelled for \"" + listingTitle + "\"";
                break;
            default:
                subject = "Transaction update for \"" + listingTitle + "\"";
        }

        String html = templateEngine.process("transaction", context);
        sendHtml(toEmail, subject, html);
    }

    @Async
    public void sendReviewEmail(String toEmail, String userName, String reviewerName,
                                 int rating, String transactionId) {
        if (!emailEnabled) {
            log.debug("Email disabled, skipping review email to {}", toEmail);
            return;
        }

        Context context = new Context();
        context.setVariable("userName", userName);
        context.setVariable("reviewerName", reviewerName);
        context.setVariable("rating", rating);
        context.setVariable("transactionUrl", frontendUrl + "/transactions/" + transactionId);
        context.setVariable("frontendUrl", frontendUrl);

        String html = templateEngine.process("review", context);
        sendHtml(toEmail, reviewerName + " left you a " + rating + "-star review", html);
    }

    private void sendHtml(String to, String subject, String htmlContent) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(fromEmail.isEmpty() ? "noreply@sharefair.com" : fromEmail);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlContent, true);
            mailSender.send(message);
            log.info("Email sent to {} with subject: {}", to, subject);
        } catch (Exception e) {
            log.error("Failed to send email to {}: {}", to, e.getMessage());
        }
    }
}
