import { api, APIError } from "encore.dev/api";
import { inventoryDB } from "./db";
import { InventoryListing } from "./types";

interface GetInventoryRequest {
  id: number;
}

// Retrieves a specific inventory listing by ID.
export const getInventory = api<GetInventoryRequest, InventoryListing>(
  { expose: true, method: "GET", path: "/inventory/:id" },
  async (req) => {
    const listing = await inventoryDB.queryRow<InventoryListing>`
      SELECT * FROM inventory_listings WHERE id = ${req.id}
    `;
    
    if (!listing) {
      throw APIError.notFound("Inventory listing not found");
    }
    
    return listing;
  }
);
