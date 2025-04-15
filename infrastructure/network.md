## 1. Overview

This document outlines the networking infrastructure for the Piksel project.

## 2. Network Architecture

<!-- prettier-ignore-start -->
```bash
VPC (10.0.0.0/16)
├── Availability Zone A
│   ├── Public Subnet       (10.0.0.0/24)
│   │   └── Resources: NAT Gateway
│   ├── Private App Subnet  (10.0.1.0/24)
│   │   └── Resources: EKS nodes, temporary EC2 instances
│   └── Private Data Subnet (10.0.2.0/24)
│       └── Resources: RDS, ElastiCache
├── Availability Zone B
│   ├── Public Subnet       (10.0.3.0/24)
│   │   └── Resources: NAT Gateway
│   ├── Private App Subnet  (10.0.4.0/24)
│   │   └── Resources: EKS nodes, temporary EC2 instances
│   └── Private Data Subnet (10.0.5.0/24)
│       └── Resources: RDS, ElastiCache
```
<!-- prettier-ignore-end -->

## 3. Subnet Configuration

### 3.1 Public Subnets

| Subnet   | CIDR Block  | Availability Zone | Purpose     |
| -------- | ----------- | ----------------- | ----------- |
| Public A | 10.0.0.0/24 | AZ-a              | NAT Gateway |
| Public B | 10.0.3.0/24 | AZ-b              | NAT Gateway |

**Configuration:**

- Internet Gateway attached
- Route table includes route to Internet Gateway
- Auto-assign public IP enabled

### 3.2 Private Application Subnets

| Subnet        | CIDR Block  | Availability Zone | Purpose                  |
| ------------- | ----------- | ----------------- | ------------------------ |
| Private App A | 10.0.1.0/24 | AZ-a              | EC2 instances, EKS nodes |
| Private App B | 10.0.4.0/24 | AZ-b              | EC2 instances, EKS nodes |

**Configuration:**

- Route table includes route to NAT Gateway
- Tagged for future EKS cluster discovery
- Shared between temporary EC2 instances and future EKS nodes

### 3.3 Private Data Subnets

| Subnet         | CIDR Block  | Availability Zone | Purpose          |
| -------------- | ----------- | ----------------- | ---------------- |
| Private Data A | 10.0.2.0/24 | AZ-a              | RDS, ElastiCache |
| Private Data B | 10.0.5.0/24 | AZ-b              | RDS, ElastiCache |

**Configuration:**

- Route table includes route to NAT Gateway
- Tagged for database subnet groups
- Isolated from direct internet access

## 4. Network Components

### 4.1 NAT Gateways

- **Purpose**: Allow outbound internet access from private subnets
- **Deployment**: One per Availability Zone for high availability
- **Location**: Public subnets (10.0.0.0/24 and 10.0.3.0/24)

### 4.2 Security Groups

| Security Group | Purpose                          | Key Rules                                                    |
| -------------- | -------------------------------- | ------------------------------------------------------------ |
| EC2 App SG     | Control traffic to EC2 instances | Allow SSH from developer IPs; Allow outbound internet access |
| Data SG        | Control traffic to databases     | Allow traffic from EC2 App SG                                |

## 5. Migration Strategy

### 5.1 Phase 1: EC2-Based Testing

- Deploy core application components on EC2 instances in private app subnets
- Configure SSH access for developer team
- Validate core functionality

### 5.2 Phase 2: EKS Deployment

- Deploy EKS cluster using the same private app subnets
- Configure AWS Load Balancer Controller for Kubernetes ingress
- Deploy applications to EKS

### 5.3 Phase 3: Migration Completion

- Gradually shift functionality from EC2 to EKS-hosted services
- Monitor performance and stability
- Decommission EC2 instances when migration is complete

## 6. Network Security Measures

### 6.1 Network ACLs

- Public subnets: Allow SSH inbound from developer IPs only
- Private subnets: Deny direct inbound from internet
- All subnets: Allow established connections

### 6.2 VPC Flow Logs

- Enabled for security monitoring and troubleshooting
- Logs stored in CloudWatch Logs
- Retention period: 30 days
