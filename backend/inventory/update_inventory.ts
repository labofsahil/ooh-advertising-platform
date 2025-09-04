import { api, APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import { inventoryDB } from "./db";
import { UpdateInventoryRequest, InventoryListing } from "./types";

// Updates an existing inventory listing owned by the authenticated user.
export const updateInventory = api<UpdateInventoryRequest, InventoryListing>(
  { expose: true, method: "PUT", path: "/inventory/:id", auth: true },
  async (req) => {
    const auth = getAuthData()!;

    // Check if listing exists and is owned by the user
    const existingListing = await inventoryDB.queryRow<{ id: number }>`
      SELECT il.id
      FROM inventory_listings il
      JOIN organizations o ON o.id = il.organization_id
      WHERE il.id = ${req.id} AND o.user_id = ${auth.userID}
    `;
    
    if (!existingListing) {
      throw APIError.notFound("Inventory listing not found");
    }

    // Validate visibility score if provided
    if (req.visibility_score !== undefined && (req.visibility_score < 1 || req.visibility_score > 10)) {
      throw APIError.invalidArgument("Visibility score must be between 1 and 10");
    }

    // Build dynamic update query
    const updates: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    const fields: (keyof UpdateInventoryRequest)[] = [
      "title", "description", "type", "size", "location", "latitude", "longitude",
      "daily_price", "weekly_price", "monthly_price", "dimensions_width", "dimensions_height",
      "illuminated", "digital", "traffic_count", "demographics", "visibility_score",
      "status", "image_url", "available_from", "available_until"
    ];

    for (const field of fields) {
      if (req[field] !== undefined) {
        updates.push(`${field} = $${paramIndex++}`);
        params.push(req[field]);
      }
    }

    if (updates.length === 0) {
      throw APIError.invalidArgument("No fields to update");
    }

    updates.push(`updated_at = NOW()`);
    params.push(req.id, auth.userID);

    const query = `
      UPDATE inventory_listings il
      SET ${updates.join(", ")}
      FROM organizations o
      WHERE il.organization_id = o.id
        AND il.id = $${paramIndex++}
        AND o.user_id = $${paramIndex++}
      RETURNING il.*
    `;

    const updatedListing = await inventoryDB.rawQueryRow<InventoryListing>(query, ...params);
    
    if (!updatedListing) {
      throw APIError.internal("Failed to update inventory listing");
    }
    
    return updatedListing;
  }
);
