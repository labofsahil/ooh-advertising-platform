import { api } from "encore.dev/api";
import { inventoryDB } from "./db";
import { CreateOrganizationRequest, Organization } from "./types";

// Creates a new organization that can manage inventory listings.
export const createOrganization = api<CreateOrganizationRequest, Organization>(
  { expose: true, method: "POST", path: "/organizations", auth: true },
  async (req) => {
    const row = await inventoryDB.queryRow<Organization>`
      INSERT INTO organizations (name, email, phone, address)
      VALUES (${req.name}, ${req.email}, ${req.phone || null}, ${req.address || null})
      RETURNING *
    `;
    
    if (!row) {
      throw new Error("Failed to create organization");
    }
    
    return row;
  }
);
