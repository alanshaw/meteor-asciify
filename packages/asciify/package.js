Package.describe({summary: "Plain text awesomizer."})

// Can't use a semver range here!
Npm.depends({"asciify": "1.2.0"})

Package.on_use(function (api) {
  api.add_files("asciify.js", "server")
})