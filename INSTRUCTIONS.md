# PropertyBazar Mobile App (React Native/Expo)

## 🤖 INSTRUCTIONS FOR ANY AI AGENT / ASSISTANT

If you are an AI reading this file to help the user with the mobile app codebase, you **MUST** read and understand the following architecture carefully before making any changes.

### 1. Architecture Overview

- **What is this app?** This is a React Native (Expo) mobile application for "PropertyBazar".
- **The Web App:** This mobile app is closely tied to a _separate_ Web Application codebase. The web app is written in basic HTML/CSS/Vanilla JS.
- **The Backend (IMPORTANT):** Both the Web App and this Mobile App share the EXACT SAME BACKEND. The backend uses **Convex** as its database and backend-as-a-service.

### 2. Location of Codebases

- **Mobile App Codebase (You are here):** `/Users/anujkumar/Library/Mobile Documents/com~apple~CloudDocs/PropertyBazarApp`
- **Web App & Backend Codebase:** `/Users/anujkumar/Library/Mobile Documents/com~apple~CloudDocs/JaminDalal`

### 3. Rules for Modifying Code

1.  **Do NOT create a separate database:** Since the mobile app needs to display the exact same properties, users, and leads as the website, you must connect this React Native app to the existing Convex project located in the Web App folder (`JaminDalal/convex/`).
2.  **WebView Approach (Current State):** Currently, `App.tsx` is configured as a simple `WebView` shell that loads the deployed URL of the web application.
3.  **Future Native Migration (If requested):** If the user asks you to build fully native React Native screens instead of the WebView, you must use the `convex/react` library. You will need the Convex URL from the web app's environment to configure the `ConvexProvider` in this app. The database URL is: `https://veracious-caribou-870.convex.cloud`.
4.  **Admin Panel:** The Admin panel (`admin.html`) lives ONLY in the web app repository. Do not try to build admin features here unless explicitly asked. The mobile app is primarily for the end-users to browse and interact with properties.

### 4. Running the App

- Run `npx expo start` to start the Expo development server.
- You can use `npm run android` or `npm run ios` to run on simulators (if configured).

### Key Takeaway for AI:

**Always remember that data comes from the Convex backend located in the `JaminDalal` web repository. Data logic changes (like Convex functions) usually need to happen in the web repository, while only UI/display changes happen in this Repository.**
