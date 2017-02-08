var library = require("module-library")(require)

module.exports = library.export(
  "render-invoice",
  ["basic-styles", "house-panels", "web-element", "./invoice-materials"],
  function(basicStyles, housePanels, element, invoiceMaterials) {

    var HOURLY = 2000

    function renderInvoice(bridge, materials, hours) {      
      basicStyles.addTo(bridge)

      if (!bridge.__nrtvHousingBondStyles) {
        bridge.addToHead(
          element.stylesheet(lineItemTemplate))

        bridge.__nrtvHousingBondStyles = true
      }

      var invoice = invoiceMaterials(materials)

      invoice.addLineItem({
        description: "builder labor",
        price: HOURLY,
        quantity: hours,
        unit: "hours"
      })

      var items = invoice.lineItems.map(lineItemTemplate)

      var totalText = toDollarString(invoice.total)

      var body = [
        element("h1", "Expenses"),
        element(items),
        element("p", [
          element("Tax: "+toDollarString(invoice.tax)),
          element("Total: "+totalText),
        ]),
      ]

      bridge.send(body)
    }

    var lineItemTemplate = element.template(
      ".line-item",
      element.style({
        "margin-top": "0.25em",
      }),
      function(item) {
        if (!item.description) {
          throw new Error("no description for item "+JSON.stringify(item))
        }

        this.addChild(element(
          ".grid-12",
          item.description
        ))

        var qty = ""+item.quantity||""
        if (qty.length && item.unit) {
          qty += " "
        }
        qty += item.unit||""

        this.addChild(element(
          ".grid-8",
          qty
        ))

        this.addChild(element(
          ".grid-4",
          element.style({
            "border-bottom": "1px solid #666",
            "padding-left": "0.25em"
          }),
          toDollarString(item.subtotal)
        ))
      }
    )

    function toDollarString(cents) {
      if (cents < 0) {
        var negative = true
        cents = Math.abs(cents)
      }

      cents = Math.ceil(cents)

      var dollars = Math.floor(cents / 100)
      var remainder = cents - dollars*100
      if (remainder < 10) {
        remainder = "0"+remainder
      }

      var string = "$"+dollars+"."+remainder

      if (negative) {
        string = "-"+string
      }

      return string
    }

    return renderInvoice
  }
)
