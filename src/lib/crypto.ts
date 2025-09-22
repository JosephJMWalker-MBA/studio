
import { get, set } from './idb-keyval';

interface EncryptedData {
  ct: number[];
  iv: number[];
  salt: number[];
}

/**
 * Encrypts an API key with a passphrase and stores it in IndexedDB.
 */
export async function storeApiKeyEncrypted(keyName: string, apiKey: string, passphrase: string): Promise<void> {
  const enc = new TextEncoder();
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));

  const baseKey = await crypto.subtle.importKey("raw", enc.encode(passphrase), "PBKDF2", false, ["deriveKey"]);
  const aesKey = await crypto.subtle.deriveKey(
    { name: "PBKDF2", salt, iterations: 250_000, hash: "SHA-256" },
    baseKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );

  const ct = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv }, aesKey, enc.encode(apiKey)));
  
  // Store the ciphertext and params as plain arrays of numbers
  await set(keyName, { ct: Array.from(ct), iv: Array.from(iv), salt: Array.from(salt) });
}

/**
 * Loads and decrypts an API key from IndexedDB using a passphrase.
 */
export async function loadApiKey(keyName: string, passphrase: string): Promise<string> {
  const enc = new TextEncoder();
  const dec = new TextDecoder();
  
  const storedData = await get<EncryptedData>(keyName);
  if (!storedData) {
    throw new Error("No encrypted key found in storage.");
  }
  
  const { ct, iv, salt } = storedData;

  const baseKey = await crypto.subtle.importKey("raw", enc.encode(passphrase), "PBKDF2", false, ["deriveKey"]);
  const aesKey = await crypto.subtle.deriveKey(
    { name: "PBKDF2", salt: new Uint8Array(salt), iterations: 250_000, hash: "SHA-256" },
    baseKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["decrypt"]
  );

  const pt = await crypto.subtle.decrypt({ name: "AES-GCM", iv: new Uint8Array(iv) }, aesKey, new Uint8Array(ct));
  return dec.decode(pt);
}

/**
 * Checks if an encrypted API key exists in IndexedDB.
 */
export async function isApiKeyStored(keyName: string): Promise<boolean> {
    const data = await get(keyName);
    return data != null;
}
