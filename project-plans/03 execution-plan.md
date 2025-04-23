# 🌏 Piksel Project: Execution Plan

## 1️⃣ - Initial Repository Setup

### Issue 1.1: GitHub and Terraform Organization Creation

- Create Piksel GitHub organization
- Create Terraform Accounts
- Create Terraform Organization

### Issue 1.2: Repository Structure Setup

- **piksel-infra**: Initialize repository with README and basic structure

  - Sub-issue 1.2.1: Create directory structure for terraform configurations
  - Sub-issue 1.2.2: Set up branch protection rules

- **piksel-kubernetes**: Initialize repository for complete Kubernetes management

  - Sub-issue 1.2.1: Create directory structure:
    - /terraform - EKS and related infrastructure
    - /clusters - Flux configurations with Kustomize
    - /workloads - Application manifests
  - Sub-issue 1.2.2: Set up branch protection rules
  - Sub-issue 1.2.3: Configure Terraform backend for Kubernetes state

- **piksel-core**: Initialize repository with README and basic structure

  - Sub-issue 1.2.4: Create directory structure:
    - /docker - ODC Dockerfile and compose files
    - /products - Product definitions
    - /scripts - Indexing scripts
    - /docs - Technical documentation

- **piksel-jupyter**: Initialize repository with README and basic structure

  - Sub-issue 1.2.5: Create directory structure:
    - /notebooks - Analysis and examples
    - /config - JupyterHub and Dask configurations
    - /docs - Technical documentation

- **piksel-document**: Initialize repository for project documentation
  - Sub-issue 1.2.6: Create documentation structure
  - Sub-issue 1.2.7: Set up guidelines

## 2️⃣ - Infrastructure Configuration

### Issue 2.1: Terraform Cloud Setup (**piksel-infra**)

- Sub-issue 2.1.1: Configure workspaces for different environments
- Sub-issue 2.1.2: Set up VCS integration with GitHub

### Issue 2.2: AWS Base Infrastructure (**piksel-infra**)

- Sub-issue 2.2.1: Create AWS account structure
- Sub-issue 2.2.2: Configure IAM roles for OIDC authentication
- Sub-issue 2.2.3: Set up IAM Access Analyzer
- Sub-issue 2.2.4: Create IAM activity monitoring and reporting workflow

### Issue 2.3: Shared Resources (**piksel-infra**)

- Sub-issue 2.3.1: Configure core networking (VPC, subnets, routing)
- Sub-issue 2.3.2: Set up internal DNS using Route53 private hosted zones
- Sub-issue 2.3.3: Create DNS migration strategy for future external DNS
- Sub-issue 2.3.4: Create ECR repositories
- Sub-issue 2.3.5: Set up S3 buckets
- Sub-issue 2.3.6: Configure CloudWatch logging
- Sub-issue 2.3.7: Set up RDS instances
- Sub-issue 2.3.8: Configure security groups and access policies
- Sub-issue 2.3.9: Set up backup procedures

### Issue 2.4: Configure EC2 instances for services (**piksel-infra**)

- Sub-issue 2.4.1: Configure EC2 instances for services
- Sub-issue 2.4.2: Set up SSH for Developper

### Issue 2.5: CI/CD for Infrastructure (**piksel-infra**)

- Sub-issue 2.5.1: Create GitHub Actions workflow for terraform validation
- Sub-issue 2.5.2: Set up deployment workflow using OIDC authentication
- Sub-issue 2.5.3: Create infrastructure testing scripts

### Issue 2.6: Infrastructure Documentation (**piksel-infra**)

- Sub-issue 2.6.1: Document network infrastructure architecture and components
- Sub-issue 2.6.2: Create documentation for shared resources configuration
- Sub-issue 2.6.3: Document compute resources setup and management
- Sub-issue 2.6.4: Create infrastructure module usage guides

## 3️⃣ - Core Service Implementation

### Issue 3.1: Container Definitions (piksel-core)

- Sub-issue 3.1.1: Migrate ODC Dockerfile from mini-piksel
- Sub-issue 3.1.2: Update Docker Compose for local development
- Sub-issue 3.1.3: Document container configuration options

### Issue 3.2: Product Definitions (piksel-core)

- Sub-issue 3.2.1: Migrate and update product definitions from mini-piksel
- Sub-issue 3.2.2: Create sample product configurations
- Sub-issue 3.2.3: Document product definition process

### Issue 3.4: Jupyter Environment Setup (piksel-jupyter)

