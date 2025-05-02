# Piksel - AWS IAM Strategy

|             |                           |
| ----------- | ------------------------- |
| **Version** | 1.0                       |
| **Date**    | 2025-04-30                |
| **Owner**   | Cloud Infrastructure Team |

## 1. Introduction

|              |                                                                                                                                                                                                                                                                                                                            |
| :----------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Purpose**  | Define the strategy, principles, and patterns for managing Identity and Access Management (IAM) within the Piksel AWS environment. This includes human user access, application/service permissions, and governance practices.                                                                                             |
| **Scope**    | This document applies to all AWS accounts within the Piksel AWS Organization, governing the creation, management, and use of IAM principals (users, groups, roles) and policies. It complements the [AWS Organization Foundational Security Guidelines](./01-piksel-AWS-Organization-Foundational-Security-Guidelines.md). |
| **Audience** | AWS Administrators, Security Teams, Developers, DevOps Engineers, Application Owners.                                                                                                                                                                                                                                      |

## 2. Guiding Principles

- **Least Privilege:** Grant only the minimum permissions required for a user or service to perform its intended function. Avoid overly broad permissions (e.g., `*` resources or actions where possible).
- **Prefer Roles over Long-Lived Credentials:** Utilize IAM roles for temporary credentials whenever possible (e.g., for EC2, Lambda, EKS Service Accounts, CI/CD, cross-account access, human SSO access). Avoid the use of long-lived IAM user access keys.
- **Separation of Duties:** Configure permissions to ensure that critical functions require multiple roles or approvals where appropriate.
- **Centralized Human Access:** Manage human user access centrally via AWS IAM Identity Center (SSO).
- **Automation & Infrastructure as Code (IaC):** Manage IAM resources (roles, policies) primarily through IaC (Terraform) to ensure consistency, repeatability, and auditability.
- **Regular Review:** Periodically review IAM policies, roles, group memberships, and permission set assignments to ensure they remain appropriate and adhere to the least privilege principle.

## 3. Identity Providers and Access Methods

### 3.1. Human User Access

- **Method:** AWS IAM Identity Center (SSO) is the **sole** method for human users to gain access to the AWS Management Console and temporary CLI/SDK credentials. Direct IAM user creation for humans is prohibited, except for specific documented exceptions (e.g., Emergency Access, specific service accounts).
- **Identity Source:** AWS IAM Identity Center built-in identity store.
- **Access Assignment:**
  - Users will be organized into **Groups** within IAM Identity Center.
  - Permissions will be granted by assigning **Permission Sets** to these Groups within specific AWS accounts or OUs.
  - Direct user assignment to Permission Sets should be avoided unless absolutely necessary and documented.
- **Standard Permission Sets (Initial Proposal):**
  - `PikselAdmin`: Full administrative access (use sparingly).
  - `PikselPowerUser`: Broad permissions for development/management tasks, but restricted from modifying core security/IAM resources.
  - `PikselDeveloper`: Permissions focused on deploying and managing specific application resources.
  - `PikselReadOnly`: View-only access for auditing or support.
  - _(These need formal definition and implementation)_
- **MFA:** Multi-Factor Authentication (MFA) is enforced for all users logging in via IAM Identity Center.
- **Management Account Access (Billing/Finance):**
  - Access to Billing, Cost Management, and Payment Method modification **MUST** be granted via IAM Identity Center using dedicated Permission Sets (e.g., `PikselBillingAdminAccess`) assigned to specific Finance Groups (e.g., `PikselFinanceAdmins`) within the Management Account.
  - The `aws-portal:ModifyPaymentMethods` permission should be included in this Permission Set.
  - Using the Root user for these tasks is **prohibited**.

### 3.2. Application / Service Access

- **EKS Workloads (IRSA):**
  - Applications running within EKS requiring AWS API access **MUST** use IAM Roles for Service Accounts (IRSA).
  - Each Kubernetes Service Account requiring AWS permissions should be mapped to a dedicated IAM Role with the minimum necessary permissions.
  - OIDC provider configuration for EKS is managed centrally.
