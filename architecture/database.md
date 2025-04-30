# RDS Infrastructure Blueprint for Piksel Project

|                    |                           |
| :----------------- | :------------------------ |
| **Version**        | 1.1                       |
| **Date**           | 2025-04-29                |
| **Owner**          | Cloud Infrastructure Team |
| **Implementation** | Terraform, GitOps         |

## 1. Introduction

This document provides the technical specifications for the AWS Relational Database Service (RDS) infrastructure supporting the Piksel project. It outlines the design for database instances required for critical functions like Open Data Cube (ODC) indexing and user management. This blueprint serves as the guide for infrastructure-as-code (IaC) implementation prioritizing security, availability, cost-efficiency, and operational simplicity.

## 2. Core Infrastructure Principles & Standards

These principles apply globally unless explicitly overridden in environment-specific sections.

- **Infrastructure as Code (IaC):** All RDS resources (instances, subnet groups, parameter groups, security groups, secrets) **MUST** be defined and managed using Terraform code stored in the `piksel-infra` Git repository.
- **GitOps:** Changes to the RDS infrastructure **MUST** follow the GitOps workflow (e.g., Pull Request -> Review -> Merge -> Automated Apply via CI/CD).
- **Naming Convention:** `piksel-<environment>-<purpose>-rds`
  - `<purpose>`: `odc-index`, `user-management`
  - `<environment>`: `dev`, `staging`, `prod`
- **Standard Tagging:** All RDS instances and associated resources (like subnet groups) MUST include the following tags:
  - `Project: piksel`
  - `Environment: dev | staging | prod`
  - `Purpose: odc-index | user-management`
  - `ManagedBy: Terraform`
  - `Owner: DevOps-Team`
- **Default Security Posture:**
  - **Encryption at Rest:** Server-Side Encryption **MUST** be enabled using the default AWS-managed KMS key (`aws/rds`).
  - **Encryption in Transit:** Connections **MUST** be enforced using SSL/TLS via RDS parameter group settings.
  - **Network Access:** Instances **MUST** be deployed in private database subnets. Public accessibility **MUST** be disabled. Access is controlled via VPC Security Groups.
  - **Authentication:** IAM Database Authentication **MUST** be enabled and preferred for application access. Master user credentials **MUST** be generated and stored securely in AWS Secrets Manager.
  - **Backups:** Automated backups **MUST** be enabled with Point-in-Time Recovery (PITR).

## 3. Environment Definitions

This section details the specific configuration for each RDS instance within each environment. Terraform modules should be used to ensure consistency, with environment-specific variables overriding defaults.

### 3.1. Development Environment (`dev`)

- **Purpose:** Sandboxed environment for development, experimentation, and integration testing.
- **Networking:** Deployed within the `dev` VPC's private database subnets. Access controlled by `piksel-dev-rds-sg`.

| Instance Identifier        | Purpose & Key Usage                           | Engine / Version     | Extensions | Instance Class (Initial) | Storage (Type / Size / Autoscaling) | Multi-AZ | Backup Retention | Key Access Patterns & Security                                                                                                                                             |
| :------------------------- | :-------------------------------------------- | :------------------- | :--------- | :----------------------- | :---------------------------------- | :------- | :--------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `piksel-dev-odc-index-rds` | ODC Metadata Index                            | PostgreSQL `17.2-R2` | PostGIS    | `db.t3.large`            | `gp3` / 20 GB / Enabled             | Yes      | 7 Days           | **Access:** EKS Pods (ODC API, Indexer via IRSA/IAM Auth), Developers (via IAM Auth/Bastion). Ingress allowed only from `piksel-dev-eks-nodes-sg` via `piksel-dev-rds-sg`. |
| `piksel-dev-usermgmt-rds`  | User Management (e.g., JupyterHub user state) | PostgreSQL `17.2-R2` | None       | `db.t3.large`            | `gp3` / 20 GB / Enabled             | Yes      | 7 Days           | **Access:** EKS Pods (JupyterHub via IRSA/IAM Auth), Developers (via IAM Auth/Bastion). Ingress allowed only from `piksel-dev-eks-nodes-sg` via `piksel-dev-rds-sg`.       |

