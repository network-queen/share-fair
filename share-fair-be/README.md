# Sharefair API Backend

Spring Boot REST API for the Sharefair Circular Economy Marketplace.

## Tech Stack

- **Java 17** - Latest LTS version
- **Spring Boot 3.2** - Modern Spring framework
- **PostgreSQL** - Relational database
- **JOOQ** - Type-safe SQL queries
- **Flyway** - Database migrations
- **JWT** - Authentication tokens
- **Spring Security** - Authorization

## Prerequisites

- Java 17 or higher
- Maven 3.8+
- PostgreSQL 13+ (or use Docker)
- Git

## Setup

### 1. Create PostgreSQL Database

```bash
# Create database and user
createdb sharefair_db
createuser sharefair_user
psql -d sharefair_db -c "ALTER USER sharefair_user WITH PASSWORD 'sharefair_password';"
psql -d sharefair_db -c "GRANT ALL PRIVILEGES ON DATABASE sharefair_db TO sharefair_user;"
```

Or using Docker:

```bash
docker run --name sharefair-postgres \
  -e POSTGRES_USER=sharefair_user \
  -e POSTGRES_PASSWORD=sharefair_password \
  -e POSTGRES_DB=sharefair_db \
  -p 5432:5432 \
  -d postgres:15-alpine
```

### 2. Build & Run

```bash
# Build the application
mvn clean package

# Run the application
mvn spring-boot:run

# Or run the JAR
java -jar target/sharefair-api-0.1.0.jar
```

The API will be available at `http://localhost:8080`

## API Endpoints

### Authentication
- `POST /api/v1/auth/oauth/callback` - OAuth callback handler
- `GET /api/v1/auth/me` - Get current user
- `POST /api/v1/auth/logout` - Logout

### Listings
- `GET /api/v1/listings` - Get all listings (paginated)
- `GET /api/v1/listings/{id}` - Get listing by ID
- `POST /api/v1/listings` - Create listing (protected)
- `PUT /api/v1/listings/{id}` - Update listing (protected)
- `DELETE /api/v1/listings/{id}` - Delete listing (protected)

### Search
- `GET /api/v1/search` - Search listings with filters
- `GET /api/v1/search/location` - Search by geolocation
- `GET /api/v1/search/neighborhoods` - Get all neighborhoods
- `GET /api/v1/search/categories` - Get all categories
- `GET /api/v1/search/autocomplete` - Search autocomplete

## Project Structure

```
src/
├── main/
│   ├── java/com/sharefair/
│   │   ├── controller/       # REST endpoints
│   │   ├── service/          # Business logic
│   │   ├── repository/       # Data access (JOOQ)
│   │   ├── entity/           # Domain models
│   │   ├── dto/              # Data transfer objects
│   │   ├── security/         # Security filters & utilities
│   │   ├── config/           # Spring configurations
│   │   ├── exception/        # Exception handlers
│   │   └── SharefairApplication.java
│   └── resources/
│       ├── application.yml   # Spring configuration
│       └── db/migration/     # Flyway migrations
└── test/
    └── java/com/sharefair/   # Unit & integration tests
```

## Database Schema

The database is automatically initialized using Flyway migrations on startup. Key tables:

- **users** - User profiles with OAuth integration
- **listings** - Item/service listings with geolocation
- **transactions** - Rental/borrowing transactions
- **reviews** - User reviews and ratings
- **trust_scores** - User trust metrics
- **carbon_saved** - Carbon impact tracking
- **neighborhoods** - Neighborhood boundaries
- **service_fees** - Configurable transaction fees

## Configuration

### Environment Variables

```bash
# Database
DB_URL=jdbc:postgresql://localhost:5432/sharefair_db
DB_USER=sharefair_user
DB_PASSWORD=sharefair_password

# JWT
JWT_SECRET=your-secret-key-change-in-production

# OAuth (Add in future)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

### application.yml

Update `src/main/resources/application.yml` for different environments:

```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/sharefair_db
    username: sharefair_user
    password: sharefair_password
```

## Development

### Build
```bash
mvn clean compile
```

### Run Tests
```bash
mvn test
```

### Run with Hot Reload
```bash
mvn spring-boot:run
```

### Generate JOOQ Code (Optional)
```bash
mvn jooq-codegen:generate
```

## Integration with Frontend

The frontend connects to this backend at `http://localhost:8080/api/v1`.

Frontend API configuration in `.env`:

```
VITE_API_BASE_URL=http://localhost:8080/api/v1
```

## Common Tasks

### Add a New Endpoint
1. Create DTO in `dto/`
2. Create entity in `entity/`
3. Create controller in `controller/`
4. Create service in `service/` (if needed)
5. Create repository in `repository/` (if needed)

### Add Database Migration
1. Create new migration file in `src/main/resources/db/migration/V{N}__Description.sql`
2. Flyway will automatically run it on next startup

### Database Troubleshooting

```bash
# Connect to database
psql -h localhost -U sharefair_user -d sharefair_db

# View Flyway history
SELECT * FROM flyway_schema_history;

# Repair migrations (if needed)
mvn flyway:repair
```

## Future Enhancements

- [ ] OAuth2 provider integration (Google, Facebook, GitHub)
- [ ] JWT token generation and validation
- [ ] JOOQ repository implementation
- [ ] Service layer business logic
- [ ] Unit & integration tests
- [ ] API documentation (Swagger/OpenAPI)
- [ ] Rate limiting
- [ ] Request logging
- [ ] Stripe payment integration
- [ ] Elasticsearch for advanced search
- [ ] WebSocket for real-time notifications

## License

Proprietary - Sharefair
