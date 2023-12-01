import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import * as ed from '@noble/ed25519';
import { sha512 } from '@noble/hashes/sha512';
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div>
        <a href="https://vitejs.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>SURI DID Generator</h1>
      <div className="card">
        <button onClick={() => createDID('https:example.com')}>
          count is {count}
        </button>
      </div>
    </>
  )
}

function createDID(url) {
  // Generate sha 512 sync
  ed.etc.sha512Sync = (...m) => sha512(ed.etc.concatBytes(...m));

  // Generate a key pair
  const privKey = ed.utils.randomPrivateKey();
  const pubKey = ed.getPublicKey(privKey);

  // remove commas from keys
  let privKeyNoCommas = String(privKey).replace(/,/g, '');
  let pubKeyNoCommas = String(pubKey).replace(/,/g, '');

  let id = "did:web:" + String(url);
  let didDoc = {
    "@context": [
      "https://www.w3.org/ns/did/v1",
      "https://w3id.org/security/suites/jws-2020/v1"
    ],
    "id": id,
    "verificationMethod": [
      {
        "id": "did:web:" + String(url) + "#key-0",
        "type": "ed25519VerificationKey2020",
        "controller": id,
        "publicKeyBase58": pubKeyNoCommas
      }
    ],
    "authentication": [
      "did:web:example.com#key-0"
    ],
    "assertionMethod": [
      "did:web:example.com#key-0"
    ],
    "keyAgreement": [
      "did:web:example.com#key-0"
    ]
  }
  console.log(JSON.stringify(didDoc, null, 2));

  return didDoc;
}

export default App
