# Flux CD Bootstrap Guide

|             |                           |
| ----------- | ------------------------- |
| **Version** | 1.1                       |
| **Date**    | 2025-07-24                |
| **Owner**   | Cloud Infrastructure Team |

This guide provides step-by-step instructions for bootstrapping Flux CD on Kubernetes clusters for the Piksel Digital Earth project.

## Prerequisites

### 1. Required Tools

```bash
# Install Flux CLI
curl -s https://fluxcd.io/install.sh | sudo bash

# Verify installation
flux --version
```

### 2. Kubernetes Cluster

- Kubernetes cluster running
- `kubectl` configured and connected to the cluster
- Cluster admin permissions

How to configure kubectl and connect to piksel's AWS Clusters: [Connect-to-EKS-Guide](./04-Connect-to-EKS-cluster-config-guide.md)

### 3. GitHub Repository Access

- GitHub repository: `piksel-ina/piksel-gitops`
- Write permissions to the repository
- A GitHub Personal Access Token (PAT) with the `repo` scope (including write access for deploy keys). Generate it here: GitHub Settings > Developer settings > Personal access tokens > Tokens (classic) > Generate new token.

## Bootstrap Flux

### Step 1: Verify Prerequisites

```bash
# Verify current Kubernetes context to ensure we're on the right cluster
kubectl config current-context

# Check cluster connectivity
kubectl cluster-info

# Check Flux prerequisites
flux check --pre
```

If `kubectl config current-context` shows the wrong cluster, switch contexts using `kubectl config use-context <correct-context-name>` before proceeding. Ensure you have your temporary PAT ready (copy it to your clipboard).

### Step 2: Run Bootstrap Command

Execute the bootstrap command for the target environment. Flux will prompt for the PAT during execution to generate and upload the SSH deploy key automatically. After upload, all operations switch to SSH (PAT is discarded).

e.g., development environment:

```bash
flux bootstrap github \
  --owner=piksel-ina \
  --repository=piksel-gitops \
  --branch=main \
  --path=clusters/development \
  --token-auth=false \
  --read-write-key
```

- **For staging environment** (adjust branch and path as needed):

  ```bash
  flux bootstrap github \
    --owner=piksel-ina \
    --repository=piksel-gitops \
    --branch=staging \
    --path=clusters/staging \
    --token-auth=false \
    --read-write-key
  ```

- **For production environment** (adjust branch and path as needed):

  ```bash
  flux bootstrap github \
    --owner=piksel-ina \
    --repository=piksel-gitops \
    --branch=main \
    --path=clusters/production \
    --token-auth=false \
    --read-write-key
  ```

- **Key Flags Explained**:
  - `--token-auth=false`: Instructs Flux to use SSH instead of PAT for ongoing auth. It generates an SSH key pair and uses the PAT to upload the public key to GitHub as a deploy key.
  - `--read-write-key`: Ensures the generated deploy key has write access, enabling full GitOps capabilities like automated commits and image updates.

During the command, you'll see a prompt like: `Please enter your GitHub personal access token (PAT):`—paste your PAT here. The process is automated and takes seconds.

### Step 3: Verify Bootstrap Success

```bash
# Check Flux system components
kubectl get pods -n flux-system

# Verify GitRepository sync (should show SSH URL)
flux get sources git

# Check Kustomizations status
flux get kustomizations

# Verify detailed status
kubectl get gitrepositories -n flux-system
kubectl get kustomizations -n flux-system
```

## Expected Output

After successful bootstrap, the following output should be visible:

```bash
$ flux get sources git
NAME            REVISION                SUSPENDED       READY   MESSAGE
flux-system     main@sha1:xxxxxxx       False           True    stored artifact for revision 'main@sha1:xxxxxxx'

$ flux get kustomizations
NAME            REVISION                SUSPENDED       READY   MESSAGE
flux-system     main@sha1:xxxxxxx       False           True    Applied revision: main@sha1:xxxxxxx
```

