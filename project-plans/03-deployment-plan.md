# Piksel Deployment Plan

## Overview

The deployment plan for `piksel` is influenced by the configuration found in [auspatious/de-terraform](https://github.com/auspatious/de-terraform). This plan utilizes a three-repository structure:

1.  **`piksel-infra`:** Terraform for AWS infrastructure and core service bootstrapping.
2.  **`piksel-core`:** Application `Dockerfiles` and CI/CD for building images and publishing them to Amazon ECR.
3.  **`piksel-apps`:** Kubernetes manifests for GitOps-driven application deployment via FluxCD.

## Deployment Stacks

This deployment involves numerous components. Their roles and organization within the deployment stacks are as follows:
Okay, here's a brief document outlining the deployment stack and its relation to your repositories:

### Deployment 1: Infrastructure & Core Services (`piksel-infra`)

- **Tool:** Terraform
- **Provider:**
  - Defines providers for AWS, Kubernetes, Helm, and Kubectl.
  - Cluster Authentication: The kubernetes, helm, and kubectl providers are configured to securely connect to the EKS cluster using its endpoint, a base64 decoded CA certificate (cluster_ca_certificate), and an authentication token
- **Key Outputs/Provisions:**
  - AWS EKS Cluster (Control Plane, Fargate, Karpenter).
  - VPC, Subnets, IAM Roles (for EKS, services, IRSA).
  - S3 Buckets (Public, Artifacts, TerriaMap, Argo Workflows Artifacts).
  - AWS RDS PostgreSQL instance.
  - AWS Secrets Manager (initial secrets for DB, Grafana, JupyterHub, ODC, Argo SSO).
  - Route 53 configuration (referencing existing zone, ACM validation records).
  - ACM Certificates.
  - Initial Kubernetes resources:
    - Namespaces (flux-system, monitoring, hub, odc, stac, db, argo),
    - `db-endpoint` service
    - some K8s Secrets (e.g., Grafana admin, JupyterHub values, ODC DB read, Argo SSO client secret, Argo artifact S3 access credentials, and other application credentials)
    - via Terraform helm:
      - Karpenter (for node auto-scaling)
      - ExternalDNS (for managing DNS records based on Ingress/Services)
  - Deploys Flux to `flux-system`, points to piksel-apps GitOps repository.
- **Purpose:** Establishes the foundational cloud environment and bootstraps essential services.
- **Output**: Running EKS cluster, core AWS services, Flux ready.
- **Dependent on**: Pre-existing Route 53 hosted zone.

### Deployment 2: Application Packaging (`piksel-core`)

- **Tool:** CI/CD Pipelines (GitHub Actions)
- **Action:** On `git push`, trigger automated build and push of Docker images.
- **Purpose:** Creates deployable artifacts for all platform applications.
- **Key Outputs/Provisions:**
  - Versioned application container images (ODC, STAC, custom JupyterHub, etc.) stored in Amazon ECR.

### Deployment 3: Application Deployment & Configuration (`piksel-apps`)

- **Tool:** FluxCD (GitOps)
- **Action:** `git push` to this repository triggers FluxCD to synchronize the EKS cluster state.
- **Key Outputs/Provisions (Deployed to EKS):**
  - Applications:
    - Grafana (uses K8s secret from infra).
    - JupyterHub (uses K8s Helm values from infra; image from core/ECR).
    - ODC (uses K8s secret/IAM from infra; image from core/ECR).
    - STAC (image from core/ECR).
    - TerriaMap (configures S3 access from infra).
- Workflow Engine: Argo Workflows (with DE pipeline definitions).
- Supporting Services: Ingress Controller, ExternalDNS, Cert-Manager.
- Kubernetes configurations: `ConfigMaps`, `Secrets` (synced from AWS Secrets Manager), `Ingresses` (with DNS records created by ExternalDNS in Route 53).
- **Purpose:** Deploys, configures, and manages the lifecycle of all applications and workflows running on the platform.
