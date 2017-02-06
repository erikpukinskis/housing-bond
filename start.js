var library = require("module-library")(require)

library.using(
  ["web-host", "release-checklist", "./"],
  function(host, releaseChecklist, housingBond) {

    var list = releaseChecklist.get("test")

    host.onSite(function(site) {
      housingBond.prepareSite(site)
    })

    host.onRequest(function(getBridge) {
      housingBond(list, getBridge())
    })

  }
)
