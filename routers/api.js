module.exports = function(Vonage) {
    const config = require("../config.json")
    const express = require('express')
    const router = express.Router()
    const basicAuth = require('express-basic-auth');

    const createVoice = require("../plugins/createVoice");

    router.get("/createVoice", async (req, res) => {
        if (typeof req.query.nums != typeof []) {
            res.status(400)
            res.json({error: true, message: "No"})
            return
        }
        console.log(req.query)
        
        const result = await createVoice(req.query.nums)
        if (result === false) {
            res.status(404)
            res.json({error: true, message: "Miért?"})
            return
        }
        //console.log(Vonage)
        res.header("Content-Type: audio/mp3")
        res.sendFile(result)
    })

    router.post("/start", basicAuth(config.users), (req, res) => {
        res.send()
    })

    return router
}