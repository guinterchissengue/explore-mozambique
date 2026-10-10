# Video script (5–8 min) — use ONLY the Render URL

Rubric: API endpoints + Swagger (30) · Validation (10) · Error handling (10) · Deployment (10) · OAuth (30) · Database in Compass (10)

1. Intro: name, purpose, stack, 2 collections + users, OAuth with GitHub.
2. Swagger at /api-docs: show security (Authorize/lock icons), auth endpoints, Swagger.json in VS Code.
3. Not logged in: GET /places 200; POST /places 401; PUT/DELETE 401; GET /auth/profile 401.
4. Log in: open /auth/github in the address bar -> back on /api-docs; GET /auth/status authenticated:true; GET /auth/profile 200. (Optional: POST /auth/register + /auth/login; show passwordHash in Compass.)
5. CRUD while logged in: POST place 201 (Compass), PUT rating 4.6->4.9 200 (Compass shows 4.9), POST review 201, PUT review 200, DELETE review/place 200 (Compass).
6. Validation: invalid POST + PUT for places and reviews -> 400.
7. Error handling: try/catch in code, GET /places/invalid-id 400, valid unknown id 404.
8. Logout: POST /auth/logout, then POST /places -> 401 again.
9. Compass: database explore-mozambique, collections places (12 fields), reviews, users, sessions.
10. Deployment/security: Render URL in address bar, GitHub has no .env, only .env.example.

Invalid place: {"name":"A","description":"Short","province":"Maputo","type":"invalid-type","averageCost":-100,"rating":10}
Invalid review: {"placeId":"invalid-id","visitorName":"","rating":10,"comment":""}
Tip: open the Render URL 1 minute before recording to wake the free instance.
