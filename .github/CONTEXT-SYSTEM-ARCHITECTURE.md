# Context Handling System - Architecture & Dependency Map

**Status:** Phase 1 Complete - System Verified Working
**Date:** 2025-10-01

## Executive Summary

The original repository contains a production-quality context handling system that manages conversational AI interactions with sophisticated features:
- Client-side IndexedDB persistence with vector search
- Multi-format message normalization
- Streaming response handling with tool orchestration
- Smart prompt caching with √2 token scaling
- LocalStorage-based memory file system

## Core Context Handling Components

### 1. Message Context Management
**Location:** `client/pages/tools/chat/hooks.js`

**Key Functions:**
- `useChat()` - Main chat hook managing state and API calls
- `submitMessage()` - Handles message submission with files (lines 239-575)
- `normalizeMessageContent()` - Multi-format content normalization (lines 19-53)
- `loadConversation()` - Loads conversation from IndexedDB (lines 101-134)
- `updateConversation()` - Updates conversation metadata (lines 160-176)

**Dependencies:**
```
hooks.js
├── models/database.js (getDB, ConversationDB)
├── utils/tools.js (runTool, getClientContext)
├── utils/files.js (readStream, fileToBase64)
├── utils/parsers.js (splitFilename)
├── utils/xml.js (jsonToXml)
├── utils/alerts.js (handleError, showError)
└── config.js (systemPrompt, tools)
```

**State Management:**
- Messages: SolidJS `createStore` with array of message objects
- Conversation: Store with `{id, title, projectId, messages}`
- Loading: Signal for streaming state
- Database: Signal holding ConversationDB instance

**Message Flow:**
1. User submits message → normalized to Bedrock format
2. Create/load conversation in IndexedDB
3. Store user message with embedding
4. POST to `/api/model` with streaming
5. Process streaming chunks (text, tool calls, reasoning)
6. Store assistant message with embedding
7. Execute tools if needed → add tool results
8. Repeat until complete

### 2. Persistent Storage Layer
**Location:** `client/models/database.js`

**Classes:**
- `ConversationDB` - Main database interface (lines 58-686)
- `ConversationDBFactory` - Singleton factory for user-scoped DBs (lines 691-737)

**Key Methods:**
```javascript
// Conversation Management
createConversation(data) → Conversation
getConversation(id) → Conversation
getRecentConversationsByProject(projectId, limit) → Conversation[]
updateConversation(id, updates) → Conversation
deleteConversation(id) → void

// Message Management
addMessage(conversationId, data) → Message
getMessages(conversationId) → Message[]
updateMessage(id, updates) → Message

// Search & Embeddings
search(query, limit, types) → SearchResult[]
embed() → void (regenerate all embeddings)
```

**IndexedDB Schema:**
```
stores:
  - projects: {id, name, description, context, created, updated}
  - conversations: {id, projectId, title, created, updated, lastMessageAt, archived}
  - messages: {id, conversationId, role, content, timestamp, metadata}
  - resources: {id, projectId, type, name, data, created}
  - embeddings: serialized HNSW index + metadata

indexes:
  - conversations: projectId, title, created, updated, lastMessageAt, archived
  - messages: conversationId, timestamp, role
  - resources: projectId, type, name, created
```

**Dependencies:**
```
database.js
├── idb (openDB)
├── models.js (Project, Conversation, Message, Resource)
├── embedders.js (EmbeddingService, TestEmbedder)
└── utils/hnsw.js (HNSW vector search)
```

### 3. Vector Search System
**Location:** `client/utils/hnsw.js` + `client/models/embedders.js`

**HNSW Index (`hnsw.js`):**
- Multi-layer graph structure for fast ANN search
- Configurable: M=16 connections, efConstruction=200, efSearch=50
- Supports cosine and euclidean distance metrics
- Serializable to JSON for persistence

**Key Methods:**
```javascript
add(id, vector) → void
search(query, k) → [{id, distance}]
update(id, newVector, threshold) → void
remove(id) → void
toJSON() / fromJSON(data) → HNSW
```

**Embedders (`embedders.js`):**
- `BaseEmbedder` - Abstract interface
- `TestEmbedder` - Simple byte-based embedder (default, no deps)
- `TransformersEmbedder` - Placeholder for Hugging Face models
- `EmbeddingService` - Wrapper managing embeddings + HNSW

**Current Setup:**
- Uses `TestEmbedder` (128 dimensions) by default
- No external ML dependencies required
- Embeddings stored in IndexedDB for fast retrieval

**Dependencies:**
```
hnsw.js
└── idb (for IndexedDB operations)

embedders.js
├── utils/hnsw.js (HNSW)
└── (optional) @huggingface/transformers
```

### 4. Tool Execution Framework
**Location:** `client/utils/tools.js`

**Available Tools:**
```javascript
search({query}) → {web, news, gov} results
browse({url, topic}) → parsed document text
code({language, source, timeout}) → {logs, html, height}
editor({command, path, ...params}) → status message
think({thought}) → void (logs to _thoughts.txt)
```

