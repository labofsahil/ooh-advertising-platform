import { Header, Cookie, APIError, Gateway } from "encore.dev/api";
import { authHandler } from "encore.dev/auth";

interface AuthParams {
  authorization?: Header<"Authorization">;
  session?: Cookie<"session">;
}

export interface AuthData {
  userID: string;
  imageUrl: string;
  email: string | null;
}

const auth = authHandler<AuthParams, AuthData>(async (data) => {
  const token = data.authorization?.replace("Bearer ", "") ?? data.session?.value;
  if (!token) {
    throw APIError.unauthenticated("missing token");
  }

  // For development, accept any token and return mock user data
  // In production, you would verify the token with your auth provider
  return {
    userID: "mock-user-id",
    imageUrl: "https://via.placeholder.com/150",
    email: "user@example.com",
  };
});

// Configure the API gateway to use the auth handler.
export const gw = new Gateway({ authHandler: auth });
