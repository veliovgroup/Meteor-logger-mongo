Package.describe({
  name: 'ostrio:loggermongo',
  version: '2.1.0',
  summary: 'Logging: Store application\'s logs messages in MongoDB (Server & Client support)',
  git: 'https://github.com/veliovgroup/Meteor-logger-mongo',
  documentation: 'README.md'
});

Package.onUse((api) => {
  api.versionsFrom(['2.14', '2.15', '2.16', '3.2', '3.3.1', '3.4']);
  api.use('mongo', 'server');
  api.use(['mongo', 'ecmascript', 'check', 'ostrio:logger'], ['client', 'server']);
  api.mainModule('loggermongo.js', ['client', 'server']);
});

Package.onTest((api) => {
  api.use('tinytest');
  api.use(['ecmascript', 'ostrio:logger', 'ostrio:loggermongo']);
  api.addFiles('loggermongo-tests.js');
});
