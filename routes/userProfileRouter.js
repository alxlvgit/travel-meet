const router = require('express').Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

//Profile page
router.get('/:id', async (req, res) => {
      try {
            const userId = req.params.id;
            const user = await prisma.user.findUnique({
                  where: {
                        id: Number(userId)
                  },
            });
            console.log(user)
            res.render('./user-profile-views/user-profile', { user: user });
      } catch (error) {
            console.log(error);
      }
});



module.exports = router;