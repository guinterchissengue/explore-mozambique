# Explore Mozambique API

REST API for discovering and managing tourist, cultural, historical, natural and recreational places in Mozambique. Built with Node.js, Express and MongoDB (Mongoose), documented with Swagger/OpenAPI and deployed on Render.

- **Swagger UI (deployed):** https://cse341-003-web-services.onrender.com/api-docs
- **Base URL (deployed):** https://cse341-003-web-services.onrender.com
- **Swagger file:** [`Swagger.json`](./Swagger.json) (also served at `/Swagger.json`)

> Render's free plan sleeps after inactivity: the first request can take ~30–60 s.

## Features
- Full CRUD (GET, POST, PUT, DELETE) for **two collections**: `places` and `reviews`
- Server-side validation on **POST and PUT** for both collections (Joi + Mongoose schema validation)
- `try/catch` error handling in every route, consistent JSON responses
- Correct HTTP status codes (200, 201, 400, 404, 500)
- Interactive, testable Swagger UI at `/api-docs`
- Reviews must reference an existing place
- No secrets in the repository (`.env` is git-ignored)

## Technologies
Node.js 18+, Express, MongoDB Atlas, Mongoose, Joi, swagger-ui-express, dotenv, cors.

## Project structure
```
controllers/  placesController.js, reviewsController.js
models/       Place.js, Review.js
routes/       places.js, reviews.js
middleware/   validation.js, errorHandler.js
db/           connect.js
Swagger.json  server.js  package.json  .env.example  .gitignore  README.md
```

## Database structure
**places**: `name`, `description`, `city`, `province`, `type` (beach, national-park, historical, cultural, island, waterfall, reserve, museum, monument, other), `averageCost`, `rating`, `latitude`, `longitude`, `openingHours`, `featured`, `createdAt`, `updatedAt`

**reviews**: `placeId` (ref → places), `visitorName`, `rating`, `comment`, `visitDate`, `createdAt`, `updatedAt`

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
| `MONGODB_URI` | MongoDB Atlas connection string **including the database name**, e.g. `mongodb+srv://USER:PASSWORD@cluster.mongodb.net/explore-mozambique?retryWrites=true&w=majority` |
| `PORT` | Local port (Render sets it automatically) |
| `NODE_ENV` | `development` or `production` |

`.env` format: one `KEY=value` per line, no quotes, no spaces, never commit it.

## API endpoints
| Method | Endpoint | Success | Errors |
|---|---|---|---|
| GET | `/places` | 200 | 500 |
| GET | `/places/:id` | 200 | 400, 404, 500 |
| POST | `/places` | 201 | 400, 500 |
| PUT | `/places/:id` | 200 | 400, 404, 500 |
| DELETE | `/places/:id` | 200 | 400, 404, 500 |
| GET | `/reviews` | 200 | 500 |
| GET | `/reviews/:id` | 200 | 400, 404, 500 |
| POST | `/reviews` | 201 | 400, 500 |
| PUT | `/reviews/:id` | 200 | 400, 404, 500 |
| DELETE | `/reviews/:id` | 200 | 400, 404, 500 |
| GET | `/health` | 200 | – (shows which database is connected) |

Response format: `{ "success": true, "data": {} }`, `{ "success": true, "count": 2, "data": [] }`, `{ "success": true, "message": "Place created successfully", "data": {} }`, `{ "success": false, "message": "Place not found" }`.

## Validation
**Place:** name ≥ 3 chars; description ≥ 10; city, province required; type in accepted list; averageCost number ≥ 0; rating 0–5; latitude −90..90; longitude −180..180; openingHours string; featured boolean.
**Review:** placeId valid ObjectId of an existing place; visitorName ≥ 2; rating 1–5; comment ≥ 5; visitDate valid date; createdAt automatic.

Invalid data returns `400`:
```json
{ "success": false, "message": "Validation failed", "errors": ["Name must be at least 3 characters", "Rating must be between 0 and 5"] }
```

## Error handling
Every controller function wraps its database work in `try/catch`. Validation / bad ObjectId → 400, not found → 404, unexpected errors → 500 with the generic message `Internal server error` (no stack traces, no connection strings). Malformed JSON → 400. Unknown routes → 404.

## Testing instructions
1. Open `/api-docs`, click an endpoint → **Try it out** → **Execute**.
2. Invalid test bodies:
   - Place: `{"name":"A","description":"Short","province":"Maputo","type":"invalid-type","averageCost":-100,"rating":10}` → 400
   - Review: `{"placeId":"invalid-id","visitorName":"","rating":10,"comment":""}` → 400
3. Error handling: `GET /places/invalid-id` → 400; `GET /places/665f1a2b3c4d5e6f7a8b9c0d` → 404.
4. After POST/PUT/DELETE, refresh the collection in MongoDB Atlas (Browse Collections) to confirm the change.

## Render deployment
1. Push the repo to GitHub (without `.env`).
2. Render → New → Web Service → connect the repo. Build: `npm install`. Start: `npm start`.
3. **Environment** tab → add `MONGODB_URI` (full Atlas string with database name) and `NODE_ENV=production`.
4. Atlas → Network Access → allow `0.0.0.0/0` (or Render's IPs).
5. Deploy, then open `/health` and confirm `database` is `explore-mozambique`.

### Render shows old data?
Render never reads your local `.env`. If it returns old data: (a) Environment → edit `MONGODB_URI` so it points to the **new** cluster/database, save, **Manual Deploy → Deploy latest commit** (or *Clear build cache & deploy*); (b) make sure the URI contains the database name (`...mongodb.net/explore-mozambique?...`), otherwise MongoDB uses `test`; (c) check `/health`; (d) confirm you are in the right Render service and the right GitHub branch/repo.

## Security notes
`.env` is in `.gitignore`; only `.env.example` (placeholders) is committed. Before pushing: `git ls-files | grep -i env` must only list `.env.example`, and `git grep -i "mongodb+srv"` must find nothing with credentials. If a password was ever committed or shared, rotate it in Atlas.

## Future OAuth implementation
Planned: GitHub/Google OAuth (Passport.js) with sessions or JWT to protect POST, PUT and DELETE while keeping GET public.
