# Share Fair — Kubernetes Deployment Guide

## Overview

This directory contains production-ready Kubernetes manifests for the full Share Fair stack:

| Service | Type | Description |
|---------|------|-------------|
| PostgreSQL | StatefulSet | Database with PostGIS + pgvector |
| MinIO | StatefulSet | S3-compatible image storage |
| Ollama | Deployment | Local LLM for semantic search |
| API | Deployment + HPA | Spring Boot REST + WebSocket |
| Frontend | Deployment | React SPA (nginx-served) |
| Nginx | Deployment | Reverse proxy |
| Prometheus | Deployment | Metrics collection |
| Grafana | Deployment | Dashboards |
| Loki | Deployment | Log aggregation |
| Promtail | DaemonSet | Log shipper |
| Postgres Backup | CronJob | Daily pg_dump → MinIO |

---

## Prerequisites

1. **Kubernetes cluster** (v1.26+) — minikube, kind, k3s, EKS, GKE, AKS, or self-hosted
2. **kubectl** configured against your cluster
3. **Ingress controller** installed:
   ```bash
   kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/main/deploy/static/provider/cloud/deploy.yaml
   ```
4. **cert-manager** (for automatic TLS via Let's Encrypt):
   ```bash
   kubectl apply -f https://github.com/cert-manager/cert-manager/releases/latest/download/cert-manager.yaml
   ```
5. **Container images** built and pushed to a registry (see [Building Images](#building-images))

---

## Building Images

### Backend (Spring Boot API)
```bash
docker build -t ghcr.io/<your-org>/share-fair-api:latest ./share-fair-be/
docker push ghcr.io/<your-org>/share-fair-api:latest
```

### Frontend (Production nginx build)
The existing `share-fair-fe/Dockerfile` runs a Vite dev server.
For Kubernetes, use a production multi-stage build — create `share-fair-fe/Dockerfile.prod`:

```dockerfile
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
ARG VITE_API_BASE_URL=/api/v1
ARG VITE_STRIPE_PUBLISHABLE_KEY
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
```

```bash
docker build -f share-fair-fe/Dockerfile.prod \
  --build-arg VITE_STRIPE_PUBLISHABLE_KEY=pk_live_... \
  -t ghcr.io/<your-org>/share-fair-frontend:latest \
  ./share-fair-fe/
docker push ghcr.io/<your-org>/share-fair-frontend:latest
```

### PostgreSQL (custom with PostGIS + pgvector)
```bash
docker build -t ghcr.io/<your-org>/share-fair-postgres:latest ./docker/postgres/
docker push ghcr.io/<your-org>/share-fair-postgres:latest
```

After building, replace `ghcr.io/your-org/` in the manifests with your actual registry path:
```bash
sed -i 's|ghcr.io/your-org/|ghcr.io/<your-org>/|g' kubernetes/*.yaml
```

---

## Deployment

### 1. Create namespace
```bash
kubectl apply -f kubernetes/namespace.yaml
```

### 2. Configure secrets
```bash
# Copy the template and fill in real values
cp kubernetes/secrets.yaml kubernetes/secrets.local.yaml
# Edit kubernetes/secrets.local.yaml — replace all CHANGE_ME values
kubectl apply -f kubernetes/secrets.local.yaml
```
> **Never commit `secrets.local.yaml` to git.** Use [Sealed Secrets](https://github.com/bitnami-labs/sealed-secrets) or [external-secrets](https://external-secrets.io/) for GitOps workflows.

### 3. Apply remaining resources (order matters)
```bash
# ConfigMaps and storage
kubectl apply -f kubernetes/storage.yaml
kubectl apply -f kubernetes/configmaps.yaml

# Stateful data services (wait for them to be ready before starting API)
kubectl apply -f kubernetes/postgres.yaml
kubectl apply -f kubernetes/minio.yaml
kubectl apply -f kubernetes/ollama.yaml

kubectl wait --for=condition=ready pod -l app=postgres -n share-fair --timeout=120s
kubectl wait --for=condition=ready pod -l app=minio   -n share-fair --timeout=60s

# Application
kubectl apply -f kubernetes/api.yaml
kubectl apply -f kubernetes/frontend.yaml
kubectl apply -f kubernetes/nginx.yaml

# Monitoring
kubectl apply -f kubernetes/monitoring/prometheus.yaml
kubectl apply -f kubernetes/monitoring/loki.yaml
kubectl apply -f kubernetes/monitoring/grafana.yaml
kubectl apply -f kubernetes/monitoring/promtail.yaml

# Backup
kubectl apply -f kubernetes/backup/configmap.yaml
kubectl apply -f kubernetes/backup/cronjob.yaml

# Ingress (update host in ingress.yaml first)
kubectl apply -f kubernetes/ingress.yaml
```

### 4. Verify deployment
```bash
kubectl get all -n share-fair
kubectl get ingress -n share-fair
```

---

## Database Backup Strategy

### Architecture
```
PostgreSQL → pg_dump (daily 02:00 UTC) → gzip → MinIO
                                                   ├── /daily/   (7 days retained)
                                                   └── /weekly/  (4 weeks retained, Sundays only)
```

### Backup schedule
| Backup type | Trigger | MinIO path | Retention |
|-------------|---------|-----------|-----------|
| Daily | 02:00 UTC every day | `sharefair-backups/daily/` | 7 most recent |
| Weekly | 02:00 UTC every Sunday | `sharefair-backups/weekly/` | 4 most recent |

### Monitoring backups
```bash
# View backup job history
kubectl get jobs -n share-fair -l app=backup

# View logs from last backup
kubectl logs -l app=backup -n share-fair --tail=50
```

### Manual backup (on-demand)
```bash
# Trigger an immediate backup job
kubectl create job --from=cronjob/postgres-backup manual-backup-$(date +%Y%m%d) -n share-fair
kubectl logs -l job-name=manual-backup-$(date +%Y%m%d) -n share-fair -f
```

### Restore procedure
```bash
# 1. List available backups
kubectl apply -f kubernetes/backup/restore-job.yaml -n share-fair
kubectl logs -l job-name=postgres-restore -n share-fair -f

# 2. Edit restore-job.yaml: set BACKUP_FILE to the desired filename
#    e.g. "sharefair_20260221_020000.dump.gz"

# 3. Delete the previous job and re-apply
kubectl delete job postgres-restore -n share-fair --ignore-not-found
kubectl apply -f kubernetes/backup/restore-job.yaml -n share-fair
kubectl logs -l job-name=postgres-restore -n share-fair -f
```

> **Warning:** Restore runs `--clean --if-exists`, which drops all database objects before recreating them. Always perform restores during a maintenance window.

---

## Accessing Internal Services

Services not exposed via Ingress can be reached using `kubectl port-forward`:

```bash
# Grafana dashboards
kubectl port-forward svc/grafana 3000:3000 -n share-fair

# Prometheus
kubectl port-forward svc/prometheus 9090:9090 -n share-fair

# MinIO console
kubectl port-forward svc/minio 9001:9001 -n share-fair

# PostgreSQL (for debugging)
kubectl port-forward svc/postgres 5432:5432 -n share-fair
```

---

## Scaling

The API deployment has a HorizontalPodAutoscaler that scales from 2 to 10 pods:
- Scales up when CPU > 70% or memory > 80%
- Requires `metrics-server` in the cluster:
  ```bash
  kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml
  ```

Manual scaling:
```bash
kubectl scale deployment api --replicas=4 -n share-fair
```

---

## File Structure

```
kubernetes/
├── README.md                   # This file
├── namespace.yaml              # share-fair namespace
├── secrets.yaml                # Secret template (fill in real values, never commit)
├── storage.yaml                # PersistentVolumeClaims for all stateful services
├── configmaps.yaml             # nginx, prometheus, loki, promtail, grafana configs
├── postgres.yaml               # PostgreSQL StatefulSet + Service
├── minio.yaml                  # MinIO StatefulSet + Service
├── ollama.yaml                 # Ollama Deployment + Service (AI embeddings)
├── api.yaml                    # Spring Boot Deployment + Service + HPA
├── frontend.yaml               # React SPA Deployment + Service
├── nginx.yaml                  # Nginx reverse proxy Deployment + Service
├── ingress.yaml                # Ingress (TLS via cert-manager)
├── monitoring/
│   ├── prometheus.yaml         # Prometheus Deployment + Service + RBAC
│   ├── grafana.yaml            # Grafana Deployment + Service
│   ├── loki.yaml               # Loki Deployment + Service
│   └── promtail.yaml           # Promtail DaemonSet + RBAC
└── backup/
    ├── configmap.yaml          # backup.sh + restore.sh scripts
    ├── cronjob.yaml            # Daily pg_dump CronJob (02:00 UTC)
    └── restore-job.yaml        # On-demand restore Job template
```