In detailed output (e.g., `kubectl describe gitrepository flux-system -n flux-system`), confirm the URL is SSH-based: `ssh://git@github.com/piksel-ina/piksel-gitops.git`.

## Repository Structure

After bootstrap, the repository structure will include:

```
piksel-gitops/
├── clusters/
│   └── {environment}/
│       └── flux-system/
│           ├── gotk-components.yaml     # Flux components
│           ├── gotk-sync.yaml           # Sync configuration
│           └── kustomization.yaml       # Kustomization manifest
```

## Security Best Practices

1. **Temporary PAT**: Use a short-lived PAT and revoke it immediately after bootstrap.
2. **Key Rotation**: Regularly rotate the generated SSH deploy keys (quarterly recommended) using `flux create secret git` or re-bootstrapping.
3. **Access Monitoring**: Monitor repository access logs and deploy key usage in GitHub.
4. **Principle of Least Privilege**: Ensure the PAT only has `repo` scope; limit to necessary permissions.
5. **Secure Storage**: The private SSH key is stored in a Kubernetes secret—protect your cluster access.
6. **Dedicated Environments**: Use separate branches/paths per environment for isolation.

## Support Resources

- **Flux CD Documentation**: https://fluxcd.io/docs/
- **Repository Issues**: Create issues in the `piksel-ina/piksel-gitops` repository
- **Troubleshooting Guide**: Refer to `docs/troubleshooting.md`

# Flux CD Bootstrap Guide

|             |                           |
| ----------- | ------------------------- |
| **Version** | 1.2                       |
| **Date**    | 2025-07-25                |
| **Owner**   | Cloud Infrastructure Team |

This guide provides step-by-step instructions for bootstrapping Flux CD on Kubernetes clusters for the Piksel Digital Earth project.

## Prerequisites

### 1. Required Tools

```bash
# Install Flux CLI
curl -s https://fluxcd.io/install.sh | sudo bash

# Verify installation
flux --version
```

### 2. Kubernetes Cluster

- Kubernetes cluster running
- `kubectl` configured and connected to the cluster
- Cluster admin permissions

How to configure kubectl and connect to piksel's AWS Clusters: [Connect-to-EKS-Guide](./04-Connect-to-EKS-cluster-config-guide.md)

### 3. GitHub Repository Access

- GitHub repository: `piksel-ina/piksel-gitops`
- Write permissions to the repository
- A GitHub Personal Access Token (PAT) with the `repo` scope (including write access for deploy keys). Generate it here: GitHub Settings > Developer settings > Personal access tokens > Tokens (classic) > Generate new token.

## Bootstrap Flux

### Step 1: Verify Prerequisites

```bash
# Verify current Kubernetes context to ensure we're on the right cluster
kubectl config current-context

# Check cluster connectivity
kubectl cluster-info

# Check Flux prerequisites
flux check --pre
```

If `kubectl config current-context` shows the wrong cluster, switch contexts using `kubectl config use-context <correct-context-name>` before proceeding. Ensure you have your temporary PAT ready (copy it to your clipboard).

### Step 2: Run Bootstrap Command

Execute the bootstrap command for the target environment. Flux will prompt for the PAT during execution to generate and upload the SSH deploy key automatically. After upload, all operations switch to SSH (PAT is discarded).

e.g., development environment:

```bash
flux bootstrap github \
  --owner=piksel-ina \
  --repository=piksel-gitops \
  --branch=main \
  --path=clusters/development \
  --token-auth=false \
  --read-write-key
```

- **For staging environment** (adjust branch and path as needed):

  ```bash
  flux bootstrap github \
    --owner=piksel-ina \
    --repository=piksel-gitops \
    --branch=staging \
    --path=clusters/staging \
    --token-auth=false \
    --read-write-key
  ```

- **For production environment** (adjust branch and path as needed):

  ```bash
  flux bootstrap github \
    --owner=piksel-ina \
    --repository=piksel-gitops \
    --branch=main \
    --path=clusters/production \
    --token-auth=false \
    --read-write-key
  ```

