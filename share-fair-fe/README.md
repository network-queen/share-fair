# Sharefair Frontend

Modern React TypeScript frontend for the Sharefair Circular Economy Marketplace.

## Tech Stack

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Redux Toolkit** - State management
- **React Router** - Navigation
- **Tailwind CSS** - Styling
- **i18next** - Localization (EN, UK)
- **Leaflet** - Maps
- **Axios** - HTTP client

## Project Structure

```
src/
├── components/       # Reusable UI components
├── pages/           # Page components (routes)
├── services/        # API service layer
├── store/           # Redux slices and store config
├── hooks/           # Custom React hooks
├── types/           # TypeScript type definitions
├── utils/           # Utility functions
├── locales/         # i18n translation files
├── assets/          # Static assets
├── i18n.ts          # i18n configuration
├── App.tsx          # Main app component
└── main.tsx         # Entry point
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Create .env file from example
cp .env.example .env

# Update .env with your configuration
```

### Development

```bash
# Start development server
npm run dev

# Access at http://localhost:5173
```

### Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## Environment Variables

See `.env.example` for available configuration options.

## Features

### Authentication
- OAuth 2.0 login (Google, Facebook, GitHub)
- Protected routes with Redux state management
- Automatic token refresh

### Search & Listing
- Full-text search with filters
- Geolocation-based search
- Listing detail page with images
- Create new listings

### User Profile
- User dashboard
- Trust score display
- Carbon saved tracking
- Listing management

### Localization
- English (US)
- Ukrainian
- Language switcher in navigation
- i18n integration throughout

## Development Guidelines

### Component Structure

```tsx
// Always include TypeScript types
interface ComponentProps {
  title: string
  onClose?: () => void
}

const MyComponent: React.FC<ComponentProps> = ({ title, onClose }) => {
  return <div>{title}</div>
}

export default MyComponent
```

### State Management

- Use Redux for global state (auth, listings, search)
- Use React Context for UI state (theme, language)
- Use component state for form inputs

### Styling

- Use Tailwind CSS utility classes
- Avoid inline styles
- Create reusable component classes in index.css if needed
- Follow mobile-first responsive design

### API Integration

```tsx
// Use the ApiService for all API calls
import api from '../services/api'

api.get('/endpoint').then(response => {
  // Handle response
})

// Or use dedicated service classes
import listingService from '../services/listingService'

listingService.getListings(page, limit)
```

## Routing

- `/` - Home page
- `/login` - Login with OAuth
- `/auth/callback` - OAuth callback handler
- `/search` - Search listings
- `/listing/:id` - Listing detail
- `/profile` - User profile (protected)
- `/create-listing` - Create new listing (protected)

## Future Enhancements

- Advanced search with filters
- Real-time notifications with WebSockets
- Maps integration for geolocation
- Image upload and optimization
- User messaging system
- Payment integration UI
- Mobile app (React Native)
- E2E tests with Cypress
- Performance monitoring

## Contributing

1. Create a feature branch
2. Follow the code structure and patterns
3. Write TypeScript with proper types
4. Test changes locally
5. Submit PR for review

## License

Proprietary - Sharefair
