import { Meteor } from 'meteor/meteor';
import { Logger } from 'meteor/ostrio:logger';
import { LoggerMongo } from 'meteor/ostrio:loggermongo';
import { clearCollection, waitForDocument, assertClientToServerWritten } from './helpers.js';

// Same source file runs in both environments, so this Logger is constructed in
// the same order on client and server and its `_logger_emit_Mongo` method name
// (derived from the instance prefix) lines up across the DDP bridge.
const log = new Logger();
const adapter = new LoggerMongo(log, { collectionName: 'ostrioClientToServerTest' }).enable();
const collection = adapter.collection;

if (Meteor.isServer) {
  clearCollection(collection);
}

const emitWithoutData = () => {
  log.info('c2s-without info');
  log.debug('c2s-without debug');
  log.error('c2s-without error');
  log.fatal('c2s-without fatal');
  log.warn('c2s-without warn');
  log.trace('c2s-without trace');
  log._('c2s-without _');
};

const emitWithData = () => {
  log.info(100, { data: 'c2s-with info' });
  log.debug(200, { data: 'c2s-with debug' });
  log.error(300, { data: 'c2s-with error' });
  log.fatal(400, { data: 'c2s-with fatal' });
  log.warn(500, { data: 'c2s-with warn' });
  log.trace(600, { data: 'c2s-with trace' });
  log._(700, { data: 'c2s-with _' });
};

// Emit at load time on the client so the writes are already in flight by the
// time the server-side test starts polling.
if (Meteor.isClient) {
  emitWithoutData();
}

Tinytest.addAsync('client->server: logs without {data} reach the server collection', (test, done) => {
  if (Meteor.isServer) {
    assertClientToServerWritten(test, [
      async (t) => !!await waitForDocument(collection, { message: 'c2s-without info' }, t),
      async (t) => !!await waitForDocument(collection, { message: 'c2s-without debug' }, t),
      async (t) => !!await waitForDocument(collection, { message: 'c2s-without error' }, t),
      async (t) => !!await waitForDocument(collection, { message: 'c2s-without fatal' }, t),
      async (t) => !!await waitForDocument(collection, { message: 'c2s-without warn' }, t),
      async (t) => {
        const doc = await waitForDocument(collection, { message: 'c2s-without trace' }, t);
        return !!doc && !!doc.additional && typeof doc.additional.stackTrace === 'string';
      },
      async (t) => !!await waitForDocument(collection, { message: 'c2s-without _' }, t)
    ], done);
  } else {
    emitWithoutData();
    test.isTrue(true);
    done();
  }
});

if (Meteor.isClient) {
  emitWithData();
}

Tinytest.addAsync('client->server: logs with {data} reach the server collection', (test, done) => {
  if (Meteor.isServer) {
    assertClientToServerWritten(test, [
      async (t) => !!await waitForDocument(collection, { 'additional.data': 'c2s-with info' }, t),
      async (t) => !!await waitForDocument(collection, { message: 100 }, t),
      async (t) => !!await waitForDocument(collection, { 'additional.data': 'c2s-with debug' }, t),
      async (t) => !!await waitForDocument(collection, { message: 200 }, t),
      async (t) => !!await waitForDocument(collection, { 'additional.data': 'c2s-with error' }, t),
      async (t) => !!await waitForDocument(collection, { message: 300 }, t),
      async (t) => !!await waitForDocument(collection, { 'additional.data': 'c2s-with fatal' }, t),
      async (t) => !!await waitForDocument(collection, { message: 400 }, t),
      async (t) => !!await waitForDocument(collection, { 'additional.data': 'c2s-with warn' }, t),
      async (t) => !!await waitForDocument(collection, { message: 500 }, t),
      async (t) => {
        const doc = await waitForDocument(collection, { 'additional.data': 'c2s-with trace' }, t);
        return !!doc && !!doc.additional && typeof doc.additional.stackTrace === 'string';
      },
      async (t) => !!await waitForDocument(collection, { message: 600 }, t),
      async (t) => !!await waitForDocument(collection, { 'additional.data': 'c2s-with _' }, t),
      async (t) => !!await waitForDocument(collection, { message: 700 }, t)
    ], done);
  } else {
    emitWithData();
    test.isTrue(true);
    done();
  }
});
