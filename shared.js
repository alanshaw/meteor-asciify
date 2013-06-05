Messages = new Meteor.Collection("messages")

Messages.allow({
  insert: function() {
    return true
  }
})