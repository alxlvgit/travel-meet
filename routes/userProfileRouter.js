const router = require('express').Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

//Individual user profile page
router.get('/:id', async (req, res) => {
      try {
            const userId = req.params.id;
            const user = await prisma.user.findUnique({
                  where: {
                        id: Number(userId)
                  },
            });
            console.log(user);
            const currentUserFollowBtn = req.session.user.id === user.id;
            res.render('./user-profile-views/user-profile', { user: user, currentUser: currentUserFollowBtn });
      } catch (error) {
            console.log(error);
      }
});

// Current user profile page
router.get('/', async (req, res) => {
      const currentUser = req.session.user;
      const user = await prisma.user.findUnique({
            where: {
                  id: Number(currentUser.id)
            },
      });
      res.render('./user-profile-views/user-profile', { currentUser: true, user: user });
});



module.exports = router;