package com.sharefair.service;

import com.sharefair.dto.ConversationDto;
import com.sharefair.dto.MessageDto;
import com.sharefair.entity.Conversation;
import com.sharefair.entity.Message;
import com.sharefair.exception.ResourceNotFoundException;
import com.sharefair.repository.ConversationRepository;
import com.sharefair.repository.MessageRepository;
import com.sharefair.repository.UserRepository;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class MessageService {

    private final ConversationRepository conversationRepository;
    private final MessageRepository messageRepository;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;

    public MessageService(ConversationRepository conversationRepository,
                          MessageRepository messageRepository,
                          UserRepository userRepository,
                          SimpMessagingTemplate messagingTemplate) {
        this.conversationRepository = conversationRepository;
        this.messageRepository = messageRepository;
        this.userRepository = userRepository;
        this.messagingTemplate = messagingTemplate;
    }

    public ConversationDto getOrCreateConversation(String currentUserId, String otherUserId, String transactionId) {
        userRepository.findById(otherUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + otherUserId));

        Conversation conversation = conversationRepository
                .findBetweenUsers(currentUserId, otherUserId, transactionId)
                .orElseGet(() -> {
                    Conversation c = Conversation.builder()
                            .participant1Id(currentUserId)
                            .participant2Id(otherUserId)
                            .transactionId(transactionId)
                            .build();
                    return conversationRepository.save(c);
                });

        return toDto(conversation, currentUserId);
    }

    public List<ConversationDto> getConversations(String userId) {
        return conversationRepository.findByUserId(userId).stream()
                .map(c -> toDto(c, userId))
                .collect(Collectors.toList());
    }

    public List<MessageDto> getMessages(String conversationId, String userId, int limit, int offset) {
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new ResourceNotFoundException("Conversation not found"));

        assertParticipant(conversation, userId);

        List<Message> messages = messageRepository.findByConversationId(conversationId, limit, offset);
        // Mark messages as read
        messageRepository.markConversationAsRead(conversationId, userId);

        return messages.stream().map(this::toMessageDto).collect(Collectors.toList());
    }

    public MessageDto sendMessage(String conversationId, String senderId, String content) {
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new ResourceNotFoundException("Conversation not found"));

        assertParticipant(conversation, senderId);

        Message message = Message.builder()
                .conversationId(conversationId)
                .senderId(senderId)
                .content(content)
                .isRead(false)
                .build();

        message = messageRepository.save(message);
        conversationRepository.updateLastMessage(conversationId, content);

        MessageDto dto = toMessageDto(message);

        // Push to both participants in real-time
        String receiverId = conversation.getParticipant1Id().equals(senderId)
                ? conversation.getParticipant2Id()
                : conversation.getParticipant1Id();

        messagingTemplate.convertAndSendToUser(receiverId, "/queue/chat", dto);
        messagingTemplate.convertAndSendToUser(senderId, "/queue/chat", dto);

        return dto;
    }

    private void assertParticipant(Conversation conversation, String userId) {
        boolean isParticipant = conversation.getParticipant1Id().equals(userId)
                || conversation.getParticipant2Id().equals(userId);
        if (!isParticipant) {
            throw new AccessDeniedException("You are not a participant in this conversation");
        }
    }

    private ConversationDto toDto(Conversation c, String currentUserId) {
        String otherUserId = c.getParticipant1Id().equals(currentUserId)
                ? c.getParticipant2Id()
                : c.getParticipant1Id();

        String otherUserName = userRepository.findById(otherUserId)
                .map(u -> u.getName()).orElse("Unknown");
        String otherUserAvatar = userRepository.findById(otherUserId)
                .map(u -> u.getAvatar()).orElse(null);

        int unread = conversationRepository.countUnread(c.getId(), currentUserId);

        return ConversationDto.builder()
                .id(c.getId())
                .otherUserId(otherUserId)
                .otherUserName(otherUserName)
                .otherUserAvatar(otherUserAvatar)
                .transactionId(c.getTransactionId())
                .lastMessage(c.getLastMessage())
                .lastMessageAt(c.getLastMessageAt())
                .unreadCount(unread)
                .createdAt(c.getCreatedAt())
                .build();
    }

    private MessageDto toMessageDto(Message m) {
        String senderName = userRepository.findById(m.getSenderId())
                .map(u -> u.getName()).orElse("Unknown");

        return MessageDto.builder()
                .id(m.getId())
                .conversationId(m.getConversationId())
                .senderId(m.getSenderId())
                .senderName(senderName)
                .content(m.getContent())
                .isRead(m.isRead())
                .createdAt(m.getCreatedAt())
                .build();
    }
}
