import { EncryptJWT, jwtDecrypt } from "jose";

const secretKey = process.env.SESSION_SECRET;

if (!secretKey) {
  throw new Error("SESSION_SECRET belum diatur di .env");
}

const encodedKey = new TextEncoder().encode(secretKey);

export async function createSession(payload: {
  userId: number;
  role: "ADMIN" | "HR_MANAGER" | "EMPLOYEE";
}) {
  return new EncryptJWT(payload)
    .setProtectedHeader({ alg: "dir", enc: "A256GCM" })
    .setIssuedAt()
    .setExpirationTime("8h")
    .encrypt(encodedKey);
}

export async function decryptSession(token: string) {
  try {
    const { payload } = await jwtDecrypt(token, encodedKey);

    return {
      userId: Number(payload.userId),
      role: payload.role as "ADMIN" | "HR_MANAGER" | "EMPLOYEE",
    };
  } catch {
    return null;
  }
}