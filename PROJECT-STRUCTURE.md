# MCP Client POC - Project Structure Overview

## Purpose
AI chat application forked from NCI Research Optimizer to repurpose its sophisticated context handling system for MCP (Model Context Protocol) client development.

## Current State: Simplified POC
- **Phase:** Minimal working POC
- **Database:** SQLite (local file)
- **Auth:** Hardcoded dev user (no OAuth)
- **Deployment:** Local only (`npm start`)
- **Dependencies:** Node.js + AWS Bedrock

## Root Directory Structure

```
MCP-Client-POC/
├── client/              ★ Frontend (SolidJS chat UI)
├── server/              ★ Backend (Express API + AI)
├── packages/            ⚠️ Shared ESLint config
├── infrastructure/      ❌ AWS CDK (not needed)
├── postgres/            ❌ PG data folder (not needed)
├── .github/             ⚠️ CI/CD workflows
├── docker-compose.yml   ❌ Docker (not needed)
├── deploy.sh            ❌ AWS deploy script
├── CLAUDE.md            📖 Project documentation
└── REMOVAL-LOG.md       📖 Simplification history
```

**Legend:**
- ★ = Required for POC
- ⚠️ = Optional
- ❌ = Not needed (can delete)
- 📖 = Documentation

---

## High-Level Architecture

### Three-Tier Application

```
┌─────────────────────────────────────────────┐
│           CLIENT (Browser)                  │
│  ┌──────────────────────────────────────┐  │
│  │  SolidJS UI (No Build Step)          │  │
│  │  - Chat interface                    │  │
│  │  - Message rendering                 │  │
│  │  - Tool result display               │  │
│  └──────────────────────────────────────┘  │
│  ┌──────────────────────────────────────┐  │
│  │  IndexedDB (Conversation Storage)    │  │
│  │  - All messages stored locally       │  │
│  │  - User-scoped databases             │  │
│  │  - Vector embeddings                 │  │
│  └──────────────────────────────────────┘  │
│  ┌──────────────────────────────────────┐  │
│  │  Client-Side ML                      │  │
│  │  - HNSW vector search                │  │
│  │  - Transformers.js embeddings        │  │
│  │  - Tool execution framework          │  │
│  └──────────────────────────────────────┘  │
└─────────────────────────────────────────────┘
                    ↕ HTTPS
┌─────────────────────────────────────────────┐
│           SERVER (Node.js)                  │
│  ┌──────────────────────────────────────┐  │
│  │  Express.js API                      │  │
│  │  - POST /api/model (chat endpoint)  │  │
│  │  - GET /api/session (user info)     │  │
│  │  - GET /api/search (web search)     │  │
│  │  - ALL /api/browse/* (proxy)        │  │
│  └──────────────────────────────────────┘  │
│  ┌──────────────────────────────────────┐  │
│  │  AI Inference Layer                  │  │
│  │  - Multi-provider abstraction        │  │
│  │  - Prompt caching (√2 optimization) │  │
│  │  - Streaming coordination            │  │
│  │  - Tool orchestration                │  │
│  └──────────────────────────────────────┘  │
│  ┌──────────────────────────────────────┐  │
│  │  SQLite Database                     │  │
│  │  - Users (dev@localhost hardcoded)  │  │
│  │  - Roles (admin, user)               │  │
│  │  - Models (9 Claude variants)        │  │
│  │  - Providers (AWS Bedrock)           │  │
│  └──────────────────────────────────────┘  │
└─────────────────────────────────────────────┘
                    ↕ API Calls
┌─────────────────────────────────────────────┐
│         EXTERNAL SERVICES                   │
│  ┌──────────────────────────────────────┐  │
│  │  AWS Bedrock                         │  │
│  │  - Claude 3.5 Sonnet (primary)      │  │
│  │  - Claude Opus, Haiku               │  │
│  │  - Streaming responses               │  │
│  │  - Tool use support                  │  │
│  └──────────────────────────────────────┘  │
│  ┌──────────────────────────────────────┐  │
│  │  Search APIs (Optional)              │  │
│  │  - Brave Search (if configured)     │  │
│  │  - GovInfo API (if configured)      │  │
│  └──────────────────────────────────────┘  │
└─────────────────────────────────────────────┘
```

