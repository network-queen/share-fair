package com.sharefair.repository.impl;

import com.sharefair.entity.Conversation;
import com.sharefair.repository.ConversationRepository;
import org.jooq.DSLContext;
import org.jooq.Record;
import org.jooq.impl.DSL;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public class ConversationRepositoryImpl implements ConversationRepository {

    private final DSLContext dsl;
    private static final String TABLE = "conversations";

    private static final org.jooq.Field<?>[] FIELDS = {
            DSL.field("id"),
            DSL.field("participant1_id"),
            DSL.field("participant2_id"),
            DSL.field("transaction_id"),
            DSL.field("last_message"),
            DSL.field("last_message_at"),
            DSL.field("created_at"),
            DSL.field("updated_at")
    };

    public ConversationRepositoryImpl(DSLContext dsl) {
        this.dsl = dsl;
    }

    @Override
    public Conversation save(Conversation c) {
        if (c.getId() == null) c.setId(UUID.randomUUID().toString());
        if (c.getCreatedAt() == null) c.setCreatedAt(LocalDateTime.now());
        if (c.getUpdatedAt() == null) c.setUpdatedAt(LocalDateTime.now());

        dsl.insertInto(DSL.table(TABLE))
                .columns(FIELDS)
                .values(
                        UUID.fromString(c.getId()),
                        UUID.fromString(c.getParticipant1Id()),
                        UUID.fromString(c.getParticipant2Id()),
                        c.getTransactionId() != null ? UUID.fromString(c.getTransactionId()) : null,
                        c.getLastMessage(),
                        c.getLastMessageAt(),
                        c.getCreatedAt(),
                        c.getUpdatedAt()
                )
                .execute();
        return c;
    }

    @Override
    public Optional<Conversation> findById(String id) {
        return dsl.select(FIELDS)
                .from(DSL.table(TABLE))
                .where(DSL.field("id").eq(UUID.fromString(id)))
                .fetchOptional()
                .map(this::map);
    }

    @Override
    public Optional<Conversation> findBetweenUsers(String userId1, String userId2, String transactionId) {
        UUID u1 = UUID.fromString(userId1);
        UUID u2 = UUID.fromString(userId2);

        var query = dsl.select(FIELDS)
                .from(DSL.table(TABLE))
                .where(
                        DSL.field("participant1_id").eq(u1).and(DSL.field("participant2_id").eq(u2))
                        .or(DSL.field("participant1_id").eq(u2).and(DSL.field("participant2_id").eq(u1)))
                );

        if (transactionId != null) {
            query = query.and(DSL.field("transaction_id").eq(UUID.fromString(transactionId)));
        }

        return query.orderBy(DSL.field("created_at").desc())
                .limit(1)
                .fetchOptional()
                .map(this::map);
    }

    @Override
    public List<Conversation> findByUserId(String userId) {
        UUID uid = UUID.fromString(userId);
        return dsl.select(FIELDS)
                .from(DSL.table(TABLE))
                .where(DSL.field("participant1_id").eq(uid).or(DSL.field("participant2_id").eq(uid)))
                .orderBy(DSL.field("updated_at").desc())
                .fetch()
                .map(this::map);
    }

    @Override
    public void updateLastMessage(String conversationId, String lastMessage) {
        dsl.update(DSL.table(TABLE))
                .set(DSL.field("last_message"), lastMessage)
                .set(DSL.field("last_message_at"), LocalDateTime.now())
                .set(DSL.field("updated_at"), LocalDateTime.now())
                .where(DSL.field("id").eq(UUID.fromString(conversationId)))
                .execute();
    }

    @Override
    public int countUnread(String conversationId, String userId) {
        return dsl.selectCount()
                .from(DSL.table("messages"))
                .where(DSL.field("conversation_id").eq(UUID.fromString(conversationId))
                        .and(DSL.field("sender_id").ne(UUID.fromString(userId)))
                        .and(DSL.field("is_read").eq(false)))
                .fetchOne(0, Integer.class);
    }

    private Conversation map(Record r) {
        return Conversation.builder()
                .id(r.get(DSL.field("id"), String.class))
                .participant1Id(r.get(DSL.field("participant1_id"), String.class))
                .participant2Id(r.get(DSL.field("participant2_id"), String.class))
                .transactionId(r.get(DSL.field("transaction_id"), String.class))
                .lastMessage(r.get(DSL.field("last_message"), String.class))
                .lastMessageAt(JooqUtils.toLocalDateTime(r.get(DSL.field("last_message_at"))))
                .createdAt(JooqUtils.toLocalDateTime(r.get(DSL.field("created_at"))))
                .updatedAt(JooqUtils.toLocalDateTime(r.get(DSL.field("updated_at"))))
                .build();
    }
}
