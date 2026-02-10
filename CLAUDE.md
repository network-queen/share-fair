# Share Fair - Circular Economy Marketplace

## Project Overview

**Share Fair** is an ambitious Circular Economy Marketplace platform designed to connect people who want to rent, borrow, and share items within their local communities. The platform emphasizes sustainability, trust, and scalability.

**Mission**: Enable communities to reduce consumption through peer-to-peer sharing while tracking environmental impact and building neighborhood trust.

---

## Core Features

### MVP Feature Set (All Implemented in V1)

1. **Geolocation-Based Search**
   - Find available items/services within specified radius
   - Display items sorted by proximity
   - Map integration for visual browsing

2. **Relevance-Based Search**
   - Full-text search on item titles, descriptions, categories
   - Filtering by category, condition, availability
   - Sorting by relevance, date, price, distance

3. **Neighborhood Trust Score**
   - Reputation system based on completed transactions
   - Verified user badges (email verified, phone verified, identity verified)
   - Review/rating system (5-star with comments)
   - Trust level tiers (Bronze, Silver, Gold, Platinum)

4. **Carbon Saved Tracker**
   - Calculate carbon savings based on item reuse vs. new purchase
   - Leaderboard of top contributors
   - User profile carbon impact metrics
   - Community-wide carbon savings dashboard

5. **Configurable Service Fee**
   - Percentage-based transaction fee (configurable by admin)
   - Fee calculated and collected at transaction completion
   - Payment processing via Stripe (webhooks for status updates)

6. **Localization**
   - Initial languages: English (US), Ukrainian
   - Future: Support for additional languages
   - Locale-specific pricing and content

7. **OAuth Authentication**
   - OAuth 2.0 social login (Google, Facebook, GitHub)
   - User verification through OAuth provider
   - No manual verification required (fully automated)
   - Optional two-factor authentication enhancement

---

## Technology Stack

### Backend
- **Language**: Java 17+
- **Framework**: Spring Boot 3.x
- **Database Access**: JOOQ (for type-safe SQL)
- **Build Tool**: Maven
- **Database**: PostgreSQL 13+
- **API**: RESTful (JSON)
- **Authentication**: OAuth 2.0 with Spring Security

### Frontend
- **Framework**: React 18+ with TypeScript
- **State Management**: Redux Toolkit or Context API
- **Styling**: Tailwind CSS or styled-components
- **Maps**: Leaflet or Google Maps API
- **Build Tool**: Vite or Create React App
- **Package Manager**: npm or yarn

### Infrastructure & DevOps
- **Containerization**: Docker
- **Orchestration**: Docker Compose (development), Kubernetes (production-ready)
- **CI/CD**: GitHub Actions / GitLab CI
- **Logging**: SLF4J + Logback
- **Monitoring**: Prometheus + Grafana (future)
- **Caching**: Redis (for geolocation queries optimization)

---

## Microservices Architecture

### Service Breakdown

```
┌─────────────────────────────────────────────────────────┐
│           API Gateway / Load Balancer                    │
└────┬────────────────┬──────────────┬───────────────┬─────┘
     │                │              │               │
┌────▼──────┐  ┌──────▼───┐  ┌──────▼──────┐  ┌─────▼──────┐
│ Auth      │  │ Listing  │  │ Transaction │  │ User       │
│ Service   │  │ Service  │  │ Service     │  │ Service    │
└───────────┘  └──────────┘  └─────────────┘  └────────────┘
                    │
     ┌──────────────┴──────────────┐
┌────▼──────────┐         ┌────────▼──────┐
│ Search        │         │ Notification  │
│ Service       │         │ Service       │
└───────────────┘         └───────────────┘

Shared Services:
- PostgreSQL (Single Shared Instance)
- Redis Cache
- File Storage (AWS S3 / similar)
```

### Microservice Descriptions

**1. Auth Service**
- OAuth 2.0 provider integration (Google, Facebook)
- JWT token generation and validation
- User registration and password management
- Two-factor authentication
- Exposed on: `/api/v1/auth/*`

**2. User Service**
- User profile management
- Neighborhood Trust Score calculation and updates
- User preferences and settings
- Localization preferences
- Exposed on: `/api/v1/users/*`

**3. Listing Service**
- CRUD operations for item listings
- Category management
- Listing status (active, archived, completed)
- Images/media storage orchestration
- Exposed on: `/api/v1/listings/*`

**4. Search Service**
- Geolocation-based search queries
- Full-text search indexing (Elasticsearch optional for future)
- Relevance scoring algorithm
- Filtering and sorting
- Exposed on: `/api/v1/search/*`

