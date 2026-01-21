-- Ensure foreign key constraints exist for tasks table

-- Drop and recreate assigned_by foreign key if needed
ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_assigned_by_fkey;
ALTER TABLE tasks 
  ADD CONSTRAINT tasks_assigned_by_fkey 
  FOREIGN KEY (assigned_by) 
  REFERENCES auth.users(id) 
  ON DELETE SET NULL;

-- Ensure user_id foreign key exists
ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_user_id_fkey;
ALTER TABLE tasks 
  ADD CONSTRAINT tasks_user_id_fkey 
  FOREIGN KEY (user_id) 
  REFERENCES auth.users(id) 
  ON DELETE CASCADE;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_by ON tasks(assigned_by);
CREATE INDEX IF NOT EXISTS idx_tasks_user_id_status ON tasks(user_id, status);

