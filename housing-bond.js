var library = require("module-library")(require)

library.define(
  "identifiable",
  function() {

    function assignId(collection, item) {
      do {
        var id = Math.random().toString(36).split(".")[1].substr(0,4)
      } while (collection[id])

      item.id = id
    }

    function get(collection, description, ref) {
      if (!ref) {
        throw new Error("No ref!")
      }

      if (typeof ref == "string") {
        var item = collection[ref]
      } else {
        var item = ref
      }

      if (!item) {
        throw new Error("No "+description+" in collection with id "+ref)
      }

      return item
    }

    return {
      assignId: assignId,
      getFrom: function(collection) {
        return get.bind(null, collection)
      }
    }

  }
)


library.define(
  "issue-bond",
  ["identifiable"],
  function(identifiable) {

    var bonds = {}

    function issueBond(id, amount, issuerName, repaymentSource, data) {

      var bond = {
        id: id,
        amount: amount,
        issuerName: issuerName,
        repaymentSource: repaymentSource,
        data: data
      }

      if (!bond.id) {
        identifiable.assignId(bonds, bond)
      }

      return bond
    }

    return issueBond
  }
)



module.exports = library.export(
  "housing-bond",
  ["with-nearby-modules", "house-plan", "house-panels", "building-materials", "./invoice-materials", "web-element", "browser-bridge", "basic-styles", "tell-the-universe", "issue-bond", "release-checklist"],
  function(withNearbyModules, HousePlan, housePanels, buildingMaterials, invoiceMaterials, element, BrowserBridge, basicStyles, tellTheUniverse, issueBond, releaseChecklist) {


    var tellTheUniverse = tellTheUniverse.called("bonds").withNames({issueBond: "issue-bond"})

    var HOURLY = 2000
    var HOUSE_PER_SECTION = 5

    // Above $1,000,000 total sales we have to file this? https://www.sec.gov/about/forms/forms-1.pdf

    function parseMoney(string) {
      var trimmed = string.replace(/[^.0-9]/, "")
      var amount = parseFloat(trimmed)
      var dollars = Math.floor(amount)
      var remainder = amount - dollars
      var cents = Math.floor(remainder*100)

      return dollars*100 + cents
    }

    function prepareSite(site) {
      site.addRoute(
        "post",
        "/housing-bond/issue",
        function(request, response) {

          var listId = request.body.checklistId
          var list = releaseChecklist.get(listId)
          var issuerName = request.body.issuerName
          var amount = parseMoney(request.body.amount)

          var repaymentSource = request.body.repaymentSource

          var bond = issueBond(
            null,
            amount,
            issuerName,
            repaymentSource,
            {
              listId: listId
            }
          )

          tellTheUniverse("issueBond", bond.id, amount, issuerName, repaymentSource, bond.data)

          response.send("ya")
        }
      )
    }


    function renderBond(list, bridge) {

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

      invoice.addLineItem({
        description: "builder labor",
        price: HOURLY,
        quantity: hours,
        unit: "hours"
      })

      var items = invoice.lineItems.map(lineItemTemplate)

      var totalText = "$"+toDollarString(invoice.total)

      var body = element("form", {method: "post", action: "/housing-bond/issue"}, [
        element("h1", "Housing Bond: "+list.story),
        element(items),
        element("p", [
          element("Tax: $"+toDollarString(invoice.tax)),
          element("Total: "+totalText),
        ]),

        element("p", "Who is issuing this bond?"),
        element("p",
          element("input", {
            type: "text",
            name: "issuerName",
            placeholder: "Issuer name",
          })
        ),

        element("p", "Total bonded amount"),
        element("p",
          element("input", 
            {
              type: "text", 
              value: totalText,
              name: "amount",
              placeholder: "Amount"
            },
            element.style({"max-width": "5em"})
          )
        ),

        element("p", "To be repayed from"),
        element("p",
          element("input", {
            type: "text",
            name: "repaymentSource",
            value: "Completion of release checklist "+list.story,
            placeholder: "Source of repayment funds",
          })
        ),

        element("input", {
          type: "hidden",
          name: "checklistId",
          value: list.id
        }),

        element("input.button", {type: "submit", value: "Issue bond"}),
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

    renderBond.prepareSite = prepareSite


    return renderBond

  }
)
