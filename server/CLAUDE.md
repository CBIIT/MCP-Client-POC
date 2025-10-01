# Server Application

## Overview

Node.js Express API server providing AI model integration, authentication, database access, and client application serving. Acts as both an API backend and static file server for the SolidJS client.

**Key Responsibility:** Bridge between client application and external services (AI providers, databases, translation, search APIs).

## Architecture

- **Runtime**: Node.js with ESM modules
- **Framework**: Express.js 5.x
- **Database**: PostgreSQL + pgvector extension
- **ORM**: Sequelize with automatic schema sync
- **AI**: Multi-provider abstraction (AWS Bedrock, Google Gemini)
- **Auth**: OpenID Connect via openid-client
- **Security**: HTTPS required, role-based access control

## Directory Structure

| Folder/File | Purpose |
|-------------|---------|
| **server.js** | Main entry point, Express server setup |
| **services/api.js** | Main API router configuration |
| **services/database.js** | Sequelize models and database setup |
| **services/inference.js** | Multi-provider AI abstraction layer |
| **services/middleware.js** | Authentication, logging, proxy middleware |
| **services/routes/** | API endpoint handlers |
| **services/providers/** | AI provider implementations |
| **services/translate.js** | AWS Translate integration |
| **services/email.js** | Email service (nodemailer) |
| **services/utils.js** | Search APIs, utilities |
| **services/logger.js** | Winston logging configuration |
| **services/scheduler.js** | Cron jobs (usage reset) |
| **services/parsers.js** | Document parsing (PDF, DOCX) |
| **.env** | Environment configuration |
| **.env.example** | Environment variable template |

## Core Services

### Inference Service (`inference.js`)

Multi-provider AI abstraction:
- **Main Function**: `runModel(messages, options)` - Execute AI requests
- **Provider Factory**: `getModelProvider(model)` - Returns provider instance
- **Features**: Streaming, tool use, prompt caching, thought budgets

**Supported Providers:**
- AWS Bedrock (Claude models)
- Google Gemini

### Database Service (`database.js`)

Sequelize models and relationships:

**Models:**
- `User` - User accounts with usage tracking
- `Role` - User roles with access policies
- `Provider` - AI provider configurations
- `Model` - Available AI models with pricing
- `Usage` - Token usage tracking

**Key Feature**: Auto-sync with `sync({ alter: true })` - automatically updates schema.

### Middleware (`middleware.js`)

**Authentication:**
- `loginMiddleware` - OAuth flow implementation
- `requireRole(roles)` - Role-based access control

**Utilities:**
- `proxyMiddleware` - Secure proxy for external APIs (CORS bypass)
- `logRequests()` - Winston request logging
- `logErrors()` - Error logging with stack traces

### Translation Service (`translate.js`)

AWS Translate integration:
- `translate(text, source, target, options)` - Text translation
- `getLanguages()` - Available language pairs
- Supports formality and profanity settings

### Document Parsing (`parsers.js`)

Multi-format document processing:
- `parseUrl(url)` - Extract text from web pages
- `parseDocument(buffer, filename)` - Parse PDF/DOCX/text
- `parsePdf(buffer)` - PDF.js integration
- `parseDocx(buffer)` - Mammoth integration

### Search Integration (`utils.js`)

Multiple search providers:
- `braveSearch(query, options)` - Brave Search API (web, news, summary)
- `govSearch(query)` - Government information search
- `search(query, options)` - Combined search wrapper

## API Routes

### Authentication (`routes/auth.js`)
- `GET /api/login` - OAuth login flow
- `GET /api/logout` - Session termination
- `GET /api/session` - Current user info

### AI Models (`routes/model.js`)
- `POST /api/model` - Execute AI requests (streaming/non-streaming)
- `GET /api/model/list` - List available models

### Admin Operations (`routes/admin.js`)
- `GET /api/admin/users` - List/search users
- `POST /api/admin/users` - Create/update users
- `DELETE /api/admin/users/:id` - Delete user
- `GET /api/admin/usage` - Usage analytics
- `POST /api/admin/usage/reset` - Reset usage limits

### Tools (`routes/tools.js`)
- `GET /api/search` - Search services
- `ALL /api/browse/*` - Proxy external URLs
- `POST /api/translate` - Translation service
- `POST /api/feedback` - User feedback submission

## Database Schema

### User Table
```
email (unique), firstName, lastName, status, roleId
apiKey, limit, remaining, createdAt, updatedAt
```

### Role Table
```
name (admin|super user|user), policy (JSON), order
```

### Model Table
```
providerId, label, value, maxContext, maxOutput, maxReasoning
cost1kInput, cost1kOutput, cost1kCacheRead, cost1kCacheWrite
```

### Usage Table
```
userId, modelId, ip, inputTokens, outputTokens
cacheReadTokens, cacheWriteTokens, cost, createdAt
```

## Environment Variables

**Required:**
- `SESSION_SECRET` - Cookie signing secret
- `AWS_ACCESS_KEY_ID` - AWS credentials
- `AWS_SECRET_ACCESS_KEY` - AWS credentials

**Optional but Recommended:**
- `OAUTH_CLIENT_ID` - OAuth authentication
- `OAUTH_CLIENT_SECRET` - OAuth authentication
- `OAUTH_DISCOVERY_URL` - OAuth provider URL
- `GOOGLE_GENERATIVE_AI_API_KEY` - Google Gemini
- `BRAVE_SEARCH_API_KEY` - Search functionality

**Database (defaults work with Docker):**
- `PGHOST`, `PGPORT`, `PGDATABASE`, `PGUSER`, `PGPASSWORD`

**Server:**
- `PORT` - Server port (default: 8080)
- `HTTPS_KEY`, `HTTPS_CERT` - SSL certificates

See `.env.example` for complete list.

## AI Provider Integration

### Adding New Providers

1. Create provider class in `services/providers/`:
```javascript
export default class NewProvider {
  constructor(apiKey) { }
  async converse(messages, options) { }
  async converseStream(messages, options) { }
}
```

2. Add provider to database:
```sql
INSERT INTO providers (name, apiKey) VALUES ('new-provider', 'key');
```

3. Register in `inference.js`:
```javascript
import NewProvider from './providers/new-provider.js';

function getModelProvider(model) {
  if (model.value.includes('new-provider'))
    return new NewProvider(provider.apiKey);
}
```

### Provider Requirements

Each provider must implement:
- `converse(messages, options)` - Non-streaming requests
- `converseStream(messages, options)` - Streaming requests (returns generator)

**Options:**
- `model` - Model identifier
- `temperature` - Randomness (0-1)
- `maxTokens` - Max output tokens
- `tools` - Tool definitions
- `messages` - Message history

## Usage Tracking

All AI requests automatically tracked:
- Token counts (input, output, cache read/write)
- Cost calculation based on model pricing
- Per-user limits enforced
- Automatic reset via cron job

## Security Features

1. **Authentication**: OpenID Connect OAuth flow
2. **Authorization**: Role-based access control
3. **API Keys**: User-specific keys for model access
4. **Proxy Whitelist**: Domain whitelist for proxy requests
5. **HTTPS Required**: Development uses self-signed certs
6. **Session Management**: Secure cookie-based sessions

## Development

### Local Development
```bash
npm install
npm run start:dev  # Watch mode with auto-restart
```

### Testing
```bash
npm test                    # All tests
npm run test:integration    # Integration tests only
```

**Test Philosophy**: Real services, no mocking. Tests use actual AWS Bedrock, databases, and browsers.

### Database Management

**Auto-sync**: Sequelize automatically updates schema on startup:
```javascript
await sequelize.sync({ alter: true });
```

**Manual Reset**:
```bash
# Delete postgres folder and restart
rm -rf ../postgres
docker compose up
```

## Deployment

Server deployed as Docker container to AWS ECS:
1. Build: `docker build -f server/Dockerfile`
2. Push: `deploy.sh` pushes to ECR
3. Deploy: CDK updates ECS service

## Key Dependencies

- `express` - Web framework
- `sequelize` - ORM
- `@aws-sdk/client-bedrock-runtime` - AWS AI
- `@google/generative-ai` - Google Gemini
- `openid-client` - OAuth
- `pdfjs-dist` - PDF parsing
- `mammoth` - DOCX parsing
- `winston` - Logging
- `node-forge` - Certificate generation

## Best Practices

1. **Use async/await** - All database and AI calls are async
2. **Handle errors** - Use try/catch and error middleware
3. **Log everything** - Use Winston logger for debugging
4. **Validate input** - Check request bodies before processing
5. **Track usage** - Ensure all AI calls update Usage table

## Related Documentation

See `server/README.md` for API documentation and detailed endpoint specifications.
