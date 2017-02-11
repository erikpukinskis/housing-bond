var library = require("module-library")(require)

library.using(
  ["web-host", "release-checklist", "./", "./issue-bond", "./invoice-materials"],
  function(host, releaseChecklist, housingBond, issueBond, invoiceMaterials) {

    var list = releaseChecklist("A 6x8 teensy house appears", "test")

    releaseChecklist.addTask("test", "the function you passed to housePlan the function you passed to")

    releaseChecklist.tag("test", "the-function-you-passed-to-house-plan-the-function-you-passed-to", "back wall section")



    issueBond("a9ei", 68510, "Erik Pukinskis", "Sale of 6x8 teensyhouse", {"listId":"test"})

    issueBond.orderShares("ord8hfa", "Dad", "141-151-1443", "a9ei", 2000)



    host.onSite(function(site) {
      housingBond.prepareSite(site)

      site.addRoute("get", "/checklist", function(request, response) {
        var list = releaseChecklist.get("test")
        var bridge = new BrowserBridge().forResponse(response)

        renderInvoice.renderInvoice(list, bridge)
      })
    })

    // var materials = renderInvoice.materialsForList(list)

    // var invoice = invoiceMaterials(materials)
    

    // host.onRequest(function(getBridge) {
    //   var bridge = getBridge()

    //   var checklistPartial = bridge.partial()


    //   var invoicePartial = bridge.partial()

    //   renderInvoice(invoicePartial, invoice, materials.hours)

    //   var bondPartial = bridge.partial()

    //   renderInvoice.issueBondForm(bondPartial, list, invoice)

    //   bridge.send([checklistPartial, invoicePartial, bondPartial])
    // })

  }
)
