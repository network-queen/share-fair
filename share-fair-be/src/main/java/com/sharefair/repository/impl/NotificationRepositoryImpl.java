package com.sharefair.repository.impl;

import com.sharefair.entity.Notification;
import com.sharefair.repository.NotificationRepository;
import org.jooq.DSLContext;
import org.jooq.Field;
import org.jooq.impl.DSL;
import org.springframework.stereotype.Repository;

import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public class NotificationRepositoryImpl implements NotificationRepository {
    private final DSLContext dsl;
    private static final String TABLE = "notifications";

    private static final Field<?>[] FIELDS = {
            DSL.field("id"),
            DSL.field("user_id"),
            DSL.field("type"),
            DSL.field("title"),
            DSL.field("message"),
            DSL.field("reference_id"),
            DSL.field("reference_type"),
            DSL.field("is_read"),
            DSL.field("created_at")
    };

    public NotificationRepositoryImpl(DSLContext dsl) {
        this.dsl = dsl;
    }

    @Override
    public Notification save(Notification notification) {
        if (notification.getId() == null) {
            notification.setId(UUID.randomUUID().toString());
        }
        if (notification.getCreatedAt() == null) {
            notification.setCreatedAt(LocalDateTime.now());
        }
        if (notification.getIsRead() == null) {
            notification.setIsRead(false);
        }

        dsl.insertInto(DSL.table(TABLE))
                .columns(FIELDS)
                .values(
                        UUID.fromString(notification.getId()),
                        UUID.fromString(notification.getUserId()),
                        notification.getType(),
                        notification.getTitle(),
                        notification.getMessage(),
                        notification.getReferenceId(),
                        notification.getReferenceType(),
                        notification.getIsRead(),
                        notification.getCreatedAt()
                )
                .execute();

        return notification;
    }

    @Override
    public Optional<Notification> findById(String id) {
        return dsl.select(FIELDS)
                .from(DSL.table(TABLE))
                .where(DSL.field("id").eq(UUID.fromString(id)))
                .fetchOptional()
                .map(this::mapToNotification);
    }

    @Override
    public List<Notification> findByUserId(String userId, int limit, int offset) {
        return dsl.select(FIELDS)
                .from(DSL.table(TABLE))
                .where(DSL.field("user_id").eq(UUID.fromString(userId)))
                .orderBy(DSL.field("created_at").desc())
                .limit(limit)
                .offset(offset)
                .fetch()
                .map(this::mapToNotification);
    }

    @Override
    public int countUnread(String userId) {
        Integer count = dsl.selectCount()
                .from(DSL.table(TABLE))
                .where(DSL.field("user_id").eq(UUID.fromString(userId)))
                .and(DSL.field("is_read").eq(false))
                .fetchOne()
                .getValue(0, Integer.class);
        return count != null ? count : 0;
    }

    @Override
    public void markAsRead(String id) {
        dsl.update(DSL.table(TABLE))
                .set(DSL.field("is_read"), true)
                .where(DSL.field("id").eq(UUID.fromString(id)))
                .execute();
    }

    @Override
    public void markAllAsRead(String userId) {
        dsl.update(DSL.table(TABLE))
                .set(DSL.field("is_read"), true)
                .where(DSL.field("user_id").eq(UUID.fromString(userId)))
                .and(DSL.field("is_read").eq(false))
                .execute();
    }

    private Notification mapToNotification(org.jooq.Record record) {
        return Notification.builder()
                .id(record.get(DSL.field("id"), String.class))
                .userId(record.get(DSL.field("user_id"), String.class))
                .type(record.get(DSL.field("type"), String.class))
                .title(record.get(DSL.field("title"), String.class))
                .message(record.get(DSL.field("message"), String.class))
                .referenceId(record.get(DSL.field("reference_id"), String.class))
                .referenceType(record.get(DSL.field("reference_type"), String.class))
                .isRead(record.get(DSL.field("is_read"), Boolean.class))
                .createdAt(toLocalDateTime(record.get(DSL.field("created_at"))))
                .build();
    }

    private LocalDateTime toLocalDateTime(Object value) {
        if (value instanceof LocalDateTime) return (LocalDateTime) value;
        if (value instanceof Timestamp) return ((Timestamp) value).toLocalDateTime();
        return null;
    }
}
