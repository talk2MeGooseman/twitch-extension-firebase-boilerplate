const functions = require("firebase-functions");
const admin = require('firebase-admin');
const cors = require('cors');
import { publishChannelMessage } from "./src/services/TwitchAPI";
import {
  verifyToken,
  decodeToken
} from "./src/services/TokenUtil";
require('dotenv').config()

admin.initializeApp(functions.config().firebase);
let db = admin.firestore();

const cors = require('cors')({
  origin: true
});

let SECRET;
// Firebase env variables only work on server so we check to see if it exists
// if not load from ENV
if (functions.config().twitch) {
  SECRET = functions.config().twitch.secret;
} else {
  SECRET = process.env.SECRET;
}

exports.getInfoFromFirestore = functions.https.onRequest((req, res) => {
  cors(req, res, () => {
    let decoded_token;
    // Get JWT token from header
    const token = req.get("x-extension-jwt");

    try {
      // Only decode token, no need to verify if its from broadcaster
      decoded_token = decodeToken(token, SECRET);
    } catch (err) {
      console.error("JWT was invalid", err);
      res.status(401).json({});
      return;
    }

    // Get document for channel_id from collection
    const docRef = db.collection("YOUR_COLLECTION").doc(decoded_token.channel_id);

    // Read the document.
    docRef
      .get()
      .then(doc => {
        console.info("Channel ", decoded_token.channel_id, "info requested");
        // Respond back with data stored in document for Channel ID
        return res.json(doc.data());
      })
      .catch(error => {
        console.error(error);
        return res.status(400);
      });
  });
});


// POST STYLE REQUEST FLOW
exports.setInfoForFirestore = functions.https.onRequest((req, res) => {
  // Need to use CORS for Twitch
  cors(req, res, () => {
    let decoded_token;
    // Get payload from request body
    const data = req.body;

    // Get JWT from header
    const token = req.get("x-extension-jwt");

    // Verify if token is valid, belongs to broadcaster and decode
    try {
      decoded_token = verifyToken(token, SECRET);
    } catch (err) {
      console.error("JWT was invalid", err);
      res.status(401).json({});
      return;
    }

    // Get the boradcasters information for the collection
    const docRef = db.collection("YOUR_COLLECTION").doc(decoded_token.user_id);

    const setAda = docRef
      .set({
        some_data: data.some_data,
      })
      .then(() => {
        console.info("Channel ", decoded_token.user_id, "updated succeeded");
        // Send a Twitch PubSub message that something change
        publishChannelMessage(decoded_token.user_id, SECRET);
        return res.status(201).end();
      })
      .catch(error => {
        console.error(
          "Channel ",
          decoded_token.channel_id,
          "update failed to DB",
          error
        );
        return res.status(400).end();
      });
  });
});