import { api, APIError } from "encore.dev/api";
import { inventoryDB } from "./db";
import { CreateInventoryRequest, InventoryListing } from "./types";

// Creates a new inventory listing for advertising space.
export const createInventory = api<CreateInventoryRequest, InventoryListing>(
  { expose: true, method: "POST", path: "/inventory", auth: true },
  async (req) => {
    // Ensure default organization exists if using organization_id = 1
    if (req.organization_id === 1) {
      const defaultOrg = await inventoryDB.queryRow`
        SELECT id FROM organizations WHERE id = 1
      `;
      
      if (!defaultOrg) {
        // Create default organization if it doesn't exist
        await inventoryDB.exec`
          INSERT INTO organizations (id, name, email, phone, address)
          VALUES (1, 'Default Organization', 'contact@defaultorg.com', '+1-555-0123', '123 Main Street, City, State 12345')
          ON CONFLICT (id) DO NOTHING
        `;
      }
    } else {
      // Verify organization exists for non-default organization IDs
      const orgExists = await inventoryDB.queryRow`
        SELECT id FROM organizations WHERE id = ${req.organization_id}
      `;
      
      if (!orgExists) {
        throw APIError.notFound("Organization not found");
      }
    }

    // Validate visibility score if provided
    if (req.visibility_score !== undefined && (req.visibility_score < 1 || req.visibility_score > 10)) {
      throw APIError.invalidArgument("Visibility score must be between 1 and 10");
    }

    const row = await inventoryDB.queryRow<InventoryListing>`
      INSERT INTO inventory_listings (
        organization_id, title, description, type, size, location,
        latitude, longitude, daily_price, weekly_price, monthly_price,
        dimensions_width, dimensions_height, illuminated, digital,
        traffic_count, demographics, visibility_score, image_url,
        available_from, available_until
      )
      VALUES (
        ${req.organization_id}, ${req.title}, ${req.description || null},
        ${req.type}, ${req.size}, ${req.location},
        ${req.latitude || null}, ${req.longitude || null},
        ${req.daily_price}, ${req.weekly_price || null}, ${req.monthly_price || null},
        ${req.dimensions_width || null}, ${req.dimensions_height || null},
        ${req.illuminated}, ${req.digital},
        ${req.traffic_count || null}, ${req.demographics || null},
        ${req.visibility_score || null}, ${req.image_url || null},
        ${req.available_from || null}, ${req.available_until || null}
      )
      RETURNING *
    `;
    
    if (!row) {
      throw new Error("Failed to create inventory listing");
    }
    
    return row;
  }
);
