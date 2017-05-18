import { _ }            from 'meteor/underscore';
import { Mongo }        from 'meteor/mongo';
import { Meteor }       from 'meteor/meteor';
import { Logger }       from 'meteor/ostrio:logger';
import { check, Match } from 'meteor/check';
const NOOP = () => {};

/*
 * @class LoggerMongo
 * @summary MongoDB adapter for ostrio:logger (Logger)
 */
class LoggerMongo {
  constructor(logger, options = {}) {
    check(logger, Match.OneOf(Logger, Object));
    check(options, {
      collectionName: Match.Optional(String),
      collection: Match.Optional(Match.OneOf(Mongo.Collection, Object)),
      format: Match.Optional(Function)
    });

    this.logger  = logger;
    this.options = options;

    if (!this.options.format) {
      this.options.format = (opts) => {
        return opts;
      };
    }

    if (Meteor.isServer) {
      if (this.options.collection) {
        this.collection = this.options.collection;
      } else {
        if (!this.options.collectionName) {
          this.options.collectionName = 'ostrioMongoLogger';
        }

        this.collection = new Meteor.Collection(this.options.collectionName);
        this.collection.deny({
          update() {
            return true;
          },
          remove() {
            return true;
          },
          insert() {
            return true;
          }
        });
      }
    }

    this.logger.add('Mongo', (level, message, data = null, userId) => {
      if (Meteor.isServer) {
        const time = new Date();
        if (data) {
          data = this.logger.antiCircular(data);
          if (_.isString(data.stackTrace)) {
            data.stackTrace = data.stackTrace.split(/\n|\\n|\r|\r\n/g);
          }
        }

        const record = this.options.format({
          userId: userId,
          date: time,
          timestamp: +time,
          level: level,
          message: message,
          additional: data,
        });

        if (!_.isObject(record)) {
          throw new Meteor.Error(400, '[ostrio:logger] [options.format]: Must return a plain Object!', record);
        }

        this.collection.insert(record, NOOP);
      }
    }, NOOP, false, false);
  }

  enable(rule = {}) {
    check(rule, {
      enable: Match.Optional(Boolean),
      client: Match.Optional(Boolean),
      server: Match.Optional(Boolean),
      filter: Match.Optional([String])
    });

    if (rule.enable == null) {
      rule.enable = true;
    }

    if (rule.client == null) {
      rule.client = true;
    }

    if (rule.server == null) {
      rule.server = true;
    }


    this.logger.rule('Mongo', rule);
    return this;
  }
}

export { LoggerMongo };
