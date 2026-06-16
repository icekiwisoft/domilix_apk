# 🏗️ Domilix Mobile App - ARCHITECTURE & COMPONENT GUIDE

## Component Structure (Recommended)

### Screens/Pages
```
src/screens/
├── Auth/
│   ├── LoginScreen.tsx
│   ├── SignUpScreen.tsx
│   ├── VerificationScreen.tsx
│   ├── ForgotPasswordScreen.tsx
│   └── ResetPasswordScreen.tsx
├── Home/
│   ├── HomeScreen.tsx
│   ├── FeaturedCarousel.tsx
│   └── CategoryCarousel.tsx
├── Search/
│   ├── SearchScreen.tsx
│   ├── FilterPanel.tsx
│   ├── ResultsGrid.tsx
│   └── FiltersModal.tsx
├── Listing/
│   ├── ListingDetailScreen.tsx
│   ├── ImageGallery.tsx
│   ├── AmenityList.tsx
│   ├── AnnouncerCard.tsx
│   ├── RelatedListings.tsx
│   ├── UnlockModal.tsx
│   └── ShareModal.tsx
├── Maps/
│   ├── MapsScreen.tsx
│   ├── MapFilters.tsx
│   └── ListingPreview.tsx
├── Favorites/
│   ├── FavoritesScreen.tsx
│   └── FavoritesGrid.tsx
├── Profile/
│   ├── ProfileScreen.tsx
│   ├── EditProfileScreen.tsx
│   ├── AnnouncerDashboard.tsx
│   ├── CreateListingScreen.tsx
│   └── EditListingScreen.tsx
├── Notifications/
│   ├── NotificationsScreen.tsx
│   └── NotificationItem.tsx
├── Settings/
│   ├── SettingsScreen.tsx
│   ├── LanguageSelector.tsx
│   └── PreferencesList.tsx
├── Subscriptions/
│   ├── SubscriptionsScreen.tsx
│   ├── PlanCard.tsx
│   ├── PlanComparison.tsx
│   └── CreditsBalance.tsx
└── Static/
    ├── PrivacyScreen.tsx
    ├── TermsScreen.tsx
    ├── LegalScreen.tsx
    ├── AboutScreen.tsx
    └── ContactScreen.tsx
```

### Shared Components
```
src/components/
├── Layout/
│   ├── BottomTabNav.tsx
│   ├── Header.tsx
│   ├── SafeArea.tsx
│   └── Container.tsx
├── Forms/
│   ├── TextInput.tsx
│   ├── PhoneInput.tsx
│   ├── PasswordInput.tsx
│   ├── PriceInput.tsx
│   ├── LocationPicker.tsx
│   └── ImagePicker.tsx
├── Cards/
│   ├── ListingCard.tsx
│   ├── AnnouncerCard.tsx
│   ├── NotificationCard.tsx
│   ├── PlanCard.tsx
│   └── StatCard.tsx
├── Buttons/
│   ├── PrimaryButton.tsx
│   ├── SecondaryButton.tsx
│   ├── FAB.tsx
│   └── IconButton.tsx
├── Modals/
│   ├── BottomSheet.tsx
│   ├── Dialog.tsx
│   ├── ConfirmModal.tsx
│   └── SuccessModal.tsx
├── Lists/
│   ├── VirtualList.tsx
│   ├── InfiniteScrollList.tsx
│   └── PaginatedList.tsx
├── Indicators/
│   ├── LoadingSpinner.tsx
│   ├── SkeletonLoader.tsx
│   ├── ProgressBar.tsx
│   └── Badge.tsx
├── Images/
│   ├── OptimizedImage.tsx
│   ├── ImageCarousel.tsx
│   └── Thumbnail.tsx
└── Misc/
    ├── EmptyState.tsx
    ├── ErrorBoundary.tsx
    ├── Divider.tsx
    └── Chip.tsx
```

### Hooks
```
src/hooks/
├── useAuth.ts
├── useListings.ts
├── useFavorites.ts
├── useNotifications.ts
├── useMaps.ts
├── useSubscription.ts
├── useLocation.ts
├── useImage.ts
├── useNetworkStatus.ts
├── usePagination.ts
└── useForm.ts
```

### Services/API
```
src/services/
├── api.ts (Axios instance with interceptors)
├── authService.ts
├── listingsService.ts
├── favoritesService.ts
├── notificationsService.ts
├── mapsService.ts
├── subscriptionsService.ts
├── usersService.ts
├── addressService.ts
├── mediaService.ts
├── categoriesService.ts
└── analytics.ts
```

### State/Stores
```
src/stores/
├── authStore.ts
├── uiStore.ts
├── listingsStore.ts
├── favoritesStore.ts
├── notificationsStore.ts
├── mapsStore.ts
├── creditsStore.ts
└── defineStore.ts (Zustand config)
```

