const express = require('express');
const port = process.env.PORT || 3000;
const exploreRouter = require('./routes/explore-router');

const app = express();
app.set('view engine', 'ejs');

app.use(express.urlencoded({ extended: true }));
app.use('/', exploreRouter);
app.use(express.static(__dirname + "/static"));


app.listen(port, () => {
    console.log("Node application listening on port " + port);
});