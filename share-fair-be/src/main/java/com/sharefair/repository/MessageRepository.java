package com.sharefair.repository;

import com.sharefair.entity.Message;

import java.util.List;

public interface MessageRepository {
    Message save(Message message);
    List<Message> findByConversationId(String conversationId, int limit, int offset);
    void markConversationAsRead(String conversationId, String userId);
}
