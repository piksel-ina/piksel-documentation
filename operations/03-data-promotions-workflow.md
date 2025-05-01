# Piksel Data & Application Promotion Workflow

|             |                           |
| ----------- | ------------------------- |
| **Version** | 1.0                       |
| **Date**    | 2025-05-01                |
| **Owner**   | Cloud Infrastructure Team |

## General Idea: Piksel Data Cycle & Pipeline Workflow

Okay, here is the information presented in a 2-column table format for better readability:

**Piksel Data Cycle & Pipeline Workflow Overview**

| Aspect                         | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| :----------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Core Principle**             | Promote **Code, Configuration, and Containers**, not bulk data.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| **Promoted Artifacts**         | - **Application Code:** Python scripts, notebooks, APIs (in Git: `piksel-core`, `piksel-jupyter`, etc.)<br>- **Infrastructure Definitions:** Terraform code (in Git: `piksel-infra`)<br>- **Kubernetes Configurations:** Helm, Kustomizations (in Git: `piksel-kubernetes`)<br>- **Container Images:** Immutable images built by CI (in shared ECR: `piksel-core`)                                                                                                                                                                                                                  |
| **Environment Isolation**      | Each environment (`dev`, `staging`, `prod`) uses dedicated AWS resources:<br>- Separate AWS Accounts or VPCs<br>- Dedicated S3 Buckets (e.g., `piksel-<env>-data`, `piksel-<env>-notebooks`)<br>- Dedicated RDS Databases (e.g., `piksel-<env>-odc-index-rds`)                                                                                                                                                                                                                                                                                                                      |
| **Data Handling (Dev)**        | - **Data:** Small, curated samples or metadata pointers.<br>- **Storage:** `piksel-dev-data`<br>- **Index:** `piksel-dev-odc-index-rds`<br>- **Focus:** Rapid functional testing.                                                                                                                                                                                                                                                                                                                                                                                                   |
| **Data Handling (Staging)**    | - **Data:** Larger, representative subset (data/metadata). May involve copying or read-only access to prod sources.<br>- **Storage:** `piksel-staging-data` (for copies/outputs)<br>- **Index:** `piksel-staging-odc-index-rds`<br>- **Focus:** Integration, performance, edge case validation.                                                                                                                                                                                                                                                                                     |
| **Data Handling (Prod)**       | - **Data:** Full dataset, including indexing complete external catalogs (e.g., Element84 STAC).<br>- **Storage:** `piksel-prod-data` (for derived products)<br>- **Index:** `piksel-prod-odc-index-rds`<br>- **Focus:** Live operations.                                                                                                                                                                                                                                                                                                                                            |
| **Metadata Management**        | - ODC Index (RDS) managed _within_ each environment.<br>- Promote **code** for indexing/interaction.<br>- Promote **schema changes** via migration scripts (applied sequentially: dev -> staging -> prod).<br>- Index _content_ is environment-specific.                                                                                                                                                                                                                                                                                                                            |
| **Promotion Process (GitOps)** | 1. Develop/fix on feature branches.<br>2. Build/test code & containers against **Dev** environment.<br>3. Merge to main branch -> triggers CI.<br>4. CI builds **immutable container image** -> pushes to ECR.<br>5. CI/CD updates **Staging** config in Git (k8s, terraform) with new image tag.<br>6. GitOps tool (e.g., FluxCD) deploys changes to **Staging** cluster/infra.<br>7. Thoroughly **validate** in Staging.<br>8. Upon approval, update **Production** config in Git with the _exact same validated image tag_.<br>9. GitOps tool deploys changes to **Production**. |

---

## 2. Example Workflow: Producing Sentinel-2 Geomedian Across Environments

This example illustrates how a specific task, like generating an annual Sentinel-2 geomedian product, progresses through the development, staging, and production environments using the defined promotion workflow. The core principle is that the _same application code and container image_ are validated and promoted across environments, while each environment interacts with its own isolated data index and storage.

