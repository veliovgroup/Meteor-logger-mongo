import { Mongo } from 'meteor/mongo';
import { Meteor } from 'meteor/meteor';
import { Logger, LoggerMessage } from 'meteor/ostrio:logger';
import { LoggerMongo } from 'meteor/ostrio:loggermongo';

const collectionRemove = async (collection, selector = {}) => {
  if (collection.removeAsync) {
    await collection.removeAsync(selector);
    return;
  }
  collection.remove(selector);
};

const collectionFindOne = async (collection, selector) => {
  if (collection.findOneAsync) {
    return collection.findOneAsync(selector);
  }
  return collection.findOne(selector);
};

const log = new Logger();
const mongoLogger = (new LoggerMongo(log)).enable();

const mongoWriteDelay = String(Meteor.release).startsWith('METEOR@3') ? 1500 : 256;
const clientToServerTimeout = String(Meteor.release).startsWith('METEOR@3') ? 15000 : 10000;

// Client->server writes land only after the browser connects over DDP and its
// `_logger_emit_Mongo` method round-trips. There is no fixed delay that is both
// fast and reliable, so poll the collection until the document appears (or the
// shared deadline elapses) instead of guessing a single timeout.
const waitForDocument = async (collection, selector, deadline) => {
  let doc = await collectionFindOne(collection, selector);
  while (!doc && Date.now() < deadline) {
    await new Promise((resolve) => Meteor.setTimeout(resolve, 100));
    doc = await collectionFindOne(collection, selector);
  }
  return doc;
};

if (Meteor.isServer) {
  collectionRemove(mongoLogger.collection);
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
  test.instanceOf(log.info(10, {}), LoggerMessage);
  test.instanceOf(log.debug(20, {}), LoggerMessage);
  test.instanceOf(log.error(30, {}), LoggerMessage);
  test.instanceOf(log.fatal(40, {}), LoggerMessage);
  test.instanceOf(log.warn(50, {}), LoggerMessage);
  test.instanceOf(log.trace(60, {}), LoggerMessage);
  test.instanceOf(log._(70, {}), LoggerMessage);
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
  test.instanceOf(log.trace('trace', {value: true}), LoggerMessage);
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

const assertWritten = (test, assertions, done) => {
  const run = async () => {
    for (let i = 0; i < assertions.length; i++) {
      const ok = await assertions[i]();
      if (!ok) {
        test.isTrue(false);
        done();
        return;
      }
    }
    done();
  };
  run().catch((err) => {
    test.fail(err && err.message ? err.message : String(err));
    done();
  });
};

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
      assertWritten(test, [
        async () => {
          const doc = await collectionFindOne(mongoLogger.collection, {message: 'Circular 10'});
          return doc && doc.additional.subObj.do.includes('[Circular]');
        },
        async () => {
          const doc = await collectionFindOne(mongoLogger.collection, {message: 'Circular 20'});
          return doc && doc.additional.subObj.do.includes('[Circular]');
        },
        async () => {
          const doc = await collectionFindOne(mongoLogger.collection, {message: 'Circular 30'});
          return doc && doc.additional.subObj.do.includes('[Circular]');
        },
        async () => {
          const doc = await collectionFindOne(mongoLogger.collection, {message: 'Circular 40'});
          return doc && doc.additional.subObj.do.includes('[Circular]');
        },
        async () => {
          const doc = await collectionFindOne(mongoLogger.collection, {message: 'Circular 50'});
          return doc && doc.additional.subObj.do.includes('[Circular]');
        },
        async () => {
          const doc = await collectionFindOne(mongoLogger.collection, {message: 'Circular 60'});
          return doc && doc.additional.subObj.do.includes('[Circular]');
        },
        async () => {
          const doc = await collectionFindOne(mongoLogger.collection, {message: 'Circular 70'});
          return doc && doc.additional.subObj.do.includes('[Circular]');
        }
      ], done);
    }, mongoWriteDelay);
  } else {
    done();
  }
});

