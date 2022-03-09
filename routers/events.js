module.exports = function(vonage) {
    const config = require("../config.json")
    const express = require('express')
    const router = express.Router()
    const path = require("path")
    const fs = require("fs");

    router.post("/recording", (req, res) => {
        vonage.files.save(req.body.recording_url, path.join(__dirname, "../data/recordings/", Date.now()+".wav"), (err, res) => {
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
            if (fs.existsSync(path.join(__dirname, "../data/.incall"))) {
                fs.rmSync(path.join(__dirname, "../data/.incall"))
            }
        }
        // console.log(req.body)
        res.send()
    })


    return router

}