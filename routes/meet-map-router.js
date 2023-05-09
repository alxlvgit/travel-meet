const router = require('express').Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Open meet map page
router.get('/', async (req, res) => {
    res.render('./meet-map-views/meet-map');
}
);





module.exports = router;