# client/components/

## Purpose
Reusable UI components built with SolidJS for the chat interface and application layout.

## Contents

### Core UI Components
- **alert.js** - Alert/notification system
- **attachments-preview.js** - File attachment preview display
- **class-toggle.js** - Toggle CSS classes utility
- **footer.js** - Application footer
- **header.js** - Application header (logo only)
- **loader.js** - Loading spinner
- **modal.js** - Modal dialog system
- **nav.js** - Navigation bar with user menu
- **privacy-notice.js** - Privacy notice modal (disabled in POC)
- **scroll-to.js** - Scroll-to-bottom button
- **tooltip.js** - Tooltip component

### chat-tools/
Specialized components for rendering AI tool results in chat:
- **browse-tool.js** - Display web page fetch results
- **code-tool.js** - Code execution results with syntax highlighting
- **editor-tool.js** - Memory/file editor results
- **reasoning-tool.js** - Claude's extended thinking display
- **search-tool.js** - Search results display
- **text-content.js** - Plain text content rendering
- **tool-header.js** - Shared header for tool results

## Architecture Pattern
- **SolidJS components** using tagged template literals (`html`)
- **No JSX** - buildless architecture
- **Fine-grained reactivity** with signals and stores
- **Composable** - components can be nested and reused

## Contribution to Project
Forms the building blocks of the entire UI. Chat tools components are critical for displaying AI assistant responses and tool execution results. Core components handle application layout, user interactions, and feedback mechanisms.

## POC Status
✅ **REQUIRED** - Essential for chat functionality and UI
