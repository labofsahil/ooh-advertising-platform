export type AdSpaceType = "billboard" | "digital_display" | "transit_ad" | "street_furniture" | "airport" | "mall" | "other";
export type AdSpaceSize = "small" | "medium" | "large" | "extra_large";
export type AdSpaceStatus = "active" | "inactive" | "pending";

export interface Organization {
  id: number;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  created_at: Date;
  updated_at: Date;
}

export interface InventoryListing {
  id: number;
  organization_id: number;
  title: string;
  description?: string;
  type: AdSpaceType;
  size: AdSpaceSize;
  location: string;
  latitude?: number;
  longitude?: number;
  daily_price: number;
  weekly_price?: number;
  monthly_price?: number;
  dimensions_width?: number;
  dimensions_height?: number;
  illuminated: boolean;
  digital: boolean;
  traffic_count?: number;
  demographics?: string;
  visibility_score?: number;
  status: AdSpaceStatus;
  image_url?: string;
  available_from?: Date;
  available_until?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface CreateOrganizationRequest {
  name: string;
  email: string;
  phone?: string;
  address?: string;
}

export interface CreateInventoryRequest {
  organization_id: number;
  title: string;
  description?: string;
  type: AdSpaceType;
  size: AdSpaceSize;
  location: string;
  latitude?: number;
  longitude?: number;
  daily_price: number;
  weekly_price?: number;
  monthly_price?: number;
  dimensions_width?: number;
  dimensions_height?: number;
  illuminated: boolean;
  digital: boolean;
  traffic_count?: number;
  demographics?: string;
  visibility_score?: number;
  image_url?: string;
  available_from?: Date;
  available_until?: Date;
}

export interface UpdateInventoryRequest {
  id: number;
  title?: string;
  description?: string;
  type?: AdSpaceType;
  size?: AdSpaceSize;
  location?: string;
  latitude?: number;
  longitude?: number;
  daily_price?: number;
  weekly_price?: number;
  monthly_price?: number;
  dimensions_width?: number;
  dimensions_height?: number;
  illuminated?: boolean;
  digital?: boolean;
  traffic_count?: number;
  demographics?: string;
  visibility_score?: number;
  status?: AdSpaceStatus;
  image_url?: string;
  available_from?: Date;
  available_until?: Date;
}
