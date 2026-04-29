module.exports = {
  apps: [{
    name: 'dobi-elf',
    script: 'npm',
    args: 'start',
    cwd: '/var/www/dobi-elf',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '500M',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: '/var/www/dobi-elf/logs/error.log',
    out_file: '/var/www/dobi-elf/logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true
  }]
};