- **CI/CD Pipelines (OIDC):**
  - CI/CD systems (e.g., GitHub Actions) **MUST** authenticate using OIDC to assume dedicated IAM Roles. Storing long-lived AWS access keys in the CI/CD platform is **prohibited**.
  - **Role Strategy:**
    - Start with reasonably scoped roles per pipeline/environment in development.
    - **Action:** Utilize AWS IAM Access Analyzer and CloudTrail analysis during initial development phases (e.g., first 2-4 weeks) to identify the precise permissions used.
    - Refine roles based on analysis to enforce least privilege _before_ deploying to staging/production.
    - Consider separate roles for different deployment stages or critical actions if needed.
  - Refer to [Piksel OIDC Implementation](../security/02-piksel-OIDC-implementation.md) for OIDC provider details.
- **EC2 Instances:**
  - Applications running on EC2 instances requiring AWS API access **MUST** use IAM Instance Profiles associated with specific IAM Roles. Embedding access keys on instances is **prohibited**.
- **Lambda Functions:**
  - Lambda functions **MUST** use IAM Execution Roles with the minimum necessary permissions.
- **Other AWS Services:** Services requiring access to other AWS resources should use service-specific IAM roles where applicable (e.g., RDS Enhanced Monitoring Role).

### 3.3. Federated Access (External Systems)

- External identity providers or systems needing programmatic access should preferably use OIDC or SAML federation to assume IAM Roles, rather than relying on IAM user access keys.

## 4. Authorization Strategy

### 4.1. IAM Roles

- IAM Roles are the primary mechanism for granting permissions. Direct policy attachment to IAM users is forbidden (except for break-glass scenarios).
- Roles should have clearly defined trust policies specifying _who_ or _what_ (principal) can assume the role (e.g., `sts:AssumeRoleWithWebIdentity` for OIDC, `sts:AssumeRole` for EC2/Lambda/SSO, specific AWS service principals).

### 4.2. IAM Policies

- **AWS Managed Policies:** Use AWS managed policies where they meet the specific need and adhere to least privilege (e.g., `ReadOnlyAccess`, specific service-role policies like `AmazonEKS_CNI_Policy`). Be aware that they can sometimes be overly permissive or change over time.
- **Customer Managed Policies:** Create customer-managed policies for tailored permissions specific to Piksel applications and roles. These are the preferred method when AWS managed policies are too broad or don't fit the exact use case. They allow for granular control and versioning.
- **Inline Policies:** **Strongly discouraged.** Avoid using inline policies attached directly to roles or users. They are harder to manage, reuse, track, and version compared to customer-managed policies. Use only if there's a strict 1:1 mapping between the policy and a single role that cannot be reused, and document the exception.
- **Policy Structure:** Policies should be well-formatted JSON, including a `Version` (`2012-10-17`) and clear `Statement` arrays with `Effect` (`Allow`/`Deny`), `Action`, `Resource`, and optional `Condition` elements.

### 4.3. Permissions Boundaries

- Permissions boundaries may be used to delegate permission management safely. For example, a boundary could be applied to a `PikselDeveloperRole` allowing developers to create new roles for their applications, but _only_ if those new roles have permissions _within_ the defined boundary.

### 4.4. Service Control Policies (SCPs)

- SCPs are managed at the AWS Organization level as defined in the [AWS Organization Foundational Security Guidelines](../security/01-piksel-AWS-Organization-Foundational-Security-Guidelines.md).
- They act as high-level guardrails (e.g., restricting regions, preventing disabling of security services) and **do not grant permissions**. IAM policies are still required to grant access within accounts.

## 5. Governance and Management

### 5.1. Naming Conventions

- **IAM Roles:** `piksel-<environment>-<purpose>-role`
  - `<environment>`: `mgmt`, `security`, `log`, `dev`, `staging`, `prod`, `shared` (for cross-env roles)
  - `<purpose>`: Clear description (e.g., `eks-cluster`, `eks-nodegroup`, `cicd-deploy-webapp`, `lambda-user-processor`, `sso-admin`, `sso-developer`, `app-userservice-sa`)
  - _Example:_ `piksel-dev-app-userservice-sa-role`
  - _Example:_ `piksel-shared-cicd-deploy-staging-role`
  - _Example:_ `piksel-mgmt-sso-admin-role`
- **IAM Policies (Customer Managed):** `Piksel<Purpose>Policy`
  - `<Purpose>`: CamelCase description matching the policy's function (e.g., `S3AppBucketReadWrite`, `DynamoDBUserTableAccess`, `EKSPodNetworking`)
  - _Example:_ `PikselS3AppBucketReadWritePolicy`
  - _Example:_ `PikselCicdStagingDeployPolicy`

### 5.2. Tagging

