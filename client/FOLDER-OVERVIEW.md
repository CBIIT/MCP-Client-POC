# client/

## Purpose
**Frontend application** - Complete chat interface with client-side ML and persistent storage.

## High-Level Architecture

### Technology Stack
- **Framework:** SolidJS (buildless, no compilation)
- **UI:** Tagged template literals (`html` from `solid-js/html`)
- **Styling:** Bootstrap + custom CSS
- **Storage:** IndexedDB for conversations
- **ML:** Transformers.js for embeddings
- **Search:** HNSW algorithm for vector similarity

### Key Characteristics
- **No build step** - ES modules loaded directly from CDN
- **Client-side intelligence** - Embeddings and search happen locally
- **Privacy-first** - All conversations stored in browser, not server
- **Progressive** - Works offline after first load

## Directory Structure

```
client/
├── assets/          # Static files (fonts, images, CSS)
├── components/      # Reusable UI components
│   └── chat-tools/  # Tool result renderers
├── configs/         # Configuration files
├── models/          # IndexedDB + data models
├── pages/           # Route components
│   └── tools/chat/  # ★ Main chat interface
├── templates/       # HTML/Markdown templates
├── test/            # Custom test framework
├── utils/           # Utilities and algorithms
│   ├── hnsw.js      # ★ Vector search
│   └── tools.js     # ★ Tool execution
├── index.html       # Application entry point
└── session.html     # Session management
```

## Core Components by Function

### User Interface (Visual Layer)
- `pages/tools/chat/index.js` - Main chat UI
- `components/` - Reusable UI elements
- `assets/` - Visual resources

### Business Logic (Brain)
- `pages/tools/chat/hooks.js` - State management
- `utils/tools.js` - Tool execution
- `models/database.js` - Data persistence

### Intelligence (ML Layer)
- `models/embedders.js` - Text vectorization
- `utils/hnsw.js` - Semantic search
- `utils/similarity.js` - Distance metrics

### Data Layer
- `models/database.js` - IndexedDB wrapper
- `models/models.js` - Data schemas
- LocalStorage - Tool file system

## Data Flow

### Message Submission Flow
1. **User types message** → `chat/index.js` form
2. **Form submit** → `chat/hooks.js` submitMessage()
3. **Store in IndexedDB** → `models/database.js`
4. **Send to server** → POST `/api/model`
5. **Stream response** → Update UI in real-time
6. **Store response** → IndexedDB
7. **Generate embedding** → `embedders.js`
8. **Index for search** → `hnsw.js`

### Tool Execution Flow
1. **AI requests tool** → Server returns tool_use
2. **Client executes** → `utils/tools.js`
3. **Tool runs** → (search API, web fetch, code exec, etc.)
4. **Result packaged** → JSON format
5. **Send back** → Continue conversation
6. **Display result** → `components/chat-tools/`

## Critical Files (Cannot Work Without)

### Essential (Top 5)
1. **pages/tools/chat/hooks.js** - All chat logic
2. **models/database.js** - Conversation storage
3. **utils/tools.js** - Tool capabilities
4. **pages/tools/chat/index.js** - Main UI
5. **index.html** - Entry point with CDN imports

### Important (Key Features)
- `utils/hnsw.js` - Semantic search
- `components/chat-tools/*.js` - Tool displays
- `utils/parsers.js` - Document handling
- `models/embedders.js` - ML embeddings

## Impressive Technical Features

### 1. Client-Side Vector Search
**Why impressive:** Full HNSW implementation in browser JavaScript
- Search thousands of conversations in milliseconds
- No server needed - complete privacy
- Competitive with dedicated vector databases

### 2. Buildless Architecture
**Why impressive:** Modern SPA without webpack/vite/etc.
- Instant refresh during development
- Same code dev and prod
- No source maps needed
- Smaller complexity surface

### 3. LocalStorage File System
**Why impressive:** Gives AI persistent memory
- Create/read/edit files
- Survives page refresh
- Tools can share state
- AI has "long-term memory"

### 4. Streaming with Backpressure
**Why impressive:** Handles fast AI responses smoothly
- Real-time updates without blocking
- Graceful handling of network issues
- Progressive rendering of tool results

## POC Status
✅ **REQUIRED** - This IS the user-facing application

## Contribution to Overall Project
The client is **the entire user experience**:
- What users see
- What users interact with
- Where conversations are stored
- Where intelligence happens (search, embeddings)

Without the server, this could be a static site with limited features. Without the client, there's no application at all.

## Entry Point
Start here: `index.html` → loads `pages/index.js` → renders `pages/tools/chat/index.js`

## Most Complex File
**pages/tools/chat/hooks.js** (~600 lines) - State machine for entire chat experience
