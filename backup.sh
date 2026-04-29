#!/bin/bash

BACKUP_DIR="/var/www/dobi-elf/backups"
DATA_DIR="/var/www/dobi-elf/data"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

if [ -f "$DATA_DIR/dobi.db" ]; then
    cp $DATA_DIR/dobi.db $BACKUP_DIR/dobi_$DATE.db
    echo "[$(date)] Backup completed: dobi_$DATE.db"
    
    find $BACKUP_DIR -name "dobi_*.db" -mtime +7 -delete
    echo "[$(date)] Old backups cleaned (keeping last 7 days)"
else
    echo "[$(date)] Error: Database file not found at $DATA_DIR/dobi.db"
    exit 1
fi
