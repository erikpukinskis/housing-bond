var library = require("module-library")(require)

module.exports = library.export(
  "render-build-checklist",
  ["basic-styles", "web-element", "./render-invoice", "release-checklist", "house-panels", "build-house", "make-it-checkable"],
  function(basicStyles, element, renderInvoice, releaseChecklist, housePanels, buildHouse, makeItCheckable) {

    function renderBuildChecklist(bridge, list) {

      basicStyles.addTo(bridge)


      // var plan = new HousePlan()
      // var hours = 0

      // registerTagsOn(list)

      // housePanels.forEach(function(options) {
      //   var tag = options.tag
      //   var generator = options.generator

      //   list.eachTagged(tag, function(task) {
      //     plan.add(generator, options)
      //     hours += HOURS_PER_SECTION
      //   })
      // })

      // var materials = buildingMaterials.forPlan(plan)




      var text = "Research, build prototypes and software to make this checklist"

      var controls = element([
        element("20 months, 40 hours a week"),
        element("$1600 #paid")
      ])

      bridge.see("onTaskHappened", 
        bridge.defineFunction(function happened() {
          console.log("happened")
        })
      )

      bridge.addToHead(makeItCheckable.stylesheet)

      var body = [
        renderChecklistItem(bridge, text, true, controls),
      ]


      bridge.send(body)
    }

    var renderChecklistItem = element.template(
      ".task",
      element.style({
        "display": "block",
        "line-height": "1.3em",
        "margin-bottom": "0.5em",
      }),
      function(bridge, taskText, isComplete, controls) {

        var taskEl = element(taskText)

        this.addChild(taskEl)
        this.addChild(controls)

        makeItCheckable(
          taskEl,
          bridge,
          bridge.remember("onTaskHappened"),
          {checked: isComplete}
        )
      }
    )

    return renderBuildChecklist
  }
)

// [x] Build floor section A
//  $260 materials: x,y,z
//  $100 labor, 5 hours
//  $360 #paid

// [x] Build floor section B
//  $260 materials: x,y,z
//  $100 labor, 5 hours
//  $360 #paid

// [ ] Build left section A
//  $260 materials: x,y,z
//  #100 labor, 5 hours
//  $360 bond available [ Buy now ]

// [ ] Build left section B
//  +5 hours, $360 bond available [ Buy now ]
// [ ] Build RIGHT section A
//  +5 hours, $360 bond available [ Buy now ]
// [ ] Build RIGHT section B
//  5 hours, $360 bond available [ Buy now ]
// [ ] Build back A
//  $360 PART funded, 5 hours $100 bond available [ Buy now ]
// [ ] Build back B
//  $360 PART funded, 5 hours $100 bond available [ Buy now ]
// [ ] Build front wall
//  5 hours, $360 bond available [ Buy now ]
// [ ] Cut rafters
//  $50 lumber
//  10 hours, $250 bond available [ Buy now ]
// [ ] Build doors
//  $200 lumber, poly
//  10 hours, $400 bond available [ Buy now ]
// [ ] Assemble and trim
//  $200 lumber
//  20 hours, $600 bond available [ Buy now ]
// [ ] Dissassemble and Paint
//  $100 paint
//  10 hours, $300 bond available [ Buy now]
// [ ] Sell the house
//  40 hours, $800 bond available
//  $
// [ ] Deliver
//  $100 truck rental
//  $100 flooring
//  10 hours, $400 bond available [ Buy now]
