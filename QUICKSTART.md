# Sharefair - Quick Start Guide

This guide will help you get the entire Sharefair platform running locally.

## Prerequisites

- Node.js 18+ (for frontend)
- Java 17+ (for backend)
- Maven 3.8+ (for backend)
- PostgreSQL 13+ or Docker (for database)
- Git

## Project Structure

```
share-fair/
├── share-fair-fe/       # React TypeScript frontend
├── share-fair-be/       # Java Spring Boot backend
├── docker-compose.yml   # Docker setup for PostgreSQL + API
├── CLAUDE.md           # Architecture documentation
└── QUICKSTART.md       # This file
```

## Option 1: Using Docker (Recommended)

### Start Everything with Docker Compose

```bash
cd share-fair

# Start PostgreSQL and backend API
docker-compose up -d

# Verify services are running
docker-compose ps

# View logs
docker-compose logs -f api
```

This will:
- Start PostgreSQL on port 5432
- Build and run Spring Boot API on port 8080
- Run Flyway migrations automatically

### Start Frontend (in a new terminal)

```bash
cd share-fair-fe

# Install dependencies
npm install

# Start dev server
npm run dev

# Access at http://localhost:5173
```

## Option 2: Manual Setup

### 1. Setup PostgreSQL

```bash
# Create database and user
createdb sharefair_db
createuser sharefair_user
psql -d sharefair_db -c "ALTER USER sharefair_user WITH PASSWORD 'sharefair_password';"
psql -d sharefair_db -c "GRANT ALL PRIVILEGES ON DATABASE sharefair_db TO sharefair_user;"
```

Or use Docker:

```bash
docker run --name sharefair-postgres \
  -e POSTGRES_USER=sharefair_user \
  -e POSTGRES_PASSWORD=sharefair_password \
  -e POSTGRES_DB=sharefair_db \
  -p 5432:5432 \
  -d postgres:15-alpine
```

### 2. Start Backend (Terminal 1)

```bash
cd share-fair-be

# Build
mvn clean package

# Run
mvn spring-boot:run

# Or run directly
java -jar target/sharefair-api-0.1.0.jar
```

API will be available at: `http://localhost:8080`

### 3. Start Frontend (Terminal 2)

```bash
cd share-fair-fe

# Install dependencies
npm install

# Start dev server
npm run dev

# Access at http://localhost:5173
```

## Testing the Integration

### 1. Open Frontend
Navigate to `http://localhost:5173` in your browser.

### 2. Test API Connection
Click the Login button → You should see OAuth options (currently mocked)

### 3. Test Search
Go to Search page → Should display mock listings from backend

### 4. View Backend Logs
```bash
# Check if migrations ran
psql -h localhost -U sharefair_user -d sharefair_db
SELECT * FROM flyway_schema_history;
```

## Common Issues

### Database Connection Failed

```bash
# Check PostgreSQL is running
psql -h localhost -U sharefair_user -d sharefair_db

# If using Docker
docker logs sharefair-postgres
```

### Port Already in Use

```bash
# Change ports in docker-compose.yml or application.yml

# Kill process on port 8080 (macOS/Linux)
lsof -ti:8080 | xargs kill -9

# Kill process on port 5432
lsof -ti:5432 | xargs kill -9
```

### Frontend Can't Connect to Backend

1. Ensure backend is running on port 8080
2. Check `VITE_API_BASE_URL` in frontend `.env`
3. Verify CORS is enabled in backend (it is by default)

```bash
# Test backend is responding
curl http://localhost:8080/api/v1/search/categories
```

## Development Workflow

### Making Backend Changes

1. Edit files in `share-fair-be/src`
2. Run `mvn compile` to check syntax
3. Restart the application
4. Test via API calls or frontend

### Making Frontend Changes

1. Edit files in `share-fair-fe/src`
2. Changes auto-reload in dev mode
3. Check browser console for errors

### Database Changes

1. Create new migration in `share-fair-be/src/main/resources/db/migration/V{N}__Description.sql`
2. Restart backend (migrations run automatically)

## API Endpoints

All endpoints are prefixed with `/api/v1`

### Public Endpoints
- `GET /search` - Search listings
- `GET /search/neighborhoods` - Get neighborhoods
- `GET /listings` - Get listings
- `GET /listings/{id}` - Get single listing

### Protected Endpoints (Require Authentication)
- `POST /listings` - Create listing
- `PUT /listings/{id}` - Update listing
- `DELETE /listings/{id}` - Delete listing

### Auth Endpoints
- `POST /auth/oauth/callback` - OAuth callback
- `GET /auth/me` - Get current user
- `POST /auth/logout` - Logout

## Next Steps

1. **Implement OAuth**: Update auth service to connect with actual OAuth providers
2. **Add Database Queries**: Implement repository layer with JOOQ
3. **Complete Frontend Pages**: Build out all page components
4. **Add Tests**: Write unit and integration tests
5. **Deploy**: Set up CI/CD and cloud deployment

## Useful Commands

### Frontend
```bash
cd share-fair-fe

npm run dev       # Start dev server
npm run build     # Production build
npm run preview   # Preview production build
npm run lint      # Run ESLint
```

### Backend
```bash
cd share-fair-be

mvn clean package # Full build
mvn spring-boot:run # Run with hot reload
mvn test          # Run tests
mvn compile       # Compile only
```

### Docker
```bash
cd share-fair

docker-compose up -d        # Start all services
docker-compose down         # Stop all services
docker-compose logs -f api  # View API logs
docker-compose ps           # Check status
```

## Documentation

- **Architecture**: See [CLAUDE.md](./CLAUDE.md)
- **Frontend Docs**: See [share-fair-fe/README.md](./share-fair-fe/README.md)
- **Backend Docs**: See [share-fair-be/README.md](./share-fair-be/README.md)

## Getting Help

If you encounter issues:

1. Check the relevant README files
2. Look at service logs: `docker-compose logs`
3. Verify ports are accessible: `lsof -i :{port}`
4. Ensure all services are running
5. Check browser console (frontend) and terminal (backend) for errors

---

**Happy coding! 🚀**
