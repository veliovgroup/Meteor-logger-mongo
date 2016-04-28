Package.describe({
  name: 'ostrio:loggermongo',
  version: '1.1.1',
  summary: 'Logging: Store application log messages into MongoDB (Server & Client support)',
  git: 'https://github.com/VeliovGroup/Meteor-logger-mongo',
  documentation: 'README.md'
});

Package.onUse(function(api) {
  api.versionsFrom('1.0');
  api.use('mongo', 'server');
  api.use(['ostrio:logger@1.1.1', 'coffeescript', 'check', 'underscore'], ['client', 'server']);
  api.addFiles('loggermongo.coffee', ['client', 'server']);
  api.export('LoggerMongo');
});
