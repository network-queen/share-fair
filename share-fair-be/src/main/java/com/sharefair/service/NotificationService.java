package com.sharefair.service;

import com.sharefair.entity.Notification;
import com.sharefair.repository.NotificationRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class NotificationService {
    private final NotificationRepository notificationRepository;

    public NotificationService(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
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

    public void notifyTransactionStatusChange(String userId, String status, String listingTitle, String transactionId) {
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

    public void notifyNewReview(String revieweeId, String reviewerName, int rating, String transactionId) {
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
}
