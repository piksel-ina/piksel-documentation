# EKS Cluster Add-ons on `piksel-infra`

|             |                           |
| ----------- | ------------------------- |
| **Version** | 1.0                       |
| **Date**    | 2025-06-16                |
| **Owner**   | Cloud Infrastructure Team |
|             |                           |

## 1. Background and Rationale

| Aspect                           | Details                                                                                                                                                                                                                                                                                                    |
| :------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Scope**                        | Details the configuration and components of various add-ons within AWS EKS Kubernetes clusters, including those in the `kube-system` namespace and other critical operational add-ons like ExternalDNS.                                                                                                    |
| **Environment**                  | The configuration is standard across all environments (development, staging, production). `piksel-dev-cluster` is used as a representative example.                                                                                                                                                        |
| **Broader Context**              | For a high-level architectural view, refer to the main design document: [EKS Cluster Design](https://github.com/piksel-ina/piksel-document/blob/main/architecture/eks-cluster-design.md).                                                                                                                  |
| **Purpose of Add-ons**           | EKS add-ons and other cluster services extend Kubernetes functionality for tasks like service discovery, pod networking, storage integration, DNS management, auto-scaling, and load balancing, crucial for a production-grade environment.                                                                |
| **Compute Strategy**             | Key system components and add-ons (e.g., CoreDNS, EBS CSI Controller, ExternalDNS) are deployed using **AWS Fargate** where applicable. This provides a serverless compute model. Other components like `aws-node` or `kube-proxy` run as DaemonSets on EC2 worker nodes. IRSA is used for AWS API access. |
| **Infrastructure as Code (IaC)** | The EKS cluster infrastructure, including its add-ons, is defined and managed using Terraform.                                                                                                                                                                                                             |
| **Configuration File**           | [📑 piksel-infra/aws-eks-cluster/main.tf](https://github.com/piksel-ina/piksel-infra/blob/main/aws-eks-cluster/main.tf), with changes are managed through a standard Terraform stack workflow                                                                                                              |
|                                  |

## 2. Terminology

| Term                                      | Definition                                                                                                                                                                 |
| :---------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **EKS Cluster**                           | Amazon Elastic Kubernetes Service; AWS's managed Kubernetes offering.                                                                                                      |
| **Namespace**                             | A virtual cluster mechanism within Kubernetes used to partition resources.                                                                                                 |
| **Deployment**                            | A Kubernetes resource managing stateless applications, ensuring a specified number of replica Pods are running and handling updates.                                       |
| **Pod**                                   | The smallest deployable unit in Kubernetes, encapsulating one or more containers, storage, and network resources.                                                          |
| **Fargate**                               | An AWS serverless compute engine for containers, allowing Pod execution without direct EC2 instance management.                                                            |
| **Service**                               | A Kubernetes resource defining a stable network endpoint (IP address, DNS name) to access a set of Pods.                                                                   |
| **Service Account**                       | A Kubernetes-native identity assigned to processes within Pods, enabling authenticated interaction with the Kubernetes API or external services (e.g., AWS via IRSA).      |
| **DaemonSet**                             | A Kubernetes resource ensuring that a copy of a Pod runs on all (or a subset of) Nodes in the cluster, suitable for node-local agents.                                     |
| **EKS OIDC Provider**                     | An OpenID Connect identity provider associated with the EKS cluster, enabling AWS IAM to trust identities originating from Kubernetes Service Accounts.                    |
| **AWS IAM Policy**                        | An AWS resource defining permissions for AWS services and resources.                                                                                                       |
| **IRSA (IAM Roles for Service Accounts)** | An AWS feature securely vending temporary AWS credentials to Kubernetes Pods by mapping Kubernetes Service Accounts to AWS IAM Roles.                                      |
| **Assume Role**                           | The AWS Security Token Service (STS) action allowing an entity (like a Service Account) to obtain temporary credentials for an IAM Role.                                   |
| **EBS (Elastic Block Storage)**           | AWS service providing persistent block-level storage volumes.                                                                                                              |
| **VPC (Virtual Private Cloud)**           | An isolated virtual network within AWS for launching resources.                                                                                                            |
| **CNI (Container Network Interface)**     | A standard API allowing container orchestrators like Kubernetes to interface with network providers.                                                                       |
| **CSI (Container Storage Interface)**     | A standard API allowing container orchestrators like Kubernetes to interface with storage systems like EBS.                                                                |
| **EKS Add-ons**                           | Managed packages of operational software for Kubernetes clusters, installable and maintainable via the EKS API (e.g., CoreDNS, VPC CNI).                                   |
| **Route53**                               | Amazon Route 53 is a scalable and highly available Domain Name System (DNS) web service.                                                                                   |
| **Helm**                                  | A package manager for Kubernetes, which helps deploy and manage applications.                                                                                              |
| **Cross-Account IAM Role**                | An IAM role in one AWS account that trusts entities (users or roles) from another AWS account, allowing them to assume the role and access resources in the first account. |

## 3. EKS Add-ons in `kube-system`

While EKS manages the core Kubernetes control plane, add-ons provide essential operational capabilities. They extend the cluster's functionality for tasks like service discovery (DNS), pod networking, and storage integration. EKS simplifies the installation and lifecycle management of these components.

**Configured Add-ons in kube-system:**

- **CoreDNS:**
  - **Function:** Provides DNS-based service discovery within the cluster. Pods resolve internal service names (e.g., `my-service.my-namespace.svc.cluster.local`) via CoreDNS.
  - **Implementation:** Managed as an EKS Add-on, deployed via a Kubernetes Deployment (for scalability and availability) and accessed through the `kube-dns` Service. Runs on Fargate in this setup.
- **AWS EBS CSI Driver:**
  - **Function:** Enables Kubernetes workloads to dynamically provision and manage AWS EBS volumes for persistent data storage.
  - **Implementation:** Managed as an EKS Add-on. It includes:
    - `ebs-csi-controller`: A Deployment (running on Fargate) that interacts with AWS APIs for volume operations (create, attach, delete). Uses IRSA for AWS permissions.
    - `ebs-csi-node`: A DaemonSet running on EC2 worker nodes to perform node-specific volume mounting/unmounting.
- **Amazon VPC CNI Plugin (aws-node):**
  - **Function:** Integrates Kubernetes pod networking with the AWS VPC, assigning routable VPC IP addresses directly to Pods.
  - **Implementation:** Managed as an EKS Add-on. Primarily runs as a DaemonSet (`aws-node`) on EC2 worker nodes. Uses IRSA to obtain AWS permissions for managing network interfaces (ENIs). Note: Fargate networking integrates differently but relies on the CNI concept.
- **kube-proxy:**
  - **Function:** A core Kubernetes network component that maintains network rules on each node, enabling traffic routing for Kubernetes Services.
  - **Implementation:** Managed as an EKS Add-on, running as a DaemonSet on EC2 worker nodes.

## 4. Kube-system Diagram

### Diagram

&nbsp; <figure>
<img src="../assets/kube-system.png"
         alt="kube-system deployment diagram for piksel project" width="850" height="auto">

<figcaption><i>Figure: kube-system configuration diagram</i></figcaption>

</figure>

### Explanations (Referencing Diagram Numbers):

1. **Cluster Scope:**

   - Represents the EKS Cluster (e.g., `piksel-dev-cluster`), focusing on the `kube-system` namespace.

2. **CoreDNS Deployment:**

   - Manages the CoreDNS pods (Add-on) providing cluster DNS.

3. **CoreDNS on Fargate:**

   - Illustrates CoreDNS pods executing on the Fargate serverless platform.
   - Each Fargate pod is configured with specific CPU and memory requests (what it needs to start) and limits (the maximum it can consume) to ensure predictable performance and resource allocation.

4. **kube-dns Service:**

   - The kube-dns service acts as the cluster's internal DNS server address.
   - When applications need to resolve a service name within the cluster, they query this service, which then forwards the request to one of the running CoreDNS pods

5. **EBS-CSI-controller Deployment:**

   - The EBS CSI controller interacts with AWS to manage Elastic Block Store (EBS) volumes.
   - When an application requests persistent storage, this controller handles the creation and attachment of the necessary EBS volume.
   - It's configured to use a specific identity (Service Account Role ARN) to securely interact with AWS APIs.

6. **EBS-CSI-controller on Fargate:**

   - Like the CoreDNS pods, the EBS-CSI-controller pods also run on AWS Fargate.

7. **ebs-csi-controller Service Account:**

   - It allows these pods to authenticate within the Kubernetes cluster
   - To be linked with AWS IAM permissions so they can securely manage AWS EBS resources without needing hardcoded credentials.

8. **DaemonSets (for EC2 Nodes):**

   - Represents Add-on components (`aws-node`, `kube-proxy`, `ebs-csi-node`) deployed via DaemonSets to run on each EC2 worker node.
   - _Note_: Since Fargate abstracts away the concept of individual nodes, these DaemonSets primarily apply and become active when traditional EC2 worker nodes are added to the cluster. Fargate manages equivalent functionality internally.

9. **aws-node Service Account:**

   - The Kubernetes identity used by the VPC CNI (`aws-node`) pods. Linked via IRSA to an AWS IAM Role (granting permissions).

10. **EKS OIDC Provider & Trust:**

    - The mechanism enabling trust between the EKS cluster and AWS IAM for the IRSA process.

11. **AWS IAM Policies:**

    - EBS CSI Policy: Defines the specific AWS actions (like creating, attaching, describing EBS volumes) that the EBS CSI controller is allowed to perform (using its service account and an assumed role).
    - VPC CNI Policy: Defines the specific AWS actions (like managing network interfaces) that the aws-node pods are allowed to perform for pod networking on EC2 nodes.
    - These policies are attached to IAM Roles, which are then linked to the Kubernetes Service Accounts via the OIDC trust

12. **Assume Role Action:**

    - The STS process where Kubernetes Service Accounts exchange their identity token (via OIDC) for temporary AWS credentials associated with their designated IAM Role and Policies.

13. **Elastic Block Storage (EBS):**

    - The AWS service providing the underlying block storage volumes.

14. **VPC:**
    - The AWS Virtual Private Cloud network hosting the EKS cluster and related resources.

## 5. Other Cluster Add-ons

Beyond the `kube-system` namespace, other add-ons are deployed to provide extended functionalities.

### ExternalDNS

- **Function**: ExternalDNS synchronizes exposed Kubernetes Services and Ingresses with DNS providers. In this setup, it manages DNS records in AWS Route53 hosted zones located in a centralized Shared AWS Account, enabling automated public DNS record creation for applications.
- **Implementation**:
  - **Namespace**: Deployed in the `aws-external-dns-helm` namespace.
  - **Deployment Method**: Typically deployed via a Helm chart.
  - **Compute**: Pods (`pod/aws-external-dns`) run on AWS Fargate, leveraging Fargate profiles for scheduling.
  - **Service Account**: Utilizes a dedicated Kubernetes service account (`external-dns`) configured with IRSA.
- **Cross-Account DNS Management**:
  - The `external-dns` in the EKS cluster's AWS account (Account 1 - Dev) is mapped via IRSA to an IAM Role.
  - This IRSA role has a policy allowing it to assume a Cross account role in the Shared AWS Account.
  - The cross account role in the Shared Account trusts IRSA role and has an attached IAM policy granting permissions to manage records in specific Route53 Hosted Zones.
  - This setup allows ExternalDNS to securely update DNS records in a different AWS account without embedding credentials.

### External DNS Diagram

&nbsp; <figure>
<img src="../assets/externalDNS.png"
         alt="EksternalDNS deployment diagram for piksel project" width="850" height="auto">

<figcaption><i>Figure: EksternalDNS configuration diagram</i></figcaption>

</figure>

**Explanations (Referencing Diagram Numbers):**

1.  **EKS Cluster & Namespace (Dev Account - Account 1):**
    - Represents the `piksel-dev-cluster` EKS cluster.
    - The `external-DNS` controller is deployed within the `aws-external-dns-helm` namespace.
2.  **ExternalDNS Pod on Fargate (Dev Account - Account 1):**
    - Illustrates the `pod/aws-external-dns` running on the AWS Fargate serverless platform.
    - Fargate manages the underlying infrastructure for this pod.
3.  **Centralized Route53 Hosted Zones (Shared Account):**
    - The target AWS Route53 service where public DNS records are managed.
    - Resides in a separate, centralized "Shared Account" for DNS management.
4.  **Cross Account Role & Route53 Policy (Shared Account):**
    - An IAM Role (e.g., `CrossAccount-Route53-UpdateRole-Shared`) exists in the Shared Account.
    - This role has an attached IAM policy granting necessary permissions to interact with Route53 (e.g., `ChangeResourceRecordSets`, `ListHostedZones`, `ListResourceRecordSets` for the relevant hosted zones).
    - Its trust policy allows the `IRSA-ExternalDNS-Role-Dev` from Account 1 (Dev) to assume it.
5.  **Cross Account Policy (Dev Account - Account 1):**
    - The IAM Role associated with the `external-dns` service account (`IRSA-ExternalDNS-Role-Dev`) in the Dev Account has an IAM policy.
    - This policy includes the `sts:AssumeRole` permission, allowing it to assume the `CrossAccount-Route53-UpdateRole-Shared` in the Shared Account.
6.  **EKS OIDC Provider & Trust (Dev Account - Account 1):**
    - The EKS OIDC provider for `piksel-dev-cluster`.
    - The `IRSA-ExternalDNS-Role-Dev` trusts this OIDC provider, enabling the `external-dns` Kubernetes service account to assume this IAM role.
7.  **ExternalDNS Service Account & AssumeRole Action (Dev Account - Account 1 & Shared Account):**
    - The `pod/aws-external-dns` runs under the `external-dns` Kubernetes service account.
    - Via IRSA, this service account assumes the `IRSA-ExternalDNS-Role-Dev`.
    - The `IRSA-ExternalDNS-Role-Dev` then performs an `sts:AssumeRole` action to obtain temporary credentials for the `CrossAccount-Route53-UpdateRole-Shared` in the Shared Account.
8.  **Watch Kubernetes Resources (Dev Account - Account 1):**
    - The ExternalDNS controller continuously monitors Kubernetes Ingress and Service resources within the `piksel-dev-cluster` for specific annotations or hostname configurations that indicate a DNS record should be created or updated.
9.  **Update Route53 Records (Shared Account):**
    - Using the assumed role credentials from the Shared Account, ExternalDNS makes API calls to AWS Route53 to create, update, or delete DNS records in the centralized hosted zones, reflecting the state of the exposed Kubernetes resources.

## 5. Security Configuration

### Implemented Security Measures:

- **IRSA (IAM Roles for Service Accounts):** Employed for `ebs-csi-controller`, `aws-node`, `external-dns` Service Accounts. This grants necessary AWS permissions securely without embedding static credentials in the cluster.
- **Least Privilege IAM Policies:** The IAM policies attached to the roles used by IRSA are scoped to include only the permissions required for the respective component's operation.
- **Namespace Isolation:** Namespaces like `kube-system` and `aws-external-dns-helm` provide logical separation between system components and user application workloads.
- **Dedicated Service Accounts:** Utilizing distinct Service Accounts for different components allows for fine-grained permission assignment via IRSA.
- **Fargate Workload Isolation:** Running pods on Fargate benefits from the strong isolation boundaries inherent to the Fargate platform, managed by AWS.
- **Cross-Account Access Control:** For ExternalDNS, the cross-account access is strictly controlled via IAM roles and trust policies, ensuring the Dev account can only perform actions permitted by the role in the Shared Account.

### Potential Future Enhancements / Considerations:

- **Network Policies:** Consider implementing Kubernetes Network Policies within `kube-system` to enforce stricter network traffic rules between system pods, further enhancing isolation if needed.
- **IAM Policy Auditing:** Periodically review and audit the permissions defined in the IAM policies used by IRSA to ensure they remain appropriate and adhere to the principle of least privilege over time.

## 6. Related Documents

- [Multi Account Configuration](./hub-spoke-design.md)
- [Spoke Account Configuration](./spoke-network-design.md)
- [EKS Cluster Design](./eks-cluster-design.md)
