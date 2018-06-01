import jwt from 'jsonwebtoken';
import { EXTENSTION_USER_ID } from "./Constants";

export function decodeToken(token, secret) {
  const secret_decoded = new Buffer(secret, 'base64');
  return jwt.verify(token, secret_decoded);
}

export function verifyToken(token, secret) {
  const decoded = decodeToken(token, secret);
  
  if(decoded.role !== 'broadcaster') throw Error('Must be broadcaster role.')

  return decoded;
}

export function signToken(secret) {
  const secret_decoded = new Buffer(secret, 'base64');
  const tokenObj = {
    "user_id": EXTENSTION_USER_ID,
    "role": "external"    
  };

  return jwt.sign(tokenObj, secret_decoded, {
    expiresIn: '1h'
  });
}