# GitHub Configuration

## Overview

GitHub-specific configuration including CI/CD workflows, Actions, and repository automation.

**Note for MCP Client POC:** Original CI/CD workflows are configured for AWS deployment. You'll likely want to modify or replace these for your deployment strategy.

## Directory Structure

| Folder/File | Purpose |
|-------------|---------|
| **workflows/** | GitHub Actions workflow definitions |

## Current Workflows

### deploy.yaml

Automated deployment workflow for the Research Optimizer platform (AWS-focused).

**Original Trigger:** Push to specific branches
- `dev` branch → Deploy to dev environment
- `qa` branch → Deploy to qa environment
- `stage` branch → Deploy to stage environment
- `main` branch → Deploy to prod environment

**For MCP Client POC:** You'll likely want to modify this for your deployment target (Railway, Render, DigitalOcean, etc.)

### run-command.yaml

Manual workflow for running arbitrary commands in the deployment environment.

**Trigger:** Manual dispatch (`workflow_dispatch`)

## Recommendations for MCP Client POC

1. **Simplify Deployment**: Replace AWS workflows with simpler deployment:
   - Railway/Render: Auto-deploy on push
   - Docker Hub: Build and push image
   - Simple EC2: SSH and docker pull

2. **Keep Testing Workflow**: Add a simple test workflow:
   ```yaml
   name: Test
   on: [push, pull_request]
   jobs:
     test:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v2
         - run: cd server && npm install && npm test
   ```

3. **Add Linting**: Pre-commit checks for code quality

## Original Documentation

(Keeping for reference when scaling to production)

### GitHub Actions Features

- Docker layer caching for faster builds
- npm dependency caching
- CDK asset caching
- Secrets management
- Environment-based deployments

### Branch Protection

Recommended rules for production:
- main: Require PR reviews, status checks
- stage: Require PR review, status checks
- dev/qa: Allow direct pushes for rapid dev

For full original documentation, see below.

---

*Full original GitHub Actions documentation preserved for reference.*
