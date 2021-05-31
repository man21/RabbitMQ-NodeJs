const dotenv = require("dotenv")
const EmailService = require("../util/email.service")
dotenv.config()
const open = require("amqplib").connect(process.env.AMQP_CONNECTION_STRING)

var queue = "Email-Queue"

open
  .then((connection) => connection.createChannel())
  .then((ch) => {
    ch.assertQueue(queue).then(() => {
      console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", queue)
      return ch.consume(queue, (msg) => {
        if (msg !== null) {
          if (msg !== null) {
            const { mail, subject, template } = JSON.parse(msg.content.toString())
            console.log(" [x] Received %s", mail)
            // send email via aws ses
            EmailService.sendMail(mail, subject, template).then(() => {
              ch.ack(msg)
            })
          }
        }
      })
    })
  })
  .catch((error) => console.warn(error))
