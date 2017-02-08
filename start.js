var library = require("module-library")(require)

library.using(
  ["web-host", "release-checklist", "./", "./issue-bond"],
  function(host, releaseChecklist, renderInvoice, issueBond) {

    var list = releaseChecklist.get("test")

    issueBond("a9ei", 68510, "Erik Pukinskis", "Sale of 6x8 teensyhouse", {"listId":"test"})

    issueBond.orderShares("ord8hfa", "Dad", "141-151-1443", "a9ei", 2000)

    host.onSite(function(site) {
      renderInvoice.prepareSite(site)
    })

    var materials = renderInvoice.materialsForList(list)
    


    host.onRequest(function(getBridge) {
      renderInvoice(getBridge(), materials, hours)
      renderInvoice.issueBondForm(list, getBridge())
    })

  }
)
