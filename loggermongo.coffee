NOOP = -> return

class LoggerMongo
  constructor: (@logger, @options = {}) ->
    check @logger, Match.OneOf Logger, Object
    check @options, Object

    self = @
    if Meteor.isServer
      @options.collectionName ?= "ostrioMongoLogger"
      check @options.collectionName, String
      @collection = new Meteor.Collection @options.collectionName
      @collection.deny
        update: -> true
        remove: -> true
        insert: -> true

    self.logger.add 'Mongo', (level, message, data = null, userId) ->
      if Meteor.isServer
        time = new Date()
        if data
          data = self.logger.antiCircular data
          if _.isString data.stackTrace
            data.stackTrace = data.stackTrace.split /\n|\\n|\r|\r\n/g

        self.collection.insert {
          userId: userId
          date: time
          timestamp: +time
          level: level
          message: message
          additional: data
        }, NOOP
    , NOOP
    , true

  enable: (rule = {}) ->
    check rule, Object
    rule.enable ?= true
    rule.client ?= false
    rule.server ?= true
    @logger.rule 'Mongo', rule
    return @