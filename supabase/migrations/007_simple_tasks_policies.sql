-- Complete reset of tasks policies with simpler approach

-- Drop ALL existing policies
DROP POLICY IF EXISTS "users_view_own_tasks" ON tasks;
DROP POLICY IF EXISTS "admins_view_all_tasks" ON tasks;
DROP POLICY IF EXISTS "users_update_own_tasks" ON tasks;
DROP POLICY IF EXISTS "admins_insert_tasks" ON tasks;
DROP POLICY IF EXISTS "admins_update_tasks" ON tasks;
DROP POLICY IF EXISTS "admins_delete_tasks" ON tasks;
DROP POLICY IF EXISTS "Users can view their own tasks" ON tasks;
DROP POLICY IF EXISTS "Users can insert their own tasks" ON tasks;
DROP POLICY IF EXISTS "Users can update their own tasks" ON tasks;
DROP POLICY IF EXISTS "Managers can view and manage team tasks" ON tasks;

-- Create simple, non-recursive policies
CREATE POLICY "task_select_policy"
  ON tasks FOR SELECT
  USING (
    auth.uid() = user_id 
    OR 
    (SELECT role FROM public.user_profiles WHERE user_id = auth.uid() LIMIT 1) IN ('admin', 'manager')
  );

CREATE POLICY "task_update_policy"
  ON tasks FOR UPDATE
  USING (
    auth.uid() = user_id
    OR
    (SELECT role FROM public.user_profiles WHERE user_id = auth.uid() LIMIT 1) IN ('admin', 'manager')
  );

CREATE POLICY "task_insert_policy"
  ON tasks FOR INSERT
  WITH CHECK (
    (SELECT role FROM public.user_profiles WHERE user_id = auth.uid() LIMIT 1) IN ('admin', 'manager')
  );

CREATE POLICY "task_delete_policy"
  ON tasks FOR DELETE
  USING (
    (SELECT role FROM public.user_profiles WHERE user_id = auth.uid() LIMIT 1) IN ('admin', 'manager')
  );

