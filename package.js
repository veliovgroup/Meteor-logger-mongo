Package.describe({
  name: 'ostrio:loggermongo',
  version: '1.0.0',
  summary: 'Simply store application logs into MongoDB within ostrio:logger package',
  git: 'https://github.com/VeliovGroup/Meteor-logger-mongo',
  documentation: 'README.md'
});

Package.onUse(function(api) {
  api.versionsFrom('1.0');
  api.use(['ostrio:logger@1.0.0', 'coffeescript'], ['client', 'server']);
  api.addFiles('loggermongo.coffee', ['client', 'server']);
});
