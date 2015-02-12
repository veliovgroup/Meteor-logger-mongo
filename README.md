Meteor Mongo adapter for ostrio:logger
========
Simply store application logs into MongoDB within [ostrio:logger](https://atmospherejs.com/ostrio/logger) package

Installation:
========
```shell
meteor add ostrio:loggermongo
```

Usage
========
##### Log [`Server` & `Client`]
```javascript
/*
  message {String} - Any text message
  data    {Object} - [optional] Any additional info as object
  userId  {String} - [optional] Current user id
 */
Meteor.log.info(message, data, userId);
Meteor.log.debug(message, data, userId);
Meteor.log.error(message, data, userId);
Meteor.log.fatal(message, data, userId);
Meteor.log.warn(message, data, userId);
```

##### Activate and set adapter settings [`Server` & `Client`]
```javascript
Meteor.log.rule('Mongo', 
{
  enable: true,
  filter: ['*'], /* Filters: 'ERROR', 'FATAL', 'WARN', 'DEBUG', 'INFO', '*' */
  client: false, /* This allows to call, but not execute on Client */
  server: true   /* Calls from client will be executed on Server */
});
```