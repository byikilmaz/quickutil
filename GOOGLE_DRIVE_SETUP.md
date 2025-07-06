# 🚗 Google Drive Service Account Setup Rehberi

## 📋 Adım Adım Kurulum

### 1. Google Cloud Console'da Service Account Oluşturma

**🔗 URL:** https://console.cloud.google.com/iam-admin/serviceaccounts?project=quickutil-d2998

#### Service Account Detayları:
- **Service account name**: `quickutil-drive`
- **Service account ID**: `quickutil-drive` (otomatik: quickutil-drive@quickutil-d2998.iam.gserviceaccount.com)
- **Description**: `QuickUtil.app için merkezi Google Drive dosya yönetimi`

#### ⚠️ Dikkat Edilecek Hatalar:
- ❌ **ID çok uzun olmamalı** (max 30 karakter)
- ❌ **Büyük harf kullanmayın** (sadece küçük harf + tire)
- ❌ **@ işareti eklemeyin** (otomatik eklenir)

### 2. Google Drive API Etkinleştirme

**🔗 URL:** https://console.cloud.google.com/apis/library/drive.googleapis.com?project=quickutil-d2998

1. "ENABLE" butonuna tıklayın
2. API'nin aktif olduğunu doğrulayın

### 3. Service Account Key Dosyası İndirme

1. Service Account'u oluşturduktan sonra
2. **Keys** sekmesine gidin
3. **Add Key** → **Create new key** tıklayın
4. **JSON** formatını seçin
5. Key dosyasını indirin (`quickutil-d2998-xxxxx.json`)

### 4. Environment Variables Setup

#### Firebase Functions Environment Variables:

```bash
# Önce JSON key dosyasından bu değerleri kopyalayın:
firebase functions:config:set google.private_key_id="key_dosyasındaki_private_key_id"
firebase functions:config:set google.private_key="-----BEGIN PRIVATE KEY-----\nkey_dosyasındaki_private_key\n-----END PRIVATE KEY-----"
firebase functions:config:set google.client_email="quickutil-drive@quickutil-d2998.iam.gserviceaccount.com"
firebase functions:config:set google.client_id="key_dosyasındaki_client_id"
firebase functions:config:set google.client_cert_url="key_dosyasındaki_client_x509_cert_url"
```

#### JSON Key Dosyası Örneği:
```json
{
  "type": "service_account",
  "project_id": "quickutil-d2998",
  "private_key_id": "BURASI_PRIVATE_KEY_ID",
  "private_key": "-----BEGIN PRIVATE KEY-----\nBURASI_PRIVATE_KEY\n-----END PRIVATE KEY-----\n",
  "client_email": "quickutil-drive@quickutil-d2998.iam.gserviceaccount.com",
  "client_id": "BURASI_CLIENT_ID",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "BURASI_CERT_URL"
}
```

### 5. Google Drive Folder Permissions (Opsiyonel)

Eğer belirli bir klasöre erişim vermek istiyorsanız:

1. Google Drive'da "QuickUtil" klasörü oluşturun
2. Klasörü **quickutil-drive@quickutil-d2998.iam.gserviceaccount.com** ile paylaşın
3. **Editor** izni verin

### 6. Firebase Functions Deployment

```bash
# Functions klasörüne gidin
cd functions

# Dependencies'leri install edin
npm install

# Functions'ı deploy edin
npm run deploy
```

### 7. Test Etme

#### Local Test:
```bash
# Firebase emulator başlatın
firebase emulators:start --only functions

# Test API endpoint
curl -H "Authorization: Bearer YOUR_FIREBASE_AUTH_TOKEN" \
     http://localhost:5001/quickutil-d2998/us-central1/getQuotaInfo
```

#### Production Test:
```bash
curl -H "Authorization: Bearer YOUR_FIREBASE_AUTH_TOKEN" \
     https://us-central1-quickutil-d2998.cloudfunctions.net/getQuotaInfo
```

## 🔧 Troubleshooting

### Yaygın Hatalar:

#### 1. "Service account does not exist"
- Service Account'un doğru oluşturulduğunu kontrol edin
- Project ID'nin doğru olduğunu kontrol edin

#### 2. "Insufficient permissions"
- Service Account'a Google Drive API izni verilmiş mi?
- Service Account key dosyası doğru mu?

#### 3. "Invalid private key"
- Private key'deki \n karakterlerinin doğru escape edildiğini kontrol edin
- JSON formatının bozuk olmadığını kontrol edin

#### 4. Firebase Functions deployment hatası
```bash
# Firebase CLI'yi güncelleyin
npm install -g firebase-tools

# Yeniden deploy edin
firebase deploy --only functions --force
```

### Log Kontrolü:
```bash
# Firebase Functions logs
firebase functions:log

# Specific function logs
firebase functions:log --only uploadFile
```

## ✅ Başarılı Setup Kontrol Listesi

- [ ] Service Account oluşturuldu (`quickutil-drive`)
- [ ] Google Drive API etkinleştirildi
- [ ] JSON key dosyası indirildi
- [ ] Environment variables set edildi
- [ ] Firebase Functions deploy edildi
- [ ] API endpoints test edildi
- [ ] Google Drive'da QuickUtil klasörü oluşturuldu

## 🎯 Final Test

Başarılı setup'tan sonra:

1. QuickUtil.app'e giriş yapın
2. Bir PDF dosyası sıkıştırın
3. Profil sayfasında "Merkezi Bulut Depolama" bölümünü kontrol edin
4. Dosyaların listelendiğini doğrulayın
5. Google Drive'ınızda QuickUtil klasörünü kontrol edin

---

💡 **Not:** Bu setup tamamlandığında kullanıcılar kendi Google Drive hesaplarına giriş yapmadan dosyalarını merkezi sistemde saklayabilecekler. 