package com.sharefair.repository.impl;

import com.sharefair.entity.User;
import com.sharefair.repository.UserRepository;
import org.jooq.DSLContext;
import org.jooq.impl.DSL;
import org.springframework.stereotype.Repository;
import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public class UserRepositoryImpl implements UserRepository {
    private final DSLContext dsl;
    private static final String TABLE = "users";

    private static final org.jooq.Field<?>[] USER_FIELDS = {
            DSL.field("id"),
            DSL.field("email"),
            DSL.field("name"),
            DSL.field("avatar"),
            DSL.field("neighborhood"),
            DSL.field("trust_score"),
            DSL.field("carbon_saved"),
            DSL.field("verification_status"),
            DSL.field("oauth_provider"),
            DSL.field("oauth_id"),
            DSL.field("created_at"),
            DSL.field("updated_at")
    };

    public UserRepositoryImpl(DSLContext dsl) {
        this.dsl = dsl;
    }

    @Override
    public User save(User user) {
        if (user.getId() == null) {
            user.setId(UUID.randomUUID().toString());
            user.setCreatedAt(LocalDateTime.now());
        }
        user.setUpdatedAt(LocalDateTime.now());

        dsl.insertInto(DSL.table(TABLE))
                .columns(USER_FIELDS)
                .values(
                        UUID.fromString(user.getId()),
                        user.getEmail(),
                        user.getName(),
                        user.getAvatar(),
                        user.getNeighborhood(),
                        user.getTrustScore(),
                        user.getCarbonSaved(),
                        user.getVerificationStatus(),
                        user.getOauthProvider(),
                        user.getOauthId(),
                        user.getCreatedAt(),
                        user.getUpdatedAt()
                )
                .onDuplicateKeyIgnore()
                .execute();

        return user;
    }

    @Override
    public Optional<User> findById(String id) {
        return dsl.select(USER_FIELDS)
                .from(DSL.table(TABLE))
                .where(DSL.field("id").eq(UUID.fromString(id)))
                .fetchOptional()
                .map(this::mapToUser);
    }

    @Override
    public Optional<User> findByEmail(String email) {
        return dsl.select(USER_FIELDS)
                .from(DSL.table(TABLE))
                .where(DSL.field("email").eq(email))
                .fetchOptional()
                .map(this::mapToUser);
    }

    @Override
    public List<User> findAll() {
        return dsl.select(USER_FIELDS)
                .from(DSL.table(TABLE))
                .fetch()
                .map(this::mapToUser);
    }

    @Override
    public List<User> findByNeighborhood(String neighborhood) {
        return dsl.select(USER_FIELDS)
                .from(DSL.table(TABLE))
                .where(DSL.field("neighborhood").eq(neighborhood))
                .fetch()
                .map(this::mapToUser);
    }

    @Override
    public Optional<User> findByOauthProviderAndOauthId(String provider, String oauthId) {
        return dsl.select(USER_FIELDS)
                .from(DSL.table(TABLE))
                .where(DSL.field("oauth_provider").eq(provider))
                .and(DSL.field("oauth_id").eq(oauthId))
                .fetchOptional()
                .map(this::mapToUser);
    }

    @Override
    public User update(User user) {
        user.setUpdatedAt(LocalDateTime.now());
        dsl.update(DSL.table(TABLE))
                .set(DSL.field("name"), user.getName())
                .set(DSL.field("avatar"), user.getAvatar())
                .set(DSL.field("neighborhood"), user.getNeighborhood())
                .set(DSL.field("updated_at"), user.getUpdatedAt())
                .where(DSL.field("id").eq(UUID.fromString(user.getId())))
                .execute();
        return user;
    }

    @Override
    public void delete(String id) {
        dsl.deleteFrom(DSL.table(TABLE))
                .where(DSL.field("id").eq(UUID.fromString(id)))
                .execute();
    }

    @Override
    public long count() {
        Integer count = dsl.selectCount()
                .from(DSL.table(TABLE))
                .fetchOne()
                .getValue(0, Integer.class);
        return count != null ? count : 0L;
    }

    private User mapToUser(org.jooq.Record record) {
        return User.builder()
                .id(record.get(DSL.field("id"), String.class))
                .email(record.get(DSL.field("email"), String.class))
                .name(record.get(DSL.field("name"), String.class))
                .avatar(record.get(DSL.field("avatar"), String.class))
                .neighborhood(record.get(DSL.field("neighborhood"), String.class))
                .trustScore(record.get(DSL.field("trust_score"), Integer.class))
                .carbonSaved(record.get(DSL.field("carbon_saved"), Integer.class))
                .verificationStatus(record.get(DSL.field("verification_status"), String.class))
                .oauthProvider(record.get(DSL.field("oauth_provider"), String.class))
                .oauthId(record.get(DSL.field("oauth_id"), String.class))
                .createdAt(toLocalDateTime(record.get(DSL.field("created_at"))))
                .updatedAt(toLocalDateTime(record.get(DSL.field("updated_at"))))
                .build();
    }

    private LocalDateTime toLocalDateTime(Object value) {
        if (value == null) {
            return null;
        }
        if (value instanceof LocalDateTime) {
            return (LocalDateTime) value;
        }
        if (value instanceof Timestamp) {
            return ((Timestamp) value).toLocalDateTime();
        }
        return null;
    }
}