**Tool Orchestration:**
- `runTool(toolUse, tools)` - Executes tool and wraps result (lines 10-22)
- Error handling with stack traces
- Results formatted as `{toolUseId, content: [{json: {results}}]}`

**LocalStorage File System:**
- `editor()` function provides file operations (lines 163-328)
- Commands: view, str_replace, create, insert, undo_edit
- Files stored as `"file:${path}"` in LocalStorage
- History stored as `"history:${path}"` for undo

**Memory Files:**
```
_profile.txt    - User profile/preferences
_memory.txt     - Conversation memory
_insights.txt   - Extracted insights
_workspace.txt  - Current working context
_knowledge.txt  - Accumulated knowledge
_patterns.txt   - Recognized patterns
_thoughts.txt   - Internal reasoning log
```

**Context Injection:**
- `getClientContext(important)` - Builds context object (lines 420-460)
- Includes: memory files, environment info, custom instructions
- Passed to system prompt via `systemPrompt(getClientContext(context))`

**Dependencies:**
```
tools.js
├── parsers.js (parseDocument)
└── xml.js (jsonToXml)
```

### 5. Server-Side Context Processing
**Location:** `server/services/inference.js`

**Main Function:**
```javascript
runModel({
  model,        // Model identifier
  messages,     // Message history
  system,       // System prompt
  tools,        // Available tools
  thoughtBudget, // Reasoning token budget
  stream        // Streaming mode
}) → Response
```

**Smart Prompt Caching (lines 34-103):**
- Uses √2 scaling for optimal cache boundaries
- Boundaries: 1024, 1448, 2048, 2896, 4096, ...
- Places cache points at last 2 boundary crossings
- Adds cache points to system, tools, and messages
- Debug logging shows cache hit rates and cost savings

**Token Estimation (lines 18-28):**
```javascript
text → length / 8
documents/images → bytes.length / 3
toolUse/toolResult → JSON.stringify(obj).length / 8
```

**Message Processing (lines 128-166):**
- Filters empty content blocks
- Transforms base64 to Uint8Array
- Ensures tool results exist for all tool calls
- Prevents empty text content

**Dependencies:**
```
inference.js
├── database.js (Model, Provider)
├── providers/bedrock.js (AWS Bedrock)
├── providers/gemini.js (Google Gemini)
└── providers/mock.js (Testing)
```

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        User Input                            │
│                  (message + files)                           │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              client/pages/tools/chat/hooks.js                │
│  • normalizeMessageContent()                                 │
│  • submitMessage()                                           │
│  • File encoding (base64)                                    │
└────────────────────┬───────────────────────┬─────────────────┘
                     │                       │
                     ▼                       ▼
        ┌────────────────────────┐  ┌──────────────────────┐
        │  IndexedDB Storage     │  │  Vector Search       │
        │  (database.js)         │  │  (hnsw.js)           │
        │  • Save message        │  │  • Generate embed    │
        │  • Update conversation │  │  • Add to index      │
        └────────────────────────┘  └──────────────────────┘
                     │
                     ▼
        ┌────────────────────────────────────────────────────┐
        │           POST /api/model (streaming)              │
        │  • System prompt + context                         │
        │  • Message history                                 │
        │  • Tool definitions                                │
        └────────────────┬───────────────────────────────────┘
                         │
                         ▼
        ┌────────────────────────────────────────────────────┐
        │      server/services/inference.js                  │
        │  • Token estimation                                │
        │  • Smart cache point insertion (√2)                │
        │  • Message validation                              │
        └────────────────┬───────────────────────────────────┘
                         │
                         ▼
        ┌────────────────────────────────────────────────────┐
        │         AI Provider (Bedrock/Gemini)               │
        │  • Claude Sonnet 4.5                               │
        │  • Streaming response                              │
        │  • Tool use support                                │
        └────────────────┬───────────────────────────────────┘
                         │
                         ▼
        ┌────────────────────────────────────────────────────┐
        │      Streaming Response Processing                 │
        │  • contentBlockStart → create block                │
        │  • contentBlockDelta → append text/reasoning       │
        │  • contentBlockStop → parse tool inputs            │
        │  • messageStop → check stop reason                 │
        └────────────────┬───────────────────────────────────┘
                         │
                ┌────────┴─────────┐
                │                  │
                ▼                  ▼
    ┌──────────────────┐   ┌─────────────────────┐
    │   Tool Calls?    │   │   Text Response     │
    └────────┬─────────┘   └──────────┬──────────┘
             │                        │
             ▼                        ▼
    ┌──────────────────┐     ┌───────────────────┐
    │  utils/tools.js  │     │  Store in IndexDB │
    │  • search()      │     │  • Update embed   │
    │  • browse()      │     │  • Update UI      │
    │  • code()        │     └───────────────────┘
    │  • editor()      │
    │  • think()       │
    └────────┬─────────┘
             │
             ▼
    ┌──────────────────────────────────┐
    │  Add tool results to messages    │
    │  → Loop back to POST /api/model  │
    └──────────────────────────────────┘
