Package.describe({
  name: 'ostrio:loggermongo',
  version: '2.2.2',
  summary: 'Logging: Store application\'s logs messages in MongoDB (Server & Client support)',
  git: 'https://github.com/veliovgroup/Meteor-logger-mongo',
  documentation: 'README.md'
});

Package.onUse((api) => {
  api.versionsFrom(['2.14', '2.15', '2.16', '3.2', '3.3.1', '3.4']);
  api.use('mongo', 'server');
  api.use(['mongo', 'ecmascript', 'check', 'ostrio:logger@2.2.0'], ['client', 'server']);
  api.mainModule('loggermongo.js', ['client', 'server']);
});

Package.onTest((api) => {
  api.use('tinytest');
  api.use(['ecmascript', 'mongo', 'check', 'ostrio:logger', 'ostrio:loggermongo']);
  // Focused suites; `tests/helpers.js` is pulled in transitively via import.
  // `tests/c2s.js` MUST load first: it constructs the client->server bridge
  // Logger before any other, pinning its Meteor-method prefix so it matches on
  // both client and server.
  api.addFiles([
    'tests/c2s.js',
    'tests/logger-message-tests.js',
    'tests/record-shape-tests.js',
    'tests/options-tests.js',
    'tests/rules-tests.js',
    'tests/client-to-server-tests.js'
  ], ['client', 'server']);
});
