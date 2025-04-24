## 1. Overview

This document outlines the networking infrastructure for the Piksel project, optimized for EKS deployment.

## 2. Network Architecture

<!-- prettier-ignore-start -->
```bash
VPC (10.0.0.0/16)
├── Availability Zone A
│   ├── Public Subnet       (10.0.0.0/24)
│   │   └── Resources: NAT Gateway, ALB
│   ├── Private App Subnet  (10.0.1.0/24)
│   │   └── Resources: EKS nodes
│   └── Private Data Subnet (10.0.2.0/24)
│       └── Resources: RDS, ElastiCache
├── Availability Zone B
│   ├── Public Subnet       (10.0.3.0/24)
│   │   └── Resources: NAT Gateway, ALB
│   ├── Private App Subnet  (10.0.4.0/24)
│   │   └── Resources: EKS nodes
│   └── Private Data Subnet (10.0.5.0/24)
│       └── Resources: RDS, ElastiCache
└── VPC Endpoints
    ├── Gateway Endpoints: S3, DynamoDB
    └── Interface Endpoints: ECR, CloudWatch, SSM
```
<!-- prettier-ignore-end -->

## 3. Subnet Configuration

### 3.1 Public Subnets

| Subnet   | CIDR Block  | AZ  | Purpose          |
| -------- | ----------- | --- | ---------------- |
| Public A | 10.0.0.0/24 | A   | NAT Gateway, ALB |
| Public B | 10.0.3.0/24 | B   | NAT Gateway, ALB |

**Configuration:**

- Internet Gateway attached
- Route table includes route to Internet Gateway
- Tagged for AWS Load Balancer Controller discovery

### 3.2 Private Application Subnets

| Subnet        | CIDR Block  | AZ  | Purpose   |
| ------------- | ----------- | --- | --------- |
| Private App A | 10.0.1.0/24 | A   | EKS nodes |
| Private App B | 10.0.4.0/24 | B   | EKS nodes |

**Configuration:**

- Route table includes route to NAT Gateway
- Required EKS cluster tags:
  - `kubernetes.io/cluster/<cluster-name>: shared`
  - `kubernetes.io/role/internal-elb: 1`

### 3.3 Private Data Subnets

| Subnet         | CIDR Block  | AZ  | Purpose          |
| -------------- | ----------- | --- | ---------------- |
| Private Data A | 10.0.2.0/24 | A   | RDS, ElastiCache |
| Private Data B | 10.0.5.0/24 | B   | RDS, ElastiCache |

## 4. Network Components

### 4.1 VPC Endpoints

**Gateway Endpoints (Free):**

- S3: For container images, logs, backups, EO data
- DynamoDB: For application data if needed
- Example: When EKS pods need to access S3 for EO data storage

**Interface Endpoints (Paid):**

- ECR: Container image pulling
- CloudWatch: Log collection
- Systems Manager: Cluster management
- Example: When EKS nodes need to pull images from ECR

### 4.2 Security Groups

```yaml
EKS Cluster SG:
  Inbound:
    - Allow all from node group SG
  Outbound:
    - Allow all

Node Group SG:
  Inbound:
    - Allow all from cluster SG
    - Allow 443 from ALB SG
  Outbound:
    - Allow all

ALB SG:
  Inbound:
    - Allow 80/443 from internet
  Outbound:
    - Allow all to node group SG

Database SG:
  Inbound:
    - Allow database port from node group SG
  Outbound:
    - Allow all
```

## 5. Deployment Strategy

### Phase 1: Base Network Setup

1. VPC and subnet creation
2. Internet Gateway deployment
3. NAT Gateway setup
4. VPC Endpoint configuration
5. Initial security group creation
6. Route table configuration

### Phase 2: EKS Network Integration

1. Add EKS-required subnet tags
2. Deploy AWS Load Balancer Controller
3. Configure node security groups
4. Set up cluster IAM roles with necessary networking permissions
5. Configure CoreDNS for cluster DNS
6. Deploy CNI plugin with custom networking (if required)

### Phase 3: Application Network Configuration

1. Configure ingress resources
2. Set up service mesh (if needed)
3. Implement network policies
4. Configure cross-namespace communication

## 6. Network Security Measures

### 6.1 Network ACLs

- Public subnets: Allow HTTP/HTTPS inbound
- Private subnets: Deny direct internet inbound
- All subnets: Allow established connections

### 6.2 Monitoring

- VPC Flow Logs enabled
- CloudWatch Logs integration
- 30-day retention period
- Network traffic metrics collection

### 6.3 Cost Optimization

1. Use VPC endpoints to reduce NAT Gateway traffic
2. Implement proper auto-scaling
3. Monitor and optimize ALB usage
4. Regular review of network flow logs for optimization opportunities
