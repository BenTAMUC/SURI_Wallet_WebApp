import crypto from 'crypto';
import elliptic from 'elliptic';
import { create } from 'ipfs-core';
import { createOrbitDB, Identities, KeyStore } from '@orbitdb/core';
import PromptSync from 'prompt-sync';

function profileName(){
    const name = prompt("Enter a name for your Profile, this will also be used as an id for your databse identity: ");
    return name;
}

// Creates a bio to be used for profile
function createBio(){
    const bio = prompt("Enter a bio for your profile: ");
    return bio;
}

// Creates a JSON object conataining the profile information to be stored in the didDB
function profileJSON(id, bio){
    const profile = {
        "_id": id,
        "bio": bio
    }
    return profile;
}

function keysJSON(x64, y64, xHex, yHex, pubK){
    const keys = {
        "_id": "keys",
        "x64": x64,
        "y64": y64,
        "xHex": xHex,
        "yHex": yHex,
        "pubK": pubK
    }
    return keys;

}

// Generates new key pair to be used for DID/DID Verification, start of SigChain
function generateKeys(){
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

    // Private key will be displayed to user for safe keeping
    console.log('Store this Private Key in a safe place, DO NOT SHARE!!!: ' + key);

    // Create a digital signature
    const signature = prv.sign(pubK).toDER('hex');

    return [x64, y64, xHex, yHex, pubK, signature];
}

function createDID(url, x64, y64) {
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

// generates a sigchain link and all its components for new key creation
async function sigchainKeyLink(url, signature){
    const currentDate = new Date();
    const timestamp = currentDate.toISOString();
    const currentTimestamp = Math.floor(new Date().getTime() / 1000);
    let sigid = "did:web:" + String(url);
    let link = {
        "@context": [
            "https://www.w3.org/2018/credentials/v1",
            "https://www.w3.org/2018/credentials/examples/v1"
        ],
        "_id": sigid,
        "type": [
            "VerifiableCredential",
            "SigchainCredential"
        ],
        "issuer": sigid,
        "issuanceDate": timestamp,
        "prev": null,
        "seqno": 0,
        "ctime": currentTimestamp,
        "credentialSubject": {
            "_id": sigid,
            "keyId": "https://example.com/user/keys/2",
            "vmHash": "sImI2NCI6ZmFsc2UsImNyaXQiOlsiYjY0Il19",
            "type": "key",
            "version": 0.1
        },
        "proof": {
            "type": "EcdsaSecp256k1Signature2019",
            "created": "2020-02-03T17:23:49Z",
            "proofPurpose": "assertionMethod",
            "proofValue": signature.toString('hex'),
            "verificationMethod": "https://example.com/user/keys/1"
        }
    }
    return link;
}

function printJSONWithFormatting(jsonObj) {
    // Use JSON.stringify with a replacer function and spaces parameter
    const jsonString = JSON.stringify(jsonObj, null, 2);
    console.log(jsonString);
}

// Simulated User Input Session
console.log("Welcome to the Suri CLI");
console.log("We first need to set up your databases");
console.log("");

// Allows for user input
const prompt = PromptSync();

// Create IPFS instance
const ipfs = await create();

// Create OrbitDB identity
const id = profileName();
const identities = await Identities();
const identity = identities.createIdentity({ id });

// Create OrbitDB instance
const orbitdb = await createOrbitDB({ipfs, id});

// Generate Necessary Databases for keys, DIDs, and SigChain Links
const keyDB = await orbitdb.open('key-db', { type: 'documents'});
const didDB = await orbitdb.open('did-db', { type: 'documents'});
const scDB = await orbitdb.open('sc-db', { type: 'documents'});

console.log("");

// Saving Database hashes to variables
// These should be saved by the user for later use, as they are needed to access the databases in seperate instances
console.log("Save these hashes for later use");
const keyADD = keyDB.address.toString();
console.log("Key DB Address: " + keyADD);
const didADD = didDB.address.toString();
console.log("DID DB Address: " + didADD);
const scADD = scDB.address.toString();
console.log("Key DB Address: " + scADD);

console.log("");
console.log("Databases created!!!");
console.log("");

const keys = generateKeys();

await keyDB.put(keysJSON(keys[0], keys[1], keys[2], keys[3], keys[4]));

const bio = createBio();

const url = prompt("Enter the URL of your DID: ");

const didDoc = await createDID(url, keys[0], keys[1]);

console.log("");

await didDB.put(profileJSON(id, bio));

console.log("");
console.log("Here is your DID Document: ");
console.log("To retrieve this DID in the future, use the _id: " + url);
printJSONWithFormatting(didDoc);

await didDB.put(didDoc);
const scl = await sigchainKeyLink(url, keys[5]);
await scDB.put(scl);

console.log("");
let fish = prompt("Would you like to see your documents? (y/n): ");

while(fish == "y"){
    console.log("");
    console.log("Here is profile data from didDB: ");
    printJSONWithFormatting(await didDB.get(id));

    console.log("");
    console.log("Here is your DID Document from didDB: ");
    printJSONWithFormatting(await didDB.get(didDoc._id));

    console.log("");
    console.log("Here is your keys from keyDB: ");
    printJSONWithFormatting(await keyDB.get("keys"));

    console.log("");
    console.log("Here is your SigChain Link from scDB: "); 
    printJSONWithFormatting(await scDB.get(scl._id));

    console.log("");
    fish = prompt("Would you like to see your documents again? (y/n): ");

}

await keyDB.close();
await didDB.close();
await scDB.close();
await orbitdb.stop();
await ipfs.stop();