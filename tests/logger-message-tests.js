import { Meteor } from 'meteor/meteor';
import { Logger, LoggerMessage } from 'meteor/ostrio:logger';
import { LoggerMongo } from 'meteor/ostrio:loggermongo';

// A live adapter is wired up so these tests exercise the real logging path, but
// they assert on the synchronously-returned LoggerMessage, not on Mongo.
const log = new Logger();
new LoggerMongo(log, { collectionName: 'ostrioLoggerMessageTest' }).enable();

// name -> level string produced by that shortcut method.
const methods = {
  info: 'INFO',
  debug: 'DEBUG',
  error: 'ERROR',
  fatal: 'FATAL',
  warn: 'WARN',
  trace: 'TRACE',
  log: 'LOG',
  _: 'LOG'
};

Tinytest.add('LoggerMessage: every method returns a LoggerMessage', (test) => {
  Object.keys(methods).forEach((name) => {
    const result = log[name](`msg ${name}`, { data: `data ${name}` }, `user ${name}`);
    test.instanceOf(result, LoggerMessage);
    test.equal(result.level, methods[name]);
  });
});

Tinytest.add('LoggerMessage: exposes message, details and userId', (test) => {
  const result = log.info('shape message', { data: 'shape data' }, 'shape-user');
  test.equal(result.message, 'shape message');
  test.equal(result.reason, 'shape message');
  test.equal(result.userId, 'shape-user');
  test.equal(result.user, 'shape-user');
  test.equal(result.details.data, 'shape data');
  test.equal(result.data.data, 'shape data');
});

Tinytest.add('LoggerMessage#toString', (test) => {
  test.equal(
    log.info('This is message "info"', { data: 'Sample data "info"' }, 'userId "info"').toString(),
    '[This is message "info"] \nLevel: INFO; \nDetails: {"data":"Sample data \\"info\\""}; \nUserId: userId "info";'
  );
  test.equal(
    log.error('This is message "error"', { data: 'Sample data "error"' }, 'userId "error"').toString(),
    '[This is message "error"] \nLevel: ERROR; \nDetails: {"data":"Sample data \\"error\\""}; \nUserId: userId "error";'
  );
  test.equal(
    log._('This is message "_"', { data: 'Sample data "_"' }, 'userId "_"').toString(),
    '[This is message "_"] \nLevel: LOG; \nDetails: {"data":"Sample data \\"_\\""}; \nUserId: userId "_";'
  );
});

Tinytest.add('LoggerMessage: can be thrown and caught', (test) => {
  try {
    throw log.fatal('thrown fatal', { data: 'boom' }, 'thrower');
    // eslint-disable-next-line no-unreachable
    test.fail('expected throw');
  } catch (e) {
    test.instanceOf(e, LoggerMessage);
    test.equal(e.level, 'FATAL');
    test.equal(e.message, 'thrown fatal');
    test.equal(e.toString(), '[thrown fatal] \nLevel: FATAL; \nDetails: {"data":"boom"}; \nUserId: thrower;');
  }
});

Tinytest.add('LoggerMessage: number, boolean and missing arguments still return a message', (test) => {
  Object.keys(methods).forEach((name) => {
    test.instanceOf(log[name](10, { data: 10 }, 10), LoggerMessage); // numbers
    test.instanceOf(log[name]('bool', true), LoggerMessage); // boolean data
    test.instanceOf(log[name]('str', 'string value'), LoggerMessage); // string data
    test.instanceOf(log[name](42), LoggerMessage); // no data
    test.instanceOf(log[name](), LoggerMessage); // no arguments
    test.instanceOf(log[name]('wrong', undefined), LoggerMessage); // undefined data
    test.instanceOf(log[name]('wrong', []), LoggerMessage); // array data
  });
});

Tinytest.add('LoggerMessage: TRACE attaches a stack trace to the returned message', (test) => {
  if (!Meteor.isServer) {
    test.isTrue(true);
    return;
  }
  const traced = log.trace('traced message', { data: 'trace data' });
  test.isTrue(Object.prototype.hasOwnProperty.call(traced.details, 'stackTrace'));
  test.isTrue(Object.prototype.hasOwnProperty.call(traced.data, 'stackTrace'));
  test.equal(typeof traced.data.stackTrace, 'string');
});
