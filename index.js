const express = require('express')
const app = express()
const port = 3000
const {plcSimulator} = require('./machines')
const config = require("./config.json")
const { connect } = require('mqtt')
const client = connect(config.mqtt["broker-addr"]);
client.subscribe("machinedata")
console.log(config)

const sim = new plcSimulator()

sim.start(client)

app.use(express.static('public'))
app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.get('/toggleAlarm/:machinenumber', (req, res) => {
  sim.setAlarm(req.params.machinenumber)
  res.sendStatus(200);
})

app.get('/clearAlarm/:machinenumber', (req, res) => {
 sim.clearAlarm(req.params.machinenumber)
  res.sendStatus(200);
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

