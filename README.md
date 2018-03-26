# callstats.io Dashboard assignment

## About

This assignment is split to two parts: express server backend
which handles all of the api calls and vue.js frontend which
processes the data into visual form

Since this consist of two parts, both of them require installing.

# Backend

## Installing - Backend

Dependencies: Node.js, Yarn/npm.

Move to `server`-folder

`cd server`

Install all the dependancies:

`yarn install`

## Running - Backend

Move to `server`-folder (if you haven't already)

`cd server`

Now you can start the server

`yarn start`

The API is available at http://localhost:8081.

## API routes - Backend
All routes use the GET method. 

`/app`
 
Return a list of all appIDs. 

`/app/average`

Returns a list of all appIDs and their average meanSendingRateKbps.
Database entries that have this field empty are ignored.

`/app/:appID`
 
Return all data for given `appID`. Number of rows differ between appIDs. 


`/app/:appID/:field`
 
Return all data for given `field` for given `appID`.

`/build`

Lists all of the buildName and buildVer combinations. 

`/build/:buildName/:buildVer`

Returns list of `meanSendingRateKbps` for give `buildName` and `buildVer`.

`/fields`
 
Return all table columns. 

# Frontend

## Installing - Frontend
Dependencies: Node.js, Yarn/npm.

Move to `cs-dashboard`-folder

`cd cs-dashboard`

Install all the dependancies:

`yarn install`

## Running - Frontend

Move to `cs-dashboard`-folder (if you haven't already)

`cd cs-dashboard`

Now you can start the server

`yarn start`

The application is running at http://localhost:8080 which should redirect
you to the dashboard.
