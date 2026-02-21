package com.sharefair.controller;

import com.sharefair.dto.ApiResponse;
import com.sharefair.dto.ConversationDto;
import com.sharefair.dto.MessageDto;
import com.sharefair.dto.SendMessageRequest;
import com.sharefair.dto.StartConversationRequest;
import com.sharefair.security.UserPrincipal;
import com.sharefair.service.MessageService;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@Controller
@RequestMapping("/api/v1/messages")
public class MessageController {

    private final MessageService messageService;

    public MessageController(MessageService messageService) {
        this.messageService = messageService;
    }

    @GetMapping("/conversations")
    @ResponseBody
    public ResponseEntity<ApiResponse<List<ConversationDto>>> getConversations(
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.success(messageService.getConversations(principal.getId())));
    }

    @PostMapping("/conversations")
    @ResponseBody
    public ResponseEntity<ApiResponse<ConversationDto>> startConversation(
            @RequestBody StartConversationRequest req,
            @AuthenticationPrincipal UserPrincipal principal) {
        ConversationDto conversation = messageService.getOrCreateConversation(
                principal.getId(), req.getReceiverId(), req.getTransactionId());
        return ResponseEntity.ok(ApiResponse.success(conversation));
    }

    @GetMapping("/conversations/{conversationId}")
    @ResponseBody
    public ResponseEntity<ApiResponse<List<MessageDto>>> getMessages(
            @PathVariable String conversationId,
            @RequestParam(defaultValue = "50") int limit,
            @RequestParam(defaultValue = "0") int offset,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.success(
                messageService.getMessages(conversationId, principal.getId(), limit, offset)));
    }

    @PostMapping("/conversations/{conversationId}")
    @ResponseBody
    public ResponseEntity<ApiResponse<MessageDto>> sendMessageRest(
            @PathVariable String conversationId,
            @RequestBody SendMessageRequest req,
            @AuthenticationPrincipal UserPrincipal principal) {
        MessageDto msg = messageService.sendMessage(conversationId, principal.getId(), req.getContent());
        return ResponseEntity.ok(ApiResponse.success(msg));
    }

    // WebSocket endpoint: client publishes to /app/chat.send
    @MessageMapping("/chat.send")
    public void sendMessageWs(SendMessageRequest req, Principal principal) {
        if (req.getConversationId() == null || req.getContent() == null || principal == null) return;
        messageService.sendMessage(req.getConversationId(), principal.getName(), req.getContent());
    }
}
