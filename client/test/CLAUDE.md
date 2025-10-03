# client/test/

## Purpose
Custom test framework and test files for client-side code.

## Contents

### Test Framework
- **test.js** - Custom TAP (Test Anything Protocol) framework
- **assert.js** - Assertion library for tests
- **run.js** - Test runner orchestrator

### Test Files
- **solidjs.test.js** - SolidJS framework tests
- **pages/tools/chat/message.test.js** - Chat message component tests

## Architecture Pattern
- **Real browser testing** - Uses Playwright to run tests in Chromium
- **TAP format** - Industry-standard test output
- **No mocking** - Tests use real services (AWS Bedrock, databases, etc.)
- **Integration-focused** - Tests full stack interactions

## How It Works
Server integration tests (`server/integration.js`) spawn Chromium browser, load client code, and execute tests in real browser environment.

## Contribution to Project
Ensures client-side code works correctly, especially:
- SolidJS reactivity
- Chat message rendering
- Component behavior

## POC Status
⚠️ **OPTIONAL** - Testing is good practice but not required for POC functionality

## Testing Philosophy
"Real services, no mocking" - Tests validate actual behavior rather than mocked interfaces. This catches real-world issues but requires services to be available.
