"use strict"

const express = require("express")
const ClientOAuth2 = require("client-oauth2")
const axios = require("axios")

const app = express()

const uaaAuth = new ClientOAuth2({
  clientId: "node2",
  clientSecret: "node2",
  accessTokenUri: "http://localhost:8080/oauth/token",
  authorizationUri: "http://localhost:8080/oauth/authorize",
  redirectUri: "http://localhost:3001/client/callback",
  scopes: ["openid", "profile", "kovaro.b"]
})

app.get("/auth/uaa", (req, res) => {
  let uri = uaaAuth.code.getUri()
  console.log(uri)
  res.redirect(uri)
})

app.get("/client/callback", function (req, res) {
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
        url: "http://localhost:8080/uaa/userinfo",
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
  res.send("Hello<br/><br/><a href=\"/auth/uaa\">Log in with UAA</a>")
})

app.listen(3001, () => {
  console.log("Express server started on port 3001")
})


// Credits to [@lazybean](https://github.com/lazybean)
