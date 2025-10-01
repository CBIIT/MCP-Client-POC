# Client Application

## Overview

A buildless SolidJS frontend application for the Research Optimizer platform. The client provides a conversational AI interface with client-side machine learning, vector search, and document processing capabilities.

**Key Feature:** No build step required - uses ES modules and CDN dependencies via import maps.

## Architecture

- **Framework**: SolidJS with tagged template literals (`html` from `solid-js/html`)
- **Dependencies**: Loaded via CDN through import maps in `index.html`
- **Storage**: IndexedDB for conversations, projects, and messages
- **ML**: Client-side embeddings and HNSW vector search
- **Testing**: Custom TAP framework running in real browser environment

## Directory Structure

| Folder/File | Purpose |
|-------------|---------|
| **components/** | Reusable UI components (modal, table, tabs, etc.) |
| **pages/** | Route components (main pages of the application) |
| **pages/tools/chat/** | Main chat interface with streaming AI responses |
| **models/** | IndexedDB wrappers and data models (Project, Conversation, Message) |
| **utils/** | Utilities (file handling, HNSW vector search, model helpers) |
| **assets/** | Static files (images, icons, PDFs) |
| **test/** | Custom test framework and test files |
| **templates/** | HTML templates for various pages |
| **configs/** | Configuration files |
| **index.html** | Application entry point with import maps |
| **session.html** | Session management page |

## Key Features

### Chat System (`pages/tools/chat/`)

The heart of the application - provides:
- Streaming AI responses with real-time updates
- Multi-file uploads (PDF, DOCX, images)
- Tool calling for research tasks
- Conversation persistence in IndexedDB
- Project organization

**Core Files:**
- `index.js` - Main chat UI component
- `hooks.js` - State management, API calls, database operations
- `message.js` - Message rendering with markdown support
- `config.js` - AI model configuration

### Client-Side Machine Learning

- **Vector Search**: Custom HNSW (Hierarchical Navigable Small World) implementation in `utils/hnsw.js`
- **Embeddings**: Hugging Face Transformers.js for local text vectorization (`models/embedders.js`)
- **Storage**: IndexedDB for user-isolated data with vector search capabilities (`models/database.js`)

### Data Models (`models/`)

- `Project` - Top-level organization
- `Conversation` - Chat sessions
- `Message` - Individual messages with embeddings
- `database.js` - IndexedDB wrapper with vector search

## Development

### SolidJS Pattern

Uses tagged template literals instead of JSX:

```javascript
import html from 'solid-js/html';
import { createSignal } from 'solid-js';

function Component() {
  const [count, setCount] = createSignal(0);
  return html`<div>${count}</div>`;
}
```

**Important:** No build step means no transpilation - must use native ES modules.

### Adding Dependencies

Add to import maps in `index.html`:

```html
<script type="importmap">
{
  "imports": {
    "new-library": "https://cdn.jsdelivr.net/npm/new-library@1.0.0/dist/index.min.js"
  }
}
</script>
```

### Testing

Run tests via server integration tests:

```bash
cd server && npm run test:integration
```

Tests run in actual Chromium browser via Playwright using custom TAP framework.

**Test Files:**
- `test/test.js` - TAP test framework
- `test/assert.js` - Assertion library
- `test/*.test.js` - Test files

## Components

Reusable UI components in `components/`:

| Component | Purpose |
|-----------|---------|
| **modal.js** | Modal dialogs |
| **table.js** | Data tables with sorting/filtering |
| **tabs.js** | Tabbed interfaces |
| **sidebar.js** | Navigation sidebar |
| **tooltip.js** | Tooltips |
| **alert.js** | Alert messages |
| **file-tree.js** | File tree viewer |
| **message-attachment.js** | File attachment display |

All components use SolidJS tagged templates (not JSX).

## Key Utilities

### Vector Search (`utils/hnsw.js`)
HNSW algorithm implementation for fast approximate nearest neighbor search.

### File Handling (`utils/files.js`)
- File upload management
- Document parsing coordination
- Base64 encoding/decoding

### Model Helpers (`utils/model.js`)
- Message formatting for AI models
- Token counting
- Response parsing

## Configuration

### Model Settings (`pages/tools/chat/config.js`)
Configure AI model parameters:
- Temperature
- Max tokens
- System prompts
- Available models

### Import Maps (`index.html`)
All external dependencies loaded via CDN:
- SolidJS
- Transformers.js
- Marked (markdown)
- DOMPurify (sanitization)

## Build-Free Advantages

1. **Instant Refresh**: No build step = instant page reload
2. **Simpler Debugging**: No source maps needed
3. **Transparent Dependencies**: See exactly what's loaded via import maps
4. **Production = Development**: Same code runs in both environments

## Limitations

- No JSX (must use tagged templates)
- No TypeScript (unless you add a build step)
- Larger initial payload (no tree shaking)
- CDN dependency availability

## Best Practices

1. **Never destructure props** - breaks reactivity
2. **Wrap store properties** - `${() => store.property}` not `${store.property}`
3. **Use signals for simple state** - `createSignal()` for primitives
4. **Use stores for complex state** - `createStore()` for objects/arrays
5. **Test in real browser** - via integration tests, not unit tests

## Related Documentation

See `client/readme.md` for comprehensive SolidJS development guide with examples.
