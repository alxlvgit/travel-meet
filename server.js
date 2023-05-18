const express = require('express');
require('dotenv').config()
const app = express();
const port = process.env.PORT || 3000;
const exploreRouter = require('./routes/explore-router');
const apiEventsRouter = require('./backend-api-routes/api-events');
const apiPostsRouter = require('./backend-api-routes/api-feed-routes');
const apiUserRouter = require('./backend-api-routes/api-user-routes');
const userProfileRouter = require('./routes/userProfileRouter');
const postCreateRouter = require('./backend-api-routes/api-post-create-router');

// Import prisma
const chatRouter = require('./routes/chat-router');
const authRouter = require('./routes/auth-route');
const passportMiddleware = require('./passport-middleware/passport-middleware');
const session = require('express-session');
const { forwardAuthenticated } = require('./passport-middleware/check-auth');

const server = require('http').createServer(app);
const io = require('socket.io')(server, { cors: { origin: "*" } });
const mapRouter = require('./routes/meet-map-router')(io);
app.set('view engine', 'ejs');
app.use(express.static(__dirname + "/static"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// Session middleware with cookie expiration of 15 minutes
app.use(
    session({
        secret: "secret",
        resave: false,
        saveUninitialized: false,
        cookie: {
            httpOnly: true,
            secure: false,
            maxAge: 24 * 60 * 60 * 1000,
        },
    })
);

passportMiddleware(app);


// For testing purposes only
// app.use((req, res, next) => {
//     console.log(`User details are: `);
//     console.log(req.user);

//     console.log("Entire session object:");
//     console.log(req.session);

//     console.log(`Session details are: `);
//     console.log((req.session).passport);
//     next();
// });

// For testing purposes only
// Test middleware to store user location in session
app.post('/updateLocation', (req, res) => {
    const locationData = req.body;
    if ("noPermissionFromUser" in locationData) {
        console.log("No permission from user to get location");
        req.session.locationData = null;
        res.sendStatus(200);
    } else {
        // Store the location data in the current session
        // console.log(locationData, "location data from client");
        req.session.locationData = locationData;
        res.sendStatus(200);
    }
});

app.get('/getLocation', (req, res) => {
    const locationData = req.session.locationData;
    console.log(locationData, "location data stored in session");
    locationData ? res.json(locationData) : res.json({ error: "No location data found in session" });
});

app.get("/secretKeys", (req, res) => {
    const secrets = {
        TICKETMASTER_API_KEY: `${process.env.TICKETMASTER_API_KEY}`,
        MAPBOX_API_KEY: `${process.env.MAPBOX_API_KEY}`,
    }
    res.status(200).json(JSON.stringify(secrets));
});



app.use('/auth', authRouter);
app.use('/', exploreRouter);
app.use('/meet', mapRouter);
app.use('/api-events', apiEventsRouter);
app.use('/api-posts', apiPostsRouter);
app.use('/api-user', apiUserRouter);
app.use('/user-profile', userProfileRouter);
app.use('/post-create', postCreateRouter);
app.use('/chat', chatRouter);


server.listen(port, function () {
    console.log(`Listening on port ${port}`);
});