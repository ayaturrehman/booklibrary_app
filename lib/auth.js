const SESSION_COOKIE_NAME = "library_admin_session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

const authSecret = process.env.AUTH_SECRET || "";
const adminEmail = process.env.ADMIN_EMAIL || "";
const adminPassword = process.env.ADMIN_PASSWORD || "";

function assertAuthConfigured() {
  if (!authSecret || !adminEmail || !adminPassword) {
    throw new Error(
      "Admin authentication variables (ADMIN_EMAIL, ADMIN_PASSWORD, AUTH_SECRET) must be configured."
    );
  }
}

const encoder = new TextEncoder();
const decoder = new TextDecoder();
let keyPromise = null;

async function getHmacKey() {
  assertAuthConfigured();
  if (!globalThis.crypto?.subtle) {
    throw new Error("Web Crypto API not available");
  }
  if (!keyPromise) {
    const secretBytes = encoder.encode(authSecret);
    keyPromise = globalThis.crypto.subtle.importKey(
      "raw",
      secretBytes,
      {
        name: "HMAC",
        hash: "SHA-256",
      },
      false,
      ["sign", "verify"]
    );
  }
  return keyPromise;
}

function bufferToBase64Url(input) {
  const bytes = input instanceof Uint8Array ? input : new Uint8Array(input);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i += 1) {
    binary += String.fromCharCode(bytes[i]);
  }
  const base64 =
    typeof btoa === "function"
      ? btoa(binary)
      : Buffer.from(binary, "binary").toString("base64");
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function base64UrlToBuffer(base64url) {
  const padded = base64url.replace(/-/g, "+").replace(/_/g, "/");
  const base64 = padded + "===".slice((padded.length + 3) % 4);
  if (typeof atob === "function") {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
  }
  return Buffer.from(base64, "base64");
}

async function createSignature(payload) {
  const key = await getHmacKey();
  const data = encoder.encode(payload);
  const signature = await globalThis.crypto.subtle.sign("HMAC", key, data);
  return bufferToBase64Url(signature);
}

function timingSafeEqual(a, b) {
  if (a.length !== b.length) {
    return false;
  }
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

export async function createSessionToken({ email }) {
  assertAuthConfigured();
  const issuedAt = Date.now();
  const expiresAt = issuedAt + SESSION_MAX_AGE * 1000;
  const payload = { email, issuedAt, expiresAt };
  const payloadBytes = encoder.encode(JSON.stringify(payload));
  const encodedPayload = bufferToBase64Url(payloadBytes);
  const signature = await createSignature(encodedPayload);
  return `${encodedPayload}.${signature}`;
}

export async function verifySessionToken(token) {
  assertAuthConfigured();
  if (!token || typeof token !== "string") {
    return null;
  }

  const [encodedPayload, signature] = token.split(".");
  if (!encodedPayload || !signature) {
    return null;
  }

  let expectedSignature;
  try {
    expectedSignature = await createSignature(encodedPayload);
  } catch (error) {
    console.error("Failed to compute signature", error);
    return null;
  }

  if (!timingSafeEqual(expectedSignature, signature)) {
    return null;
  }

  try {
    const payloadBytes = base64UrlToBuffer(encodedPayload);
    const payloadJson =
      payloadBytes instanceof Uint8Array
        ? decoder.decode(payloadBytes)
        : decoder.decode(new Uint8Array(payloadBytes));
    const payload = JSON.parse(payloadJson);
    if (!payload?.email || Date.now() > payload.expiresAt) {
      return null;
    }
    return payload;
  } catch (error) {
    console.error("Failed to parse session token", error);
    return null;
  }
}

export function validateCredentials(email, password) {
  assertAuthConfigured();
  if (!email || !password) {
    return false;
  }
  return email.trim().toLowerCase() === adminEmail.toLowerCase() &&
    password === adminPassword;
}

export function attachSessionCookie(response, token) {
  response.cookies.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
}

export function clearSessionCookie(response) {
  response.cookies.set(SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

export async function getSessionFromCookies(cookieStore) {
  assertAuthConfigured();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) {
    return null;
  }
  return verifySessionToken(token);
}

export { SESSION_COOKIE_NAME, SESSION_MAX_AGE };
