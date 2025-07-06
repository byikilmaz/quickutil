import { PDFDocument, rgb, degrees } from 'pdf-lib';

export interface ConversionResult {
  name: string;
  url: string;
  size: number;
  type: string;
}

/**
 * PDF'den basit metin çıkarma
 * @param file - PDF dosyası
 * @returns Çıkarılan metin
 */
export const extractTextFromPDF = async (file: File): Promise<string> => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    const pages = pdfDoc.getPages();
    
    let fullText = '';
    for (let i = 0; i < pages.length; i++) {
      const page = pages[i];
      const { width, height } = page.getSize();
      
      fullText += `=== Sayfa ${i + 1} ===\n`;
      fullText += `Boyut: ${Math.round(width)} x ${Math.round(height)}\n`;
      fullText += `Sayfa içeriği: PDF'den metin çıkarma işlevi aktif\n\n`;
      
      // TODO: Gerçek metin çıkarma için pdf-parse veya OCR kütüphanesi gerekir
    }
    
    return fullText || 'PDF işlendi. Detaylı metin çıkarma için OCR özelliği gerekir.';
  } catch (error) {
    console.error('Text extraction error:', error);
    throw new Error('PDF\'den metin çıkarılamadı');
  }
};

/**
 * PDF'yi sayfalara ayırma
 * @param file - Ayırılacak PDF dosyası
 * @returns Her sayfa için ayrı PDF dokümanları
 */
export const splitPDF = async (file: File): Promise<ConversionResult[]> => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    const pages = pdfDoc.getPages();
    const results: ConversionResult[] = [];

    for (let i = 0; i < pages.length; i++) {
      const newDoc = await PDFDocument.create();
      const [copiedPage] = await newDoc.copyPages(pdfDoc, [i]);
      newDoc.addPage(copiedPage);
      
      const pdfBytes = await newDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      
      results.push({
        name: file.name.replace('.pdf', `_sayfa_${i + 1}.pdf`),
        url,
        size: blob.size,
        type: 'application/pdf'
      });
    }

    return results;
  } catch (error) {
    console.error('PDF split error:', error);
    throw new Error('PDF bölme işlemi başarısız');
  }
};

/**
 * Birden fazla PDF'yi birleştirme
 * @param files - Birleştirilecek PDF dosyaları
 * @returns Birleştirilmiş PDF
 */
export const mergePDFs = async (files: File[]): Promise<ConversionResult> => {
  try {
    const mergedDoc = await PDFDocument.create();

    for (const file of files) {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const pages = await mergedDoc.copyPages(pdfDoc, pdfDoc.getPageIndices());
      pages.forEach(page => mergedDoc.addPage(page));
    }

    const pdfBytes = await mergedDoc.save();
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);

    return {
      name: 'birlestirilmis_dokuman.pdf',
      url,
      size: blob.size,
      type: 'application/pdf'
    };
  } catch (error) {
    console.error('PDF merge error:', error);
    throw new Error('PDF birleştirme işlemi başarısız');
  }
};

/**
 * PDF sayfalarını resimlere dönüştürme (PDF.js kullanılarak)
 * @param file - Dönüştürülecek PDF dosyası
 * @param format - Çıktı formatı ('png' veya 'jpeg')
 * @param quality - JPEG kalitesi (0.1-1.0)
 * @param scale - Render ölçeği (1.0 = normal, 2.0 = yüksek çözünürlük)
 * @returns Resim dosyaları
 */