---

## Data Flow: Complete Message Journey

### 1. User Sends Message

```
User types: "What is quantum computing?"
        ↓
client/pages/tools/chat/index.js (UI component)
        ↓
client/pages/tools/chat/hooks.js → submitMessage()
        ↓
client/models/database.js → Save to IndexedDB
        ↓
POST https://localhost:443/api/model
{
  messages: [
    { role: "user", content: "What is quantum computing?" }
  ],
  model: "claude-sonnet-4-5"
}
```

### 2. Server Processes Request

```
server/services/routes/model.js
        ↓
Check user session (dev@localhost)
        ↓
server/services/inference.js → runModel()
        ↓
Optimize prompt caching (√2 scaling)
        ↓
server/services/providers/bedrock.js
        ↓
AWS Bedrock API call
        ↓
Stream response back ←───┐
        ↓                │
Each chunk goes to:      │
- server/routes/model.js │
- Track usage (disabled) │
- Log request            │
- Stream to client ──────┘
```

### 3. Client Receives & Displays

```
Client receives stream chunks
        ↓
client/pages/tools/chat/hooks.js → Process stream
        ↓
Update UI in real-time (SolidJS reactivity)
        ↓
When complete:
├─ Save to IndexedDB
├─ Generate embedding (client/models/embedders.js)
└─ Index in HNSW (client/utils/hnsw.js)
```

### 4. Tool Use (If AI Requests)

```
AI response includes tool_use
        ↓
Client detects tool request
        ↓
client/utils/tools.js → Execute tool
        ↓
Tool types:
├─ search → GET /api/search
├─ browse → GET /api/browse/url
├─ code   → Execute JS locally
├─ editor → Read/write LocalStorage
└─ think  → Extended reasoning
        ↓
Send tool result back to AI
        ↓
Continue conversation
```

---

## Critical Components (Top 10)

### Must-Have (Cannot Work Without)
1. **client/pages/tools/chat/hooks.js** - All chat logic
2. **server/services/inference.js** - AI orchestration
3. **client/models/database.js** - Conversation storage
4. **server/services/providers/bedrock.js** - AWS integration
5. **server/services/routes/model.js** - Chat endpoint

### Very Important (Key Features)
6. **client/utils/tools.js** - Tool execution
7. **client/utils/hnsw.js** - Vector search
8. **server/services/database.js** - User/model configs
9. **client/pages/tools/chat/index.js** - Main UI
10. **server/services/middleware.js** - Auth & proxy

---

## Impressive Technical Achievements

### 1. Client-Side Vector Search (HNSW)
**Location:** `client/utils/hnsw.js`

**What:** Full implementation of Hierarchical Navigable Small World algorithm in JavaScript

**Why Impressive:**
- Searches thousands of conversations in <100ms
- O(log n) complexity
- Competitive with dedicated vector DBs
- Complete privacy (never leaves browser)
- ~200 lines of pure JS

### 2. Smart Prompt Caching
**Location:** `server/services/inference.js`

**What:** Mathematical optimization using √2 scaling for cache boundaries

**Why Impressive:**
- Maximizes AWS Bedrock cache hits
- Reduces costs by up to 90%
- Calculates optimal breakpoints automatically
- Transparent to client

**Algorithm:**
```javascript
// Find nearest power of √2 above token count
const cacheBreakpoint = Math.pow(2, Math.ceil(Math.log2(tokens) * 2) / 2);
```

### 3. Buildless SolidJS Application
**Location:** `client/`

