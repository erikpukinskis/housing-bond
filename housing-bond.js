var library = require("module-library")(require)


module.exports = library.export(
  "housing-bond",
  ["house-plan", "house-panels", "building-materials", "./invoice-materials", "web-element", "basic-styles", "tell-the-universe", "./issue-bond", "release-checklist", "browser-bridge", "./phone-number"],
  function(HousePlan, housePanels, buildingMaterials, invoiceMaterials, element, basicStyles, tellTheUniverse, issueBond, releaseChecklist, BrowserBridge, phoneNumber) {


    var tellTheUniverse = tellTheUniverse.called("bonds").withNames({issueBond: "issue-bond"})

    var HOURLY = 2000
    var HOUSE_PER_SECTION = 5

    function parseMoney(string) {
      var trimmed = string.replace(/[^0-9.-]*/g, "")
      var amount = parseFloat(trimmed)
      var dollars = Math.floor(amount)
      var remainder = amount - dollars
      var cents = Math.floor(remainder*100)

      return dollars*100 + cents
    }

    var baseBridge = new BrowserBridge()

    basicStyles.addTo(baseBridge)

    baseBridge.addToBody(
      element("a", {href: "/"}, "⤺ Back to work space")
    )

    baseBridge.addToBody(
      element("br")
    )


    function prepareSite(site) {

      // Issue a bond

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


      // Learn about an issued bond

      site.addRoute("get", "/housing-bond/tiny.jpg", site.sendFile("tiny.jpg"))

      site.addRoute(
        "get",
        "/housing-bonds/:id",
        function(request, response) {
          var bridge = new BrowserBridge()
        
          var bond = issueBond.get(request.params.id)

          renderBondPurchase(bridge.forResponse(response), bond)
        }
      )


      // Request to buy a bond

      site.addRoute(
        "post",
        "/housing-bonds/:bondId/buy",
        function(request, response) {

          var name = request.body.name
          var number = request.body.phoneNumber
          var bondId = request.params.bondId
          var bond = issueBond.get(bondId)
          var faceValue

          ;[20, 100, 500].forEach(function(dollars) {
            if (request.body["buy-"+dollars]) {
              faceValue = dollars*100
            }
          })

          var order = issueBond.orderShares(null, name, number, bondId, faceValue)

          tellTheUniverse(
            "issueBond.orderShares", order.id, name, number, bondId, faceValue)

          var buyer = phoneNumber("18123201877")

          buyer.send(number+" ("+name+") wants to by a "+toDollarString(faceValue)+" bond: http://ezjs.co/bond-orders/"+order.id)

          var bridge = baseBridge.forResponse(response)

          bridge.send(element("p", "Thank you for your request. Erik will text/call you shortly to arrange payment!"))
        }
      )

      // Get an order to sign

      site.addRoute("get", "/bond-orders/:orderId", function(request, response) {

        var order = issueBond.getOrder(request.params.orderId)
        var bond = issueBond.get(order.bondId)
        var bridge = baseBridge.forResponse(response)

        renderUnsignedShare(bridge, bond, order)
      })


      // Mark shares paid

      site.addRoute("post", "/bond-orders/:orderId/mark-paid", function(request, response) {

        var orderId = request.params.orderId
        var signature = request.body.paymentReceivedBy
        var order = issueBond.getOrder(orderId)
        var price = parseMoney(request.body.price)

        issueBond.markPaid(orderId, price, signature)

        tellTheUniverse("issueBond.markPaid", orderId, price, signature)

        baseBridge.forResponse(response).send("Shares signed")
      })

    }

    function renderUnsignedShare(bridge, bond, order) {

      var price = order.faceValue / 1.05

      var form = element("form", {method: "post", action: "/bond-orders/"+order.id+"/mark-paid"}, [
        element("h1", "Receipt of payment for bond shares"),
        element("p", "To be repayed from "+bond.repaymentSource),
      ])

      form.addChildren(
        element("input", {type: "text", value: order.purchaserName, name: "purchaserName", placeholder: "Name of person buying shares"}),
        element("input", {type: "text", value: toDollarString(order.faceValue), name: "faceValue", placeholder: "Face value"}),
        element("input", {type: "text", value: toDollarString(price), name: "price", placeholder: "Price"}),
        element("input", {type: "text", value: order.phoneNumber, name: "contactNumber", placeholder: "Contact number"}),
        element("p", "Payment accepted by"),
        element("input", {type: "text", value: "Erik", name: "paymentReceivedBy", placeholder: "Signed"}),
        element("p", element("input", {type: "submit", value: "Mark paid"}))
      )

      bridge.send(form)
    }

    function renderBondPurchase(bridge, bond) {

      var max = bond.amount

      basicStyles.addTo(bridge)

      var body = element("form", element.style({"max-width": "500px"}), {method: "post", action: "/housing-bonds/"+bond.id+"/buy"}, [

        element("img", {src: "/housing-bond/tiny.jpg"}, element.style({"width": "100%"})),
        element("h1", "Dear friends,"),
        element("p", "I'm starting a small tiny house business. I have built two prototypes, and made very detailed plans. I would like to build one for sale."),
        element("p", "I need materials. Materials cost money. Classic situation in economics. I need to sell a bond."),
        element("p", "The basic deal is this: If you buy a $200 bond, I will return to you $210 some time in the next 60 days."),

        element("h1", "What makes you think you can do this?"),
        element("p", "In order to buy the materials, pay myself and Bobby (my partner in prototype building), pay the premium on the bonds, I need to sell the house for $3000."),
        element("p", "Seems doable in the Bay Area housing market."),

        element("h1", "These \"plans\" are they sketched on a napkin somewhere?"),
        element("p", "No, they are computer drawings and instruction checklists for how to build everything. I will dump all of the details I have below."),
        element("p", "If I've convinced you, click one of the buttons below. If you have questions, text me: 812-320-1877."),
        element("p", "Best,", element("br"), "Erik"),

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

        element("input", {type: "submit", name: "buy-unknown", value: "Buy Now - $????"}),

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

      var totalText = toDollarString(invoice.total)

      var body = element("form", {method: "post", action: "/housing-bonds"}, [
        element("h1", "Housing Bond: "+list.story),
        element(items),
        element("p", [
          element("Tax: "+toDollarString(invoice.tax)),
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

    renderBond.prepareSite = prepareSite


    return renderBond

  }
)
