# Domilix Mobile App - Complete Development Requirements

## Overview
Domilix is a Cameroonian real estate and furniture marketplace. This document provides ALL information needed to develop a fully-featured mobile app version matching the web app.

API Base: https://api.domilix.com/api

---

## 1. DESIGN SYSTEM & THEMING

### Color Palette

**Primary**: #E8921A (bright orange CTA)
**Secondary**: #516071 (blue-gray)
**Tertiary**: #00658a (teal)
**Background**: #fff8f4 (warm cream)
**Error**: #ba1a1a

Primary Light: #F0A84A
Primary Container: #f5a623
On Primary: #ffffff
Secondary Container: #d1e1f5
Tertiary Container: #3ac2ff
Error Container: #ffdad6
Surface: #fff8f4
Outline: #857462

### Typography

**Fonts**:
- Headings/Nav: Plus Jakarta Sans (weights 300-800)
- Body: Manrope (weights 300-800)

**Sizes**:
- Display XL: 60px (3.75rem), 700 weight, -0.02em spacing
- Headline L: 40px (2.5rem), 700 weight, -0.01em spacing
- Headline M: 32px (2rem), 700 weight
- Headline S: 24px (1.5rem), 600 weight
- Body L: 18px (1.125rem), 400 weight
- Body M: 16px (1rem), 400 weight
- Label M: 14px (0.875rem), 600 weight, 0.05em spacing
- Caption: 12px (0.75rem), 500 weight

### Spacing (8px base)
XS: 4px | SM: 12px | Base: 8px | MD: 24px | LG: 48px | XL: 64px

### Border Radius
Default: 4px | LG: 8px | XL: 12px | 2XL: 16px | 3XL: 24px | Full: 9999px

### Shadows
Card: 0 4px 20px rgba(0,0,0,0.04)
Card Hover: 0 8px 32px rgba(0,0,0,0.10)
Navigation: 0 1px 4px rgba(0,0,0,0.06)

---

## 2. MOBILE SCREENS/PAGES

✅ Authentication Flows
  - Login (email/phone + password)
  - Sign Up (name, email/phone, password)
  - Email/Phone Verification (OTP)
  - Forgot Password (email → code → new password)
  - Reset Password

✅ Main Navigation
  - Home Screen (banner, search, featured, categories)
  - Bottom Tab Nav (Home | Search | Favorites | Notifications | Profile)
  - Floating Action Button (+ Create listing)

✅ Listings & Discovery
  - Browse Listings (grid/list, pagination/infinite scroll)
  - Search & Filter (type, location, price, amenities, sort)
  - Listing Detail (gallery, description, map, seller, unlock button)
  - Related Listings Carousel

✅ Maps Feature
  - Interactive Map (Leaflet/Mapbox)
  - Listing Markers & Clusters
  - Preview on Tap
  - Proximity Search
  - Subscription Status Badge

✅ Favorites
  - Saved Listings Grid
  - Filter & Sort
  - Remove Options
  - Empty State

✅ User Account
  - Profile View (avatar, name, email, phone, stats)
  - Edit Profile (avatar, name, email, phone, website, bio)
  - Announcer Dashboard (if applicable)
  - Create/Edit Listings
  - Settings

✅ Notifications
  - Notification Center (list, types: info/success/warning/error)
  - Mark as Read/Unread
  - Delete Individual & All Read
  - Filter Unread Only

✅ Settings
  - Language Selection
  - Dark Mode Toggle
  - Notification Preferences
  - Currency & Regional Settings
  - About, Version, Help/Support

✅ Subscriptions & Credits
  - Maps Plans (Découverte: free/12h, Starter: 2000 FCFA, Pro: 5000 FCFA, Business: 15000 FCFA)
  - Domicoins Balance (unlock contact details: 1 coin)
  - Plan Comparison
  - Purchase History
  - Payment Integration (Campay)

✅ Static Pages (Privacy, Terms, Legal, About, Contact)

---

## 3. KEY FEATURES

1. **Authentication**: Login, signup, email/phone verification, password reset, JWT token management
2. **Listings**: Browse, search, filter, view details, share, save/unsave
3. **Maps**: Interactive map with markers, clusters, proximity search, subscription tiers
4. **Favorites**: Save listings, view saved, filter, remove
5. **Announcer Tools**: Create listings, upload images, edit/delete, view analytics
6. **Notifications**: Real-time notifications, mark read, delete, center view
7. **User Profile**: View/edit profile, stats, verification badges
8. **Subscriptions**: Maps subscription plans, Domicoins balance
9. **Media**: Image upload, compression, thumbnails, Wasabi S3 storage
10. **Location Services**: Autocomplete (Geoapify), validation, map integration

---

## 4. API ENDPOINTS

Authentication:
  POST /auth/register
  POST /auth/login
  POST /auth/logout
  POST /auth/refresh
  GET /auth/me
  POST /auth/forgot-password
  POST /auth/reset-password
  POST /auth/verify-email
  POST /auth/verify-phone

