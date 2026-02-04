const VAULT_ITERATIONS = 100_000;

const textEncoder = new TextEncoder();

const toBase64 = (bytes: Uint8Array) =>
  btoa(String.fromCharCode(...Array.from(bytes)));

const fromBase64 = (value: string) =>
  new Uint8Array(atob(value).split("").map((char) => char.charCodeAt(0)));

const deriveKey = async (passphrase: string, salt: Uint8Array) => {
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    textEncoder.encode(passphrase),
    "PBKDF2",
    false,
    ["deriveKey"],
  );

  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt,
      iterations: VAULT_ITERATIONS,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
};

export const encryptFile = async (file: File, passphrase: string) => {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(passphrase, salt);
  const fileBuffer = await file.arrayBuffer();
  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    fileBuffer,
  );

  return {
    encryptedBlob: new Blob([encrypted], { type: "application/octet-stream" }),
    iv: toBase64(iv),
    salt: toBase64(salt),
  };
};

export const decryptBlob = async (
  encryptedBlob: Blob,
  passphrase: string,
  ivBase64: string,
  saltBase64: string,
  mimeType?: string | null,
) => {
  const iv = fromBase64(ivBase64);
  const salt = fromBase64(saltBase64);
  const key = await deriveKey(passphrase, salt);
  const encryptedBuffer = await encryptedBlob.arrayBuffer();

  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    key,
    encryptedBuffer,
  );

  return new Blob([decrypted], { type: mimeType || "application/octet-stream" });
};
