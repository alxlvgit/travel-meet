const router = require('express').Router();
const { PrismaClient } = require('@prisma/client');
const { ensureAuthenticated } = require('../passport-middleware/check-auth');
const prisma = new PrismaClient();

// Individual user profile page
router.get('/:id', ensureAuthenticated, async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await prisma.user.findUnique({
      where: {
        id: Number(userId),
      },
      include: {
        posts: true, // Fetches the posts associated with the user
      },
    });
    const currentUser = req.user.id === user.id;
    res.render('./user-profile-views/user-profile', { user: user, currentUser: currentUser, posts: user.posts });
  } catch (error) {
    console.log(error);
  }
});

// Current user profile page
router.get('/', ensureAuthenticated, async (req, res) => {
  const currentUser = req.user;
  const user = await prisma.user.findUnique({
    where: {
      id: Number(currentUser.id),
    },
    include: {
      posts: true, // Fetches the posts associated with the user
    },
  });
  res.render('./user-profile-views/user-profile', { currentUser: true, user: user, posts: user.posts });
});

module.exports = router;
