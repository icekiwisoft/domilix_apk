# 📱 Domilix Mobile App - QUICK REFERENCE GUIDE

## ⚡ Key Takeaways

### Design System
- **Primary Brand Color**: #E8921A (Bright Orange)
- **Fonts**: Plus Jakarta Sans (headings), Manrope (body)
- **Base Spacing**: 8px
- **Dark Mode**: Supported via CSS class
- **Theme**: Material Design 3 (MD3) color tokens

### All Pages/Screens Needed (15 Main Screens)

1. ✅ **Login Screen** - Email/phone, password, forgot link
2. ✅ **Sign Up Screen** - Registration with email/phone option
3. ✅ **Email/Phone Verification** - OTP code input
4. ✅ **Home Screen** - Featured listings, search bar, categories
5. ✅ **Search & Filter Screen** - Advanced filtering, pagination
6. ✅ **Listing Detail Screen** - Gallery, description, map, seller info
7. ✅ **Maps Screen** - Interactive map with markers, subscription needed
8. ✅ **Favorites Screen** - Saved listings grid
9. ✅ **Profile Screen** - User info, stats, announcer status
10. ✅ **Edit Profile Screen** - Update personal information
11. ✅ **Notifications Screen** - Notification center with filters
12. ✅ **Settings Screen** - Language, dark mode, preferences
13. ✅ **Subscriptions Screen** - Maps plans and Domicoins balance
14. ✅ **Create/Edit Listing Screen** - Form with image upload (for announcers)
15. ✅ **Static Pages** - Privacy, Terms, Legal, About, Contact

### Bottom Navigation Structure
```
Home | Search | Favorites | Notifications | Profile
      +
    FAB (Floating Action Button) - Create Listing
```

---

## 🎨 Complete Color Reference

| Color | Hex Value | Usage |
|-------|-----------|-------|
| Primary Orange | #E8921A | Main CTAs, brand color |
| Primary Light | #F0A84A | Lighter CTAs, hover states |
| Primary Container | #f5a623 | Button backgrounds (amber) |
| Secondary | #516071 | Secondary actions |
| Tertiary | #00658a | Accents, links |
| Background | #fff8f4 | Screen background |
| Surface | #fff8f4 | Card backgrounds |
| Error | #ba1a1a | Error states |
| Text Dark | #211a12 | Body text |
| Text Light | #ffffff | On primary, on error |
| Border | #d7c3ae | Input borders, dividers |

---

## 🔤 Typography Sizes Quick Chart

```
Display XL   60px - Banner headlines
Headline L   40px - Page titles
Headline M   32px - Section headers
Headline S   24px - Subsection headers
Body L       18px - Large body text
Body M       16px - Regular body text
Label M      14px - Buttons, labels
Caption      12px - Helper text, timestamps
```

---

## 📊 Feature Categories

### Authentication (5 screens)
- Login
- Sign Up
- Email/Phone Verification
- Forgot Password
- Reset Password

### Listings & Discovery (4 screens)
- Home with Featured
- Search & Filter
- Listing Detail
- Maps View

### User Management (4 screens)
- Profile
- Edit Profile
- Announcer Dashboard
- Create/Edit Listings

### Support Features (3 screens)
- Notifications
- Subscriptions
- Settings

### Static Pages (3 screens)
- Privacy Policy
- Terms of Service
- Legal Mentions
- About, Contact

---

## 🔌 API Organization

**12 API Modules**:
1. Authentication (9 endpoints)
2. Announcements/Listings (8 endpoints)
3. Maps (6 endpoints)
4. Users (5 endpoints)
5. Favorites (2 endpoints via listings)
6. Notifications (6 endpoints)
7. Subscriptions (6 endpoints)
8. Addresses (2 endpoints)
9. Media/Uploads (3 endpoints)
10. Categories (2 endpoints)
11. User Verification (2 endpoints)
12. Stats & Analytics (implicit)

---

## 💾 State Management Structure (Zustand)

**7 Global Stores**:
1. **Auth**: User, token, login/logout
2. **UI**: Theme, language, dark mode
3. **Listings**: Browse data, filters, pagination
4. **Favorites**: Saved listings
5. **Notifications**: User notifications
6. **Maps**: Map listings, subscription
7. **Credits**: Balance, history

**Persisted to Device**: Auth, theme, language, favorites

---

## 🛠️ Technology Stack (Recommendations)

| Layer | Technology |
|-------|-----------|
| **Framework** | React Native (iOS+Android) or Flutter |
| **State Management** | Zustand (same as web) |
| **Navigation** | React Navigation (React Native) |
| **HTTP Client** | Axios (same as web) |
| **Maps** | react-native-mapbox-gl or react-native-maps |
| **Storage** | AsyncStorage (React Native) |
| **Images** | react-native-image-picker |
| **Payments** | Campay SDK |
| **Push Notifications** | Firebase Cloud Messaging |
| **UI Components** | React Native Paper or NativeBase |
| **Database** | SQLite with TanStack Query |

---

## 📲 Mobile-Specific Features

