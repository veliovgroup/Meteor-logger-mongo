import { _ } from 'meteor/underscore';
import { Meteor } from 'meteor/meteor';
import { LoggerMongo } from 'meteor/ostrio:loggermongo';
import { Logger, LoggerMessage } from 'meteor/ostrio:logger';

const log = new Logger();
const mongoLogger = (new LoggerMongo(log)).enable();

if (Meteor.isServer) {
  mongoLogger.collection.remove({});
}

Tinytest.add('LoggerMessage Instance', (test) => {
  test.instanceOf(log.info('This is message "info"', {data: 'Sample data "info"'}, 'userId "info"'), LoggerMessage);
  test.instanceOf(log.debug('This is message "debug"', {data: 'Sample data "debug"'}, 'userId "debug"'), LoggerMessage);
  test.instanceOf(log.error('This is message "error"', {data: 'Sample data "error"'}, 'userId "error"'), LoggerMessage);
  test.instanceOf(log.fatal('This is message "fatal"', {data: 'Sample data "fatal"'}, 'userId "fatal"'), LoggerMessage);
  test.instanceOf(log.warn('This is message "warn"', {data: 'Sample data "warn"'}, 'userId "warn"'), LoggerMessage);
  test.instanceOf(log.trace('This is message "trace"', {data: 'Sample data "trace"'}, 'userId "trace"'), LoggerMessage);
  test.instanceOf(log._('This is message "_"', {data: 'Sample data "_"'}, 'userId "_"'), LoggerMessage);
});

Tinytest.add('LoggerMessage#toString', (test) => {
  test.equal(log.info('This is message "info"', {data: 'Sample data "info"'}, 'userId "info"').toString(), '[This is message "info"] \nLevel: INFO; \nDetails: {"data":"Sample data \\"info\\""}; \nUserId: userId "info";');
  test.equal(log.debug('This is message "debug"', {data: 'Sample data "debug"'}, 'userId "debug"').toString(), '[This is message "debug"] \nLevel: DEBUG; \nDetails: {"data":"Sample data \\"debug\\""}; \nUserId: userId "debug";');
  test.equal(log.error('This is message "error"', {data: 'Sample data "error"'}, 'userId "error"').toString(), '[This is message "error"] \nLevel: ERROR; \nDetails: {"data":"Sample data \\"error\\""}; \nUserId: userId "error";');
  test.equal(log.fatal('This is message "fatal"', {data: 'Sample data "fatal"'}, 'userId "fatal"').toString(), '[This is message "fatal"] \nLevel: FATAL; \nDetails: {"data":"Sample data \\"fatal\\""}; \nUserId: userId "fatal";');
  test.equal(log.warn('This is message "warn"', {data: 'Sample data "warn"'}, 'userId "warn"').toString(), '[This is message "warn"] \nLevel: WARN; \nDetails: {"data":"Sample data \\"warn\\""}; \nUserId: userId "warn";');
  test.equal(log._('This is message "_"', {data: 'Sample data "_"'}, 'userId "_"').toString(), '[This is message "_"] \nLevel: LOG; \nDetails: {"data":"Sample data \\"_\\""}; \nUserId: userId "_";');
});

Tinytest.add('Throw', (test) => {
  try {
    throw log.fatal('This is message "fatal"', {data: 'Sample data "fatal"'}, 'userId "fatal"');
  } catch (e) {
    test.instanceOf(e, LoggerMessage);
    test.equal(e.level, 'FATAL');
    test.equal(e.toString(), '[This is message "fatal"] \nLevel: FATAL; \nDetails: {"data":"Sample data \\"fatal\\""}; \nUserId: userId "fatal";');
  }
});

Tinytest.add('Log a Number', (test) => {
  test.instanceOf(log.info(10, {data: 10}, 10), LoggerMessage);
  test.instanceOf(log.debug(20, {data: 20}, 20), LoggerMessage);
  test.instanceOf(log.error(30, {data: 30}, 30), LoggerMessage);
  test.instanceOf(log.fatal(40, {data: 40}, 40), LoggerMessage);
  test.instanceOf(log.warn(50, {data: 50}, 50), LoggerMessage);
  test.instanceOf(log.trace(60, {data: 60}, 60), LoggerMessage);
  test.instanceOf(log._(70, {data: 70}, 70), LoggerMessage);
});

Tinytest.add('Log a null', (test) => {
  test.instanceOf(log.info(10, null), LoggerMessage);
  test.instanceOf(log.debug(20, null), LoggerMessage);
  test.instanceOf(log.error(30, null), LoggerMessage);
  test.instanceOf(log.fatal(40, null), LoggerMessage);
  test.instanceOf(log.warn(50, null), LoggerMessage);
  test.instanceOf(log.trace(60, null), LoggerMessage);
  test.instanceOf(log._(70, null), LoggerMessage);
});

