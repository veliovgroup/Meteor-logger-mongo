Logging: To MongoDB
========
*MongoDB* adapter for [logger driver](https://github.com/VeliovGroup/Meteor-logger). Store application's logs and messages in MongoDB.

*Whenever you log message(s) on Client or Sever, it goes directly into MongoDB.*

Features:
 - 100% tests coverage;
 - Flexible log level filters;
 - `userId` is automatically passed and logged if logs is associated with logged-in user;
 - Pass logs from *Client* to MongoDB on *Server*;
 - Catch all browser's errors.

Installation:
========
```shell
meteor add ostrio:logger # If not yet installed
meteor add ostrio:loggermongo
```

ES6 Import:
========
```jsx
import { Logger }      from 'meteor/ostrio:logger';
import { LoggerMongo } from 'meteor/ostrio:loggermongo';
```

Support this awesome package:
========
 - Star on [GitHub](https://github.com/VeliovGroup/Meteor-logger-mongo)
 - Star on [Atmosphere](https://atmospherejs.com/ostrio/loggermongo)
 - [Tweet](https://twitter.com/share?url=https://github.com/VeliovGroup/Meteor-logger-mongo&text=Store%20%23meteorjs%20log%20messages%20(from%20Client%20%26%20Server)%20in%20MongoDB%20%23javascript%20%23programming%20%23webdev%20via%20%40VeliovGroup)
 - Share on [Facebook](https://www.facebook.com/sharer.php?u=https://github.com/VeliovGroup/Meteor-logger-mongo)

Usage
========
### Initialization [*Isomorphic*]
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
  - `options.collection` {*Mongo.Collection*} - Use to pass your own MongoDB collection instance, {*[Mongo.Collection](https://docs.meteor.com/api/collections.html#Mongo-Collection)*} returned from `new Mongo.Collection()`
  - `options.collectionName` {*String*} - MongoDB collection name, default: `ostrioMongoLogger`
  - __Note__: *You can't pass both* `collection` *and* `collectionName` *simultaneously. Set only one of those options.* If both options is presented `collection` is more prioritized

#### Example:
```jsx
import { Logger }      from 'meteor/ostrio:logger';
import { LoggerMongo } from 'meteor/ostrio:loggermongo';

// Initialize Logger:
const log = new Logger();

// Initialize and enable LoggerMongo with default settings:
(new LoggerMongo(log)).enable();
```

#### Example 2:
```jsx
import { Logger }      from 'meteor/ostrio:logger';
import { LoggerMongo } from 'meteor/ostrio:loggermongo';

// Initialize Logger:
const log = new Logger();
const AppLogs = new Mongo.Collection('AppLogs');

// Initialize LoggerMongo with collection instance:
const LogMongo = new LoggerMongo(log, {
  collection: AppLogs
});

// Enable LoggerMongo with default settings:
LogMongo.enable();
```

#### Example 3:
```jsx
import { Logger }      from 'meteor/ostrio:logger';
import { LoggerMongo } from 'meteor/ostrio:loggermongo';

// Initialize Logger:
const log = new Logger();

// Initialize LoggerMongo with custom collection name:
const LogMongo = new LoggerMongo(log, {
  collectionName: 'AppLogs'
});

// Enable LoggerMongo with default settings:
LogMongo.enable();
```

### Activate with custom adapter settings: [*Isomorphic*]
```jsx
import { Logger }      from 'meteor/ostrio:logger';
import { LoggerMongo } from 'meteor/ostrio:loggermongo';

const log = new Logger();
(new LoggerMongo(log)).enable({
  enable: true,
  filter: ['ERROR', 'FATAL', 'WARN'], // Filters: 'ERROR', 'FATAL', 'WARN', 'DEBUG', 'INFO', 'TRACE', '*'
  client: true, // Set to `false` to avoid Client to Server logs transfer
  server: true  // Allow logging on Server
});
```

### Logging Collection Schema:
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

### Set custom indexes on collection: [*Server*]
Read more at: [ensureIndex docs](https://docs.mongodb.org/manual/reference/method/db.collection.ensureIndex/)
```jsx
import { Logger }      from 'meteor/ostrio:logger';
import { LoggerMongo } from 'meteor/ostrio:loggermongo';

const log = new Logger();
const LogMongo = new LoggerMongo(log, {
  collectionName: 'AppLogs' // Use custom collection name
});

if (Meteor.isServer) {
  LogMongo.collection._ensureIndex({level: 1}, {background: true});
  LogMongo.collection._ensureIndex({userId: 1}, {background: true});
  LogMongo.collection._ensureIndex({date: 1}, {background: true});
  LogMongo.collection._ensureIndex({timestamp: 1}, {background: true});
}
```

### Log message: [*Isomorphic*]
```jsx
import { Logger }      from 'meteor/ostrio:logger';
import { LoggerMongo } from 'meteor/ostrio:loggermongo';

const log = new Logger();
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
log._(message, data, userId); // Shortcut

// Use with throw
throw log.error(message, data, userId);
```

### Catch-all Client's errors example: [*Client*]
```javascript
/* Store original window.onerror */
const _GlobalErrorHandler = window.onerror;

window.onerror = (msg, url, line) => {
  log.error(msg, {file: url, onLine: line});
  if (_GlobalErrorHandler) {
    _GlobalErrorHandler.apply(this, arguments);
  }
};
```
### Catch-all Server's errors example: [*Server*]
```jsx
const bound = Meteor.bindEnvironment((callback) => {callback();});
process.on('uncaughtException', function (err) {
  bound(() => {
    log.error("Server Crashed!", err);
    console.error(err.stack);
    process.exit(7);
  });
};
```
### Catch-all Meteor's errors example: [*Server*]
```jsx
// store original Meteor error
const originalMeteorDebug = Meteor._debug;
Meteor._debug =(message, stack) => {
  const error = new Error(message);
  error.stack = stack;
  log.error('Meteor Error!', error);
  return originalMeteorDebug.apply(this, arguments);
};
```

### Use multiple logger(s) with different settings: [*Isomorphic*]
```jsx
import { Logger }      from 'meteor/ostrio:logger';
import { LoggerMongo } from 'meteor/ostrio:loggermongo';

const log1 = new Logger();
const log2 = new Logger();

/* 
 * Separate settings and collection
 * for info, debug and other messages
 */
(new LoggerMongo(log1, {
  collectionName: 'AppLogs'
})).enable({
  filter: ['DEBUG', 'INFO', 'LOG', 'TRACE'],
  client: true,
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
  client: true,
  server: true
});
```

Support this project:
========
This project can't be possible without [ostr.io](https://ostr.io).

By using [ostr.io](https://ostr.io) you are not only [protecting domain names](https://ostr.io/info/domain-names-protection), [monitoring websites and servers](https://ostr.io/info/monitoring), using [Prerendering for better SEO](https://ostr.io/info/prerendering) of your JavaScript website, but support our Open Source activity, and great packages like this one are available for free.
