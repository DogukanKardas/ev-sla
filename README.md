# EV-SLA - Employee Tracking & KPI Management System

IT firması için çalışan takip ve performans yönetim sistemi.

## Özellikler

### Çalışan Takibi
- ✅ Cihaz açılış takibi (otomatik session kayıtları)
- ✅ QR kod ile giriş/çıkış sistemi
- ✅ GPS bazlı lokasyon doğrulama
- ✅ Gerçek zamanlı konum kontrolü

### Görev Yönetimi
- ✅ Admin'den çalışanlara görev atama
- ✅ Lokasyon bilgisi ve Google Maps yol tarifi
- ✅ Durum takibi (Bekliyor/Devam/Tamamlandı)
- ✅ Gerçek zamanlı görev güncellemeleri

### Mesajlaşma Takibi
- ✅ Slack/Teams/WhatsApp entegrasyonu
- ✅ Mesaj yanıt süreleri
- ✅ Otomatik KPI hesaplama

### İş Kayıtları
- ✅ Günlük iş kayıtları (serbest metin + zaman)
- ✅ Proje etiketleme
- ✅ Verimlilik analizi

### KPI ve Raporlama
- ✅ Otomatik KPI hesaplama
- ✅ Çalışma saatleri, yanıt süreleri, görev tamamlama
- ✅ Aylık değerlendirmeler
- ✅ PDF rapor export

### Kullanıcı Yönetimi
- ✅ Rol bazlı erişim (Admin/Yönetici/Çalışan)
- ✅ Admin kullanıcı oluşturma/düzenleme/silme
- ✅ QR kod oluşturma
- ✅ Gerçek zamanlı dashboard

## Teknoloji Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes + Supabase
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth (JWT)
- **Real-time**: Supabase Realtime subscriptions
- **Deployment**: Vercel
- **Geolocation**: Browser Geolocation API
- **QR Code**: qrcode.js, html5-qrcode

## Çoklu Kullanıcı Desteği

✅ **Concurrent Sessions**: Birden fazla kullanıcı aynı anda kullanabilir  
✅ **Real-time Updates**: Değişiklikler anında diğer kullanıcılara yansır  
✅ **Session Isolation**: Her kullanıcının bağımsız session'ı  
✅ **No Conflict**: Kullanıcılar birbirini etkilemez  

## Kurulum

### Local Development

1. Bağımlılıkları yükleyin:
```bash
npm install
```

2. Environment variables'ı yapılandırın (`.env.local`):
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

3. Supabase migration'larını çalıştırın (SQL Editor'de sırayla):
- `001_initial_schema.sql`
- `002_fix_rls_policies.sql`
- `003_add_locations.sql`
- `004_add_tasks_locations.sql`
- `005_fix_admin_insert_policy.sql`

4. Development server:
```bash
npm run dev
```

## Vercel Deployment

Detaylı bilgi için `DEPLOYMENT.md` dosyasına bakın.

1. GitHub'a push
2. Vercel'de proje oluştur
3. Environment variables ekle
4. Otomatik deploy

## Kullanım Kılavuzu

### İlk Kurulum
1. Kayıt olun (`/register`)
2. Supabase'de rolü `admin` yapın
3. Admin panelinden diğer kullanıcıları ekleyin

### Admin İşlemleri
- **Kullanıcı Yönetimi**: Çalışan ekle/düzenle/sil
- **Lokasyon Yönetimi**: Ofis konumları tanımla (Google Maps ile)
- **Görev Yönetimi**: Çalışanlara görev ata, durumları takip et
- **KPI Değerlendirme**: Aylık performans değerlendirmesi

### Çalışan İşlemleri
- **Giriş/Çıkış**: QR kod okut (lokasyon doğrulama ile)
- **Görevlerim**: Görevleri gör, durum güncelle, yol tarifi al
- **İş Kayıtları**: Günlük yapılan işleri kaydet
- **Mesajlar**: Gelen mesajlara yanıt sürelerini kaydet
- **KPI**: Kendi performansını görüntüle

## Lisans

MIT
