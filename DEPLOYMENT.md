# Vercel Deployment Kılavuzu

Bu dokümanda EV-SLA projesini Vercel'e deploy etme adımları anlatılmaktadır.

## Ön Hazırlık

### 1. Supabase Projesi Oluşturma

1. [Supabase](https://supabase.com) hesabı oluşturun
2. Yeni proje oluşturun
3. Proje URL ve API keys'leri not edin:
   - Project URL: `https://xxxxx.supabase.co`
   - Anon/Public Key: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
   - Service Role Key: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (Dashboard > Settings > API)

### 2. Supabase Database Migration

1. Supabase Dashboard > SQL Editor'e gidin
2. `supabase/migrations/001_initial_schema.sql` dosyasının içeriğini kopyalayın
3. SQL Editor'de yapıştırıp çalıştırın
4. Tabloların oluşturulduğunu kontrol edin

## Vercel Deployment Adımları

### 1. GitHub Repository Hazırlığı

1. Projeyi GitHub'a push edin:
```bash
git add .
git commit -m "Initial commit"
git push origin main
```

### 2. Vercel Projesi Oluşturma

1. [Vercel Dashboard](https://vercel.com/dashboard) üzerinden giriş yapın
2. "Add New..." > "Project" seçin
3. GitHub repository'nizi seçin veya import edin
4. Proje adını girin: `ev-sla`

### 3. Build Ayarları

Vercel otomatik olarak Next.js projesini algılar. Ayarlar şu şekilde olmalı:

- **Framework Preset**: Next.js
- **Root Directory**: `./` (default)
- **Build Command**: `npm run build` (otomatik)
- **Output Directory**: `.next` (otomatik)
- **Install Command**: `npm install` (otomatik)

### 4. Environment Variables Ayarlama

Vercel Dashboard'da projenize gidin ve **Settings > Environment Variables** bölümüne şu değişkenleri ekleyin:

#### Production, Preview, Development için:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Önemli Notlar**:
- `NEXT_PUBLIC_` ile başlayan değişkenler browser'da kullanılabilir
- `SUPABASE_SERVICE_ROLE_KEY` sadece server-side kullanılır (güvenlik için kritik)
- Her değişkeni Production, Preview ve Development için ayrı ayrı ekleyin

### 5. Supabase Auth Redirect URLs

1. Supabase Dashboard > Authentication > URL Configuration
2. **Redirect URLs** bölümüne ekleyin:
   - `https://your-app.vercel.app/**` (production)
   - `https://your-app-git-main-username.vercel.app/**` (preview)
   - `http://localhost:3000/**` (local development)

### 6. Deploy

1. **Deploy** butonuna tıklayın
2. Vercel otomatik olarak build işlemini başlatır
3. Build log'larını takip edin
4. Başarılı deploy sonrası URL alırsınız

## Post-Deployment Ayarları

### 1. Custom Domain (Opsiyonel)

1. Vercel Dashboard > Settings > Domains
2. Custom domain ekleyin
3. DNS ayarlarını yapın (CNAME veya A record)

### 2. Webhook Yapılandırması

#### Slack Webhook
1. Slack App oluşturun
2. Event Subscriptions > Request URL:
   `https://your-app.vercel.app/api/webhooks/slack`

#### Teams Webhook
1. Teams App oluşturun
2. Webhook URL:
   `https://your-app.vercel.app/api/webhooks/teams`

#### WhatsApp Webhook
1. WhatsApp Business API kurulumu
2. Webhook URL:
   `https://your-app.vercel.app/api/webhooks/whatsapp`
3. Verify Token ayarlayın (environment variable olarak)

## Continuous Deployment

Vercel otomatik olarak:
- Her GitHub push'ta yeni deployment oluşturur
- Pull request'ler için preview deployment'lar oluşturur
- Production branch (genellikle `main`) için production deployment yapar

## Environment Variables Güncelleme

Environment variable güncellemek için:
1. Vercel Dashboard > Settings > Environment Variables
2. Değişkeni düzenleyin veya silin
3. **Save** butonuna tıklayın
4. Yeni deployment oluşturun (Redeploy)

## Troubleshooting

### Build Hataları

**Hata**: `Module not found` veya `Cannot find module`
- **Çözüm**: `package.json` dosyasında tüm bağımlılıkların doğru listelendiğinden emin olun

**Hata**: `Environment variable not found`
- **Çözüm**: Vercel Dashboard'da environment variables'ların doğru ayarlandığını kontrol edin

### Runtime Hataları

**Hata**: `Supabase connection failed`
- **Çözüm**: 
  - Supabase URL ve keys'lerin doğru olduğunu kontrol edin
  - Supabase project'inizin aktif olduğundan emin olun

**Hata**: `Authentication failed`
- **Çözüm**:
  - Supabase Auth redirect URLs'inin doğru ayarlandığını kontrol edin
  - Vercel deployment URL'inizi Supabase'e eklediğinizden emin olun

### Database Sorunları

**Hata**: `Table does not exist`
- **Çözüm**: Supabase migration'ınızın çalıştırıldığından emin olun

## Monitoring

Vercel Dashboard'da:
- **Deployments**: Tüm deployment geçmişi
- **Analytics**: Performance metrics
- **Logs**: Runtime log'ları

## İlk Kullanıcı Oluşturma

1. Vercel deployment URL'inize gidin
2. `/register` sayfasından kayıt olun
3. Supabase Dashboard > Authentication > Users bölümünden ilk kullanıcıyı bulun
4. SQL Editor'de şu komutu çalıştırarak admin rolü verin:

```sql
UPDATE user_profiles 
SET role = 'admin' 
WHERE user_id = 'kullanici-id-buraya';
```

Veya Supabase Dashboard'dan direkt olarak `user_profiles` tablosunu düzenleyebilirsiniz.

## Destek

Sorun yaşarsanız:
1. Vercel Logs'u kontrol edin
2. Browser Console'u kontrol edin
3. Supabase Logs'u kontrol edin
4. GitHub Issues'da sorun açın

