const config = require("./config.json")
if (!config.vonage || 
    !config.vonage.applicationId || 
    !config.vonage.host) {
    console.log("config.vonage",                new Boolean(config.vonage))
    console.log("config.vonage.applicationId",  new Boolean(config.vonage.applicationId))
    console.log("config.vonage.host",           new Boolean(config.vonage.host))
    console.error("Config fields are missing")
    process.exit(1)
}

config.port = config.port || 3000

const Vonage = require('@vonage/server-sdk')
const express = require('express')

const app = express()
app.use(express.json());

const vonage = new Vonage({
    applicationId: config.vonage.applicationId,
    privateKey: __dirname + "/private.key"
})


app.listen(config.port, () => {
    // console.log(`Example app listening at http://localhost:${config.port}`)
})