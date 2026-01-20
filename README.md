# EV-SLA - Employee Tracking & KPI Management System

IT firması için çalışan takip ve performans yönetim sistemi.

## Özellikler

- ✅ Cihaz açılış takibi
- ✅ QR kod ile giriş/çıkış sistemi
- ✅ Mesaj yanıt süreleri takibi (Slack/Teams/WhatsApp)
- ✅ Günlük iş kayıtları (serbest metin + zaman takibi)
- ✅ KPI takibi ve değerlendirme
- ✅ Rol bazlı dashboard (Admin/Yönetici/Çalışan)
- ✅ Gerçek zamanlı güncellemeler

## Teknoloji Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes + Supabase
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Real-time**: Supabase Realtime
- **Deployment**: Vercel

## Kurulum

1. Bağımlılıkları yükleyin:
```bash
npm install
```

2. Environment variables'ı yapılandırın:
`.env.local` dosyası oluşturun ve gerekli değişkenleri ekleyin:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

3. Supabase migration'larını çalıştırın:
Supabase dashboard'da SQL Editor'ü kullanarak `supabase/migrations/001_initial_schema.sql` dosyasını çalıştırın.

4. Development server'ı başlatın:
```bash
npm run dev
```

## Kullanım

1. İlk admin kullanıcısını oluşturun (Supabase Auth üzerinden)
2. Admin panelinden diğer kullanıcıları ekleyin
3. Her kullanıcı için QR kod otomatik oluşturulur
4. Çalışanlar giriş/çıkış yapabilir, iş kayıtları tutabilir
5. Yöneticiler ve Admin'ler dashboard'dan takım performansını görüntüleyebilir

## Deployment

Vercel'e deploy etmek için:
1. Projeyi GitHub'a push edin
2. Vercel'de yeni proje oluşturun
3. Environment variables'ı ekleyin
4. Deploy edin
# ev-sla
# ev-sla
