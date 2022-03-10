const path = require("path");
const os = require("os");
const wav = require("node-wav");
const fs = require("fs");
const { exec } = require("child_process");
const {v4: uuidv4} = require("uuid");
const shellescape = require('shell-escape');
const config  = require("../config.json");
require("./Float32Array.concat");

const TEMP_DIR = fs.mkdtempSync(path.join(os.tmpdir(), "transcoder-storage-"));
const PAUSE = require("../config.json")["pause"] || 1;

module.exports = async function (nums, checkOnly=false) {
    var available_files = fs.readdirSync(path.join(__dirname, "../audio")).filter((item) => item.endsWith(".wav"))
    var number_map = {}
    available_files.forEach((file) => {
        var filedata = file.slice(0, -4).split("_")
        if (number_map[filedata[0]] === undefined)
            number_map[filedata[0]] = [];
        number_map[filedata[0]].push(file)
    })

    if (!nums.every((item) => (number_map[item] !== undefined))) {
        return false
    }

    
    var sampleRate = 44100;
    var pcm_data = new Float32Array(sampleRate*1);
    for (const item of nums) {
        const filepath = path.join(__dirname, "../audio", number_map[item][Math.floor(Math.random() * number_map[item].length)]);
        const buffer = await fs.promises.readFile(filepath)
        const result = wav.decode(buffer)
        // console.log(result.channelData[0]);
        if (sampleRate === undefined) {
            sampleRate = result.sampleRate
        } else if (sampleRate != result.sampleRate) {
            console.log(filepath)
            console.log("Nem egyezik a sampleRate")
            return false
        }
        pcm_data = pcm_data.concat(result.channelData[0])
        pcm_data = pcm_data.concat(new Float32Array(sampleRate*PAUSE))
    }
    const tempfileID = uuidv4()
    fs.writeFileSync(path.join(TEMP_DIR, tempfileID+".wav"), wav.encode([pcm_data], {sampleRate, float: true, bitDepth: 32}))

    if (checkOnly) {
        return true
    } else {
        return await new Promise((resolve, reject) => {
            exec(shellescape(["ffmpeg", "-i", path.join(TEMP_DIR, tempfileID+".wav"), "-filter:a", "volume="+(config.volume || 1)+",loudnorm", path.join(TEMP_DIR, tempfileID+".mp3")]), 
                (error, stdout, stdin) => {
                    if (error){
                        reject(error)
                        return
                    }
                    resolve(path.join(TEMP_DIR, tempfileID+".mp3"))
                }
            )
        })
    }
    
}