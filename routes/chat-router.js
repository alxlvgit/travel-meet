const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require('../passport-middleware/check-auth');

// Route handler
router.get('/', ensureAuthenticated, (req, res) => {
    res.render('chat-views/chat-message', { user: req.user });
});

router.get('/messages', ensureAuthenticated, (req, res) => {
    res.render('chat-views/chat-message', { user: req.user });
});

// Define a route to handle the /api/chats endpoint
// router.get('/chat ', (req, res) => {
//   const { userId } = req.user;
  
//   // Replace this code with your logic to retrieve and filter chat data based on the user ID
//   const chats = getChatsForUser(userId);
  
//   // Return the filtered chat data as a JSON response
//   res.json(chats);
// });

// // Replace this function with your actual logic to retrieve and filter chat data
// function getChatsForUser(userId) {
//   // Your code to fetch and filter chat data for the specified user
//   // Example implementation:
//   const allChats = [
//     { id: 1, title: 'Chat 1', participants: ['123', '456'] },
//     { id: 2, title: 'Chat 2', participants: ['123', '789'] },
//     { id: 3, title: 'Chat 3', participants: ['456', '789'] },
//   ];
  
//   // Filter the chats based on the user ID
//   const userChats = allChats.filter(chat => chat.participants.includes(userId));
  
//   return userChats;
// }

// // Route for receiving messages
// router.post('/chat-message', (req, res) => {
//   const message = req.body.message;
//   const channel = "TravelMeet";
//   publishMessage(channel, message);
//   res.sendStatus(200);
// });

module.exports = router;
