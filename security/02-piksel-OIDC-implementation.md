# Piksel - OIDC Authentication

## Overview

OpenID Connect (OIDC) is an identity layer built on top of the OAuth 2.0 protocol. It allows client applications to verify user identities based on authentication performed by an authorization server. OIDC uses JSON Web Tokens (JWTs) to securely transmit user information.

## Security Benefits

- Eliminates need for long-term credentials storage
- Uses short-lived tokens for authentication
- Provides centralized access control
- Enables fine-grained permissions
- Improves audit capabilities through token tracking
- Reduces risk of credential exposure

## Piksel Implementation

### Terraform Cloud OIDC

Each Terraform Cloud workspace in Piksel connects to specific AWS accounts using OIDC. This ensures secure, automated deployments without storing AWS credentials.

#### AWS Configuration

1. Follow [AWS Configuration Guide](https://developer.hashicorp.com/terraform/cloud-docs/workspaces/dynamic-provider-credentials/aws-configuration#configure-aws) to:
   - Create OIDC provider
   - Configure IAM role
   - Set up trust policy

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Federated": "arn:aws:iam::ACCOUNT-ID:oidc-provider/app.terraform.io"
      },
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
        "StringEquals": {
          "app.terraform.io:aud": "aws.workload.identity"
        },
        "StringLike": {
          "app.terraform.io:sub": "organization:piksel-ina:project:*:workspace:*"
        }
      }
    }
  ]
}
```

#### Terraform Configuration

1. Follow [Terraform Configuration Guide](https://developer.hashicorp.com/terraform/cloud-docs/workspaces/dynamic-provider-credentials/aws-configuration#configure-hcp-terraform) to:
   - Enable dynamic credentials
   - Configure workspace variables
   - Set up provider authentication

```hcl
provider "aws" {
  region = "ap-southeast-3"
}
```

### GitHub Actions OIDC

Piksel uses OIDC with GitHub Actions for secure ECR image pushes.

#### Setup Steps

1. Follow [GitHub AWS OIDC Guide](https://docs.github.com/en/actions/security-for-github-actions/security-hardening-your-deployments/configuring-openid-connect-in-amazon-web-services) to:
   - Create OIDC provider for GitHub
   - Configure IAM role
   - Set up GitHub environment

Example IAM Role Trust Policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Federated": "arn:aws:iam::ACCOUNT-ID:oidc-provider/token.actions.githubusercontent.com"
      },
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
        "StringLike": {
          "token.actions.githubusercontent.com:sub": "repo:piksel-ina/*"
        }
      }
    }
  ]
}
```

## Security Considerations

### Best Practices

1. Implement least privilege access

   - Restrict IAM role permissions
   - Use conditional statements in trust policies
   - Limit token lifetime

2. Regular Monitoring

   - Review CloudTrail logs
   - Monitor assumed role usage
   - Track failed authentication attempts

3. Maintenance
   - Rotate trust relationships periodically
   - Review and update policies
   - Remove unused OIDC providers

### Related Documents

- [AWS Identity Center Guide](../operations/02-AWS-identity-center-guide.md)
- [AWS Organization Security Guidelines](./01-piksel-AWS-Organization-Foundational-Security-Guidelines.md)