_(Note: Staging and Production environment details will be added here as those environments are defined and requirements finalized. They will generally mirror `dev` but with potentially adjusted instance sizes, longer backup retention, and stricter change control.)_

## 4. Access Control Strategy (IAM & Service Integration)

Terraform code MUST create and manage the necessary IAM Roles, Policies, and Security Groups based on the principle of least privilege.

- **Developer Access:**
  - Use IAM Identity Center (SSO) for console/CLI access.
  - Grant permissions to connect using IAM Database Authentication to `dev` environment databases.
  - Access to higher environments (`staging`, `prod`) should be restricted (e.g., read-only or via specific operational roles).
- **Service Roles & Integration (Least Privilege):**
  - **EKS Pods (IRSA):** Dedicated IAM Roles for Service Accounts (IRSA) configured for applications (ODC API, JupyterHub, Indexers) needing database access. Policies should grant `rds-db:connect` permission scoped to the specific RDS instance resource ARN and DB user.
  - **OWS Server:** IAM Role/IRSA granting `rds-db:connect` to the `piksel-<env>-odc-index-rds` database.
  - **CI/CD Pipeline:** IAM Role with permissions to manage RDS resources via Terraform, potentially assume roles for schema migrations if needed, but generally _not_ direct database connection permissions.
- **Authentication Methods:**
  - **IAM Database Authentication:** Primary method for applications and developers. Requires appropriate IAM policies and SSL connections.
  - **Master User:** Credentials generated by RDS, stored in AWS Secrets Manager, and referenced by Terraform. Access using these credentials should be limited to essential administrative tasks or initial setup.
- **Security Groups:**
  - `piksel-<env>-rds-sg`: Attached to RDS instances. Allows ingress only on the PostgreSQL port (5432) from the EKS node security group (`piksel-<env>-eks-nodes-sg`). Egress allows all outbound (standard practice, can be tightened if necessary).

## 5. Promotion Workflow (Infrastructure & Schema)

- **Infrastructure:** Promotion of RDS infrastructure changes (e.g., instance size, parameter group updates) between environments (`dev` -> `staging` -> `prod`) **MUST** be managed via the standard GitOps workflow for the `piksel-infra` repository (PR -> Review -> Merge -> Terraform Apply via CI/CD with appropriate approvals for staging/prod).
- **Schema & Data:** Database schema migrations and any necessary data seeding/migration are outside the scope of _infrastructure_ provisioning but should follow a defined, automated process (e.g., using tools like Flyway or Alembic triggered by application deployment pipelines), leveraging the established IAM authentication.

## 6. Security & Monitoring Implementation

- **Encryption at Rest:**
  - Implemented via Terraform `aws_db_instance` resource attributes (`storage_encrypted = true`, `kms_key_id = null` to use the default `aws/rds` key).
- **Encryption in Transit:**
  - Enforced by creating a custom `aws_db_parameter_group` based on the **default `postgres17` family**.
  - Set the parameter `rds.force_ssl = 1` within the custom parameter group.
  - Associate this parameter group with the `aws_db_instance` resources.
- **Networking:**
  - Define `aws_db_subnet_group` using the private `database_subnets` outputs from the VPC module.
  - Associate RDS instances with this subnet group and the `piksel-<env>-rds-sg` security group.
  - Ensure `publicly_accessible = false` on `aws_db_instance`.
- **Authentication:**
  - Enable IAM authentication via `iam_database_authentication_enabled = true` on `aws_db_instance`.
  - Create master user credentials using `aws_secretsmanager_secret` and `aws_secretsmanager_secret_version` and pass the secret ARN to the `aws_db_instance` (`master_user_secret_kms_key_id`, `manage_master_user_password`). Alternatively, allow RDS to manage it within Secrets Manager directly if using the RDS module.
