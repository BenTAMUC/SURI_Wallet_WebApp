import crypto from 'crypto';
import elliptic from 'elliptic';
import didJwt from 'did-jwt';
import GUN from "https://cdn.skypack.dev/gun";

// Request a 32 byte key
const key = crypto.randomBytes(32).toString("hex");
const ec = new elliptic.ec('secp256k1');
const prv = ec.keyFromPrivate(key,'hex').getPublic();