// Verification Status Type
export type VerificationStatus = 'UNVERIFIED' | 'EMAIL_VERIFIED' | 'PHONE_VERIFIED' | 'IDENTITY_VERIFIED';

// Item Condition Type
export type ItemCondition = 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR';

// Transaction Status Type
export type TransactionStatus = 'PENDING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED' | 'DISPUTED';

// Payment Status Type
export type PaymentStatus = 'PENDING' | 'SUCCEEDED' | 'FAILED' | 'REFUNDED';

// Trust Tier Type
export type TrustTier = 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM';

// User Types
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  neighborhood: string;
  trustScore: number;
  carbonSaved: number;
  createdAt: string;
  verificationStatus: VerificationStatus;
}

// Listing Types
export interface Listing {
  id: string;
  title: string;
  description: string;
  category: string;
  condition: ItemCondition;
  ownerId: string;
  owner?: User;
  price: number;
  pricePerDay?: number;
  images: string[];
  latitude: number;
  longitude: number;
  neighborhood: string;
  available: boolean;
  status?: string;
  listingType?: string;
  createdAt: string;
  updatedAt: string;
  ratings?: number;
  reviewCount?: number;
  distanceKm?: number;
}

// Transaction Types
export interface Transaction {
  id: string;
  listingId: string;
  listing?: Listing;
  borrowerId: string;
  borrower?: User;
  ownerId: string;
  status: TransactionStatus;
  startDate: string;
  endDate: string;
  totalAmount: number;
  serviceFee: number;
  paymentStatus: PaymentStatus;
  createdAt: string;
  completedAt?: string;
  isFree?: boolean;
}

// Review Types
export interface Review {
  id: string;
  transactionId: string;
  reviewerId: string;
  reviewer?: User;
  revieweeId: string;
  rating: number;
  comment: string;
  createdAt: string;
}

// Trust Score Types
export interface TrustScore {
  userId: string;
  score: number;
  tier: TrustTier;
  completedTransactions: number;
  averageRating: number;
}

// Carbon Saved Types
export interface CarbonSavedRecord {
  id: string;
  transactionId: string;
  userId: string;
  carbonSavedKg: number;
  estimatedNewProductCarbon: number;
  createdAt: string;
}

// Notification Types
export interface NotificationItem {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  referenceId?: string;
  referenceType?: string;
  isRead: boolean;
  createdAt: string;
}

// Search & Filter Types
export interface SearchParams {
  query?: string;
  neighborhood?: string;
  category?: string;
  radius?: number;
  lat?: number;
  lng?: number;
  sortBy?: 'relevance' | 'distance' | 'price' | 'date';
  limit?: number;
  offset?: number;
}

export interface SearchResult {
  listings: Listing[];
  total: number;
  hasMore: boolean;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Pagination
export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}
