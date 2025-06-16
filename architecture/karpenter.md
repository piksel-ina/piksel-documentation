# Karpenter Autoscaling on `piksel-infra`

|             |                           |
| ----------- | ------------------------- |
| **Version** | 1.0                       |
| **Date**    | 2025-06-16                |
| **Owner**   | Cloud Infrastructure Team |
|             |                           |

## 1. Background and Rationale

| Aspect                           | Details                                                                                                                                                                                                                                                                                                                        |
| :------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Scope**                        | Details the configuration and components of the Karpenter autoscaling solution within the AWS EKS Kubernetes cluster (`piksel-dev-cluster`).                                                                                                                                                                                   |
| **Environment**                  | The configuration is standard across all environments (development, staging, production) where Karpenter is deployed. `piksel-dev-cluster` is used as a representative example.                                                                                                                                                |
| **Broader Context**              | This document complements the main EKS cluster design. For a high-level architectural view, refer to: [EKS Cluster Design](https://github.com/piksel-ina/piksel-document/blob/main/architecture/eks-cluster-design.md). Karpenter provides dynamic node provisioning based on workload demands.                                |
| **Purpose of Karpenter**         | Karpenter is a flexible, high-performance Kubernetes cluster autoscaler. It improves application availability and cluster efficiency by rapidly launching right-sized compute resources (EC2 instances) in response to changing application load, without needing to manage EC2 Auto Scaling Groups directly for node scaling. |
| **Compute Strategy**             | Karpenter's controller runs within the EKS cluster in the `karpenter` namespace. It provisions EC2 instances based on defined `NodePools` and `EC2NodeClasses`. IRSA (IAM Roles for Service Accounts) is used for granting the Karpenter controller secure access to AWS APIs.                                                 |
| **Infrastructure as Code (IaC)** | The Karpenter setup, including its IAM roles, SQS queue, and Kubernetes custom resources (`NodePools`, `EC2NodeClasses`), is defined and managed using Terraform.                                                                                                                                                              |
| **Configuration File(s)**        | The primary Terraform configuration for Karpenter can be found within the `piksel-infra` repository, typically under the EKS cluster module (e.g., `piksel-infra/aws-eks-cluster/main.tf` or a dedicated `karpenter.tf` file). Kubernetes manifests for `NodePools` and `EC2NodeClasses` are also managed via Terraform.       |
|                                  |                                                                                                                                                                                                                                                                                                                                |

## 2. Terminology

| Term                                      | Definition                                                                                                                                                                                                                                              |
| :---------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Karpenter Controller**                  | The core component of Karpenter that runs in the cluster, watches for unschedulable pods, and makes decisions to launch or terminate nodes.                                                                                                             |
| **NodePool**                              | A Karpenter Custom Resource Definition (CRD) that defines how Karpenter should provision and manage a set of nodes. It includes constraints like instance types, zones, taints, labels, and disruption settings.                                        |
| **EC2NodeClass**                          | A Karpenter Custom Resource Definition (CRD) specific to AWS. It defines EC2-specific configurations for nodes launched by Karpenter, such as AMIs, security groups, subnets, IAM instance profiles, and block device mappings.                         |
| **Interruption Handling**                 | Karpenter's ability to detect and respond to EC2 instance interruptions (e.g., Spot instance reclamation, scheduled maintenance, ASG termination hooks) by preemptively launching replacement nodes and draining workloads. This involves an SQS queue. |
| **Consolidation**                         | A Karpenter feature that attempts to reduce cluster cost and fragmentation by removing or replacing underutilized/empty nodes, or by replacing more expensive nodes with cheaper alternatives that still meet workload demands.                         |
| **IRSA (IAM Roles for Service Accounts)** | An AWS feature securely vending temporary AWS credentials to Kubernetes Pods (like the Karpenter controller) by mapping Kubernetes Service Accounts to AWS IAM Roles. (Also referenced in general EKS Add-ons documentation).                           |

## 3. Karpenter Architecture and Workflow

This section describes the architecture of the Karpenter deployment within the `piksel-dev-cluster` and how its components interact to provide dynamic node autoscaling.

### Diagram

&nbsp;

<figure>
  <img src="../assets/karpenter.png"
         alt="Karpenter setup diagram for piksel project" width="850" height="auto">
  <figcaption><i>Figure: Karpenter configuration diagram for piksel-dev-cluster</i></figcaption>
</figure>

### Explanations (Referencing Diagram Numbers):

1.  **EKS Cluster (piksel-dev-cluster) & `karpenter` Namespace:**

    - **EKS Cluster:** This is the Kubernetes cluster, identified as `piksel-dev-cluster`. It's the environment where the applications and Karpenter itself run.
    - **`karpenter` Namespace:** Karpenter's components (like its controller deployment) are installed into this dedicated Kubernetes namespace. The Helm chart is configured to create this namespace if it doesn't already exist.

2.  **Deployment & `pod/karpenter-controller`:**

    - This represents the Karpenter controller `Deployment` running within the `karpenter` namespace. The pods are the actual instances of the Karpenter software.
    - **Configuration:** The controller is set up with `1` replica and specific resource requests (CPU: "1", Memory: "2Gi").

3.  **Public ECR:**

    - The Karpenter controller's container image (and the Helm chart itself) is pulled from AWS's Public Elastic Container Registry (ECR) at `oci://public.ecr.aws/karpenter`.

4.  **AWS EKS Control Plane & Cluster Endpoint:**

    - The karpenter-controller needs to communicate with the Kubernetes API server to monitor unschedulable pods, manage nodes, and update Kubernetes resources.
    - This communication happens via the Cluster Endpoint, which is configured in the Karpenter Helm chart values.

5.  **AWS IAM (IRSA Setup):**

    - **EKS OIDC Provider:** The EKS cluster has an OIDC provider. This allows Kubernetes service accounts to assume IAM roles (IAM Roles for Service Accounts - IRSA).
    - **IAM Policy & Role:** Creates a dedicated IAM Role for the Karpenter Controller. This role is granted specific IAM policies that allow Karpenter to:
      - Interact with EC2 (describe instance types, launch/terminate instances, etc. in `ap-southeast-3`).
      - Access SQS for the interruption queue.
      - Get parameters from SSM (e.g., AMI information from `arn:aws:ssm:ap-southeast-3::parameter/aws/service/*`).
    - **IRSA:** The karpenter service account is annotated to "assume" this IAM Role, granting the Karpenter pods the necessary AWS permissions.

6.  **Karpenter Service Account:**

    - A Kubernetes `ServiceAccount` (named `karpenter`) is used by the Karpenter controller pods.
    - As described previously, this service account is linked to the Karpenter Controller IAM Role via IRSA, enabling secure AWS API access from within the pod.

7.  **NodeClass: `default`:**

    - This represents the `EC2NodeClass` Kubernetes custom resource named `default`, which acts as a template for EC2 instances launched by Karpenter.
    - **Key Configurations:**
      - **AMI:** `amiFamily: AL2023` (default to `al2023@v20250505` based on `var.eks_cluster_version`).
      - **Instance IAM Role:** This is the Node IAM Role (created by `module "karpenter"`) assigned to all EC2 instances provisioned by Karpenter. It includes policies like `AmazonSSMManagedInstanceCore`, `AmazonEBSCSIDriverPolicy`, and `AmazonEKS_CNI_Policy`.
      - **EBS Volume:** 120Gi, `gp3` type, encrypted.
      - **Subnet Selector:** Chooses subnets tagged with `karpenter.sh/discovery = var.cluster_name`.
      - **Security Group Selector:** Chooses security groups tagged with `karpenter.sh/discovery = var.cluster_name`.

8.  **Default NodePool:**

    - This is a `NodePool` Kubernetes custom resource named `default`. It defines a group of general-purpose nodes.
    - **Key Configurations:**
      - **References `EC2NodeClass`:** Uses the `default` EC2NodeClass for its underlying instance configuration.
      - **Instance Requirements:** Allows instance categories `c, m, r, t`; CPUs `4-192`; `nitro` hypervisor; generation `>2`; and `amd64` architecture.
      - **Limits:** Can manage up to `10000` total vCPUs.
      - **Disruption & Consolidation:** Nodes are removed if empty (`consolidationPolicy: WhenEmpty`) after 30 seconds (`consolidateAfter: "30s"`).

9.  **GPU NodePool:**

    - This is a `NodePool` Kubernetes custom resource named `gpu`, for GPU-accelerated workloads.
    - **Key Configurations:**
      - **References `EC2NodeClass`:** Also uses the `default` EC2NodeClass.
      - **Instance Requirements:** Specifically allows `g5.xlarge, g5.2xlarge, g5.4xlarge` instance types.
      - **Taints:** Applies `nvidia.com/gpu=true:NoSchedule` to ensure only GPU-requesting pods are scheduled here.
      - **Limits:** Can manage up to `30` total GPUs.
      - **Disruption & Consolidation:** `consolidationPolicy: WhenEmptyOrUnderutilized`, `consolidateAfter: "Never"`.

10. **AWS Systems Manager (SSM):**

    - **Controller Interaction (`get parameter`):** The Karpenter controller uses its IAM role to make `ssm:GetParameter` calls. This is primarily used to resolve AMI IDs based on the `amiFamily` specified in the `EC2NodeClass`.
    - **SSM Agent on Nodes:** EC2 instances launched by Karpenter (via both NodePools, as they use the `default` EC2NodeClass) will have the SSM Agent. This is because the Node IAM Role assigned to these instances includes the `AmazonSSMManagedInstanceCore` policy.

11. **AWS EBS (Elastic Block Store):**

    - EC2 instances provisioned by Karpenter (via the `default` EC2NodeClass referenced by the NodePools) will have their root EBS volumes configured as: 120Gi size, `gp3` type, and encrypted.
    - The `AmazonEBSCSIDriverPolicy` attached to the Node IAM Role allows these nodes to interact with EBS for Kubernetes persistent volumes.

12. **EC2 API (`Describe Resources` & Provisioning):**

    - The Karpenter controller (`pod/karpenter-controller`) interacts heavily with the AWS EC2 API in the `ap-southeast-3` region.
    - Its IAM role grants permissions to:
      - **Describe:** Instance types, AMIs, subnets, security groups, Availability Zones, Spot price history, launch templates. This information is crucial for making intelligent provisioning decisions.
      - **Provision & Manage:** Run, create, delete, and terminate EC2 instances; create/delete tags. This is how Karpenter actually launches and removes nodes from your cluster.

13. **Karpenter Interruption Queue (SQS):**
    - This is an AWS SQS (Simple Queue Service) queue created by the `module "karpenter"`.
    - The Karpenter controller monitors this queue for messages indicating that an EC2 instance it manages is scheduled for interruption (e.g., Spot instance reclamation, scheduled maintenance).
    - Upon receiving a message, Karpenter proactively launches a replacement node and attempts to drain workloads from the interrupting node. This is configured in the Helm values: `interruptionQueue = module.karpenter.queue_name`.

## 4. Key Configurations Summary

This section highlights the critical configuration settings for the Karpenter deployment.

- **Karpenter Controller (Helm Deployment):**
  - **Chart:** `oci://public.ecr.aws/karpenter/karpenter` (version `var.karpenter_helm_chart_version`)
  - **Namespace:** `karpenter`
  - **Service Account:** `karpenter` (linked to `module.karpenter.iam_role_arn` via IRSA)
  - **Interruption Queue:** `module.karpenter.queue_name`
- **`EC2NodeClass: default`:**
  - **AMI Family:** `AL2023` (using `al2023@v20250505` for EKS version `var.eks_cluster_version`)
  - **Node IAM Role:** `module.karpenter.node_iam_role_name`
    - Attached Policies: `AmazonSSMManagedInstanceCore`, `AmazonEBSCSIDriverPolicy`, `AmazonEKS_CNI_Policy`
  - **Root Volume:** 120Gi, `gp3`, encrypted
  - **Subnet Selector:** `tags: {"karpenter.sh/discovery": local.cluster}`
  - **Security Group Selector:** `tags: {"karpenter.sh/discovery": local.cluster}`
- **`NodePool: default`:**
  - **NodeClass Reference:** `default`
  - **Instance Requirements:** Categories `[c, m, r, t]`, CPUs `[4-192]`, Hypervisor `nitro`, Generation `>2`, Arch `amd64`
  - **Limits:** `cpu: 10000`
  - **Disruption:** `consolidationPolicy: WhenEmpty`, `consolidateAfter: "30s"`
- **`NodePool: gpu`:**
  - **NodeClass Reference:** `default`
  - **Instance Requirements:** Types `[g5.xlarge, g5.2xlarge, g5.4xlarge]`
  - **Taints:** `nvidia.com/gpu=true:NoSchedule`
  - **Limits:** `gpu: 30`
  - **Disruption:** `consolidationPolicy: WhenEmptyOrUnderutilized`, `consolidateAfter: "Never"`

## 5. Security Configuration

- **IRSA for Karpenter Controller:** The Karpenter controller pod operates under the `karpenter` Kubernetes Service Account. This service account is associated with the `module IAM Role via IRSA. This role is scoped with least-privilege permissions necessary for EC2 provisioning, SQS queue interaction for interruption handling, and SSM parameter access for AMI resolution.
- **IRSA for Provisioned Nodes (Node IAM Role):** EC2 instances launched by Karpenter are assigned the IAM Role. This role grants the nodes permissions required by the kubelet, VPC CNI plugin, EBS CSI driver, and SSM agent.
- **Namespace Isolation:** Karpenter's core components are deployed within the dedicated `karpenter` namespace, providing logical separation from other applications and system components.
- **Network Security for Nodes:** The `EC2NodeClass` defines subnet and security group selectors based on tags (`karpenter.sh/discovery = cluster_name`). This ensures that Karpenter launches nodes into pre-approved network segments with appropriate security group rules.
- **Data Encryption:** Root EBS volumes for provisioned nodes are configured to be encrypted, enhancing data-at-rest security.

## 6. Related Documents

- [EKS Cluster Design](./eks-cluster-design.md)
- [EKS Cluster Add-ons on `piksel-infra`](./eks-addons.md)
- [Karpenter Official Documentation](https://karpenter.sh/)
- AWS ECR Public Gallery: [Karpenter Helm Chart](https://gallery.ecr.aws/karpenter/karpenter)
