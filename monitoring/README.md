# Monitoring roadmap

Prometheus configuration is a starter only. The FastAPI app does not currently expose a Prometheus metrics endpoint, so application scraping is intentionally not configured yet. Add `prometheus-client` / `prometheus-fastapi-instrumentator`, secure the metrics endpoint, then add a Grafana dashboard. Avoid running monitoring services on a small EC2 instance if it causes memory pressure or cost.
