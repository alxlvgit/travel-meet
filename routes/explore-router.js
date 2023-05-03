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
  const postId = req.params.id;
  res.render('./explore-views/feeds-post', { postId: postId });
});

// Event page
router.get('/events/:id', async (req, res) => {
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
}
);

// Group page
router.get('/groups/:id', async (req, res) => {
    const group = await prisma.group.findUnique({
        where: {
            id: parseInt(req.params.id)
        },
        include: {
            creator: true,
            members: true,
            events: true
        }
    });
    res.render('./explore-views/group', { group: group });
}
);

// Create group page
router.get('/events/:id/groups/create', async (req, res) => {
    const eventData = await fetchSingleEvent(req.params.id);
    const eventImage = await filterEventImages(eventData.images);
    const eventImageURL = eventImage[0].url;
    res.render('./explore-views/create-group', { event: eventData, eventImageURL: eventImageURL });
}
);

router.get('/individual/', async (req, res) => {
  res.render('./explore-views/individual-post');
}
);



module.exports = router;