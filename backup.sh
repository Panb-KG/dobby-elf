#!/bin/bash

BACKUP_DIR="/var/www/dobby-elf/backups"
DATA_DIR="/var/www/dobby-elf/data"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

if [ -f "$DATA_DIR/dobby.db" ]; then
    cp $DATA_DIR/dobby.db $BACKUP_DIR/dobby_$DATE.db
    echo "[$(date)] Backup completed: dobby_$DATE.db"
    
    find $BACKUP_DIR -name "dobby_*.db" -mtime +7 -delete
    echo "[$(date)] Old backups cleaned (keeping last 7 days)"
else
    echo "[$(date)] Error: Database file not found at $DATA_DIR/dobby.db"
    exit 1
fi
