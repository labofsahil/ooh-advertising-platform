import { api } from "encore.dev/api";
import { inventoryDB } from "./db";
import { Organization } from "./types";

interface ListOrganizationsResponse {
  organizations: Organization[];
}

// Retrieves all organizations in the system.
export const listOrganizations = api<void, ListOrganizationsResponse>(
  { expose: true, method: "GET", path: "/organizations" },
  async () => {
    const organizations = await inventoryDB.queryAll<Organization>`
      SELECT * FROM organizations ORDER BY name ASC
    `;
    
    return { organizations };
  }
);
