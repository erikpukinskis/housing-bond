var library = require("module-library")(require)

module.exports = library.export(
  "housing-bond",
  ["house-plan", "house-panels", "./allocate-materials", "./invoice-materials", "web-element"],
  function(HousePlan, housePanels, allocateMaterials, invoiceMaterials, element) {
    var HOURLY = 2000
    var HOUSE_PER_SECTION = 8

    function register(list) {
      if (list.__bondPlugingRegisteredTags) { return }

      housePanels.forEach(function(options) {
        list.registerTag(options.tag)
      })

      list.__bondPlugingRegisteredTags = true
    }

    var lineItemTemplate = element.template(
      ".line-item",
      function(item) {
        if (!item.description) {
          throw new Error("no description for item "+JSON.stringify(item))
        }

        this.addChild(element(
          ".grid-text",
          item.description
        ))

        this.addChild(element(
          ".grid-column",
          item.quantity+" "+item.unit
        ))

        this.addChild(element(
          ".grid-column",
          "$"+toDollarString(item.subtotal)
        ))
      }
    )

    return function(list, bridge) {

      register(list)

      var plan = new HousePlan()
      var hours = 0

      housePanels.forEach(function(options) {
        var tag = options.tag
        var generator = options.generator

        if (!options.tag) {
          console.log(options)
          throw new Error("panel doesn't have a tag")
        }

        list.eachTagged(tag, function(task) {
          plan.add(generator, options)
          hours += HOUSE_PER_SECTION
        })
      })

      var materials = allocateMaterials(plan)

      console.log(materials.pieceCount+" materials")

      var invoice = invoiceMaterials(materials)

      invoice.lineItems.unshift({ description: "builder labor",
          subtotal: hours*HOURLY})

      var items = invoice.lineItems.map(lineItemTemplate)

      var body = element([
        element("h1", list.story+" Bond"),
        element(items),
        element("p", [
        element("Tax: $"+toDollarString(invoice.tax)),
          element("Total: $"+toDollarString(invoice.total)),
        ]),
        element(".button", "Issue bond"),
      ])

      var gridText = element.style(
        ".grid-text",
        {
          "display": "inline-block",
          "width": "21em",
        }
      )

      var gridColumn = element.style(
        ".grid-column",
        {
          "display": "inline-block",
          "width": "7em",
        }
      )

      bridge.addToHead(element.stylesheet(gridText, gridColumn))

      bridge.send(body)
    }


    function toDollarString(cents) {

      cents = Math.ceil(cents)

      var dollars = Math.floor(cents / 100)
      var remainder = cents - dollars*100
      if (remainder < 10) {
        remainder = "0"+remainder
      }

      return dollars+"."+remainder
    }



  }
)
