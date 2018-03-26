const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const morgan = require('morgan')

const app = express()
app.use(morgan('combined'))
app.use(bodyParser.json())
app.use(cors())

const knex = require('knex')({
    client: 'sqlite3',
    useNullAsDefault: true,
    connection: {
      filename: "../assignment.sqlite"
    }
  })
  
  app.get('/', (req, res) => {
    res.send('Hello world! Try the /app route for a list of appIDs.')
  })
  
  app.get('/app', (req, res) => {
    knex('assignment').select('appID').groupBy('appID')
      .then(values => res.json(values))
      .catch(err => res.status(500).send(err))
  })

  app.get('/app/average', (req, res) => {
    knex.raw("select appId, avg(meanSendingRateKbps) as avgrate from assignment where meanSendingRateKbps!='' group by appId")
      .then(fields => res.json(fields))
      .catch(err => res.status(500).send(err))
  })

  app.get('/app/:appID', (req, res) => {
    knex('assignment').select().where({appID: req.params.appID})
      .then(values => res.json(values))
      .catch(err => res.status(500).send(err))
  })
  
  app.get('/app/:appID/:field', (req, res) => {
    knex('assignment').select(req.params.field).where({appID: req.params.appID})
      .then(values => res.json(values))
      .catch(err => res.status(500).send(err))
  })
  app.get('/build', (req, res) => {
    knex('assignment').select('buildName','buildVer').groupBy('buildName','buildVer')
      .then(values => res.json(values))
      .catch(err => res.status(500).send(err))
  })
  app.get('/build/:buildName/:buildVer', (req, res) => {
    knex('assignment').select('meanSendingRateKbps', 'buildVer').where({buildName: req.params.buildName, buildVer: unescape(req.params.buildVer)})
      .then(values => res.json(values))
      .catch(err => res.status(500).send(err))
  })


  app.get('/fields', (req, res) => {
    knex('assignment').columnInfo()
      .then(fields => res.json(Object.keys(fields)))
      .catch(err => res.status(500).send(err))
  })



app.listen(process.env.PORT || 8081)
