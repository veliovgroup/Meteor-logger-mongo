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
Meteor.log.trace(message, data, userId);
Meteor.log._(message, data, userId); //--> Shortcut for logging without message, e.g.: simple plain log
```

##### Collection
All logs will be available in `ostrioMongoLogger` collection, as next object:
```coffeescript
doc =
  userId: userId             # UserID if Log was submitted
                             # in association with some user
                             #
  date: t                    # Log time as Date object
  timestamp: (+t).toString() # Date object as string
  level: level               # Log level
  message: message           # Passed message
  additional: data           # Passed object
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