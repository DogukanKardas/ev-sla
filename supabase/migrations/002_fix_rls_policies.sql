-- Drop ALL existing user_profiles policies to avoid conflicts
DO $$ 
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN 
    SELECT policyname 
    FROM pg_policies 
    WHERE tablename = 'user_profiles' AND schemaname = 'public'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON user_profiles', pol.policyname);
  END LOOP;
END $$;

-- Disable and re-enable RLS to reset
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Create a simple function to get user role (SECURITY DEFINER to bypass RLS)
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS TEXT AS $$
BEGIN
  RETURN (SELECT role FROM public.user_profiles WHERE user_id = auth.uid() LIMIT 1);
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Create new simplified policies
CREATE POLICY "users_select_own"
  ON user_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "admins_select_all"
  ON user_profiles FOR SELECT
  USING (public.get_my_role() = 'admin');

CREATE POLICY "managers_select_all"
  ON user_profiles FOR SELECT
  USING (public.get_my_role() = 'manager');

CREATE POLICY "users_update_own"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "users_insert_own"
  ON user_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "admins_insert_any"
  ON user_profiles FOR INSERT
  WITH CHECK (
    (SELECT role FROM public.user_profiles WHERE user_id = auth.uid() LIMIT 1) = 'admin'
  );