- Sub-issue 3.4.1: Create JupyterHub configuration
- Sub-issue 3.4.2: Configure JupyterLab extensions
- Sub-issue 3.4.3: Set up base environment specifications
- Sub-issue 3.4.4: Configure Dask integration

### Issue 3.5: Analysis Notebooks (piksel-jupyter)

- Sub-issue 3.5.1: Migrate existing notebooks from mini-piksel
- Sub-issue 3.5.2: Create new example notebooks
- Sub-issue 3.5.3: Document notebook usage patterns

### Issue 3.6: Core Service Documentation (**piksel-core, piksel-jupyter**)

- Sub-issue 3.6.1: Document core service architecture
- Sub-issue 3.6.2: Create user guide for core services
- Sub-issue 3.6.3: Update cross-repository documentation in meta repo

## 4️⃣ - Kubernetes Sandbox Implementation

### Issue 4.1: EKS Sandbox Cluster (**piksel-kubernetes**)

- Sub-issue 4.1.1: Create Terraform modules for EKS
  - Base cluster configuration
  - Node groups setup
  - IRSA configuration
  - Integration with shared VPC/networking
- Sub-issue 4.1.2: Set up Terraform Cloud workspace for Kubernetes
- Sub-issue 4.1.3: Create Terraform pipeline for EKS deployment

### Issue 4.2: Flux GitOps Setup (piksel-kubernetes)

- Sub-issue 4.2.1: Install Flux controllers
- Sub-issue 4.2.2: Configure Kustomize-based deployments
- Sub-issue 4.2.3: Set up multi-environment structure
- Sub-issue 4.2.4: Configure Flux notifications

### Issue 4.3: Cluster Add-ons (piksel-kubernetes)

- Sub-issue 4.3.1: Define add-ons in Flux
  - Metrics server
  - AWS Load Balancer Controller
  - External DNS for internal Route53
  - Cluster autoscaler
- Sub-issue 4.3.2: Configure persistent storage classes
- Sub-issue 4.3.3: Set up monitoring stack
  - Issue 4.4: GitOps Workflows (piksel-kubernetes)
- Sub-issue 4.4.1: Create GitHub Actions for:
  - Terraform validation/planning
  - Flux manifests validation
  - Image updates automation
- Sub-issue 4.4.2: Set up environment promotion workflow
- Sub-issue 4.4.3: Configure IAM permissions reporting

### Issue 4.4: GitOps Workflows (piksel-kubernetes)

- Sub-issue 4.4.1: Create GitHub Actions for:
  - Terraform validation/planning
  - Flux manifests validation
  - Image updates automation
- Sub-issue 4.4.2: Set up environment promotion workflow
- Sub-issue 4.4.3: Configure IAM permissions reporting

## 5️⃣ - Enhanced Jupyter with Dask Implementation

### Issue 5.1: Dask-enabled Environment (piksel-jupyter)

- Sub-issue 5.1.1: Update Jupyter environment configurations
- Sub-issue 5.1.2: Configure Dask client settings
- Sub-issue 5.1.3: Set up geospatial processing libraries

### Issue 5.2: Dask Configuration (piksel-jupyter)

- Sub-issue 5.2.1: Create Dask configuration files
- Sub-issue 5.2.2: Set up worker specifications
- Sub-issue 5.2.3: Configure resource limits and scaling

### Issue 5.3: Analysis Implementation (piksel-jupyter)

- Sub-issue 5.3.1: Develop geomedian processing notebooks
- Sub-issue 5.3.2: Create coastline detection workflows
- Sub-issue 5.3.3: Implement WOfS analysis examples

### Issue 5.4: Kubernetes Deployment (piksel-kubernetes)

- Sub-issue 5.4.1: Create Kustomize configurations for JupyterHub
- Sub-issue 5.4.2: Set up persistent volume claims
- Sub-issue 5.4.3: Configure Dask worker deployments

### Issue 5.5: Documentation (**piksel-jupyter**)

- Sub-issue 5.5.1: Document Jupyter with Dask environment setup
- Sub-issue 5.5.2: Create user guide for implemented algorithms
- Sub-issue 5.5.3: Update cross-repository documentation in meta repo

## 6️⃣ - Enhanced Kubernetes for Orchestration

### Issue 6.1: Production EKS Setup (piksel-kubernetes)

- Sub-issue 6.1.1: Configure production node groups
- Sub-issue 6.1.2: Set up advanced networking policies
- Sub-issue 6.1.3: Implement security hardening

### Issue 6.2: Production Add-ons (piksel-kubernetes)

