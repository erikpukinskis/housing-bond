var library = require("module-library")(require)

library.using(
  ["web-host", "release-checklist", "./", "./issue-bond"],
  function(host, releaseChecklist, housingBond, issueBond) {

    var list = releaseChecklist.get("test")

    issueBond("a9ei", 68510, "Erik Pukinskis", "Sale of 6x8 teensyhouse", {"listId":"teensy3"})

    issueBond.orderShares("ord8hfa", "Dad", "141-151-1443", "a9ei", 2000)

    host.onSite(function(site) {
      housingBond.prepareSite(site)
    })

    host.onRequest(function(getBridge) {
      housingBond(list, getBridge())
    })

  }
)
