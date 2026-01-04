# Monitoring & Alerting Configuration
# TASK-022: DataDog/Prometheus monitoring setup

## DataDog Configuration

### Application Metrics
- **Request Rate**: Requests per second
- **Error Rate**: 4xx/5xx responses per second
- **Latency**: p50, p95, p99 response times
- **Database Queries**: Query count and duration
- **Cache Hit Rate**: Redis cache effectiveness

### Infrastructure Metrics
- **CPU Usage**: Per container/instance
- **Memory Usage**: Heap and RSS
- **Disk I/O**: Read/write operations
- **Network**: Bandwidth usage

### Custom Metrics
```javascript
// Example: Track complaint creation
import { StatsD } from 'node-dogstatsd';
const dogstatsd = new StatsD();

dogstatsd.increment('complaints.created', 1, ['category:infrastructure']);
dogstatsd.histogram('complaints.processing_time', duration);
```

### Alerts

#### Critical (P0)
- **Service Down**: Health check fails for 2 minutes
- **Error Rate >5%**: For 5 minutes
- **Response Time >2s**: p95 for 10 minutes
- **Database Connection Lost**: Immediate

#### High (P1)
- **Memory Usage >80%**: For 15 minutes
- **CPU Usage >70%**: For 15 minutes
- **Disk Usage >85%**: For 30 minutes
- **Cache Miss Rate >50%**: For 10 minutes

#### Medium (P2)
- **Slow Queries**: >1s for 20 minutes
- **High Request Rate**: >1000 req/s for 30 minutes

### Dashboard Widgets
1. **Service Health**: Uptime, error rate, latency
2. **Traffic**: Request rate, top endpoints
3. **Database**: Connection pool, query performance
4. **Cache**: Hit rate, eviction rate
5. **Infrastructure**: CPU, memory, disk

---

## Prometheus Configuration

```yaml
# prometheus.yml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: 'meri-shikayat-api'
    static_configs:
      - targets: ['localhost:5000']
    metrics_path: '/api/v1/metrics'

alerting:
  alertmanagers:
    - static_configs:
        - targets: ['localhost:9093']

rule_files:
  - 'alerts.yml'
```

```yaml
# alerts.yml
groups:
  - name: api_alerts
    rules:
      - alert: HighErrorRate
        expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.05
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "High error rate detected"
          
      - alert: HighLatency
        expr: histogram_quantile(0.95, http_request_duration_seconds) > 2
        for: 10m
        labels:
          severity: warning
```

---

**Last Updated:** 2025-12-17
