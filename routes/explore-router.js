const router = require('express').Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

router.get('/', async (req, res) => {
  const users = await prisma.user.findMany();
  console.log(users, "test DB");
  res.render('./explore-views/explore', { users: users });
}
);


// Feeds page
// router.get('/feeds', async (req, res) => {
//   const users = await prisma.user.findMany();
//   res.render('./explore-views/explore-feeds', { users: users });
// }
// );

// Feeds post page
router.get('/feeds/:id', async (req, res) => {
  res.render('./explore-views/feeds-post');
}
);

// // Events page 
// router.get('/events', async (req, res) => {
//     // get groups from database
//     res.render('./explore-views/explore-events');
// }
// );

// Event page
router.get('/events/:id', async (req, res) => {
    res.render('./explore-views/explore-event');
}
);

router.get('/individual/', async (req, res) => {
  res.render('./explore-views/individual-post');
}
);


module.exports = router;