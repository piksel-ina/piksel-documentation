# S3 Infrastructure Blueprint for Piksel Project

|                    |                           |
| ------------------ | ------------------------- |
| **Version**        | 1.0                       |
| **Date**           | 2025-04-25                |
| **Owner**          | Cloud Infrastructure Team |
| **Implementation** | Terraform, GitOps         |

## 1. Introduction

This document provides the technical specifications for the AWS S3 infrastructure supporting the Piksel project. It serves as the blueprint for infrastructure-as-code (IaC) implementation using Terraform and ongoing management via GitOps workflows. The design prioritizes security, cost-efficiency, operational clarity, and clear separation of environments.

## 2. Core Infrastructure Principles & Standards

These principles apply globally unless explicitly overridden in environment-specific sections.

- **Infrastructure as Code (IaC):** All S3 resources (buckets, policies, configurations) **MUST** be defined and managed using Terraform code stored in the designated Git repository.
- **GitOps:** Changes to the infrastructure **MUST** follow the GitOps workflow (e.g., Pull Request -> Review -> Merge -> Automated Apply via CI/CD).
- **Naming Convention:** `Piksel-<environment>-<purpose>`
  - <purpose>: `data`, `notebooks`, `web`
  - <environment>: `dev`, `staging`, `prod`
- **Standard Tagging:** All buckets MUST include the following tags:

  - Project: Piksel
  - Environment: `dev`, `staging`, `prod`
  - Purpose: `data`, `notebooks`, `web`
  - ManagedBy: `Terraform`
  - Owner = "DevOps-Team"

- **Default Security Posture:**
  - **Encryption:** Server-Side Encryption with AWS KMS-managed keys (SSE-KMS) MUST be enabled on all buckets. Use a dedicated KMS key per environment or purpose where appropriate.
  - **Public Access:** Block Public Access settings MUST be enabled for all buckets _except_ for `web` buckets, which are accessed via CloudFront OAI/OAC.
  - **Versioning:** Versioning MUST be enabled on all buckets _except_ `web` buckets.
  - **Access Logging:** S3 server access logging MUST be enabled for all buckets. Configure a dedicated logging bucket (e.g., `piksel-ina-logs`). Logs should be stored with appropriate lifecycle policies.
  - **TLS Enforcement:** Bucket policies MUST enforce secure transport (TLS) using `aws:SecureTransport: false` condition where applicable.

## 3. Environment Definitions

This section details the specific configuration for each bucket within each environment. Terraform modules should be used to ensure consistency, with environment-specific variables overriding defaults.

### 3.1. Development Environment (`dev`)

- **Purpose:**
  - Sandboxed environment for development, experimentation, and initial data processing.
  - Cost optimization is prioritized.
- **VPC Endpoint:**

  - All access (except potentially initial developer setup) should ideally route through a VPC endpoint for S3 within the development VPC.

  | Bucket Name            | Purpose & Content                           | Storage Class       | Lifecycle Rules                                   | Key Access Patterns & Policies                                                                                                                                                         |
  | :--------------------- | :------------------------------------------ | :------------------ | :------------------------------------------------ | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
  | `Piksel-dev-data`      | Raw EO data, intermediate processing, tiles | INTELLIGENT_TIERING | `/raw/`: 30d to IA. `/processed/`, `/tiles/`: TBD | **Write:** Data Ingestion Pipelines (`/raw/`), EKS Pods via IRSA (`/processed/`, `/tiles/`), Developers. <br> **Read:** Developers, OWS Server (via role). Access restricted via VPCe. |
  | `Piksel-dev-notebooks` | Jupyter notebooks, user workspaces, outputs | STANDARD            | `/outputs/`: 30d delete.                          | **Full:** Developers, JupyterHub Service Account (via IRSA/Role). Access restricted via VPCe.                                                                                          |
  | `Piksel-dev-web`       | Static web assets for development testing   | STANDARD            | None                                              | **Write:** CI/CD Pipeline Role, Developers. <br> **Read:** Developers (direct access allowed for testing). <br> **NO Public Access.** Block Public Access Enabled.                     |

### 3.2. Staging Environment (`staging`)

- **Purpose:**
  - Pre-production environment for validation, QA testing, and integration checks.
  - Mirrors production configuration closely but allows for testing promotion workflows.