### A. Development Phase (`dev` Environment)

- **Goal:** Develop and functionally test the core logic for geomedian calculation.
- **Activities:**
  1.  **Code Development:** A developer works on a feature branch in the relevant Git repository (e.g., `piksel-core`). They write/modify Python code using libraries like ODC, Xarray, Dask, and Rasterio to:
      - Query an ODC index for relevant dataset metadata.
      - Access data from specified URLs (even if only a few sample URLs initially).
      - Perform the geomedian calculation on the data chunks.
      - Combine results and write the output as a Cloud-Optimized GeoTIFF (COG).
  2.  **Unit/Integration Testing:** The developer writes tests to verify the code's logic using mock data or extremely small, known inputs/outputs.
  3.  **Environment Setup (if needed):** If changes require infrastructure (e.g., new environment variables, IAM permissions), corresponding changes are made in `piksel-infra` and applied to the `dev` environment first. Kubernetes configuration changes (e.g., resource requests) are made in `piksel-kubernetes`.
- **Data & Index (`dev`):**
  - **Index:** `piksel-dev-odc-index-rds`. This contains minimal metadata, potentially:
    - Manually inserted records pointing to a few specific external Sentinel-2 test COGs.
    - Or, metadata pointing to a small, curated sample dataset copied into `s3://piksel-dev-data/samples/` for rapid, isolated testing.
  - **Storage:** `s3://piksel-dev-data` is used for storing any temporary files or the small output geomedian generated during tests.
- **Execution & Validation (`dev`):**
  - The developer (or a CI job triggered by commits to the feature branch) builds a container image and deploys it to the `dev` EKS cluster.
  - The geomedian calculation code is run against the `dev` index (`piksel-dev-odc-index-rds`).
  - **Focus:** Verify that the code runs without errors, the logic is correct for the small sample data, inputs/outputs are handled correctly, and the generated output (e.g., `s3://piksel-dev-data/derived/s2_geomedian_test_area_2024.tif`) has the expected format and basic structure. Performance and scalability are secondary concerns at this stage.

### B. Staging Validation (`staging` Environment)

- **Goal:** Validate the _exact same code_ (built into an immutable container image) against a larger, more representative dataset and under conditions closer to production. Test integration, performance, and edge cases.
- **Trigger & Promotion:**
  1.  The developer merges the validated feature branch into the `main` branch.
  2.  The CI pipeline triggers, builds the final **immutable container image**, tags it (e.g., with the Git commit SHA or a semantic version), and pushes it to the shared ECR repository.
  3.  The CI/CD process updates the Kubernetes configuration (e.g., Deployment, Job manifests) for the `staging` environment within the `piksel-kubernetes` Git repository, pointing to the **newly built image tag**.
  4.  **FluxCD**, monitoring the `piksel-kubernetes` repository for the `staging` path/branch, automatically applies the updated manifests to the `staging` EKS cluster, deploying the new version of the geomedian application/job runner.
- **Data & Index (`staging`):**
  - **Index:** `piksel-staging-odc-index-rds`. This index is populated by a dedicated indexing process running in the `staging` environment. This indexer queries the _real external source_ (e.g., Element84 STAC API) but might be configured to fetch metadata only for a specific, representative geographic subset or time range relevant for testing. It populates the index with metadata pointing to the _actual external Sentinel-2 COGs_.
  - **Storage:** `s3://piksel-staging-data` is used for storing the output geomedian generated in this environment.
- **Execution & Validation (`staging`):**
  1.  The geomedian generation process is triggered in the `staging` environment (e.g., via an API call to a service in `staging`, a manually triggered Kubernetes Job, or a scheduled test run).
  2.  The application, running the **promoted container image**, queries `piksel-staging-odc-index-rds` for the test AOI/time range.
  3.  It orchestrates the distributed computation (e.g., using Dask-Kubernetes) on the `staging` EKS cluster.
  4.  Worker pods access the required data directly from the _external Sentinel-2 URLs_ referenced in the staging index.
  5.  The resulting geomedian (e.g., `s3://piksel-staging-data/derived/s2_geomedia_region_y_2024.tif`) is written to the staging S3 bucket.
  6.  **Focus:** Verify correctness on a larger scale, test performance (does it complete in a reasonable time?), check resource consumption (CPU/memory usage within limits), validate integration with other staging services (monitoring, logging), and confirm handling of potential edge cases present in the larger dataset.

