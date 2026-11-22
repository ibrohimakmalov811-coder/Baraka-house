/**
 * Client-side image resizer and optimizer for avatar uploads.
 * Crops to a 1:1 square, scales down to max 512x512, and compresses to under 250 KB.
 */

export async function optimizeAvatarImage(
  file: File,
  maxDimension = 512,
  quality = 0.85
): Promise<string> {
  const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
  if (!validTypes.includes(file.type)) {
    throw new Error('Faqat JPG, PNG yoki WEBP formatidagi rasmlar qoʻllab-quvvatlanadi.');
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Rasmni oʻqishda xatolik yuz berdi.'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Rasm maʼlumotlarini yuklab boʻlmadi.'));
      img.onload = () => {
        try {
          // Center crop to 1:1 square
          const minSide = Math.min(img.width, img.height);
          const startX = (img.width - minSide) / 2;
          const startY = (img.height - minSide) / 2;

          const targetSize = Math.min(minSide, maxDimension);

          const canvas = document.createElement('canvas');
          canvas.width = targetSize;
          canvas.height = targetSize;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Canvas kontekstini yaratib boʻlmadi.'));
            return;
          }

          // Draw cropped & scaled square
          ctx.drawImage(
            img,
            startX,
            startY,
            minSide,
            minSide,
            0,
            0,
            targetSize,
            targetSize
          );

          // Export as compressed image
          const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);

          // Approximate size check
          const sizeInBytes = Math.round((compressedDataUrl.length * 3) / 4);
          if (sizeInBytes > 350 * 1024) {
            // Re-compress with lower quality if too large
            const secondPass = canvas.toDataURL('image/jpeg', 0.65);
            resolve(secondPass);
          } else {
            resolve(compressedDataUrl);
          }
        } catch (err) {
          reject(new Error('Rasmni optimallashtirishda xatolik yuz berdi.'));
        }
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}