Tinytest.add('Log a Object', (test) => {
  test.instanceOf(log.info(10, {keyNull: null, keyStr: 'str'}), LoggerMessage);
  test.instanceOf(log.debug(20, {keyNull: null, keyStr: 'str'}), LoggerMessage);
  test.instanceOf(log.error(30, {keyNull: null, keyStr: 'str'}), LoggerMessage);
  test.instanceOf(log.fatal(40, {keyNull: null, keyStr: 'str'}), LoggerMessage);
  test.instanceOf(log.warn(50, {keyNull: null, keyStr: 'str'}), LoggerMessage);
  test.instanceOf(log.trace(60, {keyNull: null, keyStr: 'str'}), LoggerMessage);
  test.instanceOf(log._(70, {keyNull: null, keyStr: 'str'}), LoggerMessage);
});

Tinytest.add('Log a String', (test) => {
  test.instanceOf(log.info(10, 'string value'), LoggerMessage);
  test.instanceOf(log.debug(20, 'string value'), LoggerMessage);
  test.instanceOf(log.error(30, 'string value'), LoggerMessage);
  test.instanceOf(log.fatal(40, 'string value'), LoggerMessage);
  test.instanceOf(log.warn(50, 'string value'), LoggerMessage);
  test.instanceOf(log.trace(60, 'string value'), LoggerMessage);
  test.instanceOf(log._(70, 'string value'), LoggerMessage);
});

Tinytest.add('Log with wrong arguments', (test) => {
  test.instanceOf(log.info('info wrong values', false), LoggerMessage);
  test.instanceOf(log.debug('debug wrong values', true), LoggerMessage);
  test.instanceOf(log.error('error wrong values', true), LoggerMessage);
  test.instanceOf(log.fatal('fatal wrong values', false), LoggerMessage);
  test.instanceOf(log.warn('warn wrong values', undefined), LoggerMessage);
  test.instanceOf(log.trace('trace wrong values', ''), LoggerMessage);
  test.instanceOf(log._('_ wrong values', []), LoggerMessage);
});

Tinytest.add('Log Boolean message', (test) => {
  test.instanceOf(log.info('info', true), LoggerMessage);
  test.instanceOf(log.debug('debug', true), LoggerMessage);
  test.instanceOf(log.error('error', false), LoggerMessage);
  test.instanceOf(log.fatal('fatal', false), LoggerMessage);
  test.instanceOf(log.warn('warn', true), LoggerMessage);
  test.instanceOf(log.trace('trace', true), LoggerMessage);
  test.instanceOf(log._('_', true), LoggerMessage);
});

Tinytest.add('Log without message', (test) => {
  test.instanceOf(log.info(10), LoggerMessage);
  test.instanceOf(log.debug(20), LoggerMessage);
  test.instanceOf(log.error(30), LoggerMessage);
  test.instanceOf(log.fatal(40), LoggerMessage);
  test.instanceOf(log.warn(50), LoggerMessage);
  test.instanceOf(log.trace(60), LoggerMessage);
  test.instanceOf(log._(70), LoggerMessage);
});

Tinytest.add('Log without arguments', (test) => {
  test.instanceOf(log.info(), LoggerMessage);
  test.instanceOf(log.debug(), LoggerMessage);
  test.instanceOf(log.error(), LoggerMessage);
  test.instanceOf(log.fatal(), LoggerMessage);
  test.instanceOf(log.warn(), LoggerMessage);
  test.instanceOf(log.trace(), LoggerMessage);
  test.instanceOf(log._(), LoggerMessage);
});

const dataObj = {
  time: new Date,
  subObj: {
    keyStr: 'str'
  }
};

dataObj.subObj.do = dataObj;

Tinytest.addAsync('Log a Circular', (test, done) => {
  test.instanceOf(log.info('Circular 10', dataObj), LoggerMessage);
  test.instanceOf(log.debug('Circular 20', dataObj), LoggerMessage);
  test.instanceOf(log.error('Circular 30', dataObj), LoggerMessage);
  test.instanceOf(log.fatal('Circular 40', dataObj), LoggerMessage);
  test.instanceOf(log.warn('Circular 50', dataObj), LoggerMessage);
  test.instanceOf(log.trace('Circular 60', dataObj), LoggerMessage);
  test.instanceOf(log._('Circular 70', dataObj), LoggerMessage);

  if (Meteor.isServer) {
    Meteor.setTimeout(() => {
      test.isTrue(mongoLogger.collection.findOne({message: 'Circular 10'}).additional.subObj.do.includes('[Circular]'));
      test.isTrue(mongoLogger.collection.findOne({message: 'Circular 10'}).additional.subObj.do.includes('[Circular]'));
      test.isTrue(mongoLogger.collection.findOne({message: 'Circular 20'}).additional.subObj.do.includes('[Circular]'));
      test.isTrue(mongoLogger.collection.findOne({message: 'Circular 30'}).additional.subObj.do.includes('[Circular]'));
      test.isTrue(mongoLogger.collection.findOne({message: 'Circular 40'}).additional.subObj.do.includes('[Circular]'));
      test.isTrue(mongoLogger.collection.findOne({message: 'Circular 50'}).additional.subObj.do.includes('[Circular]'));
      test.isTrue(mongoLogger.collection.findOne({message: 'Circular 60'}).additional.subObj.do.includes('[Circular]'));
      test.isTrue(mongoLogger.collection.findOne({message: 'Circular 70'}).additional.subObj.do.includes('[Circular]'));
      done();
    }, 256);
  } else {
    done();
  }
});

