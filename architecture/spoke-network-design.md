# Piksel AWS Spoke Account Networking

|             |                           |
| ----------- | ------------------------- |
| **Version** | 1.0                       |
| **Date**    | 2025-06-07                |
| **Owner**   | Cloud Infrastructure Team |

## 1. Background and Rationale

To support scalable, secure, and cost-effective application deployment, Piksel employs a multi-account AWS hub-and-spoke architecture. This design centralizes shared services and network management while maintaining strong isolation between environments.

- **Multi-Account Structure**  
  Each AWS account (for example, Dev, Staging, Prod) is isolated to minimize risk, simplify compliance, and enable clear cost tracking. Shared services are provided from a central hub account, while workloads run in spoke accounts.

- **Hub-and-Spoke Model**  
  The hub account provides centralized services—such as DNS, ECR, and network transit—consumed by all spoke accounts. This pattern:

  - Reduces duplication of infrastructure.
  - Simplifies network management and security controls.
  - Enables consistent DNS and container image management.

- **Centralized Networking**  
  AWS Transit Gateway (TGW) is used primarily to enable network traffic so that applications in spoke accounts can pull container images from the centralized ECR over a private network, ensuring that images do not traverse the public internet.

- **Infrastructure as Code**  
  All resources are provisioned and managed with Terraform Stacks for consistency, versioning, and auditability. The hub stack is the upstream, and the workload (spoke) stack is the downstream that consumes the outputs of the hub. This enables easier and more consistent transitions from dev to staging to prod, as the hub automatically passes its outputs.

## 2. Centralized DNS and Networking Overview

A centralized DNS and networking architecture ensures secure, scalable connectivity and consistent name resolution across all AWS accounts and environments. The design leverages:

- AWS Transit Gateway for private, cross-account, and cross-VPC routing, especially for centralized ECR access.
- Centralized Route 53 Private Hosted Zones for internal DNS.
- Centralized ECR for container image distribution.
- VPC Flow Logs for network visibility and compliance.
- Custom DHCP options for DNS resolver configuration in spoke accounts.

For more details on multi-account setups, see: [Piksel Hub-Spoke Design](https://github.com/piksel-ina/piksel-document/blob/main/architecture/hub-spoke-design.md)

## 3. Architecture Diagram

<img src="../assets/spoke-network.png" width="800" height="auto">

Below is an explanation of each numbered component in the diagram:

1. **Shared Account**  
   The central AWS account hosting shared services: Transit Gateway, centralized ECR, centralized Route 53 Private Hosted Zones, and inbound resolver endpoints. This account enables secure, scalable sharing of critical infrastructure components across all environments.

2. **IaC Shared Account**  
   Terraform Stack for provisioning and managing all shared resources in the central account, ensuring repeatability and traceability.

3. **Spoke Account**  
   A spoke account where application workloads run. Networking, EKS, and supporting resources are isolated but integrated with the shared account for centralized services.

4. **IaC Spoke Account**  
   A separate Terraform Stack provisions the networking, subnets, NAT Gateway, and EKS resources in the spoke (Dev) account.

5. **VPC CIDR**  
   Each account's VPC uses a unique CIDR block to avoid overlap and ensure routing works correctly. For example:

   - Dev: 10.1.0.0/16
   - Staging: 10.2.0.0/16
   - Prod: 10.3.0.0/16  
     A /16 CIDR block provides 65,536 IP addresses per VPC.

6. **Availability Zone**  
   The diagram shows 2 Availability Zones (AZs) for simplicity, but in production, 3 AZs are recommended for higher availability. To enable this, simply change the `az-count` variable in `deployments.tfdeploy.hcl`.

7. **Public Subnets**  
   Public subnets are created in each AZ for resources like NAT Gateways and load balancers. Each public subnet uses a /24 CIDR block, which provides 256 IP addresses per subnet.

8. **NAT Gateway**  
   Initially, a single NAT Gateway is deployed for cost efficiency. If higher availability is needed, we can deploy one NAT Gateway per AZ by setting `one_nat_gateway_per_az` to true.

9. **Private Subnets**  
   Private subnets are created in each AZ for EKS worker nodes and other internal resources. Each private subnet uses a /18 CIDR block, which provides 16,384 IP addresses per subnet, supporting high node utilization.

10. **Worker Nodes**  
    EKS worker nodes (EC2 instances) run in private subnets, isolated from direct internet access.

11. **EKS Control Plane**  
    The managed Kubernetes control plane (outside the VPC) communicates securely with worker nodes via the Kubernetes API.

12. **Subnet Tags**  
    Private subnets are tagged for EKS and Karpenter discovery, ensuring correct placement and scaling of workloads.

13. **VPC Flow Logs**  
    Flow logs are enabled to capture and analyze network traffic for security, audit, and troubleshooting purposes.

**Outside the Account:**

14. **Centralized Route53**  
    Private Hosted Zones managed in the shared account, providing DNS for all associated VPCs and accounts.

15. **Centralized ECR**  
    A single Elastic Container Registry in the shared account, serving as the source for all container images pulled by workloads in spoke accounts over the private network.

## 4. Related Documents

- [Piksel Multi Account Setup](https://github.com/piksel-ina/piksel-document/blob/main/architecture/hub-spoke-design.md)
- [EKS Cluster Setup]()