**What:** Modern SPA with zero build step

**Why Impressive:**
- No webpack, vite, rollup, etc.
- ES modules loaded directly from CDN
- Same code dev and production
- Instant refresh (no rebuild)
- Tagged template literals instead of JSX

### 4. LocalStorage File System
**Location:** `client/utils/tools.js`

**What:** AI assistant has persistent file system

**Why Impressive:**
- Read/write files that survive page refresh
- Tools can share state
- AI has "long-term memory"
- All client-side (private)

### 5. Real-Time Streaming with Tool Interception
**Location:** `server/services/inference.js` + `client/pages/tools/chat/hooks.js`

**What:** Stream AI responses while intercepting tool calls mid-stream

**Why Impressive:**
- Updates UI as AI "thinks"
- Pauses stream for tool execution
- Resumes after tool completes
- Handles backpressure
- Error recovery mid-stream

---

## Technology Choices & Rationale

### Client-Side

| Technology | Why Chosen | Trade-off |
|------------|-----------|-----------|
| **SolidJS** | Fine-grained reactivity, buildless | Smaller ecosystem than React |
| **IndexedDB** | Browser-native, large storage, fast | More complex than localStorage |
| **Transformers.js** | Run ML in browser, privacy | Slower than server-side |
| **HNSW** | Fast vector search, client-side | Memory usage for large datasets |
| **Tagged Templates** | No build step, easy debugging | No TypeScript, less tooling |

### Server-Side

| Technology | Why Chosen | Trade-off |
|------------|-----------|-----------|
| **Express.js** | Simple, mature, flexible | Less opinionated than alternatives |
| **Sequelize** | ORM simplifies DB access | Performance overhead |
| **SQLite** | Zero config, single file | Not suitable for multi-user at scale |
| **Winston** | Rich logging features | Verbose configuration |
| **AWS Bedrock** | Best Claude models, streaming | AWS vendor lock-in |

---

## POC Simplifications Made

### What Was Removed
1. ❌ 10+ unused pages (translate, semantic search, user management, etc.)
2. ❌ Admin routes and UI
3. ❌ External OAuth (NIH SSO)
4. ❌ PostgreSQL + Docker
5. ❌ AWS infrastructure (CDK, ECS, RDS)
6. ❌ Usage quotas and cost tracking
7. ❌ Email service
8. ❌ Multiple deployment tiers (dev/qa/stage/prod)

### What Was Simplified
1. ✅ Auth: Hardcoded `dev@localhost` user (auto-login)
2. ✅ Database: SQLite instead of PostgreSQL
3. ✅ Routing: Chat at root `/` instead of `/tools/chat`
4. ✅ UI: Removed privacy modal, search bar, dropdown menus

### Result
- **Before:** Complex multi-tier enterprise app
- **After:** Single-developer POC, runs with `npm start`
- **Lines removed:** ~2000+
- **Dependencies removed:** Docker, PostgreSQL, OAuth service
- **Startup time:** < 5 seconds
- **Configuration:** Just AWS credentials

---

## Quick Start

### Prerequisites
- Node.js 18+
- AWS credentials with Bedrock access

### Setup
```bash
# 1. Install dependencies
cd server && npm install
cd ../client && npm install

# 2. Configure
cd ../server
cp .env.example .env
# Edit .env: Add AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY

# 3. Run
npm start

# 4. Open browser
# https://localhost:443/
# Auto-login as dev@localhost
# Start chatting!
```

### Database
- **Location:** `server/database.sqlite`
- **Auto-created:** On first run
- **Reset:** `rm database.sqlite` and restart

---

## File Count Summary

### Client
- **Total files:** ~70
- **Key files:** 15-20
- **Lines of code:** ~8,000

### Server
- **Total files:** ~30
- **Key files:** 10-15
- **Lines of code:** ~4,000

