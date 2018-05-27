# UAA Docker configuration

## Requirements
- `ansible-playbook`
- `docker-compose`
- `gem` (to instal uaac)

## Update vars
Update `site.yml` with the required vars, then run

```bash
$ ansible-playbook -i hosts site.yml
```
to create the container.

## Test it out

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

$ uaac token client get admin -s <the password you chose in ansible>

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

4. Create a user and attach some custom permissions
```sh
$ uaac group add kovaro.a
id: 0bcceb37-bdfd-4461-a25d-9dfee8381781
  meta
    version: 0
    created: 2018-05-27T18:38:35.026Z
    lastmodified: 2018-05-27T18:38:35.026Z
  members:
  schemas: urn:scim:schemas:core:1.0
  displayname: kovaro.a
  zoneid: uaa

$ uaac group add kovaro.b
id: 348bccff-f996-42b1-9262-ba423dd828aa
  meta
    version: 0
    created: 2018-05-27T18:38:54.745Z
    lastmodified: 2018-05-27T18:38:54.745Z
  members:
  schemas: urn:scim:schemas:core:1.0
  displayname: kovaro.b
  zoneid: uaa

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
