import { Header, Cookie, APIError, Gateway } from "encore.dev/api";
import { authHandler } from "encore.dev/auth";
import { createClerkClient, verifyToken } from "@clerk/backend";
import { secret } from "encore.dev/config";

interface AuthParams {
  authorization?: Header<"Authorization">;
  session?: Cookie<"session">;
}

export interface AuthData {
  userID: string;
  imageUrl: string;
  email: string | null;
}

const clerkSecretKey = secret("ClerkSecretKey");
const clerkClient = createClerkClient({ secretKey: clerkSecretKey() });

const auth = authHandler<AuthParams, AuthData>(async (data) => {
  const token = data.authorization?.replace("Bearer ", "") ?? data.session?.value;
  if (!token) {
    throw APIError.unauthenticated("missing token");
  }

  try {
    // Verify the Clerk token and resolve user information
    const verified = await verifyToken(token, {
      secretKey: clerkSecretKey(),
    });

    const user = await clerkClient.users.getUser(verified.sub);
    return {
      userID: user.id,
      imageUrl: user.imageUrl ?? "",
      email: user.emailAddresses?.[0]?.emailAddress ?? null,
    };
  } catch (err) {
    throw APIError.unauthenticated("invalid token", err);
  }
});

// Configure the API gateway to use the auth handler.
export const gw = new Gateway({ authHandler: auth });