- **Logging:**
  - Enable Enhanced Monitoring (`monitoring_interval > 0` on `aws_db_instance`) for OS-level metrics.
  - Configure export of relevant logs (e.g., `postgresql`, `upgrade`) to CloudWatch Logs via `enabled_cloudwatch_logs_exports` on `aws_db_instance`.
- **Monitoring (CloudWatch):**
  - Set up basic CloudWatch Alarms via Terraform for:
    - High `CPUUtilization`.
    - Low `FreeStorageSpace`.
    - High `DatabaseConnections`.
  - Ensure AWS CloudTrail is enabled in the region to log RDS API calls for auditing.

## 7. Optimization Implementation

- **Instance Sizing:** Start with the specified `db.t3.large` instances. Monitor performance metrics (CPU, Memory, IOPS, Connections) and adjust instance sizes as needed using the GitOps workflow. Consider Graviton (`t4g`/`r7g`) alternatives later if cost optimization becomes a priority and performance allows.
- **Storage:** Utilize `gp3` storage for baseline performance and the ability to scale IOPS/throughput independently if required. Enable Storage Autoscaling to handle growth gracefully up to a defined maximum.
- **Read Replicas:** Not included in the initial design but can be added later via Terraform for the `odc-index` database if read workloads significantly increase and impact primary instance performance.
- **Parameter Tuning:** Regularly review and potentially tune PostgreSQL parameters in the custom `postgres17` parameter group based on observed workload patterns (requires database expertise).

## 8. Terraform & GitOps Implementation Notes

- **Modular Structure:**
  - Utilize a robust Terraform module for RDS (e.g., `terraform-aws-modules/rds/aws` or a custom internal module) within the `piksel-infra` repository.
  - Organize Terraform code using environment-specific directories (`dev/`, `staging/`, `prod/`).
  - Pass environment-specific configurations (instance size, identifiers, backup retention) as variables.
- **Variable Management:**
  - Use `.tfvars` files per environment (`dev/dev.auto.tfvars`, etc.).
  - Manage sensitive values (like potential master password inputs if not fully managed by Secrets Manager) via Terraform Cloud variables or CI/CD secrets.
- **Resource Management:**
  - Define `aws_db_subnet_group`, `aws_db_parameter_group` (using `family = "postgres17"`), and potentially `aws_kms_key` (if switching to Customer Managed Key later) resources.
  - Reference security groups and subnets created in other parts of the configuration (e.g., the shared network module).
  - Integrate with `aws_secretsmanager_secret` for master credentials.
  - Set `engine = "postgres"` and `engine_version = "17.2-R2"` on the `aws_db_instance` or module configuration.
- **State Management:** Use Terraform Cloud with separate workspaces per environment (`piksel-rds-dev`, `piksel-rds-staging`, `piksel-rds-prod`) for shared remote state and locking.
- **CI/CD Pipeline (Infrastructure via `piksel-infra`):**
  - **Pull Request Validation (GitHub Actions):** As defined in the S3 blueprint (fmt, validate, tfsec).
  - **Apply Workflow (Terraform Cloud):** Merges to `main` trigger runs in Terraform Cloud workspaces. Manual approvals **MUST** be configured for `staging` and `prod` workspace applies.

## 9. Design vs. Implementation (ODC Index Database - `dev` Environment)