- **VPC Endpoint:**

  - All access MUST route through a VPC endpoint for S3 within the staging VPC.

  | Bucket Name                | Purpose & Content                               | Storage Class | Lifecycle Rules                             | Key Access Patterns & Policies                                                                                                                                                                                               |
  | :------------------------- | :---------------------------------------------- | :------------ | :------------------------------------------ | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
  | `Piksel-staging-data`      | Validated datasets and tiles pending production | STANDARD      | Delete unvalidated/stale data after 14 days | **Write:** ONLY via automated Promotion Workflow (CI/CD Pipeline Role). <br> **Read:** Validation Pipelines (via role), Developers (Read-Only recommended), OWS Server (via role). Access restricted via VPCe.               |
  | `Piksel-staging-notebooks` | Approved notebooks aligned with staging data    | STANDARD      | None                                        | **Write:** ONLY via automated Promotion Workflow (CI/CD Pipeline Role). <br>**Read:** Developers. Access restricted via VPCe.                                                                                                |
  | `Piksel-staging-web`       | Static web assets for staging/QA                | STANDARD      | None                                        | **Write:** ONLY via automated Promotion Workflow (CI/CD Pipeline Role). <br>**Read:** ONLY via CloudFront Distribution using OAI/OAC. Bucket Policy MUST restrict access to CloudFront. <br>**Block Public Access Enabled.** |

### 3.3. Production Environment (`prod`)

- **Purpose:**
  - Live environment serving end-users and applications.
  - Stability, security, and availability are paramount.
- **VPC Endpoint:**
  - All internal access MUST route through a VPC endpoint for S3 within the production VPC.
- **MFA Delete:**

  - MUST be enabled for `piksel-ina-prod-data` bucket.

  | Bucket Name             | Purpose & Content                              | Storage Class       | Lifecycle Rules                                        | Key Access Patterns & Policies                                                                                                                                                                                                                                                  |
  | :---------------------- | :--------------------------------------------- | :------------------ | :----------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
  | `Piksel-prod-data`      | Production datasets and tiles                  | INTELLIGENT_TIERING | 90d to IA, 180d to GLACIER_IR (or appropriate archive) | **Write:** ONLY via approved/automated Promotion Workflow (CI/CD Pipeline Role). <br>**Read:** Production Applications (via IAM Roles/IRSA), OWS Server (via role), Developers (Read-Only access strongly recommended). Access restricted via VPCe. <br>**MFA Delete Enabled.** |
  | `Piksel-prod-notebooks` | Published notebooks corresponding to prod data | STANDARD            | None                                                   | **Write:** ONLY via approved/automated Promotion Workflow (CI/CD Pipeline Role). <br>**Read:** Developers (Reference only). Access restricted via VPCe.                                                                                                                         |
  | `Piksel-prod-web`       | Production static website assets               | STANDARD            | None                                                   | **Write:** ONLY via approved/automated Promotion Workflow (CI/CD Pipeline Role). <br>**Read:** ONLY via CloudFront Distribution using OAI/OAC. Bucket Policy MUST restrict access to CloudFront. <br>**Block Public Access Enabled.**                                           |

## 4. Access Control Strategy (IAM & Service Integration)

Terraform code MUST create and manage the necessary IAM Roles and Policies based on the principle of least privilege, particularly for automated services.

- **Developer Access:**
  - Use IAM Identity Center (SSO)
  - Grant broad access (Read/Write) to `dev` environment buckets.
  - Grant primarily Read-Only access to `staging` and `prod` buckets, with write access restricted to essential infrastructure management tasks (not direct data manipulation).
- **Service Roles & Integration (Least Privilege):**
  - **EKS Pods (IRSA):** Dedicated IAM Roles for Service Accounts (IRSA) for data processing, tiling pipelines, etc., scoped to necessary buckets/prefixes (e.g., `piksel-ina-dev-data/processed/`).
  - **OWS Server:** IAM Role allowing read access to relevant `data` buckets/prefixes (`tiles/`, `processed/`, `data/`) in appropriate environments.
  - **JupyterHub:** IAM Role/IRSA allowing access to `notebooks` buckets.
  - **CI/CD Pipeline:** IAM Role with permissions to:
    - Read/Write to Dev buckets.
    - Assume roles or have direct permissions to write to Staging/Prod buckets _during promotion steps only_.
    - Manage CloudFront invalidations for `web` bucket deployments.
  - **CloudFront (OAI/OAC):** Origin Access Identity (OAI) or Origin Access Control (OAC - recommended) configured for `staging-web` and `prod-web` buckets. Bucket policies MUST grant read access only to the specific OAI/OAC principal.
- **Bucket Policies:** Use bucket policies primarily for:
  - Enforcing TLS (`aws:SecureTransport`).
  - Granting access to CloudFront OAI/OAC.
  - Denying unintended access patterns (e.g., denying access if not via VPC Endpoint).
  - Potentially enforcing object ownership (Bucket owner enforced).

## 5. Data Promotion Workflow (GitOps Integration)

The promotion of data, notebooks, and web assets between environments MUST be automated via CI/CD pipelines, triggered by GitOps practices as defined in the project's [repository strategy](../operations/01-repository-strategy-and-cicd.md) (e.g., merging changes on specific branches like `main` or tagging releases).

