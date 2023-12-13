import crypto from 'crypto';
import elliptic from 'elliptic';
import PromptSync from 'prompt-sync';

const size = parseInt(process.argv.slice(2)[0]) || 32;
const randomString = crypto.randomBytes(size).toString("hex");
const key = randomString;

// Calculate the `secp256k1` curve and build the public key
const ec = new elliptic.ec('secp256k1');
const prv = ec.keyFromPrivate(key, 'hex');
const pub = prv.getPublic();
const pubK = prv.getPublic('hex');
const x64 = pub.x.toBuffer().toString('base64');
const y64 = pub.y.toBuffer().toString('base64');
const xHex = pub.x.toBuffer().toString('hex');
const yHex = pub.y.toBuffer().toString('hex');

// Create a digital signature
const signature = prv.sign(pubK).toDER('hex');

console.log(signature);
