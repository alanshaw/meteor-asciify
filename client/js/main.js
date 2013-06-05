Meteor.subscribe("messages")

Template.msg.rendered = function () {
  var pre = $(this.find("pre"))
  Meteor.call("asciify", pre.text(), pre.data("font"), function (er, text) {
    pre.text(text)
  })
} 

Template.msgs.msgs = function () {
  return Messages.find().fetch()
}

Template.input.events({
  "click #send": function () {
    Messages.insert({
        handle: $("#handle").val()
      , msg: $("#msg").val()
      , font: $("#font").val()
      , created: moment().toDate().getTime()
    })
  }
})