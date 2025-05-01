# DNS Infrastructure Blueprint for Piksel Project

|                    |                                                              |
| :----------------- | :----------------------------------------------------------- |
| **Version**        | 1.0                                                          |
| **Date**           | 2025-05-01                                                   |
| **Owner**          | Cloud Infrastructure Team                                    |
| **Implementation** | Terraform, external-dns (via GitOps), Manual (NS Delegation) |

### 1.1. Purpose

This document provides the technical specifications for the Domain Name System (DNS) infrastructure supporting the Piksel project within AWS. It outlines the design for both internal network resolution (`*.piksel.internal`) and the management strategy for the public-facing domain (`piksel.big.go.id`). This blueprint serves as the guide for infrastructure-as-code (IaC) implementation and operational procedures, prioritizing consistency, automation, reliability, and security.

### 1.2. Scope

This strategy covers the setup, configuration, and management of AWS Route 53 Private Hosted Zones (PHZs) for internal resolution and the AWS Route 53 Public Hosted Zone (PuHZ) for the external `piksel.big.go.id` domain. It includes naming conventions, cross-account sharing, delegation requirements, and the approach for managing DNS records (static via IaC, dynamic via automation tools).

### 1.3. Audience

This document is intended for the Cloud Infrastructure team, DevOps engineers, Application Development teams, Network Administrators, and relevant stakeholders involved in network architecture and application deployment.

## 2. Core Infrastructure Principles & Standards

These principles apply globally to the DNS setup.

- **Infrastructure as Code (IaC):** Core DNS resources (Hosted Zones, static records, health checks) **MUST** be defined and managed using Terraform code stored in the `piksel-infra` Git repository. This ensures foundational DNS infrastructure is version-controlled and reproducible.
- **GitOps (Terraform via GitHub Actions):**
  - Changes to Terraform-managed DNS resources **MUST** follow the GitOps workflow: Pull Request -> Review -> Merge.
  - Merges to the designated branch in the `piksel-infra` repository **MUST** trigger an automated CI/CD pipeline (using **GitHub Actions**) that executes the Terraform plan and apply (potentially via Terraform Cloud).
- **GitOps (Kubernetes via FluxCD):**
  - **FluxCD** will be used to manage the deployment and lifecycle of Kubernetes-based applications and controllers (like `external-dns`) from Git repositories onto the EKS clusters.
- **Automation & Toolchain for Dynamic Records:**
  - **`external-dns`:** This Kubernetes controller **MUST** be deployed (using Helm via FluxCD) to each EKS cluster (Dev, Staging, Prod) to handle dynamic DNS record creation/updates in Route 53 based on Kubernetes resources.
  - **Interaction Flow:**
    1.  Applications are packaged using **Helm** charts.
    2.  **FluxCD** monitors Git and deploys/updates application Helm charts to the appropriate EKS cluster.
    3.  These deployments create Kubernetes Service (type LoadBalancer) or Ingress resources containing desired hostnames (e.g., via annotations).
    4.  The **`external-dns`** controller detects these resources and automatically creates/updates the corresponding A or CNAME records in the relevant Route 53 Hosted Zone (`piksel.big.go.id` for public, `*.piksel.internal` for internal service discovery).
  - This automation minimizes manual DNS changes for application endpoints, directly linking DNS state to the deployed application state managed via GitOps.
- **Naming Convention:**
  - **Accounts:** Use descriptive names (e.g., `Piksel Development`, `Piksel Staging`, `Piksel Production`, `Piksel Shared`).
  - **Internal Zones:** `dev.piksel.internal`, `staging.piksel.internal`, `prod.piksel.internal`
  - **External Zone:** `piksel.big.go.id`
  - **Records:** Follow RFC 1034/1035 standards (lowercase, hyphens allowed, no underscores). Define clear patterns (e.g., `<service>.<namespace>.<environment>.piksel.internal`, `<app-name>.piksel.big.go.id`).
- **Standard Tagging:** All Route 53 Hosted Zones and Health Checks MUST include the following tags:
  - `Project: piksel`
  - `Environment: dev | staging | prod | shared | test`
  - `ManagedBy: Terraform | external-dns` (Use `Terraform` for zones and static records; `external-dns` manages dynamic records based on K8s resources in both public and private zones)
  - `Owner: DevOps-Team`
