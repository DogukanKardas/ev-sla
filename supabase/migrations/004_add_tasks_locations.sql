-- Add location to tasks table
ALTER TABLE tasks ADD COLUMN location_id UUID REFERENCES locations(id) ON DELETE SET NULL;
ALTER TABLE tasks ADD COLUMN location_address TEXT;
ALTER TABLE tasks ADD COLUMN location_notes TEXT;

-- Index for tasks location
CREATE INDEX idx_tasks_location_id ON tasks(location_id);

