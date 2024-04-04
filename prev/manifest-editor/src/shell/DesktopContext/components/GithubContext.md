## Option 1: OAuth flow 

From: https://docs.github.com/en/developers/apps/building-oauth-apps/authorizing-oauth-apps
1. Open auth screen (https://github.com/login/oauth/authorize)
  - client_id
  - redirect_uri
  - scope
  - state
2. User redirect to our site, check code + state
3. Exchange for access token
  - POST https://github.com/login/oauth/access_token (Accept: application/json)
  - client_id
  - client_secret
  - code
  - redirect_uri
4. Add that to the context for use in the app

## Option 2: device code (chosen)

1. POST https://github.com/login/device/code
  - client_id
  - scope
```json
{
    "device_code": "3584d83530557fdd1f46af8289938c8ef79f9dc5",
    "user_code": "WDJB-MJHT",
    "verification_uri": "https://github.com/login/device",
    "expires_in": 900,
    "interval": 5
}
```

2. Give user the code to enter
3. Poll to check for user: POST https://github.com/login/oauth/access_token
  - client_id
  - device_code
  - grant_type=urn:ietf:params:oauth:grant-type:device_code
  - Check polling rate, ensure no errors and not too fast

4. Once success, we get:
```json
 {
   "access_token": "gho_16C7e42F292c6912E7710c838347Ae178B4a",
   "token_type": "bearer",
   "scope": "repo,gist"
 }
```

## How to manage multiple backends?
(backend: lists of projects, storage: manifest data)

- list backends
- storing against variable backend
- listing storage, possible choice for where to store?
- Pairings - pairing a storage+backend?
- Migrating/saving from one backend to another
- Aggregated recents list
- Full browsing UI for projects
  - Thumbnail generation?
  - Icon/similar to indicate where a project is stored?
- Custom UI tied to a backend for browsing (optional)
- OR expanded APIs for paginated browsing
- Github would need a "create repository" or "import repository"
- Github would also need an "Open manifest..." with a github option

Changes:
- Switch storage type to include "localstorage" or "filesystem"
- Add new backend section, with type (+ id?)
- Add code to check if backend is available to load/save?
- Add new "read-only" flag somewhere
- Add new "required-auth" to storage
  - This will be tied to Auth classes
  - e.g. {type: "github-auth", data: { user: 'stephenwf', scope: '...' }}

New storages:
- Readonly URL storage
- Generic local storage
- Generic file stored (full path)
- Generic POST endpoint
- Github repository location (might be read-only)
