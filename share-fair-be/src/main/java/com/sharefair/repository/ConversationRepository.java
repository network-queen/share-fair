package com.sharefair.repository;

import com.sharefair.entity.Conversation;

import java.util.List;
import java.util.Optional;

public interface ConversationRepository {
    Conversation save(Conversation conversation);
    Optional<Conversation> findById(String id);
    Optional<Conversation> findBetweenUsers(String userId1, String userId2, String transactionId);
    List<Conversation> findByUserId(String userId);
    void updateLastMessage(String conversationId, String lastMessage);
    int countUnread(String conversationId, String userId);
}
