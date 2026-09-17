module.exports = {
  apps: [
    {
      name: 'cador-frontend',
      script: '.next/standalone/server.js',
      cwd: '/home/elikana/elikana_projects/cador/cado-frontend',
      interpreter: '/home/elikana/.nvm/versions/node/v22.23.2/bin/node',
      instances: 1,
      autorestart: true,
      max_memory_restart: '512M',
      env: { NODE_ENV: 'production', PORT: 3010, HOSTNAME: '127.0.0.1' }
    }
  ]
};
