# packages/eslint-config/

## Purpose
Shared ESLint configuration package for consistent code quality across client and server.

## Contents

### Configuration Files
- **index.js** - Base ESLint rules for JavaScript/ESM
- **node.js** - Node.js specific linting rules
- **solid.js** - SolidJS framework-specific rules
- **package.json** - Package metadata and dependencies

## How It's Used

### In Client
```json
{
  "devDependencies": {
    "@nci-webtools-ctri-research-optimizer/eslint-config": "file:../packages/eslint-config"
  }
}
```

### In Server
Same pattern - imported as local file dependency

### In ESLint Config
```javascript
import baseConfig from '@nci-webtools-ctri-research-optimizer/eslint-config';
export default [...baseConfig, /* project-specific rules */];
```

## Contribution to Project
Enforces consistent code style and catches common errors:
- JavaScript best practices
- ESM module patterns
- Node.js conventions
- SolidJS reactivity rules

## Benefits
1. **Consistency** - Same rules everywhere
2. **Maintainability** - Update rules in one place
3. **Quality** - Catches bugs before runtime
4. **Onboarding** - New developers get instant feedback

## POC Status
⚠️ **OPTIONAL** - Useful for code quality but not required for functionality

## Note
This is a **local package** (not published to npm). It's installed via `file:../packages/eslint-config` reference, so changes are instant.
