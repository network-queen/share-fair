package com.sharefair.service;

import com.sharefair.dto.NotificationDto;
import com.sharefair.entity.Notification;
import com.sharefair.entity.NotificationPreference;
import com.sharefair.entity.User;
import com.sharefair.repository.NotificationPreferenceRepository;
import com.sharefair.repository.NotificationRepository;
import com.sharefair.repository.UserRepository;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class NotificationService {
    private final NotificationRepository notificationRepository;
    private final NotificationPreferenceRepository preferenceRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;
    private final SimpMessagingTemplate messagingTemplate;

    public NotificationService(NotificationRepository notificationRepository,
                               NotificationPreferenceRepository preferenceRepository,
                               UserRepository userRepository,
                               EmailService emailService,
                               SimpMessagingTemplate messagingTemplate) {
        this.notificationRepository = notificationRepository;
        this.preferenceRepository = preferenceRepository;
        this.userRepository = userRepository;
        this.emailService = emailService;
        this.messagingTemplate = messagingTemplate;
    }

    public List<Notification> getUserNotifications(String userId, int limit, int offset) {
        return notificationRepository.findByUserId(userId, limit, offset);
    }

    public int getUnreadCount(String userId) {
        return notificationRepository.countUnread(userId);
    }

    public void markAsRead(String notificationId) {
        notificationRepository.markAsRead(notificationId);
    }

    public void markAllAsRead(String userId) {
        notificationRepository.markAllAsRead(userId);
    }

    public void notifyNewTransaction(String ownerId, String borrowerName, String listingTitle, String transactionId) {
        NotificationPreference pref = getPreferences(ownerId);

        if (pref.getInAppTransactions()) {
            Notification notification = Notification.builder()
                    .userId(ownerId)
                    .type("NEW_TRANSACTION")
                    .title("New rental request")
                    .message(borrowerName + " wants to rent \"" + listingTitle + "\"")
                    .referenceId(transactionId)
                    .referenceType("TRANSACTION")
                    .build();
            saveAndPush(notification);
        }

        if (pref.getEmailTransactions()) {
            User owner = userRepository.findById(ownerId).orElse(null);
            if (owner != null && owner.getEmail() != null) {
                emailService.sendTransactionEmail(
                        owner.getEmail(), owner.getName(), "NEW_TRANSACTION",
                        listingTitle, borrowerName, "PENDING", transactionId);
            }
        }
    }

    public void notifyTransactionStatusChange(String userId, String status, String listingTitle, String transactionId) {
        NotificationPreference pref = getPreferences(userId);

        if (pref.getInAppTransactions()) {
            Notification notification = Notification.builder()
                    .userId(userId)
                    .type("TRANSACTION_STATUS")
                    .title("Transaction " + status.toLowerCase())
                    .message("Transaction for \"" + listingTitle + "\" is now " + status.toLowerCase())
                    .referenceId(transactionId)
                    .referenceType("TRANSACTION")
                    .build();
            saveAndPush(notification);
        }

        if (pref.getEmailTransactions()) {
            User user = userRepository.findById(userId).orElse(null);
            if (user != null && user.getEmail() != null) {
                String type = "ACTIVE".equals(status) ? "TRANSACTION_ACCEPTED"
                        : "COMPLETED".equals(status) ? "TRANSACTION_COMPLETED"
                        : "CANCELLED".equals(status) ? "TRANSACTION_CANCELLED"
                        : "TRANSACTION_STATUS";
                emailService.sendTransactionEmail(
                        user.getEmail(), user.getName(), type,
                        listingTitle, "", status, transactionId);
            }
        }
    }

    public void notifyNewReview(String revieweeId, String reviewerName, int rating, String transactionId) {
        NotificationPreference pref = getPreferences(revieweeId);

        if (pref.getInAppReviews()) {
            Notification notification = Notification.builder()
                    .userId(revieweeId)
                    .type("NEW_REVIEW")
                    .title("New review received")
                    .message(reviewerName + " left you a " + rating + "-star review")
                    .referenceId(transactionId)
                    .referenceType("TRANSACTION")
                    .build();
            saveAndPush(notification);
        }

        if (pref.getEmailReviews()) {
            User reviewee = userRepository.findById(revieweeId).orElse(null);
            if (reviewee != null && reviewee.getEmail() != null) {
                emailService.sendReviewEmail(
                        reviewee.getEmail(), reviewee.getName(),
                        reviewerName, rating, transactionId);
            }
        }
    }

    public void notifyDisputeFiled(String userId, String transactionId) {
        NotificationPreference pref = getPreferences(userId);
        if (pref.getInAppTransactions()) {
            Notification notification = Notification.builder()
                    .userId(userId)
                    .type("DISPUTE_FILED")
                    .title("Dispute filed")
                    .message("A dispute has been filed for your transaction. Our team will review it shortly.")
                    .referenceId(transactionId)
                    .referenceType("TRANSACTION")
                    .build();
            saveAndPush(notification);
        }
    }

    public void notifyDisputeResolved(String userId, String resolution, String transactionId) {
        NotificationPreference pref = getPreferences(userId);
        if (pref.getInAppTransactions()) {
            Notification notification = Notification.builder()
                    .userId(userId)
                    .type("DISPUTE_RESOLVED")
                    .title("Dispute resolved")
                    .message("Your dispute has been resolved: " + resolution)
                    .referenceId(transactionId)
                    .referenceType("TRANSACTION")
                    .build();
            saveAndPush(notification);
        }
    }

    public void notifyInsurancePurchased(String userId, String coverageType, String transactionId) {
        NotificationPreference pref = getPreferences(userId);
        if (pref.getInAppTransactions()) {
            Notification notification = Notification.builder()
                    .userId(userId)
                    .type("INSURANCE_PURCHASED")
                    .title("Insurance policy activated")
                    .message(coverageType + " coverage is now active for your transaction.")
                    .referenceId(transactionId)
                    .referenceType("TRANSACTION")
                    .build();
            saveAndPush(notification);
        }
    }

    public void notifyInsuranceClaimFiled(String userId, String policyId, String transactionId) {
        NotificationPreference pref = getPreferences(userId);
        if (pref.getInAppTransactions()) {
            Notification notification = Notification.builder()
                    .userId(userId)
                    .type("INSURANCE_CLAIM")
                    .title("Insurance claim submitted")
                    .message("Your insurance claim has been submitted and is under review.")
                    .referenceId(transactionId)
                    .referenceType("TRANSACTION")
                    .build();
            saveAndPush(notification);
        }
    }

    public void sendWelcomeEmail(String userId) {
        User user = userRepository.findById(userId).orElse(null);
        if (user != null && user.getEmail() != null) {
            emailService.sendWelcomeEmail(user.getEmail(), user.getName());
        }
    }

    private void saveAndPush(Notification notification) {
        notificationRepository.save(notification);
        NotificationDto dto = NotificationDto.builder()
                .id(notification.getId())
                .userId(notification.getUserId())
                .type(notification.getType())
                .title(notification.getTitle())
                .message(notification.getMessage())
                .referenceId(notification.getReferenceId())
                .referenceType(notification.getReferenceType())
                .isRead(false)
                .createdAt(notification.getCreatedAt())
                .build();
        messagingTemplate.convertAndSendToUser(notification.getUserId(), "/queue/notifications", dto);
    }

    private NotificationPreference getPreferences(String userId) {
        return preferenceRepository.findByUserId(userId)
                .orElse(NotificationPreference.builder().userId(userId).build());
    }
}
