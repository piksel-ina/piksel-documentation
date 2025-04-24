# AWS Identity Center - Operational Guide

## Overview

Piksel implements AWS Organizations with multiple accounts to ensure proper security boundaries and resource isolation. Each environment (development, staging, production) operates in separate AWS accounts managed through AWS Identity Center (formerly AWS SSO).

For detailed information about our AWS Organizations structure and security guidelines, refer to [Piksel - AWS Organization Foundational Security Guidelines](../security/Piksel%20-%20AWS%20Organization%20Foundational%20Security%20Guidelines.md)

## Creating New AWS Users

### Administrator Side

1. Access AWS Identity Center console
2. Navigate to Users > Add user
3. Fill required information:
   - Username (email format)
   - First and last name
   - Email address
4. System automatically sends invitation email to new user

**CLI Method**:

```bash
aws identitystore create-user \
    --identity-store-id d-xxxxxxxxxx \
    --user-name "user@piksel.com" \
    --name "GivenName=John,FamilyName=Doe" \
    --emails "Value=user@piksel.com,Type=Work"
```

### User Side - Initial Setup

1. Receive invitation email
2. Click activation link
3. Set password
4. Configure MFA (required)

## Adding Users to AWS Accounts

### Administrator Side

1. Navigate to AWS accounts in Identity Center
2. Select target account
3. Choose "Assign users or groups"
4. Select appropriate permission set
5. Assign users/groups

**CLI Method**:

```bash
aws sso-admin create-account-assignment \
    --instance-arn arn:aws:sso:::instance/ssoins-xxxxxxxxxx \
    --target-id AWS_ACCOUNT_ID \
    --target-type AWS_ACCOUNT \
    --permission-set-arn PERMISSION_SET_ARN \
    --principal-type USER \
    --principal-id USER_ID
```

## User on Accessing AWS Resources

### Web Console Access

1. Access portal: https://piksel-ina.awsapps.com/start
2. Login with email and password
3. Select account and role
4. Access AWS Console

### AWS CLI Setup and Access

1. Configure AWS CLI with SSO:

```bash
aws configure sso
```

```bash
SSO session name: # put custom session name
SSO start URL: https://piksel-ina.awsapps.com/start
SSO region: ap-southeast-3
SSO registration scopes [sso:account:access]: #can leave it empty
```

- Input account ID and role as provided by administrator
- Input profile name (e.g. `piksel-net-dev`), it will be used as login profile

2. Authenticate for CLI usage:

```bash
# Login (opens browser for authentication)
aws sso login --profile <profile-name>

# Verify identity
aws sts get-caller-identity --profile <profile-name>
```

3. Using SSO with Terraform:

Configure Terraform to use SSO credentials

```bash
# Option 1: Environment variable
export AWS_PROFILE=<profile-name>
terraform plan

# Option 2: Profile flag
terraform plan -var "aws_profile=<profile-name>"
```

## Security Best Practices

- Always use MFA
- Follow least privilege principle when assigning permissions
- Regular access reviews
- Immediate deactivation of departed users
