import { api, APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import { inventoryDB } from "./db";

interface DeleteInventoryRequest {
  id: number;
}

// Deletes an inventory listing owned by the authenticated user.
export const deleteInventory = api<DeleteInventoryRequest, void>(
  { expose: true, method: "DELETE", path: "/inventory/:id", auth: true },
  async (req) => {
    const auth = getAuthData()!;
    const result = await inventoryDB.queryRow<{ id: number }>`
      DELETE FROM inventory_listings il
      USING organizations o
      WHERE il.organization_id = o.id
        AND il.id = ${req.id}
        AND o.user_id = ${auth.userID}
      RETURNING il.id as id
    `;
    
    if (!result) {
      throw APIError.notFound("Inventory listing not found");
    }
  }
);
