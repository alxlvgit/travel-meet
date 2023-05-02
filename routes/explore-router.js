const router = require('express').Router();
const { PrismaClient } = require('@prisma/client');
const { fetchSingleEvent, filterEventImages } = require('../services/single-event-services');
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
    const eventImageURL = eventImage[0].url;
    res.render('./explore-views/event', { event: eventData, eventImageURL: eventImageURL });
}
);

// router.get('/individual/', async (req, res) => {
//   res.render('./explore-views/individual-post');
// }
// );



module.exports = router;