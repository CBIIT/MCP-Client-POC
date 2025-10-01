# Infrastructure

## Overview

AWS CDK (Cloud Development Kit) infrastructure-as-code for deploying the Research Optimizer platform to AWS. Written in TypeScript, defines all cloud resources needed to run the application.

**Purpose:** Automated deployment of containerized application to AWS ECS with supporting services.

**Note for MCP Client POC:** This infrastructure may not be needed for the POC phase. Consider simpler deployment options (Docker Compose, single EC2, etc.) before investing in full AWS CDK setup.

## Architecture

- **IaC Framework**: AWS CDK (TypeScript)
- **Compute**: ECS Fargate (serverless containers)
- **Registry**: ECR (Elastic Container Registry)
- **Database**: RDS PostgreSQL with pgvector
- **Networking**: VPC, security groups, load balancers

## Directory Structure

| Folder/File | Purpose |
|-------------|---------|
| **bin/** | CDK app entry points |
| **lib/stacks/** | CDK stack definitions |
| **config/** | Environment-specific configurations |
| **config/environments/** | Per-environment settings (dev, qa, stage, prod) |
| **templates/** | CloudFormation templates |
| **test/** | Infrastructure tests |
| **cdk.json** | CDK configuration |
| **bootstrap.yaml** | CDK bootstrap template |

## For MCP Client POC

**Recommendation:** Skip this infrastructure for now. Use simpler deployment:

1. **Local Development**: Docker Compose (already configured)
2. **Simple Deploy**: Single EC2 with Docker or Railway/Render
3. **Production Later**: Return to CDK when scaling

If you do need AWS deployment, this infrastructure is production-ready and can be adapted.

## Original Documentation

(Keeping original documentation for reference)

### CDK Stacks

#### ECR Repository Stack
Creates Docker image repository for server container.

**Resources:**
- ECR repository with lifecycle policies
- Image scanning on push
- Cross-region replication (optional)

#### RDS Cluster Stack
PostgreSQL database with pgvector extension.

**Resources:**
- Aurora PostgreSQL cluster
- Security groups
- Backup configuration
- Parameter groups with pgvector

#### ECS Service Stack
Main application deployment.

**Resources:**
- ECS cluster
- Fargate task definitions
- Application Load Balancer
- Auto-scaling policies
- CloudWatch logs
- Service discovery

For full infrastructure documentation, see the original implementation details below.

---

*Full original infrastructure documentation preserved for reference when needed for production deployment.*
