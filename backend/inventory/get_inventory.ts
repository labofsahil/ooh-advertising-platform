import { api, APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import { inventoryDB } from "./db";
import { InventoryListing } from "./types";

interface GetInventoryRequest {
  id: number;
}

// Retrieves a specific inventory listing by ID.
export const getInventory = api<GetInventoryRequest, InventoryListing>(
  { expose: true, method: "GET", path: "/inventory/:id", auth: true },
  async (req) => {
    const auth = getAuthData()!;
    const listing = await inventoryDB.queryRow<InventoryListing>`
      SELECT il.*
      FROM inventory_listings il
      JOIN organizations o ON o.id = il.organization_id
      WHERE il.id = ${req.id} AND o.user_id = ${auth.userID}
    `;
    
    if (!listing) {
      throw APIError.notFound("Inventory listing not found");
    }
    
    return listing;
  }
);