- **Centralization:** Core DNS Hosted Zones (Public and Private) **MUST** be managed within the central **`Piksel Shared`** AWS account to simplify governance, cross-account resolution, and management.
- **Reliability:** Utilize the high availability and scalability of AWS Route 53.
- **Security:** Implement least-privilege access controls (IAM) for DNS management (e.g., specific IAM roles for GitHub Actions/Terraform pipeline and `external-dns` controller). Consider DNSSEC for the public zone.

## 3. Internal DNS Strategy (`*.piksel.internal`)

### 3.1. Platform & Architecture

- **Service:** AWS Route 53 Private Hosted Zones (PHZs).
- **Location:** All PHZs (`dev.piksel.internal`, `staging.piksel.internal`, `prod.piksel.internal`) are created and managed within the **`Piksel Shared`** account.
- **Zone Structure:** Environment-specific zones provide clear separation and control.

### 3.2. Cross-Account Resolution & VPC Association

- **Sharing Mechanism:** PHZs in the `Piksel Shared` account are shared with the respective environment OUs/accounts (Dev, Staging, Prod) using **AWS Resource Access Manager (RAM)**.
- **VPC Association:** VPCs in the Dev, Staging, and Prod accounts **MUST** be associated with the shared PHZs they need to query via Terraform configuration within each environment's VPC setup. This enables resolution of records within the associated zones (e.g., `service-a.dev.piksel.internal` from within the Dev VPC). Cross-environment resolution requires associating the requesting VPC with the target environment's shared zone.
- **VPC Settings:** Ensure VPCs have `enableDnsSupport` and `enableDnsHostnames` attributes set to `true`.

### 3.3. Dynamic Record Management (Internal Service Discovery)

- **Tool:** The `external-dns` controller deployed within each environment's EKS cluster **WILL** be configured to manage DNS records within the corresponding shared Private Hosted Zone (e.g., `external-dns` in the Dev EKS cluster manages records in `dev.piksel.internal`).
- **Purpose:** This enables automated creation/update of internal DNS records (e.g., `my-service.app-ns.dev.piksel.internal`) based on Kubernetes Service or Ingress resources, facilitating service discovery within the environment.
- **Permissions:** The IAM role assumed by the `external-dns` pod in each environment account **MUST** be granted the necessary permissions (e.g., via a cross-account role assumption) to modify Route 53 records within the specific shared PHZ hosted in the `Piksel Shared` account.

## 4. External DNS Strategy (`piksel.big.go.id`)

### 4.1. Platform & Architecture

- **Service:** AWS Route 53 Public Hosted Zone (PuHZ).
- **Location:** The PuHZ for `piksel.big.go.id` is created and managed within the **`Piksel Shared`** AWS account. This centralization simplifies management and permissions.

### 4.2. Delegation Requirement & Process (Critical Prerequisite)

Managing the `piksel.big.go.id` domain directly within AWS Route 53 requires **delegating DNS authority** from the parent domain (`big.go.id`), which is managed by the central IT department. This delegation tells the global DNS system that AWS Route 53 is now responsible for answering queries for `piksel.big.go.id`.

**Detailed Steps:**

1.  **Action 1 (Terraform): Create the AWS Hosted Zone & Identify Name Servers**

    - Use Terraform within the `Piksel Shared` account configuration (`piksel-infra/shared/`) to define and create the `aws_route53_zone` resource for `piksel.big.go.id`.
    - Upon creation, AWS automatically assigns a set of **4 unique Name Servers (NS)** to this hosted zone (e.g., `ns-123.awsdns-45.com`, `ns-678.awsdns-90.net`, etc.). These are the specific, highly available AWS DNS servers that will host the DNS records for `piksel.big.go.id`.
    - Note down these 4 NS hostnames precisely. They can be found in the AWS Route 53 console for the created zone or retrieved from the Terraform state/output (`aws_route53_zone.public.name_servers`).

2.  **Action 2 (Data Migration): Replicate Existing Records**

    - **Before** proceeding with the delegation request, obtain a complete export or list of all existing DNS records currently configured under `piksel.big.go.id` within the central IT's DNS system.
    - These records **MUST** be accurately replicated within the newly created AWS Route 53 Public Hosted Zone (`piksel.big.go.id`). This can be done via Terraform (`aws_route53_record`) for static records or potentially manual entry for a large number of existing records initially. This ensures that when delegation switches, the necessary DNS information is already present in AWS and services remain available.

