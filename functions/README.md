# QuickUtil.app Firebase Functions

Server-side Google Drive entegrasyonu için Firebase Functions implementasyonu.

## 🚀 Setup Adımları

### 1. Google Service Account Oluşturma

1. [Google Cloud Console](https://console.cloud.google.com/iam-admin/serviceaccounts) giden
2. Yeni Service Account oluşturun:
   - Name: `quickutil-drive-service`
   - Email: `quickutil-drive-service@quickutil-d2998.iam.gserviceaccount.com`

3. Key dosyasını indirin (JSON format)

4. Gerekli API'leri etkinleştirin:
   - Google Drive API
   - Google Sheets API (opsiyonel)

### 2. Environment Variables

Firebase Functions'ta şu environment variables'ları ayarlayın:

```bash
# Firebase CLI ile environment variables set etme
firebase functions:config:set google.private_key_id="your_private_key_id"
firebase functions:config:set google.private_key="your_private_key_here"
firebase functions:config:set google.client_email="quickutil-drive-service@quickutil-d2998.iam.gserviceaccount.com"
firebase functions:config:set google.client_id="your_client_id"
firebase functions:config:set google.client_cert_url="https://www.googleapis.com/robot/v1/metadata/x509/quickutil-drive-service%40quickutil-d2998.iam.gserviceaccount.com"
```

### 3. Local Development

```bash
# Dependencies install
npm install

# Firebase Functions emulator
firebase emulators:start --only functions

# Test API endpoints
curl -X POST http://localhost:5001/quickutil-d2998/us-central1/uploadFile
```

### 4. Production Deployment

```bash
# Deploy functions
npm run deploy

# Check logs
npm run logs
```

## 📡 API Endpoints

### Authentication
Tüm endpoint'ler Firebase Auth token gerektirir:
```
Authorization: Bearer YOUR_FIREBASE_AUTH_TOKEN
```

### Endpoints

#### POST `/uploadFile`
Dosya yükleme
- **Method**: POST
- **Content-Type**: multipart/form-data
- **Body**: File binary data

#### GET `/listFiles`
Kullanıcının dosyalarını listeleme
- **Method**: GET

#### DELETE `/deleteFile?fileId=FILE_ID`
Dosya silme
- **Method**: DELETE
- **Params**: fileId

#### GET `/downloadFile?fileId=FILE_ID`
Dosya indirme
- **Method**: GET
- **Params**: fileId

#### GET `/getQuotaInfo`
Google Drive quota bilgisi
- **Method**: GET

## 🗂️ Scheduled Tasks

### `cleanupExpiredFiles`
- **Schedule**: Her 24 saatte bir
- **Function**: 30 günü aşan dosyaları otomatik siler
- **Timezone**: Europe/Istanbul

## 🔒 Security

- Firebase Auth token doğrulaması
- Kullanıcı bazında dosya erişim kontrolü
- Google Service Account ile izole edilmiş erişim
- CORS yapılandırması

## 📊 Monitoring

```bash
# Function logs
firebase functions:log

# Specific function logs
firebase functions:log --only uploadFile
```

## 🛠️ Development Commands

```bash
# Install dependencies
npm install

# Lint check
npm run lint

# Local emulator
npm run serve

# Deploy to production
npm run deploy

# View logs
npm run logs
```

## 🔧 Configuration

### firebase.json
```json
{
  "functions": {
    "source": "functions",
    "codebase": "default",
    "runtime": "nodejs18"
  }
}
```

### Environment Variables Required
- `GOOGLE_PRIVATE_KEY_ID`
- `GOOGLE_PRIVATE_KEY`
- `GOOGLE_CLIENT_EMAIL`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_CERT_URL`

## 📚 Dependencies

- `firebase-functions`: Firebase Functions SDK
- `firebase-admin`: Firebase Admin SDK
- `googleapis`: Google APIs client
- `busboy`: Multipart form data parser

## 🎯 Next Steps

1. Google Service Account key dosyasını güvenli bir şekilde environment'a ekleyin
2. Firebase Functions'ı deploy edin
3. Client-side kodları yeni API'leri kullanacak şekilde güncelleyin
4. Test edin ve production'a deploy edin 