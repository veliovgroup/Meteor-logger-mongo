this.Collections = {
  logs: new Mongo.Collection('AppLogs')
};
this.log = new Logger();
(new LoggerMongo(log, {
  collection: Collections.logs,
  format: function (opts) {
    return _.omit(opts, ['userId', 'timestamp', 'additional']);
  }
})).enable();

if (Meteor.isServer) {
  log.error("Server Test", {test: 'data'}, 'who?');
  Meteor.publish('logs', function () {
    return Collections.logs.find({}, {
      sort: {
        date: -1
      }
    });
  });
} else {
  log.error("Client Test", {test: 'data'}, 'who?');
  Template.registerHelper('logs', function () {
    return Collections.logs.find({}, {
      sort: {
        date: -1
      }
    })
  });
  Meteor.subscribe('logs');
}