### Utils & Constants
```
src/utils/
├── constants.ts
├── colors.ts
├── fonts.ts
├── spacing.ts
├── validators.ts
├── formatters.ts
├── storage.ts
└── errorHandler.ts

src/constants/
├── apiEndpoints.ts
├── screenNames.ts
├── errorMessages.ts
├── successMessages.ts
└── subscriptionPlans.ts
```

### Navigation
```
src/navigation/
├── RootNavigator.tsx
├── AuthNavigator.tsx
├── HomeNavigator.tsx
├── SearchNavigator.tsx
├── FavoritesNavigator.tsx
├── NotificationsNavigator.tsx
├── ProfileNavigator.tsx
└── LinkingConfiguration.ts
```

---

## API Service Pattern (Recommended)

### Base API Configuration
```typescript
// services/api.ts
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const api = axios.create({
  baseURL: 'https://api.domilix.com/api',
  timeout: 10000,
});

// Request Interceptor
api.interceptors.request.use(
  async (config) => {
    const token = await SecureStore.getItemAsync('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor
api.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    if (error.response?.status === 401) {
      // Handle token refresh
      const newToken = await refreshToken();
      // Retry request
    }
    return Promise.reject(error);
  }
);

export default api;
```

### Service Example (Listings)
```typescript
// services/listingsService.ts
import api from './api';
import { Ad, ListingsResponse, FilterParams } from '../types';

export const listingsService = {
  getListings: async (params?: FilterParams): Promise<ListingsResponse> => {
    const response = await api.get('/announces', { params });
    return response;
  },

  getListingDetail: async (id: number): Promise<Ad> => {
    return await api.get(`/announces/${id}`);
  },

  searchListings: async (query: string, filters?: FilterParams) => {
    return await api.get('/announces', {
      params: { search: query, ...filters }
    });
  },

  createListing: async (data: CreateListingData): Promise<Ad> => {
    const formData = new FormData();
    // Append all fields
    return await api.post('/announces', formData);
  },

  updateListing: async (id: number, data: Partial<Ad>): Promise<Ad> => {
    return await api.patch(`/announces/${id}`, data);
  },

  deleteListing: async (id: number): Promise<void> => {
    await api.delete(`/announces/${id}`);
  },

  toggleLike: async (id: number): Promise<{ liked: boolean }> => {
    return await api.patch(`/announces/${id}/like`);
  },

  unlockContact: async (id: number): Promise<UnlockResponse> => {
    return await api.post(`/announces/${id}/unlock`);
  },
};
```

### Custom Hook Example
```typescript
// hooks/useListings.ts
import { useEffect, useState } from 'react';
import { useAuthStore } from '../stores/authStore';
import { useListingsStore } from '../stores/listingsStore';
import { listingsService } from '../services/listingsService';

export function useListings(filters?: FilterParams) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { listings, setListings } = useListingsStore();

  useEffect(() => {
    loadListings();
  }, [filters]);

  const loadListings = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await listingsService.getListings(filters);
      setListings(data.data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  };

  return { listings, isLoading, error, refetch: loadListings };
}
```

---

## Zustand Store Pattern

### Example: Auth Store
```typescript
// stores/authStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authService } from '../services/authService';
import * as SecureStore from 'expo-secure-store';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  refreshToken: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (credentials) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authService.login(credentials);
          await SecureStore.setItemAsync('authToken', response.token);
          set({
            user: response.user,
            token: response.token,
            isAuthenticated: true,
          });
        } catch (error) {
          set({ error: (error as Error).message });
        } finally {
          set({ isLoading: false });
        }
      },

      logout: async () => {
        await authService.logout();
        await SecureStore.deleteItemAsync('authToken');
        set({ user: null, token: null, isAuthenticated: false });
      },

      register: async (data) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authService.register(data);
          await SecureStore.setItemAsync('authToken', response.token);
          set({
            user: response.user,
            token: response.token,
            isAuthenticated: true,
          });
        } catch (error) {
          set({ error: (error as Error).message });
        } finally {
          set({ isLoading: false });
        }
      },

      refreshToken: async () => {
        try {
          const newToken = await authService.refreshToken();
          await SecureStore.setItemAsync('authToken', newToken);
          set({ token: newToken });
        } catch (error) {
          set({ isAuthenticated: false, token: null, user: null });
        }
      },

      checkAuth: async () => {
        try {
          const token = await SecureStore.getItemAsync('authToken');
          if (token) {
            const user = await authService.getMe();
            set({ user, token, isAuthenticated: true });
          }
        } catch {
          set({ isAuthenticated: false });
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user, token: state.token }),
    }
  )
);
```

---

## Error Handling Pattern

