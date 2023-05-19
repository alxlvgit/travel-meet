// This folder contains AJAX routes for the events page
const router = require('express').Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { totalNumberOfPeopleForEvent } = require('../helper-functions/events-helpers');
const { ensureAuthenticated } = require('../passport-middleware/check-auth');

// Get groups for event
router.get('/groups/:eventId', async (req, res) => {
    const groups = await prisma.group.findMany({
        where: {
            eventId: `${req.params.eventId}`,
        },
        include: {
            members: true,
        },
    });
    const totalNumberOfPeople = await totalNumberOfPeopleForEvent(groups);
    res.json({ totalNumberOfPeople: totalNumberOfPeople });
}
);

// Get group
router.get('/group/:groupId', async (req, res) => {
    const group = await prisma.group.findUnique({
        where: {
            id: Number(req.params.groupId),
        },
        include: {
            members: true,
        },
    });
    res.json({ group: group, userId: req.user.id });
}
);


router.put(`/groups/:groupId/join`, ensureAuthenticated, async (req, res) => {
    const groupId = req.params.groupId;
    const userId = req.user.id;
    try {
        const updatedGroup = await prisma.group.update({
            where: {
                id: Number(groupId),
            },
            data: {
                members: {
                    connect: {
                        id: userId,
                    },
                },
            },
        });
        res.json({ updatedGroup: updatedGroup });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error });
    }
}
);


router.put(`/groups/:groupId/leave`, ensureAuthenticated, async (req, res) => {
    const groupId = req.params.groupId;
    const userId = req.user.id;
    try {
        const updatedGroup = await prisma.group.update({
            where: {
                id: Number(groupId),
            },
            data: {
                members: {
                    disconnect: {
                        id: userId,
                    },
                },
            },
        });
        res.json({ updatedGroup: updatedGroup });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error });
    }
}
);

module.exports = router;