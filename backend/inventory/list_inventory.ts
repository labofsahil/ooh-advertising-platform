import { api } from "encore.dev/api";
import { Query } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
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
  { expose: true, method: "GET", path: "/inventory", auth: true },
  async (req) => {
    const auth = getAuthData()!;
    const limit = req.limit || 50;
    const offset = req.offset || 0;
    
    const whereConditions: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    // Always scope to the authenticated user's data
    whereConditions.push(`o.user_id = $${paramIndex++}`);
    params.push(auth.userID);
    
    if (req.organization_id !== undefined) {
      whereConditions.push(`il.organization_id = $${paramIndex++}`);
      params.push(req.organization_id);
    }
    
    if (req.type !== undefined) {
      whereConditions.push(`il.type = $${paramIndex++}`);
      params.push(req.type);
    }
    
    if (req.status !== undefined) {
      whereConditions.push(`il.status = $${paramIndex++}`);
      params.push(req.status);
    }
    
    if (req.location !== undefined) {
      whereConditions.push(`il.location ILIKE $${paramIndex++}`);
      params.push(`%${req.location}%`);
    }
    
    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';
    
    // Get total count
    const totalQuery = `
      SELECT COUNT(*) AS count
      FROM inventory_listings il
      JOIN organizations o ON o.id = il.organization_id
      ${whereClause}
    `;
    const totalResult = await inventoryDB.rawQueryRow<{ count: number }>(totalQuery, ...params);
    const total = Number(totalResult?.count || 0);
    
    // Get listings with pagination
    const listingsQuery = `
      SELECT il.*
      FROM inventory_listings il
      JOIN organizations o ON o.id = il.organization_id
      ${whereClause}
      ORDER BY il.created_at DESC 
      LIMIT $${paramIndex++} OFFSET $${paramIndex++}
    `;
    params.push(limit, offset);
    
    const listings = await inventoryDB.rawQueryAll<InventoryListing>(listingsQuery, ...params);
    
    return { listings, total };
  }
);
