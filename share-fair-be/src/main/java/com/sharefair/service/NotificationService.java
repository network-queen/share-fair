package com.sharefair.service;

import com.sharefair.entity.Notification;
import com.sharefair.entity.NotificationPreference;
import com.sharefair.entity.User;
import com.sharefair.repository.NotificationPreferenceRepository;
import com.sharefair.repository.NotificationRepository;
import com.sharefair.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class NotificationService {
    private final NotificationRepository notificationRepository;
    private final NotificationPreferenceRepository preferenceRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;

    public NotificationService(NotificationRepository notificationRepository,
                               NotificationPreferenceRepository preferenceRepository,
                               UserRepository userRepository,
                               EmailService emailService) {
        this.notificationRepository = notificationRepository;
        this.preferenceRepository = preferenceRepository;
        this.userRepository = userRepository;
        this.emailService = emailService;
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
            notificationRepository.save(notification);
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
            notificationRepository.save(notification);
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
            notificationRepository.save(notification);
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

    public void sendWelcomeEmail(String userId) {
        User user = userRepository.findById(userId).orElse(null);
        if (user != null && user.getEmail() != null) {
            emailService.sendWelcomeEmail(user.getEmail(), user.getName());
        }
    }

    private NotificationPreference getPreferences(String userId) {
        return preferenceRepository.findByUserId(userId)
                .orElse(NotificationPreference.builder().userId(userId).build());
    }
}
