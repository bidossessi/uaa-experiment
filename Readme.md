# UAA Docker configuration

## Dockerfile
```go
FROM davidcaste/alpine-tomcat:tomcat8
RUN apk add --no-cache wget
ENV UAA_VERSION=4.13.4
WORKDIR /opt/tomcat/webapps
RUN wget -O ROOT.war "http://central.maven.org/maven2/org/cloudfoundry/identity/cloudfoundry-identity-uaa/${UAA_VERSION}/cloudfoundry-identity-uaa-${UAA_VERSION}.war"
ENV JAVA_OPTIONS="-Djava.security.egd=file:/dev/./urandom -Xmx256m -Xms100m"
CMD [ "/opt/tomcat/bin/catalina.sh", "run" ]
```

## Manifest
Save in `./env` folder.
```yml
spring_profiles: prod,postgresql

database:
  driverClassName: org.postgresql.Driver
  url: jdbc:postgresql://db/uaa
  username: uaa
  password: uaa

# JWT issuer URI
issuer:
  uri: http://localhost:8080/uaa

# Custom scopes
scim:
  groups:
    kovaro.a: Do thing A in Kovaro servers
    kovaro.b: Do thing B in Kovaro servers

uaa:
  url: http://localhost:8080/uaa

# Clients bootstrap
oauth:
  clients:
    admin:
      id: admin
      secret: supersecret
      authorized-grant-types: client_credentials
      scope: none
      authorities: uaa.admin,clients.read,clients.write,clients.secret,scim.read,scim.write,clients.admin
    # Example client
    node1:
      id: node1
      secret: node1
      authorized-grant-types: authorization_code,refresh_token,client_credentials
      scope: openid,profile,kovaro.a
      authorities: oauth.login
      redirect-uri: http://localhost:3000/authcode

# https://github.com/cloudfoundry/uaa/releases/tag/4.13.0
encryption:
  active_key_label: kovaro-sig1
  encryption_keys:
  - label: kovaro-sig1
    passphrase: mypassphrase

login:
  # https://github.com/cloudfoundry/uaa/releases/tag/3.9.2
  # generate self-signed certificate using Openssl
  saml:
    activeKeyId: kovaro-sig1
    keys:
      kovaro-sig1:
        key: |
          -----BEGIN RSA PRIVATE KEY-----
          ...
          -----END RSA PRIVATE KEY-----
        passphrase: password
        certificate: |
          -----BEGIN CERTIFICATE-----
          ...
          -----END CERTIFICATE-----

# https://github.com/cloudfoundry/uaa/releases/tag/3.9.2
jwt:
  token:
    policy:
      activeKeyId: key-id-1
      keys:
        key-id-1:
          signingKey: SuperSecretSigningKey # or use a private RSA key
```

## docker-compose

```yml
version: '3'

services:
  web:
    build: .
    container_name: uaa-local
    volumes:
      - ./env:/env  # make the configuration folder available to UAA
    ports:
      - 8080:8080
    environment:
      - CLOUD_FOUNDRY_CONFIG_PATH=/env  # Point UAA to the config folder (not file)
  db:
    image: postgres:alpine
    container_name: uaa-db
    environment:
      - POSTGRES_PASSWORD=uaa
      - POSTGRES_USER=uaa
      - POSTGRES_DB=uaa
```

## SSO Demo

1. Install uaac

```sh
$ gem install cf-uaac
```
2. Start the server
```sh
$ docker-compose up -d
```

3. Connect uaac to the server and log the client in
```sh
$ uaac target http://localhost:8080

Target: http://localhost:8080
Context: admin, from client admin

$ uaac token client get admin -s supersecret

Successfully fetched token via client credentials grant.
Target: http://localhost:8080
Context: admin, from client admin

$ uaac token decode

Note: no key given to validate token signature

  jti: 0ebcb1fa74bc47c38d304ad90d92a2e8
  sub: admin
  authorities: clients.read clients.secret clients.write uaa.admin clients.admin scim.write scim.read
  scope: clients.read clients.secret clients.write uaa.admin clients.admin scim.write scim.read
  client_id: admin
  cid: admin
  azp: admin
  grant_type: client_credentials
  rev_sig: 994db794
  iat: 1526596437
  exp: 1526639637
  iss: http://localhost:8080/uaa/oauth/token
  zid: uaa
  aud: scim clients uaa admin
```

4. Create a user and attach the custom permissions
```sh
$ uaac user add user1 -p user1 --emails user1@user1.com
user account successfully added

$ uaac member add kovaro.a user1
success

$ uaac member add kovaro.b user1
success
```

5. create a client
```sh
$ uaac client add \
--name node2 \
-s node2 \
--authorized_grant_types authorization_code,refresh_token,client_credentials \
--authorities oauth.login \
--redirect_uri 'http://localhost:3001/authcode' \
--scope openid,profile,kovaro.b

Client ID:  node2
  scope: openid profile kovaro.b
  client_id: node2
  resource_ids: none
  authorized_grant_types: refresh_token client_credentials authorization_code
  redirect_uri: http://localhost:3001/authcode
  autoapprove:
  authorities: oauth.login
  name: node2
  required_user_groups:
  lastmodified: 1526599055721
  id: node2
  ```

6. Test authorization code login with a browser
```sh
$ uaac token authcode get -c node2 -s node2 --no-cf --port 3001
```
Log in through the browser using the credentials for the user you created above.
You should be presented with an  authorization form for the `openid`, `profile` and `kovaro.b` scopes.


