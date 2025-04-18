<!-- prettier-ignore-start -->

# Piksel - AWS Organization Foundational Security Guidelines

|             |                         |
|-------------|-------------------------|
| **Version** | 1.0                     |
| **Date**    | 2025-04-18              |
| **Owner**   | Cloud Infrastructure Team |


## 1. Introduction

|      |                                                                                          |
| :---------- | :-------------------------------------------------------------------- |
| **Purpose** | Outline the foundational security measures, configuration standards, and organizational best practices for the Piksel AWS Organization and its member accounts. These guidelines aim to enhance security, improve governance, optimize costs, and ensure operational stability. |
| **Scope**   | This document applies to the AWS Organization management account and all current and future member accounts managed within it.                                                                              |
| **Audience**| AWS Administrators, Security Teams, Developers deploying resources, Finance/Billing contacts.                                                                                                             |


## 2. AWS Organization Structure

### 2.1. AWS Organization
AWS Organizations is an AWS service that enables central management and governance of an AWS environment as usage grows and scales. It allows for the consolidation of multiple AWS accounts into an *organization* that is created and centrally managed. Key benefits include simplified billing, centralized policy enforcement (like Service Control Policies - SCPs), streamlined access management (via IAM Identity Center), and the ability to group accounts logically using Organizational Units (OUs).

> 💡 **BEST PRACTICE: Single AWS Organization**  
>
> A single AWS Organization centralizes management for multiple accounts, providing:  
>  - **Unified Governance:** Consistent policy application (SCPs, Tag Policies).<br>
>  - **Consolidated Billing:** Single invoice, volume discounts, cost analysis.  <br>
>  - **Centralized Security:** Delegated administration for security services (GuardDuty, Security Hub). <br>
>  - **Simplified Access:** Central user management via IAM Identity Center (SSO).  <br>
>  - **Improved Scalability:** Streamlined account creation and configuration.  <br>


### 2.2. AWS Oraganization Unit
Organizational Units (OUs) are containers within an AWS Organization used to group AWS accounts.<br>
**How are OUs Used?**
-   **Hierarchical Structure:** OUs can be arranged in a hierarchy, nested up to five levels deep under the Organization root.
-   **Logical Grouping:** They enable the arrangement of accounts based on criteria like function (e.g., `Infrastructure`, `Security`), environment (`Production`, `Development`), compliance needs, or business units.
-   **Policy Targets:** Policies, such as Service Control Policies (SCPs) or Tag Policies, can be attached directly to an OU.

> 💡 **BEST PRACTICE: Effective OU Strategy**
> Leveraging OUs effectively is key to managing accounts at scale:
> - **Targeted Policy Application:** Apply policies (SCPs, Tag Policies) at the OU level whenever feasible, instead of managing policies on numerous individual accounts. Policies attached to an OU are inherited by all accounts and any nested OUs within it, simplifying enforcement and management.
> -  **Hierarchical Control:** Design the OU structure to facilitate policy inheritance. Apply broader policies at higher-level OUs (closer to the root) and implement more specific or restrictive policies on OUs further down the hierarchy as needed.
> -  **Meaningful Structure:** Base the OU design on clear operational, security, or governance requirements to ensure logical grouping and facilitate targeted management actions.

### 2.3. Piksel's Oraganization Status
| Status      | Details                                                                                             |
| :---------- | :-------------------------------------------------------------------------------------------------- |
| **Done**    | Single AWS Organization created. Multiple accounts provisioned.                                     |
| **To Do**   | Define and implement Oraganizational Unit (OU) structure                                        |
| **To Do**   | Formalize the account vending (creation) process                                       |
| **To Do**   | Define and apply initial SCPs                                       |

### 2.4. Proposed Initial OU Structure
*(This structure needs formal definition and implementation as noted in the 'To Do' status)*

*   `Security` (To contain Security and Audit accounts)
*   `Infrastructure` (Optional, for shared services like networking)
*   `Workloads`
    *   `Production` (To contain Production account(s))
    *   `Development` (To contain Development account(s))
*   `Sandbox` (Optional, for individual developer experimentation)
*   `Suspended` (To place accounts before deletion) 

## 3. AWS Accounts Structure
### 3.1. AWS Accounts
An AWS account serves as the fundamental container for AWS resources. It establishes inherent boundaries for security isolation, access control, and billing segregation. All AWS resources, such as compute instances (EC2), storage buckets (S3), and identity entities (IAM users/roles), are provisioned and managed within the context of a specific account.

**Note:** AWS Accounts contain resources and provide isolation, whereas Organizational Units (OUs) are management constructs within AWS Organizations used to group accounts for organization and policy application (like SCPs); OUs do not contain resources directly.


> 💡 **Account Best Practices**
> - **Strategic Separation:** Utilize multiple accounts to isolate environments (Dev/Prod), functions (Security/Logging), or teams, limiting blast radius.
> - **Dedicated Foundational Accounts:** Establish specific accounts for central services (Management, Security Tooling, Log Archive).
> - **Automated Provisioning:** Implement standardized account creation (e.g., Control Tower, IaC) to ensure consistent baseline configurations (networking, logging, security).
> - **Enforce Baselines:** Apply minimum security and operational standards (Root MFA, CloudTrail, Config) across all accounts.



