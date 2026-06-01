import { Meteor } from 'meteor/meteor';
import { waitForDocument, assertClientToServerWritten } from './helpers.js';
import { collection, emitWithoutData, emitWithData } from './c2s.js';

// The collection is fresh per mtest run, so there is nothing to clear at load —
// and an unawaited server-side clear could otherwise race ahead and wipe the
// client's in-flight inserts. The bridge Logger itself lives in `./c2s.js`,
// which is loaded first so its method-name prefix matches across the bridge.

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