```

## Key Design Patterns

### 1. Message Normalization
**Problem:** Different sources store content in different formats (string, array, JSON)
**Solution:** `normalizeMessageContent()` handles all cases:
- Null/undefined → `[{text: ""}]`
- String → Try JSON parse → Array or `[{text}]`
- Array → Return as-is
- Other → `[{text: String(value)}]`

### 2. User-Scoped Databases
**Problem:** Multi-user application needs data isolation
**Solution:** Database factory pattern with email-based DB names:
- `arti-conv-{sanitized-email}`
- Each user gets separate IndexedDB instance
- Factory maintains singleton per user

### 3. Smart Prompt Caching
**Problem:** Long conversations waste tokens reprocessing context
**Solution:** √2 scaling factor for cache boundaries:
- Logarithmic growth: 1024 → 1448 → 2048 → 2896...
- Places cache points at conversation boundaries
- Keeps last 2 cache points active
- 75%+ cache hit rate in testing

### 4. Streaming State Management
**Problem:** Complex streaming protocol with multiple content types
**Solution:** SolidJS fine-grained reactivity:
```javascript
setMessages(index, "content", blockIndex, "text", prev => prev + delta)
```
- Updates specific paths without re-rendering entire tree
- Real-time UI updates as tokens stream in

### 5. Tool Result Interleaving
**Problem:** Tool calls must have corresponding results
**Solution:** Automatic tool result injection (inference.js:156-164):
- Check if tool result exists for each toolUse
- If missing, inject empty result message
- Prevents API errors from incomplete message pairs

## Critical Dependencies

### Client-Side
```json
{
  "idb": "^8.0.3",                    // IndexedDB wrapper
  "solid-js": "^1.9.9",               // Reactive UI framework
  "@huggingface/transformers": "^3.7.2", // (Optional) ML embeddings
  "marked": "^16.2.0",                // Markdown rendering
  "dompurify": "^3.2.6"               // XSS protection
}
```

### Server-Side
```json
{
  "@aws-sdk/client-bedrock-runtime": "^3.883.0", // AWS AI
  "@google/genai": "^1.18.0",                    // Google AI
  "express": "^5.1.0",                           // Web framework
  "sequelize": "^6.37.7",                        // ORM
  "pg": "^8.16.3"                                // PostgreSQL client
}
```

### External Services
- **AWS Bedrock:** Claude models, AWS Translate
- **Google Gemini:** Alternative AI provider
- **PostgreSQL:** Server-side persistence
- **Brave Search API:** Web/news search
- **U.S. Government API:** Federal website search

## Files to Keep for MCP Client

### Essential Core (Must Keep)
```
client/models/database.js        - IndexedDB + vector search
client/models/models.js          - Data models (Project, Conversation, Message)
client/models/embedders.js       - Embedding system
client/utils/hnsw.js             - Vector search implementation
client/utils/tools.js            - Tool execution + memory system
client/pages/tools/chat/hooks.js - Message handling (adapt for MCP)
server/services/inference.js     - Context processing + caching
```

### Supporting Utilities (Keep)
```
client/utils/files.js            - File handling, streaming
client/utils/parsers.js          - Document parsing
client/utils/xml.js              - JSON to XML conversion
client/utils/alerts.js           - Error handling
server/services/database.js      - Server models (adapt schema)
server/services/middleware.js    - Auth, logging
```

### UI Layer (Replace/Adapt)
```
client/pages/tools/chat/index.js    - Chat UI (replace with MCP UI)
client/pages/tools/chat/message.js  - Message rendering (adapt)
client/pages/tools/chat/config.js   - System prompt (replace entirely)
client/components/*                 - UI components (evaluate case-by-case)
```

### Remove Entirely
```
infrastructure/*                 - AWS deployment
packages/*                       - ESLint config (optional)
server/services/translate.js     - AWS Translate (not needed)
server/services/utils.js         - Search APIs (replace with MCP tools)
```

## Phase 2 Readiness Checklist

- [x] System verified working
- [x] All core components identified
- [x] Dependencies mapped
- [x] Data flow documented
- [x] Design patterns analyzed
- [ ] MCP client requirements defined
- [ ] Context schema designed for MCP
- [ ] Tool set defined for MCP use case
- [ ] Migration strategy planned

## Next Steps for Phase 2

1. **Define MCP Client Purpose**
   - What is the MCP client building/managing?
   - What context does it need to maintain?
   - Single project or multi-project?

2. **Design New Schema**
   - Message format for MCP protocol
   - Conversation structure
   - Memory file organization

3. **Plan Tool Integration**
   - Keep: code, editor, think
   - Remove: search (Brave/gov), browse
   - Add: MCP-specific tools (TBD)

4. **System Prompt Strategy**
   - Remove Ada personality
   - Define MCP client behavior
   - Context injection approach

## Questions for Phase 2

1. **MCP Protocol Integration:** How does MCP differ from Bedrock format?
2. **Storage Strategy:** Client-only IndexedDB or add server sync?
3. **Vector Search Scope:** What gets embedded for MCP context?
4. **Memory System:** Which memory files are relevant for MCP?
5. **Tool Requirements:** What tools does MCP client need?

---

**Document Version:** 1.0
**Last Updated:** 2025-10-01
**Phase 1 Status:** ✅ Complete
