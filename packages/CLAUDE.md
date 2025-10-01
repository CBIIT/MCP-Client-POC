# Packages

## Overview

Shared packages used across the project. Currently contains only ESLint configuration for consistent code style across client and server.

## Directory Structure

| Folder | Purpose |
|--------|---------|
| **eslint-config/** | Shared ESLint configuration package |

## ESLint Configuration

### Purpose
Provides consistent JavaScript/ESM linting rules for both client and server codebases.

### Usage

In client or server `package.json`:
```json
{
  "devDependencies": {
    "@nci-webtools-ctri-research-optimizer/eslint-config": "file:../packages/eslint-config"
  }
}
```

In `eslint.config.js`:
```javascript
import baseConfig from '@nci-webtools-ctri-research-optimizer/eslint-config';

export default [
  ...baseConfig,
  // Additional project-specific rules
];
```

### Configuration Files

- `index.js` - Main ESLint configuration
- `node.js` - Node.js specific rules
- `solid.js` - SolidJS specific rules

### Rules Included

- **ES6/ESM**: Modern JavaScript syntax support
- **Node.js**: Server-side best practices
- **SolidJS**: Reactive framework patterns
- **Code Style**: Consistent formatting rules

## Future Additions

This directory could contain:
- Shared TypeScript configurations
- Shared utility libraries
- Common constants/types
- Testing utilities
- Build tools configuration

## Why Shared Packages?

1. **Consistency**: Same linting rules across all code
2. **Maintainability**: Update rules in one place
3. **Reusability**: Import in multiple projects
4. **Version Control**: Track changes to configuration

## Development

To modify ESLint configuration:

```bash
cd packages/eslint-config
# Edit configuration files
npm version patch  # Increment version
cd ../../client && npm install  # Update in client
cd ../server && npm install     # Update in server
```

## Best Practices

1. **Keep It Minimal**: Only shared configuration here
2. **Version Properly**: Use semantic versioning
3. **Document Changes**: Update this file when adding packages
4. **Test Changes**: Verify in both client and server before committing
