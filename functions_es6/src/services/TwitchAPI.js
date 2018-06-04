import axios from 'axios';
import {
  TWITCH_BASE_EXTENSION_URL,
  EXTENSION_ID,
  EXTENSION_VERSION,
  CONFIG_KEY,
} from "../Constants";
import { signToken } from "./AuthToken";

export async function setExtensionConfigured(channel_id, secret, version=EXTENSION_VERSION) {
  const token = signToken(secret);

  let response = await axios({
    method: 'PUT',
    url: `${TWITCH_BASE_EXTENSION_URL}/${EXTENSION_ID}/${EXTENSION_VERSION}/required_configuration?channel_id=${channel_id}`,
    data: {
      "required_configuration": CONFIG_KEY,
    },
    headers: {
      'Content-Type': 'application/json',
      'Client-id': EXTENSION_ID,
      'Authorization': `Bearer ${token}`
    }
  });
}