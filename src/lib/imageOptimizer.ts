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
