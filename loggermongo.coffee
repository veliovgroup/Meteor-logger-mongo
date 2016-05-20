NOOP = -> return

###
@class LoggerMongo
@summary MongoDB adapter for ostrio:logger (Logger)
###
class LoggerMongo
  constructor: (@logger, @options = {}) ->
    check @logger, Match.OneOf Logger, Object
    check @options, {
      collectionName: Match.Optional String
      collection: Match.Optional Match.OneOf Mongo.Collection, Object
    }

    if not @options.collectionName and not @options.collection
      throw new Meteor.Error 400, '[LoggerMongo]: `collectionName` or `collection` must be presented'

    self = @
    if Meteor.isServer
      if @options.collection
        @collection = @options.collection
      else
        @options.collectionName ?= "ostrioMongoLogger"
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
    check rule, {
      enable: Match.Optional Boolean
      client: Match.Optional Boolean
      server: Match.Optional Boolean
      filter: Match.Optional [String]
    }

    rule.enable ?= true
    rule.client ?= false
    rule.server ?= true

    @logger.rule 'Mongo', rule
    return @