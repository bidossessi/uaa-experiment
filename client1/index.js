"use strict"

const express = require("express")
const ClientOAuth2 = require("client-oauth2")
const axios = require("axios")

const app = express()

const uaaAuth = new ClientOAuth2({
  clientId: "node1",
  clientSecret: "node1",
  accessTokenUri: "http://localhost:8080/oauth/token",
  authorizationUri: "http://localhost:8080/oauth/authorize",
  redirectUri: "http://localhost:3000/authcode",
  scopes: ["openid", "profile", "kovaro.a"]
})

app.get("/auth/uaa", (req, res) => {
  let uri = uaaAuth.code.getUri()
  console.log(uri)
  res.redirect(uri)
})

app.get("/authcode", function (req, res) {
  uaaAuth.code.getToken(req.originalUrl)
    .then(function (user) {
      console.log(user) //=> { accessToken: '...', tokenType: 'bearer', ... }

      // Refresh the current users access token.
      user.refresh().then(function (updatedUser) {
        console.log(updatedUser !== user) //=> true
        console.log(updatedUser.accessToken)
      })

      // Use the token to query the /userinfo endpoint
      let opts = {
        method: "get",
        url: "http://localhost:8080/userinfo",
        headers: {Authorization: `Bearer ${user.accessToken}`},
      }
      axios(opts)
        .then(response => {
          res.send(response.data)
        })
        .catch(console.log)
    })
    .catch(console.log)
})

app.get("/success", (req, res) => {
  res.send("")
})

app.get("/", (req, res) => {
  res.send("Hello<br/>Who are you?<br/><br/><a href=\"/auth/uaa\">Log in with UAA</a>")
})

app.listen(3000, () => {
  console.log("Express server started on port 3000")
})


// Credits to [@lazybean](https://github.com/lazybean)
