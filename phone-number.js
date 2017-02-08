var library = require("module-library")(require)

module.exports = library.export(
  "phone-number",
  ["plivo"],
  function(plivo) {

    if (process.env.PLIVO_AUTH_ID) {
      var messages = plivo.RestAPI({
        authId: process.env.PLIVO_AUTH_ID,
        authToken: process.env.PLIVO_AUTH_TOKEN,
      })
    }

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

      if (!messages) {
        console.log("Tried to send text message, but no Plivo credentials found. Try starting app with PLIVO_AUTH_ID=x PLIVO_AUTH_TOKEN=y node your-app")
        return
      }

      messages.send_message(message, handleResponse)

      console.log("sent!", this.number)
    }

    return function phoneNumber(number) {
      return new PhoneNumber(number)
    }
  }
)