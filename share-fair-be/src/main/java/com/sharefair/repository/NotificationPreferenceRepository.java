package com.sharefair.repository;

import com.sharefair.entity.NotificationPreference;

import java.util.Optional;

public interface NotificationPreferenceRepository {
    Optional<NotificationPreference> findByUserId(String userId);
    NotificationPreference save(NotificationPreference preference);
    NotificationPreference update(NotificationPreference preference);
}