Tinytest.add('Trace', (test) => {
  if (Meteor.isServer) {
    test.isTrue(_.has(log.trace(602, {data: 602}, 602).details, 'stackTrace'));
    test.isTrue(_.has(log.trace(602, {data: 602}, 602).data, 'stackTrace'));
  } else {
    test.isTrue(true);
  }
});

Tinytest.addAsync('Check written data, without {data} [SERVER]', (test, done) => {
  if (Meteor.isServer) {
    log.info('cwdwods Test "info"');
    log.debug('cwdwods Test "debug"');
    log.error('cwdwods Test "error"');
    log.fatal('cwdwods Test "fatal"');
    log.warn('cwdwods Test "warn"');
    log.trace('cwdwods Test "trace"');
    log._('cwdwods Test "_"');

    Meteor.setTimeout(() => {
      test.isTrue(!!mongoLogger.collection.findOne({message: 'cwdwods Test "info"'}));
      test.isTrue(!!mongoLogger.collection.findOne({message: 'cwdwods Test "debug"'}));
      test.isTrue(!!mongoLogger.collection.findOne({message: 'cwdwods Test "error"'}));
      test.isTrue(!!mongoLogger.collection.findOne({message: 'cwdwods Test "fatal"'}));
      test.isTrue(!!mongoLogger.collection.findOne({message: 'cwdwods Test "warn"'}));
      test.isTrue(!!mongoLogger.collection.findOne({message: 'cwdwods Test "trace"'}));
      test.isTrue(!!mongoLogger.collection.findOne({message: 'cwdwods Test "trace"'}).additional.stackTrace);
      test.isTrue(!!mongoLogger.collection.findOne({message: 'cwdwods Test "_"'}));

      done();
    }, 256);
  } else {
    test.isTrue(true);
    done();
  }
});

Tinytest.addAsync('Check written data, with {data} [SERVER]', (test, done) => {
  if (Meteor.isServer) {
    log.info(103, {data: 'cwdwds Test "info"'});
    log.debug(203, {data: 'cwdwds Test "debug"'});
    log.error(303, {data: 'cwdwds Test "error"'});
    log.fatal(403, {data: 'cwdwds Test "fatal"'});
    log.warn(503, {data: 'cwdwds Test "warn"'});
    log.trace(603, {data: 'cwdwds Test "trace"'});
    log._(703, {data: 'cwdwds Test "_"'});

    Meteor.setTimeout(() => {
      test.isTrue(!!mongoLogger.collection.findOne({'additional.data': 'cwdwds Test "info"'}), 'Data test: info');
      test.isTrue(!!mongoLogger.collection.findOne({message: 103}), 'Number test: 10');
      test.isTrue(!!mongoLogger.collection.findOne({'additional.data': 'cwdwds Test "debug"'}), 'Data test: debug');
      test.isTrue(!!mongoLogger.collection.findOne({message: 203}), 'Number test: 20');
      test.isTrue(!!mongoLogger.collection.findOne({'additional.data': 'cwdwds Test "error"'}), 'Data test: error');
      test.isTrue(!!mongoLogger.collection.findOne({message: 303}), 'Number test: 30');
      test.isTrue(!!mongoLogger.collection.findOne({'additional.data': 'cwdwds Test "fatal"'}), 'Data test: fatal');
      test.isTrue(!!mongoLogger.collection.findOne({message: 403}), 'Number test: 40');
      test.isTrue(!!mongoLogger.collection.findOne({'additional.data': 'cwdwds Test "warn"'}), 'Data test: warn');
      test.isTrue(!!mongoLogger.collection.findOne({message: 503}), 'Number test: 50');
      test.isTrue(!!mongoLogger.collection.findOne({'additional.data': 'cwdwds Test "trace"'}), 'Data test: trace');
      test.isTrue(!!mongoLogger.collection.findOne({message: 603}), 'Data test: stackTrace');
      test.isTrue(!!mongoLogger.collection.findOne({message: 603}).additional.stackTrace, 'Number test: 60');
      test.isTrue(!!mongoLogger.collection.findOne({'additional.data': 'cwdwds Test "_"'}), 'Data test: _');
      test.isTrue(!!mongoLogger.collection.findOne({message: 703}), 'Number test: 70');
      done();
    }, 256);
  } else {
    test.isTrue(true);
    done();
  }
});