**5. Transaction Service**
- Booking/rental creation and management
- Transaction lifecycle (pending, active, completed, disputed)
- Service fee calculation
- Payment processing coordination
- Carbon calculation triggers
- Exposed on: `/api/v1/transactions/*`

**6. Notification Service**
- Email notifications
- SMS notifications (future)
- In-app notifications
- Notification preferences
- Exposed on: `/api/v1/notifications/*` (internal only)

---

## Data Model (PostgreSQL Schema Overview)

### Core Tables

- **users** - User profiles, OAuth details, preferences, neighborhood
- **listings** - Item/service listings with geolocation data (lat/long)
- **transactions** - Rental/borrowing transactions
- **reviews** - User reviews and ratings
- **trust_scores** - Calculated trust metrics per user
- **carbon_saved** - Carbon impact records per transaction
- **service_fees** - Transaction fee configuration
- **notifications** - User notifications
- **neighborhoods** - Neighborhood definitions (city/district boundaries)
- **stripe_customers** - Stripe customer mapping for payment processing

---

## Key Technical Decisions

### Database Strategy
- **Shared PostgreSQL Instance** for all microservices
- Separate schemas per service for logical isolation
- Foreign key constraints managed at application layer
- Provides transactional consistency for MVP phase

### Communication
- **REST API** for synchronous inter-service communication
- **Shared database** enables direct queries where appropriate
- Future consideration: Event-driven architecture (Kafka/RabbitMQ) for decoupling

### Geolocation & Neighborhood Search
- PostgreSQL `PostGIS` extension for geographic queries
- Neighborhood boundaries stored as GeoJSON polygons
- Primary search: Neighborhood-level (district/city portion)
- Secondary search: Radius-based within neighborhood (1-10 km)
- Haversine formula for distance calculations
- Spatial indexes on (latitude, longitude) for performance
- Redis caching for frequently accessed neighborhoods
- Future: Neighborhood hierarchy expansion to larger regions

### Authentication & Security
- OAuth 2.0 via Spring Security OAuth2 client
- JWT tokens for API authentication (short-lived access tokens, refresh tokens)
- HTTPS enforced
- CORS properly configured
- Rate limiting on public endpoints
- Input validation and sanitization

---

## Development Guidelines

### Code Organization

```
share-fair/
├── backend/
│   ├── auth-service/
│   ├── user-service/
│   ├── listing-service/
│   ├── search-service/
│   ├── transaction-service/
│   ├── notification-service/
│   └── shared-lib/
├── frontend/
│   ├── public/
│   ├── src/
│   ├── tests/
│   └── package.json
├── docker-compose.yml
├── kubernetes/
└── docs/
```

### Backend Patterns

1. **Layered Architecture** per service:
   - `controller/` - REST endpoints
   - `service/` - Business logic
   - `repository/` - Data access (JOOQ)
   - `entity/` - Domain models
   - `dto/` - Data transfer objects
   - `exception/` - Custom exceptions
   - `config/` - Spring configuration

2. **JOOQ Usage**:
   - Type-safe SQL queries
   - Code generation from schema
   - Fluent API for query building
   - No runtime SQL string building

3. **Testing**:
   - Unit tests for business logic
   - Integration tests for API endpoints
   - TestContainers for database integration tests
   - Mockito for external service mocking

### Frontend Patterns

1. **Component Structure**:
   - Functional components with hooks
   - Custom hooks for reusable logic
   - Props validation
   - TypeScript strict mode

2. **State Management**:
   - Redux Toolkit for global state
   - Context API for theme/localization
   - React Query for server state

3. **Testing**:
   - React Testing Library for component tests
   - Jest for unit tests
   - E2E tests with Cypress/Playwright

---

## Localization

### Supported Languages
- **Phase 1**: English (US), Ukrainian
- **Phase 2**: Additional European languages (German, Polish, etc.)
- **Phase 3**: Global expansion

### Implementation
- i18n library (react-i18next for frontend)
- Backend localization for error messages and notifications
- Locale selector in user settings
- Right-to-left (RTL) support consideration for future languages

---

## Scalability Considerations

### Current Design (MVP Phase)
- Shared database with proper indexing
- Caching layer (Redis) for hot queries
- Stateless microservices (horizontally scalable)
- Load balancer for distributing requests

### Future Scaling (Post-MVP)
- Database replication and read replicas
- Message queue (Kafka) for decoupling services
- Microservice-per-database pattern
- CQRS pattern for read-heavy operations
- GraphQL gateway for frontend efficiency
- CDN for static assets
- Elasticsearch for advanced search

---

## Deployment & DevOps

### Local Development
```bash
docker-compose up
```

