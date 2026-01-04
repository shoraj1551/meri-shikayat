# Database Restore Procedure
# TASK-PR-017: Disaster recovery restore procedures

## Prerequisites
- AWS CLI configured
- MongoDB tools installed
- Access to S3 backup bucket

## Restore Steps

### 1. List Available Backups
```bash
aws s3 ls s3://meri-shikayat-backups/mongodb/ --recursive
```

### 2. Download Backup
```bash
# Set backup date
BACKUP_DATE="2025-12-17"
BACKUP_FILE="meri-shikayat_${BACKUP_DATE}_*.tar.gz"

# Download from S3
aws s3 cp "s3://meri-shikayat-backups/mongodb/${BACKUP_FILE}" ./backups/

# Extract
cd backups
tar -xzf ${BACKUP_FILE}
```

### 3. Stop Application
```bash
# Stop API servers to prevent writes during restore
kubectl scale deployment meri-shikayat-api --replicas=0

# Or if using PM2
pm2 stop meri-shikayat-api
```

### 4. Restore Database
```bash
# Restore to MongoDB
mongorestore \
  --uri="${MONGODB_URI}" \
  --drop \
  --gzip \
  ./meri-shikayat_${BACKUP_DATE}/

# Verify restore
mongo "${MONGODB_URI}" --eval "db.complaints.countDocuments()"
```

### 5. Verify Data Integrity
```bash
# Check collection counts
mongo "${MONGODB_URI}" --eval "
  db.getCollectionNames().forEach(function(col) {
    print(col + ': ' + db[col].countDocuments());
  });
"

# Check latest records
mongo "${MONGODB_URI}" --eval "
  db.complaints.find().sort({createdAt: -1}).limit(5).pretty();
"
```

### 6. Restart Application
```bash
# Restart API servers
kubectl scale deployment meri-shikayat-api --replicas=3

# Or if using PM2
pm2 start meri-shikayat-api
pm2 logs
```

### 7. Smoke Test
```bash
# Test health endpoint
curl https://api.merishikayat.com/api/v1/health

# Test authentication
curl -X POST https://api.merishikayat.com/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"identifier":"test@example.com","password":"Test@1234"}'

# Test complaint listing
curl https://api.merishikayat.com/api/v1/complaints?page=1&limit=5
```

## Recovery Time Objective (RTO)
- **Target:** < 4 hours
- **Actual:** Record actual time taken

## Recovery Point Objective (RPO)
- **Target:** < 24 hours
- **Actual:** Check last backup timestamp

## Rollback Plan
If restore fails:
1. Keep original database intact
2. Restore to separate database for investigation
3. Contact database administrator
4. Review backup integrity

## Post-Restore Checklist
- [ ] All collections restored
- [ ] Record counts match expected
- [ ] Application starts successfully
- [ ] Health checks pass
- [ ] Authentication works
- [ ] Sample queries return data
- [ ] No errors in logs
- [ ] Monitoring shows normal metrics

## Incident Log
| Date | Time | Action | Result | Notes |
|------|------|--------|--------|-------|
|      |      |        |        |       |

---
**Last Updated:** 2025-12-17
