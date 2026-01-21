-- Drop all existing task policies to avoid conflicts
DO $$ 
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN 
    SELECT policyname 
    FROM pg_policies 
    WHERE tablename = 'tasks' AND schemaname = 'public'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON tasks', pol.policyname);
  END LOOP;
END $$;

-- Recreate task policies without recursion

-- Users can view their assigned tasks
CREATE POLICY "users_view_own_tasks"
  ON tasks FOR SELECT
  USING (auth.uid() = user_id);

-- Admins and managers can view all tasks
CREATE POLICY "admins_view_all_tasks"
  ON tasks FOR SELECT
  USING (public.get_my_role() IN ('admin', 'manager'));

-- Users can update their own tasks (status changes)
CREATE POLICY "users_update_own_tasks"
  ON tasks FOR UPDATE
  USING (auth.uid() = user_id);

-- Admins and managers can insert tasks for any user
CREATE POLICY "admins_insert_tasks"
  ON tasks FOR INSERT
  WITH CHECK (public.get_my_role() IN ('admin', 'manager'));

-- Admins and managers can update any task
CREATE POLICY "admins_update_tasks"
  ON tasks FOR UPDATE
  USING (public.get_my_role() IN ('admin', 'manager'));

-- Admins and managers can delete tasks
CREATE POLICY "admins_delete_tasks"
  ON tasks FOR DELETE
  USING (public.get_my_role() IN ('admin', 'manager'));

