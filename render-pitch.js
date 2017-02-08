var library = require("module-library")(require)

module.exports = library.export(
  "render-pitch",
  ["basic-styles", "web-element", "./render-invoice", "release-checklist"],
  function(basicStyles, element, renderInvoice, releaseChecklist) {

    function renderPitch(bridge, bond, invoice) {

      basicStyles.addTo(bridge)

      var letter = element([
        element("img", {src: "/housing-bond/tiny.jpg"}, element.style({"width": "100%"})),
        element("h1", "Dear friends,"),
        element("p", "I'm starting a  tiny house building business. I have built two prototypes, and made very detailed plans. I would like to build one for sale."),
        element("p", "I need materials. Materials cost money. Classic situation in economics. I need to sell a bond."),
        element("p", "The basic deal is this: If you buy a $200 bond, I will return to you $210 some time in the next 60 days."),

        element("h1", "What makes you think you can do this?"),
        element("p", "In order to buy the materials, pay myself and Bobby (my partner in prototype building), pay the premium on the bonds, I need to sell the house for $3000."),
        element("p", "Seems doable in the Bay Area housing market."),

        element("h1", "These \"plans\" are they sketched on a napkin somewhere?"),
        element("p", "No, they are computer drawings and instruction checklists for how to build everything. I will dump all of the details I have below."),
        element("p", "If I've convinced you, click one of the buttons below. If you have questions, text me: 812-320-1877."),
        element("p", "Best,", element("br"), "Erik"),
      ])

      var form = element("form", {method: "post", action: "/housing-bonds/"+bond.id+"/buy"}, [
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

        element("h1", "Name your own price"),
        element("input", {type: "submit", name: "buy-unknown", value: "Buy Now - $????"}),
      ])

      form.appendStyles({"margin": "5em 0"})

      var plans = element(
        element.style({"text-align": "center", "margin-top": "5em"}), [
        element("img", {src: "/housing-bond/side-view.gif"}),
        element(".caption", "Side view"),
        element("img", {src: "/housing-bond/top-view.gif"}),
        element(".caption", "Top view"),
        element("img", {src: "/housing-bond/front-view.gif"}),
        element(".caption", "Front view"),
      ])

      var body = element(
        element.style({
          "max-width": "500px",
          "margin": "2em 10% 10em 10%",
        }),
        [letter, form, invoice, plans],
        element.stylesheet(
          element.style(".caption", {
            "text-align": "center",
            "margin-bottom": "5em",
          }),
          element.style("img", {
            "width": "100%",
          }),
          element.style("h1", {
            "margin-top": "2em",
          })
        )
      )


      bridge.send(body)
    }

    return renderPitch
  }
)


