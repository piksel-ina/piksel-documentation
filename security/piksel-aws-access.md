# Piksel AWS Access Management Guide

This document outlines how to set up and manage AWS access for the Piksel project. Follow these steps to ensure proper access configuration for new team members.

## Account Structure

Piksel uses a multi-account AWS structure:

- **Management Account**: for organizational management and billing
- **Development Account**: where all development resources are deployed

## Access Methods: AWS SSO

AWS SSO provides secure, centralized access to all Piksel AWS accounts.

### Initial Setup for New Developers

1. An administrator will send you an invitation email from AWS SSO
2. Follow the link to create your SSO credentials
3. You'll be granted access to the Piksel Development account.

### Configuring AWS CLI with SSO

- Configure SSO for CLI access

```bash
aws configure sso
```

- When prompted:

```bash
SSO session name: # put custom session name
SSO start URL: https://piksel-ina.awsapps.com/start
SSO region: ap-southeast-3
SSO registration scopes [sso:account:access]: #can leave it empty
```

- Input account ID and role as provided by administrator
- Input profile name (e.g. `piksel-net-dev`), it will be used as login profile

### Using SSO with AWS CLI

Before using AWS CLI commands or Terraform, you need to authenticate:

```bash
# Log in to AWS SSO (opens browser for authentication)
aws sso login --profile <profile-name>

# Verify your identity
aws sts get-caller-identity --profile <profile-name>
```

### Using SSO with Terraform

When using Terraform, you must specify your SSO profile:

```bash
# Option 1: Set environment variable
export AWS_PROFILE=<profile-name>
terraform plan

# Option 2: Use terraform with profile flag
terraform plan -var "aws_profile=<profile-name>"
```

## OIDC Documentation

Piksel uses OpenID Connect (OIDC) to allow GitHub Actions workflows to securely authenticate with AWS without storing long-lived credentials. This setup enables CI/CD pipelines to deploy resources to AWS directly from GitHub repositories.

### Implementation Details

OIDC Provider: Configured in the Piksel Development AWS account
IAM Role: GitHubActionsOIDC with AdministratorAccess policy (for initial development phase)

### How It Works

GitHub Actions workflow requests a token from GitHub's OIDC provider
The workflow presents this token to AWS to assume the GitHubActionsOIDC role
AWS validates the token against the configured OIDC provider
If valid, AWS returns temporary credentials that the workflow can use

### Next Steps

As the project matures:

- Create separate roles for different repositories with specific permissions
- Add branch restrictions (e.g., only allow production deployments from main branch)
- Implement approval workflows for sensitive deployments
