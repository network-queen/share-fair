package com.sharefair.repository.impl;

import com.sharefair.entity.NotificationPreference;
import com.sharefair.repository.NotificationPreferenceRepository;
import org.jooq.DSLContext;
import org.jooq.Record;
import org.jooq.impl.DSL;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Repository
public class NotificationPreferenceRepositoryImpl implements NotificationPreferenceRepository {
    private final DSLContext dsl;
    private static final String TABLE = "notification_preferences";

    public NotificationPreferenceRepositoryImpl(DSLContext dsl) {
        this.dsl = dsl;
    }

    @Override
    public Optional<NotificationPreference> findByUserId(String userId) {
        return dsl.select()
                .from(DSL.table(TABLE))
                .where(DSL.field("user_id").eq(UUID.fromString(userId)))
                .fetchOptional()
                .map(this::mapToPreference);
    }

    @Override
    public NotificationPreference save(NotificationPreference pref) {
        pref.setUpdatedAt(LocalDateTime.now());
        dsl.insertInto(DSL.table(TABLE))
                .columns(
                        DSL.field("user_id"),
                        DSL.field("email_transactions"),
                        DSL.field("email_reviews"),
                        DSL.field("email_marketing"),
                        DSL.field("in_app_transactions"),
                        DSL.field("in_app_reviews"),
                        DSL.field("updated_at")
                )
                .values(
                        UUID.fromString(pref.getUserId()),
                        pref.getEmailTransactions(),
                        pref.getEmailReviews(),
                        pref.getEmailMarketing(),
                        pref.getInAppTransactions(),
                        pref.getInAppReviews(),
                        pref.getUpdatedAt()
                )
                .execute();
        return pref;
    }

    @Override
    public NotificationPreference update(NotificationPreference pref) {
        pref.setUpdatedAt(LocalDateTime.now());
        dsl.update(DSL.table(TABLE))
                .set(DSL.field("email_transactions"), pref.getEmailTransactions())
                .set(DSL.field("email_reviews"), pref.getEmailReviews())
                .set(DSL.field("email_marketing"), pref.getEmailMarketing())
                .set(DSL.field("in_app_transactions"), pref.getInAppTransactions())
                .set(DSL.field("in_app_reviews"), pref.getInAppReviews())
                .set(DSL.field("updated_at"), pref.getUpdatedAt())
                .where(DSL.field("user_id").eq(UUID.fromString(pref.getUserId())))
                .execute();
        return pref;
    }

    private NotificationPreference mapToPreference(Record record) {
        return NotificationPreference.builder()
                .userId(record.get(DSL.field("user_id"), String.class))
                .emailTransactions(record.get(DSL.field("email_transactions"), Boolean.class))
                .emailReviews(record.get(DSL.field("email_reviews"), Boolean.class))
                .emailMarketing(record.get(DSL.field("email_marketing"), Boolean.class))
                .inAppTransactions(record.get(DSL.field("in_app_transactions"), Boolean.class))
                .inAppReviews(record.get(DSL.field("in_app_reviews"), Boolean.class))
                .updatedAt(record.get(DSL.field("updated_at"), LocalDateTime.class))
                .build();
    }
}
