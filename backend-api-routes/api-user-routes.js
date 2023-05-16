const router = require('express').Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

router.get('/:userId/icon', async (req, res) => {
    const userId = parseInt(req.params.userId);
    const user = await prisma.user.findUnique({
        where: {
            id: userId,
        },
        select: {
            profileImageURI: true,
        },
    });
    res.json(user);
});



module.exports = router;