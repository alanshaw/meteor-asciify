Meteor.subscribe("messages")

// Get the messages for the template
Template.msgs.msgs = function () {
  return Messages.find().fetch()
}

// Asciify the message text when the template is rendered
Template.msg.rendered = function () {
  var pre = $(this.find("pre"))
  if (!pre.data("asciified")) {
    Meteor.call("asciify", pre.text(), pre.data("font"), function (er, text) {
      pre.attr("data-asciified", true).text(text)
      scrollToBottom()
    })
  }
}

// Scroll to bottom of the page (debounced)
var scrollToBottom = (function() {
  var scheduled = false
  return function() {
    if (!scheduled) {
      scheduled = true
      Meteor.setTimeout(function() {
        scheduled = false
        $("html, body").animate({scrollTop: $(document).height()}, 1000)
      }, 250)
    }
  }
})()

// Get or generate the user's handle
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

// Send a message by inserting into the Messages collection
function sendMsg () {
  Messages.insert({
      handle: $("#handle").val()
    , msg: $("#msg").val()
    , font: $("#font").val()
    , created: moment().toDate().getTime()
  })
  $("#msg").val("")
}

// Events for sending messages and saving handle to localStorage
Template.input.events({
  "click #send": sendMsg,
  "keyup #handle": function () {
    if (localStorage) {
      localStorage.setItem("handle", $("#handle").val())
    }
  },
  "keypress #msg": function (event) {
    if (event.which == 13) {
      sendMsg()
    }
  }
})