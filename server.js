
// Import libraries
const express = require('express');
require('dotenv').config()

// Create express app
const app = express();
const exploreRouter = require('./routes/explore-router');
const apiEventsRouter = require('./backend-api-routes/api-events');
const apiPostsRouter = require('./backend-api-routes/api-feed-routes');
const postCreateRouter = require('./routes/post-create-router');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Middleware for session
const session = require('express-session');

// For testing purposes only
// Session middleware with cookie expiration of 15 minutes
app.use(session({
  secret: 'your secret key',
  resave: false,
  saveUninitialized: false,
  cookie: {
      maxAge: 1000 * 60 * 15,
  },
}));

// For testing purposes only
// Middleware with fake current app user
app.use(async (req, res, next) => {
  const user = await prisma.user.findMany({
      where: {
          id: 1,
      },
      include: {
          posts: true,
      },
  });
  req.session.user = user[0];
  next();
});

// Route configuration
app.use('/', exploreRouter);
app.use('/api-events', apiEventsRouter);
app.use('/api-posts', apiPostsRouter);
app.use('/post-create', postCreateRouter);

// Middleware for parsing JSON
app.use(express.json());


// Middleware to parse request body
app.use(express.urlencoded({ extended: true }));

// Set view engine to ejs
app.set('view engine', 'ejs');

// Set up static file middleware to serve static files from the static directory
app.use(express.static(__dirname + "/static"));

// Get ticketmaster secret key through API
app.get("/secretKeys", (req, res) => {
  const secrets = {
    TICKETMASTER_API_KEY: `${process.env.TICKETMASTER_API_KEY}`
  }
  res.status(200).json(JSON.stringify(secrets));
});

// Port handling
const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log("Node application listening on port " + port);
});