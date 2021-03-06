var library = require("module-library")(require)

module.exports = library.export(
  "issue-bond",
  ["identifiable"],
  function(identifiable) {

    var bonds = {}

    // Shares and share orders are indexed together:
    var shares = {}
    var orders = {}

    // Above $1,000,000 total sales we have to file this? https://www.sec.gov/about/forms/forms-1.pdf

    function issueBond(id, amount, issuerName, repaymentSource, data) {

      var bond = {
        id: id,
        amount: amount,
        issuerName: issuerName,
        repaymentSource: repaymentSource,
        data: data,
        shares: [],
        paid: 0,
      }

      if (!bond.id) {
        identifiable.assignId(bonds, bond)
      }

      bonds[bond.id] = bond

      return bond
    }

    function orderShares(id, name, phoneNumber, bondId, faceValue) {

      var order = {
        id: id,
        purchaserName: name,
        phoneNumber: phoneNumber,
        bondId: bondId,
        faceValue: faceValue,
        isPaid: false,
      }

      if (!id) {
        identifiable.assignId(shares, order)
      }

      orders[order.id] = order

      return order
    }

    function markPaid(orderId, price, signature) {
      var order = getOrder(orderId)
      var bond = getBond(order.bondId)

      if (order.isPaid) {
        throw new Error("Order is already paid")
      }

      order.isPaid = true
      order.paid = price
      bond.shares.push(orderId)
      bond.paid += price
      console.log(bond.paid, "paid on bond")
    }


    var getBond = issueBond.get = identifiable.getFrom(bonds, {description: "bond"})

    issueBond.orderShares = orderShares

    var getOrder = issueBond.getOrder = identifiable.getFrom(orders, {description: "bond share order"})

    issueBond.markPaid = markPaid

    return issueBond
  }
)