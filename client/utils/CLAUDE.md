# client/utils/

## Purpose
Utility functions and algorithms for client-side operations.

## Contents

### Core Utilities
- **alerts.js** - Alert/notification state management (SolidJS stores)
- **files.js** - File upload handling, streaming, base64 encoding
- **parsers.js** - Document parsers (PDF, DOCX, images) using browser APIs
- **utils.js** - General utilities (cookies, formatting, etc.)
- **xml.js** - JSON to XML conversion

### Advanced Features
- **hnsw.js** - **Hierarchical Navigable Small World algorithm**
  - Vector similarity search implementation
  - Fast approximate nearest neighbor search
  - Used for semantic search through conversations
  - Pure JavaScript implementation

- **similarity.js** - Similarity metrics
  - Cosine similarity
  - Euclidean distance
  - Used by HNSW for vector comparison

- **tools.js** - **Client-side tool execution framework**
  - LocalStorage-based file system
  - Tool definitions (search, browse, code, editor, think)
  - Tool result processing
  - Memory management for AI assistant

## Key Algorithms

### HNSW (hnsw.js)
- **Purpose:** Enable "find similar conversations" feature
- **How it works:** Builds hierarchical graph of vectors for O(log n) search
- **Why client-side:** Privacy - search happens locally, never server
- **Performance:** Can search thousands of conversations in milliseconds

### Tools Framework (tools.js)
- **Memory files:** AI assistant can create/read/edit files in LocalStorage
- **Search tool:** Integrates with server search API
- **Browse tool:** Fetches and parses web pages
- **Code tool:** Executes JavaScript (limited for safety)
- **Editor tool:** File system for assistant's long-term memory
- **Think tool:** Extended reasoning mode

## Contribution to Project
**Critical utilities that enable advanced features:**
1. **Vector search** - Makes conversation history searchable
2. **Tool execution** - Enables AI agent capabilities
3. **File handling** - Allows attachments and document processing
4. **Memory system** - Gives AI persistent context

## POC Status
✅ **REQUIRED** - These utilities power core chat functionality

## Most Important Files
1. **tools.js** - Tool execution is central to AI assistant capabilities
2. **hnsw.js** - Enables semantic search (advanced but impressive feature)
3. **files.js** - Required for file uploads
4. **parsers.js** - Required for document understanding
