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

//Follow user
router.post('/follow/:id', async (req, res) => {
    try {
        const userToFollowId = Number(req.params.id);
        const currentUser = req.user;
        await prisma.user.update({
            where: { id: currentUser.id },
            data: { following: { connect: { id: userToFollowId } } }
        });
        res.status(200).json({ message: "Successfully followed" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "An error occurred while trying to follow the user" });
    }
});

//Unfollow user
router.post('/unfollow/:id', async (req, res) => {
    try {
        const userToUnfollowId = Number(req.params.id);
        const currentUser = req.user;
        await prisma.user.update({
            where: { id: currentUser.id },
            data: { following: { disconnect: { id: userToUnfollowId } } }
        });
        res.status(200).json({ message: "Successfully unfollowed" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "An error occurred while trying to unfollow the user" });
    }
});

// Check if following user
router.get('/is-following/:id', async (req, res) => {
    try {
        const userId = Number(req.params.id);
        const currentUser = req.user;
        const isFollowing = await prisma.user.findFirst({
            where: {
                id: currentUser.id,
                following: {
                    some: {
                        id: userId
                    }
                }
            }
        });
        if (isFollowing) {
            res.status(200).json({ isFollowing: true });
        } else {
            res.status(200).json({ isFollowing: false });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "An error occurred while checking follow status" });
    }
});




module.exports = router;