[🔗 Configuration file](https://github.com/piksel-ina/piksel-infra/blob/main/dev/main.tf)

This section compares the core design principles and specific configurations outlined in this blueprint against the actual Terraform implementation provided for the `dev` environment's ODC Index database (`module "odc_rds"`).

| Design Principle / Feature        | Blueprint Requirement                                                             | Terraform Implementation (`module "odc_rds"`)                                                                                                                      | Status     | Notes                                                                                                              |
| :-------------------------------- | :-------------------------------------------------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------- | :--------- | :----------------------------------------------------------------------------------------------------------------- |
| **IaC / GitOps**                  | Managed via Terraform in Git repository, GitOps workflow.                         | Implemented using `terraform-aws-modules/rds/aws` module within the Terraform configuration. Assumes GitOps process is followed externally.                        | ✅ Aligned | Module usage promotes IaC best practices.                                                                          |
| **Naming Convention**             | `piksel-<environment>-<purpose>-rds` (e.g., `piksel-dev-odc-index-rds`)           | `identifier = "${local.name}-odc-index-rds"` where `local.name` typically resolves to `piksel-<environment>`.                                                      | ✅ Aligned | Assumes `local.name` is correctly defined elsewhere (e.g., `piksel-dev`).                                          |
| **Standard Tagging**              | `Project`, `Environment`, `Purpose`, `ManagedBy`, `Owner`                         | `tags = merge(local.tags, { Purpose = "odc-index" })`. Assumes `local.tags` contains the standard tags (`Project`, `Environment`, `ManagedBy`, `Owner`).           | ✅ Aligned | Relies on `local.tags` being correctly populated.                                                                  |
| **Encryption at Rest**            | Enabled using default `aws/rds` KMS key.                                          | `storage_encrypted = true`, `kms_key_id = null` (uses default AWS managed key).                                                                                    | ✅ Aligned |                                                                                                                    |
| **Encryption in Transit**         | Enforce SSL/TLS via parameter group.                                              | Custom parameter group created/used (`parameter_group_name`) with `rds.force_ssl = 1`.                                                                             | ✅ Aligned | Requires the parameter group resource definition elsewhere or relies on module defaults if not explicitly defined. |
| **Network Access**                | Private subnets, Public access disabled, VPC Security Group control.              | `db_subnet_group_name = module.vpc.database_subnet_group_name`, `publicly_accessible = false`, `vpc_security_group_ids = [module.rds_sg.security_group_id]`.       | ✅ Aligned | Deploys into private subnets defined by the VPC module and uses the specified RDS security group.                  |
| **Authentication (IAM)**          | IAM Database Authentication enabled.                                              | `iam_database_authentication_enabled = true`.                                                                                                                      | ✅ Aligned |                                                                                                                    |
| **Authentication (Master User)**  | Credentials generated and stored in AWS Secrets Manager.                          | `manage_master_user_password = true`, `master_user_secret_kms_key_id = null` (uses Secrets Manager with default KMS key).                                          | ✅ Aligned | Module handles secret creation and management.                                                                     |
| **Automated Backups / PITR**      | Enabled.                                                                          | `backup_retention_period = var.odc_db_backup_retention_period` (set > 0 enables backups/PITR).                                                                     | ✅ Aligned | Specific retention period controlled by variable.                                                                  |
| **Engine / Version**              | PostgreSQL (Specific version TBD in blueprint, requires PostGIS).                 | `engine = "postgres"`, `engine_version = var.odc_db_engine_version`, `family = "postgres17"`, `major_engine_version = "17"`.                                       | ✅ Aligned | Implements PostgreSQL 17. Version controlled by variable.                                                          |
| **Extensions (PostGIS)**          | Required for ODC.                                                                 | Custom option group created/used (`option_group_name`) with `options = [{ option_name = "POSTGIS" }]`.                                                             | ✅ Aligned | Requires the option group resource definition elsewhere or relies on module defaults if not explicitly defined.    |
| **Instance Class**                | Defined per environment (Variable).                                               | `instance_class = var.odc_db_instance_class`.                                                                                                                      | ✅ Aligned | Specific class controlled by variable.                                                                             |
| **Storage (Type/Size/Autoscale)** | `gp3`, Size/Autoscaling defined per environment (Variable).                       | `storage_type = "gp3"`, `allocated_storage = var.odc_db_allocated_storage`, `max_allocated_storage = var.odc_db_max_allocated_storage`.                            | ✅ Aligned | Type is fixed to `gp3`, size and autoscaling controlled by variables.                                              |
| **Multi-AZ**                      | Defined per environment (Variable).                                               | `multi_az = var.odc_db_multi_az`.                                                                                                                                  | ✅ Aligned | Specific setting controlled by variable.                                                                           |
| **Monitoring / Logging**          | Enhanced Monitoring, Performance Insights, CloudWatch Logs (postgresql, upgrade). | `create_monitoring_role = true`, `monitoring_interval = 60`, `performance_insights_enabled = true`, `enabled_cloudwatch_logs_exports = ["postgresql", "upgrade"]`. | ✅ Aligned | Implements all specified monitoring and logging features.                                                          |
| **Deletion Protection**           | Recommended, especially for staging/prod.                                         | `deletion_protection = var.odc_db_deletion_protection`.                                                                                                            | ✅ Aligned | Controlled by variable, allowing per-environment configuration.                                                    |
| **Skip Final Snapshot**           | Recommended `false` for staging/prod.                                             | `skip_final_snapshot = var.odc_db_skip_final_snapshot`.                                                                                                            | ✅ Aligned | Controlled by variable, allowing per-environment configuration.                                                    |

**Summary:** The provided Terraform code for the `dev` environment's ODC Index RDS instance (`module "odc_rds"`) shows strong alignment with the design principles and requirements laid out in the RDS Infrastructure Blueprint. Key configurations related to security, networking, naming, tagging, and core features are implemented as designed, often utilizing variables for environment-specific flexibility.

## 10. Recommendations for Staging & Production Environments

While the core Terraform module structure remains the same, the following variable adjustments and configurations are strongly recommended when deploying the ODC Index RDS instance (and similar RDS instances) to `staging` and `production` environments to enhance availability, durability, and operational safety:

1.  **High Availability (Multi-AZ):**

    - **Recommendation:** Set `var.odc_db_multi_az` to `true`.
    - **Rationale:** Provides synchronous replication to a standby instance in a different Availability Zone, crucial for failover during instance or AZ failures. Staging should mirror production's Multi-AZ configuration for realistic testing.

2.  **Data Durability & Recovery:**

    - **Recommendation:**
      - Increase `var.odc_db_backup_retention_period` significantly (e.g., `14` to `35` days, based on compliance and recovery needs).
      - Set `var.odc_db_skip_final_snapshot` to `false`.
      - Set `var.odc_db_deletion_protection` to `true`.
    - **Rationale:** Ensures longer Point-in-Time Recovery capability, prevents data loss upon accidental deletion by requiring a final snapshot, and adds a safeguard against accidental termination via the console or API.

3.  **Performance & Sizing:**

    - **Recommendation:** Adjust `var.odc_db_instance_class`, `var.odc_db_allocated_storage`, and potentially `var.odc_db_max_allocated_storage` based on performance testing in staging and expected production load.
    - **Rationale:** Production workloads typically require more resources than development. Staging should use instance classes and storage sizes representative of production to validate performance adequately. `gp3` storage allows independent scaling of IOPS/throughput if needed, which might be configured via the module if bottlenecks arise.

4.  **Maintenance Windows & Apply Method:**

    - **Recommendation:** Review the `apply_immediately = true` setting. For production, consider setting this to `false` within the module definition (if possible, or manage changes carefully outside of automated applies) and rely on defined RDS maintenance windows for parameter group changes requiring reboots (`apply_method = "pending-reboot"`).
    - **Rationale:** Avoids potentially disruptive changes being applied immediately during peak hours. Leverages scheduled maintenance windows for less impactful updates.

5.  **Cost:**
    - **Recommendation:** Be aware that implementing Multi-AZ, larger instance classes, and longer backup retention will increase costs compared to the development environment. Budget accordingly.
    - **Rationale:** These features provide essential resilience and performance for critical environments but come at a higher price point.
