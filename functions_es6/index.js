const functions = require("firebase-functions");
const express = require('express');
const cors = require(cors);

const app = express();
admin.initializeApp();

// Automatically allow cross-origin requests
app.use(cors({ origin: true }));

// POST /api/messages
app.post('/messages', (req, res) => {
  const message = req.body.message;
  res.json({
    message
  });
});

// GET /api/messages?category={category}
app.get('/messages', (req, res) => {
  const category = req.query.category;
  res.json({
    category
  });
});

// GET /api/message/{messageId}
app.get('/message/:messageId', (req, res) => {
  const messageId = req.params.messageId;
  res.set('Cache-Control', 'private, max-age=300');
  res.json({
    messageId
  });
});

// Expose the API as a function
exports.api = functions.https.onRequest(app);