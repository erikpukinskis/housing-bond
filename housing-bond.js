var library = require("module-library")(require)


module.exports = library.export(
  "housing-bond",
  ["house-plan", "house-panels", "building-materials", "./invoice-materials", "web-element", "basic-styles", "tell-the-universe", "./issue-bond", "release-checklist", "browser-bridge"],
  function(HousePlan, housePanels, buildingMaterials, invoiceMaterials, element, basicStyles, tellTheUniverse, issueBond, releaseChecklist, BrowserBridge) {


    var tellTheUniverse = tellTheUniverse.called("bonds").withNames({issueBond: "issue-bond"})

    issueBond("a9ei", 68510, "Erik Pukinskis", "Sale of 6x8 teensyhouse", {"listId":"teensy3"})

    var HOURLY = 2000
    var HOUSE_PER_SECTION = 5

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
        "/housing-bonds",
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

          response.redirect("/housing-bonds/"+bond.id)
        }
      )

      var baseBridge = new BrowserBridge()

      basicStyles.addTo(baseBridge)

      baseBridge.addToBody(
        element("a", {href: "/"}, "⤺ Back to work space")
      )

      baseBridge.addToBody(
        element("br")
      )

      site.addRoute(
        "post",
        "/housing-bonds/:bondId/buy",
        function(request, response) {

          var name = request.body.name
          var phoneNumber = request.body.phoneNumber
          var bondId = request.params.bondId
          var bond = issueBond.get(bondId)
          var faceValue

          ;[20, 100, 500].forEach(function(dollars) {
            if (request.body["buy-"+dollars]) {
              faceValue = dollars*100
            }
          })

          issueBond.requestShares(name, phoneNumber, bondId, faceValue)

          tellTheUniverse(
            "issueBond.requestShares", name, phoneNumber, bondId, faceValue)

          var bridge = baseBridge.forResponse(response)

          bridge.send(element(".button", "Thank you for your request. Erik will text/call you shortly to arrange payment!"))
        }
      )

      site.addRoute(
        "get",
        "/housing-bonds/:id",
        function(request, response) {
          var bridge = new BrowserBridge()
        
          var bond = issueBond.get(request.params.id)

          renderBondPurchase(bridge.forResponse(response), bond)
        }
      )

    }

    function renderBondPurchase(bridge, bond) {

      var max = bond.amount

      basicStyles.addTo(bridge)

      var body = element("form", {method: "post", action: "/housing-bonds/"+bond.id+"/buy"}, [

        element("p", "All bonds mature March 30, 2017"),

        element("p", "In the event the project is not fully funded, the issuer may return the purchase price to the purchaser before March 1, 2017 and cancel the bond."),

        element("p", "If you would like to purchase a larger or smaller bond, just choose the closest one, and your bond agent will help you purchase the specific face value you desire."),

        element("p", "Enter your name:"),
        element("input", {type: "text", placeholder: "Your name", name: "name"}),

        element("p", "Enter your phone number:"),
        element("input", {type: "text", placeholder: "555-555-5555", name: "phoneNumber"}),

        element("h1", "$20 bond"),
        element("input", {type: "submit", name: "buy-20", value: "Buy Now - $19.05"}),

        element("h1", "$100 bond"),
        element("input", {type: "submit", name: "buy-100", value: "Buy Now - $95.24"}),

        element("h1", "$500 bond"),
        element("input", {type: "submit", name: "buy-500", value: "Buy Now - $476.20"}),

      ])

      bridge.send(body)
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

        list.eachTagged(tag, function(task) {
          plan.add(generator, options)
          hours += HOUSE_PER_SECTION
        })
      })

      var materials = buildingMaterials.forPlan(plan)

      var invoice = invoiceMaterials(materials)

      invoice.addLineItem({
        description: "builder labor",
        price: HOURLY,
        quantity: hours,
        unit: "hours"
      })

      var items = invoice.lineItems.map(lineItemTemplate)

      var totalText = "$"+toDollarString(invoice.total)

      var body = element("form", {method: "post", action: "/housing-bonds"}, [
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
