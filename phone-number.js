var library = require("module-library")(require)

module.exports = library.export(
  "phone-number",
  ["plivo"],
  function(plivo) {

    plivo = plivo.RestAPI({
      authId: process.env.PLIVO_AUTH_ID,
      authToken: process.env.PLIVO_AUTH_TOKEN,
    })

    function PhoneNumber(number) {
      this.number = number
    }

    PhoneNumber.prototype.send = function(text) {
      var message = {
        "src": "15108336870",
        "dst": this.number,
        text: text
      }

      function handleResponse(status, response) {
        console.log("Message sent?", status)
      }

      plivo.send_message(message, handleResponse)

      console.log("sent!", this.number)
    }

    return function phoneNumber(number) {
      return new PhoneNumber(number)
    }
  }
)