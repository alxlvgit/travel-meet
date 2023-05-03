const router = require('express').Router();
const { PrismaClient } = require('@prisma/client');
const { fetchSingleEvent, filterEventImages, getGroups, totalNumberOfPeopleForEvent } = require('../services/events-services');
const prisma = new PrismaClient();

router.get('/', async (req, res) => {
    const users = await prisma.user.findMany();
    console.log(users, "test DB");
    res.render('./explore-views/explore', { users: users });
}
);

// Feeds post page
router.get('/feeds/:id', async (req, res) => {
    res.render('./explore-views/feeds-post');
}
);

// Event page
router.get('/events/:id', async (req, res) => {
    try {
        const eventData = await fetchSingleEvent(req.params.id);
        const eventImage = await filterEventImages(eventData.images);
        const groups = await getGroups(req.params.id);
        const totalNumberOfPeople = await totalNumberOfPeopleForEvent(groups);
        const eventImageURL = eventImage[0].url;
        res.render('./explore-views/event', {
            event: eventData,
            eventImageURL: eventImageURL,
            eventGroups: groups,
            totalNumberOfPeople: totalNumberOfPeople
        });
    } catch (error) {
        console.log(error);
    }
}
);

// Group page
router.get('/event/:eventId/group/:groupId', async (req, res) => {
    try {
        const eventData = await fetchSingleEvent(req.params.eventId);
        const eventImage = await filterEventImages(eventData.images);
        const groups = await getGroups(req.params.eventId);
        const totalNumberOfPeople = await totalNumberOfPeopleForEvent(groups);
        const group = await prisma.group.findUnique({
            where: {
                id: req.params.groupId
            },
            include: {
                creator: true,
                members: true,
            }
        });
        res.render('./explore-views/group', { group: group, event: eventData, eventImageURL: eventImage[0].url, totalNumberOfPeople: totalNumberOfPeople });
    } catch (error) {
        console.log(error);
    }
}
);

// Create group page
router.get('/events/:id/groups/create', async (req, res) => {
    try {
        const eventData = await fetchSingleEvent(req.params.id);
        const eventImage = await filterEventImages(eventData.images);
        const eventImageURL = eventImage[0].url;
        res.render('./explore-views/create-group', { event: eventData, eventImageURL: eventImageURL });
    } catch (error) {
        console.log(error);
    }
}
);


module.exports = router;