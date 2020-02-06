const path = require('path') // has path and __dirname
const express = require('express')
const oauthServer = require('../oauth/server.js')

const DebugControl = require('../utilities/debug.js')
const axios = require('axios')


const router = express.Router() // Instantiate a new router

const filePath = path.join(__dirname, '../public/oauthAuthenticate.html')

router.get('/', (req, res) => {  // send back a simple form for the oauth
  res.sendFile(filePath)
})


router.post('/authorize', (req, res, next) => {
  DebugControl.log.flow('Initial User Authentication')
  const { email, password } = req.body
  DebugControl.log.flow(email + " " + password);
  if (email && password) {
    var body = {
      email: email,
      password: password
    }
    console.log("losant post call");

    axios.post('https://vesiotdev.onlosant.com/alexa_signin', body)
      .then(function (response) {
        console.log("success...");

        req.body.user = { user: 1 }
        return next()
      })
      .catch(function (error) {
        console.log("Error response");
        console.log(error);
        const params = [ // Send params back down
          'client_id',
          'redirect_uri',
          'response_type',
          'grant_type',
          'state',
        ]
          .map(a => `${a}=${req.body[a]}`)
          .join('&')
        return res.redirect(`/oauth?success=false&${params}`)
      });
  }
  
}, (req, res, next) => { // sends us to our redirect with an authorization code in our url
  DebugControl.log.flow('Authorization')
  return next()
}, oauthServer.authorize({
  authenticateHandler: {
    handle: req => {
      DebugControl.log.functionName('Authenticate Handler')
      DebugControl.log.parameters(Object.keys(req.body).map(k => ({ name: k, value: req.body[k] })))
      return req.body.user
    }
  }
}))

router.post('/token', (req, res, next) => {
  DebugControl.log.flow('Token')
  next()
}, oauthServer.token({
  requireClientAuthentication: { // whether client needs to provide client_secret
    // 'authorization_code': false,
  },
}))  // Sends back token


module.exports = router
