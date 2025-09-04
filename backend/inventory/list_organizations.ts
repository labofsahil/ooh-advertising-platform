import { api } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import { inventoryDB } from "./db";
import { Organization } from "./types";

interface ListOrganizationsResponse {
  organizations: Organization[];
}

// Retrieves all organizations owned by the authenticated user.
export const listOrganizations = api<void, ListOrganizationsResponse>(
  { expose: true, method: "GET", path: "/organizations", auth: true },
  async () => {
    const auth = getAuthData()!;
    const organizations = await inventoryDB.queryAll<Organization>`
      SELECT * FROM organizations WHERE user_id = ${auth.userID} ORDER BY name ASC
    `;
    
    return { organizations };
  }
);
