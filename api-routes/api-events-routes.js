// This folder contains AJAX routes for the events page
  
const router = require('express').Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get groups for event
router.get('/groups/:eventId', async (req, res) => {
    // get groups from database
    const groups = await prisma.group.findMany({
        where: {
            eventId: req.params.eventId
        }
    });
    res.json({ groups: groups });
}
);

// Get comprehensive event data
router.get('/events/:eventId', async (req, res) => {
    const apiKey = process.env.TICKETMASTER_API_KEY;
    const url = `https://app.ticketmaster.com/discovery/v2/events/${req.params.eventId}.json?apikey=${apiKey}`;
    const response = await fetch(url);
    const event = await response.json();
    res.json({ event: event });
}
);


module.exports = router;