3.  **Action 3 (Manual Coordination): Request NS Record Update from Central IT**
    - Formally request the central IT department (managing the `big.go.id` zone) to perform a critical update within _their_ DNS configuration.
    - They need to **find the existing NS records for the `piksel` subdomain** within their `big.go.id` zone and **replace their values** with the **4 specific AWS Name Server hostnames** obtained in Action 1.
    - **How Delegation Works:** By adding these NS records for `piksel` in the `big.go.id` zone, central IT is effectively telling the global DNS system: "For any queries related to `piksel.big.go.id`, don't ask us, go ask these specific AWS name servers instead."
    - **Verification:** After central IT confirms the update, allow time for DNS propagation (minutes to hours). Use tools like `dig` or online DNS checkers to verify that queries for `piksel.big.go.id` NS records now return the AWS name servers.

### 4.3. Dynamic Record Management (Public Endpoints)

- **Tool:** The `external-dns` controller deployed within each environment's EKS cluster **WILL** also be configured to manage DNS records within the single, shared Public Hosted Zone (`piksel.big.go.id`).
- **Purpose:** This enables automated creation/update of public DNS records (e.g., `my-app.piksel.big.go.id`) based on Kubernetes Service (type LoadBalancer) or Ingress resources exposed publicly.
- **Permissions:** The IAM role assumed by the `external-dns` pod in each environment account **MUST** be granted the necessary permissions (e.g., via a cross-account role assumption) to modify Route 53 records within the public hosted zone in the `Piksel Shared` account. Filtering (e.g., by domain name or record type) within `external-dns` configuration might be necessary to prevent conflicts if multiple environments manage records in the same public zone.

### 1.1. Purpose

This document provides the technical specifications for the Domain Name System (DNS) infrastructure supporting the Piksel project within AWS. It outlines the design for both internal network resolution (`*.piksel.internal`) and the management strategy for the public-facing domain (`piksel.big.go.id`). This blueprint serves as the guide for infrastructure-as-code (IaC) implementation and operational procedures, prioritizing consistency, automation, reliability, and security.

### 1.2. Scope

This strategy covers the setup, configuration, and management of AWS Route 53 Private Hosted Zones (PHZs) for internal resolution and the AWS Route 53 Public Hosted Zone (PuHZ) for the external `piksel.big.go.id` domain. It includes naming conventions, cross-account sharing, delegation requirements, and the approach for managing DNS records (static via IaC, dynamic via automation tools).

### 1.3. Audience

This document is intended for the Cloud Infrastructure team, DevOps engineers, Application Development teams, Network Administrators, and relevant stakeholders involved in network architecture and application deployment.

## 2. Core Infrastructure Principles & Standards

These principles apply globally to the DNS setup.

- **Infrastructure as Code (IaC):** Core DNS resources (Hosted Zones, static records, health checks) **MUST** be defined and managed using Terraform code stored in the `piksel-infra` Git repository. This ensures foundational DNS infrastructure is version-controlled and reproducible.
- **GitOps (Terraform via GitHub Actions):**
  - Changes to Terraform-managed DNS resources **MUST** follow the GitOps workflow: Pull Request -> Review -> Merge.
  - Merges to the designated branch in the `piksel-infra` repository **MUST** trigger an automated CI/CD pipeline (using **GitHub Actions**) that executes the Terraform plan and apply (potentially via Terraform Cloud).
- **GitOps (Kubernetes via FluxCD):**
  - **FluxCD** will be used to manage the deployment and lifecycle of Kubernetes-based applications and controllers (like `external-dns`) from Git repositories onto the EKS clusters.
- **Automation & Toolchain for Dynamic Records:**
  - **`external-dns`:** This Kubernetes controller **MUST** be deployed (using Helm via FluxCD) to each EKS cluster (Dev, Staging, Prod) to handle dynamic DNS record creation/updates in Route 53 based on Kubernetes resources.
  - **Interaction Flow:**
    1.  Applications are packaged using **Helm** charts.
    2.  **FluxCD** monitors Git and deploys/updates application Helm charts to the appropriate EKS cluster.
    3.  These deployments create Kubernetes Service (type LoadBalancer) or Ingress resources containing desired hostnames (e.g., via annotations).
    4.  The **`external-dns`** controller detects these resources and automatically creates/updates the corresponding A or CNAME records in the relevant Route 53 Hosted Zone (`piksel.big.go.id` for public, `*.piksel.internal` for internal service discovery).
  - This automation minimizes manual DNS changes for application endpoints, directly linking DNS state to the deployed application state managed via GitOps.
