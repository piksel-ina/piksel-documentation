# EKS Cluster: `kube-system` Namespace Configuration Details

|             |                           |
| ----------- | ------------------------- |
| **Version** | 1.0                       |
| **Date**    | 2025-06-09                |
| **Owner**   | Cloud Infrastructure Team |
|             |                           |

## 1. Background and Rationale

| Aspect                           | Details                                                                                                                                                                                                                                                                                                    |
| :------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Scope**                        | Details the configuration and components within the `kube-system` namespace of AWS EKS Kubernetes clusters.                                                                                                                                                                                                |
| **Environment**                  | The configuration is standard across all environments (development, staging, production). `piksel-dev-cluster` is used as a representative example.                                                                                                                                                        |
| **Broader Context**              | For a high-level architectural view, refer to the main design document: [EKS Cluster Design](https://github.com/piksel-ina/piksel-document/blob/main/architecture/eks-cluster-design.md).                                                                                                                  |
| **Purpose of kube-system**       | A namespace reserved by Kubernetes for system objects. Hosts essential services and add-ons required for cluster operation.                                                                                                                                                                                |
| **Compute Strategy**             | Key system components (e.g., CoreDNS, EBS CSI Controller) within `kube-system` are deployed using **AWS Fargate**. This provides a serverless compute model, reducing operational burden (no need to manage EC2 nodes for these services). AWS handles patching and scaling of the Fargate infrastructure. |
| **Infrastructure as Code (IaC)** | The EKS cluster infrastructure, including `kube-system` components, is defined and managed using Terraform.                                                                                                                                                                                                |
| **Configuration File**           | [📑 piksel-infra/aws-eks-cluster/main.tf](https://github.com/piksel-ina/piksel-infra/blob/main/aws-eks-cluster/main.tf), with changes are managed through a standard Terraform stack workflow                                                                                                              |
|                                  |

## 2. Terminology

| Term                                      | Definition                                                                                                                                                            |
| :---------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **EKS Cluster**                           | Amazon Elastic Kubernetes Service; AWS's managed Kubernetes offering.                                                                                                 |
| **Namespace**                             | A virtual cluster mechanism within Kubernetes used to partition resources.                                                                                            |
| **Deployment**                            | A Kubernetes resource managing stateless applications, ensuring a specified number of replica Pods are running and handling updates.                                  |
| **Pod**                                   | The smallest deployable unit in Kubernetes, encapsulating one or more containers, storage, and network resources.                                                     |
| **Fargate**                               | An AWS serverless compute engine for containers, allowing Pod execution without direct EC2 instance management.                                                       |
| **Service**                               | A Kubernetes resource defining a stable network endpoint (IP address, DNS name) to access a set of Pods.                                                              |
| **Service Account**                       | A Kubernetes-native identity assigned to processes within Pods, enabling authenticated interaction with the Kubernetes API or external services (e.g., AWS via IRSA). |
| **DaemonSet**                             | A Kubernetes resource ensuring that a copy of a Pod runs on all (or a subset of) Nodes in the cluster, suitable for node-local agents.                                |
| **EKS OIDC Provider**                     | An OpenID Connect identity provider associated with the EKS cluster, enabling AWS IAM to trust identities originating from Kubernetes Service Accounts.               |
| **AWS IAM Policy**                        | An AWS resource defining permissions for AWS services and resources.                                                                                                  |
| **IRSA (IAM Roles for Service Accounts)** | An AWS feature securely vending temporary AWS credentials to Kubernetes Pods by mapping Kubernetes Service Accounts to AWS IAM Roles.                                 |
| **Assume Role**                           | The AWS Security Token Service (STS) action allowing an entity (like a Service Account) to obtain temporary credentials for an IAM Role.                              |
| **EBS (Elastic Block Storage)**           | AWS service providing persistent block-level storage volumes.                                                                                                         |
| **VPC (Virtual Private Cloud)**           | An isolated virtual network within AWS for launching resources.                                                                                                       |
| **CSI (Container Storage Interface)**     | A standard API allowing container orchestrators like Kubernetes to interface with storage systems like EBS.                                                           |
| **EKS Add-ons**                           | Managed packages of operational software for Kubernetes clusters, installable and maintainable via the EKS API (e.g., CoreDNS, VPC CNI).                              |

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

## 4. Infrastrcuture Diagram

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

## 5. Security Configuration

### Implemented Security Measures:

- **IRSA (IAM Roles for Service Accounts):** Employed for `ebs-csi-controller` and `aws-node` Service Accounts. This grants necessary AWS permissions securely without embedding static credentials in the cluster.
- **Least Privilege IAM Policies:** The IAM policies attached to the roles used by IRSA are scoped to include only the permissions required for the respective component's operation.
- **Namespace Isolation:** The `kube-system` namespace provides logical separation between core system components and user application workloads.
- **Dedicated Service Accounts:** Utilizing distinct Service Accounts for different components allows for fine-grained permission assignment via IRSA.
- **Fargate Workload Isolation:** Running pods on Fargate benefits from the strong isolation boundaries inherent to the Fargate platform, managed by AWS.

### Potential Future Enhancements / Considerations:

- **Network Policies:** Consider implementing Kubernetes Network Policies within `kube-system` to enforce stricter network traffic rules between system pods, further enhancing isolation if needed.
- **IAM Policy Auditing:** Periodically review and audit the permissions defined in the IAM policies used by IRSA to ensure they remain appropriate and adhere to the principle of least privilege over time.
