import { Meteor } from 'meteor/meteor';
import { emitWithoutData, emitWithData, findMethod } from './c2s.js';

// These tests run client-driven: the client emits through the real bridge and
// then asks the server (which polls) whether each document landed. The browser
// is, by definition, connected while its own test runs, so there is no race
// against client connection — unlike a server-side test that must blindly wait
// for a browser to appear. The server-side instance of each test is a trivial
// pass; the meaningful assertions happen on the client.

const callFind = (selector) => new Promise((resolve, reject) => {
  Meteor.call(findMethod, selector, (err, res) => (err ? reject(err) : resolve(res)));
});

const verify = (test, checks, done) => {
  Promise.all(checks.map((c) => callFind(c.selector).then((doc) => ({ c, doc }))))
    .then((results) => {
      results.forEach(({ c, doc }) => {
        test.isTrue(!!doc, `expected a stored document for ${JSON.stringify(c.selector)}`);
        if (doc && c.requireStackTrace) {
          test.isTrue(
            !!(doc.additional && typeof doc.additional.stackTrace === 'string'),
            `expected a stackTrace for ${JSON.stringify(c.selector)}`
          );
        }
      });
      done();
    })
    .catch((err) => {
      test.fail(err && err.message ? err.message : String(err));
      done();
    });
};

Tinytest.addAsync('client->server: logs without {data} reach the server collection', (test, done) => {
  if (Meteor.isServer) {
    test.isTrue(true);
    done();
    return;
  }
  emitWithoutData();
  verify(test, [
    { selector: { message: 'c2s-without info' } },
    { selector: { message: 'c2s-without debug' } },
    { selector: { message: 'c2s-without error' } },
    { selector: { message: 'c2s-without fatal' } },
    { selector: { message: 'c2s-without warn' } },
    { selector: { message: 'c2s-without trace' }, requireStackTrace: true },
    { selector: { message: 'c2s-without _' } }
  ], done);
});

Tinytest.addAsync('client->server: logs with {data} reach the server collection', (test, done) => {
  if (Meteor.isServer) {
    test.isTrue(true);
    done();
    return;
  }
  emitWithData();
  verify(test, [
    { selector: { 'additional.data': 'c2s-with info' } },
    { selector: { message: 100 } },
    { selector: { 'additional.data': 'c2s-with debug' } },
    { selector: { message: 200 } },
    { selector: { 'additional.data': 'c2s-with error' } },
    { selector: { message: 300 } },
    { selector: { 'additional.data': 'c2s-with fatal' } },
    { selector: { message: 400 } },
    { selector: { 'additional.data': 'c2s-with warn' } },
    { selector: { message: 500 } },
    { selector: { 'additional.data': 'c2s-with trace' }, requireStackTrace: true },
    { selector: { message: 600 } },
    { selector: { 'additional.data': 'c2s-with _' } },
    { selector: { message: 700 } }
  ], done);
});
