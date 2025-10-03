# server/test/

## Purpose
Server-side integration tests that validate backend functionality using real services.

## Contents

### Test Files
- **auth.test.js** - Authentication flow tests
- **bedrock.test.js** - AWS Bedrock provider tests
- **inference.test.js** - AI inference service tests

### Test Runner
Tests are executed via `server/integration.js` which:
1. Starts the Express server
2. Spawns Chromium browser (Playwright)
3. Runs both server and client tests
4. Uses real AWS Bedrock, real databases
5. No mocking - validates actual behavior

## Testing Philosophy
**"Real services, no mocking"** - Tests validate actual integration:
- Real AWS Bedrock API calls
- Real SQLite database
- Real browser (Chromium)
- Real HTTP requests

### Why This Approach?
**Pros:**
- Catches real integration issues
- Validates actual API behavior
- More confidence in production readiness

**Cons:**
- Requires AWS credentials
- Slower than unit tests
- Costs money (API calls)
- Can't run offline

## Contribution to Project
Ensures backend services work correctly end-to-end:
1. Auth flow creates users properly
2. AI inference returns valid responses
3. Streaming works correctly
4. Tool calls execute properly

## POC Status
⚠️ **OPTIONAL** - Tests are valuable but not required for POC to function

## How to Run
```bash
cd server
npm test
```

Requires:
- AWS credentials in .env
- SQLite database
- Playwright installed
