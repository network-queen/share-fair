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
- [x] Listing enhancements (fix update bug, ownership auth on PUT/DELETE, edit listing page, delete confirmation, image URL inputs, listing status management with V5 migration)
- [x] Notification service (V6 migration, entity/repo/service/controller, triggers on transaction create/status change/review, NotificationBell component with polling)
- [x] Frontend polish (404 page, error boundary, loading skeletons for search, responsive navigation with hamburger menu)
- [x] Localization for listings, notifications, errors (EN + UK)
- [x] Email notification service (Spring Boot Mail + Thymeleaf templates: welcome, transaction, review)
- [x] Notification preferences per user (V9 migration, entity/repo/service/controller, profile Settings tab)
- [x] Search sort by distance, price, date (backend JOOQ + frontend controls)
- [x] Search result highlighting (HighlightText component)
- [x] Recent searches (localStorage, max 10, dropdown on focus)
- [x] Saved searches (localStorage, max 20, sidebar section)
- [x] Image upload with MinIO (S3-compatible storage, drag & drop, backend multipart upload, Docker Compose)

---

## Bugs

_(none)_

---

## Backlog

### Frontend Polish (Priority: Low)
- [x] Dark mode (Tailwind v4 dark variant, Redux toggle, Navigation sun/moon button, persistent preference)
- [x] Accessibility audit (ARIA labels, keyboard navigation, skip-to-content, role attributes, aria-expanded)
- [x] PWA support (vite-plugin-pwa, service worker with workbox, manifest, app icons, offline caching)
- [x] SEO meta tags per page (react-helmet-async, dynamic titles/descriptions, og:tags, twitter:card)

### DevOps & Infrastructure (Priority: Low)
- [ ] CI/CD pipeline (GitHub Actions)
- [ ] Kubernetes manifests
- [ ] Redis caching for hot queries (neighborhoods, categories)
- [ ] Production environment configuration
- [ ] Database backup strategy
- [x] Monitoring (Prometheus + Grafana — Spring Boot Actuator, Micrometer, auto-provisioned Grafana datasource, scrape every 15s)
- [x] Centralized logging (ELK stack — Elasticsearch 8.12 + Logstash + Kibana, logstash-logback-encoder, JSON structured logs via TCP)
- [ ] Rate limiting on public endpoints
- [x] HTTPS configuration (Nginx reverse proxy with TLS termination, self-signed certs for dev, HTTP→HTTPS redirect, WebSocket support for HMR)

### Future / Post-MVP
- [ ] User messaging / chat system
- [ ] Real-time notifications (WebSockets)
- [ ] Elasticsearch for advanced search
- [x] Mobile apps (React Native)
- [ ] AI-powered recommendations
- [x] Sustainability reports
- [x] Dispute resolution system
- [ ] Insurance integration
- [ ] Additional languages (German, Polish)
- [ ] RTL language support
- [ ] GraphQL gateway
- [ ] CQRS for read-heavy operations