if (Meteor.isClient) {
  log.info('cwdwodfc2s Test "info"');
  log.debug('cwdwodfc2s Test "debug"');
  log.error('cwdwodfc2s Test "error"');
  log.fatal('cwdwodfc2s Test "fatal"');
  log.warn('cwdwodfc2s Test "warn"');
  log.trace('cwdwodfc2s Test "trace"');
  log._('cwdwodfc2s Test "_"');
}

Tinytest.addAsync('Check written data, without {data} [From CLIENT to SERVER]', (test, done) => {
  if (Meteor.isServer) {
    Meteor.setTimeout(() => {
      test.isTrue(!!mongoLogger.collection.findOne({message: 'cwdwodfc2s Test "info"'}));
      test.isTrue(!!mongoLogger.collection.findOne({message: 'cwdwodfc2s Test "debug"'}));
      test.isTrue(!!mongoLogger.collection.findOne({message: 'cwdwodfc2s Test "error"'}));
      test.isTrue(!!mongoLogger.collection.findOne({message: 'cwdwodfc2s Test "fatal"'}));
      test.isTrue(!!mongoLogger.collection.findOne({message: 'cwdwodfc2s Test "warn"'}));
      test.isTrue(!!mongoLogger.collection.findOne({message: 'cwdwodfc2s Test "trace"'}));
      test.isTrue(!!mongoLogger.collection.findOne({message: 'cwdwodfc2s Test "trace"'}).additional.stackTrace);
      test.isTrue(!!mongoLogger.collection.findOne({message: 'cwdwodfc2s Test "_"'}));
      done();
    }, 512);
  } else {
    test.isTrue(true);
    done();
  }
});

if (Meteor.isClient) {
  log.info(100, {data: 'cwdwdfc2s Test "info"'});
  log.debug(200, {data: 'cwdwdfc2s Test "debug"'});
  log.error(300, {data: 'cwdwdfc2s Test "error"'});
  log.fatal(400, {data: 'cwdwdfc2s Test "fatal"'});
  log.warn(500, {data: 'cwdwdfc2s Test "warn"'});
  log.trace(600, {data: 'cwdwdfc2s Test "trace"'});
  log._(700, {data: 'cwdwdfc2s Test "_"'});
}

Tinytest.addAsync('Check written data, with data [From CLIENT to SERVER]', (test, done) => {
  if (Meteor.isServer) {
    Meteor.setTimeout(() => {
      test.isTrue(!!mongoLogger.collection.findOne({'additional.data': 'cwdwdfc2s Test "info"'}), 'Data test: info');
      test.isTrue(!!mongoLogger.collection.findOne({message: 100}), 'Number test: 10');
      test.isTrue(!!mongoLogger.collection.findOne({'additional.data': 'cwdwdfc2s Test "debug"'}), 'Data test: debug');
      test.isTrue(!!mongoLogger.collection.findOne({message: 200}), 'Number test: 20');
      test.isTrue(!!mongoLogger.collection.findOne({'additional.data': 'cwdwdfc2s Test "error"'}), 'Data test: error');
      test.isTrue(!!mongoLogger.collection.findOne({message: 300}), 'Number test: 30');
      test.isTrue(!!mongoLogger.collection.findOne({'additional.data': 'cwdwdfc2s Test "fatal"'}), 'Data test: fatal');
      test.isTrue(!!mongoLogger.collection.findOne({message: 400}), 'Number test: 40');
      test.isTrue(!!mongoLogger.collection.findOne({'additional.data': 'cwdwdfc2s Test "warn"'}), 'Data test: warn');
      test.isTrue(!!mongoLogger.collection.findOne({message: 500}), 'Number test: 50');
      test.isTrue(!!mongoLogger.collection.findOne({'additional.data': 'cwdwdfc2s Test "trace"'}), 'Data test: trace');
      test.isTrue(!!mongoLogger.collection.findOne({'additional.data': 'cwdwdfc2s Test "trace"'}).additional.stackTrace);
      test.isTrue(!!mongoLogger.collection.findOne({message: 600}), 'Number test: 60');
      test.isTrue(!!mongoLogger.collection.findOne({'additional.data': 'cwdwdfc2s Test "_"'}), 'Data test: _');
      test.isTrue(!!mongoLogger.collection.findOne({message: 700}), 'Number test: 70');
      done();
    }, 512);
  } else {
    test.isTrue(true);
    done();
  }
});
