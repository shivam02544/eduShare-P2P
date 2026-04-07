module.exports = {
  apps: [
    {
      name: "edushare",
      script: "node_modules/.bin/next",
      args: "start",
      instances: "max",       // Use all CPU cores
      exec_mode: "cluster",
      watch: false,
      max_memory_restart: "1G",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
    },
  ],
};
