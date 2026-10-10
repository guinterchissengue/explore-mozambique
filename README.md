# Explore Mozambique API

REST API for discovering and managing tourist, cultural, historical, natural and recreational places in Mozambique. Built with Node.js, Express and MongoDB (Mongoose), documented with Swagger/OpenAPI, secured with **OAuth (GitHub)** and local accounts, and deployed on Render.

- **Swagger UI (deployed):** https://explore-mozambique.onrender.com/api-docs
- **Base URL (deployed):** https://explore-mozambique.onrender.com
- **Swagger file:** [`Swagger.json`](./Swagger.json) (also served at `/Swagger.json`)

> Render's free plan sleeps after inactivity: the first request can take ~30–60 s.

## Features
- Full CRUD (GET, POST, PUT, DELETE) for **two collections**: `places` and `reviews`
- **Authentication:** GitHub OAuth (Passport) and local register/login with **bcrypt-hashed passwords**
- **Protected routes:** POST, PUT and DELETE on `places` and `reviews`, plus `GET /auth/profile`, require login (401 otherwise). GET routes stay public
- Sessions stored in MongoDB (`sessions` collection) with secure, httpOnly cookies
- Server-side validation on POST and PUT for both collections (Joi + Mongoose)
- `try/catch` error handling in every route, consistent JSON responses
- Correct HTTP status codes (200, 201, 400, 401, 404, 409, 500)
- Interactive, testable Swagger UI at `/api-docs` (security documented)
- No secrets in the repository (`.env` is git-ignored)

## Technologies
Node.js 18+, Express, MongoDB Atlas, Mongoose, Joi, Passport (GitHub + Local strategies), express-session, connect-mongo, bcryptjs, swagger-ui-express, dotenv, cors.

## Project structure
```
config/       passport.js              (GitHub OAuth + local strategies)
controllers/  placesController.js, reviewsController.js, authController.js
models/       Place.js, Review.js, User.js
routes/       places.js, reviews.js, auth.js
middleware/   validation.js, errorHandler.js, auth.js (requireAuth)
db/           connect.js
app.js        server.js        Swagger.json        .env.example        README.md
```

## Database structure
- **places** (12 fields): `name`, `description`, `city`, `province`, `type`, `averageCost`, `rating`, `latitude`, `longitude`, `openingHours`, `featured`, `createdBy`, plus `createdAt`, `updatedAt`
- **reviews**: `placeId` (ref → places), `visitorName`, `rating`, `comment`, `visitDate`, `createdBy`, `createdAt`, `updatedAt`
- **users**: `username`, `displayName`, `email`, `passwordHash` (bcrypt), `githubId`, `avatarUrl`, `provider`, `role`, `lastLogin`, `createdAt`, `updatedAt`
- **sessions**: created automatically by connect-mongo

## Installation & running locally
```bash
git clone <your-repo-url>
cd explore-mozambique
npm install
cp .env.example .env      # then edit .env with YOUR values
npm start                 # or: npm run dev
```
Open http://localhost:3000/api-docs

### Environment variables
| Variable | Description |
|---|---|
| `MONGODB_URI` | Atlas connection string **including the database name**, e.g. `mongodb+srv://USER:PASSWORD@cluster.mongodb.net/explore-mozambique?retryWrites=true&w=majority` |
| `SESSION_SECRET` | Long random string that signs the session cookie (required in production) |
| `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` | From your GitHub OAuth App |
| `GITHUB_CALLBACK_URL` | `https://YOUR-RENDER-URL.onrender.com/auth/github/callback` (or the localhost one) |
| `PORT` | Local port (Render sets it automatically) |
| `NODE_ENV` | `development` or `production` |

`.env` format: one `KEY=value` per line, no quotes, never commit it.

## Authentication (OAuth)

### Create the GitHub OAuth App
1. GitHub → **Settings → Developer settings → OAuth Apps → New OAuth App**
2. **Homepage URL:** `https://explore-mozambique.onrender.com`
3. **Authorization callback URL:** `https://explore-mozambique.onrender.com/auth/github/callback`
4. Copy the **Client ID**, generate a **Client secret**, and set them (with `SESSION_SECRET` and `GITHUB_CALLBACK_URL`) in Render → Environment.
5. For local testing create a second OAuth App with callback `http://localhost:3000/auth/github/callback` and put its values in your local `.env`.

### Login flow
- **GitHub:** open `/auth/github` in the browser → GitHub authorization → redirected back to `/api-docs` logged in.
- **Local account:** `POST /auth/register` (password stored only as a bcrypt hash), then `POST /auth/login`.
- **Check:** `GET /auth/status`. **Logout:** `POST /auth/logout`.
- Swagger UI sends the session cookie automatically, so after logging in you can execute the protected requests from `/api-docs`.

