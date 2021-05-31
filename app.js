const express = require("express")
const bodyParser = require("body-parser")
const hsts = require("hsts")
const compression = require("compression")

const {publishMessage} = require("./rabbitMQ/producer")
require("./rabbitMQ/consumer")

require("dotenv").config()
const app = express()

app.use(hsts({ maxAge: 5184000 }))
app.use(compression())

//To allow cross origin request
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*")
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization")
  res.header("Access-Control-Allow-Methods", "PUT, POST, GET, DELETE, OPTIONS")
  next()
})

//body parser middlewares
app.use(bodyParser.json({ limit: "20mb" }))
app.use(bodyParser.urlencoded({ extended: false }))

app.get("/", (req, res) => {
  return res.status(200).send({
    message: "Welcome"
  })
})

app.post("/email", (req, res) => {
  const {
    body: { email }
  } = req
  const emailOptions = {
    mail: [email],
    subject: "Email confirmed",
    template: `
    <body>
     <p>Hi,</p>
     <p>Thanks for your submission, your email address has been recorder successfully</p>
    </body>
    `
  }
  // call rabbitmq service to app mail to queue
  publishMessage(emailOptions)
  return res.status(202).send({
    message: "Email sent successfully"
  })
})

module.exports = app
