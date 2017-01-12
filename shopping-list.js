

var bodyStyle = element.style("body", {
  "font-family": "sans-serif",
  "line-height": "1.5em",
  "font-size": "1.15em",
  "color": "#192F41",
  "background": "#FEF7E7",
  "-webkit-font-smoothing": "antialiased",
})

var heading = element.style("h2", {
  "background": "#E1EDEB",
  "padding": "8px 12px",
  "border": "1px solid #192F41",
  "font-size": "1em",
  "font-weight": "normal",
  "text-transform": "capitalize",
})

var lineItem = element.template(
  ".line-item",
  function(

function renderShoppingList(invoice, bridge) {

  bridge.addToHead(element.stylesheet(bodyStyle, heading).html())

  var items = element(".line-items",invoice.lineItems.map(lineItem))

  var list = 

      function renderPlanned(group) {
        var els = []
        for(var i=0; i<group.length; i++) {
          var item = group[i]

          var text = " --- #"+item.number+" --- "

          if (description == "door") {
            text = text + item.parts[0]
          } else {
            text = text + cutPlanText(item)
          }

          els.push(element(text))
        }

        var material = BASE_MATERIALS[description]
        var count = els.length + (material.extra || 0)
        var price = material.price

        var subtotal = count * price
        grandSubtotal += subtotal

        var header = description+": "+els.length+" CT "
        if (material.unit) {
          header += material.unit+" "
        }
        if (material.extra) {
          header += "+"+material.extra+" extra "
        }
        header += "@$"+toDollarString(price)+" = $"+toDollarString(subtotal)


        body.addChild(
          element("h2", header)
        )
        body.addChild(element(els))
      }

      function renderBulk(group) {

        var material = BASE_MATERIALS[description]
        var totalQuantity = 0
        var els = []
        var number = 1

        for(var i=0; i<group.length; i++) {
          var quantity = group[i].quantity
          var name = group[i].name

          totalQuantity = totalQuantity + quantity


          els.push(element(
            " ("+ct+") "+name+" ("+quantity+" "+material.unit+")"
          ))

          number++
        }

        var subtotal = Math.ceil(totalQuantity * material.price)
        body.addChild(element(element.raw("<br/>")))
        body.addChild(
          element(description+": "+totalQuantity+" "+material.unit+" @$"+toDollarString(material.price)+" = $"+toDollarString(subtotal))
        )
        body.addChild(element(els))

      }

      function renderExtra() {

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