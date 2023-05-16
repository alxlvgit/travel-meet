const router = require('express').Router();
const { ensureAuthenticated } = require('../passport-middleware/check-auth');

router.get('/', ensureAuthenticated, async (req, res) => {
    res.render('./chat-views/chat');
});




module.exports = router;