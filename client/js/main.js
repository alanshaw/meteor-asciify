Session.set("limit", 25)
Session.set("chan", window.location.pathname)

Deps.autorun(function () {
  Meteor.subscribe("messages", {channel: Session.get("chan"), limit: Session.get("limit")});
})

Template.moar.events({
  "click button": function () {
    Session.set("limit", Session.get("limit") + 25)
  }
})

// Get the messages for the template
Template.msgs.msgs = function () {
  return Messages.find({}, {limit: Session.get("limit"), sort: [["created", "desc"]]}).fetch().reverse()
}

// Asciify the message text when the template is rendered
Template.msg.rendered = function () {
  var pre = $(this.find("pre"))
  if (!pre.data("asciified")) {
    Meteor.call("asciify", pre.text(), pre.data("font"), function (er, text) {
      pre.attr("data-asciified", true).text(text)
      autoScrollToBottom()
    })
  }
}

Template.msg.gravatar = function (email) {
  return "http://www.gravatar.com/avatar/" + $.md5(email) + "?s=50&d=retro"
}

Template.msg.trim = function (email) {
  var res = /(.+)@/.exec(email)
  return res && res[1] ? res[1] : email
}

Template.msg.fromnow = function (ms) {
  return moment(ms).fromNow()
}

var win = $(window)
  , doc = $(document)
  , autoScrollEnabled = true
  , autoScrolling = false

// Auto scroll to bottom of the page (debounced)
var autoScrollToBottom = (function() {
  var scheduled = false
  return function() {
    if (!scheduled && autoScrollEnabled) {
      scheduled = true
      Meteor.setTimeout(function() {
        scheduled = false
        autoScrolling = true
        $("html, body").animate({scrollTop: doc.height()}, 1000, function () {
          autoScrolling = false
        })
      }, 100)
    }
  }
})()

// Enable auto scroll if user has scrolled to (near) the bottom of the page.
// Auto scrolling is when the app automatically scrolls to the bottom of the screen because a new msg
// has arrived. So if we're not doing that, and we recieve a scroll event it must be the user scrolling
// up the page, so disable auto scrolling.
win.scroll(function () {
  if (win.scrollTop() + win.height() > doc.height() - 20) {
    autoScrollEnabled = true
  } else if (!autoScrolling) {
    autoScrollEnabled = false
  }
})

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
  var msg = $("#msg")
  if (msg.val()) {
    Messages.insert({
        channel: Session.get('chan'),
        handle: $("#handle").val()
      , msg: msg.val()
      , font: $("#font").val()
      , created: Date.now()
    })
    msg.val("")
  }
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