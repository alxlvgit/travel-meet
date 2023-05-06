const express = require('express');
require('dotenv').config()
const port = process.env.PORT || 3000;
const exploreRouter = require('./routes/explore-router');
const apiEventsRouter = require('./backend-api-routes/api-events');
const apiPostsRouter = require('./backend-api-routes/api-feed-routes');
const session = require('express-session');
const postCreateRouter = require('./routes/post-create-router');

const app = express();

// For testing purposes only
// Middleware with fake current app user
app.use((req, res, next) => {
    const user = {
        id: 1,
        name: 'John Doe',
        email: 'john@mail.com',
        password: 'secret',
        profileImageName: 'profile picture',
        profileImageCaption: 'caption',
        profileImageURI: 'https://marketplace.canva.com/EAFEits4-uw/1/0/800w/canva-boy-cartoon-gamer-animated-twitch-profile-photo-r0bPCSjUqg0.jpg',
        posts: [
            {
                id: 1,
                title: '',
                content: 'TEst post',
                imageName: 'Test',
                caption: 'test',
                imageURI: 'https://thumbs.dreamstime.com/b/beautiful-rain-forest-ang-ka-nature-trail-doi-inthanon-national-park-thailand-36703721.jpg',
                authorId: 1
            }
        ],
        groups: [
            {
                id: '288f0604-8ac7-480d-8203-701a197e5f54',
                name: 'We are going to see gecko',
                creatorId: 11,
                eventId: 'rZ7HnEZ1A30vAP'
            },
            {
                id: '37056bdd-d0b4-4489-ae61-ea34ec59565d',
                name: 'Group of people',
                creatorId: 4,
                eventId: 'rZ7HnEZ1A30vAP'
            },
            {
                id: '58c2c59a-0ed1-4bb3-8862-67ef6299ce07',
                name: 'Some random guys',
                creatorId: 3,
                eventId: 'rZ7HnEZ1A30vAP'
            },
            {
                id: '771669a4-645a-4555-9e31-869b04c5b5a3',
                name: 'Test group',
                creatorId: 10,
                eventId: 'rZ7HnEZ1A30vAP'
            },
            {
                id: 'cc2f3232-b0e4-416e-8d0a-d2accdbcc718',
                name: 'BCIT students',
                creatorId: 2,
                eventId: 'rZ7HnEZ1A30vAP'
            },
            {
                id: 'dd850fc6-beef-4721-b35d-c44824899137',
                name: 'High School students',
                creatorId: 1,
                eventId: 'rZ7HnEZ1A30vAP'
            }
        ]
    }
    req.user = user;
    next();
});

// Middleware to parse request body
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.use(express.static(__dirname + "/static"));
app.use('/', exploreRouter);
app.use('/api-events', apiEventsRouter);
app.use('/api-posts', apiPostsRouter);
app.use('/post-create', postCreateRouter);

app.get("/secretKeys", (req, res) => {
  const secrets = {
    TICKETMASTER_API_KEY: `${process.env.TICKETMASTER_API_KEY}`
  }
  res.status(200).json(JSON.stringify(secrets));
});


app.listen(port, () => {
  console.log("Node application listening on port " + port);
});