Package.describe({summary: "Plain text awesomizer."})

// Can't use a semver range here!
Npm.depends({"asciify": "1.3.2"})

Package.on_use(function (api) {
  api.export("asciify")
  api.add_files("asciify.js", "server")
})