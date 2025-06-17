# AWS EKS Cluster Setup Guide

|             |                           |
| ----------- | ------------------------- |
| **Version** | 1.0                       |
| **Date**    | 2025-06-17                |
| **Owner**   | Cloud Infrastructure Team |

This guide covers setting up kubectl access and cluster admin permissions for AWS EKS clusters.

## Prerequisites

- AWS CLI installed
- Valid AWS credentials configured
- EKS cluster already created

## AWS CLI Installation

### Linux

```bash
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install

# Verify installation
aws --version
```

### macOS

```bash
# Using Homebrew
brew install awscli

# Or download directly
curl "https://awscli.amazonaws.com/AWSCLIV2.pkg" -o "AWSCLIV2.pkg"
sudo installer -pkg AWSCLIV2.pkg -target /

# Verify installation
aws --version
```

### Windows

```powershell
# Download and run AWS CLI MSI installer from:
# https://awscli.amazonaws.com/AWSCLIV2.msi

# Verify installation
aws --version
```

**Official Documentation:** https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html

## kubectl Installation

### Linux

```bash
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
chmod +x kubectl
sudo mv kubectl /usr/local/bin/

# Verify installation
kubectl version --client
```

### macOS

```bash
# Using Homebrew
brew install kubectl

# Verify installation
kubectl version --client
```

### Windows

```powershell
# Using Chocolatey
choco install kubernetes-cli

# Verify installation
kubectl version --client
```

**Official Documentation:** https://kubernetes.io/docs/tasks/tools/install-kubectl/

## eksctl Installation

### Linux

```bash
curl --silent --location "https://github.com/weaveworks/eksctl/releases/latest/download/eksctl_$(uname -s)_amd64.tar.gz" | tar xz -C /tmp
sudo mv /tmp/eksctl /usr/local/bin

# Verify installation
eksctl version
```

### macOS

```bash
# Using Homebrew
brew tap weaveworks/tap
brew install weaveworks/tap/eksctl

# Verify installation
eksctl version
```

### Windows

```powershell
# Using Chocolatey
choco install eksctl

# Verify installation
eksctl version
```

**Official Documentation:** https://eksctl.io/installation/

## AWS Credentials

On how to setup AWS Credential, please refer to this [**AWS-Identity-Center-Guide**](./02-AWS-identity-center-guide.md).

or, follow the **Official Documentation:** https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-quickstart.html

### Verify AWS Configuration

```bash
# Test AWS credentials
aws sts get-caller-identity

# List available EKS clusters
aws eks list-clusters --region ap-southeast-3
```

## kubeconfig Setup

### Update kubeconfig for EKS Cluster

```bash
aws eks update-kubeconfig --region ap-southeast-3 --name <cluster-name>
```

**Example:**

```bash
aws eks update-kubeconfig --region ap-southeast-3 --name piksel-dev
```

### Verify kubeconfig

```bash
# Check current context
kubectl config current-context

# View kubeconfig
kubectl config view

# Test cluster connection
kubectl cluster-info
kubectl get nodes
```

### Multiple Clusters Management

```bash
# Add additional clusters with custom context names
aws eks update-kubeconfig --region ap-southeast-3 --name piksel-production-cluster --alias production

aws eks update-kubeconfig --region ap-southeast-3 --name piksel-staging-cluster --alias staging

# Switch between contexts
kubectl config use-context production
kubectl config use-context staging
```

**Official Documentation:** https://docs.aws.amazon.com/eks/latest/userguide/create-kubeconfig.html

## Cluster Admin Access

### Check Current Permissions

```bash
# Verify cluster access
kubectl auth can-i "*" "*" --all-namespaces
```

### Grant Admin Access

Use eksctl to add IAM user as cluster admin:

```bash
# Add IAM user as cluster admin
eksctl create iamidentitymapping \
  --cluster <cluster-name> \
  --region ap-southeast-3 \
  --arn arn:aws:iam::<account-id>:user/<username> \
  --group system:masters \
  --username <username>
```

**Example:**

```bash
eksctl create iamidentitymapping \
  --cluster piksel-development-cluster \
  --region ap-southeast-3 \
  --arn arn:aws:iam::123456789012:user/john.doe \
  --group system:masters \
  --username john.doe
```

**Official Documentation:** https://eksctl.io/usage/iam-identity-mappings/

### Required IAM Permissions

Make sure the AWS IAM user has proper permissions to access EKS clusters and perform administrative operations. The user should have appropriate EKS and IAM permissions configured by the AWS administrator.
