const functions = require('firebase-functions');
const admin = require('firebase-admin');
const serviceAccount = require('./quickutil-d2998-d24a37e3c545.json');
const Busboy = require('busboy');

// Firebase Admin SDK'yi initialize et
admin.initializeApp();

// Google APIs
const { google } = require('googleapis');

/**
 * 🚗 Google Drive Service Class
 */
class GoogleDriveService {
  static async getAuth() {
    return new google.auth.GoogleAuth({
      credentials: serviceAccount,
      scopes: ['https://www.googleapis.com/auth/drive.file']
    });
  }

  static async getDrive() {
    const auth = await this.getAuth();
    return google.drive({ version: 'v3', auth });
  }

  /**
   * QuickUtil klasörünü oluştur veya bul
   */
  static async getOrCreateQuickUtilFolder() {
    try {
      const drive = await this.getDrive();
      
      // Mevcut klasörü ara
      const searchResponse = await drive.files.list({
        q: "name='QuickUtil' and mimeType='application/vnd.google-apps.folder' and trashed=false",
        fields: 'files(id,name)'
      });

      if (searchResponse.data.files.length > 0) {
        return searchResponse.data.files[0].id;
      }

      // Klasör yoksa oluştur
      const createResponse = await drive.files.create({
        resource: {
          name: 'QuickUtil',
          mimeType: 'application/vnd.google-apps.folder'
        },
        fields: 'id'
      });

      console.log('QuickUtil folder created:', createResponse.data.id);
      return createResponse.data.id;

    } catch (error) {
      console.error('Error creating QuickUtil folder:', error);
      throw new Error('QuickUtil klasörü oluşturulamadı');
    }
  }

  /**
   * Dosyayı Google Drive'a yükle
   */
  static async uploadFile(fileBuffer, fileName, mimeType) {
    try {
      const drive = await this.getDrive();
      const folderId = await this.getOrCreateQuickUtilFolder();

      const response = await drive.files.create({
        resource: {
          name: fileName,
          parents: [folderId]
        },
        media: {
          mimeType: mimeType,
          body: fileBuffer
        },
        fields: 'id,name,size,createdTime,mimeType'
      });

      console.log('File uploaded successfully:', response.data);
      return response.data;

    } catch (error) {
      console.error('Error uploading file:', error);
      throw new Error('Dosya yükleme başarısız');
    }
  }

  /**
   * Dosyaları listele
   */
  static async listFiles() {
    try {
      const drive = await this.getDrive();
      const folderId = await this.getOrCreateQuickUtilFolder();

      const response = await drive.files.list({
        q: `'${folderId}' in parents and trashed=false`,
        orderBy: 'createdTime desc',
        fields: 'files(id,name,mimeType,size,createdTime,modifiedTime)'
      });

      return response.data.files;

    } catch (error) {
      console.error('Error listing files:', error);
      throw new Error('Dosya listesi alınamadı');
    }
  }

  /**
   * Dosyayı sil
   */
  static async deleteFile(fileId) {
    try {
      const drive = await this.getDrive();
      
      await drive.files.delete({
        fileId: fileId
      });

      console.log('File deleted successfully:', fileId);
      return true;

    } catch (error) {
      console.error('Error deleting file:', error);
      throw new Error('Dosya silinirken hata oluştu');
    }
  }

  /**
   * Dosyayı indir
   */
  static async downloadFile(fileId) {
    try {
      const drive = await this.getDrive();
      
      const response = await drive.files.get({
        fileId: fileId,
        alt: 'media'
      }, { responseType: 'stream' });

      return response.data;

    } catch (error) {
      console.error('Error downloading file:', error);
      throw new Error('Dosya indirilemedi');
    }
  }

  /**
   * Drive quota bilgisi
   */
  static async getQuotaInfo() {
    try {
      const drive = await this.getDrive();
      
      const response = await drive.about.get({
        fields: 'storageQuota'
      });

      return response.data.storageQuota;

    } catch (error) {
      console.error('Error getting quota info:', error);
      return { limit: 0, usage: 0 };
    }
  }
}

/**
 * 🧪 Test Function - Basit health check
 */
exports.healthCheck = functions.https.onRequest(async (req, res) => {
  try {
    console.log('HealthCheck function called');
    
    // CORS headers
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
      res.status(200).send('');
      return;
    }

    res.status(200).json({
      success: true,
      message: 'QuickUtil Google Drive Functions çalışıyor!',
      timestamp: new Date().toISOString(),
      environment: {
        hasServiceAccount: !!serviceAccount?.client_email,
        serviceAccountEmail: serviceAccount?.client_email || 'Not set',
        nodeVersion: process.version
      }
    });

  } catch (error) {
    console.error('HealthCheck error:', error);
    res.status(500).json({ 
      error: 'Health check başarısız',
      message: error.message 
    });
  }
});

