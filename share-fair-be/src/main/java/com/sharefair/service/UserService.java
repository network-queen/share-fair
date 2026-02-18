package com.sharefair.service;

import com.sharefair.dto.ListingDto;
import com.sharefair.dto.ListingMapper;
import com.sharefair.dto.UpdateUserRequest;
import com.sharefair.dto.UserDto;
import com.sharefair.dto.UserMapper;
import com.sharefair.entity.User;
import com.sharefair.exception.ResourceNotFoundException;
import com.sharefair.repository.ListingRepository;
import com.sharefair.repository.UserRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final ListingRepository listingRepository;

    public UserService(UserRepository userRepository, ListingRepository listingRepository) {
        this.userRepository = userRepository;
        this.listingRepository = listingRepository;
    }

    public UserDto getUserById(String id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return UserMapper.toDto(user);
    }

    public UserDto updateUser(String id, UpdateUserRequest request, String principalId) {
        if (!id.equals(principalId)) {
            throw new AccessDeniedException("You can only edit your own profile");
        }

        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (request.getName() != null && !request.getName().isBlank()) {
            user.setName(request.getName());
        }
        if (request.getNeighborhood() != null && !request.getNeighborhood().isBlank()) {
            user.setNeighborhood(request.getNeighborhood());
        }
        if (request.getAvatar() != null) {
            user.setAvatar(request.getAvatar().isBlank() ? null : request.getAvatar());
        }

        User updated = userRepository.update(user);
        return UserMapper.toDto(updated);
    }

    public List<ListingDto> getUserListings(String userId) {
        userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        return listingRepository.findByOwnerId(userId).stream()
                .map(ListingMapper::toDto)
                .collect(Collectors.toList());
    }
}
