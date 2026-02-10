package com.sharefair;

import com.sharefair.config.TestConfig;
import org.jooq.DSLContext;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.utility.DockerImageName;

import java.io.IOException;

@SpringBootTest
@ActiveProfiles("test")
@Import(TestConfig.class)
public abstract class BaseIntegrationTest {

    private static final DockerImageName POSTGIS_IMAGE =
            DockerImageName.parse("postgis/postgis:15-3.3")
                    .asCompatibleSubstituteFor("postgres");

    static PostgreSQLContainer<?> postgres;

    static {
        postgres = new PostgreSQLContainer<>(POSTGIS_IMAGE)
                .withDatabaseName("sharefair_test")
                .withUsername("test")
                .withPassword("test");
        postgres.start();

        // Install pgvector extension inside the running container
        try {
            postgres.execInContainer("sh", "-c",
                    "apt-get update && apt-get install -y --no-install-recommends postgresql-15-pgvector");
        } catch (IOException | InterruptedException e) {
            throw new RuntimeException("Failed to install pgvector in test container", e);
        }
    }

    @Autowired
    protected DSLContext dsl;

    @DynamicPropertySource
    static void configureProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
        registry.add("spring.ai.ollama.init.pull-model-strategy", () -> "never");
        registry.add("spring.ai.ollama.base-url", () -> "http://localhost:11434");
    }
}
