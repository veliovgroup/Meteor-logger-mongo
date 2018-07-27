Package.describe({
  name: 'ostrio:loggermongo',
  version: '2.0.4',
  summary: 'Logging: Store application\'s logs messages in MongoDB (Server & Client support)',
  git: 'https://github.com/VeliovGroup/Meteor-logger-mongo',
  documentation: 'README.md'
});

Package.onUse(function(api) {
  api.versionsFrom('1.4');
  api.use('mongo', 'server');
  api.use(['mongo', 'ecmascript', 'check', 'ostrio:logger@2.0.7'], ['client', 'server']);
  api.mainModule('loggermongo.js', ['client', 'server']);
});

Package.onTest(function(api) {
  api.use('tinytest');
  api.use(['ecmascript', 'underscore', 'ostrio:logger', 'ostrio:loggermongo']);
  api.addFiles('loggermongo-tests.js');
});