Tinytest.add('Trace', (test) => {
  if (Meteor.isServer) {
    const traced = log.trace(602, {data: 602}, 602);
    test.isTrue(Object.prototype.hasOwnProperty.call(traced.details, 'stackTrace'));
    test.isTrue(Object.prototype.hasOwnProperty.call(traced.data, 'stackTrace'));
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
      assertWritten(test, [
        async () => !!await collectionFindOne(mongoLogger.collection, {message: 'cwdwods Test "info"'}),
        async () => !!await collectionFindOne(mongoLogger.collection, {message: 'cwdwods Test "debug"'}),
        async () => !!await collectionFindOne(mongoLogger.collection, {message: 'cwdwods Test "error"'}),
        async () => !!await collectionFindOne(mongoLogger.collection, {message: 'cwdwods Test "fatal"'}),
        async () => !!await collectionFindOne(mongoLogger.collection, {message: 'cwdwods Test "warn"'}),
        async () => {
          const traceDoc = await collectionFindOne(mongoLogger.collection, {message: 'cwdwods Test "trace"'});
          return !!traceDoc && traceDoc.additional && traceDoc.additional.stackTrace;
        },
        async () => !!await collectionFindOne(mongoLogger.collection, {message: 'cwdwods Test "_"'})
      ], done);
    }, mongoWriteDelay);
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
      assertWritten(test, [
        async () => !!await collectionFindOne(mongoLogger.collection, {'additional.data': 'cwdwds Test "info"'}),
        async () => !!await collectionFindOne(mongoLogger.collection, {message: 103}),
        async () => !!await collectionFindOne(mongoLogger.collection, {'additional.data': 'cwdwds Test "debug"'}),
        async () => !!await collectionFindOne(mongoLogger.collection, {message: 203}),
        async () => !!await collectionFindOne(mongoLogger.collection, {'additional.data': 'cwdwds Test "error"'}),
        async () => !!await collectionFindOne(mongoLogger.collection, {message: 303}),
        async () => !!await collectionFindOne(mongoLogger.collection, {'additional.data': 'cwdwds Test "fatal"'}),
        async () => !!await collectionFindOne(mongoLogger.collection, {message: 403}),
        async () => !!await collectionFindOne(mongoLogger.collection, {'additional.data': 'cwdwds Test "warn"'}),
        async () => !!await collectionFindOne(mongoLogger.collection, {message: 503}),
        async () => !!await collectionFindOne(mongoLogger.collection, {'additional.data': 'cwdwds Test "trace"'}),
        async () => {
          const traceDoc603 = await collectionFindOne(mongoLogger.collection, {message: 603});
          return !!traceDoc603 && traceDoc603.additional && traceDoc603.additional.stackTrace;
        },
        async () => !!await collectionFindOne(mongoLogger.collection, {'additional.data': 'cwdwds Test "_"'}),
        async () => !!await collectionFindOne(mongoLogger.collection, {message: 703})
      ], done);
    }, mongoWriteDelay);
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
    const deadline = Date.now() + clientToServerTimeout;
    assertWritten(test, [
      async () => !!await waitForDocument(mongoLogger.collection, {message: 'cwdwodfc2s Test "info"'}, deadline),
      async () => !!await waitForDocument(mongoLogger.collection, {message: 'cwdwodfc2s Test "debug"'}, deadline),
      async () => !!await waitForDocument(mongoLogger.collection, {message: 'cwdwodfc2s Test "error"'}, deadline),
      async () => !!await waitForDocument(mongoLogger.collection, {message: 'cwdwodfc2s Test "fatal"'}, deadline),
      async () => !!await waitForDocument(mongoLogger.collection, {message: 'cwdwodfc2s Test "warn"'}, deadline),
      async () => {
        const traceDocClient = await waitForDocument(mongoLogger.collection, {message: 'cwdwodfc2s Test "trace"'}, deadline);
        return !!traceDocClient && traceDocClient.additional && traceDocClient.additional.stackTrace;
      },
      async () => !!await waitForDocument(mongoLogger.collection, {message: 'cwdwodfc2s Test "_"'}, deadline)
    ], done);
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
    const deadline = Date.now() + clientToServerTimeout;
    assertWritten(test, [
      async () => !!await waitForDocument(mongoLogger.collection, {'additional.data': 'cwdwdfc2s Test "info"'}, deadline),
      async () => !!await waitForDocument(mongoLogger.collection, {message: 100}, deadline),
      async () => !!await waitForDocument(mongoLogger.collection, {'additional.data': 'cwdwdfc2s Test "debug"'}, deadline),
      async () => !!await waitForDocument(mongoLogger.collection, {message: 200}, deadline),
      async () => !!await waitForDocument(mongoLogger.collection, {'additional.data': 'cwdwdfc2s Test "error"'}, deadline),
      async () => !!await waitForDocument(mongoLogger.collection, {message: 300}, deadline),
      async () => !!await waitForDocument(mongoLogger.collection, {'additional.data': 'cwdwdfc2s Test "fatal"'}, deadline),
      async () => !!await waitForDocument(mongoLogger.collection, {message: 400}, deadline),
      async () => !!await waitForDocument(mongoLogger.collection, {'additional.data': 'cwdwdfc2s Test "warn"'}, deadline),
      async () => !!await waitForDocument(mongoLogger.collection, {message: 500}, deadline),
      async () => !!await waitForDocument(mongoLogger.collection, {'additional.data': 'cwdwdfc2s Test "trace"'}, deadline),
      async () => {
        const traceDocClientData = await waitForDocument(mongoLogger.collection, {'additional.data': 'cwdwdfc2s Test "trace"'}, deadline);
        return !!traceDocClientData && traceDocClientData.additional && traceDocClientData.additional.stackTrace;
      },
      async () => !!await waitForDocument(mongoLogger.collection, {message: 600}, deadline),
      async () => !!await waitForDocument(mongoLogger.collection, {'additional.data': 'cwdwdfc2s Test "_"'}, deadline),
      async () => !!await waitForDocument(mongoLogger.collection, {message: 700}, deadline)
    ], done);
  } else {
    test.isTrue(true);
    done();
  }
});