- **Naming Convention:**
  - **Accounts:** Use descriptive names (e.g., `Piksel Development`, `Piksel Staging`, `Piksel Production`, `Piksel Shared`).
  - **Internal Zones:** `dev.piksel.internal`, `staging.piksel.internal`, `prod.piksel.internal`
  - **External Zone:** `piksel.big.go.id`
  - **Records:** Follow RFC 1034/1035 standards (lowercase, hyphens allowed, no underscores). Define clear patterns (e.g., `<service>.<namespace>.<environment>.piksel.internal`, `<app-name>.piksel.big.go.id`).
- **Standard Tagging:** All Route 53 Hosted Zones and Health Checks MUST include the following tags:
  - `Project: piksel`
  - `Environment: dev | staging | prod | shared | test`
  - `ManagedBy: Terraform | external-dns` (Use `Terraform` for zones and static records; `external-dns` manages dynamic records based on K8s resources in both public and private zones)
  - `Owner: DevOps-Team`
- **Centralization:** Core DNS Hosted Zones (Public and Private) **MUST** be managed within the central **`Piksel Shared`** AWS account to simplify governance, cross-account resolution, and management.
- **Reliability:** Utilize the high availability and scalability of AWS Route 53.
- **Security:** Implement least-privilege access controls (IAM) for DNS management (e.g., specific IAM roles for GitHub Actions/Terraform pipeline and `external-dns` controller). Consider DNSSEC for the public zone.

## 3. Internal DNS Strategy (`*.piksel.internal`)

### 3.1. Platform & Architecture

- **Service:** AWS Route 53 Private Hosted Zones (PHZs).
- **Location:** All PHZs (`dev.piksel.internal`, `staging.piksel.internal`, `prod.piksel.internal`) are created and managed within the **`Piksel Shared`** account.
- **Zone Structure:** Environment-specific zones provide clear separation and control.

### 3.2. Cross-Account Resolution & VPC Association

- **Sharing Mechanism:** PHZs in the `Piksel Shared` account are shared with the respective environment OUs/accounts (Dev, Staging, Prod) using **AWS Resource Access Manager (RAM)**.
- **VPC Association:** VPCs in the Dev, Staging, and Prod accounts **MUST** be associated with the shared PHZs they need to query via Terraform configuration within each environment's VPC setup. This enables resolution of records within the associated zones (e.g., `service-a.dev.piksel.internal` from within the Dev VPC). Cross-environment resolution requires associating the requesting VPC with the target environment's shared zone.
- **VPC Settings:** Ensure VPCs have `enableDnsSupport` and `enableDnsHostnames` attributes set to `true`.

### 3.3. Dynamic Record Management (Internal Service Discovery)

- **Tool:** The `external-dns` controller deployed within each environment's EKS cluster **WILL** be configured to manage DNS records within the corresponding shared Private Hosted Zone (e.g., `external-dns` in the Dev EKS cluster manages records in `dev.piksel.internal`).
- **Purpose:** This enables automated creation/update of internal DNS records (e.g., `my-service.app-ns.dev.piksel.internal`) based on Kubernetes Service or Ingress resources, facilitating service discovery within the environment.
- **Permissions:** The IAM role assumed by the `external-dns` pod in each environment account **MUST** be granted the necessary permissions (e.g., via a cross-account role assumption) to modify Route 53 records within the specific shared PHZ hosted in the `Piksel Shared` account.

## 4. External DNS Strategy (`piksel.big.go.id`)

### 4.1. Platform & Architecture

- **Service:** AWS Route 53 Public Hosted Zone (PuHZ).
- **Location:** The PuHZ for `piksel.big.go.id` is created and managed within the **`Piksel Shared`** AWS account. This centralization simplifies management and permissions.

### 4.2. Delegation Requirement & Process (Critical Prerequisite)

Managing the `piksel.big.go.id` domain directly within AWS Route 53 requires **delegating DNS authority** from the parent domain (`big.go.id`), which is managed by the central IT department. This delegation tells the global DNS system that AWS Route 53 is now responsible for answering queries for `piksel.big.go.id`.

**Detailed Steps:**

