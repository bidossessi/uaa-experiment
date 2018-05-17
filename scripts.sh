#!/bin/sh

UAAC=$(which uaac)

# WHY IS THERE NO UAAC INTERFACE FOR THIS?!!!!
# Create a new zone (has to be a subdomain of our current zone)
$UAAC \
    -t curl \
    -XPOST \
    -H"Content-Type:application/json" \
    -H"Accept:application/json" \
    --data '{ "id":"testzone1", "subdomain":"testzone1", "name":"The Twiglet Zone[testzone1]", "version":0, "description":"Like the Twilight Zone but tastier[testzone1]."}' \
    /identity-zones

# Register the admin inside the new zone
$UAAC \
    -t curl \
    -H"X-Identity-Zone-Id:testzone1" \
    -XPOST \
    -H"Content-Type:application/json" \
    -H"Accept:application/json" \
    --data '{ "client_id" : "admin", "client_secret" : "adminsecret", "scope" : ["uaa.none"], "resource_ids" : ["none"], "authorities" : ["uaa.admin","clients.read","clients.write","clients.secret","scim.read","scim.write","clients.admin"], "authorized_grant_types" : ["client_credentials"]}' \
    /oauth/clients

# switch to the new zone
$UAAC target http://testzone1.localhost:8080/uaa

# Login
$UAAC token client get admin -s adminsecret

# Business as usual
$UAAC token decode
