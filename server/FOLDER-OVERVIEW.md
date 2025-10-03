# server/

## Purpose
**Backend API** - AI inference, authentication, data persistence, and external service integration.

## High-Level Architecture

### Technology Stack
- **Runtime:** Node.js with ES modules
- **Framework:** Express.js 5.x
- **Database:** SQLite (Sequelize ORM)
- **AI:** AWS Bedrock (Claude models)
- **Auth:** Hardcoded dev user (was OAuth)
- **Logging:** Winston
- **Testing:** Custom integration tests

### Key Characteristics
- **Multi-provider AI** - Abstracts Bedrock/Gemini
- **Smart caching** - √2 token scaling for optimal cache hits
- **Stateless** - No conversation storage (client handles)
- **Real-time** - Streaming AI responses
- **Testing philosophy** - Real services, no mocking

## Directory Structure

```
server/
├── services/              # Business logic layer
│   ├── providers/         # AI provider implementations
│   │   ├── bedrock.js     # ★ AWS Claude (primary)
│   │   ├── gemini.js      # Google alternative
│   │   └── mock.js        # Testing
│   ├── routes/            # API endpoints
│   │   ├── auth.js        # Session management
│   │   ├── model.js       # ★ AI chat endpoint
│   │   ├── tools.js       # Search/browse APIs
│   │   └── admin.js       # Admin (disabled)
│   ├── api.js             # Route aggregator
│   ├── database.js        # ★ DB connection + models
│   ├── inference.js       # ★ AI orchestration
│   ├── middleware.js      # Auth, OAuth, proxy
│   ├── schema.js          # DB schema + seeds
│   └── [other services]
├── test/                  # Integration tests
├── server.js              # ★ Entry point
├── integration.js         # Test runner
└── .env                   # Configuration
```

## Core Components by Function

### AI Layer (Primary Feature)
- `services/inference.js` - **Most important file**
  - Multi-provider abstraction
  - Prompt caching optimization
  - Streaming coordination
  - Token estimation
  - Tool orchestration

- `services/providers/bedrock.js` - AWS Bedrock integration
  - Claude 3.5 Sonnet, Opus, Haiku
  - Streaming responses
  - Tool use support

### API Layer (Request Handling)
- `services/routes/model.js` - **Critical endpoint**
  - POST `/api/model` - Main chat endpoint
  - Usage tracking
  - Quota enforcement (disabled in POC)

- `services/routes/auth.js` - Session management
  - GET `/api/session` - Returns hardcoded user
  - Auto-login `dev@localhost`

- `services/routes/tools.js` - External tool APIs
  - GET `/api/search` - Web search
  - ALL `/api/browse/*` - URL proxy
  - POST `/api/feedback` - User feedback

### Data Layer
- `services/database.js` - Database connection
  - Creates `dev@localhost` user on startup
  - Exports User, Role, Model, Provider, Usage models
  - Sequelize ORM with SQLite

- `services/schema.js` - Schema definitions
  - 5 tables: Users, Roles, Providers, Models, Usage
  - Seeds 9 AI models (Claude variants)
  - Seeds 3 roles (admin, super user, user)

### Infrastructure Layer
- `server.js` - Express server setup
- `services/middleware.js` - Request processing
  - Auth checking (disabled OAuth, auto-login)
  - Logging
  - Error handling
  - Proxy for external APIs

## Data Flow

### AI Chat Request Flow
```
1. Client POST /api/model
   ↓
2. services/routes/model.js
   - Validates user session
   - Checks usage quota (disabled in POC)
   ↓
3. services/inference.js
   - Selects provider (Bedrock)
   - Optimizes prompt caching
   - Estimates tokens
   ↓
4. services/providers/bedrock.js
   - Calls AWS Bedrock API
   - Streams response
   ↓
5. Back through middleware
   - Tracks usage (disabled in POC)
   - Logs request
   ↓
6. Stream to client
   - Real-time updates
   - Tool execution coordination
```

### Authentication Flow (Simplified in POC)
```
1. Client GET /api/session
   ↓
2. services/routes/auth.js
   - Checks if session.user exists
   - If no: Finds dev@localhost user
   - Assigns to session
   ↓
3. Returns user object
   - email: "dev@localhost"
   - firstName: "Dev"
   - Role: admin
   ↓
4. Client uses email for IndexedDB scoping
```

## Critical Files (Cannot Work Without)

### Essential (Top 5)
1. **services/inference.js** - AI is the core feature (~400 lines, most complex)
2. **services/routes/model.js** - Chat endpoint
3. **services/database.js** - User/model configs
4. **services/providers/bedrock.js** - AWS integration
5. **server.js** - Server initialization

### Important (Key Features)
- `services/routes/auth.js` - User session (needed for client)
- `services/middleware.js` - Auth and proxy
- `services/schema.js` - Database structure
- `services/routes/tools.js` - Search/browse capabilities

### Optional (Can Disable)
- `services/email.js` - Feedback emails
- `services/textract.js` - AWS document extraction (unused)
- `services/translate.js` - AWS translation (deleted tool)
- `services/scheduler.js` - Usage reset cron (unused)
- `services/routes/admin.js` - Admin panel (disabled)

## Impressive Technical Features

### 1. Smart Prompt Caching
**Why impressive:** Mathematical optimization for cache boundaries
- Uses √2 scaling to maximize cache hits
- Calculates optimal breakpoints
- Can reduce costs by 90%
- Transparent to client

### 2. Multi-Provider Abstraction
**Why impressive:** Clean interface despite different APIs
- Switch providers with one config change
- Handles streaming differences
- Normalizes tool calling
- Fallback on errors

### 3. Real-Time Streaming
**Why impressive:** Handles high-throughput AI responses
- Backpressure management
- Tool interception during stream
- Error recovery mid-stream
- Progress tracking

### 4. Zero-Config Database
**Why impressive:** Database auto-updates schema
- No migrations needed
- `sync({ alter: true })` updates tables
- Seeds default data automatically
- Hardcoded user created on boot

## POC Status
✅ **REQUIRED** - This IS the backend

## Contribution to Overall Project
The server provides:
1. **AI capabilities** - Without this, no chat responses
2. **User context** - Email needed for client IndexedDB
3. **External APIs** - Search, browse, feedback
4. **Model configs** - What AI models are available
5. **Usage tracking** - Cost monitoring (disabled in POC)

## Most Complex File
**services/inference.js** - The "brain" of the backend
- Handles all AI provider complexity
- Optimizes for performance and cost
- Coordinates streaming and tools
- Most likely to need changes for new features

## Entry Point
Start here: `server.js` → loads `services/api.js` → mounts routes → serves client

## Configuration
Critical `.env` variables:
- `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` - Required for AI
- `DB_DIALECT=sqlite`, `DB_STORAGE=./database.sqlite` - Local database
- `SESSION_SECRET` - Cookie signing
- OAuth vars - All commented out (using hardcoded user)
