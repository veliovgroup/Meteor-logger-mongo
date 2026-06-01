import { Meteor } from 'meteor/meteor';
import { Logger } from 'meteor/ostrio:logger';
import { LoggerMongo } from 'meteor/ostrio:loggermongo';
import { mongoWriteDelay, delay, waitForDocument, findDoc, clearCollection, runAssertions } from './helpers.js';

Tinytest.add('rules: enable() is chainable and returns the adapter', (test) => {
  const adapter = new LoggerMongo(new Logger(), { collectionName: 'ostrioChainTest' });
  test.equal(adapter.enable(), adapter);
});

Tinytest.add('rules: enable() defaults enable/client/server to true', (test) => {
  const logger = new Logger();
  new LoggerMongo(logger, { collectionName: 'ostrioDefaultsRuleTest' }).enable();
  const rule = logger._rules.Mongo;
  test.equal(rule.enable, true);
  test.equal(rule.client, true);
  test.equal(rule.server, true);
  test.equal(rule.allow, ['*']);
});

Tinytest.add('rules: filter array is normalized to uppercase', (test) => {
  const logger = new Logger();
  new LoggerMongo(logger, { collectionName: 'ostrioFilterNormalizeTest' }).enable({ filter: ['error', 'fatal'] });
  test.equal(logger._rules.Mongo.allow, ['ERROR', 'FATAL']);
});

Tinytest.addAsync('rules: enable:false writes nothing', (test, done) => {
  if (!Meteor.isServer) {
    test.isTrue(true);
    done();
    return;
  }
  const logger = new Logger();
  const adapter = new LoggerMongo(logger, { collectionName: 'ostrioDisabledTest' }).enable({ enable: false });
  clearCollection(adapter.collection).then(() => {
    logger.info('rule-disabled-msg');
    logger.error('rule-disabled-err');
    runAssertions(test, [async () => {
      await delay(mongoWriteDelay * 2);
      const a = await findDoc(adapter.collection, { message: 'rule-disabled-msg' });
      const b = await findDoc(adapter.collection, { message: 'rule-disabled-err' });
      return !a && !b;
    }], done, () => clearCollection(adapter.collection));
  });
});

Tinytest.addAsync('rules: filter:[ERROR] keeps ERROR and drops other levels', (test, done) => {
  if (!Meteor.isServer) {
    test.isTrue(true);
    done();
    return;
  }
  const logger = new Logger();
  const adapter = new LoggerMongo(logger, { collectionName: 'ostrioFilterErrorTest' }).enable({ filter: ['ERROR'] });
  clearCollection(adapter.collection).then(() => {
    logger.info('rule-filter-info');
    logger.warn('rule-filter-warn');
    logger.error('rule-filter-error');
    runAssertions(test, [
      // ERROR appearing proves the write path ran and enough time elapsed.
      async () => !!await waitForDocument(adapter.collection, { message: 'rule-filter-error' }),
      async () => !await findDoc(adapter.collection, { message: 'rule-filter-info' }),
      async () => !await findDoc(adapter.collection, { message: 'rule-filter-warn' })
    ], done, () => clearCollection(adapter.collection));
  });
});

Tinytest.addAsync('rules: server:false suppresses server-side writes', (test, done) => {
  if (!Meteor.isServer) {
    test.isTrue(true);
    done();
    return;
  }
  const logger = new Logger();
  const adapter = new LoggerMongo(logger, { collectionName: 'ostrioServerFalseTest' }).enable({ server: false });
  clearCollection(adapter.collection).then(() => {
    logger.info('rule-server-false');
    runAssertions(test, [async () => {
      await delay(mongoWriteDelay * 2);
      return !await findDoc(adapter.collection, { message: 'rule-server-false' });
    }], done, () => clearCollection(adapter.collection));
  });
});