Listings:
  GET /announces?page=1&per_page=20&filters
  GET /announces/:id
  POST /announces
  PATCH /announces/:id
  DELETE /announces/:id
  PATCH /announces/:id/like
  POST /announces/:id/unlock

Maps:
  GET /maps/announces
  GET /maps/listings/nearby?lat=X&lng=Y&radius=Z
  GET /maps/plans
  POST /maps/subscribe
  GET /maps/subscription
  POST /maps/cancel

Users:
  GET /users/:id
  PATCH /users/:id
  GET /users/:id/listings
  POST /users/:id/verify-email
  POST /users/:id/verify-phone

Notifications:
  GET /notifications?unread_only=false&page=1&per_page=20
  GET /notifications/unread-count
  POST /notifications/:id/read
  POST /notifications/mark-all-read
  DELETE /notifications/:id
  DELETE /notifications/read/all

Media:
  POST /uploads (multipart)
  GET /uploads/:id
  DELETE /uploads/:id

Categories:
  GET /categories
  GET /categories/:type

Addresses:
  GET /addresses/autocomplete?query=...

---

## 5. STATE MANAGEMENT (Zustand)

Auth Store: currentUser, token, login(), logout(), register(), refreshToken()
UI Store: theme, language, isDarkMode, setTheme(), toggleDarkMode()
Listings Store: listings, filters, pagination, setListings(), setFilters()
Favorites Store: favorites[], toggleFavorite(), isFavorite()
Notifications Store: notifications[], unreadCount, markAsRead(), delete()
Maps Store: listings, subscription, searchNearby(), subscribe()
Credits Store: balance, history, updateBalance()

Persistence: Use Zustand persist for auth, theme, favorites, language

---

## 6. TECHNOLOGY RECOMMENDATIONS

Framework: React Native (recommended) | Flutter | React Web/PWA
State: Zustand
Navigation: React Navigation (React Native) | React Router (web)
HTTP: Axios
Maps: react-native-mapbox-gl | react-native-maps
UI Components: React Native Paper | NativeBase
Storage: AsyncStorage (React Native) | localStorage (web)
Images: react-native-image-picker
Payments: Campay SDK
Push: Firebase Cloud Messaging

---

## 7. MOBILE OPTIMIZATIONS

Performance:
  - Lazy load images
  - Infinite scroll (not pagination)
  - Image optimization (WebP, thumbnails)
  - Virtual lists for large data
  - Code splitting by route
  - Debounce search input

UX:
  - Bottom tab navigation
  - Floating action button (FAB)
  - Modal bottom sheets for forms
  - Swipeable image galleries
  - Pull-to-refresh
  - Touch targets minimum 44x44px
  - Safe area handling (notch)
  - Loading skeletons
  - Empty states

Features:
  - Native camera access
  - Geolocation
  - Contact picker
  - Phone dialer deep linking
  - WhatsApp integration
  - Native share sheet
  - Push notifications
  - Offline mode with queue/sync

---

## 8. COMPLETE DATA TYPES

Listing Object:
{
  id, title, description, type (realestate/furniture), ad_type (location/sale),
  price, location {address, city, lat, lng},
  medias [{id, file, thumbnail, type, path}],
  amenities[], condition, announcer {id, name, avatar, email, phone, verified},
  liked, unlocked, views_count, created_at
}

User Object:
{
  id, name, email, phone_number, avatar, website, bio, announcer, is_admin,
  credits, email_verified, phone_verified, created_at
}

Notification Object:
{
  id, type (info/success/warning/error), title, message, link, read, created_at
}

Subscription Plan Object:
{
  id, label, price, duration_days, duration_hours, unlock_count
}

---

## 9. IMPLEMENTATION CHECKLIST

PHASE 1 (MVP):
  ☐ Auth (login, signup, verification)
  ☐ Browse listings (search, filter)
  ☐ View listing detail
  ☐ User profile
  ☐ Favorites
  ☐ Bottom navigation

PHASE 2:
  ☐ Maps feature
  ☐ Create/edit listings
  ☐ Notifications center
  ☐ Subscriptions UI
  ☐ Settings

PHASE 3:
  ☐ Announcer analytics
  ☐ Messaging (optional)
  ☐ Offline mode
  ☐ Push notifications
  ☐ Performance optimization

PHASE 4:
  ☐ Advanced features
  ☐ Analytics integration
  ☐ A/B testing
  ☐ App store optimization

---

## QUICK REFERENCE: Routes & Screens

| Screen | Required Auth | Key Features |
|--------|---|---|
| Home | No | Featured, search, categories |
| Login | No | Email/phone login |
| Sign Up | No | Registration |
| Search | No | Filters, results, pagination |
| Listing Detail | No | Gallery, info, contact, unlock |
| Maps | Yes* | Interactive map, subscription |
| Favorites | Yes | Saved listings |
| Profile | Yes | User info, stats |
| Notifications | Yes | Notification center |
| Settings | Yes | Preferences, language |
| Subscriptions | Yes | Plans, purchase |
| Create Listing | Yes | Form, image upload |
| Edit Listing | Yes | Edit form |

*Maps has limited features without subscription

---

This document provides EVERYTHING needed to build a production-ready mobile app!
