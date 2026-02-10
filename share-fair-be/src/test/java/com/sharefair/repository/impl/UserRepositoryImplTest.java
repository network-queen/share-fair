package com.sharefair.repository.impl;

import com.sharefair.BaseIntegrationTest;
import com.sharefair.entity.User;
import com.sharefair.repository.UserRepository;
import org.jooq.impl.DSL;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

class UserRepositoryImplTest extends BaseIntegrationTest {

    @Autowired
    private UserRepository userRepository;

    // Seed data user IDs from V2 migration
    private static final String ALICE_ID = "550e8400-e29b-41d4-a716-446655440001";
    private static final String BOB_ID = "550e8400-e29b-41d4-a716-446655440002";
    private static final String CHARLIE_ID = "550e8400-e29b-41d4-a716-446655440003";
    private static final String DIANA_ID = "550e8400-e29b-41d4-a716-446655440004";
    private static final String EVE_ID = "550e8400-e29b-41d4-a716-446655440005";

    private static final List<String> SEED_EMAILS = List.of(
            "alice@example.com", "bob@example.com", "charlie@example.com",
            "diana@example.com", "eve@example.com"
    );

    @BeforeEach
    void cleanUp() {
        // Delete listings first due to foreign key constraint (owner_id -> users.id)
        dsl.deleteFrom(DSL.table("listings"))
                .where(DSL.field("owner_id").notIn(
                        SEED_EMAILS.stream().map(email ->
                                dsl.select(DSL.field("id")).from(DSL.table("users"))
                                        .where(DSL.field("email").eq(email))
                        ).toList()
                ))
                .execute();
        // Delete non-seed users
        dsl.deleteFrom(DSL.table("users"))
                .where(DSL.field("email").notIn(SEED_EMAILS))
                .execute();
    }

    @Test
    void save_createsNewUserWithGeneratedIdAndTimestamps() {
        User user = User.builder()
                .email("testuser@example.com")
                .name("Test User")
                .neighborhood("Brooklyn")
                .trustScore(0)
                .carbonSaved(0)
                .verificationStatus("UNVERIFIED")
                .build();

        User saved = userRepository.save(user);

        assertThat(saved.getId()).isNotNull();
        assertThat(saved.getCreatedAt()).isNotNull();
        assertThat(saved.getUpdatedAt()).isNotNull();
        assertThat(saved.getEmail()).isEqualTo("testuser@example.com");
        assertThat(saved.getName()).isEqualTo("Test User");
        assertThat(saved.getNeighborhood()).isEqualTo("Brooklyn");
    }

    @Test
    void findById_returnsUserWhenExists() {
        Optional<User> user = userRepository.findById(ALICE_ID);

        assertThat(user).isPresent();
        assertThat(user.get().getEmail()).isEqualTo("alice@example.com");
        assertThat(user.get().getName()).isEqualTo("Alice Johnson");
        assertThat(user.get().getNeighborhood()).isEqualTo("Brooklyn");
    }

    @Test
    void findById_returnsEmptyWhenNotExists() {
        Optional<User> user = userRepository.findById("00000000-0000-0000-0000-000000000000");

        assertThat(user).isEmpty();
    }

    @Test
    void findByEmail_returnsUserWhenExists() {
        Optional<User> user = userRepository.findByEmail("alice@example.com");

        assertThat(user).isPresent();
        assertThat(user.get().getId()).isEqualTo(ALICE_ID);
        assertThat(user.get().getName()).isEqualTo("Alice Johnson");
    }

    @Test
    void findAll_returnsAllUsers() {
        List<User> users = userRepository.findAll();

        assertThat(users).hasSizeGreaterThanOrEqualTo(5);
        assertThat(users).extracting(User::getEmail)
                .containsAll(SEED_EMAILS);
    }

    @Test
    void findByNeighborhood_returnsMatchingUsers() {
        List<User> brooklynUsers = userRepository.findByNeighborhood("Brooklyn");

        assertThat(brooklynUsers).isNotEmpty();
        assertThat(brooklynUsers).allSatisfy(user ->
                assertThat(user.getNeighborhood()).isEqualTo("Brooklyn")
        );
        assertThat(brooklynUsers).extracting(User::getEmail)
                .contains("alice@example.com");
    }

    @Test
    void delete_removesUser() {
        User user = User.builder()
                .email("deleteme@example.com")
                .name("Delete Me")
                .neighborhood("Manhattan")
                .trustScore(0)
                .carbonSaved(0)
                .verificationStatus("UNVERIFIED")
                .build();
        User saved = userRepository.save(user);

        userRepository.delete(saved.getId());

        Optional<User> found = userRepository.findById(saved.getId());
        assertThat(found).isEmpty();
    }

    @Test
    void count_returnsCorrectCount() {
        long count = userRepository.count();

        assertThat(count).isGreaterThanOrEqualTo(5);
    }
}
