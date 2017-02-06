var library = require("module-library")(require)

module.exports = library.export(
  "issue-bond",
  ["identifiable"],
  function(identifiable) {

    var bonds = {}
    var pendingRequests = []

    // Above $1,000,000 total sales we have to file this? https://www.sec.gov/about/forms/forms-1.pdf

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

      bonds[bond.id] = bond

      return bond
    }

    function requestShares(name, phoneNumber, bondId, faceValue) {
      pendingRequests.push({
        name: name,
        phoneNumber: phoneNumber,
        bondId: bondId,
        faceValue: faceValue,
      })
    }


    issueBond.get = identifiable.getFrom(bonds)

    issueBond.requestShares = requestShares

    return issueBond
  }
)