### Required
- ✅ Bottom tab navigation (not top)
- ✅ Floating action button (FAB)
- ✅ Bottom sheet modals for forms
- ✅ Swipeable image galleries
- ✅ Pull-to-refresh on listings
- ✅ 44x44px minimum touch targets
- ✅ Safe area handling (notch, etc.)
- ✅ Loading skeletons
- ✅ Infinite scroll (not pagination)

### Optional/Phase 2+
- 🔄 Offline mode with sync queue
- 📍 Native geolocation
- 📷 Native camera access
- 📞 Phone dialer integration
- 💬 WhatsApp deep linking
- 🔔 Push notifications
- 📤 Native share sheet

---

## 📈 Implementation Phases

### Phase 1 - MVP (Must Have)
1. Authentication (login, signup, verify)
2. Browse listings (search, filter)
3. View listing detail
4. User profile
5. Favorites/save
6. Bottom navigation

### Phase 2 - Core Features
1. Maps feature
2. Create/edit listings
3. Notifications center
4. Subscription management
5. Settings screen

### Phase 3 - Enhancement
1. Announcer analytics
2. Advanced filtering
3. Offline mode
4. Push notifications
5. Performance optimization

### Phase 4 - Polish
1. Advanced analytics
2. Optional messaging
3. A/B testing
4. App store optimization

---

## 🔐 Security Checklist

- ✅ Secure JWT storage (not localStorage)
- ✅ HTTPS only
- ✅ Certificate pinning (native)
- ✅ Input validation
- ✅ Password requirements
- ✅ Session timeout
- ✅ Secure password reset
- ✅ Rate limiting support
- ✅ Error message sanitization

---

## 📊 Data Objects Structure

### Ad/Listing Object
```
{
  id, title, description, type, ad_type, price,
  location: {address, city, lat, lng},
  medias: [{id, file, thumbnail}],
  amenities[], announcer: {id, name, avatar, phone},
  liked, unlocked, views_count
}
```

### User Object
```
{
  id, name, email, phone_number, avatar,
  website, bio, announcer, is_admin, credits,
  email_verified, phone_verified
}
```

### Subscription Plan
```
{
  id, label, price, duration_days, duration_hours,
  unlock_count
}
```

Plans Available:
- Découverte: Free, 12 hours
- Starter: 2000 FCFA, 30 days
- Pro: 5000 FCFA, 30 days
- Business: 15000 FCFA, 30 days

---

## 🌐 Environment Configuration

```
REACT_APP_API_BASE_URL=https://api.domilix.com/api
REACT_APP_GEOAPIFY_KEY=your_key
REACT_APP_MAPBOX_TOKEN=your_token (if using Mapbox)
REACT_APP_CAMPAY_API_KEY=your_key
```

---

## 📚 Key Data Types

**Listing Types**:
- Real Estate (houses, terrains)
- Furniture

**Ad Types**:
- Sale
- Location/Rental

**Notification Types**:
- Info (blue)
- Success (green)
- Warning (yellow)
- Error (red)

**Media Types**:
- image/jpeg
- image/png
- image/webp

---

## 🎯 Critical User Journeys

1. **Browse Listings**
   Home → Search/Filter → Results → Detail → Save/Share

2. **Create Listing** (Announcer)
   Home → FAB → Form → Upload Images → Publish

3. **View on Map**
   Home → Maps → Tap Marker → Preview → Detail

4. **Save & Manage Favorites**
   Detail → Like Button → Favorites Screen → View/Remove

5. **Subscribe for Maps**
   Maps → Subscribe CTA → Select Plan → Campay Payment → Activate

6. **Unlock Contact Details**
   Detail → Unlock Button → Deduct 1 Domicoin → Reveal Contact

---

## 📱 Screen Dimensions Guide

**Mobile Safe Areas**:
- Min width: 320px (older devices)
- Standard: 375px (iPhone SE)
- Large: 428px (iPhone Pro Max)
- Tablet: 768px+

**Safe Insets** (notch handling):
- Top: 44px (notched devices)
- Bottom: 34px (home indicator)

---

## ✅ Pre-Launch Checklist

- [ ] All 15+ screens implemented
- [ ] All API endpoints integrated
- [ ] State management stores set up
- [ ] Authentication flow tested
- [ ] Offline mode working
- [ ] Push notifications setup
- [ ] Image optimization verified
- [ ] Performance tested on slow network
- [ ] All animations smooth
- [ ] Accessibility (a11y) tested
- [ ] Dark mode working
- [ ] Localization (FR/EN) complete
- [ ] Payment integration tested
- [ ] Error handling comprehensive
- [ ] Analytics integrated
- [ ] Security review done
- [ ] App signing setup
- [ ] Store listings prepared

---

## 🚀 Deployment Targets

**iOS**: App Store Connect
**Android**: Google Play Store
**Web PWA**: Vercel or AWS (optional)

---

## 📞 Key Contacts/Resources

**Backend API**: https://api.domilix.com/api
**Web App**: https://domilix.com
**Admin Dashboard**: https://admin.domilix.com
**Support Contact**: [From backend]

---

**Total Screens: 15+**
**Total API Endpoints: 50+**
**State Management Stores: 7**
**Color Tokens: 30+**
**Typography Sizes: 8**

✨ You have everything needed to build a production-ready mobile app!
