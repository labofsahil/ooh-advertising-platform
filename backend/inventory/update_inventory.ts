import { api, APIError } from "encore.dev/api";
import { inventoryDB } from "./db";
import { UpdateInventoryRequest, InventoryListing } from "./types";

// Updates an existing inventory listing.
export const updateInventory = api<UpdateInventoryRequest, InventoryListing>(
  { expose: true, method: "PUT", path: "/inventory/:id", auth: true },
  async (req) => {
    // Check if listing exists
    const existingListing = await inventoryDB.queryRow`
      SELECT id FROM inventory_listings WHERE id = ${req.id}
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

    const fields = [
      'title', 'description', 'type', 'size', 'location', 'latitude', 'longitude',
      'daily_price', 'weekly_price', 'monthly_price', 'dimensions_width', 'dimensions_height',
      'illuminated', 'digital', 'traffic_count', 'demographics', 'visibility_score',
      'status', 'image_url', 'available_from', 'available_until'
    ];

    fields.forEach(field => {
      if (req[field as keyof UpdateInventoryRequest] !== undefined) {
        updates.push(`${field} = $${paramIndex++}`);
        params.push(req[field as keyof UpdateInventoryRequest]);
      }
    });

    if (updates.length === 0) {
      throw APIError.invalidArgument("No fields to update");
    }

    updates.push(`updated_at = NOW()`);
    params.push(req.id);

    const query = `
      UPDATE inventory_listings 
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const updatedListing = await inventoryDB.rawQueryRow<InventoryListing>(query, ...params);
    
    if (!updatedListing) {
      throw new Error("Failed to update inventory listing");
    }
    
    return updatedListing;
  }
);
