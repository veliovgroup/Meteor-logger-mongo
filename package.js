Package.describe({
  name: 'ostrio:loggermongo',
  version: '0.0.1',
  summary: 'Simply store application logs into MongoDB within ostrio:logger package',
  git: '',
  documentation: 'README.md'
});

Package.onUse(function(api) {
  api.versionsFrom('1.0.3.1');
  api.use('ostrio:logger@0.0.1', ['client', 'server']);
  api.use('coffeescript', ['client', 'server']);
  api.addFiles('ostrio:loggermongo.coffee', ['client', 'server']);
});