### Most Complex Files
1. `client/pages/tools/chat/hooks.js` - 588 lines
2. `server/services/inference.js` - ~400 lines
3. `client/models/database.js` - 751 lines
4. `client/utils/hnsw.js` - ~200 lines
5. `server/services/middleware.js` - ~260 lines

---

## Future Work (From Original Game Plan)

### Phase 2: Extract Core Context System
- Isolate context handling components
- Document patterns for reuse

### Phase 3: Design MCP Client Schema
- Define MCP-specific data structures
- Determine tool set and memory format

### Phase 4: Adapt Storage Layer
- Modify for MCP requirements
- Update vector search metadata

### Phase 5: Build MCP Tool Integration
- Replace research tools with MCP tools
- Integrate with MCP protocol

---

## Documentation Map

### Root Level
- **CLAUDE.md** - Project overview, game plan
- **REMOVAL-LOG.md** - What was removed and why
- **PROJECT-STRUCTURE.md** - This file (complete structure overview)
- **README.md** - Original project README

### Folder Summaries
- **client/SUMMARY.md** - Frontend overview
- **server/SUMMARY.md** - Backend overview
- **packages/SUMMARY.md** - Shared packages

### Detailed Summaries (DFS)
- **client/assets/SUMMARY.md**
- **client/components/SUMMARY.md**
- **client/configs/SUMMARY.md**
- **client/models/SUMMARY.md**
- **client/pages/SUMMARY.md**
- **client/templates/SUMMARY.md**
- **client/test/SUMMARY.md**
- **client/utils/SUMMARY.md**
- **server/services/SUMMARY.md**
- **server/test/SUMMARY.md**
- **packages/eslint-config/SUMMARY.md**

### Specific Component Docs
- **client/CLAUDE.md** - Client architecture details
- **server/CLAUDE.md** - Server architecture details
- **infrastructure/CLAUDE.md** - AWS CDK info
- **packages/CLAUDE.md** - Shared packages info
- **postgres/CLAUDE.md** - Why this folder exists (to delete)

---

## Entry Points

### For Developers
**Want to understand the code?** Start here:
1. Read this file (PROJECT-STRUCTURE.md)
2. Read client/SUMMARY.md
3. Read server/SUMMARY.md
4. Open client/pages/tools/chat/hooks.js
5. Open server/services/inference.js

### For Users
**Want to use the app?**
1. `cd server && npm start`
2. Visit https://localhost:443/
3. Type a message
4. That's it!

### For Contributors
**Want to add features?**
1. New UI component? → `client/components/`
2. New tool? → `client/utils/tools.js` + `server/services/routes/tools.js`
3. New AI provider? → `server/services/providers/`
4. New page? → `client/pages/` (add to routes.js)

---

## Key Insights

### Architecture Wisdom
1. **Client does intelligence, server does AI** - Search and ML happen client-side for privacy
2. **Conversations never touch server** - Everything in IndexedDB, only messages sent for AI response
3. **User email is critical** - Required for IndexedDB scoping, even without real auth
4. **Tools execute client-side** - Except external APIs (search, browse)
5. **Streaming is first-class** - Not an afterthought, built into every layer

### Design Patterns
1. **Progressive enhancement** - Works without JS for basic navigation
2. **Privacy by default** - Conversations stored locally, never sent to server
3. **Optimistic UI** - Shows messages immediately, updates after confirmation
4. **Fine-grained reactivity** - SolidJS updates only what changed
5. **Tool composability** - Tools can call other tools

### Performance Tricks
1. **Prompt caching** - √2 scaling maximizes cache hits
2. **HNSW indexing** - O(log n) search vs O(n) linear
3. **Streaming responses** - Users see output immediately
4. **CDN dependencies** - Browser caches once, works forever
5. **No build step** - Zero compilation overhead

---

This POC demonstrates that sophisticated AI chat applications can be built simply, focusing on core features while maintaining impressive technical capabilities like client-side ML and vector search.
