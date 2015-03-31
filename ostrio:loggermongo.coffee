bind = Meteor.bindEnvironment (cb) ->
  cb and cb()

Meteor.log.add "Mongo", (level, message, data = null, userId) ->

  time = new Date()
  data = null if data is undefined or data is "undefined" or !data
  data = Meteor.log.antiCircular(data) if data

  bind ->
    Meteor.log.collection.insert
      userId: userId
      date: time
      timestamp: (+time).toString()
      level: level
      message: message
      additional: data

, () ->
  Meteor.log.collection = new Meteor.Collection "ostrioMongoLogger"

  Meteor.log.collection.deny
    update: ->
      true

    remove: ->
      true

    insert: ->
      true
      
, true
