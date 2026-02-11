package com.sharefair.service;

import com.sharefair.dto.ListingDto;
import com.sharefair.dto.UpdateUserRequest;
import com.sharefair.dto.UserDto;
import com.sharefair.entity.Listing;
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
        return toDto(user);
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

        User updated = userRepository.update(user);
        return toDto(updated);
    }

    public List<ListingDto> getUserListings(String userId) {
        userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        return listingRepository.findByOwnerId(userId).stream()
                .map(this::toListingDto)
                .collect(Collectors.toList());
    }

    private UserDto toDto(User user) {
        return UserDto.builder()
                .id(user.getId())
                .email(user.getEmail())
                .name(user.getName())
                .avatar(user.getAvatar())
                .neighborhood(user.getNeighborhood())
                .trustScore(user.getTrustScore())
                .carbonSaved(user.getCarbonSaved())
                .createdAt(user.getCreatedAt())
                .verificationStatus(user.getVerificationStatus())
                .build();
    }

    private ListingDto toListingDto(Listing listing) {
        ListingDto dto = new ListingDto();
        dto.setId(listing.getId());
        dto.setTitle(listing.getTitle());
        dto.setDescription(listing.getDescription());
        dto.setCategory(listing.getCategory());
        dto.setCondition(listing.getCondition());
        dto.setOwnerId(listing.getOwnerId());
        dto.setPrice(listing.getPrice());
        dto.setPricePerDay(listing.getPricePerDay());
        dto.setImages(listing.getImages());
        dto.setLatitude(listing.getLatitude());
        dto.setLongitude(listing.getLongitude());
        dto.setNeighborhood(listing.getNeighborhood());
        dto.setAvailable(listing.getAvailable());
        dto.setCreatedAt(listing.getCreatedAt());
        dto.setUpdatedAt(listing.getUpdatedAt());
        return dto;
    }
}
