# Video script (5–8 min) — use ONLY the Render URL

1. **Intro (30s):** Explore Mozambique API; Node/Express/MongoDB/Swagger/Render; collections `places` and `reviews`.
2. **Swagger:** open `https://cse341-003-web-services.onrender.com/api-docs`; show endpoints and schemas. Show `/health` → database name.
3. **GET:** `GET /places`, `GET /reviews` → 200.
4. **POST:** create the Ponta do Ouro place (default example) → 201; show it in MongoDB Atlas. Copy `_id`. Create a review using that `_id` → 201.
5. **PUT (critical):** `PUT /places/{id}` change `rating` 4.6 → 4.9 → 200; refresh Atlas and show `rating: 4.9`. Repeat for the review.
6. **DELETE:** delete review, then place → 200; refresh Atlas, document gone.
7. **Validation:** invalid POST + invalid PUT for places and reviews → 400 with `errors` (bodies below).
8. **Error handling:** `GET /places/invalid-id` → 400; `GET /places/665f1a2b3c4d5e6f7a8b9c0d` → 404.
9. **GitHub:** show repo has no `.env`, only `.env.example`.

Invalid place: `{"name":"A","description":"Short","province":"Maputo","type":"invalid-type","averageCost":-100,"rating":10}`
Invalid review: `{"placeId":"invalid-id","visitorName":"","rating":10,"comment":""}`
Tip: open the Render URL 1 minute before recording to wake the free instance.
