Master Implementation Plan: MIT ADT Student Hub (The Native App)
This document is the definitive technical blueprint for building the "MIT ADT Student Hub" from scratch. We are moving beyond HTML prototypes to a professional, scalable mobile application.

🏗️ Technical Stack
Frontend: React.js + Vite (optimized for mobile performance).
Styling: Tailwind CSS (configured for a "Modern Native" look).
Mobile Wrapper: Capacitor (to generate Android APK/iOS IPA).
Backend/Auth: Firebase (Firestore for data, Auth for 30-day persistent sessions).
Localization: i18next (English, Hindi, Marathi).
Revenue: @capacitor-community/admob (Native ads).
🚀 Execution Phases
Phase 1: Foundation & Identity (The "Engine")
Project Setup: Initialize Vite + React and integrate Capacitor.
Firebase Auth:
Implementation of Signup/Login with persistent 30-day sessions.
"By Students, For Students" value-proposition screen during signup.
Base Layout: Create the 5-Tab Navigation Bar (Faculty, Hub, Tasks, Dev, Profile) using the "Modern Native" spec (solid icons, no glassmorphism).
Phase 2: The Discovery Engine (Faculty Finder)
Data Pipeline: Convert faculty_data.csv into a structured Firestore collection or local JSON.
The Grid:
Build the high-density grid with clean Profile Cards.
Implement real-time Search and Department/Floor/Wing filters.
Detail View: Create the slide-up "Bottom Sheet" for faculty info.
Reports: Integrate the "Report an Error" logic that sends data to the Admin.
Phase 3: Community & Productivity (Campus Hub + Tasks)
Campus Hub:
Dynamic "Announcements" and "Events" sections.
Interactive Campus Calendar view.
Task Manager:
CRUD operations for student tasks (local storage or Firestore sync).
Gestures (Swipe to delete/edit) for a native feel.
Phase 4: Localization & Sessions (Personalization)
i18n Setup: Integrate English, Hindi, and Marathi translations.
Session Logic: Ensure the app remembers the user for 30 days without logout.
Developer Dev Hub: Build the "Future Roadmap" and your professional developer profile.
Phase 5: Monetization & Administration (Final Polish)
AdMob Integration:
Implementation of the "Wait 4 Seconds" logic after data loads.
Logic to insert 1 Native Ad every 5 faculty tiles.
Admin Command Center: Building the protected view for you to manage reports and update site data.
🎨 UI/UX Guardrails (The "Real App" Look)
No Glassmorphism: All blurs and semi-transparency are prohibited. Use solid White/Black/Grey surfaces.
System Typography: Use Roboto (Android) or San Francisco (iOS).
Minimalist Palette: High-contrast (White/Black) with a single Primary accent (University Blue).
Nippiness: Every transition must be under 300ms to ensure a premium feel.
🚦 Next Steps (Initial Task List)
Initialize the Project: Set up the Vite/React environment.
Setup Capacitor: Configure the mobile wrapper.
Configure Firebase: Secure the Auth and Firestore connection.
Would you like me to begin Phase 1 (Project Initialization) now?