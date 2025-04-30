# Piksel Documentation Repository

## Overview

Welcome to Piksel's central documentation repository. This repository serves as the primary source of technical documentation, architectural decisions, security guidelines, and operational procedures for Piksel's cloud infrastructure and development practices.

## Repository Structure

<!-- prettier-ignore-start -->
```
piksel-document/
├── architecture/           # System architecture documentation
│   └── network.md
├── assets/                 # Supporting images and files
├── operations/             # Operational procedures and guides
│   ├── 01-repository-strategy-and-cicd.md
│   └── 02-AWS-identity-center-guide.md
├── project-plans/          # Project planning and execution documents
│   ├── 01-milestones.md
│   └── 02-execution-plan.md
└── security/               # Security policies and implementation guides
    ├── 01-piksel-AWS-Organization-Foundational-Security-Guidelines.md
    └── 02-piksel-OIDC-implementation.md
```
<!-- prettier-ignore-end -->

## Key Documents

### Security

- [AWS Organization Security Guidelines](security/01-piksel-AWS-Organization-Foundational-Security-Guidelines.md) - Foundation of our AWS account structure and security policies
- [OIDC Implementation Guide](security/02-piksel-OIDC-implementation.md) - Details on our OpenID Connect implementation for AWS services

### Operations

- [Repository Strategy & CI/CD](operations/01-repository-strategy-and-cicd.md) - Guidelines for repository management and CI/CD practices
- [AWS Identity Center Guide](operations/02-AWS-identity-center-guide.md) - User management and access control procedures

### Architecture

- [Network Architecture](architecture/network.md) - Network design and infrastructure layout
- [Object Storage Architecture](architecture/object-storage.md) - Technical specifications for the AWS S3 infrastructure
- [Database Architecture](architecture/database.md) - Technical specifications for the AWS Relational Database Service (RDS)

### Project Planning

- [Project Milestones](project-plans/01-milestones.md)
- [Execution Plan](project-plans/02-execution-plan.md)

## Documentation Conventions

- All documentation is written in Markdown
- Use relative links for cross-referencing documents
- Include diagrams when explaining complex systems
- Keep security-sensitive information in appropriate internal systems

## Maintainers

- Piksel Development Team

## License

Copyright © 2025 Piksel. All rights reserved.
