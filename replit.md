# बस ट्रैकर - Rajasthan Local Bus Tracker

## Project Overview
A mobile-first Expo React Native app for tracking local buses in Rajasthan, India.
Hindi/Rajasthani language interface with a dark theme and orange accent (#FF9F1A).

## Architecture

### Frontend (Expo/React Native)
- **Framework**: Expo Router with file-based routing
- **Language**: TypeScript
- **UI Theme**: Dark (#09090B background, #FF9F1A primary/accent)
- **Fonts**: Inter (all weights via @expo-google-fonts/inter)

### Backend
- **Firebase Realtime Database** for buses, routes, stations data
  - Firebase Config in `lib/firebase.ts`
  - Data seeded automatically on first load via `seedFirebaseData()`
- **Express Server** (port 5000) for landing page and static assets

## Key Files

### App Screens
- `app/(tabs)/index.tsx` - Home screen with search (कहाँ से / कहाँ तक)
- `app/(tabs)/buses.tsx` - All buses list with search/filter
- `app/(tabs)/routes.tsx` - All routes list
- `app/(tabs)/settings.tsx` - App settings
- `app/bus-results.tsx` - Bus search results screen
- `app/bus-detail.tsx` - Bus detail with trips, stops, amenities

### Core Libraries
- `lib/firebase.ts` - Firebase config + TypeScript types + seed data
- `contexts/FirebaseContext.tsx` - React context for Firebase real-time data
- `constants/colors.ts` - Dark theme color palette
- `lib/query-client.ts` - React Query + API utilities

## Firebase Data Structure
```
/stations/{stationId}  - name, city, lat, lng, searchTerms
/routes/{routeId}      - name, fromStation, toStation, stops[], distances, times
/buses/{busId}         - busNumber, busName, type, fare, seats, trips[], amenities
```

## Features
- Real-time bus data from Firebase
- Station-to-station bus search
- Popular routes quick access
- Bus detail view with full trip schedule
- Delay indicators
- Crowd level indicators
- Live tracking (UI ready, backend pending)

## Running
- Frontend: `npm run expo:dev` (port 8081)
- Backend: `npm run server:dev` (port 5000)