/**
 * 📤 File Upload API
 */
exports.uploadFile = functions.https.onRequest(async (req, res) => {
  try {
    // CORS headers
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
      res.status(200).send('');
      return;
    }

    if (req.method !== 'POST') {
      res.status(405).json({ error: 'Method not allowed' });
      return;
    }

    // Firebase Auth token verification
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await admin.auth().verifyIdToken(token);
    const userId = decodedToken.uid;

    // Multipart form data parsing
    const busboy = Busboy({ headers: req.headers });
    let fileBuffer = null;
    let fileName = null;
    let mimeType = null;

    return new Promise((resolve, reject) => {
      busboy.on('file', (fieldname, file, info) => {
        const { filename, mimeType: fileMimeType } = info;
        fileName = filename;
        mimeType = fileMimeType;

        const chunks = [];
        file.on('data', (data) => chunks.push(data));
        file.on('end', () => {
          fileBuffer = Buffer.concat(chunks);
        });
      });

      busboy.on('finish', async () => {
        try {
          if (!fileBuffer || !fileName) {
            res.status(400).json({ error: 'Dosya bulunamadı' });
            resolve();
            return;
          }

          // Dosyayı Google Drive'a yükle
          const uploadedFile = await GoogleDriveService.uploadFile(
            fileBuffer,
            `${Date.now()}_${fileName}`,
            mimeType
          );

          // Firestore'da aktivite kaydet
          await admin.firestore().collection('userActivities').add({
            userId,
            type: 'file_upload',
            fileName,
            fileSize: fileBuffer.length,
            googleDriveFileId: uploadedFile.id,
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
            expiresAt: new Date(Date.now() + (30 * 24 * 60 * 60 * 1000)), // 30 gün
            status: 'success'
          });

          res.status(200).json({
            success: true,
            file: uploadedFile,
            message: 'Dosya başarıyla yüklendi'
          });
          resolve();

        } catch (error) {
          console.error('Upload error:', error);
          res.status(500).json({ error: 'Dosya yükleme başarısız' });
          resolve();
        }
      });

      busboy.on('error', (error) => {
        console.error('Busboy error:', error);
        res.status(500).json({ error: 'Dosya yükleme hatası' });
        resolve();
      });

      busboy.end(req.rawBody);
    });

  } catch (error) {
    console.error('Function error:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

/**
 * 📋 List Files API
 */
exports.listFiles = functions.https.onRequest(async (req, res) => {
  try {
    // CORS headers
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
      res.status(200).send('');
      return;
    }

    if (req.method !== 'GET') {
      res.status(405).json({ error: 'Method not allowed' });
      return;
    }

    // Firebase Auth token verification
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await admin.auth().verifyIdToken(token);
    const userId = decodedToken.uid;

    // Google Drive'dan dosyaları listele
    const files = await GoogleDriveService.listFiles();

    // Kullanıcının dosyalarını filtrele (Firestore'dan)
    const userActivities = await admin.firestore()
      .collection('userActivities')
      .where('userId', '==', userId)
      .where('googleDriveFileId', '!=', null)
      .get();

    const userFileIds = userActivities.docs.map(doc => doc.data().googleDriveFileId);
    const userFiles = files.filter(file => userFileIds.includes(file.id));

    res.status(200).json({
      success: true,
      files: userFiles
    });

  } catch (error) {
    console.error('List files error:', error);
    res.status(500).json({ error: 'Dosya listesi alınamadı' });
  }
});

/**
 * 🗑️ Delete File API
 */
exports.deleteFile = functions.https.onRequest(async (req, res) => {
  try {
    // CORS headers
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'DELETE, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
      res.status(200).send('');
      return;
    }

    if (req.method !== 'DELETE') {
      res.status(405).json({ error: 'Method not allowed' });
      return;
    }

    // Firebase Auth token verification
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await admin.auth().verifyIdToken(token);
    const userId = decodedToken.uid;

    const fileId = req.query.fileId;
    if (!fileId) {
      res.status(400).json({ error: 'File ID gerekli' });
      return;
    }

    // Dosyanın kullanıcıya ait olup olmadığını kontrol et
    const userActivity = await admin.firestore()
      .collection('userActivities')
      .where('userId', '==', userId)
      .where('googleDriveFileId', '==', fileId)
      .get();

    if (userActivity.empty) {
      res.status(403).json({ error: 'Bu dosyaya erişim izniniz yok' });
      return;
    }

    // Google Drive'dan dosyayı sil
    await GoogleDriveService.deleteFile(fileId);

    // Firestore'da aktiviteyi güncelle
    const activityDoc = userActivity.docs[0];
    await activityDoc.ref.update({
      status: 'deleted',
      deletedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    res.status(200).json({
      success: true,
      message: 'Dosya başarıyla silindi'
    });

  } catch (error) {
    console.error('Delete file error:', error);
    res.status(500).json({ error: 'Dosya silinirken hata oluştu' });
  }
});

/**
 * 📥 Download File API
 */
exports.downloadFile = functions.https.onRequest(async (req, res) => {
  try {
    // CORS headers
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
      res.status(200).send('');
      return;
    }

    if (req.method !== 'GET') {
      res.status(405).json({ error: 'Method not allowed' });
      return;
    }

    // Firebase Auth token verification
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await admin.auth().verifyIdToken(token);
    const userId = decodedToken.uid;

    const fileId = req.query.fileId;
    if (!fileId) {
      res.status(400).json({ error: 'File ID gerekli' });
      return;
    }

    // Dosyanın kullanıcıya ait olup olmadığını kontrol et
    const userActivity = await admin.firestore()
      .collection('userActivities')
      .where('userId', '==', userId)
      .where('googleDriveFileId', '==', fileId)
      .get();

    if (userActivity.empty) {
      res.status(403).json({ error: 'Bu dosyaya erişim izniniz yok' });
      return;
    }

    // Google Drive'dan dosyayı indir
    const fileStream = await GoogleDriveService.downloadFile(fileId);

    // Dosya bilgilerini al
    const activityData = userActivity.docs[0].data();
    
    res.set('Content-Disposition', `attachment; filename="${activityData.fileName}"`);
    res.set('Content-Type', 'application/octet-stream');
    
    fileStream.pipe(res);

  } catch (error) {
    console.error('Download file error:', error);
    res.status(500).json({ error: 'Dosya indirilemedi' });
  }
});

/**
 * 📊 Get Quota Info API
 */
exports.getQuotaInfo = functions.https.onRequest(async (req, res) => {
  try {
    // CORS headers
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
      res.status(200).send('');
      return;
    }

    if (req.method !== 'GET') {
      res.status(405).json({ error: 'Method not allowed' });
      return;
    }

    // Firebase Auth token verification
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const token = authHeader.split('Bearer ')[1];
    await admin.auth().verifyIdToken(token);

    // Quota bilgisini al
    const quotaInfo = await GoogleDriveService.getQuotaInfo();

    res.status(200).json({
      success: true,
      quota: quotaInfo
    });

  } catch (error) {
    console.error('Get quota error:', error);
    res.status(500).json({ error: 'Quota bilgisi alınamadı' });
  }
});

/**
 * 🗂️ Scheduled Task: 30 günlük dosya temizleme
 * Geçici olarak comment'lendi - Firebase v1 uyumluluk sorunu
 */
/*
exports.cleanupExpiredFiles = functions.pubsub
  .schedule('every 24 hours')
  .timeZone('Europe/Istanbul')
  .onRun(async (context) => {
    try {
      console.log('Starting cleanup of expired files...');

      // Süresi dolan aktiviteleri bul
      const expiredActivities = await admin.firestore()
        .collection('userActivities')
        .where('expiresAt', '<=', new Date())
        .where('status', '==', 'success')
        .where('googleDriveFileId', '!=', null)
        .get();

      console.log(`Found ${expiredActivities.docs.length} expired files`);

      // Her dosyayı sil
      const deletePromises = expiredActivities.docs.map(async (doc) => {
        const data = doc.data();
        const fileId = data.googleDriveFileId;

        try {
          // Google Drive'dan sil
          await GoogleDriveService.deleteFile(fileId);
          
          // Firestore'da status güncelle
          await doc.ref.update({
            status: 'expired',
            deletedAt: admin.firestore.FieldValue.serverTimestamp()
          });

          console.log(`Deleted expired file: ${fileId}`);

        } catch (error) {
          console.error(`Error deleting file ${fileId}:`, error);
        }
      });

      await Promise.all(deletePromises);

      console.log('Cleanup completed successfully');
      return null;

    } catch (error) {
      console.error('Cleanup function error:', error);
      return null;
    }
  });
*/ 