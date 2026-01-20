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

### Local Development

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
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

3. Supabase migration'larını çalıştırın:
Supabase dashboard'da SQL Editor'ü kullanarak `supabase/migrations/001_initial_schema.sql` dosyasını çalıştırın.

4. Development server'ı başlatın:
```bash
npm run dev
```

## Vercel Deployment

### 1. Vercel Projesi Oluşturma

1. [Vercel Dashboard](https://vercel.com/dashboard) üzerinden yeni proje oluşturun
2. GitHub repository'nizi bağlayın
3. Vercel otomatik olarak Next.js projesini algılayacaktır

### 2. Environment Variables Ayarlama

Vercel Dashboard'da projenize gidin ve Settings > Environment Variables bölümüne ekleyin:

- `NEXT_PUBLIC_SUPABASE_URL` - Supabase proje URL'iniz
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key (server-side only)
- `NEXT_PUBLIC_APP_URL` - Vercel deployment URL'iniz (otomatik ayarlanır)

**Önemli**: 
- `NEXT_PUBLIC_` ile başlayan değişkenler browser'da kullanılabilir
- `SUPABASE_SERVICE_ROLE_KEY` sadece server-side kullanılır, güvenlik için önemlidir

### 3. Build Ayarları

Vercel otomatik olarak Next.js projesini algılar. `vercel.json` dosyası ek yapılandırma içerir:
- Build Command: `npm run build`
- Output Directory: `.next`
- Install Command: `npm install`

### 4. Deploy

1. GitHub'a push yapın
2. Vercel otomatik olarak deploy edecektir
3. Her push'ta yeni bir deployment oluşturulur

### 5. Custom Domain (Opsiyonel)

1. Vercel Dashboard > Settings > Domains
2. Custom domain ekleyin
3. DNS ayarlarını yapın

## Kullanım

1. İlk admin kullanıcısını oluşturun (Supabase Auth üzerinden)
2. Admin panelinden diğer kullanıcıları ekleyin
3. Her kullanıcı için QR kod otomatik oluşturulur
4. Çalışanlar giriş/çıkış yapabilir, iş kayıtları tutabilir
5. Yöneticiler ve Admin'ler dashboard'dan takım performansını görüntüleyebilir

## Supabase Migration

1. Supabase Dashboard'a gidin
2. SQL Editor'ü açın
3. `supabase/migrations/001_initial_schema.sql` dosyasının içeriğini kopyalayın
4. SQL Editor'de çalıştırın

## Webhook Yapılandırması

### Slack
1. Slack App oluşturun
2. Webhook URL: `https://your-app.vercel.app/api/webhooks/slack`
3. Events abone olun: `message.channels`

### Teams
1. Teams App oluşturun
2. Webhook URL: `https://your-app.vercel.app/api/webhooks/teams`

### WhatsApp
1. WhatsApp Business API kurulumu yapın
2. Webhook URL: `https://your-app.vercel.app/api/webhooks/whatsapp`
3. Verify Token ayarlayın

## Sorun Giderme

### Build Hataları
- Environment variables'ların doğru ayarlandığından emin olun
- `npm run build` komutunu local'de çalıştırıp hataları kontrol edin

### Database Bağlantı Hataları
- Supabase migration'larının çalıştığını kontrol edin
- Supabase project URL ve keys'lerin doğru olduğundan emin olun

### Authentication Sorunları
- Supabase Auth ayarlarını kontrol edin
- Redirect URL'lerin doğru ayarlandığından emin olun

## Lisans

MIT
