Meteor.subscribe("messages")

Session.set("limit", 25)

Template.moar.events({
  "click button": function () {
    Session.set("limit", Session.get("limit") + 25)
  }
})

// Get the messages for the template
Template.msgs.msgs = function () {
  return Messages.find({}, {limit: Session.get("limit"), sort: [['created', 'desc']]}).fetch().reverse()
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

Template.msg.gravatar = function (email) {
  return "http://www.gravatar.com/avatar/" + $.md5(email) + "?s=50"
}

Template.msg.trim = function (email) {
  var res = /(.+)@/.exec(email)
  return res && res[1] ? res[1] : email
}

Template.msg.fromnow = function (ms) {
  return moment(ms).fromNow()
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
      }, 100)
    }
  }
})()

// Get an item from localStorage, if it is falsey, return dflt
function stored (key, dflt) {
  if (!localStorage) return dflt
  return localStorage.getItem(key) || dflt
}

// Get or generate the user's handle and get font list and select previously selected font
Template.input.rendered = function () {
  
  var handle = stored("handle")
  
  if (handle) {
    $("#handle").val(handle)
  } else {
    Meteor.call("uuid", function (er, uuid) {
      $("#handle").val("user" + uuid + "@asciify.meteor.com")
    })
  }
  
  var storedFont = stored("font", "graffiti")
    , fontSelect = $("#font")
  
  Meteor.call("fonts", function (er, fonts) {
    fonts.sort().forEach(function (font) {
      var opt = $("<option/>").text(font)
      if (font == storedFont) {
        opt.attr("selected", true)
      }
      fontSelect.append(opt)
    })
  })
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

// Events for sending messages and saving handle and font selection to localStorage
Template.input.events({
  "click #send": sendMsg,
  "keyup #handle": function () {
    if (localStorage) {
      localStorage.setItem("handle", $("#handle").val())
    }
  },
  "keypress #msg": function (event) {
    if (event.which == 13) {
      event.preventDefault()
      sendMsg()
    }
  },
  "change #font": function() {
    if (localStorage) {
      localStorage.setItem("font", $("#font").val())
    }
  }
})