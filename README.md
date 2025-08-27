# Video Sharing Backend — Local JWT Auth (No B2C)

- Local signup/login with JWT, roles: **creator**/**consumer**
- Azure Blob + Cosmos DB + optional Text Analytics + App Insights
- CI/CD workflow for Azure App Service

## Run
cp .env.example .env
# fill values
npm install
npm start

## Postman
1) POST /api/auth/signup { email, password, role }
2) POST /api/auth/login  → copy token
3) POST /api/videos/upload (as creator)
4) GET /api/videos
5) POST /api/comments/:videoId (any logged-in user)
