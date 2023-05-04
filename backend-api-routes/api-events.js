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

module.exports = router;