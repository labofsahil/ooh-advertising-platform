CREATE TYPE ad_space_type AS ENUM ('billboard', 'digital_display', 'transit_ad', 'street_furniture', 'airport', 'mall', 'other');
CREATE TYPE ad_space_size AS ENUM ('small', 'medium', 'large', 'extra_large');
CREATE TYPE ad_space_status AS ENUM ('active', 'inactive', 'pending');

CREATE TABLE organizations (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE inventory_listings (
  id BIGSERIAL PRIMARY KEY,
  organization_id BIGINT NOT NULL REFERENCES organizations(id),
  title TEXT NOT NULL,
  description TEXT,
  type ad_space_type NOT NULL,
  size ad_space_size NOT NULL,
  location TEXT NOT NULL,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  daily_price DOUBLE PRECISION NOT NULL,
  weekly_price DOUBLE PRECISION,
  monthly_price DOUBLE PRECISION,
  dimensions_width DOUBLE PRECISION,
  dimensions_height DOUBLE PRECISION,
  illuminated BOOLEAN NOT NULL DEFAULT FALSE,
  digital BOOLEAN NOT NULL DEFAULT FALSE,
  traffic_count INTEGER,
  demographics TEXT,
  visibility_score INTEGER CHECK (visibility_score >= 1 AND visibility_score <= 10),
  status ad_space_status NOT NULL DEFAULT 'pending',
  image_url TEXT,
  available_from DATE,
  available_until DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_inventory_organization ON inventory_listings(organization_id);
CREATE INDEX idx_inventory_type ON inventory_listings(type);
CREATE INDEX idx_inventory_status ON inventory_listings(status);
CREATE INDEX idx_inventory_location ON inventory_listings(location);