- All customer-managed IAM Roles and Policies created via IaC **MUST** include the following tags (aligning with general resource tagging):
  - Project: `piksel`
  - Environment: `dev` | `staging` | `prod` | `mgmt` | `security` | `log` | `shared`
  - Purpose: <e.g. `HumanAccess` | `ServiceRole` | `CICD` | `EKS-SA` | `EC2Instance` | `LambdaExecution`>
  - ManagedBy: Terraform
  - Owner: DevOps-Team | Security-Team

### 5.3. IaC Bootstrapping Considerations

- **Manual Configuration Exception:** While the principle is to manage infrastructure via IaC (Terraform), certain initial configurations required to enable IaC itself must be performed manually. This includes:
  - The initial creation of the **IAM OIDC Identity Provider** configuration in AWS for Terraform Cloud (or other CI/CD systems using OIDC).
  - The initial creation of the **IAM Role** that TFC/CI/CD will assume via OIDC to manage resources within AWS accounts.
- **Emergency Access:** The Emergency Access IAM Users and Roles defined in section 5.6 (previously 5.5) are also created and managed manually due to their sensitive, break-glass nature.
- **IaC Management Scope:** Once these bootstrap components are in place, all other IAM resources (roles, policies) and general AWS infrastructure **MUST** be managed via Terraform/TFC according to the defined standards.

### 5.4. Auditing and Monitoring

- **AWS CloudTrail:** Enabled in all accounts, logging to a central Log Archive account as defined in the Org guidelines. CloudTrail provides the audit history of all IAM actions.
- **AWS IAM Access Analyzer:** Regularly reviewed (both account and organization level) to identify unused access, external access, and public access, and generate least-privilege policies.
- **AWS Config:** Rules may be implemented to check for compliance with IAM best practices (e.g., MFA on root, no access keys for IAM users, use of instance profiles).
- **Alerting:** Configure alerts (e.g., via EventBridge and SNS/ChatOps) for critical IAM events like Root user login, console login failures, creation/deletion of critical roles, use of Emergency Access roles.

### 5.5. Credential Management

- **Root User:**

  - Access keys for the Root user **MUST NOT** be created.
  - MFA **MUST** be enabled on the Root user for all accounts.
  - Root user login should only be used for a very limited set of tasks that explicitly require it, such as:
    - Changing the account's root email address, account name, or root password.
    - Changing the AWS Support plan.
    - Closing the AWS account.
    - Specific Organization actions (e.g., removing a member account under certain conditions).
    - Viewing certain tax invoices (region-specific).
    - Absolute emergency recovery if all IAM admin access is lost (as a last resort beyond the Emergency Access procedure).
  - Regular operational tasks, including billing and payment management, **MUST NOT** be performed using the Root user. High-priority alerts **MUST** be configured for any Root user login.

- **IAM User Access Keys:** Creation and use of long-lived access keys for IAM users is **prohibited**, except for the documented Emergency Access procedure. Keys should not be embedded in code or configuration files.
- **Temporary Credentials:** Use AWS STS (via AssumeRole, OIDC, SAML, Instance Profiles, Lambda Execution Roles, SSO) to obtain temporary credentials wherever possible.
- **Key Rotation:** If any long-lived keys _must_ exist (e.g., legacy systems, specific service accounts before migration to roles - aim for zero), a strict rotation policy (e.g., every 90 days) **MUST** be enforced and documented.

### 5.6. Emergency Access ("Break-Glass" Procedure)

- **Purpose:** To provide temporary, highly privileged access in emergency situations where standard access methods fail or are insufficient (e.g., SSO outage, critical misconfiguration lockout).
- **Mechanism:**
  1.  **Dedicated IAM User(s):** Create one or two highly secured IAM users (e.g., `piksel-emergency-admin-01`) in the **Management Account** (or a dedicated Security account if using delegated administration for IAM Identity Center).
  2.  **Security:** These users MUST have:
      - An extremely complex password, stored securely
      - A hardware MFA device assigned.
      - **NO** access keys created.
  3.  **Permissions:** The IAM user itself should have minimal permissions, ideally only `sts:AssumeRole`.
  4.  **Emergency Role:** A pre-defined IAM Role exists in each member account (e.g., `PikselEmergencyAccessRole`) with broad permissions (e.g., `AdministratorAccess`). The trust policy of this role allows assumption _only_ by the dedicated Emergency IAM User principal(s) ARN from the Management/Security account.
