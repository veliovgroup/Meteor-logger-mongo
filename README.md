Logging: To MongoDB
========
Store application log messages in MongoDB.

*Whenever you log message(s) on Client or Sever, it goes directly into MongoDB.*

Installation:
========
```shell
meteor add ostrio:logger # If not yet installed
meteor add ostrio:loggermongo
```

Support this awesome package:
========
 - Star on [GitHub](https://github.com/VeliovGroup/Meteor-logger-mongo)
 - Star on [Atmosphere](https://atmospherejs.com/ostrio/loggermongo)
 - [Tweet](https://twitter.com/share?url=https://github.com/VeliovGroup/Meteor-logger-mongo&text=Store%20%23meteorjs%20log%20messages%20(from%20Client%20%26%20Server)%20in%20MongoDB%20%23javascript%20%23programming%20%23webdev%20via%20%40VeliovGroup)
 - Share on [Facebook](https://www.facebook.com/sharer.php?u=https://github.com/VeliovGroup/Meteor-logger-mongo)

Usage
========
##### Initialization [*Isomorphic*]
`new LoggerMongo(LoggerInstance, options)`
 - `LoggerInstance` {*Logger*} - from `new Logger()`
 - `options` {*Object*}
 - `options.format` {*Function*} - Must return plain object, which will be used as log-record. Arguments:
  * `opts` {*Object*}
  * `opts.userId` {*String*}
  * `opts.date` {*Date*} - Report date
  * `opts.timestamp` {*Number*} - Report timestamp in milliseconds
  * `opts.level` {*String*} - Message level, one of: `ERROR`, `FATAL`, `WARN`, `DEBUG`, `INFO`, `TRACE`, `*`
  * `opts.message` {*String*} - Report message
  * `opts.additional` {*Object*} - Additional info passed as object
 - `options.collection` {*Mongo.Collection*} - Use to pass your own MongoDB collection instance, {*[Mongo.Collection](Mongo.Collection)*} returned from `new Mongo.Collection()`
 - `options.collectionName` {*String*} - MongoDB collection name, default: `ostrioMongoLogger`
 - __Note__: *You can't pass both* `collection` *and* `collectionName` *simultaneously. Set only one of those options.* If both options is presented `collection` is more prioritized
 - __Note__: If `collectionName` or no arguments is passed, `update`, `remove`, `insert` is disallowed on the Client

Example:
```javascript
// Initialize Logger:
this.log = new Logger();

// Initialize LoggerMongo and enable with default settings:
(new LoggerMongo(log)).enable();
```

Example 2:
```javascript
// Initialize Logger:
this.log = new Logger();
var AppLogs = new Mongo.Collection('AppLogs');

// Initialize LoggerMongo with own collection instance:
var LogMongo = new LoggerMongo(log, {
  collection: AppLogs
});

// Enable LoggerMongo with default settings:
LogMongo.enable();
```

Example 3:
```javascript
// Initialize Logger:
this.log = new Logger();

// Initialize LoggerMongo with custom collection name:
var LogMongo = new LoggerMongo(log, {
  collectionName: 'AppLogs'
});

// Enable LoggerMongo with default settings:
LogMongo.enable();
```

##### Activate with custom adapter settings: [*Isomorphic*]
```javascript
this.log = new Logger();
(new LoggerMongo(log, {})).enable({
  enable: true,
  filter: ['ERROR', 'FATAL', 'WARN'], /* Filters: 'ERROR', 'FATAL', 'WARN', 'DEBUG', 'INFO', 'TRACE', '*' */
  client: false, /* This allows to call, but not execute on Client */
  server: true   /* Calls from client will be executed on Server */
});
```

##### Logging Collection Schema:
```javascript
({
  userId: {
    type: String
  },
  date: {
    type: Date
  },
  timestamp: {
    type: Number
  },
  level: {
    type: String
  },
  message: {
    type: String
  },
  additional: {
    type: Object
  }
});
```

##### Set custom indexes on collection: [*Server*]
Read more at: [ensureIndex docs](https://docs.mongodb.org/manual/reference/method/db.collection.ensureIndex/)
```javascript
this.log = new Logger();
var LogMongo = new LoggerMongo(log, {
  collectionName: 'AppLogs' /* Use custom collection name */
});

if (Meteor.isServer) {
  LogMongo.collection._ensureIndex({level: 1}, {background: true});
  LogMongo.collection._ensureIndex({userId: 1}, {background: true});
  LogMongo.collection._ensureIndex({date: 1}, {background: true});
  LogMongo.collection._ensureIndex({timestamp: 1}, {background: true});
}
```

##### Log message: [*Isomorphic*]
```javascript
this.log = new Logger();
(new LoggerMongo(log)).enable();

/*
  message {String} - Any text message
  data    {Object} - [optional] Any additional info as object
  userId  {String} - [optional] Current user id
 */
log.info(message, data, userId);
log.debug(message, data, userId);
log.error(message, data, userId);
log.fatal(message, data, userId);
log.warn(message, data, userId);
log.trace(message, data, userId);
log._(message, data, userId); //--> Plain log without level

/* Use with throw */
throw log.error(message, data, userId);
```

##### Catch-all Client's errors example: [*Client*]
```javascript
/* Store original window.onerror */
var _WoE = window.onerror;

window.onerror = function(msg, url, line) {
  log.error(msg, {file: url, onLine: line});
  if (_WoE) {
    _WoE.apply(this, arguments);
  }
};
```

##### Use multiple logger(s) with different settings: [*Isomorphic*]
```javascript
this.log1 = new Logger();
this.log2 = new Logger();

/* 
 * Separate settings and collection
 * for info, debug and other messages
 */
(new LoggerMongo(log1, {
  collectionName: 'AppLogs'
})).enable({
  filter: ['DEBUG', 'INFO', 'LOG', 'TRACE'],
  client: false,
  server: true
});

/* 
 * Separate settings and collection
 * for errors, exceptions, warnings and etc.
 */
(new LoggerMongo(log2, {
  collectionName: 'AppErrors'
})).enable({
  filter: ['ERROR', 'FATAL', 'WARN'],
  client: false,
  server: true
});
```