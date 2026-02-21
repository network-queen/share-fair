package com.sharefair.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SendMessageRequest {
    private String conversationId;
    private String receiverId;      // Used when starting a conversation
    private String content;
    private String transactionId;   // Optional: link to a transaction
}
