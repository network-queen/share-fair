# Share Fair - Feature Queue

## Completed

- [x] PostgreSQL schema with PostGIS + pgvector (V1-V4 migrations, 50+ test listings)
- [x] JOOQ repository layer (UserRepositoryImpl, ListingRepositoryImpl, NeighborhoodRepositoryImpl)
- [x] AI-powered semantic search (Spring AI + Ollama + pgvector, all-MiniLM-L6-v2 embeddings)
- [x] Search API with filters (keyword, neighborhood, category, pagination, autocomplete)
- [x] Listing CRUD API (create, read, update, delete with auto-embedding generation)
- [x] Docker setup (PostgreSQL custom image, Ollama, Spring Boot API, docker-compose)
- [x] React 19 + TypeScript + Vite frontend
- [x] Redux Toolkit state management (authSlice, searchSlice, listingSlice, uiSlice, transactionSlice)
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
- [x] OAuth 2.0 authentication (Google, GitHub)
- [x] JWT token generation, validation, and refresh (JwtTokenProvider, JwtAuthenticationFilter)
- [x] Spring Security stateless config with JWT filter
- [x] OAuth callback endpoint (AuthController full rewrite)
- [x] /api/v1/auth/me endpoint
- [x] Token refresh mechanism (access + refresh tokens, 401 auto-retry)
- [x] Frontend OAuth flow (LoginPage callback, authService, api.ts interceptor)
- [x] User auto-creation on first OAuth login
- [x] Auth backend tests (JwtTokenProviderTest, AuthControllerTest)
- [x] Removed Facebook OAuth (not used)
- [x] User Service backend (UserRepository.update, UserService, UserController, DTOs)
- [x] Transaction Service backend (Entity, Repository, Service, Controller, DTOs, state machine)
- [x] Create Listing backend fix (auth principal for ownerId, user listings endpoint, SecurityConfig routes)
- [x] User Service frontend (userService.ts, updateUser thunk, Profile page rewrite with inline editing)
- [x] Transaction Service frontend (transactionService.ts, transactionSlice, MyTransactionsPage, TransactionDetailPage)
- [x] Rent flow on ListingDetailPage (date picker, create transaction, redirect)
- [x] Create Listing frontend fix (form state, validation, API call, cancel navigation)
- [x] Transaction + profile + validation localization keys (EN + UK)
- [x] Transactions nav link + routes (/transactions, /transactions/:id)
- [x] Geolocation search (PostGIS distance queries, radius search, sort by proximity, Leaflet map, location picker, browser geolocation)
- [x] Payment processing - Stripe (API integration, Payment Intent, webhook handler, service fee calculation, Stripe Elements UI)
- [x] Reviews & ratings (Review entity/repo/service/controller, 5-star with comments, listing + profile display, self-review prevention, completed-only reviews)
- [x] Trust score (calculation formula, Bronze/Silver/Gold/Platinum tiers, triggers on review + transaction completion, profile display, listing badge, TrustBadge component)
- [x] Carbon saved tracker (category-based CO2 formula, record per transaction, user history + total, community leaderboard, profile carbon tab, HomePage leaderboard)
- [x] Localization for reviews, trust score, carbon (EN + UK)

---

## Bugs

- [ ] Create listing page: "Drop images" doesn't work (image upload not connected — placeholder shown)

---

## Backlog

### Listing Enhancements (Priority: Medium)
- [ ] Image upload (S3/MinIO storage)
- [ ] Multiple images per listing
- [ ] Listing status management (active, archived, completed)
- [ ] Edit listing page
- [ ] Delete listing confirmation

### Notification Service (Priority: Medium)
- [ ] Notification model and repository
- [ ] Email notifications (transaction updates, new messages)
- [ ] In-app notifications (bell icon, notification dropdown)
- [ ] Notification preferences per user
- [ ] Email templates (welcome, transaction status, review received)

### Search Improvements (Priority: Low)
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
