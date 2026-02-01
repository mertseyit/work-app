# Freelance İş Takip Uygulaması

Bu proje, freelance çalışanların iş süreçlerini takip etmelerini, müşteri yönetimini sağlamalarını ve finansal süreçlerini (gelir-gider) tek bir panelden yönetmelerini sağlayan bir web uygulamasıdır.

## Kurulum Rehberi

Projeyi yerel makinenizde çalıştırmak için aşağıdaki adımları takip edebilirsiniz.

### 1. Ön Hazırlıklar

Başlamadan önce bilgisayarınızda aşağıdakilerin kurulu olduğundan emin olun:

- Node.js (LTS sürümü önerilir)
- npm, yarn veya pnpm paket yöneticisi
- PostgreSQL veritabanı (Yerel kurulum veya bulut sunucusu)

### 2. Projeyi Klonlama

Terminali açın ve projeyi bilgisayarınıza indirin:

```bash
git clone [https://github.com/mertseyit/work-app.git](https://github.com/mertseyit/work-app.git)
cd work-app
```

### 3. Bağımlılıkların Yüklenmesi

Gerekli paketleri yüklemek için aşağıdaki komutu çalıştırın:

```bash
npm install
# veya
yarn install
```

### 4. Ortam Değişkenlerinin Tanımlanması (Environment Variables)

.env_exp dosyasını proje root kısmında .env olarak adlandırın ve içerisindeki verileri kendi bilgilerini ile dolduru.

NOT 1: Bu projede kullanıcı doğrulaması kısmında clerk kullanılmıştır. Bir clerk projesinin nasıl başlatılacağı hakkında bilgi almak için [resmi dökümana başvurabilirsiniz.](https://clerk.com/docs/nextjs/getting-started/quickstart)

NOT 2: Eğer locak PostgreSQL veri tabanı kullanmıyorsanız Supabase veri tabanı işinizi görecektir. Bir Supabase veri tabanının nasıl oluşturulacağını hakkında bilgi almak için [resmi dökümana başvurabilirsiniz.](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)

### Veri Tabanı şeması senkronize işlemi

Yukarıdaki tüm kurulumları tamamladıktan sonra veri tabanınızı prisma.schema üzerinden push etmeniz gerekmektedir. Aşağıdaki kodu termainalde çalıştırın:

```bash
npx prisma db push
```

### Projeyi çalıştırma

Sırasıyla aşağıdaki komutları çalıştırın

```bash

npm run build

npm start

```

### İletişim

Sorularınız, katkılarınız veya Docker yapılandırma talepleriniz için aşağıdaki kanallardan ulaşabilirsiniz:

[Linkedin](https://www.linkedin.com/in/mert-seyit/)
