import { Logger } from 'meteor/ostrio:logger';
import { LoggerMongo } from 'meteor/ostrio:loggermongo';

// IMPORTANT: this file is the FIRST entry in `package.js` `onTest` addFiles, so
// this Logger is the first instance constructed in the whole suite on BOTH the
// client and the server. The instance `prefix` (an `++_inst` counter inside
// ostrio:logger) namespaces the adapter's `_logger_emit_Mongo` Meteor method —
// the client->server bridge only works when that method name is identical on
// both sides. Constructing this Logger first makes the prefix deterministically
// match (it is `1` everywhere), instead of depending on the relative
// construction order of every other test file's Logger, which is not guaranteed
// to be the same across Meteor releases.
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
