const express = require('express');
require('dotenv').config()
const port = process.env.PORT || 3000;
const exploreRouter = require('./routes/explore-router');
const apiEventsRouter = require('./backend-api-routes/api-events');

const app = express();
app.set('view engine', 'ejs');

app.use(express.urlencoded({ extended: true }));
app.use('/', exploreRouter);
app.use('/api-events', apiEventsRouter);
app.use(express.static(__dirname + "/static"));

app.get("/secretKeys", (req, res) => {
    const secrets = {
        TICKETMASTER_API_KEY: `${process.env.TICKETMASTER_API_KEY}`
    }
    res.status(200).json(JSON.stringify(secrets));
});

app.listen(port, () => {
    console.log("Node application listening on port " + port);
});