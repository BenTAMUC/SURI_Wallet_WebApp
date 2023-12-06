import crypto from 'crypto';
import elliptic from 'elliptic';
import { create } from 'ipfs-core';
import { createOrbitDB } from '@orbitdb/core';
import PromptSync from 'prompt-sync';

// Create IPFS instance
const ipfs = await create();

// Create OrbitDB instance
const orbitdb = await createOrbitDB({ipfs});
const db = await orbitdb.open('suri-db');
console.log(db.address.toString());

console.log(await db.all());

const prompt = PromptSync();
const URL = prompt("Enter URL for the DID, keys will be generated automatically: ");

function createDID(url) {
    // Request a 32 byte key
    const size = parseInt(process.argv.slice(2)[0]) || 32;
    const randomString = crypto.randomBytes(size).toString("hex");
    const key = randomString;

    console.log(`Key (hex): ${key}`)  // ee48d32e6c724c4d

    // Calculate the `secp256k1` curve and build the public key
    const ec = new elliptic.ec('secp256k1');
    const prv = ec.keyFromPrivate(key, 'hex');
    const pub = prv.getPublic();
    console.log(`Public (hex): ${prv.getPublic('hex')}`)
    console.log(`x (hex): ${pub.x.toBuffer().toString('hex')}`)
    console.log(`y (hex): ${pub.y.toBuffer().toString('hex')}`)
    console.log(`x (base64): ${pub.x.toBuffer().toString('base64')}`)
    console.log(`y (base64): ${pub.y.toBuffer().toString('base64')}`)
    console.log(`-- kty: EC, crv: secp256k1`)

    let id = "did:web:" + String(url);
    let didDoc = {
      "@context": [
        "https://www.w3.org/ns/did/v1",
        "https://w3id.org/security/suites/jws-2020/v1"
      ],
      "id": id,
      "verificationMethod": [
        {
          "id": "did:web:" + String(url) + "#owner",
          "type": "JsonWebKey2020",
          "controller": id,
          "publicKeyJwk": {
            "kty": "EC",
            "crv": "secp256k1",
            "x": pub.x.toBuffer().toString('base64'),
            "y": pub.y.toBuffer().toString('base64')
          
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
  const hash1 = await db.add(createDID(URL));
  const choice = prompt("Enter 'y' to view the DID document: ");

  if (choice == "y") {
    console.log("DID Document from hash1: ");
    console.log(await db.get(hash1));
    console.log("DID Document from all(): ");
    console.log(await db.all());
  }

  let ddd = await db.get(hash1);
  ddd = JSON.stringify(ddd);
  ddd = JSON.parse(ddd);
  console.log("DID Document saved into variable for further use: ")
  console.log(ddd);

  await db.close();
  await orbitdb.stop();
  await ipfs.stop();