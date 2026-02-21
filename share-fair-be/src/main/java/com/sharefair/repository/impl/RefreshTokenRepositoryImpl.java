package com.sharefair.repository.impl;

import com.sharefair.entity.RefreshToken;
import com.sharefair.repository.RefreshTokenRepository;
import org.jooq.DSLContext;
import org.jooq.impl.DSL;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Repository
public class RefreshTokenRepositoryImpl implements RefreshTokenRepository {

    private final DSLContext dsl;
    private static final String TABLE = "refresh_tokens";

    public RefreshTokenRepositoryImpl(DSLContext dsl) {
        this.dsl = dsl;
    }

    @Override
    public void save(RefreshToken token) {
        dsl.insertInto(DSL.table(TABLE))
                .columns(
                        DSL.field("id"),
                        DSL.field("user_id"),
                        DSL.field("token_hash"),
                        DSL.field("expires_at"),
                        DSL.field("revoked"),
                        DSL.field("created_at")
                )
                .values(
                        UUID.randomUUID(),
                        UUID.fromString(token.getUserId()),
                        token.getTokenHash(),
                        token.getExpiresAt(),
                        false,
                        LocalDateTime.now()
                )
                .execute();
    }

    @Override
    public Optional<RefreshToken> findByTokenHash(String tokenHash) {
        return dsl.selectFrom(DSL.table(TABLE))
                .where(DSL.field("token_hash").eq(tokenHash))
                .fetchOptional()
                .map(r -> RefreshToken.builder()
                        .id(r.get(DSL.field("id", UUID.class)).toString())
                        .userId(r.get(DSL.field("user_id", UUID.class)).toString())
                        .tokenHash(r.get(DSL.field("token_hash", String.class)))
                        .expiresAt(r.get(DSL.field("expires_at", LocalDateTime.class)))
                        .revoked(r.get(DSL.field("revoked", Boolean.class)))
                        .createdAt(r.get(DSL.field("created_at", LocalDateTime.class)))
                        .build());
    }

    @Override
    public void revoke(String tokenHash) {
        dsl.update(DSL.table(TABLE))
                .set(DSL.field("revoked"), true)
                .where(DSL.field("token_hash").eq(tokenHash))
                .execute();
    }

    @Override
    public void revokeAllForUser(String userId) {
        dsl.update(DSL.table(TABLE))
                .set(DSL.field("revoked"), true)
                .where(DSL.field("user_id").eq(UUID.fromString(userId))
                        .and(DSL.field("revoked").eq(false)))
                .execute();
    }

    @Override
    public void deleteExpired() {
        dsl.deleteFrom(DSL.table(TABLE))
                .where(DSL.field("expires_at").lt(LocalDateTime.now()))
                .execute();
    }
}
