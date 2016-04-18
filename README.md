Logging: To MongoDB
========
Store application logs into MongoDB within [ostrio:logger](https://atmospherejs.com/ostrio/logger) package.

*Whenever you log message(s) on client or sever, it goes directly to MongoDB.*

Installation:
========
```shell
meteor add ostrio:logger # If not yet installed
meteor add ostrio:loggermongo
```

Usage
========
##### Initialization [*Isomorphic*]
`new LoggerMongo(LoggerInstance, options)`
 - `LoggerInstance` {*Logger*} - from `new Logger()`
 - `options` {*Object*}
 - `options.collectionName` {*String*} - MongoDB collection name, default: `ostrioMongoLogger`

Example:
```javascript
this.Log = new Logger();
var LogMongo = new LoggerMongo(Log, {
  collectionName: 'AppLogs' /* Use custom collection name */
});
```

##### Activate and set adapter settings [*Isomorphic*]
```javascript
this.Log = new Logger();
new LoggerMongo(Log, {}).enable({
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

##### Set custom indexes on collection:
Read more at: [ensureIndex docs](https://docs.mongodb.org/manual/reference/method/db.collection.ensureIndex/)
```javascript
this.Log = new Logger();
var LogMongo = new LoggerMongo(Log, {
  collectionName: 'AppLogs' /* Use custom collection name */
});

if (Meteor.isServer) {
  LogMongo.collection._ensureIndex({level: 1}, {background: true});
  LogMongo.collection._ensureIndex({userId: 1}, {background: true});
  LogMongo.collection._ensureIndex({date: 1}, {background: true});
  LogMongo.collection._ensureIndex({timestamp: 1}, {background: true});
}
```

##### Log [*Isomorphic*]
```javascript
this.Log = new Logger();
new LoggerMongo(Log).enable();

/*
  message {String} - Any text message
  data    {Object} - [optional] Any additional info as object
  userId  {String} - [optional] Current user id
 */
Log.info(message, data, userId);
Log.debug(message, data, userId);
Log.error(message, data, userId);
Log.fatal(message, data, userId);
Log.warn(message, data, userId);
Log.trace(message, data, userId);
Log._(message, data, userId); //--> Shortcut for logging without message, e.g.: simple plain log

/* Use with throw */
throw Log.error(message, data, userId);
```

##### Use multiple logger(s) with different settings:
```javascript
this.Log1 = new Logger();
this.Log2 = new Logger();

/* 
 * Separate settings and collection
 * for info, debug and other messages
 */
new LoggerMongo(Log1, {
  collectionName: 'AppLogs'
}).enable({
  filter: ['DEBUG', 'INFO', 'LOG', 'TRACE'],
  client: false,
  server: true
});

/* 
 * Separate settings and collection
 * for errors, exceptions, warnings and etc.
 */
new LoggerMongo(Log2, {
  collectionName: 'AppErrors'
}).enable({
  filter: ['ERROR', 'FATAL', 'WARN'],
  client: false,
  server: true
});
```