- **Procedure:**
  1.  Access requires explicit approval from [Define Approver(s), e.g., Head of Infrastructure, CISO].
  2.  Log in to the AWS Console as the Emergency IAM User (using password + MFA).
  3.  Assume the `PikselEmergencyAccessRole` in the target account.
  4.  Perform necessary emergency actions. **All actions are logged via CloudTrail.**
  5.  Immediately after resolution, log out.
  6.  Conduct a post-incident review of actions taken.
  7.  Consider rotating the Emergency User password and potentially the MFA device after use.
- **Alerting:** Configure high-priority alerts for any console login attempt or API call made by the Emergency IAM User(s) or assumption of the `PikselEmergencyAccessRole`.

### 5.5. IAM Access Monitoring (IAM Access Analyzer)

- **Enablement:** AWS IAM Access Analyzer **MUST** be enabled in **all relevant AWS regions** within **each account** (`Piksel Development`, `Piksel Staging`, `Piksel Production`, `Piksel Shared`, Management, Security, etc.) to continuously monitor for unintended external or cross-account resource access based on resource policies.
- **Management:** Configuration of Access Analyzer **SHOULD** be managed via **Terraform** (`aws_accessanalyzer_analyzer`) for consistency and adherence to IaC principles. This ensures it is treated as part of the account baseline.
- **Scope:** Configure analyzers to monitor the entire account (default) or specific resource types as needed.
- **Review Cadence:** Findings from IAM Access Analyzer **MUST** be reviewed regularly (e.g., monthly or quarterly) as part of the periodic review process (see Section 5.4).
- **Findings Management:**
  - Investigate active findings promptly.
  - Remediate policies granting unintended access.
- Archive findings that represent intentional and approved access configurations to reduce noise.
  - **Organization Analyzer:** If AWS Organizations is in use, configuring a **centralized Organization-level analyzer** via a delegated administrator account (typically the Security account) is the preferred approach for central visibility, supplementing account-level analyzers if needed.

### 5.7. Regular Review

- **Quarterly:** Review IAM Access Analyzer findings, IAM group memberships, permission set assignments, and high-privilege roles.
- **Annually:** Review overall IAM strategy, standard permission sets, SCPs, and emergency access procedures.

## 6. Implementation Status

| Feature                     | Status      | Notes                                                                  |
| :-------------------------- | :---------- | :--------------------------------------------------------------------- |
| **Human Access**            |             |                                                                        |
| IAM Identity Center Setup   | Done        | Using built-in identity store.                                         |
| Group Definition            | To Do       | Define standard groups (Admins, Developers, etc.).                     |
| Permission Set Definition   | To Do       | Define & implement standard Permission Sets (Admin, Dev, ReadOnly...). |
| Group/Permission Assignment | To Do       | Assign defined groups to permission sets in relevant accounts.         |
| **Application Access**      |             |                                                                        |
| EKS OIDC Provider Config    | Done        | Assumed done as part of EKS setup.                                     |
| EKS IRSA Roles              | In Progress | To be created per application service account needs.                   |
| CI/CD OIDC Provider Config  | Done        | Documented in `02-piksel-OIDC-implementation.md`.                      |
| CI/CD Roles (Initial)       | To Do       | Create initial roles for dev environment pipelines.                    |
| CI/CD Roles (Refined)       | To Do       | Refine based on Access Analyzer/CloudTrail after initial dev usage.    |
| EC2 Instance Profile Roles  | To Do       | Define standard roles if/when EC2 instances are used.                  |
| Lambda Execution Roles      | To Do       | Define standard roles if/when Lambda functions are used.               |
| **Governance**              |             |                                                                        |
| Naming Conventions Defined  | Done        | Defined in this document.                                              |
| Tagging Strategy Defined    | Done        | Defined in this document.                                              |
| CloudTrail Central Logging  | Done        | Assumed done as part of Org setup.                                     |
| Access Analyzer Reviews     | To Do       | Establish review cadence.                                              |
| Emergency Access Setup      | To Do       | Create users, roles, define procedure, setup alerts.                   |
| Prohibit IAM User Keys      | Policy      | Policy defined, enforcement via Config Rules/SCPs TBD.                 |
| Root MFA Enforcement        | Done        | Assumed done as part of account baseline.                              |
| Regular Review Cadence      | To Do       | Formalize schedule and assign responsibility.                          |
