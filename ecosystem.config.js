module.exports = {
    apps: [
      {
        name: 'app1',
        script: 'dist/index.js',
        watch: true,
        autorestart: true,
        instances: 8,
        args: '--PORT=8081 --MODO=CLUSTER',
      },
      {
        name: 'app2',
        script: 'dist/index.js',
        watch: true,
        autorestart: true,
        //instances: 8,
        args: '--PORT=8082',
      },
      {
        script: './service-worker/',
        watch: ['./service-worker'],
      },
    ],
  };