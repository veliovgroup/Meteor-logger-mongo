import { Meteor } from 'meteor/meteor';
import { Logger } from 'meteor/ostrio:logger';
import { LoggerMongo } from 'meteor/ostrio:loggermongo';
import { mongoWriteDelay, delay, waitForDocument, findDoc, clearCollection, runAssertions } from './helpers.js';

const log = new Logger();
const adapter = new LoggerMongo(log, { collectionName: 'ostrioRecordShapeTest' }).enable();
// `collection` is only assigned on the server; the client never touches Mongo.
const collection = adapter.collection;

if (Meteor.isServer) {
  clearCollection(collection);
}

// All assertions in this file are about what the server stores, so the client
// half is a no-op that simply passes.
const serverOnly = (test, done, body) => {
  if (!Meteor.isServer) {
    test.isTrue(true);
    done();
    return;
  }
  body();
};

Tinytest.addAsync('record: stores every field (userId, level, message, date, timestamp, additional)', (test, done) => {
  serverOnly(test, done, () => {
    log.info('rs-all-fields', { alpha: 1, beta: 'two' }, 'rs-user');
    runAssertions(test, [async () => {
      const doc = await waitForDocument(collection, { message: 'rs-all-fields' });
      if (!doc) return false;
      test.equal(doc.level, 'INFO');
      test.equal(doc.message, 'rs-all-fields');
      test.equal(doc.userId, 'rs-user');
      test.equal(doc.additional.alpha, 1);
      test.equal(doc.additional.beta, 'two');
      test.instanceOf(doc.date, Date);
      test.equal(typeof doc.timestamp, 'number');
      test.equal(doc.timestamp, +doc.date);
      return true;
    }], done);
  });
});

Tinytest.addAsync('record: every level is stored with its own level string', (test, done) => {
  serverOnly(test, done, () => {
    const levels = {
      info: 'INFO', debug: 'DEBUG', error: 'ERROR', fatal: 'FATAL', warn: 'WARN', log: 'LOG', _: 'LOG'
    };
    Object.keys(levels).forEach((name) => {
      log[name](`rs-level-${name}`);
    });
    runAssertions(test, Object.keys(levels).map((name) => async () => {
      const doc = await waitForDocument(collection, { message: `rs-level-${name}` });
      return !!doc && doc.level === levels[name];
    }), done);
  });
});

Tinytest.addAsync('record: object data is stored under `additional`', (test, done) => {
  serverOnly(test, done, () => {
    log.info('rs-object', { keyNull: null, keyStr: 'str', nested: { n: 1 } });
    runAssertions(test, [async () => {
      const doc = await waitForDocument(collection, { message: 'rs-object' });
      if (!doc) return false;
      test.equal(doc.additional.keyNull, null);
      test.equal(doc.additional.keyStr, 'str');
      test.equal(doc.additional.nested.n, 1);
      return true;
    }], done);
  });
});

Tinytest.addAsync('record: primitive data (string/number/boolean) is wrapped as additional.data', (test, done) => {
  serverOnly(test, done, () => {
    log.info('rs-string', 'plain string');
    log.warn('rs-number', 12345);
    log.error('rs-boolean', true);
    runAssertions(test, [
      async () => {
        const doc = await waitForDocument(collection, { message: 'rs-string' });
        return !!doc && doc.additional.data === 'plain string';
      },
      async () => {
        const doc = await waitForDocument(collection, { message: 'rs-number' });
        return !!doc && doc.additional.data === 12345;
      },
      async () => {
        const doc = await waitForDocument(collection, { message: 'rs-boolean' });
        return !!doc && doc.additional.data === true;
      }
    ], done);
  });
});

Tinytest.addAsync('record: missing/null data stores an empty additional object', (test, done) => {
  serverOnly(test, done, () => {
    log.info('rs-no-data');
    log.info('rs-null-data', null);
    log.info('rs-undefined-data', undefined);
    runAssertions(test, ['rs-no-data', 'rs-null-data', 'rs-undefined-data'].map((message) => async () => {
      const doc = await waitForDocument(collection, { message });
      return !!doc && typeof doc.additional === 'object' && Object.keys(doc.additional).length === 0;
    }), done);
  });
});

Tinytest.addAsync('record: circular references are replaced with [Circular]', (test, done) => {
  serverOnly(test, done, () => {
    const circular = { time: new Date(), subObj: { keyStr: 'str' } };
    circular.subObj.do = circular;
    log.info('rs-circular', circular);
    runAssertions(test, [async () => {
      const doc = await waitForDocument(collection, { message: 'rs-circular' });
      if (!doc) return false;
      test.equal(doc.additional.subObj.keyStr, 'str');
      test.isTrue(String(doc.additional.subObj.do).includes('[Circular]'));
      return true;
    }], done);
  });
});

Tinytest.addAsync('record: TRACE stores a stackTrace inside additional', (test, done) => {
  serverOnly(test, done, () => {
    log.trace('rs-trace', { data: 'trace payload' });
    runAssertions(test, [async () => {
      const doc = await waitForDocument(collection, { message: 'rs-trace' });
      return !!doc && !!doc.additional && typeof doc.additional.stackTrace === 'string' && doc.additional.stackTrace.length > 0;
    }], done);
  });
});

Tinytest.addAsync('record: userId defaults to null when not supplied', (test, done) => {
  serverOnly(test, done, () => {
    log.info('rs-no-user');
    runAssertions(test, [async () => {
      const doc = await waitForDocument(collection, { message: 'rs-no-user' });
      // settle so we are reading the persisted record, not a half-written one
      await delay(mongoWriteDelay);
      return !!doc && (doc.userId === null || typeof doc.userId === 'undefined');
    }], done);
  });
});
