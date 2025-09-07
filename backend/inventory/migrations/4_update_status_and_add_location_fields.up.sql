-- Rename existing status enum and create a new one with desired values
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ad_space_status') THEN
    ALTER TYPE ad_space_status RENAME TO ad_space_status_old;
  END IF;
END
$$;

CREATE TYPE ad_space_status AS ENUM ('available', 'booked', 'maintenance', 'inactive');

-- Create new facing direction enum
CREATE TYPE facing_direction AS ENUM ('north', 'south', 'east', 'west', 'multiple');

-- Drop default to allow type change
ALTER TABLE inventory_listings ALTER COLUMN status DROP DEFAULT;

-- Convert column to new enum with value mapping
ALTER TABLE inventory_listings
  ALTER COLUMN status TYPE ad_space_status
  USING (
    CASE status::text
      WHEN 'active' THEN 'available'::ad_space_status
      WHEN 'pending' THEN 'inactive'::ad_space_status
      WHEN 'inactive' THEN 'inactive'::ad_space_status
      ELSE 'inactive'::ad_space_status
    END
  );

-- Set a new default
ALTER TABLE inventory_listings ALTER COLUMN status SET DEFAULT 'available';

-- Drop old enum if it exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ad_space_status_old') THEN
    DROP TYPE ad_space_status_old;
  END IF;
END
$$;

-- Add new structured location fields and facing direction
ALTER TABLE inventory_listings
  ADD COLUMN IF NOT EXISTS address TEXT,
  ADD COLUMN IF NOT EXISTS city TEXT,
  ADD COLUMN IF NOT EXISTS state TEXT,
  ADD COLUMN IF NOT EXISTS country TEXT,
  ADD COLUMN IF NOT EXISTS postal_code TEXT,
  ADD COLUMN IF NOT EXISTS facing_direction facing_direction;

-- Helpful indexes for querying
CREATE INDEX IF NOT EXISTS idx_inventory_city ON inventory_listings(city);
CREATE INDEX IF NOT EXISTS idx_inventory_state ON inventory_listings(state);
CREATE INDEX IF NOT EXISTS idx_inventory_postal_code ON inventory_listings(postal_code);
