import { api, APIError } from "encore.dev/api";
import { inventoryDB } from "./db";

interface DeleteInventoryRequest {
  id: number;
}

// Deletes an inventory listing.
export const deleteInventory = api<DeleteInventoryRequest, void>(
  { expose: true, method: "DELETE", path: "/inventory/:id", auth: true },
  async (req) => {
    const result = await inventoryDB.queryRow`
      DELETE FROM inventory_listings WHERE id = ${req.id} RETURNING id
    `;
    
    if (!result) {
      throw APIError.notFound("Inventory listing not found");
    }
  }
);
