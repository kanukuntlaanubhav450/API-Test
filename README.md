**API-Test**
## 🚀 Live Demo

- **Frontend (Netlify):**  
  https://meek-bubblegum-a0a5f7.netlify.app/

- **Backend API (Render):**  
  https://api-tester-backend-2fog.onrender.com/


  ### How to use
1. Open the frontend link
2. Sign up or log in
3. Enter any public API URL
4. Send requests and save them to collections



- **What:**: A lightweight API testing app (React + Vite frontend) with a small Node/Express proxy backend used to forward requests and avoid CORS. Persisted user data (history, collections, login events) is stored in Firestore via Firebase in the frontend.
- **Status:**: Local development-ready. Requires Firebase project + environment variables.

**Features**
- **Request builder**: Build and send HTTP requests (method, headers, params, body).
- **Proxy backend**: Forwards requests to target servers and returns status, headers, and body.
- **History**: Saves user request history to Firestore (per-user).
- **Collections**: Save requests into named collections with item metadata.
- **Authentication**: Firebase Authentication for login/signup flows.

**Repository Layout**
- **Backend**: simple proxy server and placeholder save endpoints — [Backend/index.js](Backend/index.js)
- **Frontend**: React + Vite app — [frontend](frontend)
- **Key frontend files**:
  - History utilities: [frontend/src/utils/history.js](frontend/src/utils/history.js)
  - Collections utilities: [frontend/src/utils/collections.js](frontend/src/utils/collections.js)
  - Firebase config: [frontend/src/firebase.js](frontend/src/firebase.js)
  - Main app: [frontend/src/App.jsx](frontend/src/App.jsx)
  - Login page: [frontend/src/auth/Login.jsx](frontend/src/auth/Login.jsx)

**Prerequisites**
- Node.js (v16+ recommended)
- npm or yarn
- A Firebase project with Authentication (Email/Password) and Firestore enabled

**Environment variables**
Create environment files for backend and frontend as needed.

- Backend `.env` (Backend/.env):

  - `PORT` (optional): port to run the Express server (defaults to `5000`)

- Frontend `.env` (use Vite `.env.local` at project root or frontend/.env):

  - `VITE_API_URL`: URL of the backend proxy (e.g. `http://localhost:5000`). If not set the app defaults to `http://localhost:5000`.
  - `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_STORAGE_BUCKET`, `VITE_FIREBASE_MESSAGING_SENDER_ID`, `VITE_FIREBASE_APP_ID`, `VITE_FIREBASE_MEASUREMENT_ID` — Firebase config values used by [frontend/src/firebase.js](frontend/src/firebase.js).

Example `.env.local` for the frontend (place in `frontend`):

```powershell
# frontend/.env.local
VITE_API_URL=http://localhost:5000
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXX
```

**Install & Run (local development)**

- Backend

```powershell
cd Backend
npm install
# start with node (index.js listens on PORT or 5000)
node index.js
```

- Frontend

```powershell
cd frontend
npm install
npm run dev
```

Open the site at the Vite dev URL (usually `http://localhost:5173`).

**How it works (quick)**
- The frontend sends a POST to `/proxy` on the backend with a JSON payload `{ url, method, headers, body }` — see [Backend/index.js](Backend/index.js).
- The backend forwards the request using `axios` and returns `{ status, statusText, data, headers }`.
- When users are authenticated, history is saved to Firestore via client-side helpers in [frontend/src/utils/history.js](frontend/src/utils/history.js).
- Collections and collection-items are managed by helpers in [frontend/src/utils/collections.js](frontend/src/utils/collections.js). Those utilities include validation, pagination support, and safe document id handling.

**Firebase / Firestore notes**
- Ensure Firestore rules permit the operations you want during development (or test with permissive rules).
- Data layout (client-side helpers expect): `users/{uid}/history` for user history. Saved collections use `savedCollections/{uid}/collections/{collectionId}` and `.../items` for saved items.

**Troubleshooting**
- If you see `"No URL provided"` from the proxy, check the browser DevTools Network tab for the `/proxy` request payload — ensure the JSON payload contains the `url` field.
- If you get ReferenceError messages from the backend, check the backend terminal for stack traces and ensure the frontend is sending a proper JSON body with `Content-Type: application/json`.

**Development tips**
- Backend: add temporary `console.log(req.body)` near the top of the `/proxy` handler in [Backend/index.js](Backend/index.js) to inspect incoming payloads while debugging (remove later).
- Frontend: the Firebase config reads values from `import.meta.env.VITE_*`. Make sure `.env.local` is loaded by Vite and restart the dev server when you change env files.

**Testing**
- You can test the backend proxy directly with curl (PowerShell example):

```powershell
curl -X POST http://localhost:5000/proxy -H "Content-Type: application/json" -d '{"url":"https://httpbin.org/get","method":"GET"}'
```

**Contributing**
- Fixes, improvements and PRs are welcome. Please open an issue describing the change and a short PR.

**License**
- MIT (add LICENSE file if you want to publish)

**Helpful links / Key files**
- Proxy backend: [Backend/index.js](Backend/index.js)
- Frontend main: [frontend/src/App.jsx](frontend/src/App.jsx)
- Firebase config: [frontend/src/firebase.js](frontend/src/firebase.js)
- History helpers: [frontend/src/utils/history.js](frontend/src/utils/history.js)
- Collections helpers: [frontend/src/utils/collections.js](frontend/src/utils/collections.js)
- Login page: [frontend/src/auth/Login.jsx](frontend/src/auth/Login.jsx)

## 🤝 Author
Developed by **Anubhav Kumar Kanukuntla**.
