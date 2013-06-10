Messages = new Meteor.Collection("messages")

Messages.allow({
  insert: function(userId, msg) {
    msg.created = Date.now() // Add timestamp server side so client can't effect message ordering
    return true
  }
})