### 3.2. Current and Planned Account Structure
| Account Type/Name             | Account ID                       | Purpose                                                                                                                                                                                                                                                           |
| :---------------------------- | :------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Management Account**        | `piksel` (4058****2138)          | Central governance, consolidated billing, managing Organization features (SCPs, Tag Policies), hosting IAM Identity Center (SSO). **Should not host workloads.**                                                                                                     |
| **Development Account**       | `Piksel Development` (2361****5646) | Environment for development, testing, and experimentation. Lower security posture than production, allows developers more flexibility within defined guardrails. Contains non-production data.                                                                      |
| **Production Account**        | `[TBD]`                      | Hosts live, customer-facing applications and data. Highest level of security controls, restricted access, rigorous change management. This environment directly impacts end-users and handles sensitive production data, necessitating the strictest controls. |
| **Security Account**          | `[TBD]`                      | Hosts organization-wide security services (e.g., GuardDuty, Security Hub, Macie). Centralizes security tooling and monitoring. Often designated as the delegated administrator for security services.                                       |
| **Audit Account (Log Archive)** | `[TBD]` | Centralized, secure, and immutable storage for logs (e.g., CloudTrail, Config logs, VPC Flow Logs) from all accounts in the Organization. Access should be highly restricted.                                                              |
| *Other Accounts*              | *[Add as needed]*               | *[ID TBD]*                         | *(e.g., Shared Services, Network Hub)*                                                                                                                                                                                            |

### 3.3 The Management Account
The Management Account is the foundation of the AWS Organization, responsible for billing, account management, and applying Organization-wide controls (e.g., SCPs). Its compromise would critically impact the entire AWS environment. Therefore, securing this account, especially the root user, and strictly limiting its operational use are paramount. This account should **not** host workloads or be used for routine administration.

> 💡 **Management Account Best Practices**
> - **Root User Email:** Use a secure, dedicated group email address/distribution list (e.g., `aws-management-alerts@yourdomain.com`) with tightly controlled access, not an individual or shared mailbox.
> - **Root User MFA:** Mandate Multi-Factor Authentication (MFA) for the root user, preferably using a securely stored hardware device.
> - **Root User Recovery:** Configure a dedicated, secure phone number and ensure the recovery email is the designated group address.
> - **Access Strategy:**
>   -  Strictly limit root user activity to essential, documented tasks only.
>   -  Employ IAM Identity Center (SSO) integrated with your corporate IdP for administrative access.
>   -  Grant permissions via least-privilege IAM roles, assigned through IAM Identity Center.
>   -  Avoid creating IAM users directly within the Management Account.

**Current Status and Required Actions**

The following table outlines the current security posture of the Management Account:

| Item                              | Current Status                                                                                        | Next Steps / Action Required                                                                                                                                                              |
| :-------------------------------- | :---------------------------------------------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **3.3.1 Root User Email Address** | `tu.dpt@big.go.id` **(Critical Risk - Shared Admin Email)**                                           | **URGENT:** Liaise with IT to create a secure distribution list (e.g., `aws-management-alerts@big.go.id`). Update root email immediately. Secure and document DL access.                 |
| **3.3.2 Root User MFA**           | **Not Enabled (Critical Risk)**                                                                       | Verify status. Procure/enable a hardware MFA device for the root user. Document secure storage/access procedures.                                                                         |
| **3.3.3 Root User Recovery Info** | **Recovery phone not configured (High Risk)**                                                         | Verify status. Configure/verify a dedicated, securely managed phone number for root user recovery.                                                                                    |
| **3.3.4 Management Account Access** | **Needs Implementation:** Root password storage unverified. SSO/IAM Identity Center not configured. | 1. Securely store root password & document procedure. 2. Define/document tasks requiring root. 3. Configure IAM Identity Center with IdP. 4. Define/assign admin roles via SSO. 5. Reinforce policy of *not* using root daily. |

> ⚠️ **URGENT SECURITY ALERT: Root Email Address** <br>
> The use of `tu.dpt@big.go.id` (a shared administrative email) for the root user poses a **critical security risk**. This violates fundamental security principles. <br>
>
> **Immediate Action Required:** <br> Coordinate with IT to provision a secure, access-controlled distribution list for root user communications and update the Management Account settings immediately. <br>

An access-controlled distribution list or group email is a specific type of email address designed to forward incoming messages to multiple, predefined recipients simultaneously. Critically, the "access-controlled" aspect means that both the membership of the list (who receives the emails) and potentially who is allowed to send to the list are strictly managed and restricted to authorized personnel or systems. This ensures that sensitive communications, such as critical alerts or recovery information from an AWS Management Account, are reliably delivered only to the appropriate team members, enhancing security, accountability, and availability compared to using an individual's email address or an insecurely shared mailbox.


### 3.4 Member Accounts
Member accounts are the separate areas within the AWS Organization used for actual work. They keep different projects, work environments (like Development or Production), or teams separate from each other. Keeping things separate improves security and makes it easier to track costs and manage resources.

It's important to know the difference between an AWS *account* (which holds all the resources and has a main 'root' user) and the individual *users* who log in to work in that account. People should normally access these accounts using IAM Identity Center (also called SSO). They get specific permissions (called IAM Roles) to do their jobs inside the member account. Using the main 'root' user or creating separate login names (IAM users) directly inside the member account for everyday work should be avoided.