- Sub-issue 6.2.1: Deploy AWS Load Balancer Controller
- Sub-issue 6.2.2: Configure advanced storage classes
- Sub-issue 6.2.3: Set up cluster autoscaling

### Issue 6.3: Workload Management (piksel-kubernetes)

- Sub-issue 6.3.1: Create Kustomize overlays for environments
- Sub-issue 6.3.2: Set up resource quotas and limits
- Sub-issue 6.3.3: Configure horizontal pod autoscaling

### Issue 6.4: Monitoring Stack (piksel-kubernetes)

- Sub-issue 6.4.1: Deploy Prometheus and Grafana
- Sub-issue 6.4.2: Set up custom dashboards
- Sub-issue 6.4.3: Configure alerting rules

## 7️⃣ Website Implementation

### Issue 7.1: Website Structure (piksel-website)

- Sub-issue 7.1.1: Set up static site generator
- Sub-issue 7.1.2: Create base templates
- Sub-issue 7.1.3: Implement responsive design

### Issue 7.2: Documentation Integration (piksel-document)

- Sub-issue 7.2.1: Set up cross-repository documentation structure
- Sub-issue 7.2.2: Create API documentation framework
- Sub-issue 7.2.3: Implement search functionality

### Issue 7.3: Website CI/CD (piksel-website)

- Sub-issue 7.3.1: Configure GitHub Actions
- Sub-issue 7.3.2: Set up S3 deployment
- Sub-issue 7.3.3: Implement CloudFront integration

## 8️⃣ - Geospatial Services Implementation

### Issue 8.1: ODC Services Integration (piksel-core)

- Sub-issue 8.1.1: Integrate Datacube OWS for WMS/WMTS services
- Sub-issue 8.1.2: Configure Datacube Explorer with STAC API
- Sub-issue 8.1.3: Set up ODC service configurations

### Issue 8.2: Service Deployment (piksel-kubernetes)

- Sub-issue 8.2.1: Create service Kustomize configurations
- Sub-issue 8.2.2: Set up service networking
- Sub-issue 8.2.3: Configure service monitoring

### Issue 8.3: Documentation (piksel-core)

- Sub-issue 8.3.1: Create API documentation
- Sub-issue 8.3.2: Document service configurations
- Sub-issue 8.3.3: Write usage guides

## 9️⃣ - Integration and Testing

### Issue 9.1: Integration Testing (piksel-tests)

- Sub-issue 9.1.1: Create piksel-tests repository structure

  - /integration-tests - Cross-service test suites
  - /performance-tests - Load testing and benchmarks
  - /environments - Test environment configurations
  - /docs - Testing documentation

- Sub-issue 9.1.2: Develop cross-service test suites

  - Core service integration tests
  - Jupyter service integration tests
  - Geo-services integration tests
  - End-to-end workflow tests

- Sub-issue 9.1.3: Create integration test environments
  - Local environment setup
  - CI environment configuration
  - Staging environment tests

### Issue 9.2: Performance Testing (piksel-tests)

- Sub-issue 9.2.1: Set up load testing framework

  - Test infrastructure setup
  - Service benchmarking tools
  - Monitoring integration

- Sub-issue 9.2.2: Create performance benchmarks

  - Service-specific benchmarks
  - Cross-service performance tests
  - Resource utilization tests

- Sub-issue 9.2.3: Document performance requirements
  - Service-level objectives (SLOs)
  - Performance acceptance criteria
  - Benchmark baselines

## 🔟 - Deployment and Monitoring

### Issue 10.1: Staging Environment Deployment (**piksel-infra**)

- Sub-issue 10.1.1: Deploy services to Kubernetes staging namespace
- Sub-issue 10.1.2: Validate functionality and integration
- Sub-issue 10.1.3: Perform performance testing

### Issue 10.2: Production Deployment (**piksel-infra**)

- Sub-issue 10.2.1: Deploy services to Kubernetes production namespace
- Sub-issue 10.2.2: Configure production-grade resources
- Sub-issue 10.2.3: Verify all services are operational

### Issue 10.3: Monitoring and Alerting (**piksel-infra**)

- Sub-issue 10.3.1: Configure Prometheus dashboards
- Sub-issue 10.3.2: Set up alerts and notifications
- Sub-issue 10.3.3: Implement log aggregation

### Issue 10.4: Post-Launch Review (**piksel-document**)

- Sub-issue 10.4.1: Collect initial performance metrics
- Sub-issue 10.4.2: Document lessons learned
- Sub-issue 10.4.3: Plan next iteration improvements
