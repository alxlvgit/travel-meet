const router = require('express').Router();

router.get('/', async (req, res) => {
    res.render('./chat-views/chat');
});




module.exports = router;