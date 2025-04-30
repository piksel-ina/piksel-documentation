# ECR Infrastructure Blueprint for Piksel Project

|                    |                           |
| :----------------- | :------------------------ |
| **Version**        | 1.0                       |
| **Date**           | 2025-04-30                |
| **Owner**          | Cloud Infrastructure Team |
| **Implementation** | Terraform, GitOps         |

## 1. Introduction

This document provides the technical specifications for the AWS Elastic Container Registry (ECR) infrastructure supporting the Piksel project. It outlines the design for a central container image repository required for services including Open Datacube (ODC), JupyterHub/Lab, ODC OWS, and Datacube-Explorer. This blueprint serves as the guide for infrastructure-as-code (IaC) implementation, prioritizing security, traceability, and integration with CI/CD workflows.

## 2. Core Infrastructure Principles & Standards

These principles apply globally to the ECR setup.

- **Infrastructure as Code (IaC):** The ECR repository and its configuration (lifecycle policies, permissions, scanning settings) **MUST** be defined and managed using Terraform code stored in the `piksel-infra` Git repository.
- **GitOps:** Changes to the ECR infrastructure **MUST** follow the GitOps workflow (e.g., Pull Request -> Review -> Merge -> Automated Apply via CI/CD).
- **Repository Naming:** A single ECR repository named `piksel-core` **MUST** be used to store container images for all Piksel services.
- **Standard Tagging (Resource Tags):** The ECR repository resource **MUST** include the following tags:
  - `Project: piksel`
  - `Environment: shared` (As ECR is often shared across `dev`/`staging`/`prod`)
  - `Purpose: container-registry`
  - `ManagedBy: Terraform`
  - `Owner: DevOps-Team`
- **Image Tagging Convention (Hybrid):** Images pushed to the repository **MUST** follow this convention:
  - **Release Builds (from Git Tags):** `<service-name>-<git-tag-version>` (e.g., `odc-v1.5.0`, `jupyter-v3.1.2`). These tags **MUST** be immutable.
  - **Development Builds (from Branches):** `<service-name>-<branch-name>-<short-git-sha>` (e.g., `odc-main-a1b2c3d`, `jupyter-develop-f9e8d7c`). These tags **MUST** be immutable.
  - **Optional Latest Tag:** `<service-name>-latest` (e.g., `odc-latest`). This tag is **MUTABLE** and points to the latest build from a designated primary branch (e.g., `main`). It **MUST NOT** be used for deployment to staging or production environments.
- **Default Security Posture:**
  - **Encryption at Rest:** Server-Side Encryption **MUST** be enabled using the default AWS-managed KMS key (`aws/ecr`).
  - **Tag Immutability:** Image tag immutability **MUST** be enabled to prevent overwriting tagged images.
  - **Vulnerability Scanning:** Basic scanning on push **MUST** be enabled, with the ability to toggle via Terraform configuration.
  - **Network Access:** Access to ECR is via AWS API endpoints and controlled solely by IAM permissions.

## 3. Repository Configuration

A single ECR repository will be provisioned to serve all environments (`dev`, `staging`, `prod`). Environment context is managed through image tags and the deployment processes, not separate repositories per environment.

| Repository Name | Services Hosted                                                                | Tag Immutability | Encryption | Scan on Push (Default) | Lifecycle Policy                                                                                            |
| :-------------- | :----------------------------------------------------------------------------- | :--------------- | :--------- | :--------------------- | :---------------------------------------------------------------------------------------------------------- |
| `piksel-core`   | Open Datacube, JupyterHub/Lab, OWS, Datacube-Explorer (and potentially others) | Enabled          | KMS (AWS)  | Enabled                | Keep last 5 tagged images (`countType: imageCountMoreThan`, `countNumber: 5`), Delete untagged > 7 days old |

## 4. Access Control Strategy (IAM)

Terraform code **MUST** create and manage the necessary IAM Policies granting least privilege access to the `piksel-core` ECR repository.

- **CI/CD Pipeline (GitHub Actions via OIDC):**
  - An IAM Role assumable by GitHub Actions via OIDC.
  - Permissions required: `ecr:PutImage`, `ecr:InitiateLayerUpload`, `ecr:UploadLayerPart`, `ecr:CompleteLayerUpload`, `ecr:BatchCheckLayerAvailability`, `ecr:GetAuthorizationToken`, `ecr:BatchDeleteImage` (optional, for cleanup), `ecr:DescribeImages`. Permissions should be scoped to the `piksel-core` repository ARN.
- **EKS Nodes (via IRSA):**
  - IAM Roles for Service Accounts (IRSA) used by EKS pods requiring image pulls (e.g., application deployments).
  - Permissions required: `ecr:GetDownloadUrlForLayer`, `ecr:BatchGetImage`, `ecr:BatchCheckLayerAvailability`, `ecr:GetAuthorizationToken`. Permissions should be scoped to the `piksel-core` repository ARN.
