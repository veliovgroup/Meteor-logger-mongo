Package.describe({
  name: 'ostrio:loggermongo',
  version: '1.1.0',
  summary: 'Logging: Store application logs in MongoDB',
  git: 'https://github.com/VeliovGroup/Meteor-logger-mongo',
  documentation: 'README.md'
});

Package.onUse(function(api) {
  api.versionsFrom('1.0');
  api.use('mongo', 'server');
  api.use(['ostrio:logger@1.1.0', 'coffeescript'], ['client', 'server']);
  api.addFiles('loggermongo.coffee', ['client', 'server']);
  api.export('LoggerMongo');
});
