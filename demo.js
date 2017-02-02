var library = require("module-library")(require)


// Eventually, this should be where I record my voice and whatnot, and demo how to code a new housing bond


library.using(
  ["./", "web-host", "facilitate-releases", "release-checklist"],
  function(housingBond, webHost, facilitateReleases, releaseChecklist) {


    var teensy3 = releaseChecklist("Build a 6x8 teensyhouse", "teensy3")
    releaseChecklist.addTask("teensy3", "Buy lumber")
    releaseChecklist.addTask("teensy3", "Build floor A")
    releaseChecklist.addTask("teensy3", "Build floor B")
    releaseChecklist.addTask("teensy3", "Build left wall A")
    releaseChecklist.tag("teensy3", "build-floor-a", "base floor section")

    webHost.onSite(function(site) {
      if (site.remember("housing-bond-demo")) { return }

      facilitateReleases.prepareSite(site)
      housingBond.prepareSite(site)

      site.see("housing-bond-demo", true)
    })

    webHost.onRequest(function(getPartial) {
      housingBond(teensy3, getPartial())
      facilitateReleases(teensy3, getPartial())
    })

  }
)