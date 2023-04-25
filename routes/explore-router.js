const router = require('express').Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

router.get('/', async (req, res) => {
    const users = await prisma.user.findMany();
    console.log(users, "test DB");
    res.render('./explore', { users: users });
}
);

// Events page 
router.get('/events', async (req, res) => {
    res.render('./explore-events');
}
);

// Feeds page
router.get('/feeds', async (req, res) => {
    res.render('./explore-feeds');
}
);

// Feeds post page
router.get('/feeds/:id', async (req, res) => {
    res.render('./feeds-post');
}
);

module.exports = router;