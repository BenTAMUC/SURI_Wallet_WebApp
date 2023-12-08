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

    console.log(`Public (hex): ${prv.getPublic('hex')}`)
    console.log(`x (hex): ${pub.x.toBuffer().toString('hex')}`)
    console.log(`y (hex): ${pub.y.toBuffer().toString('hex')}`)
    console.log(`x (base64): ${pub.x.toBuffer().toString('base64')}`)
    console.log(`y (base64): ${pub.y.toBuffer().toString('base64')}`)
    console.log(`-- kty: EC, crv: secp256k1`)

    // Private key will be displayed to user for safe keeping
    console.log('Store this Private Key in a safe place, DO NOT SHARE!!!: ' + key);

    return [x64, y64, xHex, yHex, pubK];
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
console.log("Now we will create your first DID");
console.log("First we need to generate your keys");
console.log("");

const keys = await generateKeys();

console.log("");
const choice = prompt("Would you like to store your public key data in the key database? (y/n): ");

if (choice == "y"){
    const store1 = await keyDB.put(keysJSON(keys[0], keys[1], keys[2], keys[3], keys[4]));
    console.log("Keys stored!!!");
}
else{
    console.log("Okay, we will not store your keys");
}

console.log("");
const bio = createBio();

console.log("Would you like to store your profile data in your didDB? (y/n): ");

if (choice == "y"){
    const store2 = await didDB.put(profileJSON(id, bio));
    console.log("Profile data stored!!!");
}

console.log("");
const url = prompt("Enter the URL of your DID: ");

const didDoc = await createDID(url, keys[0], keys[1]);

console.log("");
console.log("Here is your DID Document: ");
printJSONWithFormatting(didDoc);

console.log("");
const choice2 = prompt("Would you like to store your DID Document in the DID Database? (y/n): ");

if (choice2 == "y"){
    const store3 = await didDB.put(didDoc);
    console.log("DID Document stored!!!");
}
else{
    console.log("Okay, we will not store your DID Document");
}

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
    fish = prompt("Would you like to see your documents again? (y/n): ");

}

await keyDB.close();
await didDB.close();
await scDB.close();
await orbitdb.stop();
await ipfs.stop();