# 🏋️ Gym Progress Tracker

A complete **offline-first** gym workout tracking mobile app built with React Native & TypeScript.

## ✨ Features

- **100% Offline** — No internet, no cloud, no Firebase. All data stored locally
- **Daily Workout Reminders** — Push notification at 6 PM (customizable)
- **Customizable Schedule** — Pick workout/rest days and assign exercises per day
- **Exercise Management** — Add custom exercises with muscle group categorization
- **Workout Tracking** — Sets, reps, weight with checkbox completion
- **Auto-Completion** — Workout auto-completes when all sets are checked
- **Rest Timer** — Configurable countdown timer (default 90s) between sets
- **Progressive Overload** — Smart suggestions to increase weight based on history
- **Exercise History** — Per-exercise log with date, weight, sets, reps
- **Statistics Dashboard** — Total workouts, streak, consistency, volume charts
- **Modern Dark UI** — Premium dark theme with smooth animations

## 🛠 Tech Stack

| Technology | Purpose |
|---|---|
| React Native (Expo SDK 57) | App framework |
| TypeScript | Type safety |
| React Navigation v7 | Screen navigation |
| Zustand | State management |
| expo-sqlite | Local SQLite database |
| AsyncStorage | Settings persistence |
| expo-notifications | Local push notifications |
| React Native Reanimated | Smooth animations |
| Gifted Charts | Statistics charts |
| Day.js | Date utilities |

## 📁 Project Structure

```
src/
├── assets/           # Static assets
├── components/       # Reusable UI components
│   ├── common/       # Button, Card, Modal, Badge, etc.
│   ├── workout/      # ExerciseRow, SetInput, RestTimer
│   └── stats/        # StatBlock, ChartCard
├── screens/          # App screens (7 screens)
├── navigation/       # React Navigation setup
├── database/         # SQLite operations
├── store/            # Zustand state stores
├── hooks/            # Custom React hooks
├── services/         # Business logic
├── utils/            # Utilities & constants
├── types/            # TypeScript definitions
└── theme/            # Design system tokens
```

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Start development server
npx expo start

# Run on Android
npx expo start --android

# Run on iOS
npx expo start --ios
```

## 📱 Screens

1. **Home** — Dashboard with weekly schedule, today's workout, streak
2. **Exercises** — Exercise library with search & muscle group filters
3. **Workout** — Active workout with set tracking & rest timer
4. **Exercise Detail** — Progressive overload chart & history
5. **Stats** — Statistics dashboard with charts
6. **History** — Workout history log
7. **Settings** — Notifications, timer, schedule, theme config

## 📊 Database Schema

- `exercises` — Exercise definitions with muscle groups
- `workouts` — Workout sessions by date
- `workout_exercises` — Exercises assigned to workouts
- `workout_sets` — Individual sets (reps, weight, completion)
- `exercise_history` — Aggregated data for progressive overload

---

Built with 💪 — No internet required. Your data stays on your device.
