[![support](https://img.shields.io/badge/support-GitHub-white)](https://github.com/sponsors/dr-dimitru)
[![support](https://img.shields.io/badge/support-PayPal-white)](https://paypal.me/veliovgroup)
<a href="https://ostr.io/info/built-by-developers-for-developers">
  <img src="https://ostr.io/apple-touch-icon-60x60.png" height="20">
</a>

# Logging: To MongoDB

*MongoDB* adapter for [logger driver](https://github.com/VeliovGroup/Meteor-logger). Store application's logs and messages in MongoDB.

*Whenever you log message(s) on Client or Sever, it goes directly into MongoDB.*

Features:

- 👷‍♂️ 100% tests coverage;
- 💪 Flexible log level filters;
- 👨‍💻 `userId` is automatically passed and logged, data is associated with logged-in user;
- 📟 Pass logs from *Client* to MongoDB on *Server*;
- 🕷 Catch all browser's errors and exceptions.

## Installation:

```shell
meteor add ostrio:logger # If not yet installed
meteor add ostrio:loggermongo
```

## ES6 Import:

```js
import { Logger } from 'meteor/ostrio:logger';
import { LoggerMongo } from 'meteor/ostrio:loggermongo';
```

## Usage

Initialize `Logger` instance and pass it into `LoggerMongo` constructor to enable logging into the log file.

### Initialization [*Isomorphic*]

`new LoggerMongo(LoggerInstance, options)`

- `LoggerInstance` {*Logger*} - from `new Logger()`
- `options` {*Object*}
- `options.collection` {*Mongo.Collection*} - Use to pass your own MongoDB collection instance, {*[Mongo.Collection](https://docs.meteor.com/api/collections.html#Mongo-Collection)*} returned from `new Mongo.Collection()`
- `options.collectionName` {*String*} - MongoDB collection name, default: `ostrioMongoLogger`
- `options.format` {*Function*} - Must return plain object, which will be used as log-record. Arguments:
  - `opts` {*Object*}
  - `opts.userId` {*String*}
  - `opts.date` {*Date*} - Report date
  - `opts.timestamp` {*Number*} - Report timestamp in milliseconds
  - `opts.level` {*String*} - Message level, one of: `ERROR`, `FATAL`, `WARN`, `DEBUG`, `INFO`, `TRACE`, `*`
  - `opts.message` {*String*} - Report message
  - `opts.additional` {*Object*} - Additional info passed as object

__Note__: *You can't pass both* `collection` *and* `collectionName` *simultaneously. Set only one of those options.* If both options is presented `collection` is more prioritized

#### Example:

```js
import { Logger } from 'meteor/ostrio:logger';
import { LoggerMongo } from 'meteor/ostrio:loggermongo';

// Initialize Logger:
const log = new Logger();

// Initialize and enable LoggerMongo with default settings:
(new LoggerMongo(log)).enable();
```

#### Example 2:

```js
import { Logger } from 'meteor/ostrio:logger';
import { LoggerMongo } from 'meteor/ostrio:loggermongo';

// Initialize Logger:
const log = new Logger();
const appLogs = new Mongo.Collection('AppLogs');

// Initialize LoggerMongo with collection instance:
const logMongo = new LoggerMongo(log, {
  collection: appLogs
});

// Enable LoggerMongo with default settings:
logMongo.enable();
```

#### Example 3:

```js
import { Logger } from 'meteor/ostrio:logger';
import { LoggerMongo } from 'meteor/ostrio:loggermongo';

// Initialize Logger:
const log = new Logger();

// Initialize LoggerMongo with custom collection name:
const logMongo = new LoggerMongo(log, {
  collectionName: 'appLogs'
});

// Enable LoggerMongo with default settings:
logMongo.enable();
```

#### Initialize with custom adapter settings: [*Isomorphic*]

```js
import { Logger } from 'meteor/ostrio:logger';
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

```js
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
  additional: {    // <- passed object into 'data' argument
    type: Object   // upon logging will be available for search
  }
});
```

### Set custom indexes on collection: [*Server*]

Read more at: [ensureIndex docs](https://docs.mongodb.org/manual/reference/method/db.collection.ensureIndex/)

```js
import { Logger } from 'meteor/ostrio:logger';
import { LoggerMongo } from 'meteor/ostrio:loggermongo';

const log = new Logger();
const LogMongo = new LoggerMongo(log, {
  collectionName: 'AppLogs' // Use custom collection name
});

if (Meteor.isServer) {
  // PRECAUTION: make sure you understand what you're doing and why
  // Do not ever blindly copy-paste, see: https://github.com/VeliovGroup/Meteor-logger-mongo/issues/19
  LogMongo.collection._ensureIndex({level: 1}, {background: true});
  LogMongo.collection._ensureIndex({userId: 1}, {background: true});
  LogMongo.collection._ensureIndex({date: 1}, {background: true});
  LogMongo.collection._ensureIndex({timestamp: 1}, {background: true});
}
```

### Log message: [*Isomorphic*]

```js
import { Logger } from 'meteor/ostrio:logger';
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

```js
/* Store original window.onerror */
const _GlobalErrorHandler = window.onerror;

window.onerror = function (msg, url, line) {
  log.error(msg, {file: url, onLine: line});
  if (_GlobalErrorHandler) {
    _GlobalErrorHandler.apply(this, arguments);
  }
};
```

### Catch-all Server's errors example: [*Server*]

```js
const bound = Meteor.bindEnvironment((callback) => {callback();});
process.on('uncaughtException', function (err) {
  bound(() => {
    log.error('Server Crashed!', err);
    console.error(err.stack);
    process.exit(7);
  });
});
```

### Catch-all Meteor's errors example: [*Server*]

```js
// store original Meteor error
const originalMeteorDebug = Meteor._debug;
Meteor._debug = function (message, stack) {
  const additional = { message };
  additional.stack = util.inspect(stack, false, null).split('\n');
  log.error('Meteor Error!', additional);
  return originalMeteorDebug.apply(this, arguments);
};
```

### Use multiple logger(s) with different settings: [*Isomorphic*]

```js
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

## Running Tests

 1. Clone this package
 2. In Terminal (*Console*) go to directory where package is cloned
 3. Then run:

### Meteor/Tinytest

```shell
meteor test-packages ./
```

## Support this awesome package:

- Star on [GitHub](https://github.com/VeliovGroup/Meteor-logger-mongo)
- Star on [Atmosphere](https://atmospherejs.com/ostrio/loggermongo)
- [Tweet](https://twitter.com/share?url=https://github.com/VeliovGroup/Meteor-logger-mongo&text=Store%20%23meteorjs%20log%20messages%20in%20MongoDB%20%23javascript%20%23programming%20%23webdev%20via%20%40VeliovGroup)
- Share on [Facebook](https://www.facebook.com/sharer.php?u=https://github.com/VeliovGroup/Meteor-logger-mongo)

## Support our open source contribution:

- [Sponsor via GitHub](https://github.com/sponsors/dr-dimitru)
- [Support via PayPal](https://paypal.me/veliovgroup)
- Use [ostr.io](https://ostr.io) — [Monitoring](https://snmp-monitoring.com), [Analytics](https://ostr.io/info/web-analytics), [WebSec](https://domain-protection.info), [Web-CRON](https://web-cron.info) and [Pre-rendering](https://prerendering.com) for a website