if (Meteor.isServer) {
  Tinytest.addAsync('enable filter ERROR only', (test, done) => {
    const logFilter = new Logger();
    const filterLogger = new LoggerMongo(logFilter, {collectionName: 'ostrioMongoLoggerFilterTest'});
    Promise.resolve(collectionRemove(filterLogger.collection)).then(() => {
      filterLogger.enable({filter: ['ERROR']});
      logFilter.info('filter-skip-info');
      logFilter.error('filter-keep-error');
      Meteor.setTimeout(() => {
        assertWritten(test, [
          async () => !await collectionFindOne(filterLogger.collection, {message: 'filter-skip-info'}),
          async () => !!await collectionFindOne(filterLogger.collection, {message: 'filter-keep-error'})
        ], () => {
          collectionRemove(filterLogger.collection);
          done();
        });
      }, mongoWriteDelay);
    });
  });

  Tinytest.addAsync('custom collection', (test, done) => {
    const logCustom = new Logger();
    const customCol = new Mongo.Collection('ostrioMongoLoggerCustomTest');
    Promise.resolve(collectionRemove(customCol)).then(() => {
      const customLogger = new LoggerMongo(logCustom, {collection: customCol});
      customLogger.enable();
      logCustom.info('custom-collection-msg');
      Meteor.setTimeout(() => {
        assertWritten(test, [
          async () => !!await collectionFindOne(customCol, {message: 'custom-collection-msg'})
        ], () => {
          collectionRemove(customCol);
          done();
        });
      }, mongoWriteDelay);
    });
  });

  Tinytest.add('options.format must return object', (test) => {
    const logFmt = new Logger();
    const fmtLogger = new LoggerMongo(logFmt, {
      collectionName: 'ostrioMongoLoggerFormatTest',
      format: () => null
    });
    fmtLogger.enable();
    test.throws(() => {
      logFmt.info('format-fail');
    }, /Must return a plain Object/);
  });
}
