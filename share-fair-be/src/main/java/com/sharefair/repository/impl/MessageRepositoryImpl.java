package com.sharefair.repository.impl;

import com.sharefair.entity.Message;
import com.sharefair.repository.MessageRepository;
import org.jooq.DSLContext;
import org.jooq.Record;
import org.jooq.impl.DSL;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public class MessageRepositoryImpl implements MessageRepository {

    private final DSLContext dsl;
    private static final String TABLE = "messages";

    private static final org.jooq.Field<?>[] FIELDS = {
            DSL.field("id"),
            DSL.field("conversation_id"),
            DSL.field("sender_id"),
            DSL.field("content"),
            DSL.field("is_read"),
            DSL.field("created_at")
    };

    public MessageRepositoryImpl(DSLContext dsl) {
        this.dsl = dsl;
    }

    @Override
    public Message save(Message m) {
        if (m.getId() == null) m.setId(UUID.randomUUID().toString());
        if (m.getCreatedAt() == null) m.setCreatedAt(LocalDateTime.now());

        dsl.insertInto(DSL.table(TABLE))
                .columns(FIELDS)
                .values(
                        UUID.fromString(m.getId()),
                        UUID.fromString(m.getConversationId()),
                        UUID.fromString(m.getSenderId()),
                        m.getContent(),
                        m.isRead(),
                        m.getCreatedAt()
                )
                .execute();
        return m;
    }

    @Override
    public List<Message> findByConversationId(String conversationId, int limit, int offset) {
        return dsl.select(FIELDS)
                .from(DSL.table(TABLE))
                .where(DSL.field("conversation_id").eq(UUID.fromString(conversationId)))
                .orderBy(DSL.field("created_at").desc())
                .limit(limit)
                .offset(offset)
                .fetch()
                .map(this::map);
    }

    @Override
    public void markConversationAsRead(String conversationId, String userId) {
        dsl.update(DSL.table(TABLE))
                .set(DSL.field("is_read"), true)
                .where(DSL.field("conversation_id").eq(UUID.fromString(conversationId))
                        .and(DSL.field("sender_id").ne(UUID.fromString(userId)))
                        .and(DSL.field("is_read").eq(false)))
                .execute();
    }

    private Message map(Record r) {
        return Message.builder()
                .id(r.get(DSL.field("id"), String.class))
                .conversationId(r.get(DSL.field("conversation_id"), String.class))
                .senderId(r.get(DSL.field("sender_id"), String.class))
                .content(r.get(DSL.field("content"), String.class))
                .isRead(Boolean.TRUE.equals(r.get(DSL.field("is_read"), Boolean.class)))
                .createdAt(JooqUtils.toLocalDateTime(r.get(DSL.field("created_at"))))
                .build();
    }
}
