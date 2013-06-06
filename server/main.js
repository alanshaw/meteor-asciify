var Future = Npm.require("fibers/future")

var uuid = 0;

Meteor.methods({
  asciify: function (text, font) {
    // Future.wrap "futurifies" an async node function
    return Future.wrap(asciify)(text, font).wait()
    
    /* Long hand, this would look like:
    
    var fut = new Future
    
    asciify(text, font, function(er, res) {
      fut.ret(res)
    })
    
    return fut.wait()
    
    */
  },
  uuid: function () {
    return uuid++
  },
  fonts: function () {
    return Future.wrap(asciify.getFonts)().wait()
  }
})

Meteor.publish("messages", function () {
  return Messages.find({}, {sort: [['created', 'asc']]})
})