```typescript
// utils/errorHandler.ts
export interface AppError {
  code: string;
  message: string;
  statusCode: number;
}

export const handleApiError = (error: any): AppError => {
  if (error.response) {
    // Server responded with error
    return {
      code: `ERROR_${error.response.status}`,
      message: error.response.data.message || 'An error occurred',
      statusCode: error.response.status,
    };
  } else if (error.request) {
    // Request made but no response
    return {
      code: 'ERROR_NETWORK',
      message: 'Network error. Please check your connection.',
      statusCode: 0,
    };
  } else {
    return {
      code: 'ERROR_UNKNOWN',
      message: error.message || 'Unknown error',
      statusCode: 0,
    };
  }
};

export const getErrorMessage = (error: AppError): string => {
  const errorMessages: Record<string, string> = {
    'ERROR_401': 'Session expired. Please login again.',
    'ERROR_404': 'Resource not found.',
    'ERROR_500': 'Server error. Please try again later.',
    'ERROR_NETWORK': 'Network error. Check your connection.',
    'ERROR_VALIDATION': 'Please check your input.',
  };

  return errorMessages[error.code] || error.message;
};
```

---

## Type Definitions

```typescript
// types/index.ts

// Listings
export interface Ad {
  id: number;
  title: string;
  description: string;
  type: 'realestate' | 'furniture';
  ad_type: 'location' | 'sale';
  price: number;
  location: Location;
  medias: Media[];
  amenities: string[];
  condition?: string;
  announcer: Announcer;
  liked: boolean;
  unlocked: boolean;
  views_count: number;
  created_at: string;
  updated_at: string;
}

// Users
export interface User {
  id: number;
  name: string;
  email?: string;
  phone_number: string;
  avatar?: string;
  website?: string;
  bio?: string;
  announcer?: string | null;
  is_admin?: boolean;
  credits?: number;
  email_verified: boolean;
  phone_verified: boolean;
  created_at: string;
  updated_at: string;
}

// Location
export interface Location {
  address: string;
  city: string;
  latitude: number;
  longitude: number;
}

// Media
export interface Media {
  id: string;
  file: string;
  thumbnail: string;
  type: string;
  path: string;
}

// Announcer
export interface Announcer {
  id: number;
  name: string;
  avatar?: string;
  email?: string;
  phone_number: string;
  is_verified?: boolean;
}

// Auth
export interface LoginCredentials {
  email?: string;
  phone_number?: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email?: string;
  phone_number?: string;
  password: string;
  website?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  type: string;
}

// Filters
export interface FilterParams {
  type?: 'realestate' | 'furniture';
  ad_type?: 'location' | 'sale';
  city?: string;
  price_min?: number;
  price_max?: number;
  amenities?: string[];
  search?: string;
  page?: number;
  per_page?: number;
  liked?: boolean;
  unlocked?: boolean;
}

export interface ListingsResponse {
  data: Ad[];
  total: number;
  current_page: number;
  per_page: number;
  last_page: number;
}

// Subscriptions
export interface Plan {
  id: string;
  label: string;
  price: number;
  duration_days: number;
  duration_hours: number;
  unlock_count: number;
}

export interface Subscription {
  id: number;
  plan: string;
  active: boolean;
  price: number;
  start_date?: string;
  end_date?: string;
}

// Notifications
export interface Notification {
  id: number;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  link?: string;
  read: boolean;
  created_at: string;
}
```

---

## Folder Structure (Full)

```
domilix-mobile/
├── src/
│   ├── screens/
│   ├── components/
│   ├── hooks/
│   ├── services/
│   ├── stores/
│   ├── utils/
│   ├── constants/
│   ├── types/
│   ├── navigation/
│   ├── assets/
│   │   ├── fonts/
│   │   ├── icons/
│   │   └── images/
│   ├── styles/
│   │   ├── colors.ts
│   │   ├── spacing.ts
│   │   ├── typography.ts
│   │   └── shadows.ts
│   └── App.tsx
├── app.json
├── package.json
├── tsconfig.json
├── .env.example
├── .gitignore
└── README.md
```

---

## Dependencies (Essential)

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-native": "^0.72.0",
    "zustand": "^4.4.0",
    "axios": "^1.6.0",
    "react-navigation": "^6.1.0",
    "react-native-mapbox-gl": "^8.5.0",
    "react-native-image-picker": "^5.0.0",
    "react-native-permissions": "^3.8.0",
    "@react-native-community/async-storage": "^1.12.0",
    "expo-secure-store": "^12.3.0",
    "expo-image-picker": "^14.3.0",
    "date-fns": "^2.30.0",
    "react-native-paper": "^5.12.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-native": "^0.72.0",
    "typescript": "^5.0.0",
    "@testing-library/react-native": "^12.2.0",
    "jest": "^29.5.0"
  }
}
```

---

**This architecture supports scalable, maintainable mobile app development!**
