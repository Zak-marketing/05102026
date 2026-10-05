/**
 * Ultra-fast client-side image compression utility
 * Resizes high-resolution device photos down to optimal dimensions (max 1000px)
 * and applies lightweight JPEG compression (0.75 quality).
 * Prevents memory crashes and localStorage QuotaExceededError.
 */
export async function compressImage(
  source: File | string,
  maxWidth = 1000,
  maxHeight = 1000,
  quality = 0.75
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();

    img.onload = () => {
      try {
        let width = img.naturalWidth || img.width;
        let height = img.naturalHeight || img.height;

        // Maintain aspect ratio
        if (width > maxWidth || height > maxHeight) {
          if (width / height > maxWidth / maxHeight) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = Math.max(width, 1);
        canvas.height = Math.max(height, 1);

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          // Fallback to original source if canvas not supported
          resolve(typeof source === 'string' ? source : '');
          return;
        }

        // Draw image resized
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedDataUrl);
      } catch (err) {
        console.error('Image compression error:', err);
        // Fallback to source
        if (typeof source === 'string') {
          resolve(source);
        } else {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = () => reject(err);
          reader.readAsDataURL(source);
        }
      }
    };

    img.onerror = (err) => {
      console.warn('Image load error during compression', err);
      if (typeof source === 'string') {
        resolve(source);
      } else {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = () => reject(err);
        reader.readAsDataURL(source);
      }
    };

    if (typeof source === 'string') {
      img.src = source;
    } else {
      const objectUrl = URL.createObjectURL(source);
      img.src = objectUrl;
    }
  });
}