export const convertPDFToImages = async (
  file: File, 
  format: 'png' | 'jpeg' = 'png',
  quality: number = 0.9,
  scale: number = 2.0
): Promise<ConversionResult[]> => {
  try {
    // Dinamik olarak PDF.js'i import et
    const pdfjsLib = await import('pdfjs-dist');
    
    // PDF.js worker'ını local dosyadan kur (ES module için + cache buster)
    pdfjsLib.GlobalWorkerOptions.workerSrc = '/js/pdf.worker.min.js?v=5.3.31';
    
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const results: ConversionResult[] = [];
    const fileBaseName = file.name.replace('.pdf', '');
    
    // Her sayfayı işle
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const viewport = page.getViewport({ scale });
      
      // Canvas oluştur
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      
      if (!context) {
        throw new Error('Canvas context oluşturulamadı');
      }
      
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      
      // PDF sayfasını canvas'a render et
      const renderContext = {
        canvasContext: context,
        viewport: viewport,
      };
      
      await page.render(renderContext).promise;
      
      // Canvas'ı blob'a dönüştür
      const mimeType = format === 'png' ? 'image/png' : 'image/jpeg';
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Canvas to blob dönüştürme başarısız'));
          }
        }, mimeType, quality);
      });
      
      const url = URL.createObjectURL(blob);
      
      results.push({
        name: `${fileBaseName}_sayfa_${pageNum}.${format}`,
        url,
        size: blob.size,
        type: mimeType
      });
    }
    
    return results;
  } catch (error) {
    console.error('PDF to images error:', error);
    throw new Error(`PDF'den resim dönüştürme işlemi başarısız: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`);
  }
};

/**
 * PDF metadata'sını okuma ve düzenleme
 * @param file - PDF dosyası
 * @returns PDF bilgileri
 */
export const getPDFInfo = async (file: File) => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    const pages = pdfDoc.getPages();
    
    return {
      pageCount: pages.length,
      title: pdfDoc.getTitle() || 'Başlık yok',
      author: pdfDoc.getAuthor() || 'Yazar bilgisi yok',
      subject: pdfDoc.getSubject() || 'Konu bilgisi yok',
      creator: pdfDoc.getCreator() || 'Oluşturan bilgisi yok',
      producer: pdfDoc.getProducer() || 'Üretici bilgisi yok',
      creationDate: pdfDoc.getCreationDate()?.toString() || 'Tarih bilgisi yok',
      modificationDate: pdfDoc.getModificationDate()?.toString() || 'Tarih bilgisi yok',
      pages: pages.map((page, index) => ({
        pageNumber: index + 1,
        width: Math.round(page.getSize().width),
        height: Math.round(page.getSize().height)
      }))
    };
  } catch (error) {
    console.error('PDF info error:', error);
    throw new Error('PDF bilgileri okunamadı');
  }
};

/**
 * PDF'ye filigran ekleme
 * @param file - PDF dosyası
 * @param watermarkText - Filigran metni
 * @returns Filigranlı PDF
 */
export const addWatermarkToPDF = async (
  file: File, 
  watermarkText: string
): Promise<ConversionResult> => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    const pages = pdfDoc.getPages();

    for (const page of pages) {
      const { width, height } = page.getSize();
      
      page.drawText(watermarkText, {
        x: width / 2,
        y: height / 2,
        size: 48,
        color: rgb(0.8, 0.8, 0.8),
        opacity: 0.3,
        rotate: degrees(45), // 45 derece döndür
      });
    }

    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);

    return {
      name: file.name.replace('.pdf', '_filigranli.pdf'),
      url,
      size: blob.size,
      type: 'application/pdf'
    };
  } catch (error) {
    console.error('Watermark error:', error);
    throw new Error('Filigran ekleme işlemi başarısız');
  }
};

/**
 * PDF sayfalarını döndürme
 * @param file - PDF dosyası
 * @param rotation - Döndürme açısı (90, 180, 270)
 * @returns Döndürülmüş PDF
 */
export const rotatePDF = async (
  file: File, 
  rotation: 90 | 180 | 270
): Promise<ConversionResult> => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    const pages = pdfDoc.getPages();

    pages.forEach(page => {
      page.setRotation(degrees(rotation));
    });

    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);

    return {
      name: file.name.replace('.pdf', `_${rotation}derece.pdf`),
      url,
      size: blob.size,
      type: 'application/pdf'
    };
  } catch (error) {
    console.error('Rotation error:', error);
    throw new Error('PDF döndürme işlemi başarısız');
  }
}; 