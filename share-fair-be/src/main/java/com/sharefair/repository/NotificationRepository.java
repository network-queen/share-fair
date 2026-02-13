package com.sharefair.repository;

import com.sharefair.entity.Notification;

import java.util.List;
import java.util.Optional;

public interface NotificationRepository {
    Notification save(Notification notification);
    Optional<Notification> findById(String id);
    List<Notification> findByUserId(String userId, int limit, int offset);
    int countUnread(String userId);
    void markAsRead(String id);
    void markAllAsRead(String userId);
}
