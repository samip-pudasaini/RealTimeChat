# RealTimeChat

A full-stack real-time chat application built with the MERN stack and Socket.IO. Users can sign up, log in, see who's online, and exchange text and image messages instantly.

**Live demo:** [https://realtimechat-72l7.onrender.com/](https://realtimechat-72l7.onrender.com/)

**Live tech stack:**
- **Frontend:** React 19, Vite, Zustand (state management), Tailwind CSS + DaisyUI, React Router, Axios, Socket.IO client
- **Backend:** Node.js, Express 5, MongoDB (Mongoose), Socket.IO, JWT authentication, Cloudinary (image uploads)

---

## Features

- Email/password authentication with JWT stored in an HTTP-only cookie
- Real-time messaging via Socket.IO (no page refresh needed)
- Online/offline user presence indicator
- Text and image messages (images uploaded to Cloudinary)
- Profile picture updates
- Persistent chat history stored in MongoDB

---

## Project Structure

```
RealTimeChat/
├── package.json                # Root scripts to build/start both apps together
├── backend/
│   ├── package.json
│   └── src/
│       ├── index.js            # Express app entry point
│       ├── controllers/
│       │   ├── auth.controller.js
│       │   └── message.controller.js
│       ├── middleware/
│       │   └── auth.middleware.js   # JWT verification (protectRoute)
│       ├── models/
│       │   ├── user.model.js
│       │   └── message.model.js
│       ├── routes/
│       │   ├── auth.route.js
│       │   └── message.route.js
│       ├── lib/
│       │   ├── db.js           # MongoDB connection
│       │   ├── socket.js       # Socket.IO server + online user tracking
│       │   ├── cloudinary.js   # Cloudinary config
│       │   └── utils.js        # JWT token generation
│       └── seeds/
│           └── user.seed.js
└── frontend/
    ├── package.json
    └── src/
        ├── main.jsx / App.jsx
        ├── pages/               # HomePage, LoginPage, SignUpPage, ProfilePage, SettingsPage
        ├── components/          # ChatContainer, ChatHeader, MessageInput, sideBar, navBar, etc.
        ├── store/               # Zustand stores: useAuthStore, useChatStore, useThemeStore
        └── lib/
            └── axios.js         # Configured Axios instance
```

---

## Prerequisites

- Node.js (v18+ recommended)
- A MongoDB database (local or MongoDB Atlas)
- A [Cloudinary](https://cloudinary.com/) account (for image uploads)

---

## Environment Variables

Create a `.env` file inside the **`backend/`** folder with the following:

```env
PORT=5001
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret

CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

NODE_ENV=development
```

> The frontend expects the backend to run on `http://localhost:5001` in development (see `frontend/src/store/useAuthStore.js`), and the backend's CORS config only allows `http://localhost:5173` (Vite's default dev port).

---

## Installation & Setup

Clone the repo and install dependencies for both apps:

```bash
git clone https://github.com/samip-pudasaini/RealTimeChat.git
cd RealTimeChat

# Install backend deps
cd backend
npm install

# Install frontend deps
cd ../frontend
npm install
```

Or use the root script, which does both plus a production frontend build:

```bash
npm run build
```

### Running in development

Open two terminals:

```bash
# Terminal 1 — backend (with nodemon)
cd backend
npm run dev
```

```bash
# Terminal 2 — frontend
cd frontend
npm run dev
```

The frontend will be available at `http://localhost:5173`, and it talks to the backend at `http://localhost:5001`.

### Running in production

```bash
npm run build     # builds frontend, installs backend deps
npm run start      # starts the backend, which also serves the built frontend
```

When `NODE_ENV=production`, the Express server serves the compiled frontend (`frontend/dist`) and handles client-side routing.

---

## API Reference

Base URL: `/api`

### Auth routes — `/api/auth`

| Method | Endpoint           | Auth required | Description                          |
|--------|---------------------|:--------------:|---------------------------------------|
| POST   | `/signup`            | No             | Create a new account (min. 8-char password) |
| POST   | `/login`             | No             | Log in, sets `jwt` HTTP-only cookie   |
| POST   | `/logout`            | No             | Clears the auth cookie                |
| PUT    | `/update-profile`    | Yes            | Upload/update profile picture (Cloudinary) |
| GET    | `/check`             | Yes            | Returns the currently authenticated user |

### Message routes — `/api/message`

| Method | Endpoint       | Auth required | Description                                  |
|--------|----------------|:--------------:|-----------------------------------------------|
| GET    | `/user`        | Yes            | List all other users (for the sidebar)        |
| GET    | `/:id`         | Yes            | Get the message history with a specific user  |
| POST   | `/send/:id`    | Yes            | Send a message (text and/or image) to a user  |

Authenticated routes are protected by `protectRoute` middleware, which reads the `jwt` cookie, verifies it, and attaches the corresponding user to `request.user`.

---

## Real-time Events (Socket.IO)

| Event              | Direction        | Payload                  | Purpose                                  |
|--------------------|-------------------|---------------------------|--------------------------------------------|
| `connection`        | client → server  | `query.userId`             | Registers a connected user's socket ID     |
| `getOnlineUsers`    | server → client  | array of online user IDs   | Broadcast whenever users connect/disconnect |
| `newMessage`        | server → client  | message object              | Delivered to the recipient in real time    |
| `disconnect`        | client → server  | —                          | Removes the user from the online map       |

The server keeps an in-memory `userSocketMap` (`{ userId: socketId }`) to know where to route each `newMessage` event.

---

## Data Models

**User**
- `email` (unique, required)
- `fullName` (required)
- `password` (hashed with bcrypt, required)
- `profilePic` (optional, defaults to empty string)
- `timestamps` (createdAt / updatedAt)

**Message**
- `senderId` / `receiverId` (references to `User`)
- `text` (optional)
- `image` (optional, Cloudinary URL)
- `timestamps`

---

## Notes

- Passwords are hashed with `bcryptjs` before storage; plaintext passwords are never persisted.
- JWTs are issued on signup/login and stored as an `httpOnly`, `sameSite=strict` cookie to reduce XSS/CSRF risk.

---

## Deployment

This app is deployed on **Render** as a single web service. The Express backend serves the compiled React frontend directly (see the `NODE_ENV === "production"` block in `backend/src/index.js`), so there's one URL, one origin, and no separate static hosting.

**Live app:** [https://realtimechat-72l7.onrender.com/](https://realtimechat-72l7.onrender.com/)

### Render service settings

| Setting        | Value                                            |
|----------------|---------------------------------------------------|
| Root directory | repo root                                          |
| Build command  | `npm run build` (installs backend + frontend deps, builds the frontend with Vite) |
| Start command  | `npm run start` (runs `node backend/src/index.js`) |
| Environment    | Node                                               |

### Production environment variables (set in the Render dashboard, not committed)

```env
PORT=10000                # Render injects its own PORT; the app just needs to read it via process.env.PORT
NODE_ENV=production
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

### Same-origin architecture note

Because frontend and backend are served from the same Render service/origin, the CORS config hardcoded to `http://localhost:5173` (in `backend/src/index.js` and `backend/src/lib/socket.js`) only matters for **local development** — it doesn't block the deployed app since browser requests from the deployed frontend to its own backend are same-origin. This would need to be updated to the deployed origin only if the frontend and backend were ever split into separate Render services.

Similarly, `useAuthStore.js` on the frontend uses a relative Socket.IO connection (`BASE_URL = "/"`) in production, which naturally resolves to the same host — no extra config needed there.

### Known issues / troubleshooting

- **`path-to-regexp` version mismatch on Render:** Express 5's router dependency chain can resolve to an incompatible `path-to-regexp` version during a fresh Render build, causing deploy failures (typically a `TypeError` thrown from route matching at startup). This is pinned via the `overrides` field in `backend/package.json`:
  ```json
  "overrides": {
    "path-to-regexp": "6.3.0",
    "router": { "path-to-regexp": "6.3.0" }
  }
  ```
  If a similar failure resurfaces after a dependency bump, check whether the override is still being honored by Render's build cache (a clean build / cache clear on Render usually resolves it).
- **Cold starts:** Render's free tier spins down inactive services; the first request after idle time can take 30–60 seconds to respond while the service wakes up.

---

## License

ISC (as declared in `package.json`). Update this section if you intend a different license for public use.
