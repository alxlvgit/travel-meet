// This folder contains AJAX routes for the events page

const router = require('express').Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { totalNumberOfPeopleForEvent } = require('../services/events-services');

// Get groups for event
router.get('/groups/:eventId', async (req, res) => {
    // get groups from database
    const groups = await prisma.group.findMany({
        where: {
            eventId: req.params.eventId,
        },
        include: {
            members: true,
        },
    });
    const totalNumberOfPeople = await totalNumberOfPeopleForEvent(groups);
    res.json({ totalNumberOfPeople: totalNumberOfPeople });
}
);


module.exports = router;