- **Key Flags Explained**:
  - `--token-auth=false`: Instructs Flux to use SSH instead of PAT for ongoing auth. It generates an SSH key pair and uses the PAT to upload the public key to GitHub as a deploy key.
  - `--read-write-key`: Ensures the generated deploy key has write access, enabling full GitOps capabilities like automated commits and image updates.

During the command, you'll see a prompt like: `Please enter your GitHub personal access token (PAT):`—paste your PAT here. The process is automated and takes seconds.

### Step 3: Verify Bootstrap Success

```bash
# Check Flux system components
kubectl get pods -n flux-system

# Verify GitRepository sync (should show SSH URL)
flux get sources git

# Check Kustomizations status
flux get kustomizations

# Verify detailed status
kubectl get gitrepositories -n flux-system
kubectl get kustomizations -n flux-system

# Verify pod scheduling on correct nodes
kubectl get pods -n flux-system -o wide
```

## Expected Output

After successful bootstrap and patch application, the following output should be visible:

```bash
$ flux get sources git
NAME            REVISION                SUSPENDED       READY   MESSAGE
flux-system     main@sha1:xxxxxxx       False           True    stored artifact for revision 'main@sha1:xxxxxxx'

$ flux get kustomizations
NAME            REVISION                SUSPENDED       READY   MESSAGE
flux-system     main@sha1:xxxxxxx       False           True    Applied revision: main@sha1:xxxxxxx
```

In detailed output (e.g., `kubectl describe gitrepository flux-system -n flux-system`), confirm the URL is SSH-based: `ssh://git@github.com/piksel-ina/piksel-gitops.git`.

Verify that Flux pods are running on nodes with the correct labels:

```bash
$ kubectl get pods -n flux-system -o wide
NAME                                       READY   STATUS    NODE
helm-controller-xxx                        1/1     Running   ip-xxx (karpenter.sh/controller=true)
kustomize-controller-xxx                   1/1     Running   ip-xxx (karpenter.sh/controller=true)
notification-controller-xxx                1/1     Running   ip-xxx (karpenter.sh/controller=true)
source-controller-xxx                      1/1     Running   ip-xxx (karpenter.sh/controller=true)
```

## Repository Structure

After bootstrap and configuration, the repository structure will include:

```
piksel-gitops/
├── clusters/
│   └── {environment}/
│       └── flux-system/
│           ├── gotk-components.yaml     # Flux components
│           ├── gotk-sync.yaml           # Sync configuration
│           └── kustomization.yaml       # Kustomization manifest with patches
```

### Step 4: Configure Flux System Patches

After successful bootstrap, you need to configure Flux system components to run on dedicated nodes with Karpenter controller tolerations and node selectors.

Edit the `flux-system/kustomization.yaml` file in your environment path and add the following patches:

```yaml
patches:
  - patch: |
      - op: add
        path: /spec/template/spec/tolerations
        value:
          - key: "CriticalAddonsOnly"
            operator: "Equal"
            value: "true"
            effect: "NoSchedule"
      - op: add
        path: /spec/template/spec/nodeSelector
        value:
          karpenter.sh/controller: "true"
    target:
      kind: Deployment
      labelSelector: "app.kubernetes.io/part-of=flux"
```

**What these patches do:**

- **Tolerations**: Allow Flux components to run on nodes with `CriticalAddonsOnly=true:NoSchedule` taint
- **Node Selector**: Ensure Flux components are scheduled on nodes managed by Karpenter controller
- **Target**: Apply patches to Flux controllers deployment

### Step 5: Rebootstrap to Apply Patches

**Important**: After modifying the kustomization.yaml, you must rebootstrap Flux to apply the patches to the running components.

Run the same bootstrap command again (Flux will detect existing installation and update it)

## Support Resources

- **Flux CD Documentation**: https://fluxcd.io/docs/
- **Repository Issues**: Create issues in the `piksel-ina/piksel-gitops` repository
- **Kustomize Patches**: https://kubectl.docs.kubernetes.io/references/kustomize/patches/
