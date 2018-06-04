const functions = require("firebase-functions");
const admin = require('firebase-admin');
const express = require('express');
const cors = require('cors');
import {
  verifyToken,
  decodeToken
} from "./src/services/TokenUtil";
require('dotenv').config()

const app = express();
admin.initializeApp(functions.config().firebase);
let db = admin.firestore();

// Automatically allow cross-origin requests
app.use(cors({ origin: true }));

let SECRET;
if (functions.config().twitch) {
  SECRET = functions.config().twitch.secret;
} else {
  SECRET = process.env.SECRET;
}

// POST /api/messages
app.post('/messages', (req, res) => {
  let decoded_token;
  const token = req.get('x-extension-jwt')

  try {
    decoded_token = verifyToken(token, SECRET);
  } catch (err) {
    console.error('JWT was invalid', err);
    res.status(401).json({});
    return;
  }

  const message = req.body.message;
  res.json({
    message
  });
});

// GET /api/messages?category={category}
app.get('/messages', (req, res) => {
  let decoded_token;
  const token = req.get('x-extension-jwt')

  try {
    decoded_token = decodeToken(token, SECRET);
  } catch (err) {
    console.error('JWT was invalid', err);
    res.status(401).json({});
    return;
  }
  
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