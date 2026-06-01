import { Meteor } from 'meteor/meteor';

// Meteor 3 routes inserts through the async Mongo driver and the client->server
// path adds a DDP round-trip, so timing budgets are generous on 3.x and tight on 2.x.
export const isMeteor3 = String(Meteor.release).startsWith('METEOR@3');

// `collectionInsert` in the adapter is fire-and-forget (it never awaits
// `insertAsync`), so even in-process server writes need a settle delay before
// a one-shot read can see them.
export const mongoWriteDelay = isMeteor3 ? 1500 : 256;

// mtest runs the server tests before Puppeteer connects; this budget must cover
// browser boot + DDP connect + the async insert round-trip.
export const clientToServerTimeout = isMeteor3 ? 120000 : 10000;

export const delay = (ms) => new Promise((resolve) => Meteor.setTimeout(resolve, ms));

// `findOneAsync`/`removeAsync` exist on Meteor 3; fall back to the synchronous
// API on Meteor 2 (which throws on 3, hence the feature-detect).
export const findDoc = async (collection, selector) => {
  if (collection.findOneAsync) {
    return collection.findOneAsync(selector);
  }
  return collection.findOne(selector);
};

export const clearCollection = async (collection, selector = {}) => {
  if (collection.removeAsync) {
    await collection.removeAsync(selector);
    return;
  }
  collection.remove(selector);
};

// Client->server writes only land after the browser connects over DDP and its
// `_logger_emit_Mongo` method round-trips. There is no fixed delay that is both
// fast and reliable, so poll the collection until the document appears (or the
// deadline elapses) instead of guessing a single timeout.
export const waitForDocument = async (collection, selector, timeoutMs = clientToServerTimeout) => {
  const deadline = Date.now() + timeoutMs;
  let doc = await findDoc(collection, selector);
  while (!doc && Date.now() < deadline) {
    await delay(100);
    doc = await findDoc(collection, selector);
  }
  return doc;
};

// Runs an ordered list of async assertions; each returns a truthy value to pass.
// The first falsy/throwing assertion fails the test, then `done()` is called once.
export const runAssertions = (test, assertionFns, done, finalize) => {
  const finish = () => {
    if (typeof finalize === 'function') {
      Promise.resolve(finalize()).then(done, done);
    } else {
      done();
    }
  };

  const run = async () => {
    for (let i = 0; i < assertionFns.length; i++) {
      const ok = await assertionFns[i]();
      if (!ok) {
        test.fail(`assertion #${i + 1} failed`);
        finish();
        return;
      }
    }
    finish();
  };

  run().catch((err) => {
    test.fail(err && err.message ? err.message : String(err));
    finish();
  });
};

export const hasConnectedClient = () => {
  const sessions = Meteor.server && Meteor.server.sessions;
  if (!sessions) {
    return false;
  }
  if (typeof sessions.size === 'number') {
    return sessions.size > 0;
  }
  return Object.keys(sessions).length > 0;
};

// Waits for a browser DDP session, gives the in-flight inserts a moment to
// settle, then runs the polled assertions against a shared deadline.
export const assertClientToServerWritten = (test, assertionFns, done) => {
  const deadline = Date.now() + clientToServerTimeout;
  const remainingMs = () => Math.max(500, deadline - Date.now());

  const runAssertionsWithBudget = () => {
    runAssertions(test, assertionFns.map((fn) => () => fn(remainingMs())), done);
  };

  const waitThenAssert = () => {
    if (hasConnectedClient()) {
      Meteor.setTimeout(runAssertionsWithBudget, mongoWriteDelay);
      return;
    }
    if (remainingMs() <= mongoWriteDelay) {
      runAssertionsWithBudget();
      return;
    }
    Meteor.setTimeout(waitThenAssert, 100);
  };
  waitThenAssert();
};
