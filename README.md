meteor-asciify
===

What do we want?

> Messages!

When do we want them?

```
      ___           ___           ___     
     /\__\         /\  \         /\__\    
    /::|  |       /::\  \       /:/ _/_   
   /:|:|  |      /:/\:\  \     /:/ /\__\  
  /:/|:|  |__   /:/  \:\  \   /:/ /:/ _/_ 
 /:/ |:| /\__\ /:/__/ \:\__\ /:/_/:/ /\__\
 \/__|:|/:/  / \:\  \ /:/  / \:\/:/ /:/  /
     |:/:/  /   \:\  /:/  /   \::/_/:/  / 
     |::/  /     \:\/:/  /     \:\/:/  /  
     /:/  /       \::/  /       \::/  /   
     \/__/         \/__/         \/__/    
```

`meteor-asciify` is an IM client that makes your messages look AWESOMG.

IM has been done a [million](http://chatonline.meteor.com/) [times](http://kchat.meteor.com/) [before](http://pcxx.meteor.com/) on Meteor, but this is different.

Why are you implement like this?
---

Main goals of the demo were to try out NPM integration and reactive templates.

`meteor-asciify` uses the NPM module [asciify](https://npmjs.org/package/asciify), which itself uses [Figlet](https://github.com/scottgonzalez/figlet-js).

There's a Figlet jQuery plugin, but this demo isn't using it. Instead `meteor-asciify` exposes a meteor method which asciifies text serverside and returns the result.

Yeah, bat shit crazy.

...but actually quite interesting. Meteor methods must `return` their result, but the `asciify` module uses an async callback.

```
              _                      _     
             | |                    | |    
 _ __  _   _ | |__      _ __   ___  | |__  
| '__|| | | || '_ \    | '__| / _ \ | '_ \ 
| |   | |_| || | | |   | |   | (_) || | | |
|_|    \__,_||_| |_|   |_|    \___/ |_| |_|
```

Luckily, we can use fiber futures and flux capacitors to solve the problem.

```javascript
Meteor.methods({
  asciify: function (text, font) {
    // Future.wrap "futurifies" an async node function
    return Future.wrap(asciify)(text, font).wait()
  }
})
```

The fiber future `wait` function yields to another fiber, until the result is returned. Long hand, this would look like:

```javascript
Meteor.methods({
  asciify: function (text, font) {
    var fut = new Future
    
    asciify(text, font, function(er, res) {
      fut.ret(res)
    })
    
    return fut.wait()
  }
})
```

### Templates

Messages are rendered in handlebars templates, basic right?

Well, yeah, but also no. We made some "interesting" implementation choices in asciifying message text - we asciify text after the template is rendered:

```javascript
// Asciify the message text when the template is rendered
Template.msg.rendered = function () {
  var pre = $(this.find("pre"))
  Meteor.call("asciify", pre.text(), pre.data("font"), function (er, text) {
    pre.text(text)
    autoScrollToBottom()
  })
}
```

This worked really well _locally_ but after deploying to meteor.com it became apparent what was actually happening.

When new messages are added to the collection, the HTML for the whole list is re-rendered and _every_ message is asciified _again_.

```
                                                  ______
_______ ______ ______ ______ ______ ______ ______ ___  /
__  __ \_  __ \_  __ \_  __ \_  __ \_  __ \_  __ \__  / 
_  / / // /_/ // /_/ // /_/ // /_/ // /_/ // /_/ / /_/  
/_/ /_/ \____/ \____/ \____/ \____/ \____/ \____/ (_)   
                                                        
```

`{{#constant}}` instructs meteor not to re-render areas of a template, so once our text is asciified, it stays asciified.

So our template looks like this:

```html
<template name="msg">
  <li>
    <div class="meta">
        <time datetime="{{created}}">{{fromnow created}}</time>
    </div>
    {{#constant}}
    <div>
      <div class="msg-box">
        <pre data-font="{{font}}">{{msg}}</pre>
      </div>
      <img class="gravatar" src="{{gravatar handle}}" title="{{trim handle}}">
    </div>
    {{/constant}}
  </li>
</template>
```

We have constant areas, but it doesn't stop the template being rendered and the asciify meteor method being called. Simples, make a note of it using HTML5 `data-` attributes in the constant part of the template:

```javascript
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
```



```

     ___      .___  ___.      ___       ________   _______ .______        ___       __       __           _______.
    /   \     |   \/   |     /   \     |       /  |   ____||   _  \      /   \     |  |     |  |         /       |
   /  ^  \    |  \  /  |    /  ^  \    `---/  /   |  |__   |  |_)  |    /  ^  \    |  |     |  |        |   (----`
  /  /_\  \   |  |\/|  |   /  /_\  \      /  /    |   __|  |   _  <    /  /_\  \   |  |     |  |         \   \    
 /  _____  \  |  |  |  |  /  _____  \    /  /----.|  |____ |  |_)  |  /  _____  \  |  `----.|  `----..----)   |   
/__/     \__\ |__|  |__| /__/     \__\  /________||_______||______/  /__/     \__\ |_______||_______||_______/    
                                                                                                                  

```

Check out the client at [http://asciify.meteor.com](http://asciify.meteor.com/)
