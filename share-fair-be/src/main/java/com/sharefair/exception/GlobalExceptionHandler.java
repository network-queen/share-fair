package com.sharefair.exception;

import com.sharefair.dto.ApiResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;

import java.util.stream.Collectors;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<?> handleValidationException(
            MethodArgumentNotValidException ex,
            WebRequest request) {
        String message = ex.getBindingResult().getAllErrors().stream()
                .map(error -> error.getDefaultMessage())
                .collect(Collectors.joining(", "));

        return ResponseEntity.badRequest().body(
                ApiResponse.error("VALIDATION_ERROR", message)
        );
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<?> handleIllegalArgumentException(
            IllegalArgumentException ex,
            WebRequest request) {
        return ResponseEntity.badRequest().body(
                ApiResponse.error("BAD_REQUEST", ex.getMessage())
        );
    }

    @ExceptionHandler(OAuthException.class)
    public ResponseEntity<?> handleOAuthException(
            OAuthException ex,
            WebRequest request) {
        log.error("OAuth error: {}", ex.getMessage());
        return ResponseEntity.badRequest().body(
                ApiResponse.error("OAUTH_ERROR", ex.getMessage())
        );
    }

    @ExceptionHandler(InvalidTokenException.class)
    public ResponseEntity<?> handleInvalidTokenException(
            InvalidTokenException ex,
            WebRequest request) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(
                ApiResponse.error("INVALID_TOKEN", ex.getMessage())
        );
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<?> handleAccessDeniedException(
            AccessDeniedException ex,
            WebRequest request) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(
                ApiResponse.error("ACCESS_DENIED", "You do not have permission to access this resource")
        );
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<?> handleGlobalException(
            Exception ex,
            WebRequest request) {
        log.error("Unhandled exception occurred", ex);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                ApiResponse.error("INTERNAL_SERVER_ERROR", "An unexpected error occurred. Please try again later.")
        );
    }
}
