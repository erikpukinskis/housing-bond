var library = require("module-library")(require)

module.exports = library.export(
  "housing-bond",
  ["with-nearby-modules", "house-plan", "house-panels", "building-materials", "./invoice-materials", "web-element", "browser-bridge", "basic-styles"],
  function(withNearbyModules, HousePlan, housePanels, buildingMaterials, invoiceMaterials, element, BrowserBridge, basicStyles) {

    console.log("housing bond generator")
    
    var HOURLY = 2000
    var HOUSE_PER_SECTION = 8


    console.log("here we are, loading and waiting?")
    
    withNearbyModules(
      ["release-checklist", "web-site", "browser-bridge"],
      function(list, site, bridge) {
  
        renderBond(bridge, list)

        site.addRoute(
          "post",
          "/issue-bond",
          function() {}
        )
      }
    )


    function renderBond(bridge, list) {

      if (!list) {
        throw new Error("renderBond takes (bridge, list). You didn't pass a list")
      }
      registerTagsOn(list)
      basicStyles.addTo(bridge)

      if (!bridge.__nrtvHousingBondStyles) {
        bridge.addToHead(
          element.stylesheet(lineItemTemplate))

        bridge.__nrtvHousingBondStyles = true
      }

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

      var materials = buildingMaterials.forPlan(plan)

      console.log(materials.pieceCount+" materials")

      var invoice = invoiceMaterials(materials)

      invoice.lineItems.unshift({ description: "builder labor",
          subtotal: hours*HOURLY, quantity: hours, unit: "hours"})

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

      bridge.send(body)
    }

    function registerTagsOn(list) {
      if (list.__bondPlugingRegisteredTags) { return }

      housePanels.forEach(function(options) {
        list.registerTag(options.tag)
      })

      list.__bondPlugingRegisteredTags = true
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
          "$"+toDollarString(item.subtotal)
        ))
      }
    )


    function toDollarString(cents) {

      cents = Math.ceil(cents)

      var dollars = Math.floor(cents / 100)
      var remainder = cents - dollars*100
      if (remainder < 10) {
        remainder = "0"+remainder
      }

      return dollars+"."+remainder
    }


    return renderBond

  }
)
