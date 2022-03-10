module.exports = function(vonage) {
    const config = require("../config.json")
    const express = require('express')
    const router = express.Router()
    const path = require("path")
    const fs = require("fs");
    const dformat = require('date-format');

    router.post("/recording", (req, res) => {
        const filename = dformat.asString('yy.MM.dd_hh:mm:ss', new Date());
        vonage.files.save(req.body.recording_url, path.join(__dirname, "../data/recordings/", filename+".wav"), (err, res) => {
            if(err) { console.error(err); }
            else {
                console.log(res);
            }
          })
        res.send()
        console.log("Recording saved")
    })

    router.post("/", (req, res) => {
        if (req.body.status == "completed") {
            const filepath = path.join(__dirname, "../data/.incall")
            console.log(req.body)
            if (fs.existsSync(filepath) && fs.readFileSync(filepath) == req.body.uuid) {
                fs.rmSync(filepath)
            }
        }
        // console.log(req.body)
        res.send()
    })


    return router

}