### Protected routes (401 when not logged in)
`POST /places`, `PUT /places/{id}`, `DELETE /places/{id}`, `POST /reviews`, `PUT /reviews/{id}`, `DELETE /reviews/{id}`, `GET /auth/profile`

## API endpoints
| Method | Endpoint | Access | Success | Errors |
|---|---|---|---|---|
| POST | `/auth/register` | public | 201 | 400, 409, 500 |
| POST | `/auth/login` | public | 200 | 400, 401, 500 |
| POST | `/auth/logout` | public | 200 | 500 |
| GET | `/auth/status` | public | 200 | 500 |
| GET | `/auth/profile` | **protected** | 200 | 401, 500 |
| GET | `/auth/github` | public | 302 | 503 |
| GET | `/places` | public | 200 | 500 |
| GET | `/places/:id` | public | 200 | 400, 404, 500 |
| POST | `/places` | **protected** | 201 | 400, 401, 500 |
| PUT | `/places/:id` | **protected** | 200 | 400, 401, 404, 500 |
| DELETE | `/places/:id` | **protected** | 200 | 400, 401, 404, 500 |
| GET | `/reviews` | public | 200 | 500 |
| GET | `/reviews/:id` | public | 200 | 400, 404, 500 |
| POST | `/reviews` | **protected** | 201 | 400, 401, 500 |
| PUT | `/reviews/:id` | **protected** | 200 | 400, 401, 404, 500 |
| DELETE | `/reviews/:id` | **protected** | 200 | 400, 401, 404, 500 |
| GET | `/health` | public | 200 | – |

Response format: `{ "success": true, "data": {} }`, `{ "success": true, "count": 2, "data": [] }`, `{ "success": true, "message": "Place created successfully", "data": {} }`, `{ "success": false, "message": "Place not found" }`.

## Validation
**Place:** name ≥ 3 chars; description ≥ 10; city, province required; type in accepted list; averageCost number ≥ 0; rating 0–5; latitude −90..90; longitude −180..180; openingHours string; featured boolean.
**Review:** placeId valid ObjectId of an existing place; visitorName ≥ 2; rating 1–5; comment ≥ 5; visitDate valid date; createdAt automatic.
**Register:** username ≥ 3, valid email, password ≥ 8 characters.

Invalid data returns `400`:
```json
{ "success": false, "message": "Validation failed", "errors": ["Name must be at least 3 characters", "Rating must be between 0 and 5"] }
```

## Error handling
Every controller function wraps its work in `try/catch`. Validation / bad ObjectId → 400, not authenticated → 401, not found → 404, duplicate email → 409, unexpected errors → 500 with the generic message `Internal server error` (no stack traces, no connection strings). Malformed JSON → 400. Unknown routes → 404.

## Testing instructions
1. Open `/api-docs`. Without logging in, try `POST /places` → **401**.
2. Log in: open `/auth/github` in the browser (or `POST /auth/register` + `POST /auth/login`). Check `GET /auth/status`.
3. Execute POST, PUT, DELETE on places and reviews → 201 / 200 / 200. After each, refresh the collection in MongoDB Atlas/Compass.
4. Invalid bodies (while logged in):
   - Place: `{"name":"A","description":"Short","province":"Maputo","type":"invalid-type","averageCost":-100,"rating":10}` → 400
   - Review: `{"placeId":"invalid-id","visitorName":"","rating":10,"comment":""}` → 400
5. Error handling: `GET /places/invalid-id` → 400; `GET /places/665f1a2b3c4d5e6f7a8b9c0d` → 404.
6. `POST /auth/logout`, then `POST /places` → 401 again.

## Render deployment
1. Push the repo to GitHub (without `.env`).
2. Render → Web Service → connect the repo. Build: `npm install`. Start: `npm start`.
3. **Environment** tab → add `MONGODB_URI`, `NODE_ENV=production`, `SESSION_SECRET`, `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, `GITHUB_CALLBACK_URL`.
4. Atlas → Network Access → allow `0.0.0.0/0` (or Render's IPs).
5. Deploy, then open `/health` and confirm `database` is `explore-mozambique`.

## Security notes
`.env` is in `.gitignore`; only `.env.example` (placeholders) is committed. Passwords are stored only as bcrypt hashes; session cookies are httpOnly and `secure` in production; OAuth secrets and the session secret live only in environment variables. Before pushing: `git ls-files | grep -i env` must list only `.env.example`, and `git grep -iE "mongodb\+srv://[^ ]*:[^ ]*@"` must find nothing with credentials. If a secret was ever committed or shared, rotate it.
