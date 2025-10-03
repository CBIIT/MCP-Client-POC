# MCP Client POC - Context Handling Fork

## Fork Purpose

This repository is forked from [nci-webtools-ctri-research-optimizer](https://github.com/CBIIT/nci-webtools-ctri-research-optimizer) specifically to repurpose its sophisticated **context handling system** for a new MCP (Model Context Protocol) client application.

## What We're Keeping: The Context Handling System

The original project has an exceptionally well-designed system for managing conversational context with AI models:

### Core Components Being Repurposed

1. **Message Context Management** (`client/pages/tools/chat/hooks.js`)
   - Multi-format message normalization
   - Streaming response handling
   - Tool calling orchestration
   - Real-time state updates

2. **Persistent Storage** (`client/models/database.js`)
   - IndexedDB-based conversation storage
   - User-scoped database isolation
   - Vector search via HNSW
   - Hierarchical organization (Projects → Conversations → Messages)

3. **Vector Search** (`client/utils/hnsw.js` + `client/models/embedders.js`)
   - Client-side HNSW implementation
   - Semantic search across conversations
   - Embedding generation and storage

4. **Tool Execution Framework** (`client/utils/tools.js`)
   - Tool orchestration (search, browse, code, editor, think)
   - LocalStorage-based file system for memory
   - Document querying with LLM integration

5. **Server Context Processing** (`server/services/inference.js`)
   - Smart prompt caching with √2 scaling
   - Token estimation
   - Multi-provider AI abstraction

## Current POC Status

### ✅ **Phase 1: COMPLETE - Simplified to Minimal POC**

**What Was Accomplished:**
- ✅ Removed unused pages/components (~10 files, ~2000 lines)
- ✅ Migrated PostgreSQL → SQLite (local file database)
- ✅ Disabled OAuth → Hardcoded dev user (instant login)
- ✅ Chat at root URL (no navigation needed)
- ✅ Cleaned up unused assets/templates
- ✅ Simplified UI (removed modals, dropdowns)
- ✅ Complete isolation from original application

**Current Architecture:**
- **Database:** SQLite (`server/database.sqlite`)
- **Auth:** Hardcoded `dev@localhost` user (no login flow)
- **AI:** AWS Bedrock (Claude models)
- **Frontend:** SolidJS buildless client
- **Backend:** Express.js with Sequelize
- **Storage:** Client-side IndexedDB for conversations

**How to Run:**
```bash
cd server
npm install
npm start
# Visit: https://localhost:443/
# Instant access - no login needed!
```

**Dependencies:**
- ✅ Required: Node.js, AWS Bedrock credentials
- ❌ Not needed: Docker, PostgreSQL, OAuth service

---

## Game Plan (Original - Partially Complete)

### Phase 1: Clean Up & Document
- [x] Copy CLAUDE.md documentation from original repo
- [x] Document game plan in root CLAUDE.md
- [x] Review all existing code and understand dependencies
- [x] Create dependency map for context handling components
- [x] Test current system to ensure it works
- [x] **Simplify to minimal POC** (SQLite + hardcoded auth)

### Phase 2: Extract Core Context System
**Goal:** Isolate the context handling components from the research platform specifics

**✅ Kept (Essential):**
- `client/` - Chat UI and IndexedDB storage
- `server/` - AI inference and API
- Core context handling system intact

**❌ Removed/Disabled:**
- ~10 unused pages (translate, semantic search, user management, etc.)
- Admin routes (commented out)
- External OAuth (using hardcoded user)
- PostgreSQL (using SQLite)

**⚠️ Can Remove (Not Needed for POC):**
- `infrastructure/` - AWS CDK deployment (❌ not needed)
- `postgres/` - PostgreSQL data folder (❌ not needed)
- `docker-compose.yml` - Docker orchestration (❌ not needed)
- `deploy.sh` - AWS deployment script (❌ not needed)
- `.github/workflows/` - CI/CD (⚠️ optional)
- `packages/` - ESLint config (⚠️ optional, but useful)

### Phase 3: Design MCP Client Schema
**Goal:** Define data structures for MCP client use case

**Questions to answer:**
- What is the MCP client's purpose?
- What context structure do we need?
- What tools/capabilities should it have?
- Single project vs multi-project?
- What memory files should it maintain?

**Tasks:**
- [ ] Define message schema for MCP
- [ ] Define conversation structure
- [ ] Define system prompt and personality
- [ ] Define tool set
- [ ] Define memory file structure
- [ ] Design context injection strategy

### Phase 4: Adapt Storage Layer
**Goal:** Modify persistence to match MCP requirements

**Tasks:**
- [ ] Update database schema for MCP context
- [ ] Modify message normalization for MCP format
- [ ] Update vector search metadata
- [ ] Test persistence with new schema
- [ ] Implement data migration (if needed)

### Phase 5: Build MCP Tool Integration
**Goal:** Replace research tools with MCP-specific capabilities

**Tasks:**
- [ ] Remove: translate, gov search, brave search
- [ ] Keep: code execution, editor (memory), think
- [ ] Add: MCP-specific tools (define based on use case)
- [ ] Update tool definitions in config.js
- [ ] Test tool execution
- [ ] Implement tool result handling

### Phase 6: Customize System Prompt
**Goal:** Define MCP client personality and behavior

**Tasks:**
- [ ] Replace Ada personality with MCP client personality
- [ ] Define context handling instructions
- [ ] Define tool usage guidelines
- [ ] Define memory management strategy
- [ ] Test prompt effectiveness

### Phase 7: Build New UI
**Goal:** Create MCP client interface

**Tasks:**
- [ ] Design UI mockups
- [ ] Build chat interface (keep SolidJS pattern)
- [ ] Implement message rendering
- [ ] Implement tool result visualization
- [ ] Add context visualization features
- [ ] Add conversation management UI

### Phase 8: Server Integration
**Goal:** Connect to MCP backend

**Tasks:**
- [ ] Define MCP API endpoints
- [ ] Update server routes
- [ ] Implement MCP protocol integration
- [ ] Test client-server communication
- [ ] Handle streaming responses

### Phase 9: Testing & Refinement
**Goal:** Ensure system works end-to-end

**Tasks:**
- [ ] Unit tests for context handling
- [ ] Integration tests for full conversation flow
- [ ] Test vector search accuracy
- [ ] Test memory persistence
- [ ] Performance testing
- [ ] User acceptance testing

### Phase 10: Documentation & Deployment
**Goal:** Prepare for production use

**Tasks:**
- [ ] Write API documentation
- [ ] Write deployment guide
- [ ] Create example conversations
- [ ] Document context handling patterns
- [ ] Set up simple deployment (Docker or cloud)

## Key Technical Decisions to Make

1. **Storage Strategy**
   - Keep IndexedDB for client-side? (privacy benefits)
   - Add server-side storage? (sync across devices)
   - Hybrid approach?

2. **Context Scope**
   - Single project or multiple projects?
   - How to handle context isolation?
   - What's the unit of context sharing?

3. **Vector Search**
   - Keep HNSW client-side?
   - Move to server for more powerful search?
   - What dimensions for embeddings?

4. **Tool Set**
   - What tools does MCP client need?
   - Keep code execution in browser?
   - What external APIs to integrate?

5. **Memory System**
   - What memory files to maintain?
   - How to structure long-term memory?
   - When to update memory?

## Current Status

**Phase:** 1 - Clean Up & Document
**Last Updated:** 2025-10-01

## Architecture Overview (Original System)

The original system has a sophisticated architecture worth preserving:

**Frontend:** Buildless SolidJS with CDN dependencies, client-side ML
**Backend:** Express.js with multi-provider AI (Bedrock, Gemini)
**Storage:** IndexedDB (client) + PostgreSQL (server)
**Search:** Client-side HNSW vector search
**Testing:** Real services, no mocking

## Next Immediate Steps

1. Test the current system to ensure it runs
2. Map out exact files needed for context handling
3. Decide on MCP client's specific purpose and requirements
4. Create a detailed technical specification
5. Begin Phase 2 extraction

## Attribution

This project is based on the excellent work from:
- Original Repository: https://github.com/CBIIT/nci-webtools-ctri-research-optimizer
- Created by: National Cancer Institute (NCI) CBIIT
- License: (Check original LICENSE file)

We are specifically reusing their context handling, vector search, and conversation management systems while adapting the UI and tools for a different application.

## Notes for Future Maintainers

- The original system is production-quality code
- Context handling is particularly well-designed
- Vector search works remarkably well client-side
- Message normalization handles many edge cases
- Tool execution framework is extensible
- Consider contributing improvements back upstream
