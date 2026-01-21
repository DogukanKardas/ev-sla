-- Allow admins to insert profiles for other users
CREATE POLICY "admins_insert_any_profile"
  ON user_profiles FOR INSERT
  WITH CHECK (
    public.get_my_role() = 'admin'
  );

