# client/configs/

## Purpose
Configuration files for client-side features and behaviors.

## Contents

### attachment-file-types.js
- **Supported file types** for chat attachments
- MIME type mappings
- File extension validators
- Defines what files users can upload (PDF, DOCX, images, text files, etc.)

## Contribution to Project
Centralizes file upload configuration, ensuring consistent file type handling across the application. Controls what file types the chat interface will accept and how to parse them.

## POC Status
✅ **REQUIRED** - Needed for file upload functionality in chat
