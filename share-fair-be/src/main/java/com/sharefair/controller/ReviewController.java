package com.sharefair.controller;

import com.sharefair.dto.ApiResponse;
import com.sharefair.dto.CreateReviewRequest;
import com.sharefair.dto.ReviewDto;
import com.sharefair.security.UserPrincipal;
import com.sharefair.service.ReviewService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/reviews")
public class ReviewController {

    private final ReviewService reviewService;

    public ReviewController(ReviewService reviewService) {
        this.reviewService = reviewService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ReviewDto>> createReview(
            @RequestBody CreateReviewRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        ReviewDto review = reviewService.createReview(request, principal.getId());
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(review));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<ApiResponse<List<ReviewDto>>> getUserReviews(@PathVariable String userId) {
        List<ReviewDto> reviews = reviewService.getReviewsForUser(userId);
        return ResponseEntity.ok(ApiResponse.success(reviews));
    }

    @GetMapping("/by-user/{userId}")
    public ResponseEntity<ApiResponse<List<ReviewDto>>> getReviewsByUser(@PathVariable String userId) {
        List<ReviewDto> reviews = reviewService.getReviewsByUser(userId);
        return ResponseEntity.ok(ApiResponse.success(reviews));
    }

    @GetMapping("/transaction/{transactionId}/check")
    public ResponseEntity<ApiResponse<ReviewDto>> checkReviewForTransaction(
            @PathVariable String transactionId,
            @AuthenticationPrincipal UserPrincipal principal) {
        return reviewService.getReviewForTransaction(transactionId, principal.getId())
                .map(review -> ResponseEntity.ok(ApiResponse.success(review)))
                .orElseGet(() -> ResponseEntity.ok(ApiResponse.success((ReviewDto) null)));
    }
}
