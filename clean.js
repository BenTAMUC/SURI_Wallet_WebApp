import crypto from 'crypto';
import elliptic from 'elliptic';
import { create } from 'ipfs-core';
import { createOrbitDB, Identities, KeyStore } from '@orbitdb/core';
import PromptSync from 'prompt-sync';

// Allows for user input
const prompt = PromptSync();

// Create OrbitDB identity
const id = profileName();
const identities = await Identities();
const identity = identities.createIdentity({ id });

// Create IPFS instance
//const ipfs = await create();

// Create OrbitDB instance
//const orbitdb = await createOrbitDB({ipfs, id});

// Generate Necessary Databases for keys, DIDs, and SigChain Links
//const keyDB = await orbitdb.open('key-db');
//console.log(keyDB.address);
//const didDB = await orbitdb.open('did-db', { type: 'documents'});
//console.log(didDB.address);
//const scDB = await orbitdb.open('sc-db', { type: 'documents'});
//console.log(scDB.address);

// Saving Database hashes to variables
//const keyADD = keyDB.address.toString();
//const didADD = didDB.address.toString();
//const scADD = scDB.address.toString();

// Creats an id to be used for orbitdb identity and profile
function profileName(){
    const name = prompt("Enter a profile name: ");
    return name;
}

// Generates new key pair to be used for DID/DID Verification, start of SigChain
async function generateKeys(){
    // Request a 32 byte key
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

    // Saving Public Key values to database

    // Private key will be displayed to user for safe keeping
    console.log('Private Key: ' + key);
    console.log('Public Key ' + pubK);
}

async function createDID(url, x64, y64) {
    let didid = "did:web:" + String(url);
    let didDoc = {
        "@context": [
        "https://www.w3.org/ns/did/v1",
        "https://w3id.org/security/suites/jws-2020/v1"
        ],
        "_id": didid,
        "verificationMethod": [
        {
            "id": "did:web:" + String(url) + "#owner",
            "type": "JsonWebKey2020",
            "controller": didid,
            "publicKeyJwk": {
                "kty": "EC",
                "crv": "secp256k1",
                "x": x64,
                "y": y64
            }
        }
        ],
        "authentication": [
        "did:web:" + String(url) + "#owner"
        ],
        "assertionMethod": [
        "did:web:" + String(url) + "#owner"
        ],
    }
    return didDoc;
}

function printAllVals(obj) {
    for (let k in obj) {
        if (typeof obj[k] === "object") {
            printAllVals(obj[k])
        } else {
            // base case, stop recurring
            console.log(obj[k]);
        }
    }
}
  

generateKeys();