const express = require('express')
const https = require('https')
const app = express()
const fs = require('fs')
const port = 3030
const bodyParser = require('body-parser')
const oauthServer = require('./oauth/server.js')

const DebugControl = require('./utilities/debug.js')

//Here we are configuring express to use body-parser as middle-ware.
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(DebugControl.log.request())

app.use('/client', require('./routes/client.js')) // Client routes
app.use('/oauth', require('./routes/auth.js')) // routes to access the auth stuff
// Note that the next router uses middleware. That protects all routes within this middleware
app.use('/secure', (req,res,next) => {
  DebugControl.log.flow('Authentication')
  return next()
},oauthServer.authenticate(), require('./routes/secure.js')) // routes to access the protected stuff
// app.use('/', (req,res) => res.redirect('/client'))

https.createServer({
  key: fs.readFileSync('key.pem'),
  cert: fs.readFileSync('cert.crt'),
  passphrase: "hello"
}, app)
.listen(3030, function () {
  console.log("Oauth Server listening on port ", port)
})

module.exports = app // For testing