- **Mechanism:** Git merge events (e.g., `feature/*` -> `main` in relevant repositories) or tag creation triggers the appropriate CI/CD pipeline defined in GitHub Actions or other designated workflow orchestrators.
- **Dev -> Staging:**
  1.  **Trigger:** Merge to a designated branch (e.g., `main` in `piksel-core` or a data pipeline repo) or a specific event indicating readiness for staging validation.
  2.  **CI/CD Pipeline (GitHub Actions):**
      - Runs validation tests/scripts defined in the relevant repository.
      - On success: Executes commands (e.g., `aws s3 sync` or custom scripts) to copy validated artifacts (datasets, notebooks, web assets) from `dev` buckets to corresponding `staging` buckets using the pipeline's IAM role (defined via Terraform in `piksel-infra`).
      - Generates/updates manifests or metadata in the `staging` bucket if required.
      - (Optional) Tags source data/commits in Git.
- **Staging -> Production:**
  1.  **Trigger:** Merge to the `main` branch followed by a tag creation (e.g., `v1.x.x`) signifying production readiness.
  2.  **CI/CD Pipeline (GitHub Actions):**
      - Performs final checks (e.g., smoke tests against staging).
      - On success: Executes commands to copy validated artifacts from `staging` buckets to corresponding `prod` buckets using the pipeline's IAM role.
      - Applies production version tags/metadata.
      - Updates documentation/release notes (automated step).
      - Invalidates CloudFront cache for `prod-web` bucket updates using the pipeline's role.

## 6. Security & Monitoring Implementation

- **Encryption:**
  - Implement SSE-KMS using Terraform `aws_s3_bucket_server_side_encryption_configuration` resource.
- **VPC Endpoints:**
  - Define `aws_vpc_endpoint` resources for S3 (Gateway type) in relevant VPCs.
  - Use bucket policies and IAM condition keys (`aws:sourceVpce`) to enforce access via endpoints.
- **MFA Delete:**
  - Enable via Terraform `aws_s3_bucket_versioning` resource (`mfa_delete = "Enabled"`) for the production data bucket.
  - Requires manual setup initially.
- **Logging:**
  - Configure `aws_s3_bucket_logging` resource for all buckets, targeting a central logging bucket.
- **Monitoring (CloudWatch):**
  - Set up basic CloudWatch Alarms via Terraform for:
    - High 4xx/5xx error rates on critical buckets (e.g., `prod-web`, `prod-data`).
    - Significant bucket size increases (potential cost issue or runaway process).
  - Ensure S3 data events are logged to CloudTrail for security auditing.
- **Cost Allocation:** Ensure standard tags are consistently applied by Terraform for cost tracking.

## 7. Storage Optimization Implementation

- **Intelligent-Tiering**: Automatically moves S3 data between access tiers to optimize costs based on usage.
- **Lifecycle Rules**: Automates actions (like moving or deleting) on S3 objects based on defined rules or age.
- **CloudFront**: Caches content (often from S3) at edge locations globally for faster delivery to users.
- **S3 Transfer Acceleration**: Speeds up uploads to S3 buckets over long distances using edge locations.

## 8. Terraform & GitOps Implementation Notes

- **Modular Structure:**
  - Use Terraform modules (public registry modules) within the `piksel-infra`.
  - Repository structure (`dev/`, `staging/`, `prod/`) to enforce consistency and reduce code duplication.
  - Pass environment/purpose-specific configurations as variables.
- **Variable Management:**
  - Use `.tfvars` files per environment (`dev/dev.auto.tfvars`, `staging/staging.auto.tfvars`, etc.) within the `piksel-infra` repository.
  - Manage sensitive values via Terraform Cloud variables or CI/CD secrets.
- **Policy Management:**
  - Store IAM policy documents (JSON) alongside Terraform code in `piksel-infra` and reference them using `aws_iam_policy_document` data source or `file()` function.
- **State Management:** Use **Terraform Cloud** with separate workspaces configured per environment (`dev`, `staging`, `prod`) for shared, remote state management and locking, as defined in the `piksel-infra` repository strategy.
- **CI/CD Pipeline (Infrastructure via `piksel-infra`):**
  - **Pull Request Validation (GitHub Actions):** On Pull Requests targeting the `main` branch in `piksel-infra`, GitHub Actions automatically run checks:
    - `terraform fmt -check` (Formatting)
    - `terraform validate` (Syntax Validation, run per environment directory)
    - `tfsec` (Security Scanning)
  - **Apply Workflow (Terraform Cloud):** Merges to the `main` branch trigger runs in the configured Terraform Cloud workspaces:
    - Terraform Cloud performs `terraform plan`.
    - Terraform Cloud performs `terraform apply` to deploy changes to the corresponding AWS environment (`dev`, `staging`, `prod`).
    - **Environment Protection:** Manual approvals within Terraform Cloud MUST be configured and required for applying changes to `staging` and `prod` workspaces.
