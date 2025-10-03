# client/pages/

## Purpose
Page-level components and routing logic for the application.

## Contents

### Root Level
- **index.js** - Application entry point, sets up router
- **layout.js** - Main layout wrapper (header, nav, footer)
- **routes.js** - Route definitions (simplified to just Chat at root)
- **auth.js** - Authorization wrapper component

### tools/chat/
**The heart of the application** - Chat interface implementation:

- **index.js** - Main chat UI component
  - Left sidebar: conversation history
  - Center: message thread
  - Bottom: input form with file uploads
  - Manages UI state and interactions

- **hooks.js** - Chat state management and business logic
  - `useChat()` hook - Main state controller
  - Message submission and streaming
  - IndexedDB operations
  - Tool execution coordination
  - File attachment handling

- **message.js** - Individual message rendering
  - User vs assistant messages
  - Tool result display
  - Markdown rendering
  - Streaming updates

- **config.js** - Standard chat configuration
  - System prompt
  - Available tools (search, browse, code, editor, think)
  - Model settings

- **fedpulse.config.js** - FedPulse variant configuration
  - Specialized for government document search
  - Different system prompt and tools

- **delete-conversation.js** - Delete confirmation modal

## Architecture Pattern
- **SolidJS routing** - Client-side navigation
- **Layout composition** - Pages wrapped in layout
- **Lazy loading** - Pages loaded on demand
- **Auth gating** - Pages check user permissions

## Contribution to Project
**The entire user-facing application.** Chat folder contains:
- All conversation UI/UX
- Message state management
- Tool integration
- File handling
- Everything users interact with

## POC Status
✅ **REQUIRED** - This IS the POC

## Critical Files
1. **tools/chat/hooks.js** - Most complex, handles all chat logic
2. **tools/chat/index.js** - Main UI users see
3. **tools/chat/message.js** - How messages are displayed
4. **routes.js** - Simplified to route everything to chat

## Removed in POC
- `home.js` - Landing page (deleted)
- `users/*` - User management (deleted)
- Other tool pages (translate, semantic search, etc.) - all deleted
