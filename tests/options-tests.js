import { Mongo } from 'meteor/mongo';
import { Meteor } from 'meteor/meteor';
import { Logger } from 'meteor/ostrio:logger';
import { LoggerMongo } from 'meteor/ostrio:loggermongo';
import { waitForDocument, clearCollection, runAssertions } from './helpers.js';

// This is the ONLY place in the suite that instantiates the default-named
// collection, so it never collides with the other files' explicit names.
const logDefault = new Logger();
const defaultAdapter = new LoggerMongo(logDefault).enable();

Tinytest.addAsync('options: defaults to the `ostrioMongoLogger` collection', (test, done) => {
  if (!Meteor.isServer) {
    test.isTrue(true);
    done();
    return;
  }
  test.equal(defaultAdapter.options.collectionName, 'ostrioMongoLogger');
  test.isTrue(!!defaultAdapter.collection);
  logDefault.info('opt-default-name');
  runAssertions(test, [async () => !!await waitForDocument(defaultAdapter.collection, { message: 'opt-default-name' })], done);
});

Tinytest.addAsync('options: honors a custom collectionName', (test, done) => {
  if (!Meteor.isServer) {
    test.isTrue(true);
    done();
    return;
  }
  const logger = new Logger();
  const adapter = new LoggerMongo(logger, { collectionName: 'ostrioCustomNameTest' }).enable();
  test.equal(adapter.options.collectionName, 'ostrioCustomNameTest');
  clearCollection(adapter.collection).then(() => {
    logger.info('opt-custom-name');
    runAssertions(test, [async () => !!await waitForDocument(adapter.collection, { message: 'opt-custom-name' })], done, () => clearCollection(adapter.collection));
  });
});

Tinytest.addAsync('options: writes into a caller-supplied collection', (test, done) => {
  if (!Meteor.isServer) {
    test.isTrue(true);
    done();
    return;
  }
  const logger = new Logger();
  const customCollection = new Mongo.Collection('ostrioSuppliedCollectionTest');
  const adapter = new LoggerMongo(logger, { collection: customCollection }).enable();
  test.equal(adapter.collection, customCollection);
  clearCollection(customCollection).then(() => {
    logger.info('opt-supplied-collection');
    runAssertions(test, [async () => !!await waitForDocument(customCollection, { message: 'opt-supplied-collection' })], done, () => clearCollection(customCollection));
  });
});

Tinytest.addAsync('options: format() transforms the stored record', (test, done) => {
  if (!Meteor.isServer) {
    test.isTrue(true);
    done();
    return;
  }
  const logger = new Logger();
  const adapter = new LoggerMongo(logger, {
    collectionName: 'ostrioFormatPositiveTest',
    format: (opts) => ({
      ...opts,
      message: `fmt:${opts.message}`,
      tag: 'formatted',
      meta: { origin: opts.level }
    })
  }).enable();
  clearCollection(adapter.collection).then(() => {
    logger.warn('opt-format', { keep: 'me' });
    runAssertions(test, [async () => {
      const doc = await waitForDocument(adapter.collection, { message: 'fmt:opt-format' });
      if (!doc) return false;
      test.equal(doc.tag, 'formatted');
      test.equal(doc.meta.origin, 'WARN');
      test.equal(doc.level, 'WARN');
      test.equal(doc.additional.keep, 'me');
      return true;
    }], done, () => clearCollection(adapter.collection));
  });
});

Tinytest.add('options: format() returning a non-object throws', (test) => {
  if (!Meteor.isServer) {
    test.isTrue(true);
    return;
  }
  const logger = new Logger();
  const adapter = new LoggerMongo(logger, {
    collectionName: 'ostrioFormatNegativeTest',
    format: () => null
  });
  adapter.enable();
  test.throws(() => {
    logger.info('opt-format-bad');
  }, /Must return a plain Object/);
});

Tinytest.add('options: constructor rejects an invalid collectionName type', (test) => {
  test.throws(() => {
    new LoggerMongo(new Logger(), { collectionName: 123 });
  });
});

Tinytest.add('options: constructor rejects an invalid format type', (test) => {
  test.throws(() => {
    new LoggerMongo(new Logger(), { format: 'not-a-function' });
  });
});

Tinytest.add('options: constructor rejects an invalid logger', (test) => {
  test.throws(() => {
    new LoggerMongo('not-a-logger');
  });
});
