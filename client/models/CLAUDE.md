# client/models/

## Purpose
Client-side data persistence layer using IndexedDB for storing conversations, messages, and embeddings.

## Contents

### database.js
- **IndexedDB wrapper** - Main database abstraction
- **ConversationDB class** - CRUD operations for conversations
- User-scoped databases (isolated by email)
- Object stores: `projects`, `conversations`, `messages`, `resources`, `embeddings`
- Vector search integration

### database2.js
- Alternative/experimental database implementation
- Possibly for testing or migration purposes

### embedders.js
- **Client-side ML embeddings** using Transformers.js
- Text vectorization for semantic search
- Embedding models loaded in browser
- Generates embeddings for message content

### models.js
- **Data model definitions** for:
  - `Project` - Top-level organization
  - `Conversation` - Chat sessions
  - `Message` - Individual messages
  - `Resource` - Attached files/documents
- Schema definitions and relationships

## Architecture Pattern
- **IndexedDB** - Browser-native NoSQL database
- **User isolation** - Each user has separate database (`user-${email}`)
- **Vector embeddings** - Enable semantic search across conversations
- **Client-side only** - No server storage of conversations

## Contribution to Project
**Critical for POC** - Stores ALL conversation history locally. Enables:
1. Conversation persistence across sessions
2. Semantic search through chat history
3. User privacy (data never leaves device)
4. Offline capability

## POC Status
✅ **REQUIRED** - Core feature for conversation storage and retrieval

## Key Insight
User email from auth is REQUIRED to initialize database - this is why hardcoded `dev@localhost` user is necessary even without OAuth.
