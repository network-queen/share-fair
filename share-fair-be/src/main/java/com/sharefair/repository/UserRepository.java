package com.sharefair.repository;

import com.sharefair.entity.User;
import java.util.List;
import java.util.Optional;

public interface UserRepository {
    User save(User user);
    Optional<User> findById(String id);
    Optional<User> findByEmail(String email);
    List<User> findAll();
    List<User> findByNeighborhood(String neighborhood);
    void delete(String id);
    long count();
}