### Production Deployment
- Kubernetes manifests in `/kubernetes` directory
- Helm charts (future)
- CI/CD pipeline with GitHub Actions
- Blue-green deployments for zero downtime
- Database migrations with Flyway/Liquibase

### Monitoring & Logging
- Structured logging (JSON format)
- Centralized log aggregation (ELK stack - future)
- Application metrics (Prometheus)
- Performance monitoring (New Relic/DataDog - future)

---

## Vendor Lock-In Prevention & Self-Hosting

### Core Principle: Open-Source First, Cloud-Native Ready

**Infrastructure Independence**:
- No AWS/GCP/Azure specific services (use standard Docker/Kubernetes)
- PostgreSQL is industry-standard, easily self-hosted or managed
- Redis for caching (standard, no vendor-specific tooling)
- Stripe API abstraction layer (easy to swap payment provider later)
- File storage abstraction (MinIO for self-hosted S3-compatible storage)

**Key Practices**:
- Docker Compose for local development
- Kubernetes manifests for any deployment (self-hosted or cloud)
- Environment-based configuration (no hardcoded endpoints)
- Database migrations with Flyway (portable across systems)
- Avoid cloud-specific libraries (no AWS SDK in core code)

**Deployment Options**:
- Self-hosted Linux VPS
- Docker Swarm
- Kubernetes (self-managed or managed services)
- On-premises data centers
- Hybrid cloud setup

---

## Security Considerations

1. **Authentication**:
   - OAuth 2.0 for social login
   - JWT for API authentication
   - Refresh token rotation

2. **Authorization**:
   - Role-based access control (User, Admin, Moderator)
   - Resource-level permissions

3. **Data Protection**:
   - Encryption at rest (database)
   - Encryption in transit (HTTPS/TLS)
   - PCI compliance for payment data (via Stripe)
   - GDPR compliance (data deletion, export)

4. **API Security**:
   - Input validation and sanitization
   - Rate limiting
   - CORS configuration
   - SQL injection prevention (JOOQ provides this)
   - XSS prevention (React escaping)

---

## Compliance & Regulations

- **GDPR** - User data protection and privacy
- **PCI-DSS** - Payment card data handling (delegated to Stripe)
- **CCPA** - California privacy rights (if applicable)
- **AML/KYC** - Anti-money laundering (future: age verification for certain items)

---

## Performance Targets

- **API Response Time**: < 200ms for most endpoints
- **Search Query**: < 500ms for geolocation search
- **Database Query**: < 100ms for average queries
- **Uptime**: 99.5% availability
- **Concurrent Users**: Support 10K+ concurrent users by end of year

---

## Known Constraints & Future Improvements

### Current Limitations
- Single shared database (scalability bottleneck for massive scale)
- REST-only communication (no real-time updates)
- No message queue (synchronous processing only)
- Basic search (no Elasticsearch)

### Roadmap (Post-MVP)
- Real-time notifications with WebSockets
- Advanced search with Elasticsearch
- User messaging/chat system
- Item lending agreements (smart contracts - blockchain)
- Mobile apps (React Native)
- AI-powered recommendations
- Sustainability reports
- Dispute resolution system
- Insurance integration

---

## Important Notes for Developers

1. **Always follow the existing code patterns** in each service
2. **Use JOOQ for all database queries** - no raw SQL or JPA
3. **Write integration tests** for new endpoints
4. **Keep services loosely coupled** - prefer DTOs over shared entities
5. **Document API changes** in service README
6. **Environment variables** for configuration (12-factor app)
7. **Semantic versioning** for APIs (`/api/v1/`, `/api/v2/`, etc.)

---

## Payment Processing Integration

### Stripe Configuration

**Transaction Flow**:
1. User initiates rental/booking
2. Transaction Service creates pending transaction
3. Payment initiated via Stripe API
4. Stripe webhook confirms payment status
5. Transaction marked as active
6. Service fee calculated and retained on platform account
7. Owner earnings held in escrow until transaction completion

**Implementation Details**:
- Stripe API key in environment variables
- Webhook validation (signature verification)
- Idempotent requests for safety
- Error handling with user-friendly messages
- Payout schedule configurable by admin

**Stripe Components**:
- Payment Intent API (for flexible payment workflows)
- Connected Accounts (optional: for direct payouts to item owners)
- Webhooks (charge.succeeded, charge.failed, etc.)
- Test mode for development

**Abstraction Layer**:
- PaymentService interface for potential future provider swaps
- DTOs to decouple Stripe specifics from business logic

---

## Contact & Questions

For questions about architecture decisions or technical implementation, refer to the appropriate service's README or contact the project lead.

**Last Updated**: 2026-02-10
**Version**: 1.0 (MVP Planning - Clarifications Updated)