- **Developer Access:**
  - IAM Users/Roles used by developers (potentially via IAM Identity Center).
  - Permissions required: `ecr:GetDownloadUrlForLayer`, `ecr:BatchGetImage`, `ecr:BatchCheckLayerAvailability`, `ecr:DescribeRepositories`, `ecr:DescribeImages`, `ecr:ListImages`, `ecr:GetAuthorizationToken`. Permissions should be scoped to the `piksel-core` repository ARN. Direct push access for developers should generally be disallowed in favor of the CI/CD pipeline.

## 5. Image Lifecycle Management

Automated image cleanup is essential for managing storage costs and reducing clutter.

- **Policy Rules:** The ECR lifecycle policy **MUST** be configured via Terraform to:
  1.  Remove tagged images exceeding a count of 5 (keeping the newest 5 based on push date). Rule: `{"rulePriority": 1, "description": "Keep only last 5 tagged images", "selection": {"tagStatus": "tagged", "countType": "imageCountMoreThan", "countNumber": 5}, "action": {"type": "expire"}}`
  2.  Remove untagged images older than 7 days. Rule: `{"rulePriority": 2, "description": "Expire untagged images older than 7 days", "selection": {"tagStatus": "untagged", "countType": "sinceImagePushed", "countUnit": "days", "countNumber": 7}, "action": {"type": "expire"}}`
- **Rationale:** This retains recent builds for rollbacks/reference while aggressively cleaning up intermediate untagged layers and older development builds. Released versions (tagged) are kept longer based on the count rule.

## 6. Security & Monitoring Implementation

- **Encryption at Rest:**
  - Implemented via Terraform `aws_ecr_repository` resource attributes, specifically `encryption_configuration = { encryption_type = "KMS" }` (uses the default `aws/ecr` KMS key).
- **Tag Immutability:**
  - Implemented via Terraform `aws_ecr_repository` resource attribute `image_tag_mutability = "IMMUTABLE"`.
- **Vulnerability Scanning:**
  - Basic scanning enabled via Terraform `aws_ecr_repository` resource attribute `image_scanning_configuration = { scan_on_push = var.enable_scan_on_push }`.
  - `var.enable_scan_on_push` is a Terraform variable defaulting to `true`.
  - **Recommendation:** Implement additional, free vulnerability scanning (e.g., Trivy, Grype) within the CI/CD pipeline _before_ the image push to ECR for earlier feedback.
- **Monitoring (CloudTrail):**
  - Ensure AWS CloudTrail is enabled in the region to log ECR API calls (e.g., `PutImage`, `DeleteRepositoryPolicy`) for auditing and security analysis.
- **Monitoring (Events):**
  - Consider configuring ECR events (e.g., image push, scan completion) to trigger notifications or automated actions via Amazon EventBridge if needed.

## 7. Optimization Implementation

- **Lifecycle Policies:** The primary mechanism for cost and operational optimization by automatically removing unneeded images. Policy rules should be monitored and adjusted based on usage patterns and cost.
- **Single Repository:** This approach simplifies initial setup and IAM policy management. Monitor for any challenges related to managing diverse service lifecycles or permissions within one repository; split into per-service repositories later if necessary.

## 8. Terraform & GitOps Implementation Notes

- **Modular Structure:**
  - Utilize the `terraform-aws-modules/ecr/aws` Terraform module within the `piksel-infra` repository.
  - Configure the module within a shared infrastructure definition (e.g., `_common/` or `shared/`) as ECR is typically not environment-specific.
- **Configuration:**
  - Key module inputs: `repository_name = "piksel-core"`, `image_tag_mutability = "IMMUTABLE"`, `image_scanning_configuration = { scan_on_push = var.enable_scan_on_push }`, `encryption_configuration = { encryption_type = "KMS" }`, `repository_lifecycle_policy = jsonencode({...})`, `tags = local.standard_tags`.
- **Variable Management:**
  - Define `enable_scan_on_push` variable (defaulting to `true`).
- **State Management:** Use Terraform Cloud with a dedicated workspace (e.g., `piksel-ecr-shared`) for remote state and locking.
- **CI/CD Pipeline (Infrastructure via `piksel-infra`):**
  - Follows standard GitOps workflow: PR -> Validate (fmt, validate, tfsec) -> Merge -> Apply (via Terraform Cloud, potentially with manual approval).
- **CI/CD Pipeline (Image Build/Push via `piksel-core`):**
  - A separate pipeline within the `piksel-core` repository (or service-specific repos if structure changes) will be responsible for:
    - Building Docker images.
    - Running pre-push checks (linting, vulnerability scanning).
    - Tagging images according to the defined convention (`<service>-<version>` or `<service>-<branch>-<sha>`).
    - Authenticating to ECR using the OIDC role.
    - Pushing the tagged images to the `piksel-core` repository.
