import { PDFDocument, rgb, degrees } from 'pdf-lib';

export interface ConversionResult {
  name: string;
  url: string;
  size: number;
  type: string;
}

/**
 * PDF'den gerçek metin çıkarma (PDF.js kullanarak)
 * @param file - PDF dosyası
 * @returns Çıkarılan metin
 */
export const extractTextFromPDF = async (file: File): Promise<string> => {
  try {
    // PDF dosyası boyut kontrolü
    if (file.size > 50 * 1024 * 1024) { // 50MB limit
      throw new Error('PDF dosyası çok büyük (maksimum 50MB)');
    }

    // Dinamik olarak PDF.js'i import et
    const pdfjsLib = await import('pdfjs-dist');
    
    // PDF.js worker'ını güncel version ile kur (cache buster)
    const timestamp = Date.now();
    pdfjsLib.GlobalWorkerOptions.workerSrc = `/js/pdf.worker.min.js?v=5.3.93&t=${timestamp}`;
    
    console.log('PDF.js Worker configured for text extraction:', pdfjsLib.GlobalWorkerOptions.workerSrc);
    
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ 
      data: arrayBuffer,
      verbosity: 0, // Sessiz mod
      isEvalSupported: false,
      cMapPacked: true
    });
    
    const pdf = await loadingTask.promise;
    let fullText = '';
    
    console.log(`PDF yüklendi: ${pdf.numPages} sayfa - Text extraction başlıyor...`);
    
    // Her sayfa için text content çıkar
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      try {
        console.log(`Sayfa ${pageNum} text extraction işleniyor...`);
        
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        
        // Text items'ları birleştir
        const pageText = textContent.items
          .map(item => {
            // TextItem tipinde 'str' property'si var
            return ('str' in item) ? item.str : '';
          })
          .filter(text => text.trim().length > 0) // Boş metinleri filtrele
          .join(' ');
        
        // Sayfa başlığı ve metin ekle
        fullText += `=== Sayfa ${pageNum} ===\n`;
        
        if (pageText.trim().length > 0) {
          // Metni paragraflar halinde düzenle
          const paragraphs = pageText
            .split(/\s{3,}|\n{2,}/) // 3+ boşluk veya 2+ newline ile böl
            .map(p => p.trim())
            .filter(p => p.length > 0);
          
          if (paragraphs.length > 0) {
            fullText += paragraphs.join('\n\n') + '\n\n';
          } else {
            fullText += pageText + '\n\n';
          }
        } else {
          fullText += '[Bu sayfada metin bulunamadı - görsel içerik olabilir]\n\n';
        }
        
        console.log(`Sayfa ${pageNum} text extraction tamamlandı (${pageText.length} karakter)`);
        
        // Memory cleanup
        page.cleanup();
        
      } catch (pageError) {
        console.error(`Sayfa ${pageNum} text extraction error:`, pageError);
        fullText += `[Sayfa ${pageNum}: Metin çıkarılamadı - ${pageError instanceof Error ? pageError.message : 'Bilinmeyen hata'}]\n\n`;
      }
    }
    
    console.log(`PDF text extraction tamamlandı: ${fullText.length} karakter`);
    
    if (fullText.trim().length === 0 || fullText.includes('[Bu sayfada metin bulunamadı')) {
      return 'Bu PDF dosyasından metin çıkarılamadı.\n\nMuhtemel sebepler:\n• PDF görsel/resim içeriyor (OCR gerekir)\n• Şifrelenmiş veya korumalı PDF\n• PDF formatı desteklenmiyor\n\nLütfen farklı bir PDF dosyası deneyin.';
    }
    
    return fullText;
    
  } catch (error) {
    console.error('PDF text extraction failed:', error);
    
    // Detaylı error mesajları
    if (error instanceof Error) {
      if (error.message.includes('Invalid PDF')) {
        throw new Error('Geçersiz PDF dosyası. Lütfen başka bir PDF deneyin.');
      } else if (error.message.includes('Worker')) {
        throw new Error('PDF işleme motoru yüklenemedi. Lütfen sayfayı yenileyin.');
      } else if (error.message.includes('network')) {
        throw new Error('Ağ bağlantısı sorunu. Lütfen internet bağlantınızı kontrol edin.');
      } else if (error.message.includes('çok büyük')) {
        throw new Error(error.message);
      } else {
        throw new Error(`PDF metin çıkarma hatası: ${error.message}`);
      }
    } else {
      throw new Error('PDF metin çıkarma işlemi beklenmedik bir şekilde başarısız oldu.');
    }
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
    // PDF dosyası boyut kontrolü
    if (file.size > 50 * 1024 * 1024) { // 50MB limit
      throw new Error('PDF dosyası çok büyük (maksimum 50MB)');
    }

    // Dinamik olarak PDF.js'i import et
    const pdfjsLib = await import('pdfjs-dist');
    
    // PDF.js worker'ını güncel version ile kur (cache buster)
    const timestamp = Date.now();
    pdfjsLib.GlobalWorkerOptions.workerSrc = `/js/pdf.worker.min.js?v=5.3.93&t=${timestamp}`;
    
    console.log('PDF.js Worker configured:', pdfjsLib.GlobalWorkerOptions.workerSrc);
    
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ 
      data: arrayBuffer,
      verbosity: 0, // Sessiz mod
      isEvalSupported: false,
      cMapPacked: true
    });
    
    const pdf = await loadingTask.promise;
    const results: ConversionResult[] = [];
    const fileBaseName = file.name.replace('.pdf', '');
    
    console.log(`PDF yüklendi: ${pdf.numPages} sayfa`);
    
    // Her sayfayı işle
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      try {
        console.log(`Sayfa ${pageNum} işleniyor...`);
        
        const page = await pdf.getPage(pageNum);
        const viewport = page.getViewport({ scale });
        
        // Canvas oluştur
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        
        if (!context) {
          throw new Error(`Sayfa ${pageNum}: Canvas context oluşturulamadı`);
        }
        
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        
        // PDF sayfasını canvas'a render et
        const renderContext = {
          canvasContext: context,
          viewport: viewport,
          intent: 'display'
        };
        
        await page.render(renderContext).promise;
        
        // Canvas'ı blob'a dönüştür
        const mimeType = format === 'png' ? 'image/png' : 'image/jpeg';
        const blob = await new Promise<Blob>((resolve, reject) => {
          canvas.toBlob((blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error(`Sayfa ${pageNum}: Canvas to blob dönüştürme başarısız`));
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
        
        console.log(`Sayfa ${pageNum} başarıyla dönüştürüldü (${Math.round(blob.size / 1024)}KB)`);
        
        // Memory cleanup
        page.cleanup();
        
      } catch (pageError) {
        console.error(`Sayfa ${pageNum} error:`, pageError);
        throw new Error(`Sayfa ${pageNum} işlenirken hata: ${pageError instanceof Error ? pageError.message : 'Bilinmeyen hata'}`);
      }
    }
    
    console.log(`PDF to Images tamamlandı: ${results.length} sayfa`);
    return results;
    
  } catch (error) {
    console.error('PDF to images conversion failed:', error);
    
    // Detaylı error mesajları
    if (error instanceof Error) {
      if (error.message.includes('Invalid PDF')) {
        throw new Error('Geçersiz PDF dosyası. Lütfen başka bir PDF deneyin.');
      } else if (error.message.includes('Worker')) {
        throw new Error('PDF işleme motoru yüklenemedi. Lütfen sayfayı yenileyin.');
      } else if (error.message.includes('network')) {
        throw new Error('Ağ bağlantısı sorunu. Lütfen internet bağlantınızı kontrol edin.');
      } else {
        throw new Error(`PDF dönüştürme hatası: ${error.message}`);
      }
    } else {
      throw new Error('PDF dönüştürme işlemi beklenmedik bir şekilde başarısız oldu.');
    }
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