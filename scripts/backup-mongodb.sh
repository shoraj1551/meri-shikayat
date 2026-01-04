#!/bin/bash
# MongoDB Backup Script
# TASK-021: Automated backup strategy

# Configuration
BACKUP_DIR="/backups/mongodb"
RETENTION_DAYS=30
MONGODB_URI="${MONGODB_URI}"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_NAME="meri-shikayat_${DATE}"

# Create backup directory
mkdir -p "${BACKUP_DIR}"

# Perform backup
echo "Starting MongoDB backup: ${BACKUP_NAME}"
mongodump --uri="${MONGODB_URI}" --out="${BACKUP_DIR}/${BACKUP_NAME}" --gzip

# Check if backup was successful
if [ $? -eq 0 ]; then
    echo "Backup completed successfully"
    
    # Compress backup
    tar -czf "${BACKUP_DIR}/${BACKUP_NAME}.tar.gz" -C "${BACKUP_DIR}" "${BACKUP_NAME}"
    rm -rf "${BACKUP_DIR}/${BACKUP_NAME}"
    
    # Upload to S3 (optional)
    if [ ! -z "${AWS_S3_BUCKET}" ]; then
        aws s3 cp "${BACKUP_DIR}/${BACKUP_NAME}.tar.gz" "s3://${AWS_S3_BUCKET}/backups/"
        echo "Backup uploaded to S3"
    fi
    
    # Delete old backups
    find "${BACKUP_DIR}" -name "*.tar.gz" -mtime +${RETENTION_DAYS} -delete
    echo "Old backups cleaned up (retention: ${RETENTION_DAYS} days)"
else
    echo "Backup failed!"
    exit 1
fi

# Verify backup integrity
echo "Verifying backup integrity..."
tar -tzf "${BACKUP_DIR}/${BACKUP_NAME}.tar.gz" > /dev/null
if [ $? -eq 0 ]; then
    echo "Backup integrity verified"
else
    echo "Backup integrity check failed!"
    exit 1
fi

echo "Backup process completed: ${BACKUP_NAME}.tar.gz"