1.  **Action 1 (Terraform): Create the AWS Hosted Zone & Identify Name Servers**

    - Use Terraform within the `Piksel Shared` account configuration (`piksel-infra/shared/`) to define and create the `aws_route53_zone` resource for `piksel.big.go.id`.
    - Upon creation, AWS automatically assigns a set of **4 unique Name Servers (NS)** to this hosted zone (e.g., `ns-123.awsdns-45.com`, `ns-678.awsdns-90.net`, etc.). These are the specific, highly available AWS DNS servers that will host the DNS records for `piksel.big.go.id`.
    - Note down these 4 NS hostnames precisely. They can be found in the AWS Route 53 console for the created zone or retrieved from the Terraform state/output (`aws_route53_zone.public.name_servers`).

2.  **Action 2 (Data Migration): Replicate Existing Records**

    - **Before** proceeding with the delegation request, obtain a complete export or list of all existing DNS records currently configured under `piksel.big.go.id` within the central IT's DNS system.
    - These records **MUST** be accurately replicated within the newly created AWS Route 53 Public Hosted Zone (`piksel.big.go.id`). This can be done via Terraform (`aws_route53_record`) for static records or potentially manual entry for a large number of existing records initially. This ensures that when delegation switches, the necessary DNS information is already present in AWS and services remain available.

3.  **Action 3 (Manual Coordination): Request NS Record Update from Central IT**
    - Formally request the central IT department (managing the `big.go.id` zone) to perform a critical update within _their_ DNS configuration.
    - They need to **find the existing NS records for the `piksel` subdomain** within their `big.go.id` zone and **replace their values** with the **4 specific AWS Name Server hostnames** obtained in Action 1.
    - **How Delegation Works:** By adding these NS records for `piksel` in the `big.go.id` zone, central IT is effectively telling the global DNS system: "For any queries related to `piksel.big.go.id`, don't ask us, go ask these specific AWS name servers instead."
    - **Verification:** After central IT confirms the update, allow time for DNS propagation (minutes to hours). Use tools like `dig` or online DNS checkers to verify that queries for `piksel.big.go.id` NS records now return the AWS name servers.

### 4.3. Dynamic Record Management (Public Endpoints)

- **Tool:** The `external-dns` controller deployed within each environment's EKS cluster **WILL** also be configured to manage DNS records within the single, shared Public Hosted Zone (`piksel.big.go.id`).
- **Purpose:** This enables automated creation/update of public DNS records (e.g., `my-app.piksel.big.go.id`) based on Kubernetes Service (type LoadBalancer) or Ingress resources exposed publicly.
- **Permissions:** The IAM role assumed by the `external-dns` pod in each environment account **MUST** be granted the necessary permissions (e.g., via a cross-account role assumption) to modify Route 53 records within the public hosted zone in the `Piksel Shared` account. Filtering (e.g., by domain name or record type) within `external-dns` configuration might be necessary to prevent conflicts if multiple environments manage records in the same public zone.

## 5. DNS Record Management Strategy

### 5.1. Static Records (Managed by Terraform)

- **Scope:** Foundational, infrequently changing records.
- **Examples:** MX records, domain verification TXT records (SES, Google Workspace), CNAMEs/Aliases for core infrastructure endpoints, potentially A records for static IPs.
- **Implementation:** Defined as `aws_route53_record` resources within the Terraform configuration for the Shared Services account. Managed via GitOps.

### 5.2. Dynamic Application Records (Managed by `external-dns`)

- **Scope:** Records associated with dynamically deployed applications, primarily within Kubernetes.
- **Tooling:** Deploy **`external-dns`** within EKS clusters in each environment (Dev, Staging, Prod).
- **Functionality:** `external-dns` monitors Kubernetes Service/Ingress resources (via annotations) and automatically creates/updates/deletes corresponding A or CNAME records in Route 53.
- **Target Zones:**
  - Public services: Records created in the `piksel.big.go.id` PuHZ.
  - Internal services: Records created in the relevant `*.piksel.internal` PHZ (e.g., `dev.piksel.internal` for services in the Dev EKS cluster).
- **Permissions:** Requires an IAM Role for Service Account (IRSA) per cluster with `route53:ChangeResourceRecordSets`, `route53:ListResourceRecordSets`, and `route53:ListHostedZones` permissions scoped to the necessary Hosted Zone IDs in the Shared Services account.

### 5.3. Manual Changes

- **Policy:** Strongly discouraged. Reserved for emergency break-fix scenarios only.
- **Reconciliation:** Any emergency manual changes made via Console/CLI **MUST** be reflected back into the Terraform state/code (`terraform import` or code update) immediately afterward to prevent configuration drift.

