import { decode as atob } from "base-64";

export function decodeToken(token: string) {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) {
      throw new Error("Invalid token format");
    }

    const payload = parts[1];
    const decodedPayload = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(decodedPayload);
  } catch (error) {
    console.error("Error decoding token:", error);
    return null;
  }
}

export function getUserInfoFromToken(token: string) {
  const decoded = decodeToken(token);
  if (!decoded) return null;

  return {
    userId: decoded.user_id,
    roles: decoded.role || [],
    exp: decoded.exp , // expiry date
    iat: decoded.iat, // issued at
  };
}
