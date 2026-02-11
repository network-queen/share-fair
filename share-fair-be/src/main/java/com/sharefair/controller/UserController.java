package com.sharefair.controller;

import com.sharefair.dto.ApiResponse;
import com.sharefair.dto.ListingDto;
import com.sharefair.dto.UpdateUserRequest;
import com.sharefair.dto.UserDto;
import com.sharefair.security.UserPrincipal;
import com.sharefair.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/users")
@CrossOrigin(origins = "*")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<UserDto>> getUser(@PathVariable String id) {
        UserDto user = userService.getUserById(id);
        return ResponseEntity.ok(ApiResponse.success(user));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<UserDto>> updateUser(
            @PathVariable String id,
            @RequestBody UpdateUserRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        UserDto user = userService.updateUser(id, request, principal.getId());
        return ResponseEntity.ok(ApiResponse.success(user));
    }

    @GetMapping("/{id}/listings")
    public ResponseEntity<ApiResponse<List<ListingDto>>> getUserListings(@PathVariable String id) {
        List<ListingDto> listings = userService.getUserListings(id);
        return ResponseEntity.ok(ApiResponse.success(listings));
    }
}