## 6. Security & Monitoring Implementation

- **IAM (Least Privilege):**
  - Terraform Execution Role: Permissions limited to managing Route 53 resources within the Shared Services account.
  - `external-dns` IRSA Roles: Permissions scoped tightly to specific Hosted Zone IDs and necessary actions (`ChangeResourceRecordSets`, `List*`).
- **DNSSEC:**
  - **Recommendation:** Evaluate enabling DNSSEC on the `piksel.big.go.id` Public Hosted Zone for enhanced security against spoofing.
  - **Dependency:** Requires coordination with central IT, as they must add a Delegation Signer (DS) record in the parent `big.go.id` zone.
- **Monitoring:**
  - **Health Checks:** Configure Route 53 Health Checks via Terraform for critical public endpoints, potentially integrating with DNS failover routing policies.
  - **CloudWatch Alarms:** Set up alarms on Health Check statuses.
  - **Query Logging:** **Avoid** enabling Route 53 query logging unless strictly required for compliance or deep security analysis due to potential high costs. Standard CloudTrail logging of API calls is sufficient for most auditing.

## 7. Optimization Implementation

- **Alias Records:** Utilize Route 53 Alias records wherever possible when pointing to AWS resources (ALBs, CloudFront, S3 Websites) instead of CNAMEs. Alias records are free, offer better performance, and can point to the zone apex.
- **Routing Policies:** Consider advanced routing policies (Latency, Geolocation, Failover) for the public zone if needed for performance optimization or high availability patterns. Managed via Terraform.
- **TTL Values:** Review and set appropriate Time-To-Live (TTL) values for records based on how frequently they are expected to change. Lower TTLs allow for faster propagation but increase query load.

## 8. Terraform Management of Shared DNS Resources

_(Note: This section summarizes the Terraform-specific aspects covered in principles above)_

This section outlines managing shared DNS Zones via Terraform Cloud (TFC) and GitHub Actions.

- **Target Account:** Core DNS Zones (`piksel.big.go.id`, `*.piksel.internal`) **MUST** reside in the **`Piksel Shared`** AWS account.
- **Source Code & Structure:** Terraform definitions use a modular structure within the `piksel-infra` repository's `shared/` directory.
- **Key Resources (`shared/`):**
  - `aws_route53_zone` (Defines PHZ/Public Zone)
  - `aws_ram_resource_share` & `aws_ram_principal_association` (Shares PHZs via RAM)
  - `aws_route53_record` (Defines static records)
  - `aws_route53_health_check` (Defines health checks)
- **Key Resources (Environment Code, e.g., `dev/vpc/`):**
  - `aws_vpc_association_authorization` & `aws_route53_zone_association` (Associates environment VPCs with shared PHZs). Requires cross-account IAM permissions.
- **TFC Workspace:** The `piksel-infra-shared` TFC workspace manages resources defined in `shared/`, targeting the `Piksel Shared` AWS account.
- **Authentication:** Secure TFC-to-AWS authentication (e.g., OIDC) **MUST** be configured for the `Piksel Shared` account.
- **State Management:** TFC manages the Terraform state for the `piksel-infra-shared` workspace.
- **Workflow:** Changes to `shared/` follow the standard GitOps PR process. Merges trigger **GitHub Actions** which in turn trigger the `piksel-infra-shared` TFC workspace run. Manual TFC apply confirmation is recommended for production changes.

## 9. Rollback Plan (External DNS Delegation Cutover)

- **Pre-computation:** Ensure all existing `piksel.big.go.id` records are accurately replicated in the AWS Route 53 PuHZ _before_ the NS change.
- **Pre-computation:** Verify resolution of these replicated records against the assigned AWS NS servers using `dig` or similar tools.
- **Execution:** Coordinate with Central IT for the NS record update in `big.go.id`.
- **Monitoring:** Post-cutover, actively monitor key application endpoints, certificate validity, and DNS propagation using external tools.
- **Rollback Trigger:** Critical service failures directly traced to DNS resolution issues post-migration, within a pre-agreed timeframe (e.g., 1-2 hours), that cannot be immediately fixed in Route 53.
- **Rollback Action:** Request Central IT to revert the NS records for `piksel` in `big.go.id` back to the previous configuration. (Requires old infrastructure to be temporarily available).