Applying the same basic security rules to all member accounts is key to keeping the whole Organization safe.


> 💡 **Member Account Best Practices**
>
> *   **Root User Email:** Use secure group emails (distribution lists) for the root user, where access is tightly controlled (like for the Management Account).
> *   **Root User MFA:** MFA (Multi-Factor Authentication) must be turned on for the root user of every member account (like for the Management Account).
> *   **Root User Recovery:** Set up a specific, secure phone number for account recovery for each member account (like for the Management Account).
> *   **Access Strategy:** People should only log in using IAM Identity Center (SSO) and get only the minimum permissions (least-privilege Roles) needed for their tasks. The root user should only be used for very specific, necessary tasks that are written down (like for the Management Account). Avoid creating separate login names (IAM users) directly inside the member accounts if possible.

**Current Status and Required Actions**

The table below shows the current security status and setup of the member accounts:

| Item                                  | Current Status                                                                                                                                   | Next Steps / Action Required                                                                                                                                                                                          |
| :------------------------------------ | :----------------------------------------------------------------------------------------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **3.4.1 Root User Email Address**     | `Piksel Development`: `muhammad.taufik@big.go.id` **(Needs Change - Uses an individual's email)**                                                | Create a group email (e.g., `aws-dev-alerts@big.go.id`); update the root email address. Plan group emails for future accounts.                                                                                      |
| **3.4.2 Root User MFA**               | `Piksel Development`: **[Needs Checking]**                                                                                                       | Check if MFA is turned on. If not, turn it on (using hardware or software) and write down how it's kept safe. Do this for all future accounts.                                                                       |
| **3.4.3 Root User Recovery Info**     | `Piksel Development`: **[Needs Checking]**                                                                                                       | Check the recovery phone number setup. Set up or update it using a specific, secure phone number. Do this for all future accounts.                                                                                     |
| **3.4.4 Member Account Access**       | `Piksel Development`: Login via SSO/IAM Identity Center is set up for user `muhammad.taufik@big.go.id`. Status of root password storage: **[Needs Checking]**. | Make sure the root password is stored safely and the process is written down. Check or set up the right job permissions (Roles) accessible via SSO. Remind everyone not to use the root user daily. Plan login methods for future accounts. |
| **3.4.5 Organizational Units (OUs)**  | `Piksel Development` account is **not put into an Organizational Unit (OU) group**.                                                              | Plan how to group accounts using OUs (e.g., by work type). Put `Piksel Development` into the right OU group. Plan OU groups for future accounts.                                                                    |
| **3.4.6 Additional Member Accounts**  | **Need to plan and create** other necessary accounts (e.g., Production, Staging, Security Tools).                                                | Talk to the relevant people about what is needed. Plan, create, and set up new member accounts following the security rules (put in OUs, secure root user, set up logins).                                         |


Okay, here is a revised section for Service Control Policies (SCPs) with a more actionable plan in a table format and explanations based on the provided resource information.

---

## 4. Service Control Policies (SCPs)

### 4.1. Definition

Service Control Policies (SCPs) are a type of **Authorization policy** within AWS Organizations. Their primary function is to establish central control over the *maximum permissions* available for IAM users and roles within the member accounts of an Organization. They act as preventative guardrails, ensuring that actions within member accounts remain within defined security and compliance boundaries, even if an administrator within that account grants broad IAM permissions. SCPs *do not grant* permissions; they only define the boundaries or limits of what permissions *can be* granted or used. SCPs do not affect the Management Account.

### 4.2. Strategy

The recommended approach for implementing SCPs is to start with the default `FullAWSAccess` policy attached to the Organization Root. This policy allows all actions and ensures no disruption while specific controls are being planned. Subsequently, targeted, restrictive SCPs (using `Deny` statements) should be created and attached to specific Organizational Units (OUs) or accounts to enforce desired restrictions. This layering approach provides granular control without needing to manage complex `Allow` lists.

**Action Plan for SCP Implementation**

The following table outlines the steps to define and implement foundational SCPs:

| Priority | Action Item                                     | Description / Rationale                                                                                                                               | Target Application         | Status        | Owner/Assignee | Notes/Considerations                                                                                                                               |
| :------- | :---------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------- | :------------------------- | :------------ | :------------- | :------------------------------------------------------------------------------------------------------------------------------------------------- |
| **High** | **1. Verify Default SCP**                       | Confirm the `FullAWSAccess` policy is attached to the Organization Root. This is the baseline before adding restrictions.                               | Root                       | **Done** (Likely) | Cloud Team     | Verify in the AWS Organizations console.                                                                                                           |
| **High** | **2. Define & Apply Region Restriction SCP**    | Create an SCP to deny actions outside approved AWS Regions (e.g., allow only `ap-southeast-1`). Reduces attack surface, controls costs, aids compliance. | Root or Specific OUs (TBD) | Not Started   | Cloud Team     | Identify approved regions. Test carefully to avoid blocking necessary global services (e.g., IAM, Route 53). Apply broadly first, then refine if needed. |
| **High** | **3. Define & Apply Security Service Protection SCP** | Create an SCP to prevent disabling or altering critical security services (e.g., CloudTrail, Config, GuardDuty). Ensures continuous monitoring/logging. | Root or Specific OUs (TBD) | Not Started   | Cloud Team     | Identify essential security services and critical configuration actions to deny. Test thoroughly.                                                   |
| **Medium** | **4. Define High-Risk Action Prevention SCP** | Create an SCP to deny potentially dangerous actions, especially in sensitive environments (e.g., deleting VPCs, modifying critical security groups).       | Production OU (TBD)        | Not Started   | Cloud Team     | Define "high-risk" based on operational impact. Apply specifically to Production or other critical OUs once defined.                               |
| **Medium** | **5. Define IAM Restriction SCP**             | Create an SCP to prevent actions like creating local IAM users or access keys for the root user. Enforces central IAM Identity Center usage.           | Root or Specific OUs (TBD) | Not Started   | Cloud Team     | Ensure exceptions for break-glass scenarios are considered.                                                                                        |
| **Low**  | **6. Explore SCPs for Cost Control**          | Investigate SCPs to restrict launching expensive instance types or specific costly services if not needed.                                            | Development/Sandbox OU (TBD) | Not Started   | Cloud Team     | Useful for non-production environments. Requires clear understanding of allowed resources.                                                         |
| **Ongoing**| **7. Plan SCP Review Cycle**                  | Establish a regular process (e.g., quarterly) to review existing SCPs and identify needs for new ones based on evolving requirements.                 | N/A                        | Not Started   | Cloud Team     | Document the review process.                                                                                                                       |

**Explanation of Potential SCP Use Cases**

Based on the nature of SCPs (controlling maximum permissions), here are common ways they are applied:

1.  **Region Restriction:** Deny API calls for launching resources or performing actions outside of explicitly allowed AWS Regions. This helps with data sovereignty requirements and prevents accidental resource deployment in unintended locations.
    *   *Example Policy Action:* `ec2:RunInstances` denied if `aws:RequestedRegion` is not `ap-southeast-1`.
2.  **Prevent Disabling Security Services:** Deny actions that would stop logging (CloudTrail `StopLogging`, `DeleteTrail`), configuration tracking (Config `StopConfigurationRecorder`, `DeleteDeliveryChannel`), or threat detection (GuardDuty `DisassociateMembers`, `DeleteDetector`). This ensures baseline security visibility is maintained.
    *   *Example Policy Action:* `cloudtrail:StopLogging` denied.
3.  **Block High-Risk Actions:** Deny actions that could have significant negative impact, such as deleting core network infrastructure (`ec2:DeleteVpc`), removing Organization membership (`organizations:LeaveOrganization`), or modifying critical security controls. These are often applied more strictly to Production OUs.
    *   *Example Policy Action:* `ec2:DeleteVpc` denied for accounts in the Production OU.
4.  **Enforce Centralized IAM:** Deny actions like creating new IAM users (`iam:CreateUser`) or creating access keys for the root user (`iam:CreateAccessKey`) within member accounts, pushing administrators towards using IAM Identity Center.
    *   *Example Policy Action:* `iam:CreateUser` denied.
5.  **Limit Service Usage:** Deny the use of entire services or specific resource types within certain OUs (e.g., deny launching large GPU instances in a Development OU to control costs).
    *   *Example Policy Action:* `ec2:RunInstances` denied if `ec2:InstanceType` matches `p4d.*`.

**Note on Other Policy Types:** While SCPs handle permission boundaries, other policy types address different needs:
*   **Tag Policies:** Used to *standardize* tags across resources (Management Policy). While an SCP *could* deny resource creation if a tag is missing, Tag Policies are generally the primary tool for tag governance.
*   **Backup Policies:** Centrally manage backup plans (Management Policy).
*   **AI Services Opt-Out:** Manage data collection preferences for AI services (Management Policy).

SCPs are a powerful tool focused specifically on setting preventative permission guardrails across the Organization.

**Current Status and Next Steps Summary**

*   **Current Status:** Default `FullAWSAccess` SCP is likely applied at the Root. No custom restrictive SCPs are currently defined or applied.
*   **Immediate Next Steps:**
    1.  Verify the `FullAWSAccess` policy attachment.
    2.  Define and test the Region Restriction SCP (Action Item 2).
    3.  Define and test the Security Service Protection SCP (Action Item 3).
    4.  Begin planning the OU structure to determine appropriate targets for these and future SCPs.

Okay, I will refine sections 6 through 10 using the established pattern, simpler language, and actionable tables where appropriate.

---

## 6. Identity and Access Management (IAM)

### 6.1. Definition

Identity and Access Management (IAM) is about controlling *who* (users, applications, services) can access *what* (AWS resources like servers, databases, storage) and *how* they can interact with them. Getting IAM right is critical for security. The main goal is to give everyone and everything only the minimum permissions needed to do their job (this is called the "principle of least privilege"). This limits potential damage if login details are stolen or someone makes a mistake.

### 6.2. AWS IAM Identity Center (Successor to AWS SSO)

**What it is:** This is the standard and recommended way for *people* to log into AWS accounts.

**Why use it:**
*   Manages all users in one central place.
*   Makes it easier to control access across many AWS accounts.
*   Gives users a simpler login experience (one sign-in for multiple accounts).
*   Can connect to your existing company login system (like Active Directory or Okta).

**Action Plan for IAM Identity Center**

| Priority | Action Item                                      | Description / Rationale                                                                                                                                 | Target Application | Status        | Owner/Assignee | Notes/Considerations                                                                                                                                                                       |
| :------- | :----------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------ | :----------------- | :------------ | :------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **High** | **1. Confirm/Complete IdP Integration**          | Verify or set up the connection between IAM Identity Center and your company's identity provider (IdP) [Specify IdP if known, e.g., Azure AD, Okta, internal SAML]. | IAM Identity Center| **[Needs Checking]** | Cloud Team     | If no central IdP exists, the built-in Identity Center directory can be used initially. Document the chosen method.                                                                         |
| **High** | **2. Define Standard Permission Sets**           | Create reusable sets of permissions (like "Developer," "ReadOnly," "NetworkAdmin") based on job roles, following the least privilege principle.          | IAM Identity Center| Not Started   | Cloud Team     | Start with common roles. Avoid granting full `AdministratorAccess` unless absolutely necessary and well-justified.                                                                         |
| **High** | **3. Map IdP Groups to Permission Sets**         | Connect groups from your company's IdP (e.g., "AppDevTeam-Group") to the Permission Sets created in AWS. Assign access to specific AWS accounts here.      | IAM Identity Center| Not Started   | Cloud Team     | This automates access based on company group membership.                                                                                                                                     |
| **Medium** | **4. Transition Human Users to IAM Identity Center** | Ensure all people who need AWS console or CLI access use IAM Identity Center instead of separate IAM users in member accounts.                            | All Member Accounts| Not Started   | Cloud Team     | Communicate the change. Provide guidance on logging in via the new method. Deactivate/remove old IAM user access after transition. Requires evaluating the user in section 6.3. |

### 6.3. IAM Roles

**What they are:** IAM Roles are used to grant permissions to *AWS services* (like EC2 servers needing to access S3 storage) or *applications* (like code running on a server or Terraform scripts) without needing long-term passwords or keys.

**Why use them:**
*   They provide temporary security credentials, which are much safer than long-term keys.
*   Avoids storing sensitive access keys directly in code or configuration files.

**Action Plan for IAM Roles**

| Priority | Action Item                                | Description / Rationale                                                                                                                             | Target Application             | Status      | Owner/Assignee | Notes/Considerations                                                                                                                               |
| :------- | :----------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------- | :----------------------------- | :---------- | :------------- | :------------------------------------------------------------------------------------------------------------------------------------------------- |
| **High** | **1. Verify Terraform OIDC Role Setup**    | Confirm the IAM Role used by Terraform via OIDC is correctly configured with least-privilege permissions for managing infrastructure.             | Management/Member Accounts     | **Done**    | Cloud Team     | Review permissions periodically.                                                                                                                   |
| **Medium** | **2. Promote Role Usage for Applications** | Ensure new applications deployed on AWS (e.g., on EC2, ECS, Lambda) use IAM Roles to access other AWS services instead of IAM user access keys. | EC2, Lambda, ECS, etc.         | Ongoing     | Dev Teams      | Provide guidance and examples to development teams.                                                                                                |
| **Medium** | **3. Audit for Unnecessary Access Keys**   | Regularly check member accounts for active IAM user access keys. Investigate if they can be replaced with IAM Roles (for applications/services). | All Member Accounts            | Not Started | Cloud Team     | Use IAM Access Advisor to see when keys were last used. Prioritize removing keys associated with applications or services that could use Roles. |

### 6.4. IAM Users

**What they are:** These are individual login identities created directly within an AWS account, often associated with long-term access keys.

**Guideline:** Avoid creating IAM users whenever possible. Use IAM Identity Center for people and IAM Roles for applications/services. If an IAM user *must* be created (e.g., for a specific service that doesn't support Roles), it needs strong justification and careful management.

**Why avoid them:** Long-term access keys associated with IAM users are a significant security risk if leaked or compromised. Managing key rotation adds overhead.

**Action Plan for IAM Users**

| Priority | Action Item                                        | Description / Rationale                                                                                                                                                                                           | Target Application         | Status        | Owner/Assignee | Notes/Considerations                                                                                                                                                                                          |
| :------- | :------------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------------------------- | :------------ | :------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **High** | **1. Evaluate Existing IAM User (`muhammad.taufik`)** | Determine the purpose of the `muhammad.taufik@big.go.id` IAM user in the `Piksel Development` account. Is it for human console access or a service?                                                              | Piksel Development Account | **Done** (Identified) | Cloud Team     | User exists with `AdministratorAccess`.                                                                                                                                                                     |
| **High** | **2. Transition or Secure the User**               | **If human access:** Transition this user to use IAM Identity Center (Action 6.1.4) and deactivate/delete the IAM user. **If service access:** Investigate if an IAM Role can be used instead (Action 6.2.2/6.2.3). | Piksel Development Account | Not Started   | Cloud Team     | This is a critical step to reduce risk.                                                                                                                                                                     |
| **High** | **3. Apply Least Privilege (If User Must Remain)** | If the IAM user absolutely cannot be replaced, remove `AdministratorAccess`. Create a specific policy granting only the minimum permissions needed for its task. Ensure MFA is enabled and keys are rotated.   | Piksel Development Account | Not Started   | Cloud Team     | Document the justification for keeping the user and the controls applied. This should be a rare exception.                                                                                                   |

---

## 7. Billing and Cost Management

This section covers how AWS costs are tracked, managed, and controlled. Good cost management provides visibility into spending, helps prevent unexpected bills through alerts, and allows costs to be accurately assigned to different projects, teams, or environments.

### 7.1 Cost Allocation Tags

**What they are:** These are labels (tags) you apply to your AWS resources (like servers, databases). You can then use these tags in the AWS Billing console to filter and group costs.

**Why use them:** They let you see costs broken down by business context, like which project or environment is spending the most. This requires tags to be defined (see Section 8) and then *activated* in the Billing console.

**Action Plan for Cost Allocation Tags**

| Priority | Action Item                                 | Description / Rationale                                                                                                                            | Target Application   | Status      | Owner/Assignee | Notes/Considerations                                                                                                                                    |
| :------- | :------------------------------------------ | :------------------------------------------------------------------------------------------------------------------------------------------------- | :------------------- | :---------- | :------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **High** | **1. Activate Defined Tags for Cost Allocation** | Go to the Billing console in the Management Account and activate the user-defined tags (`Project`, `Environment`, `Owner`, `CostCenter`) as cost allocation tags. | Management Account | Not Started | Cloud Team     | Tags must be created on resources first. Activation can take up to 24 hours to reflect in billing tools. Add `CostCenter` tag definition in Section 8. |

### 7.2 AWS Billing Tools

**What they are:** AWS provides tools like Cost Explorer (for analyzing spending trends) and AWS Budgets (for setting spending limits and alerts).

**Why use them:**
*   **Cost Explorer:** Helps you understand where money is being spent and identify trends or spikes.
*   **AWS Budgets:** Sends alerts when your spending (or forecasted spending) exceeds limits you define, helping prevent surprises.

**Action Plan for Billing Tools**

| Priority | Action Item                                | Description / Rationale                                                                                                                              | Target Application   | Status             | Owner/Assignee | Notes/Considerations                                                                                                                                                            |
| :------- | :----------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------- | :------------------- | :----------------- | :------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Medium** | **1. Define and Configure AWS Budgets**    | Create specific budgets, e.g., for total monthly AWS cost, costs per project (using tags), or costs for specific services. Set up alert notifications. | Management Account | **[Needs Checking]** | Cloud Team     | Start with a simple overall budget. Refine with tag-based budgets once cost allocation tags are active and populated.                                                               |
| **Medium** | **2. Schedule Regular Cost Reviews**       | Set up a recurring meeting or process (e.g., monthly) to review spending patterns and identify optimization opportunities using Cost Explorer.         | Management Account | Not Started        | Cloud Team     | Involve relevant stakeholders (e.g., project owners) if reviewing project-specific costs.                                                                                       |
| **Low**  | **3. Evaluate Need for Cost & Usage Report (CUR)** | Determine if the detailed, hourly/daily billing data provided by CUR is needed for advanced analysis or integration with third-party tools.       | Management Account | Not Started        | Cloud Team     | CUR provides the most granular data but requires setup (S3 bucket) and tools (e.g., Athena, QuickSight, third-party) to analyze effectively. Cost Explorer is sufficient for many needs. |

### 7.3 Third-Party Billing / Credits

**What it is:** This section addresses whether AWS billing is handled directly with AWS or through a reseller/partner, and how any credits are managed.

**Why clarify:** Understanding the billing relationship is important for support, invoicing, and managing potential partner credits or discounts.

**Action Plan for Third-Party Billing**

| Priority | Action Item                                  | Description / Rationale                                                                                             | Target Application   | Status           | Owner/Assignee | Notes/Considerations                                                                                                     |
| :------- | :------------------------------------------- | :------------------------------------------------------------------------------------------------------------------ | :------------------- | :--------------- | :------------- | :----------------------------------------------------------------------------------------------------------------------- |
| **Low**  | **1. Verify Current Billing Arrangement**    | Confirm that billing is currently direct with AWS and document this.                                                | Management Account | **Done** (Assumed) | Cloud Team     | Verify via invoices or the Billing console.                                                                              |
| **N/A**  | **2. Document Process if Using a 3rd Party** | If a decision is made in the future to use a reseller, document the partner details, process, and responsibilities here. | N/A                  | Not Applicable   | Cloud Team     | This is a placeholder for future changes. Include details on permissions the partner might need in the Management Account. |

---

## 8. Tagging Strategy

**Introduction**

Tagging means applying labels (key-value pairs like `Environment:dev`) to your AWS resources. A consistent tagging strategy is essential for organizing resources, tracking costs (as mentioned in Section 7.1), automating tasks (like starting/stopping servers), and sometimes even controlling access. Consistency is the most important part of a good tagging strategy.

### 8.1 Standard Tags

**What they are:** These are the tags that *must* be applied to all resources that support tagging.

**Mandatory Tags:**
*   `Environment`: The stage of the resource (e.g., `dev`, `staging`, `prod`, `shared`).
*   `ManagedBy`: How the resource is managed (e.g., `Terraform`, `Console`).
*   `Project`: The project the resource belongs to (e.g., `Piksel`, `DataAnalytics`).
*   `Owner`: The team or individual responsible (e.g., `Piksel Dev Team`, `jane.doe@example.com`).
*   `CostCenter`: The internal cost center code for financial tracking [Needs Definition].

**Why use them:** These tags provide the basic information needed to understand a resource's purpose, ownership, environment, and cost association.

**Action Plan for Standard Tags**

| Priority | Action Item                            | Description / Rationale                                                                                                | Target Application | Status             | Owner/Assignee | Notes/Considerations                                                                                                                            |
| :------- | :------------------------------------- | :--------------------------------------------------------------------------------------------------------------------- | :----------------- | :----------------- | :------------- | :---------------------------------------------------------------------------------------------------------------------------------------------- |
| **High** | **1. Define and Add `CostCenter` Tag** | Determine the appropriate values for `CostCenter` and add this tag to the standard list and Terraform `common_tags`.       | Terraform Code     | Not Started        | Cloud Team     | Consult with Finance/Management for correct Cost Center values.                                                                                 |
| **Medium** | **2. Refine Tag Values and Definitions** | Review the allowed values for each tag (e.g., specific environment names) and ensure they are clearly documented.        | Documentation      | Partially Done   | Cloud Team     | Ensure the documentation is easily accessible to everyone creating resources.                                                                   |
| **Medium** | **3. Document the Tagging Strategy**   | Create or update a central document explaining the mandatory tags, their allowed values, and the importance of tagging. | Documentation      | Not Started        | Cloud Team     | Include examples and link to enforcement mechanisms (Section 8.2).                                                                              |

### 8.2 Enforcement

**What it is:** Making sure the tagging strategy is actually followed.

**How to enforce:**
*   **Tag Policies (AWS Organizations):** Set rules at the Organization level to require specific tags on resources when they are created.
*   **Infrastructure as Code (IaC):** Build tagging directly into Terraform, or other IaC templates.

**Why enforce:** Prevents resources from being created without proper tags, ensuring data for cost allocation and organization is accurate. Automation reduces mistakes.

**Action Plan for Tag Enforcement**

| Priority | Action Item                               | Description / Rationale                                                                                                                              | Target Application   | Status         | Owner/Assignee | Notes/Considerations                                                                                                                                                            |
| :------- | :---------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------- | :------------------- | :------------- | :------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **High** | **1. Ensure Tags in IaC (Terraform)**     | Verify that the standard tags (including the new `CostCenter`) are consistently applied to all relevant resources defined in Terraform modules/code. | Terraform Code     | **Done** (Initial) | Cloud Team     | Requires ongoing maintenance as new resources/modules are added.                                                                                                                  |
| **Medium** | **2. Define and Enable Tag Policies**     | Create Tag Policies in AWS Organizations to enforce the presence of mandatory tags (e.g., `Environment`, `Project`, `CostCenter`) upon resource creation. | AWS Organizations    | Not Started    | Cloud Team     | Start with non-enforcing mode ("report only") to identify non-compliant resources. Gradually move to enforcement. Test carefully to avoid blocking legitimate resource creation. |

### 8.3 Automation Based on Tags (e.g., Start/Stop Schedules)

**What it is:** Using tags to automatically perform actions on resources, like shutting down development servers outside of business hours to save money.

**Example:** Tag resources with `AutoStartStop: True` and `Schedule: OfficeHours`. An automated process reads these tags and stops/starts the resources accordingly.

**Why do it:** Can significantly reduce costs for resources (like EC2 instances, RDS databases) that don't need to run 24/7, especially in non-production environments.

**Implementation Options:**
*   **AWS Instance Scheduler:** A pre-built solution from AWS using CloudFormation and Lambda. Good starting point.
*   **Custom Scripts (Lambda/EventBridge):** More flexible but requires coding and maintenance.
*   **Third-Party Tools:** Many cost optimization tools offer this feature.

**Action Plan for Tag-Based Automation**

| Priority | Action Item                                  | Description / Rationale                                                                                                                             | Target Application        | Status      | Owner/Assignee | Notes/Considerations                                                                                                                                                              |
| :------- | :------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------- | :------------------------ | :---------- | :------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Medium** | **1. Investigate AWS Instance Scheduler**    | Evaluate the AWS Instance Scheduler solution to see if it meets the requirements for automated start/stop based on tags and schedules.               | Dev/Staging Environments | Not Started | Cloud Team     | Review its features, complexity, and cost.                                                                                                                                      |
| **Medium** | **2. Define Automation Tags and Schedules**  | Decide on the specific tags (e.g., `AutoStartStop`) and schedule definitions (e.g., `OfficeHours`, `WeekendOff`) needed for the automation.           | Documentation           | Not Started | Cloud Team     | Keep it simple initially.                                                                                                                                                         |
| **Low**  | **3. Implement and Test Automation Solution** | Choose an implementation method (e.g., Instance Scheduler) and deploy it. Test thoroughly in the Development environment first before wider rollout. | Development Environment | Not Started | Cloud Team     | Monitor costs before and after implementation to verify savings. Ensure critical development resources needed off-hours have exceptions or are not tagged for stopping. |

---

## 9. Foundational Security Services

**Introduction**

These are essential AWS services that provide logging, monitoring, and tracking of your AWS environment. Enabling and configuring them correctly is fundamental for security visibility, compliance auditing, and responding to security incidents.

**Action Plan for Foundational Security Services**

| Priority | Service              | Why it's Important                                                                                                   | Action Item                                                                                                                                                           | Target Application         | Status             | Owner/Assignee | Notes/Considerations                                                                                                                                                                                               |
| :------- | :------------------- | :------------------------------------------------------------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------------------------- | :----------------- | :------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **High** | **AWS CloudTrail**   | Records API calls (who did what, when, from where). Essential for auditing, security analysis, and troubleshooting.   | **1. Ensure Org-wide Trail Enabled:** Verify CloudTrail is enabled for all accounts via Organizations, logging all regions.                                             | AWS Organizations          | **[Needs Checking]** | Cloud Team     | Ensure it logs to a secure S3 bucket (ideally in a dedicated Log Archive account).                                                                                                                                     |
| **High** | **AWS CloudTrail**   | (Continued)                                                                                                          | **2. Enable Log File Validation:** Turn on log file validation to ensure logs haven't been tampered with.                                                              | CloudTrail Configuration   | **[Needs Checking]** | Cloud Team     | Provides integrity checking for the stored log files.                                                                                                                                                                |
| **High** | **AWS Config**       | Tracks changes to AWS resource configurations. Helps with compliance checks, security analysis, and change management. | **3. Enable AWS Config:** Turn on AWS Config in necessary regions for all relevant accounts (can be done via Organizations). Record configuration changes.                | AWS Organizations/Accounts | **[Needs Checking]** | Cloud Team     | Store configuration history and snapshots in a secure S3 bucket.                                                                                                                                                   |
| **Medium** | **AWS Config**       | (Continued)                                                                                                          | **4. Explore Conformance Packs:** Investigate using pre-built AWS Config rule sets (Conformance Packs) for common standards like CIS Benchmarks or AWS operational best practices. | AWS Config               | Not Started        | Cloud Team     | Can quickly establish baseline compliance checks.                                                                                                                                                                  |
| **High** | **IAM Access Analyzer** | Identifies resources (like S3 buckets, IAM roles) shared with external entities or across accounts.                  | **5. Enable Org-wide Analyzer:** Turn on IAM Access Analyzer at the Organization level to monitor for unintended external or cross-account access.                    | AWS Organizations          | **[Needs Checking]** | Cloud Team     | Helps prevent accidental data exposure or privilege escalation.                                                                                                                                                    |
| **Medium** | **IAM Access Analyzer** | (Continued)                                                                                                          | **6. Review Findings Regularly:** Establish a process to review findings reported by Access Analyzer and take corrective action where needed.                             | Security/Cloud Team Process| Not Started        | Cloud Team     | Archive or resolve findings that are intentional and acceptable. Focus on unexpected public or cross-account access findings.                                                                                    |
| **Medium** | **AWS Security Hub** | Provides a central view of security alerts and compliance status from various AWS services (GuardDuty, Config, etc.). | **7. Evaluate Security Hub:** Consider enabling Security Hub at the Organization level to aggregate findings from CloudTrail, Config, Access Analyzer, GuardDuty, etc. | AWS Organizations          | Not Started        | Cloud Team     | Can simplify security monitoring by providing a single dashboard. Integrates with many AWS security services. Requires enabling underlying services like GuardDuty (threat detection) for maximum benefit. |

---

## 10. Document Maintenance and Review

**Introduction**

This document describes the current state and planned configuration of the AWS Organization. Keeping it up-to-date is important for ensuring everyone understands the setup and that standards are maintained over time.

**Action Plan for Document Maintenance**

| Priority | Action Item                          | Description / Rationale                                                                                                 | Target Application | Status             | Owner/Assignee        | Notes/Considerations                                      |
| :------- | :----------------------------------- | :---------------------------------------------------------------------------------------------------------------------- | :----------------- | :----------------- | :-------------------- | :-------------------------------------------------------- |
| **Ongoing**| **1. Assign Document Ownership**     | Clearly define which team or individual is responsible for maintaining this document.                                    | Documentation      | **Done** (Cloud Team) | Cloud Infrastructure Team | Ensure clarity on responsibility.                     |
| **Medium** | **2. Define Review Cadence**         | Establish how often this document should be formally reviewed and updated (e.g., annually, semi-annually).                | Process            | **Done** (Annually)   | Cloud Team            | Review also upon significant architectural changes.       |
| **High** | **3. Circulate for Initial Review**  | Share this current version (1.1) with relevant stakeholders for feedback and agreement.                                   | Documentation      | Not Started        | Cloud Team            | Include Dev teams, Security, Management as appropriate. |
| **Medium** | **4. Set Reminder for Next Review**  | Schedule a reminder (e.g., in a calendar) for the next formal review cycle based on the defined cadence.                | Calendar/Task System | Not Started        | Cloud Team            | E.g., Set reminder for April 2026.                        |
| **Ongoing**| **5. Update As Changes Occur**       | Update relevant sections of the document whenever significant configuration changes are implemented in the AWS Organization. | Documentation      | Ongoing            | Cloud Team            | Keep the document aligned with the actual state.        |

---

<!-- prettier-ignore-end -->
