const router = require('express').Router();
const { PrismaClient } = require('@prisma/client');
const { ensureAuthenticated } = require('../passport-middleware/check-auth');
const prisma = new PrismaClient();

//Individual user profile page
router.get('/:id', ensureAuthenticated, async (req, res) => {
      try {
            const userId = req.params.id;
            const user = await prisma.user.findUnique({
                  where: {
                        id: Number(userId)
                  },
            });
            console.log(user);
            const currentUser = req.user.id === user.id;
            res.render('./user-profile-views/user-profile', { user: user, currentUser: currentUser });
      } catch (error) {
            console.log(error);
      }
});

// Current user profile page
router.get('/', ensureAuthenticated, async (req, res) => {
      const currentUser = req.user;
      const user = await prisma.user.findUnique({
            where: {
                  id: Number(currentUser.id)
            },
      });
      res.render('./user-profile-views/user-profile', { currentUser: true, user: user });
});



module.exports = router;