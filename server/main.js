var Future = Npm.require("fibers/future")

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
  }
})