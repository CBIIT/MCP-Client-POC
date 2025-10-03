# server/services/

## Purpose
Core business logic and service layer for the backend API.

## Contents

### Core Services
- **api.js** - Main API router, aggregates all routes
- **database.js** - Database connection and model exports
- **inference.js** - **AI inference orchestration** (multi-provider abstraction)
- **logger.js** - Winston logging configuration
- **middleware.js** - Express middleware (auth, OAuth, proxy, logging)
- **schema.js** - Database schema definitions and seed data
- **scheduler.js** - Cron jobs (weekly usage reset)

### Specialized Services
- **email.js** - Email sending (nodemailer) for feedback
- **parsers.js** - Server-side document parsing (PDF, DOCX)
- **textract.js** - AWS Textract integration (document extraction)
- **translate.js** - AWS Translate integration (language translation)
- **utils.js** - Search APIs (Brave, GovInfo, Congress)

### providers/
AI model provider implementations:
- **bedrock.js** - **AWS Bedrock (Claude models)** - PRIMARY
- **gemini.js** - Google Gemini models (alternative)
- **mock.js** - Mock provider for testing

### routes/
API endpoint handlers:
- **auth.js** - Authentication (OAuth, session, logout)
- **model.js** - **AI chat endpoint** - CRITICAL
- **tools.js** - Tool APIs (search, browse, feedback)
- **admin.js** - Admin panel APIs (disabled in POC)

## Architecture Patterns

### Inference Service (inference.js)
**Most complex file in server** - Handles:
1. **Provider abstraction** - Switches between Bedrock/Gemini
2. **Prompt caching** - Smart √2 scaling for cache boundaries
3. **Token estimation** - Predicts token usage
4. **Streaming** - Real-time AI responses
5. **Tool calling** - Coordinates tool execution
6. **Error handling** - Retries and fallbacks

### Middleware (middleware.js)
- **OAuth flow** - OpenID Connect implementation
- **Local OAuth provider** - Built-in dummy provider for dev
- **requireRole()** - Permission checking
- **proxyMiddleware** - CORS bypass for external APIs
- **Logging** - Request/error logging

### Database (database.js + schema.js)
- **Sequelize ORM** - Database abstraction
- **Auto-sync** - Schema updates automatically
- **Seed data** - Pre-populates models and roles
- **Hardcoded user** - Creates `dev@localhost` on startup (POC)

## Contribution to Project

### Critical Files (Can't Work Without)
1. **inference.js** - AI is the core feature
2. **routes/model.js** - Chat endpoint
3. **routes/auth.js** - User session (needed for IndexedDB)
4. **database.js** - User and model configs
5. **middleware.js** - Auth and request handling

### Important Files (Key Features)
- **routes/tools.js** - Search and browse tools
- **providers/bedrock.js** - AWS Claude integration
- **parsers.js** - Document understanding

### Optional Files (Can Disable)
- **email.js** - Feedback feature (not critical)
- **textract.js** - AWS service (disabled in POC)
- **translate.js** - Translation service (deleted tool)
- **scheduler.js** - Usage reset (not needed with hardcoded user)
- **routes/admin.js** - Admin panel (disabled)

## POC Status
✅ **REQUIRED** - This is the entire backend

## Most Complex File
**inference.js** (~400 lines) - Handles:
- Multi-provider AI calls
- Prompt caching with mathematical optimization
- Streaming with backpressure
- Tool orchestration
- Usage tracking
- Error recovery

This file is the "brain" of the backend.
