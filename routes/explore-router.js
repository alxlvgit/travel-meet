const router = require('express').Router();
const { PrismaClient } = require('@prisma/client');
const fetchSingleEvent = require('../services/single-event-services');
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
    const eventData = await fetchSingleEvent(req.params.id);
    res.render('./explore-views/event', { event: eventData });
}
);


module.exports = router;