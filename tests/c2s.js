import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { Logger } from 'meteor/ostrio:logger';
import { LoggerMongo } from 'meteor/ostrio:loggermongo';
import { findDoc, delay } from './helpers.js';

// This file is the FIRST entry in `package.js` `onTest` addFiles, so this Logger
// is the first instance constructed in the suite on BOTH client and server. The
// instance `prefix` (an `++_inst` counter in ostrio:logger) namespaces the
// adapter's `_logger_emit_Mongo` Meteor method, and the client->server bridge
// only works when that method name matches on both sides. Constructing it first
// makes the prefix deterministically identical (`1` everywhere) — the same
// guarantee a real app gets by declaring its Logger in shared isomorphic code.
export const log = new Logger();
export const adapter = new LoggerMongo(log, { collectionName: 'ostrioClientToServerTest' }).enable();

// `collection` is only assigned on the server; the client never touches Mongo.
export const collection = adapter.collection;

export const emitWithoutData = () => {
  log.info('c2s-without info');
  log.debug('c2s-without debug');
  log.error('c2s-without error');
  log.fatal('c2s-without fatal');
  log.warn('c2s-without warn');
  log.trace('c2s-without trace');
  log._('c2s-without _');
};

export const emitWithData = () => {
  log.info(100, { data: 'c2s-with info' });
  log.debug(200, { data: 'c2s-with debug' });
  log.error(300, { data: 'c2s-with error' });
  log.fatal(400, { data: 'c2s-with fatal' });
  log.warn(500, { data: 'c2s-with warn' });
  log.trace(600, { data: 'c2s-with trace' });
  log._(700, { data: 'c2s-with _' });
};

// Verification channel for the client->server tests. The client cannot read the
// server-only collection, and a server-side test cannot reliably know when the
// browser has connected and emitted — so instead the *client* (which is provably
// connected when its test runs) emits through the real bridge and then calls
// this fixed-name method to confirm the document landed. The method polls
// because the adapter's insert is fire-and-forget: the bridge method returns
// before its `insertAsync` resolves. The fixed name sidesteps any prefix concern
// for the verification path itself.
export const findMethod = 'ostrioLoggerMongo_c2s_test_find';

if (Meteor.isServer) {
  Meteor.methods({
    [findMethod]: async function (selector) {
      check(selector, Object);
      const deadline = Date.now() + 60000;
      let doc = await findDoc(collection, selector);
      while (!doc && Date.now() < deadline) {
        await delay(200);
        doc = await findDoc(collection, selector);
      }
      return doc || null;
    }
  });
}
