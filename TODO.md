# Share Fair - Feature Queue

## Completed

- [x] PostgreSQL schema with PostGIS + pgvector (V1-V4 migrations, 50+ test listings)
- [x] JOOQ repository layer (UserRepositoryImpl, ListingRepositoryImpl, NeighborhoodRepositoryImpl)
- [x] AI-powered semantic search (Spring AI + Ollama + pgvector, all-MiniLM-L6-v2 embeddings)
- [x] Search API with filters (keyword, neighborhood, category, pagination, autocomplete)
- [x] Listing CRUD API (create, read, update, delete with auto-embedding generation)
- [x] Docker setup (PostgreSQL custom image, Ollama, Spring Boot API, docker-compose)
- [x] React 19 + TypeScript + Vite frontend
- [x] Redux Toolkit state management (authSlice, searchSlice, listingSlice, uiSlice)
- [x] Tailwind CSS styling
- [x] Localization - English + Ukrainian (react-i18next, language switcher, persistent preference)
- [x] Search page UI (filters sidebar, listing grid, load more, semantic search)
- [x] Home page (hero, features, CTA)
- [x] Privacy Policy page (EN/UK)
- [x] Terms of Service page (EN/UK)
- [x] About Us page (EN/UK)
- [x] Navigation + Footer with working links
- [x] Protected route component
- [x] Backend refactoring (extracted duplicate code, Lombok on ListingDto, renamed SecurityConfig, pagination validation, improved error handler)
- [x] Backend tests - 24 tests (UserRepositoryImpl, ListingRepositoryImpl, SearchService, SearchController, ListingController)
- [x] Frontend test infrastructure (Vitest, Testing Library, test utils, fixtures)
- [x] Frontend tests - 49 tests (searchSlice, authSlice, listingSlice, SearchPage, HomePage)
- [x] OAuth state generation fix (crypto.getRandomValues)
- [x] Error typing fix (error: unknown instead of error: any)
- [x] useAuth error handling fix (setAuthError action)
- [x] useLanguage hook consolidation
- [x] OAuth 2.0 authentication (Google, Facebook, GitHub)
- [x] JWT token generation, validation, and refresh (JwtTokenProvider, JwtAuthenticationFilter)
- [x] Spring Security stateless config with JWT filter
- [x] OAuth callback endpoint (AuthController full rewrite)
- [x] /api/v1/auth/me endpoint
- [x] Token refresh mechanism (access + refresh tokens, 401 auto-retry)
- [x] Frontend OAuth flow (LoginPage callback, authService, api.ts interceptor)
- [x] User auto-creation on first OAuth login
- [x] Auth backend tests (JwtTokenProviderTest, AuthControllerTest)

---

## Backlog

### User Service (Priority: High)
- [ ] User profile API (GET/PUT /api/v1/users/{id})
- [ ] User preferences endpoint (language, notifications)
- [ ] Profile page - display real user data
- [ ] Edit profile page
- [ ] Profile image upload

### Transaction Service (Priority: High)
- [ ] Transaction model and repository (JOOQ)
- [ ] Transaction lifecycle API (create, accept, reject, complete, cancel, dispute)
- [ ] Booking/rental creation endpoint
- [ ] Transaction status management (pending, active, completed, disputed)
- [ ] Transaction history per user
- [ ] Transaction detail page (frontend)
- [ ] My Transactions page (frontend)

### Payment Processing - Stripe (Priority: High)
- [ ] Stripe API integration (Spring Boot)
- [ ] PaymentService interface (abstraction for provider swap)
- [ ] Payment Intent creation
- [ ] Stripe webhook handler (charge.succeeded, charge.failed)
- [ ] Service fee calculation and collection (configurable %, default 10%)
- [ ] Payment UI on frontend (Stripe Elements or Checkout)
- [ ] Payout to item owners

### Geolocation Search (Priority: High)
- [ ] PostGIS distance queries (Haversine / ST_Distance)
- [ ] Radius-based search within neighborhood (1-10 km)
- [ ] Sort listings by proximity
- [ ] Map integration on frontend (Leaflet - already installed)
- [ ] Map view for search results
- [ ] Listing location picker on create form
- [ ] User location detection (browser geolocation API)

### Reviews & Ratings (Priority: Medium)
- [ ] Review model and repository (JOOQ)
- [ ] Review API (create, list by user, list by listing)
- [ ] 5-star rating with comments
- [ ] Review display on listing detail page
- [ ] Review display on user profile
- [ ] Prevent self-reviews
- [ ] Only allow reviews after completed transaction

### Trust Score (Priority: Medium)
- [ ] Trust score calculation logic (based on completed transactions, reviews, verifications)
- [ ] Trust level tiers (Bronze, Silver, Gold, Platinum)
- [ ] Trust score update triggers (after review, transaction completion)
- [ ] Trust score display on user profile
- [ ] Trust score badge on listings
- [ ] Verified user badges (email, phone, identity)
- [ ] Community trust leaderboard

### Carbon Saved Tracker (Priority: Medium)
- [ ] Carbon savings calculation formula (item reuse vs new purchase)
- [ ] Carbon record creation per transaction
- [ ] User profile carbon impact metrics
- [ ] Community-wide carbon savings dashboard
- [ ] Carbon savings leaderboard
- [ ] Carbon badge on listings ("X kg CO2 saved")

### Listing Enhancements (Priority: Medium)
- [ ] Image upload (S3/MinIO storage)
- [ ] Multiple images per listing
- [ ] Listing status management (active, archived, completed)
- [ ] Create listing page - connect to real backend
- [ ] Listing detail page - full implementation with contact owner
- [ ] My Listings page (user's own listings)
- [ ] Edit listing page
- [ ] Delete listing confirmation

### Notification Service (Priority: Medium)
- [ ] Notification model and repository
- [ ] Email notifications (transaction updates, new messages)
- [ ] In-app notifications (bell icon, notification dropdown)
- [ ] Notification preferences per user
- [ ] Email templates (welcome, transaction status, review received)

### Search Improvements (Priority: Low)
- [ ] Geolocation search endpoint (currently returns all)
- [ ] Sort by distance, price, date (backend support)
- [ ] Search result highlighting
- [ ] Recent searches
- [ ] Saved searches

### Frontend Polish (Priority: Low)
- [ ] Loading skeletons for search results
- [ ] Error boundaries
- [ ] 404 page (currently redirects to home)
- [ ] Responsive design audit
- [ ] Dark mode
- [ ] Accessibility audit (ARIA labels, keyboard navigation)
- [ ] PWA support (service worker, offline)
- [ ] SEO meta tags per page

### DevOps & Infrastructure (Priority: Low)
- [ ] CI/CD pipeline (GitHub Actions)
- [ ] Kubernetes manifests
- [ ] Redis caching for hot queries (neighborhoods, categories)
- [ ] Production environment configuration
- [ ] Database backup strategy
- [ ] Monitoring (Prometheus + Grafana)
- [ ] Centralized logging (ELK stack)
- [ ] Rate limiting on public endpoints
- [ ] HTTPS configuration

### Future / Post-MVP
- [ ] User messaging / chat system
- [ ] Real-time notifications (WebSockets)
- [ ] Elasticsearch for advanced search
- [ ] Mobile apps (React Native)
- [ ] AI-powered recommendations
- [ ] Sustainability reports
- [ ] Dispute resolution system
- [ ] Insurance integration
- [ ] Additional languages (German, Polish)
- [ ] RTL language support
- [ ] GraphQL gateway
- [ ] CQRS for read-heavy operations
