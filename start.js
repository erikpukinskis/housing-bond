var library = require("module-library")(require)

library.using(
  ["web-site", "release-checklist", "with-nearby-modules"],
  function(site, releaseChecklist, withNearbyModules) {

    var list = releaseChecklist.get("test")

    withNearbyModules
    .aModuleAppeared("release-checklist", function() {
      return list
    })

    site.boot()
  }
)