### C. Production Execution (`prod` Environment)

- **Goal:** Run the fully validated code reliably and efficiently on the complete dataset for operational use.
- **Trigger & Promotion:**
  1.  After successful validation in `staging`, the promotion to production is approved.
  2.  The CI/CD process (or a manual, controlled step) updates the Kubernetes configuration for the `production` environment in `piksel-kubernetes`, pointing to the **exact same container image tag** that was validated in `staging`.
  3.  **FluxCD**, monitoring the `piksel-kubernetes` repository for the `production` path/branch, applies the updated manifests to the `prod` EKS cluster.
- **Data & Index (`prod`):**
  - **Index:** `piksel-prod-odc-index-rds`. This is the live operational index. A dedicated indexing process (e.g., a scheduled Kubernetes CronJob) runs continuously or periodically in the `prod` environment. It queries the external source (Element84 STAC API) for _all_ relevant Sentinel-2 metadata (defined by Piksel's operational scope) and keeps the `prod` index up-to-date, referencing the external data URLs. **No raw Sentinel-2 pixel data is copied to Piksel storage during indexing.**
  - **Storage:** `s3://Piksel-prod-data` is the designated bucket for storing final, derived data products generated in production.
  - **External Data Source:** Element84 STAC API (or similar) containing metadata and URLs for Sentinel-2 COGs (likely stored on AWS S3 Requester Pays buckets).
- **Production Geomedian Workflow Execution:**
  1.  **Trigger:** A user request (e.g., via API call) or an automated system (e.g., scheduled job, message queue) initiates the calculation for a specific AOI and year (e.g., "Geomedian for Region X, Year 2024").
  2.  **Task Planning:** The service handling the request queries `piksel-prod-odc-index-rds` to find all relevant indexed Sentinel-2 datasets.
  3.  **Job Submission / Orchestration:** The service translates this into a computational task managed within the `prod` EKS cluster. Common approaches include:
      - Using distributed computing frameworks like **Dask** with `dask-kubernetes`.
      - Employing Kubernetes-native workflow engines (e.g., **Argo Workflows**, **Kubeflow Pipelines**, Prefect, Dagster) deployed via FluxCD.
      - Leveraging standard **Kubernetes Jobs** or **CronJobs**.
  4.  **Distributed Processing (Worker Pods):**
      - Kubernetes schedules worker pods (running the **validated container image**) onto nodes in the `prod` EKS cluster.
      - Each worker pod receives instructions for a spatial/temporal chunk.
      - It queries `piksel-prod-odc-index-rds` for precise metadata.
      - It **streams the required pixel data directly** from the external Sentinel-2 COG URLs (using libraries like Rasterio over HTTPS). Only necessary byte ranges are fetched on-the-fly.
      - Computation (geomedian algorithm) is performed in memory.
  5.  **Aggregation & Output:** Results from workers are combined. The final geomedian product (e.g., `s3://Piksel-prod-data/derived/s2_geomedia_region_x_2024.tif`) is written as a COG to the production S3 bucket.
  6.  **Output Indexing (Optional):** Metadata for the _newly created_ geomedian product in `Piksel-prod-data` can be indexed back into `piksel-prod-odc-index-rds` for discovery.
- **Validation (`prod`):** Primarily relies on monitoring, alerting, logging, and user confirmation of successful product generation and quality.

---

This multi-environment approach, driven by promoting code, configuration, and container images via GitOps (using FluxCD), ensures that features are thoroughly tested and validated before running against live production data, minimizing risks and maximizing reliability.
