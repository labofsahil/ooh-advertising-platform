import { api, APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import { inventoryDB } from "./db";
import { CreateInventoryRequest, InventoryListing } from "./types";

// Creates a new inventory listing for advertising space.
export const createInventory = api<CreateInventoryRequest, InventoryListing>(
  { expose: true, method: "POST", path: "/inventory", auth: true },
  async (req) => {
    const auth = getAuthData()!;
    const userID = auth.userID;

    // Find or create the user's default organization
    let org = await inventoryDB.queryRow<{ id: number }>`
      SELECT id FROM organizations WHERE user_id = ${userID} AND name = 'Default Organization'
    `;

    if (!org) {
      const defaultEmail = `contact+${userID}@defaultorg.local`;
      org = await inventoryDB.queryRow<{ id: number }>`
        INSERT INTO organizations (name, email, phone, address, user_id)
        VALUES ('Default Organization', ${defaultEmail}, '+1-555-0123', '123 Main Street, City, State 12345', ${userID})
        ON CONFLICT (email) DO NOTHING
        RETURNING id
      `;
      if (!org) {
        // If a race condition caused the insert to not return a row, select again
        const existing = await inventoryDB.queryRow<{ id: number }>`
          SELECT id FROM organizations WHERE user_id = ${userID} AND name = 'Default Organization'
        `;
        if (existing) {
          org = existing;
        }
      }
    }

    if (!org) {
      throw APIError.internal("failed to resolve user's default organization");
    }

    // Validate visibility score if provided
    if (req.visibility_score !== undefined && (req.visibility_score < 1 || req.visibility_score > 10)) {
      throw APIError.invalidArgument("Visibility score must be between 1 and 10");
    }

    const row = await inventoryDB.queryRow<InventoryListing>`
      INSERT INTO inventory_listings (
        organization_id, title, description, type, size, location,
        address, city, state, country, postal_code,
        latitude, longitude, daily_price, weekly_price, monthly_price,
        dimensions_width, dimensions_height, illuminated, digital,
        traffic_count, demographics, visibility_score, status, image_url,
        facing_direction,
        available_from, available_until
      )
      VALUES (
        ${org.id}, ${req.title}, ${req.description || null},
        ${req.type}, ${req.size}, ${req.location},
        ${req.address || null}, ${req.city || null}, ${req.state || null}, ${req.country || null}, ${req.postal_code || null},
        ${req.latitude || null}, ${req.longitude || null},
        ${req.daily_price}, ${req.weekly_price || null}, ${req.monthly_price || null},
        ${req.dimensions_width || null}, ${req.dimensions_height || null},
        ${req.illuminated}, ${req.digital},
        ${req.traffic_count || null}, ${req.demographics || null},
        ${req.visibility_score || null}, ${req.status || "available"}, ${req.image_url || null},
        ${req.facing_direction || null},
        ${req.available_from || null}, ${req.available_until || null}
      )
      RETURNING *
    `;
    
    if (!row) {
      throw APIError.internal("Failed to create inventory listing");
    }
    
    return row;
  }
);
