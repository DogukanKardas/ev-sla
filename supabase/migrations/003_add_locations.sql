-- Locations table for admin-defined attendance locations
CREATE TABLE locations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  address TEXT,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  radius_meters INTEGER NOT NULL DEFAULT 100,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add location_id to attendance table
ALTER TABLE attendance ADD COLUMN location_id UUID REFERENCES locations(id) ON DELETE SET NULL;
ALTER TABLE attendance ADD COLUMN latitude DECIMAL(10, 8);
ALTER TABLE attendance ADD COLUMN longitude DECIMAL(11, 8);
ALTER TABLE attendance ADD COLUMN distance_meters INTEGER;

-- Index for locations
CREATE INDEX idx_locations_is_active ON locations(is_active);

-- RLS for locations
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view active locations"
  ON locations FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage locations"
  ON locations FOR ALL
  USING (public.get_my_role() = 'admin')
  WITH CHECK (public.get_my_role() = 'admin');

-- Trigger for updated_at
CREATE TRIGGER update_locations_updated_at BEFORE UPDATE ON locations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

