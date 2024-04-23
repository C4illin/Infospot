const express = require("express");
const cors = require("cors");
const SpotifyWebApi = require("spotify-web-api-node");
require("dotenv").config();

// const livereload = require("livereload");
// const connectLiveReload = require("connect-livereload");
// const path = require("path");

const app = express();
const port = process.env.PORT || 3000;
const url = process.env.URL || "http://localhost:3000";

//Livereload code
// const liveReloadServer = livereload.createServer();
// liveReloadServer.watch(path.join(__dirname, "views"));
// liveReloadServer.server.once("connection", () => {
//   setTimeout(() => {
//     liveReloadServer.refresh("/");
//   }, 100);
// });
// app.use(connectLiveReload());
//End of livereload code

app.use(express.static("public"));
app.use(express.json());
app.use(cors())
app.set("view engine", "ejs")

const spotifyApi = new SpotifyWebApi({
  clientId: process.env.clientId,
  clientSecret: process.env.clientSecret,
  redirectUri: `${url}/callback`,
});

app.get("/", (req, res) => {
  if (!spotifyApi.getAccessToken()) {
    res.redirect("/login");
    return;
  }

  const data = {};
  spotifyApi.getMyCurrentPlayingTrack().then((track) => {
    data.track = track.body;
    const songId = track.body.item.id;
    spotifyApi.getAudioFeaturesForTrack(songId).then((features) => {
      data.features = features.body;
    })
      .catch((err) => {
        console.log(err);
        res.send("Error, try again.");
      });

    spotifyApi.getAudioAnalysisForTrack(songId).then((analysis) => {
      data.analysis = analysis.body;
      res.render("index", { data: data })
    })
      .catch((err) => {
        console.log(err);
        res.send("Error, try again.");
      })
  })
    .catch((err) => {
      console.log(err);
      res.send(`Play something on Spotify and go to <a href='/login'>${url}/login</a>`);
    });
});

app.get("/login", (req, res) => {
  const scopes = [
    "user-read-private",
    "user-read-email",
    "user-top-read",
    "user-read-recently-played",
    "user-read-playback-state",
    "user-modify-playback-state",
    "user-read-currently-playing",
    "streaming",
  ];
  const authorizeURL = spotifyApi.createAuthorizeURL(scopes);
  res.redirect(authorizeURL);
});

app.get("/callback", (req, res) => {
  const { code } = req.query;
  spotifyApi
    .authorizationCodeGrant(code)
    .then((data) => {
      const { access_token, refresh_token } = data.body;
      spotifyApi.setAccessToken(access_token);
      spotifyApi.setRefreshToken(refresh_token);
      // Redirect to new route
      res.redirect("/");
    })
    .catch((err) => {
      console.log(err);
      res.redirect("/");
    });
});

app.get("/strobe", (req, res) => {
  if (!spotifyApi.getAccessToken()) {
    res.redirect("/login");
    return;
  }

  const data = {};
  spotifyApi.getMyCurrentPlayingTrack().then((track) => {
    data.track = track.body;
    const songId = track.body.item.id;
    spotifyApi.getAudioFeaturesForTrack(songId).then((features) => {
      data.features = features.body;
    })
      .catch((err) => {
        console.log(err);
        res.send("Error, try again.");
      });

    spotifyApi.getAudioAnalysisForTrack(songId).then((analysis) => {
      data.analysis = analysis.body;
      res.render("strobe", { data: data });
    })
      .catch((err) => {
        console.log(err);
        res.send("Error, try again.");
      })
  })
    .catch((err) => {
      console.log(err);
      res.send(`Play something on Spotify and go to <a href='/login'>${url}/login</a>`);
    });
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port} and ${url}`);
});
