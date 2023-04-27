const router = require('express').Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get groups for event
router.get('/groups/:eventId', async (req, res) => {
    // get groups from database
    const groups = await prisma.group.findMany({
        where: {
            eventId: req.params.id
        }
    });
    res.json({ groups: groups });
}
);

module.exports = router;