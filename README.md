# 🗺️ Trip Planner

A real-time road trip planner with Firebase Firestore sync. Add stops, set stay durations and drive times — all later stops shift automatically.

## Features

- **Real-time sync** via Firebase Firestore
- **Multiple trips** — manage several trips from the sidebar
- **Auto time-shifting** — change a stay duration and all later arrivals update instantly
- **Drag & drop** reordering of stops
- **Inline editing** — click ✎ on any stop to edit all fields
- **Drive time editor** — click the hours between stops to adjust
- **Persistent** — changes save automatically with 600ms debounce

## Tech stack

- React 18 + Vite
- Firebase Firestore v10
- @dnd-kit for drag & drop
- CSS Modules

## Setup

```bash
npm install
npm run dev
```

## Firebase setup

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project (`trip-planner-edb2f`)
3. Firestore Database → Create database (test mode is fine)
4. The app will auto-create a `trips` collection on first use

## Deploy to Firebase Hosting

```bash
npm install -g firebase-tools
firebase login
firebase init hosting   # public dir: dist, SPA: yes
npm run build
firebase deploy
```

## Project structure

```
src/
  firebase.js          # Firebase init & Firestore instance
  firebaseService.js   # All Firestore read/write functions
  useTrips.js          # React hook — state + Firebase sync
  utils.js             # Time calculations, formatting, defaults
  App.jsx              # Root component, drag & drop wiring
  components/
    TripSidebar.jsx    # Trip list / selector
    TripHeader.jsx     # Name, dates, stats bar
    StopCard.jsx       # Individual stop with inline editing
    DriveSegment.jsx   # Drive hours widget between stops
```
