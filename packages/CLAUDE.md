# packages/

## Purpose
Shared packages and configuration used across multiple parts of the project.

## High-Level Architecture

### Contents
```
packages/
└── eslint-config/    # Shared ESLint configuration
    ├── index.js      # Base JavaScript rules
    ├── node.js       # Node.js specific rules
    ├── solid.js      # SolidJS specific rules
    └── package.json  # Package metadata
```

## What This Is
A **monorepo pattern** for shared configuration:
- ESLint rules that both client and server import
- Installed as local file dependency: `file:../packages/eslint-config`
- Changes take effect immediately (no publishing needed)

## Benefits

### Code Quality
- Consistent style across client and server
- Catches common errors
- Enforces best practices
- Framework-specific rules (SolidJS reactivity, Node.js patterns)

### Maintainability
- Update rules in one place
- Version control for configuration
- Can add more shared packages easily

### Developer Experience
- Instant feedback in IDE
- Auto-fix on save
- Clear error messages

## How It's Used

### In client/package.json
```json
{
  "devDependencies": {
    "@nci-webtools-ctri-research-optimizer/eslint-config": "file:../packages/eslint-config"
  }
}
```

### In client/eslint.config.js
```javascript
import baseConfig from '@nci-webtools-ctri-research-optimizer/eslint-config';
export default [...baseConfig, /* project-specific overrides */];
```

Same pattern in server.

## Contribution to Project
**Optional but valuable** - Improves code quality without affecting functionality:
- Prevents bugs before they happen
- Makes code more maintainable
- Helps onboarding new developers
- Enforces consistent patterns

## POC Status
⚠️ **OPTIONAL** - Nice to have, not required for POC to function

## Could Add Later
This packages/ folder could contain:
- Shared TypeScript config
- Shared utility libraries
- Common constants/types
- Build tool configurations
- Testing utilities

## Note
This is a **local package**, not published to npm. It's part of the monorepo and installed via file path reference.
