module.exports = {
  apps: [{
    name: 'dentaljourneyindia-bot',
    script: 'src/index.js',
    cwd: __dirname,
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '500M',
    env: {
      NODE_ENV: 'production'
    },
    error_file: '/var/log/dentaljourneyindia/error.log',
    out_file: '/var/log/dentaljourneyindia/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss',
    restart_delay: 5000,
    max_restarts: 10
  }]
};
