import { api } from "encore.dev/api";
import { Query } from "encore.dev/api";
import { inventoryDB } from "./db";
import { InventoryListing, AdSpaceType, AdSpaceStatus } from "./types";

interface ListInventoryRequest {
  organization_id?: Query<number>;
  type?: Query<AdSpaceType>;
  status?: Query<AdSpaceStatus>;
  location?: Query<string>;
  limit?: Query<number>;
  offset?: Query<number>;
}

interface ListInventoryResponse {
  listings: InventoryListing[];
  total: number;
}

// Retrieves inventory listings with optional filtering.
export const listInventory = api<ListInventoryRequest, ListInventoryResponse>(
  { expose: true, method: "GET", path: "/inventory" },
  async (req) => {
    const limit = req.limit || 50;
    const offset = req.offset || 0;
    
    let whereConditions: string[] = [];
    let params: any[] = [];
    let paramIndex = 1;
    
    if (req.organization_id !== undefined) {
      whereConditions.push(`organization_id = $${paramIndex++}`);
      params.push(req.organization_id);
    }
    
    if (req.type !== undefined) {
      whereConditions.push(`type = $${paramIndex++}`);
      params.push(req.type);
    }
    
    if (req.status !== undefined) {
      whereConditions.push(`status = $${paramIndex++}`);
      params.push(req.status);
    }
    
    if (req.location !== undefined) {
      whereConditions.push(`location ILIKE $${paramIndex++}`);
      params.push(`%${req.location}%`);
    }
    
    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';
    
    // Get total count
    const totalQuery = `SELECT COUNT(*) as count FROM inventory_listings ${whereClause}`;
    const totalResult = await inventoryDB.rawQueryRow<{ count: number }>(totalQuery, ...params);
    const total = totalResult?.count || 0;
    
    // Get listings with pagination
    const listingsQuery = `
      SELECT * FROM inventory_listings 
      ${whereClause}
      ORDER BY created_at DESC 
      LIMIT $${paramIndex++} OFFSET $${paramIndex++}
    `;
    params.push(limit, offset);
    
    const listings = await inventoryDB.rawQueryAll<InventoryListing>(listingsQuery, ...params);
    
    return { listings, total };
  }
);
