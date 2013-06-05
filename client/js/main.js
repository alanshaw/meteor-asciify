Meteor.subscribe("messages")

Template.msgs.msgs = function () {
  return Messages.find().fetch()
}

Template.msg.rendered = function () {
  var pre = $(this.find("pre"))
  Meteor.call("asciify", pre.text(), pre.data("font"), function (er, text) {
    pre.text(text)
  })
}

Template.input.rendered = function () {
  var handle = localStorage && localStorage.getItem("handle")
  if (handle) {
    $("#handle").val(handle)
  } else {
    Meteor.call("uuid", function (er, uuid) {
      $("#handle").val("user-" + uuid)
    })
  }
}

Template.input.events({
  "click #send": function () {
    Messages.insert({
        handle: $("#handle").val()
      , msg: $("#msg").val()
      , font: $("#font").val()
      , created: moment().toDate().getTime()
    })
    $("#msg").val("")
  },
  "keyup #handle": function () {
    if (localStorage) {
      localStorage.setItem("handle", $("#handle").val())
    }
  }
})