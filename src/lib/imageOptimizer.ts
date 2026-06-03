/**
 * Helper to dynamically optimize image loading and rendering parameters
 * for maximum performance, especially for low-end mobile devices under slow networks.
 */

interface OptimizeImageOptions {
  width?: number;
  quality?: number;
  format?: 'webp' | 'auto';
}

/**
 * Optimizes image URLs (like Unsplash) to download lightweight WebP formats
 * with tailored responsive width and optimized quality.
 */
export function optimizeImageUrl(url: string, options: OptimizeImageOptions = {}): string {
  if (!url) return "";

  // 1. Unsplash Optimization (extremely powerful as Unsplash holds high-resolution files by default)
  if (url.includes("images.unsplash.com")) {
    try {
      const urlObj = new URL(url);
      const width = options.width || 480;
      const quality = options.quality || 70;
      const format = options.format || 'webp';

      urlObj.searchParams.set("w", width.toString());
      urlObj.searchParams.set("q", quality.toString());
      urlObj.searchParams.set("fm", format);
      // Ensure fit is crop to maintain aspect ratios perfectly without rendering distortion
      if (!urlObj.searchParams.has("fit")) {
        urlObj.searchParams.set("fit", "crop");
      }
      return urlObj.toString();
    } catch (e) {
      return url;
    }
  }

  // Fallback to original URL for local files and base64 strings
  return url;
}

/**
 * Standard performance properties to assign to image elements.
 * - decoding: "async" (prevents main thread jank / scrolling stutter as CPU decodes off-thread)
 */
export const imagePerfProps = {
  decoding: "async" as const,
};

/**
 * Resizes an image file to a maximum dimension while maintaining aspect ratio,
 * converts it to WebP format, and applies custom image compression.
 * Done purely client-side using Canvas.
 */
export function compressAndResizeImage(
  file: File,
  maxDimension: number,
  quality: number = 0.8
): Promise<File> {
  return new Promise((resolve, reject) => {
    // If browser doesn't support FileReader or Canvas elements, fallback cleanly
    if (typeof window === "undefined" || !window.FileReader || !window.HTMLCanvasElement) {
      resolve(file);
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        // Calculate new dimensions keeping the aspect ratio
        let width = img.width;
        let height = img.height;

        if (width > maxDimension) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        }

        // Create canvas and draw scaled image
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(file); // Fallback to raw file if canvas context is unavailable
          return;
        }

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(img, 0, 0, width, height);

        // Convert canvas image to WebP blob
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              resolve(file); // Fallback to raw file if compression fails
              return;
            }

            // Create a webp file with a corresponding filename (switching extension to webp)
            const baseName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
            const newFileName = `${baseName}.webp`;
            const webpFile = new File([blob], newFileName, {
              type: "image/webp",
              lastModified: Date.now(),
            });

            resolve(webpFile);
          },
          "image/webp",
          quality
        );
      };
      img.onerror = (err) => {
        resolve(file); // Fallback is safe
      };
    };
    reader.onerror = (err) => {
      resolve(file); // Fallback is safe
    };
  });
}

