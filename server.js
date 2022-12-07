import express from "express"
import cors from "cors"
import bodyParser from "body-parser";
import lyricsFinder from "lyrics-finder"
import SpotifyWebApi from "spotify-web-api-node"
import songController from "./controllers/song-controller.js"

const app = express()
app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))


songController(app)

app.post("/refresh", (req, res) => {
    const refreshToken = req.body.refreshToken
    const spotifyApi = new SpotifyWebApi({
                                             redirectUri: 'http://localhost:3000',
                                             clientId: 'bb235ac85acd4799bac266127f244d7f',
                                             clientSecret: 'f90c5e786138486693a7387946739c3f',
                                             refreshToken,
                                         })

    spotifyApi
        .refreshAccessToken()
        .then(data => {
            res.json({
                         accessToken: data.body.accessToken,
                         expiresIn: data.body.expiresIn,
                     })
        })
        .catch(err => {
            console.log(err)
            res.sendStatus(400)
        })
})

app.post("/login", (req, res) => {
    const code = req.body.code
    const spotifyApi = new SpotifyWebApi({
                                             redirectUri: 'http://localhost:3000',
                                             clientId: 'bb235ac85acd4799bac266127f244d7f',
                                             clientSecret: 'f90c5e786138486693a7387946739c3f',
                                         })

    spotifyApi
        .authorizationCodeGrant(code)
        .then(data => {
            res.json({
                         accessToken: data.body.access_token,
                         refreshToken: data.body.refresh_token,
                         expiresIn: data.body.expires_in,
                     })
        })
        .catch(err => {
            res.sendStatus(400)
        })
})

app.get("/lyrics", async (req, res) => {
    const lyrics =
        (await lyricsFinder(req.query.artist, req.query.track)) || "No Lyrics Found"
    res.json({ lyrics })
})

app.listen(4000)
