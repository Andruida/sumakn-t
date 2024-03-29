const { response } = require("express");

module.exports = function(vonage) {
    const config = require("../config.json")
    const express = require('express')
    const router = express.Router()
    const basicAuth = require('express-basic-auth');
    const fs = require("fs");
    const path = require("path")
    const serveIndex = require('serve-index')

    const sumakAuth = basicAuth({
        users: config.users, 
        challenge: true, 
        realm: 'Sumakn\'t'
    })

    const createVoice = require("../plugins/createVoice");

    function breakUpNums(req, res, next) {
        if (req.query.nums !== undefined && typeof req.query.nums == typeof "1,2,3,4") {
            req.query.nums = req.query.nums.split(",")
        }
        next()
    }

    router.get("/createVoice", breakUpNums, async (req, res) => {
        if (typeof req.query.nums != typeof []) {
            res.status(400)
            res.json({error: true, message: "No"})
            return
        }
        //console.log(req.query)
        
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

    router.get("/status", (req, res) => {
        res.json({error: false, message: "OK", inProgress: fs.existsSync(path.join(__dirname, "../data/.incall"))})
        // const callID = fs.readFileSync(path.join(__dirname, "../data/.incall"))
        // vonage.calls.get(callID, (error, response) => {
        //     if (error) {
        //         //console.error(error)
        //         console.error(error.body)
        //         res.status(500)
        //         res.json({error:true, message:"Belső hiba történt"})
        //     } else {
        //         res.json(response)
        //     }
        // })
    })

    router.post("/end", sumakAuth, (req, res) => {
        if (!fs.existsSync(path.join(__dirname, "../data/.incall"))) {
            res.status(404)
            res.json({error: true, message: "Nincs hívás folyamatban!"})
            return
        }
        const callID = fs.readFileSync(path.join(__dirname, "../data/.incall"))
        vonage.calls.update(callID, {action: "hangup"}, (error, response) => {
            if (error) {
                //console.error(error)
                console.error(error.body)
                res.status(500)
                res.json({error:true, message:"Belső hiba történt"})
            } else {
                res.json({error:false, message:"OK"})
            }
        })
    })

    const recordingsPath = path.join(__dirname, "../data/recordings")
    router.use("/recordings", sumakAuth, serveIndex(recordingsPath), express.static(recordingsPath))

    router.post("/start", sumakAuth, async (req, res) => {
        if (!req.body.bgMode && fs.existsSync(path.join(__dirname, "../data/.incall"))) {
            res.status(400)
            res.json({error: true, message: "Már másik hívás folyamatban!"})
            return
        }
        if (!req.body.phone) {
            res.status(400)
            res.json({error: true, message:"Kihagytad a telefonszámot!"})
            return
        }
        if (typeof req.body.nums != typeof []) {
            res.status(400)
            res.json({error: true, message:"Kihagytad a számokat!"})
            return
        }
        if (!(await createVoice(req.body.nums, true))) {
            res.status(400)
            res.json({error: true, message: "A választott számok között van nem elérhető! (jelenleg az 1-50 tartományban az összes, 50-100 tartományban csak a prímszámok elérhetőek)"})
            return
        }
        let nums=req.body.nums.join("%2C")
        vonage.calls.create({
            to: [{
                type: "phone",
                number: req.body.phone
            }],
            from: {
                type: "phone",
                number: "36200000000"
            },
            event_url: [`https://${config.vonage.host}/events/`],
            event_method: "POST",
            ncco: [
                {action: "record", split: "conversation", eventUrl: [`https://${config.vonage.host}/events/recording`]},
                {action: "stream", level:1, streamUrl: [`https://${config.vonage.host}/api/createVoice?nums=${nums}`]}
            ]
        }, (error, response) => {
            if (error) {
                //console.error(error)
                console.error(error.body)
                res.status(500)
                res.json({error:true, message:"Belső hiba történt"})
            } else {
                if (response) {
                    if (!req.body.bgMode)
                        fs.writeFileSync(path.join(__dirname, "../data/.incall"), response.uuid)
                    res.json({error:false, message:"OK"})
                    return
                }
                res.status(500)
                res.json({error:true, message:"Belső hiba történt"})
            }
            
        })
    })

    return router
}