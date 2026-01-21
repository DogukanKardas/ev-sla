# Görev Görünmüyor Sorunu - Troubleshooting

## Adım 1: Migration Kontrolü

Supabase Dashboard → SQL Editor'de çalıştırın:

```sql
-- 1. get_my_role fonksiyonu var mı?
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name = 'get_my_role';

-- 2. Tasks policy'leri kontrol
SELECT policyname, cmd 
FROM pg_policies 
WHERE tablename = 'tasks' 
AND schemaname = 'public';

-- 3. Test query (kendi görevlerinizi görebiliyor musunuz?)
SELECT * FROM tasks LIMIT 10;
```

## Adım 2: RLS Geçici Devre Dışı Test

Supabase Dashboard → SQL Editor:

```sql
-- RLS'yi geçici olarak kapat (SADECE TEST İÇİN)
ALTER TABLE tasks DISABLE ROW LEVEL SECURITY;

-- Şimdi görevler görünüyor mu test edin
-- Görevler görünüyorsa RLS policy sorunu
-- Görmüyorsanız farklı bir sorun

-- Testi bitince RLS'yi geri açın
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
```

## Adım 3: Manuel Policy Ekleme

Eğer yukarıdaki testte görevler görünüyorsa, policy'leri manuel ekleyin:

```sql
-- Önce tüm policy'leri sil
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

-- Basit policy'ler ekle
CREATE POLICY "users_select_tasks"
  ON tasks FOR SELECT
  USING (
    auth.uid() = user_id 
    OR 
    (SELECT role FROM public.user_profiles WHERE user_id = auth.uid() LIMIT 1) IN ('admin', 'manager')
  );

CREATE POLICY "users_update_tasks"
  ON tasks FOR UPDATE
  USING (
    auth.uid() = user_id
    OR
    (SELECT role FROM public.user_profiles WHERE user_id = auth.uid() LIMIT 1) IN ('admin', 'manager')
  );

CREATE POLICY "managers_insert_tasks"
  ON tasks FOR INSERT
  WITH CHECK (
    (SELECT role FROM public.user_profiles WHERE user_id = auth.uid() LIMIT 1) IN ('admin', 'manager')
  );

CREATE POLICY "managers_delete_tasks"
  ON tasks FOR DELETE
  USING (
    (SELECT role FROM public.user_profiles WHERE user_id = auth.uid() LIMIT 1) IN ('admin', 'manager')
  );
```

## Adım 4: API Test

Browser console'da (F12) test edin:

```javascript
// Tasks API test
fetch('/api/tasks')
  .then(r => r.json())
  .then(data => console.log('Tasks:', data))

// Admin tasks API test  
fetch('/api/admin/tasks')
  .then(r => r.json())
  .then(data => console.log('Admin Tasks:', data))
```

Hangi adımda ne sonuç aldığınızı paylaşın, ona göre çözelim.

